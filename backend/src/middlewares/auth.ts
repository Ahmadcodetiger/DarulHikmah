import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(`⚠️ [AUTH] Missing or invalid token format from ${req.ip} - ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string; role: Role };
    req.user = decoded;
    console.log(`✅ [AUTH] Token verified for user ${decoded.id} (${decoded.role}) - ${req.method} ${req.path}`);
    next();
  } catch (error: any) {
    console.error(`❌ [AUTH] Token verification failed from ${req.ip}`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

export const authorize = (roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.warn(`⚠️ [AUTH] User context missing for authorization check - ${req.path}`);
      return res.status(403).json({ error: 'Forbidden: No user context' });
    }
    
    if (!roles.includes(req.user.role)) {
      console.warn(`❌ [AUTH] User ${req.user.id} (${req.user.role}) denied access to ${req.method} ${req.path}`);
      console.warn(`   Required roles: ${roles.join(', ')}`);
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    console.log(`✅ [AUTH] User ${req.user.id} (${req.user.role}) authorized for ${req.method} ${req.path}`);
    next();
  };
};
