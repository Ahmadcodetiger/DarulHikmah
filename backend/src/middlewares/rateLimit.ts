import { Request, Response, NextFunction } from 'express';

const ipRequests = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (limit: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let record = ipRequests.get(ip);

    if (!record) {
      record = { count: 1, resetTime: now + windowMs };
      ipRequests.set(ip, record);
      return next();
    }

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    record.count++;
    if (record.count > limit) {
      console.warn(`⏱️ [RATE_LIMIT] IP ${ip} exceeded limit - ${record.count}/${limit} requests`);
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    next();
  };
};
