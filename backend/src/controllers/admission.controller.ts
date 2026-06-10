import { Request, Response } from 'express';
import { prisma } from '../server';

// Apply for Admission (Public Route or Parent Route)
export const applyForAdmission = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, state, lga, address, medicalInfo, parentId } = req.body;
    
    // Generate a temporary admission number
    const admissionNo = `APP-${Date.now().toString().slice(-6)}`;

    const newStudent = await prisma.student.create({
      data: {
        admissionNo,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        state,
        lga,
        address,
        medicalInfo,
        parentId, // optional at application stage
        admissionStatus: 'PENDING',
      },
    });

    res.status(201).json({ message: 'Application submitted successfully', data: newStudent });
  } catch (error) {
    console.error('Admission application error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

// Get All Admissions (Admin only)
export const getAdmissions = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const filter = status ? { admissionStatus: status as any } : {};

    const admissions = await prisma.student.findMany({
      where: filter,
      include: { parent: true },
      orderBy: { admissionNo: 'desc' }
    });

    res.json({ data: admissions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admissions' });
  }
};

// Update Admission Status (Admin only)
export const updateAdmissionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING, UNDER_REVIEW, APPROVED, REJECTED

    if (!['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedStudent = await prisma.student.update({
      where: { id: id as string },
      data: { admissionStatus: status },
    });

    // If approved, you might generate a final admission number and create user account here
    // For MVP, we'll just update status.
    
    res.json({ message: `Admission status updated to ${status}`, data: updatedStudent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update admission status' });
  }
};
