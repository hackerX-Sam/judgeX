import { Router } from 'express';
import { getProblems, getProblemBySlug, createProblem, getAllTestCases, updateProblem, deleteProblem } from '../controllers/problem.controller';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getProblems);
router.get('/:slug', getProblemBySlug);

// Worker / Internal execution route (requires auth or service key)
router.get('/:id/testcases/all', getAllTestCases);

// Admin-only protected routes
router.post('/', requireAdmin, createProblem);
router.put('/:id', requireAdmin, updateProblem);
router.delete('/:id', requireAdmin, deleteProblem);

export default router;

