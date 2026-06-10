import { Router } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

router.post('/:id/last-login', (req: AuthRequest, res) => {
  const { id } = req.params;

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.user.id !== id && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.json({ success: true, message: 'Last login recorded' });
});

export default router;
