import { Request, Response } from 'express';
import { prisma } from '../server';
import { Section } from '@prisma/client';

export const getStaff = async (req: Request, res: Response) => {
  try {
    const sectionQuery = req.query.section as string | undefined;
    const section = sectionQuery ? (sectionQuery.toUpperCase() as Section) : undefined;

    const staff = await prisma.staff.findMany({
      where: section ? {
        assignedClasses: {
          some: {
            section,
          }
        }
      } : {},
      include: {
        user: { select: { email: true, role: true, isActive: true } },
        assignedClasses: true
      }
    });
    res.json({ data: staff });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
};

export const createStaff = async (req: Request, res: Response) => {
  try {
    const { email, password, role, firstName, lastName, department } = req.body;
    
    // In a real app, hash password before saving. 
    // Here we'd ideally trigger auth creation and then staff profile.
    import('bcryptjs').then(async (bcrypt) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
          staffProfile: {
            create: {
              firstName,
              lastName,
              staffId: `STF-${Date.now().toString().slice(-6)}`,
              department
            }
          }
        },
        include: { staffProfile: true }
      });
      
      res.status(201).json({ message: 'Staff created', data: user });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create staff' });
  }
};
