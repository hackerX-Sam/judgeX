import { Router } from 'express';
import { getProblems, getProblemBySlug, createProblem, getAllTestCases, updateProblem, deleteProblem } from '../controllers/problem.controller';

const router = Router();

// In a real application, createProblem, updateProblem, deleteProblem should be protected by Admin middleware
router.post('/', createProblem);
router.get('/', getProblems);
router.get('/:id/testcases/all', getAllTestCases);
router.get('/:slug', getProblemBySlug);
router.put('/:id', updateProblem);
router.delete('/:id', deleteProblem);

export default router;
