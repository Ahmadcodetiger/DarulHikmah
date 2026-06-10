import { Request, Response } from 'express';
import { prisma } from '../server';
import { Section } from '@prisma/client';

// =======================
// Academic Session & Term
// =======================

export const getAcademicSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await prisma.academicSession.findMany({ include: { terms: true } });
    res.json({ data: sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

export const createAcademicSession = async (req: Request, res: Response) => {
  try {
    const { name, isActive } = req.body;
    
    // If setting active, deactivate others
    if (isActive) {
      await prisma.academicSession.updateMany({ data: { isActive: false } });
    }

    const session = await prisma.academicSession.create({ data: { name, isActive } });
    res.status(201).json({ message: 'Session created', data: session });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
};

export const createTerm = async (req: Request, res: Response) => {
  try {
    const { sessionId, name, isActive } = req.body;

    if (isActive) {
      await prisma.term.updateMany({ data: { isActive: false } });
    }

    const term = await prisma.term.create({ data: { sessionId, name, isActive } });
    res.status(201).json({ message: 'Term created', data: term });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create term' });
  }
};

// =======================
// Classes & Subjects
// =======================

export const getClasses = async (req: Request, res: Response) => {
  try {
    const { teacherId, section } = req.query;
    const sectionFilter = section ? String(section).toUpperCase() as Section : undefined;

    const classes = await prisma.class.findMany({
      where: {
        ...(teacherId ? { teacherId: String(teacherId) } : {}),
        ...(sectionFilter ? { section: sectionFilter } : {}),
      },
      include: {
        teacher: true,
        subjects: true,
        _count: { select: { enrollments: true } }
      }
    });
    res.json({ data: classes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};

export const createClass = async (req: Request, res: Response) => {
  try {
    const { name, section, teacherId } = req.body;
    const newClass = await prisma.class.create({
      data: { name, section, teacherId },
      include: {
        teacher: true,
        subjects: true,
        _count: { select: { enrollments: true } }
      }
    });
    res.status(201).json({ message: 'Class created', data: newClass });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create class' });
  }
};

export const updateClass = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { teacherId, name, section } = req.body;
    const data: any = {};

    if (teacherId !== undefined) {
      data.teacherId = teacherId || null;
    }
    if (name !== undefined) {
      data.name = name;
    }
    if (section !== undefined) {
      data.section = section;
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data,
      include: {
        teacher: true,
        subjects: true,
        _count: { select: { enrollments: true } }
      }
    });

    res.json({ message: 'Class updated', data: updatedClass });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update class' });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, classId } = req.body;
    const subject = await prisma.subject.create({ data: { name, classId } });
    res.status(201).json({ message: 'Subject created', data: subject });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
};

export const getClassById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const cls = await prisma.class.findUnique({
      where: { id },
      include: {
        teacher: true,
        subjects: true,
        _count: { select: { enrollments: true } }
      }
    });

    if (!cls) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({ data: cls });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch class' });
  }
};

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const classId = req.query.classId as string;
    if (!classId) {
      return res.status(400).json({ error: 'classId query parameter is required' });
    }

    const subjects = await prisma.subject.findMany({
      where: { classId }
    });

    res.json({ data: subjects });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

export const getTerms = async (req: Request, res: Response) => {
  try {
    const terms = await prisma.term.findMany();
    res.json({ data: terms });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch terms' });
  }
};

export const getActiveTerm = async (req: Request, res: Response) => {
  try {
    const term = await prisma.term.findFirst({ where: { isActive: true } });
    res.json({ data: term });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active term' });
  }
};
