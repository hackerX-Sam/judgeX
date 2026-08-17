import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create "Two Sum"
  const twoSum = await prisma.problem.upsert({
    where: { slug: 'two-sum' },
    update: {},
    create: {
      title: 'Two Sum',
      slug: 'two-sum',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
      difficulty: 'Easy',
      timeLimit: 1000,
      memoryLimit: 256,
      testCases: {
        create: [
          { input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
          { input: '3\n3 2 4\n6', expectedOutput: '1 2', isHidden: false },
          { input: '2\n3 3\n6', expectedOutput: '0 1', isHidden: false },
          { input: '4\n2 5 5 11\n10', expectedOutput: '1 2', isHidden: true },
        ],
      },
    },
  });

  // Create "Palindrome Number"
  const palindrome = await prisma.problem.upsert({
    where: { slug: 'palindrome-number' },
    update: {},
    create: {
      title: 'Palindrome Number',
      slug: 'palindrome-number',
      description: 'Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.',
      difficulty: 'Easy',
      timeLimit: 1000,
      memoryLimit: 256,
      testCases: {
        create: [
          { input: '121', expectedOutput: 'true', isHidden: false },
          { input: '-121', expectedOutput: 'false', isHidden: false },
          { input: '10', expectedOutput: 'false', isHidden: false },
          { input: '12321', expectedOutput: 'true', isHidden: true },
        ],
      },
    },
  });

  // Create "Container With Most Water"
  const containerWithMostWater = await prisma.problem.upsert({
    where: { slug: 'container-with-most-water' },
    update: {},
    create: {
      title: 'Container With Most Water',
      slug: 'container-with-most-water',
      description: 'You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `ith` line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.',
      difficulty: 'Medium',
      timeLimit: 1500,
      memoryLimit: 256,
      testCases: {
        create: [
          { input: '9\\n1 8 6 2 5 4 8 3 7', expectedOutput: '49', isHidden: false },
          { input: '2\\n1 1', expectedOutput: '1', isHidden: false },
          { input: '5\\n4 3 2 1 4', expectedOutput: '16', isHidden: true },
          { input: '3\\n1 2 1', expectedOutput: '2', isHidden: true },
        ],
      },
    },
  });

  // Create "Valid Parentheses"
  const validParentheses = await prisma.problem.upsert({
    where: { slug: 'valid-parentheses' },
    update: {},
    create: {
      title: 'Valid Parentheses',
      slug: 'valid-parentheses',
      description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
      difficulty: 'Easy',
      timeLimit: 1000,
      memoryLimit: 256,
      testCases: {
        create: [
          { input: '()', expectedOutput: 'true', isHidden: false },
          { input: '()[]{}', expectedOutput: 'true', isHidden: false },
          { input: '(]', expectedOutput: 'false', isHidden: false },
          { input: '([)]', expectedOutput: 'false', isHidden: true },
          { input: '{[]}', expectedOutput: 'true', isHidden: true },
        ],
      },
    },
  });

  console.log('Seeded problem:', twoSum.title);
  console.log('Seeded problem:', palindrome.title);
  console.log('Seeded problem:', containerWithMostWater.title);
  console.log('Seeded problem:', validParentheses.title);
  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
