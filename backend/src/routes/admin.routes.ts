// server/routes/admin.ts - Backend API routes
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

const router = express.Router();

// Middleware to verify super admin
const verifySuperAdmin = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string; role: string };
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// Get all users
router.get('/users', verifySuperAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        staffProfile: true,
        studentProfile: true,
        parentProfile: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const usersWithoutPassword = users.map((user: any) => {
      const { password, ...rest } = user;
      return rest;
    });
    res.json(usersWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user
router.post('/users', verifySuperAdmin, async (req, res) => {
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
      address
    } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email,
          phone,
          password: hashedPassword,
          role,
          isActive: true
        }
      });
      
      // Create role-specific profile
      if (role === 'TEACHER' || role === 'TAHFIZ_TEACHER' || role === 'PRINCIPAL' || 
          role === 'VICE_PRINCIPAL' || role === 'HEAD_TEACHER' || role === 'ACCOUNTANT') {
        await tx.staff.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
            staffId: staffId || `STAFF/${Date.now()}`,
            department: department || null
          }
        });
      } else if (role === 'STUDENT') {
        await tx.student.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
            admissionNo: admissionNo || `DHA/${new Date().getFullYear()}/${Date.now()}`,
            dateOfBirth: new Date(),
            gender: 'Not specified'
          }
        });
      } else if (role === 'PARENT') {
        await tx.parent.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
            address: address || null
          }
        });
      }
      
      return user;
    });
    
    res.json({ success: true, user: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/users/:id', verifySuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone, isActive, role } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: { email, phone, isActive, role }
    });
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', verifySuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Toggle user status
router.patch('/users/:id/status', verifySuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: { isActive }
    });
    
    res.json({ success: true, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Reset password
router.post('/users/:id/reset-password', verifySuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;