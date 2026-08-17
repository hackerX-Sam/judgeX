import { Router } from 'express';
import { createSubmission, getSubmission, updateSubmission, getActivity, getSolvedProblems, executePlayground } from '../controllers/submission.controller';

const router = Router();

// In a real application, createSubmission should be protected to ensure the user is logged in
router.post('/', createSubmission);
router.post('/execute/playground', executePlayground);
router.get('/activity/:userId', getActivity);
router.get('/solved/:userId', getSolvedProblems);
router.get('/:id', getSubmission);
router.put('/:id', updateSubmission);

export default router;
