"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const dockerRunner_1 = require("./runner/dockerRunner");
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const redisConnection = {
    host: '127.0.0.1',
    port: 6379,
};
const worker = new bullmq_1.Worker('submissionQueue', async (job) => {
    const { submissionId, problemId, code, language, input } = job.data;
    console.log(`\n[Job ${job.id}] Processing submission ${submissionId || 'playground'} for problem ${problemId} in ${language}`);
    if (problemId === 'playground') {
        const startTime = Date.now();
        const result = await (0, dockerRunner_1.runCode)(language, code, input || '', true);
        const runtime = Date.now() - startTime;
        return { ...result, runtime };
    }
    try {
        // 1. Fetch all test cases from the backend API
        const response = await axios_1.default.get(`http://localhost:3000/api/problems/${problemId}/testcases/all`);
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
            const result = await (0, dockerRunner_1.runCode)(language, code, tc.input);
            const runtime = Date.now() - startTime;
            if (runtime > maxRuntime)
                maxRuntime = runtime;
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
            await axios_1.default.put(`http://localhost:3000/api/submissions/${originalSubmissionId}/intelligence`, {
                improvementStatus: finalStatus === 'ACCEPTED' ? 'VERIFIED_IMPROVEMENT' : 'FAILED_VERIFICATION'
            });
        }
        else {
            await axios_1.default.put(`http://localhost:3000/api/submissions/${submissionId}`, {
                status: finalStatus,
                errorMessage,
                runtime: maxRuntime,
                memory: 0 // Mock memory for now
            });
            // Trigger AI analysis if it was a normal submission
            try {
                await axios_1.default.post(`http://localhost:3000/api/submissions/${submissionId}/analyze`);
            }
            catch (e) {
                console.error('Failed to trigger AI analysis:', e.message);
            }
        }
        console.log(`[Job ${job.id}] Completed with status: ${finalStatus}`);
    }
    catch (error) {
        console.error(`[Job ${job.id}] Error:`, error.message);
        await axios_1.default.put(`http://localhost:3000/api/submissions/${submissionId}`, {
            status: 'RUNTIME_ERROR',
            errorMessage: 'Internal worker error: ' + error.message
        }).catch(e => console.error('Failed to report error to backend:', e.message));
    }
}, { connection: redisConnection });
worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with error ${err.message}`);
});
console.log('Worker is running and listening to submissionQueue...');
