import { Router } from 'express';
import { recordTahfizProgress, getStudentTahfizHistory } from '../controllers/tahfiz.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Secure all routes
router.use(authenticate);

// Record daily recitation progress
router.post('/record', authorize(['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TAHFIZ_TEACHER']), recordTahfizProgress);

// Get student's memorization history
router.get('/student/:id', authorize(['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TAHFIZ_TEACHER', 'PARENT', 'STUDENT']), getStudentTahfizHistory);

export default router;
