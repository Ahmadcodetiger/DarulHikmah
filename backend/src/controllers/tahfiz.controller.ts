import { Request, Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middlewares/auth';

// Record daily/weekly Hifz recitation progress
export const recordTahfizProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      studentId, 
      date, 
      sabak, 
      sabaqi, 
      manzil, 
      juzCompleted, 
      surahCompleted, 
      fluencyRating, 
      accuracyRating 
    } = req.body;

    if (!studentId || !date) {
      return res.status(400).json({ error: 'studentId and date are required' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const newRecord = await prisma.tahfizRecord.create({
      data: {
        studentId,
        date: new Date(date),
        sabak,
        sabaqi,
        manzil,
        juzCompleted: juzCompleted ? parseInt(juzCompleted) : null,
        surahCompleted,
        fluencyRating: fluencyRating ? parseInt(fluencyRating) : null,
        accuracyRating: accuracyRating ? parseInt(accuracyRating) : null,
        teacherId: req.user.id,
      },
    });

    res.status(201).json({ message: 'Tahfiz progress logged successfully', data: newRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record Tahfiz progress' });
  }
};

// Get Tahfiz progress history for a student
export const getStudentTahfizHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const records = await prisma.tahfizRecord.findMany({
      where: { studentId: id as string },
      orderBy: { date: 'desc' },
    });

    res.status(200).json({ data: records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Tahfiz progress history' });
  }
};
