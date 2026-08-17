import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProblems = async (req: Request, res: Response) => {
  try {
    const problems = await prisma.problem.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
      },
    });
    res.status(200).json({ problems });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getProblemBySlug = async (req: Request, res: Response): Promise<any> => {
  try {
    // Replace any spaces with hyphens and lowercase it to handle manual URL entry errors
    const slug = (req.params.slug as string).replace(/ /g, '-').toLowerCase();
    const problem = await prisma.problem.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        difficulty: true,
        timeLimit: true,
        memoryLimit: true,
        createdAt: true,
        testCases: {
          where: { isHidden: false }, // Only return public test cases
          select: {
            id: true,
            input: true,
            expectedOutput: true,
          }
        }
      }
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.status(200).json({ problem });
  } catch (error) {
    console.error('Error fetching problem details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createProblem = async (req: Request, res: Response) => {
  try {
    const { title, description, difficulty, timeLimit, memoryLimit, testCases } = req.body;
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const problem = await prisma.problem.create({
      data: {
        title,
        slug,
        description,
        difficulty,
        timeLimit: parseInt(timeLimit) || 1000,
        memoryLimit: parseInt(memoryLimit) || 256,
        testCases: {
          create: testCases || [],
        },
      },
    });

    res.status(201).json({ message: 'Problem created successfully', problem });
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Internal endpoint for worker to get all test cases (including hidden)
export const getAllTestCases = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const testCases = await prisma.testCase.findMany({
      where: { problemId: id }
    });
    res.status(200).json({ testCases });
  } catch (error) {
    console.error('Error fetching all test cases:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateProblem = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { title, description, difficulty, timeLimit, memoryLimit, testCases } = req.body;

    // Check if problem exists
    const existingProblem = await prisma.problem.findUnique({ where: { id } });
    if (!existingProblem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const dataToUpdate: any = {
      description,
      difficulty,
      timeLimit: timeLimit ? parseInt(timeLimit) : undefined,
      memoryLimit: memoryLimit ? parseInt(memoryLimit) : undefined,
    };

    if (title) {
      dataToUpdate.title = title;
      dataToUpdate.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (testCases && Array.isArray(testCases)) {
      // If testCases are provided, replace them completely
      dataToUpdate.testCases = {
        deleteMany: {}, // Delete existing testcases
        create: testCases, // Create new testcases
      };
    }

    const updatedProblem = await prisma.problem.update({
      where: { id },
      data: dataToUpdate,
    });

    res.status(200).json({ message: 'Problem updated successfully', problem: updatedProblem });
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteProblem = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;

    // Prisma will cascade delete test cases and submissions automatically
    await prisma.problem.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Problem deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting problem:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
