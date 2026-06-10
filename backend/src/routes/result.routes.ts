import { Router } from 'express';
import { recordBatchResults, getSubjectResults, getStudentReportCard } from '../controllers/result.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Secure all routes
router.use(authenticate);

// Record scores for a subject
router.post('/batch', authorize(['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER', 'TEACHER']), recordBatchResults);

// View scores for a subject
router.get('/subject', authorize(['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER', 'TEACHER']), getSubjectResults);

// Generate report card data
router.get('/report-card', authorize(['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER', 'TEACHER', 'PARENT', 'STUDENT']), getStudentReportCard);

export default router;
