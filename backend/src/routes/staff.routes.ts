import { Router } from 'express';
import { getStaff, createStaff } from '../controllers/staff.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER']), getStaff);
router.post('/', authorize(['SUPER_ADMIN', 'PRINCIPAL']), createStaff);

export default router;
