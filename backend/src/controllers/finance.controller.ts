import { Request, Response } from 'express';
import { prisma } from '../server';
import crypto from 'crypto';

// Create a fee invoice
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { studentId, category, amount, dueDate } = req.body;

    if (!studentId || !category || !amount || !dueDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const invoice = await prisma.invoice.create({
      data: {
        studentId,
        category,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        status: 'UNPAID',
      },
      include: {
        student: { select: { firstName: true, lastName: true, admissionNo: true } },
      },
    });

    res.status(201).json({ message: 'Invoice created successfully', data: invoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

// List invoices
export const getInvoices = async (req: Request, res: Response) => {
  try {
    const { studentId, status } = req.query;
    const filter: any = {};

    if (studentId) filter.studentId = studentId as string;
    if (status) filter.status = status as string;

    const invoices = await prisma.invoice.findMany({
      where: filter,
      include: {
        student: { select: { firstName: true, lastName: true, admissionNo: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ data: invoices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// Log an offline payment (cash / bank transfer)
export const logOfflinePayment = async (req: Request, res: Response) => {
  try {
    const invoiceId = req.params.id ? String(req.params.id) : undefined;
    const { amount, method, reference, paymentDate } = req.body;
    const recordedBy = (req as any).user?.id || 'system';

    if (!invoiceId) {
      return res.status(400).json({ error: 'Invoice ID is required' });
    }
    if (!amount || !method) {
      return res.status(400).json({ error: 'amount and method are required' });
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const paidAmount = parseFloat(amount);
    const totalPaid = invoice.amountPaid + paidAmount;
    const newStatus = totalPaid >= invoice.amount ? 'PAID' : totalPaid > 0 ? 'PARTIAL' : 'UNPAID';

    await prisma.$transaction([
      prisma.invoice.update({
        where: { id: invoiceId },
        data: { amountPaid: totalPaid, status: newStatus },
      }),
      prisma.payment.create({
        data: {
          invoiceId,
          amount: paidAmount,
          reference: reference || `OFFLINE-${Date.now()}`,
          method: method || 'CASH',
          recordedBy,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        },
      }),
    ]);

    res.status(201).json({ message: 'Payment recorded successfully', status: newStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to log payment' });
  }
};

// Initialize Paystack payment transaction
export const initializePayment = async (req: Request, res: Response) => {
  try {
    const { invoiceId, email } = req.body;

    if (!invoiceId || !email) {
      return res.status(400).json({ error: 'invoiceId and email are required' });
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const remainingAmount = invoice.amount - invoice.amountPaid;
    if (remainingAmount <= 0) {
      return res.status(400).json({ error: 'Invoice is already fully paid' });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const reference = `DH-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    if (!paystackSecret) {
      console.log('PAYSTACK_SECRET_KEY not set. Using local mock transaction.');
      return res.status(200).json({
        data: {
          authorization_url: `http://localhost:5173/dashboard?mock_payment=success&ref=${reference}&invoiceId=${invoiceId}`,
          reference,
          mock: true,
        },
      });
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(remainingAmount * 100),
        reference,
        callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
        metadata: { invoiceId },
      }),
    });

    const responseData = await response.json();
    res.status(response.status).json(responseData);
  } catch (error: any) {
    console.error('Paystack initialization error:', error.message);
    res.status(500).json({ error: 'Failed to initialize payment gateway' });
  }
};

// Paystack server-to-server webhook
export const paystackWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY || 'fallback_secret';

    const hash = crypto
      .createHmac('sha512', paystackSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature && process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'Unauthorized signature' });
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const data = event.data;
      const invoiceId = data.metadata?.invoiceId;
      const reference = data.reference;
      const amountPaid = data.amount / 100;

      if (invoiceId) {
        const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });

        if (invoice) {
          const totalPaid = invoice.amountPaid + amountPaid;
          const status = totalPaid >= invoice.amount ? 'PAID' : 'PARTIAL';

          await prisma.$transaction([
            prisma.invoice.update({
              where: { id: invoiceId },
              data: { amountPaid: totalPaid, status },
            }),
            prisma.payment.create({
              data: {
                invoiceId,
                amount: amountPaid,
                reference,
                method: 'ONLINE',
              },
            }),
          ]);
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
