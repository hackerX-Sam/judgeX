import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with rich LeetCode-style problem statements...');

  // 1. Two Sum
  const twoSumDesc = `Given an array of integers \`nums\` and an integer \`target\`, return **indices of the two numbers** such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

---

### Visual Explanation Graph

\`\`\`text
Array:  [ 2 ,  7 , 11 , 15 ]
Index:    0    1    2    3
Target: 9

Step 1: Check nums[0] + nums[1] -> 2 + 7 = 9 (Match!)
Return: [0, 1]
\`\`\`

---

### Constraints
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- **Only one valid answer exists.**

---

### Follow-up
Can you come up with an algorithm that is less than \`O(n^2)\` time complexity?`;

  const twoSum = await prisma.problem.upsert({
    where: { slug: 'two-sum' },
    update: {
      title: 'Two Sum',
      description: twoSumDesc,
      difficulty: 'Easy',
      timeLimit: 1000,
      memoryLimit: 256,
    },
    create: {
      title: 'Two Sum',
      slug: 'two-sum',
      description: twoSumDesc,
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

  // 2. Palindrome Number
  const palindromeDesc = `Given an integer \`x\`, return \`true\` if \`x\` is a **palindrome**, and \`false\` otherwise.

An integer is a **palindrome** when it reads the same backward as forward. For example, \`121\` is a palindrome while \`123\` is not.

---

### Visual Symmetry Flow

\`\`\`text
Input: x = 121
Read Forward:  1 -> 2 -> 1
Read Backward: 1 -> 2 -> 1
Result: true (Symmetric!)

Input: x = -121
Read Forward:  - -> 1 -> 2 -> 1
Read Backward: 1 -> 2 -> 1 -> -
Result: false (Negative sign breaks symmetry)
\`\`\`

---

### Constraints
- \`-2^31 <= x <= 2^31 - 1\`

---

### Follow-up
Could you solve it without converting the integer to a string?`;

  const palindrome = await prisma.problem.upsert({
    where: { slug: 'palindrome-number' },
    update: {
      title: 'Palindrome Number',
      description: palindromeDesc,
      difficulty: 'Easy',
      timeLimit: 1000,
      memoryLimit: 256,
    },
    create: {
      title: 'Palindrome Number',
      slug: 'palindrome-number',
      description: palindromeDesc,
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

  // 3. Container With Most Water
  const containerDesc = `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i-th\` line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the **most water**.

Return *the maximum amount of water a container can store*.

---

### Visual Height Diagram

\`\`\`text
8 |     |                       |
7 |     |                       |       |
6 |     |   |                   |       |
5 |     |   |       |           |       |
4 |     |   |       |   |       |       |
3 |     |   |       |   |   |   |       |
2 |     |   |   |   |   |   |   |       |
1 | |   |   |   |   |   |   |   |   |   |
  +---+---+---+---+---+---+---+---+---+---
i   0   1   2   3   4   5   6   7   8
h   1   8   6   2   5   4   8   3   7

Max Area = min(height[1], height[8]) * (8 - 1)
         = min(8, 7) * 7
         = 7 * 7 = 49
\`\`\`

---

### Constraints
- \`n == height.length\`
- \`2 <= n <= 10^5\`
- \`0 <= height[i] <= 10^4\``;

  const containerWithMostWater = await prisma.problem.upsert({
    where: { slug: 'container-with-most-water' },
    update: {
      title: 'Container With Most Water',
      description: containerDesc,
      difficulty: 'Medium',
 timeLimit: 1500,
      memoryLimit: 256,
    },
    create: {
      title: 'Container With Most Water',
      slug: 'container-with-most-water',
      description: containerDesc,
      difficulty: 'Medium',
      timeLimit: 1500,
      memoryLimit: 256,
      testCases: {
        create: [
          { input: '9\n1 8 6 2 5 4 8 3 7', expectedOutput: '49', isHidden: false },
          { input: '2\n1 1', expectedOutput: '1', isHidden: false },
          { input: '5\n4 3 2 1 4', expectedOutput: '16', isHidden: true },
          { input: '3\n1 2 1', expectedOutput: '2', isHidden: true },
        ],
      },
    },
  });

  // 4. Valid Parentheses
  const parenthesesDesc = `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

---

### Stack Traversal Graph

\`\`\`text
Input: s = "{[]}"

1. Push '{' -> Stack: ['{']
2. Push '[' -> Stack: ['{', '[']
3. Read ']' -> Matches top '[' -> Pop -> Stack: ['{']
4. Read '}' -> Matches top '{' -> Pop -> Stack: []

Stack is empty at end -> Return true ✅
\`\`\`

---

### Constraints
- \`1 <= s.length <= 10^4\`
- \`s\` consists of parentheses only \`()[]{}\`.`;

  const validParentheses = await prisma.problem.upsert({
    where: { slug: 'valid-parentheses' },
    update: {
      title: 'Valid Parentheses',
      description: parenthesesDesc,
      difficulty: 'Easy',
      timeLimit: 1000,
      memoryLimit: 256,
    },
    create: {
      title: 'Valid Parentheses',
      slug: 'valid-parentheses',
      description: parenthesesDesc,
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

  // 5. Pow(x, n)
  const powDesc = `Implement **pow(x, n)**, which calculates \`x\` raised to the power \`n\` (i.e., \`x^n\`).

---

### Visual Calculation Example

\`\`\`text
Input: x = 2.00000, n = 10
Calculation: 2^10 = 1024.00000

Input: x = 2.10000, n = 3
Calculation: 2.1 * 2.1 * 2.1 = 9.26100

Input: x = 2.00000, n = -2
Calculation: 2^-2 = 1 / (2^2) = 1 / 4 = 0.25000
\`\`\`

---

### Constraints
- \`-100.0 < x < 100.0\`
- \`-2^31 <= n <= 2^31 - 1\`
- \`n\` is an integer.
- Either \`x\` is not zero or \`n > 0\`.
- \`-10^4 <= x^n <= 10^4\``;

  const powXN = await prisma.problem.upsert({
    where: { slug: 'powx-n' },
    update: {
      title: 'Pow(x, n)',
      description: powDesc,
      difficulty: 'Medium',
      timeLimit: 1000,
      memoryLimit: 256,
    },
    create: {
      title: 'Pow(x, n)',
      slug: 'powx-n',
      description: powDesc,
      difficulty: 'Medium',
      timeLimit: 1000,
      memoryLimit: 256,
      testCases: {
        create: [
          { input: '2.00000 10', expectedOutput: '1024.00000', isHidden: false },
          { input: '2.10000 3', expectedOutput: '9.26100', isHidden: false },
          { input: '2.00000 -2', expectedOutput: '0.25000', isHidden: false },
        ],
      },
    },
  });

  console.log('Successfully updated seeded problem:', twoSum.title);
  console.log('Successfully updated seeded problem:', palindrome.title);
  console.log('Successfully updated seeded problem:', containerWithMostWater.title);
  console.log('Successfully updated seeded problem:', validParentheses.title);
  console.log('Successfully updated seeded problem:', powXN.title);
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
