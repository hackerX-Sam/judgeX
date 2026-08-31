import { Queue, Worker, QueueEvents } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { analyzeCode, generateImprovedCode } from '../services/ai.service';
import IORedis from 'ioredis';
import { submissionQueue } from './submission.queue';

const prisma = new PrismaClient();
const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export const intelligenceQueue = new Queue('intelligence-queue', { connection: connection as any });
export const intelligenceEvents = new QueueEvents('intelligence-queue', { connection: connection as any });

export const intelligenceWorker = new Worker('intelligence-queue', async (job) => {
  const { action, submissionId } = job.data;
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('Skipping AI analysis: No OPENAI_API_KEY provided');
    return;
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { problem: true }
  });

  if (!submission) return;

  if (action === 'analyze') {
    // 1. Check if it already exists
    const existing = await prisma.codeIntelligence.findUnique({ where: { submissionId } });
    if (existing) return;

    // 2. Generate analysis
    const analysis = await analyzeCode(submission.code, submission.language, submission.problem.description);
    
    // 3. Save to DB
    await prisma.codeIntelligence.create({
      data: {
        submissionId,
        timeComplexity: analysis?.timeComplexity || 'Unknown',
        spaceComplexity: analysis?.spaceComplexity || 'Unknown',
        qualityScore: analysis?.qualityScore || 0,
        readabilityScore: analysis?.readabilityScore || 0,
        codeSmells: JSON.stringify(analysis?.codeSmells || []),
        edgeCases: JSON.stringify(analysis?.edgeCases || []),
        explanation: analysis?.explanation || '',
        optimization: analysis?.optimization || '',
      }
    });
  } else if (action === 'improve') {
    // 1. Generate Improved Code
    const improvement = await generateImprovedCode(submission.code, submission.language, submission.problem.description);
    if (!improvement?.improvedCode) return;

    // 2. Save temporarily with PENDING status
    await prisma.codeIntelligence.update({
      where: { submissionId },
      data: { 
        improvedCode: improvement.improvedCode,
        improvementStatus: 'PENDING'
      }
    });

    // 3. Dispatch execution job to verify it!
    // We send a hidden job to the runner
    const verifyJob = await submissionQueue.add('execute-playground', {
      problemId: submission.problem.id,
      code: improvement.improvedCode,
      language: submission.language,
      input: '', // we might need to actually run it against real test cases
      isVerification: true,
      originalSubmissionId: submissionId
    });
    
    // The result handling of the verification job will update the status to VERIFIED_IMPROVEMENT
  }
}, { connection: connection as any });
