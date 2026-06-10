import { Request, Response } from 'express';
import { prisma } from '../server';
import bcrypt from 'bcryptjs';

// List all parents
export const getParents = async (req: Request, res: Response) => {
  try {
    const parents = await prisma.parent.findMany({
      include: {
        user: { select: { email: true, phone: true, isActive: true } },
        students: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
      },
      orderBy: { lastName: 'asc' },
    });
    res.json({ data: parents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch parents' });
  }
};

// Create parent user + profile
export const createParent = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, firstName, lastName, address, occupation, studentIds } = req.body;

    if (!password || !firstName || !lastName) {
      return res.status(400).json({ error: 'firstName, lastName and password are required' });
    }
    if (!email && !phone) {
      return res.status(400).json({ error: 'email or phone is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email || undefined,
        phone: phone || undefined,
        password: hashedPassword,
        role: 'PARENT',
        parentProfile: {
          create: {
            firstName,
            lastName,
            address: address || undefined,
            occupation: occupation || undefined,
          },
        },
      },
      include: { parentProfile: true },
    });

    // Link students if provided
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      await prisma.student.updateMany({
        where: { id: { in: studentIds } },
        data: { parentId: user.parentProfile!.id },
      });
    }

    res.status(201).json({ message: 'Parent account created successfully', data: user });
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email or phone already exists' });
    }
    res.status(500).json({ error: 'Failed to create parent' });
  }
};

// Update parent
export const updateParent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id ? String(req.params.id) : undefined;
    const { firstName, lastName, address, occupation, studentIds, isActive } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Parent ID is required' });
    }

    const parent = await prisma.parent.update({
      where: { id },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        address: address || undefined,
        occupation: occupation || undefined,
        user: isActive !== undefined ? { update: { isActive } } : undefined,
      },
    });

    if (studentIds && Array.isArray(studentIds)) {
      // First unlink any existing students linked to this parent
      await prisma.student.updateMany({
        where: { parentId: id },
        data: { parentId: null },
      });
      // Re-link with new studentIds
      if (studentIds.length > 0) {
        await prisma.student.updateMany({
          where: { id: { in: studentIds } },
          data: { parentId: id },
        });
      }
    }

    res.json({ message: 'Parent updated', data: parent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update parent' });
  }
};

// Delete parent
export const deleteParent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id ? String(req.params.id) : undefined;
    if (!id) {
      return res.status(400).json({ error: 'Parent ID is required' });
    }
    const parent = await prisma.parent.findUnique({ where: { id } });
    if (!parent) return res.status(404).json({ error: 'Parent not found' });

    // Unlink students first
    await prisma.student.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });

    // Delete user (cascade deletes parent profile)
    await prisma.user.delete({ where: { id: parent.userId } });

    res.json({ message: 'Parent deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete parent' });
  }
};
