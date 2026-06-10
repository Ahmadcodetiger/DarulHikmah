import { Router } from 'express';
import { applyForAdmission, getAdmissions, updateAdmissionStatus } from '../controllers/admission.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Public route for admission application
router.post('/apply', applyForAdmission);

// Protected Admin Routes
router.get('/', authenticate, authorize(['SUPER_ADMIN', 'PRINCIPAL']), getAdmissions);
router.put('/:id/status', authenticate, authorize(['SUPER_ADMIN', 'PRINCIPAL']), updateAdmissionStatus);

export default router;
