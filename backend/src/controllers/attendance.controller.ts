import { Request, Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middlewares/auth';

// Record Batch Attendance
export const recordBatchAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { date, records } = req.body; 
    // records: Array<{ studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' }>
    
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const attendanceDate = new Date(date);

    // Filter out duplicates if already taken for the same date?
    // In a real app, you might do upserts. Here we just create many.
    const attendanceData = records.map((record: any) => ({
      date: attendanceDate,
      status: record.status,
      studentId: record.studentId,
      recordedBy: req.user!.id,
    }));

    const result = await prisma.attendance.createMany({
      data: attendanceData,
    });

    res.status(201).json({ message: 'Attendance recorded successfully', count: result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
};

// Get Attendance by Class and Date Range
export const getAttendance = async (req: Request, res: Response) => {
  try {
    const { classId, startDate, endDate } = req.query;

    if (!classId) return res.status(400).json({ error: 'classId is required' });

    const filter: any = {
      student: {
        enrollments: {
          some: { classId: classId as string }
        }
      }
    };

    if (startDate && endDate) {
      filter.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const attendance = await prisma.attendance.findMany({
      where: filter,
      include: {
        student: { select: { firstName: true, lastName: true, admissionNo: true } }
      },
      orderBy: { date: 'desc' }
    });

    res.json({ data: attendance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};
