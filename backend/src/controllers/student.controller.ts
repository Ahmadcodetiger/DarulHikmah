import { Request, Response } from 'express';
import { prisma } from '../server';
import bcrypt from 'bcryptjs';

// List all students (optionally filter by classId)
export const getStudents = async (req: Request, res: Response) => {
  try {
    const { classId, termId } = req.query;

    if (classId) {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          classId: classId as string,
          ...(termId ? { termId: termId as string } : {}),
        },
        include: {
          student: {
            include: { parent: { select: { firstName: true, lastName: true } } },
          },
        },
      });
      return res.json({ data: enrollments.map((e: any) => e.student) });
    }

    const students = await prisma.student.findMany({
      include: {
        parent: { select: { firstName: true, lastName: true } },
        enrollments: {
          include: { class: { select: { id: true, name: true } } },
          orderBy: { id: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastName: 'asc' },
    });
    res.json({ data: students });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Get a single student
export const getStudent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id ? String(req.params.id) : undefined;
    if (!id) return res.status(400).json({ error: 'Student ID is required' });
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        parent: true,
        enrollments: { include: { class: true, term: true } },
        attendances: { take: 10, orderBy: { date: 'desc' } },
      },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ data: student });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
};

// Create a new student
export const createStudent = async (req: Request, res: Response) => {
  try {
    const {
      firstName, lastName, dateOfBirth, gender, state, lga, address, medicalInfo,
      passportUrl, parentId, classId, termId, email, phone, password,
    } = req.body;

    if (!firstName || !lastName || !dateOfBirth || !gender) {
      return res.status(400).json({ error: 'firstName, lastName, dateOfBirth and gender are required' });
    }

    const count = await prisma.student.count();
    const year = new Date().getFullYear();
    const admissionNo = `DHA/${year}/${String(count + 1).padStart(3, '0')}`;

    const studentData: any = {
      admissionNo, firstName, lastName,
      dateOfBirth: new Date(dateOfBirth),
      gender, admissionStatus: 'APPROVED',
      state: state || undefined, lga: lga || undefined,
      address: address || undefined, medicalInfo: medicalInfo || undefined,
      passportUrl: passportUrl || undefined,
      parentId: parentId || undefined,
    };

    let student;

    if ((email || phone) && password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email: email || undefined,
          phone: phone || undefined,
          password: hashedPassword,
          role: 'STUDENT',
          studentProfile: { create: studentData },
        },
        include: { studentProfile: true },
      });
      student = user.studentProfile!;
    } else {
      student = await prisma.student.create({ data: studentData });
    }

    if (classId && termId && student) {
      try {
        await prisma.enrollment.create({
          data: { studentId: student.id, classId, termId },
        });
      } catch (_) { /* ignore duplicate enroll */ }
    }

    res.status(201).json({ message: 'Student registered successfully', data: student });
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email or admission number already exists' });
    }
    res.status(500).json({ error: 'Failed to create student' });
  }
};

// Update student details
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id ? String(req.params.id) : undefined;
    const { firstName, lastName, address, state, lga, medicalInfo, admissionStatus, parentId } = req.body;

    if (!id) return res.status(400).json({ error: 'Student ID is required' });

    const student = await prisma.student.update({
      where: { id },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        address: address || undefined,
        state: state || undefined,
        lga: lga || undefined,
        medicalInfo: medicalInfo || undefined,
        admissionStatus: admissionStatus || undefined,
        parentId: parentId !== undefined ? parentId : undefined,
      },
    });

    res.json({ message: 'Student updated', data: student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update student' });
  }
};

// Delete student
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id ? String(req.params.id) : undefined;
    if (!id) return res.status(400).json({ error: 'Student ID is required' });
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    if (student.userId) {
      await prisma.user.delete({ where: { id: student.userId } });
    } else {
      await prisma.student.delete({ where: { id } });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
};
