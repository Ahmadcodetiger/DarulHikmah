import { Router } from 'express';
import { recordBatchAttendance, getAttendance } from '../controllers/attendance.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Secure all routes
router.use(authenticate);

// Record daily attendance for a class
router.post('/batch', authorize(['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER', 'TEACHER', 'TAHFIZ_TEACHER']), recordBatchAttendance);

// View attendance history for a class/date range
router.get('/', authorize(['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER', 'TEACHER', 'TAHFIZ_TEACHER', 'PARENT', 'STUDENT']), getAttendance);

export default router;
