import { Router } from 'express';
import { getParents, createParent, updateParent, deleteParent } from '../controllers/parent.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER', 'ACCOUNTANT']), getParents);
router.post('/', authorize(['SUPER_ADMIN', 'PRINCIPAL']), createParent);
router.put('/:id', authorize(['SUPER_ADMIN', 'PRINCIPAL']), updateParent);
router.delete('/:id', authorize(['SUPER_ADMIN']), deleteParent);

export default router;
