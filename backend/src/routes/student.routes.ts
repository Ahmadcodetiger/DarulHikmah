import { Router } from 'express';
import { getStudents, getStudent, createStudent, updateStudent, deleteStudent } from '../controllers/student.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER', 'TEACHER', 'ACCOUNTANT', 'TAHFIZ_TEACHER']), getStudents);
router.get('/:id', authorize(['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER', 'TEACHER', 'ACCOUNTANT']), getStudent);
router.post('/', authorize(['SUPER_ADMIN', 'PRINCIPAL']), createStudent);
router.put('/:id', authorize(['SUPER_ADMIN', 'PRINCIPAL']), updateStudent);
router.delete('/:id', authorize(['SUPER_ADMIN']), deleteStudent);

export default router;
