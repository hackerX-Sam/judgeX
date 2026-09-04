import { Worker, Job } from 'bullmq';
import { runCode } from './runner/dockerRunner';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const redisConnection = {
  host: '127.0.0.1',
  port: 6379,
};

const worker = new Worker('submissionQueue', async (job: Job) => {
  const { submissionId, problemId, code, language, input } = job.data;
  console.log(`\n[Job ${job.id}] Processing submission ${submissionId || 'playground'} for problem ${problemId} in ${language}`);

  if (problemId === 'playground') {
    const startTime = Date.now();
    const result = await runCode(language, code, input || '', true);
    const runtime = Date.now() - startTime;
    return { ...result, runtime };
  }

  try {
    // 1. Fetch all test cases from the backend API
    const response = await axios.get(`${BACKEND_URL}/api/problems/${problemId}/testcases/all`);
    const testCases = response.data.testCases;

    if (!testCases || testCases.length === 0) {
      throw new Error('No test cases found for this problem.');
    }

    // 2. Run the code against all test cases using Docker
    let finalStatus = 'ACCEPTED';
    let errorMessage = null;
    let maxRuntime = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      console.log(`  -> Running Test Case ${i + 1}/${testCases.length}...`);
      
      const startTime = Date.now();
      const result = await runCode(language, code, tc.input);
      const runtime = Date.now() - startTime;
      
      if (runtime > maxRuntime) maxRuntime = runtime;

      if (result.error) {
        finalStatus = result.isTimeLimit ? 'TIME_LIMIT_EXCEEDED' : 'RUNTIME_ERROR';
        errorMessage = result.error;
        console.log(`  -> Test Case ${i + 1} Failed: ${finalStatus}`);
        break; // Stop on first failure
      }

      // Simple string comparison (ignoring trailing whitespace/newlines)
      const actualOutput = result.output.trim();
      const expectedOutput = tc.expectedOutput.trim();

      if (actualOutput !== expectedOutput) {
        finalStatus = 'WRONG_ANSWER';
        errorMessage = `Input: ${tc.input}\nExpected: ${expectedOutput}\nGot: ${actualOutput}`;
        console.log(`  -> Test Case ${i + 1} Failed: WRONG_ANSWER`);
        break;
      }
    }

    // 3. Update the submission status in the backend
    if (job.data.isVerification) {
      const { originalSubmissionId } = job.data;
      await axios.put(`${BACKEND_URL}/api/submissions/${originalSubmissionId}/intelligence`, {
        improvementStatus: finalStatus === 'ACCEPTED' ? 'VERIFIED_IMPROVEMENT' : 'FAILED_VERIFICATION'
      });
    } else {
      await axios.put(`${BACKEND_URL}/api/submissions/${submissionId}`, {
        status: finalStatus,
        errorMessage,
        runtime: maxRuntime,
        memory: 0 // Mock memory for now
      });
      
      // Trigger AI analysis if it was a normal submission
      try {
        await axios.post(`${BACKEND_URL}/api/submissions/${submissionId}/analyze`);
      } catch (e: any) {
        console.error('Failed to trigger AI analysis:', e.message);
      }
    }

    console.log(`[Job ${job.id}] Completed with status: ${finalStatus}`);

  } catch (error: any) {
    console.error(`[Job ${job.id}] Error:`, error.message);
    if (job.data.isVerification) {
      const { originalSubmissionId } = job.data;
      if (originalSubmissionId) {
        await axios.put(`${BACKEND_URL}/api/submissions/${originalSubmissionId}/intelligence`, {
          improvementStatus: 'FAILED_VERIFICATION'
        }).catch(e => console.error('Failed to report error to backend:', e.message));
      }
    } else {
      await axios.put(`${BACKEND_URL}/api/submissions/${submissionId}`, {
        status: 'RUNTIME_ERROR',
        errorMessage: 'Internal worker error: ' + error.message
      }).catch(e => console.error('Failed to report error to backend:', e.message));
    }
  }
}, { connection: redisConnection });

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});

console.log('Worker is running and listening to submissionQueue...');
