import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const identifier = email?.trim();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email or phone and password are required' });
    }

    const normalizePhone = (phone: string) => phone.replace(/\D+/g, '');
    const normalizeLocalPhone = (phone: string) => {
      const normalized = normalizePhone(phone);
      if (normalized.startsWith('0')) {
        return normalized.replace(/^0+/, '');
      }
      if (normalized.startsWith('234') && normalized.length > 10) {
        return normalized.slice(-10);
      }
      return normalized;
    };

    const phoneMatches = (inputPhone: string, storedPhone: string) => {
      const normalizedInput = normalizePhone(inputPhone);
      const normalizedStored = normalizePhone(storedPhone);
      if (!normalizedInput || !normalizedStored) return false;
      if (normalizedInput === normalizedStored) return true;
      const inputLocal = normalizeLocalPhone(normalizedInput);
      const storedLocal = normalizeLocalPhone(normalizedStored);
      if (inputLocal && storedLocal && inputLocal === storedLocal) return true;
      return false;
    };

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user) {
      const phoneCandidates = await prisma.user.findMany({
        where: { phone: { not: null } },
      });
      user = phoneCandidates.find((u) => u.phone && phoneMatches(identifier, u.phone)) || null;
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string; role: string };
    res.json({ valid: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.json({ success: true });
};
