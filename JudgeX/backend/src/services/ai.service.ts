import { OpenAI } from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AnalysisSchema = z.object({
  timeComplexity: z.string(),
  spaceComplexity: z.string(),
  qualityScore: z.number(),
  readabilityScore: z.number(),
  codeSmells: z.array(z.string()),
  edgeCases: z.array(z.string()),
  explanation: z.string(),
  optimization: z.string(),
});

export const analyzeCode = async (code: string, language: string, problemDescription: string) => {
  const prompt = `You are an expert coding judge and AI mentor. Analyze the following ${language} code submission for a programming problem.
  
Problem Description:
${problemDescription}

Submitted Code:
${code}

Perform a rigorous analysis. Be honest and strict about the code quality and readability out of 100.
Identify code smells (like duplicate logic, poor naming, deep nesting).
Identify potential edge cases.
Explain how the code works and how to optimize it.`;

  // @ts-ignore - 'chat' does not exist on type 'Beta' in this openai SDK version typings
  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert code reviewer.' },
      { role: 'user', content: prompt }
    ],
    response_format: zodResponseFormat(AnalysisSchema, 'analysis'),
  });

  return completion.choices[0].message.parsed;
};

const ImprovementSchema = z.object({
  improvedCode: z.string(),
});

export const generateImprovedCode = async (originalCode: string, language: string, problemDescription: string) => {
  const prompt = `You are an expert coding mentor. The user submitted the following ${language} code for a problem. 
Your task is to write an optimized, perfectly clean, and fully working version of this code. 
Only return the improved code without any markdown formatting or surrounding text, just the raw code.

Problem Description:
${problemDescription}

Original Code:
${originalCode}
`;

  // @ts-ignore - 'chat' does not exist on type 'Beta' in this openai SDK version typings
  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert programmer.' },
      { role: 'user', content: prompt }
    ],
    response_format: zodResponseFormat(ImprovementSchema, 'improvement'),
  });

  return completion.choices[0].message.parsed;
};
