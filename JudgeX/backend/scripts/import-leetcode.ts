import { PrismaClient } from '@prisma/client';
import { LeetCode } from 'leetcode-query';
import * as fs from 'fs';

const prisma = new PrismaClient();
const leetcode = new LeetCode();

// Helper to extract Input/Output test cases from HTML description
function extractTestCases(htmlContent: string) {
  const testCases = [];
  
  // A regex to match "Input:" followed by something, then "Output:" followed by something
  // We look for patterns typical in LeetCode descriptions
  const exampleRegex = /Input:[\s\S]*?Output:[\s\S]*?(?=Example|Constraints|$)/gi;
  const matches = htmlContent.match(exampleRegex);
  
  if (matches) {
    for (const match of matches) {
      // Extract the exact input and output strings
      // We strip HTML tags and try to parse the raw text
      const cleanText = match.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      
      const inputMatch = cleanText.match(/Input:\s*(.*?)\s*Output:/i);
      const outputMatch = cleanText.match(/Output:\s*(.*?)\s*(Explanation|$)/i);
      
      if (inputMatch && outputMatch) {
        testCases.push({
          input: inputMatch[1].trim(),
          expectedOutput: outputMatch[1].trim(),
          isHidden: false
        });
      }
    }
  }
  
  return testCases;
}

async function main() {
  console.log('Fetching problems from LeetCode...');
  // Fetch the first 50 questions
  const problemsResponse = await leetcode.problems({ limit: 50, offset: 0 });
  const problems = problemsResponse.questions;
  
  console.log(`Found ${problems.length} problems. Beginning import...`);

  let count = 0;
  for (const p of problems) {
    try {
      // Fetch detailed description
      const details = await leetcode.problem(p.titleSlug);
      
      if (!details || !details.content) {
        console.log(`Skipping ${p.title} - No content found`);
        continue;
      }
      
      // Parse difficulty
      let difficulty = 'Medium';
      if (p.difficulty === 'Easy') difficulty = 'Easy';
      if (p.difficulty === 'Hard') difficulty = 'Hard';

      // Create Problem record
      const createdProblem = await prisma.problem.create({
        data: {
          title: p.title,
          slug: p.titleSlug,
          description: details.content,
          difficulty: difficulty,
          timeLimit: 2000,
          memoryLimit: 256
        }
      });

      // Parse and create Test Cases
      const extractedCases = extractTestCases(details.content);
      
      // If we couldn't extract any via regex, provide a dummy one so the problem is still runnable
      if (extractedCases.length === 0) {
        extractedCases.push({
          input: '0',
          expectedOutput: '0',
          isHidden: false
        });
      }

      await prisma.testCase.createMany({
        data: extractedCases.map(tc => ({
          problemId: createdProblem.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden
        }))
      });

      console.log(`[${++count}/${problems.length}] Imported: ${p.title} (${extractedCases.length} test cases)`);
    } catch (err: any) {
      if (err.code === 'P2002') {
        console.log(`Skipping ${p.title} - Already exists in database`);
      } else {
        console.error(`Error importing ${p.title}:`, err.message);
      }
    }
  }

  console.log('Import complete! Run `npx prisma studio` to view your new problems.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
