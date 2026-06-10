import { Router } from 'express';
import { 
  getAcademicSessions, createAcademicSession, createTerm,
  getClasses, createClass, updateClass, createSubject, getClassById,
  getSubjects, getTerms, getActiveTerm
} from '../controllers/schoolStructure.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// Sessions & Terms
router.get('/sessions', getAcademicSessions);
router.post('/sessions', authorize(['SUPER_ADMIN', 'PRINCIPAL']), createAcademicSession);
router.get('/terms', getTerms);
router.get('/terms/active', getActiveTerm);
router.post('/terms', authorize(['SUPER_ADMIN', 'PRINCIPAL']), createTerm);

// Classes & Subjects
router.get('/classes', getClasses);
router.get('/classes/:id', getClassById);
router.post('/classes', authorize(['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), createClass);
router.patch('/classes/:id', authorize(['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), updateClass);
router.get('/subjects', getSubjects);
router.post('/subjects', authorize(['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']), createSubject);

export default router;
