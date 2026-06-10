import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export const app = express();

import { rateLimiter } from './middlewares/rateLimit';

app.use(helmet());
app.use(cors());
app.use(express.json());
// Global rate limiter: limit each IP to 150 requests per 15 minutes
app.use(rateLimiter(150, 15 * 60 * 1000));

import authRoutes from './routes/auth.routes';
import admissionRoutes from './routes/admission.routes';
import studentRoutes from './routes/student.routes';
import schoolStructureRoutes from './routes/schoolStructure.routes';
import staffRoutes from './routes/staff.routes';
import attendanceRoutes from './routes/attendance.routes';
import resultRoutes from './routes/result.routes';
import tahfizRoutes from './routes/tahfiz.routes';
import financeRoutes from './routes/finance.routes';
import userRoutes from './routes/user.routes';
import adminUserRoutes from './routes/adminUser.routes';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin/users', adminUserRoutes);
app.use('/api/v1/admissions', admissionRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/school', schoolStructureRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/results', resultRoutes);
app.use('/api/v1/tahfiz', tahfizRoutes);
app.use('/api/v1/finance', financeRoutes);

// Basic health check routes
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
