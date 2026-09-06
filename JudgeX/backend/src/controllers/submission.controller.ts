import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { submissionQueue, queueEvents, isRedisConnected } from '../queue/submission.queue';
import { intelligenceQueue } from '../queue/intelligence.queue';
import { runLocalCode } from '../services/localRunner';

const prisma = new PrismaClient();

const processSubmissionLocally = async (submissionId: string, problem: any, code: string, language: string) => {
  try {
    const testCases = problem.testCases || [];
    let finalStatus = 'ACCEPTED';
    let errorMessage: string | null = null;
    let maxRuntime = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const res = await runLocalCode(language, code, tc.input);
      if (res.runtime > maxRuntime) maxRuntime = res.runtime;

      if (res.error) {
        finalStatus = 'RUNTIME_ERROR';
        errorMessage = res.error;
        break;
      }

      const actual = (res.output || '').trim();
      const expected = (tc.expectedOutput || '').trim();

      if (actual !== expected) {
        finalStatus = 'WRONG_ANSWER';
        errorMessage = `Test Case ${i + 1} Failed.\nInput: ${tc.input}\nExpected: ${expected}\nGot: ${actual}`;
        break;
      }
    }

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: finalStatus,
        executionTime: maxRuntime,
        errorMessage
      }
    });

    try {
      if (isRedisConnected) {
        await intelligenceQueue.add('analyze', { action: 'analyze', submissionId });
      }
    } catch (e) {}
  } catch (err: any) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'RUNTIME_ERROR',
        errorMessage: 'Local runner error: ' + err.message
      }
    });
  }
};

export const createSubmission = async (req: Request, res: Response): Promise<any> => {
  try {
    const { problemId, code, language, userId } = req.body;

    if (!problemId || !code || !language || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Resolve Problem by ID or Slug
    const targetProblem = await prisma.problem.findFirst({
      where: {
        OR: [{ id: problemId }, { slug: problemId }]
      },
      include: { testCases: true }
    });

    if (!targetProblem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Ensure the user exists in the DB to satisfy Foreign Key constraints
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: 'user@example.com',
        username: 'user_' + userId.substring(0, 8),
        fullName: 'User',
        provider: 'local',
      }
    });

    // 1. Create a pending submission in the database
    const submission = await prisma.submission.create({
      data: {
        problemId: targetProblem.id,
        userId,
        code,
        language,
        status: 'PENDING',
      },
    });

    let queueSuccess = false;
    if (isRedisConnected) {
      try {
        await submissionQueue.add('execute-code', {
          submissionId: submission.id,
          problemId: targetProblem.id,
          code,
          language
        });
        queueSuccess = true;
      } catch (err) {
        queueSuccess = false;
      }
    }

    // 2. Fallback execution if Redis/Worker is offline
    if (!queueSuccess) {
      processSubmissionLocally(submission.id, targetProblem, code, language);
    }

    res.status(202).json({ 
      message: 'Submission received and is pending execution', 
      submissionId: submission.id 
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const executePlayground = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Missing code or language' });
    }

    if (isRedisConnected) {
      try {
        const job = await submissionQueue.add('execute-playground', {
          problemId: 'playground',
          code,
          language,
          input: input || ''
        });
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Worker response timeout')), 3000)
        );
        const result = await Promise.race([job.waitUntilFinished(queueEvents), timeout]);
        return res.status(200).json(result);
      } catch (queueError: any) {
        console.warn('[Queue Warning] Fallback to local execution:', queueError.message);
      }
    }

    // Fallback: Run local code runner
    const localResult = await runLocalCode(language, code, input || '');
    return res.status(200).json(localResult);
  } catch (error) {
    console.error('Error executing playground code:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getSubmission = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { intelligence: true }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.status(200).json({ submission });
  } catch (error) {
    console.error('Error fetching submission details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateSubmission = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { status, runtime, memory, errorMessage } = req.body;
    
    const submission = await prisma.submission.update({
      where: { id },
      data: {
        status,
        executionTime: runtime !== undefined ? runtime : undefined,
        memoryUsed: memory !== undefined ? memory : undefined,
        errorMessage: errorMessage !== undefined ? errorMessage : undefined,
      }
    });

    res.status(200).json({ submission });
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getActivity = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.params.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Fetch all ACCEPTED submissions for the user
    const submissions = await prisma.submission.findMany({
      where: {
        userId: userId,
        status: 'ACCEPTED'
      },
      select: {
        createdAt: true
      }
    });

    // Group by YYYY-MM-DD
    const activityMap: Record<string, number> = {};
    for (const sub of submissions) {
      const dateString = sub.createdAt.toISOString().split('T')[0];
      activityMap[dateString] = (activityMap[dateString] || 0) + 1;
    }

    res.status(200).json({ activity: activityMap });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getSolvedProblems = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.params.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const solvedSubmissions = await prisma.submission.findMany({
      where: {
        userId,
        status: 'ACCEPTED'
      },
      select: {
        problemId: true
      },
      distinct: ['problemId']
    });

    const solvedProblemIds = solvedSubmissions.map(s => s.problemId);
    res.status(200).json({ solvedProblemIds });
  } catch (error) {
    console.error('Error fetching solved problems:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const analyzeSubmission = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    if (isRedisConnected) {
      await intelligenceQueue.add('analyze', { action: 'analyze', submissionId: id });
    }
    res.status(202).json({ message: 'Analysis queued' });
  } catch (error) {
    console.error('Error queuing analysis:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const improveSubmission = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    if (isRedisConnected) {
      await intelligenceQueue.add('improve', { action: 'improve', submissionId: id });
    }
    res.status(202).json({ message: 'Improvement queued' });
  } catch (error) {
    console.error('Error queuing improvement:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateIntelligenceStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { improvementStatus } = req.body;
    const int = await prisma.codeIntelligence.upsert({
      where: { submissionId: id },
      update: { improvementStatus },
      create: {
        submissionId: id,
        improvementStatus,
        timeComplexity: 'N/A',
        spaceComplexity: 'N/A',
        qualityScore: 0,
        readabilityScore: 0,
        codeSmells: '[]',
        edgeCases: '[]',
        explanation: '',
        optimization: ''
      }
    });
    res.status(200).json({ intelligence: int });
  } catch (error) {
    console.error('Error updating intelligence status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
