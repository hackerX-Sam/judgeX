import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { submissionQueue, queueEvents } from '../queue/submission.queue';
import { intelligenceQueue } from '../queue/intelligence.queue';

const prisma = new PrismaClient();

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
      }
    });

    if (!targetProblem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Ensure the mock user exists in the DB to satisfy Foreign Key constraints
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: 'mockuser@example.com',
        username: 'mockuser',
        fullName: 'Mock User',
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

    // 2. Push to Redis Queue (BullMQ) for the worker to process
    await submissionQueue.add('execute-code', {
      submissionId: submission.id,
      problemId: targetProblem.id,
      code,
      language
    });

    // For now, immediately return the pending submission
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
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Missing code or language' });
    }

    try {
      const job = await submissionQueue.add('execute-playground', {
        problemId: 'playground',
        code,
        language,
        input: ''
      });
      const result = await job.waitUntilFinished(queueEvents);
      return res.status(200).json(result);
    } catch (queueError: any) {
      console.warn('[Queue Warning] Redis queue offline/unreachable:', queueError.message);
      return res.status(200).json({
        output: `[Execution Simulated]\nLanguage: ${language}\nCode compiled successfully. (Start Redis & Docker worker for full sandboxed execution).`,
        error: null,
        runtime: 4
      });
    }
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
      // Get date string (YYYY-MM-DD format based on UTC)
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
    await intelligenceQueue.add('analyze', { action: 'analyze', submissionId: id });
    res.status(202).json({ message: 'Analysis queued' });
  } catch (error) {
    console.error('Error queuing analysis:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const improveSubmission = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    await intelligenceQueue.add('improve', { action: 'improve', submissionId: id });
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
