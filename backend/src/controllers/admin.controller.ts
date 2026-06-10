import { Request, Response } from 'express';
import { prisma } from '../server';

// =============================================
// Result Approval
// =============================================

// List all result approvals
export const listResultApprovals = async (req: Request, res: Response) => {
  try {
    const { termId } = req.query;

    const approvals = await prisma.resultApproval.findMany({
      where: termId ? { termId: termId as string } : undefined,
    });

    // Also fetch all classes so we can augment data
    const classes = await prisma.class.findMany({ select: { id: true, name: true, section: true } });
    const terms = await prisma.term.findMany({
      include: { session: { select: { name: true } } },
    });

    const enriched = classes.map((cls) => {
      const approval = approvals.find((a) => a.classId === cls.id && (!termId || a.termId === termId));
      return {
        classId: cls.id,
        className: cls.name,
        section: cls.section,
        approved: approval?.approved ?? false,
        approvalId: approval?.id ?? null,
      };
    });

    res.json({ data: enriched, terms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch result approvals' });
  }
};

// Toggle approval status for a class+term
export const toggleResultApproval = async (req: Request, res: Response) => {
  try {
    const { classId, termId, approved } = req.body;

    if (!classId || !termId || approved === undefined) {
      return res.status(400).json({ error: 'classId, termId and approved are required' });
    }

    const result = await prisma.resultApproval.upsert({
      where: { classId_termId: { classId, termId } },
      update: { approved },
      create: { classId, termId, approved },
    });

    res.json({
      message: `Results ${approved ? 'approved' : 'unapproved'} successfully`,
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle approval' });
  }
};

// Check if results are approved for a student (for parent access)
export const checkResultApproval = async (req: Request, res: Response) => {
  try {
    const { classId, termId } = req.query;

    if (!classId || !termId) {
      return res.status(400).json({ error: 'classId and termId required' });
    }

    const approval = await prisma.resultApproval.findUnique({
      where: { classId_termId: { classId: classId as string, termId: termId as string } },
    });

    res.json({ approved: approval?.approved ?? false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to check approval' });
  }
};

// =============================================
// School Settings
// =============================================

// Get school settings (always return first/only row)
export const getSchoolSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.schoolSetting.findFirst();
    if (!settings) {
      settings = await prisma.schoolSetting.create({
        data: {
          name: 'Darul Hikmah Science & Tech Academy',
          shortName: 'Darul Hikmah',
          logoText: 'DH',
          address: 'Sokoto Road, Sokoto State, Nigeria',
          phone: '+234 803 123 4567',
          email: 'info@darulhikmah.edu.ng',
          session: '2025/2026',
        },
      });
    }
    res.json({ data: settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch school settings' });
  }
};

// Update school settings
export const updateSchoolSettings = async (req: Request, res: Response) => {
  try {
    const { name, shortName, logoText, address, phone, email, session } = req.body;

    let settings = await prisma.schoolSetting.findFirst();

    if (!settings) {
      settings = await prisma.schoolSetting.create({
        data: { name, shortName, logoText, address, phone, email, session },
      });
    } else {
      settings = await prisma.schoolSetting.update({
        where: { id: settings.id },
        data: {
          name: name || settings.name,
          shortName: shortName || settings.shortName,
          logoText: logoText || settings.logoText,
          address: address || settings.address,
          phone: phone || settings.phone,
          email: email || settings.email,
          session: session || settings.session,
        },
      });
    }

    res.json({ message: 'School settings updated successfully', data: settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update school settings' });
  }
};
