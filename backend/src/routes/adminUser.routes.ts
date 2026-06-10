import { Router } from 'express';
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
} from '../controllers/adminUser.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

router.get('/', authorize(['SUPER_ADMIN']), listUsers);
router.get('/:id', authorize(['SUPER_ADMIN']), getUserById);
router.post('/', authorize(['SUPER_ADMIN']), createUser);
router.put('/:id', authorize(['SUPER_ADMIN']), updateUser);
router.delete('/:id', authorize(['SUPER_ADMIN']), deleteUser);
router.patch('/:id/status', authorize(['SUPER_ADMIN']), updateUser);
router.post('/:id/reset-password', authorize(['SUPER_ADMIN']), resetUserPassword);

export default router;
