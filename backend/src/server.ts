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

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('✅ [DATABASE] Successfully connected to PostgreSQL database');
  })
  .catch((error) => {
    console.error('❌ [DATABASE] Failed to connect to PostgreSQL database');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
  });

export const app = express();

import { rateLimiter } from './middlewares/rateLimit';

app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const method = req.method;
  const path = req.path;
  
  console.log(`📨 [${new Date().toISOString()}] ${method} ${path}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusEmoji = status >= 200 && status < 300 ? '✅' : status >= 400 ? '❌' : '⚠️';
    console.log(`${statusEmoji} [${new Date().toISOString()}] ${method} ${path} - ${status} (${duration}ms)`);
  });
  
  next();
});

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
  const timestamp = new Date().toISOString();
  
  console.error(`\n🔴 ERROR OCCURRED [${timestamp}]`);
  console.error(`   Method: ${req.method}`);
  console.error(`   Path: ${req.path}`);
  console.error(`   IP: ${req.ip}`);
  console.error(`   Message: ${err.message || 'Unknown error'}`);
  console.error(`   Status: ${err.status || 500}`);
  console.error(`   Stack: ${err.stack}`);
  
  if (err.code) {
    console.error(`   Error Code: ${err.code}`);
  }
  if (err.query) {
    console.error(`   Query: ${err.query}`);
  }
  console.error('---\n');
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error',
    timestamp: timestamp,
    path: req.path
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log('\n🚀 [SERVER] Server started successfully');
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Time: ${new Date().toISOString()}\n`);
  });
} else {
  console.log('ℹ️ [SERVER] Running on Vercel - skipping local server listen');
}

export default app;
