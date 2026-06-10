import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server';

const staffRoles = ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER', 'TEACHER', 'TAHFIZ_TEACHER', 'ACCOUNTANT'];

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        staffProfile: true,
        parentProfile: true,
        studentProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: users });
  } catch (error) {
    console.error('Failed to list users', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        staffProfile: true,
        parentProfile: true,
        studentProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: user });
  } catch (error) {
    console.error('Failed to fetch user', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      email,
      phone,
      password,
      role,
      firstName,
      lastName,
      staffId,
      department,
      admissionNo,
      address,
      occupation,
      dateOfBirth,
      gender,
    } = req.body;

    if (!password || !role || !firstName || !lastName) {
      return res.status(400).json({ error: 'role, password, firstName, and lastName are required' });
    }

    if (role === 'STUDENT' && (!dateOfBirth || !gender)) {
      return res.status(400).json({ error: 'Student users require dateOfBirth and gender' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData: any = {
      email: email || undefined,
      phone: phone || undefined,
      password: hashedPassword,
      role,
      isActive: true,
    };

    if (staffRoles.includes(role)) {
      userData.staffProfile = {
        create: {
          firstName,
          lastName,
          staffId: staffId || `STF-${Date.now().toString().slice(-6)}`,
          department: department || undefined,
        },
      };
    }

    if (role === 'PARENT') {
      userData.parentProfile = {
        create: {
          firstName,
          lastName,
          address: address || undefined,
          occupation: occupation || undefined,
        },
      };
    }

    if (role === 'STUDENT') {
      userData.studentProfile = {
        create: {
          firstName,
          lastName,
          admissionNo:
            admissionNo || `DHA/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          address: address || undefined,
        },
      };
    }

    const user = await prisma.user.create({
      data: userData,
      include: {
        staffProfile: true,
        parentProfile: true,
        studentProfile: true,
      },
    });

    res.status(201).json({ message: 'User created successfully', data: user });
  } catch (error: any) {
    console.error('Failed to create user', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email, phone, or unique profile identifier already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      email,
      phone,
      role,
      isActive,
      firstName,
      lastName,
      staffId,
      department,
      admissionNo,
      address,
      occupation,
      dateOfBirth,
      gender,
    } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        email: email || undefined,
        phone: phone || undefined,
        role: role || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      include: {
        staffProfile: true,
        parentProfile: true,
        studentProfile: true,
      },
    });

    if (staffRoles.includes(user.role)) {
      const staffProfile = await prisma.staff.findUnique({ where: { userId: id } });
      if (staffProfile) {
        await prisma.staff.update({
          where: { userId: id },
          data: {
            firstName: firstName || staffProfile.firstName,
            lastName: lastName || staffProfile.lastName,
            staffId: staffId || staffProfile.staffId,
            department: department || staffProfile.department,
          },
        });
      } else if (firstName && lastName) {
        await prisma.staff.create({
          data: {
            userId: id,
            firstName,
            lastName,
            staffId: staffId || `STF-${Date.now().toString().slice(-6)}`,
            department: department || undefined,
          },
        });
      }
    }

    if (role === 'PARENT' || user.role === 'PARENT') {
      const parentProfile = await prisma.parent.findUnique({ where: { userId: id } });
      if (parentProfile) {
        await prisma.parent.update({
          where: { userId: id },
          data: {
            firstName: firstName || parentProfile.firstName,
            lastName: lastName || parentProfile.lastName,
            address: address || parentProfile.address,
            occupation: occupation || parentProfile.occupation,
          },
        });
      } else if (firstName && lastName) {
        await prisma.parent.create({
          data: {
            userId: id,
            firstName,
            lastName,
            address: address || undefined,
            occupation: occupation || undefined,
          },
        });
      }
    }

    if (role === 'STUDENT' || user.role === 'STUDENT') {
      if (!dateOfBirth || !gender) {
        return res.status(400).json({ error: 'Student users require dateOfBirth and gender when updating' });
      }
      const studentProfile = await prisma.student.findUnique({ where: { userId: id } });
      if (studentProfile) {
        await prisma.student.update({
          where: { userId: id },
          data: {
            firstName: firstName || studentProfile.firstName,
            lastName: lastName || studentProfile.lastName,
            admissionNo: admissionNo || studentProfile.admissionNo,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : studentProfile.dateOfBirth,
            gender: gender || studentProfile.gender,
            address: address || studentProfile.address,
          },
        });
      } else {
        await prisma.student.create({
          data: {
            userId: id,
            firstName,
            lastName,
            admissionNo: admissionNo || `DHA/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
            dateOfBirth: new Date(dateOfBirth),
            gender,
            address: address || undefined,
          },
        });
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: {
        staffProfile: true,
        parentProfile: true,
        studentProfile: true,
      },
    });

    res.json({ message: 'User updated successfully', data: updatedUser });
  } catch (error: any) {
    console.error('Failed to update user', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email, phone, or unique profile identifier already exists' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        staffProfile: true,
        parentProfile: true,
        studentProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.staff.deleteMany({ where: { userId: id } });
    await prisma.parent.deleteMany({ where: { userId: id } });
    await prisma.student.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id }, data: { password: hashedPassword } });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Failed to reset password', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
