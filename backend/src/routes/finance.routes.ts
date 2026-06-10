import { Router } from 'express';
import { createInvoice, getInvoices, logOfflinePayment, initializePayment, paystackWebhook } from '../controllers/finance.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Paystack webhook endpoint MUST be public and not require authenticate middleware
router.post('/webhook', paystackWebhook);

// Secure remaining endpoints
router.use(authenticate);
router.post('/invoices', authorize(['SUPER_ADMIN', 'ACCOUNTANT']), createInvoice);
router.get('/invoices', authorize(['SUPER_ADMIN', 'ACCOUNTANT', 'PRINCIPAL', 'PARENT', 'STUDENT']), getInvoices);
router.post('/invoices/:id/payments', authorize(['SUPER_ADMIN', 'ACCOUNTANT']), logOfflinePayment);
router.post('/payments/initialize', authorize(['SUPER_ADMIN', 'ACCOUNTANT', 'PARENT']), initializePayment);

export default router;

