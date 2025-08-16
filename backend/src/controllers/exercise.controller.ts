import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/error.middleware';

const prisma = new PrismaClient();

export class ExerciseController {
  async getExercises(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, muscleGroup, equipment, page = 1, limit = 20 } = req.query;

      const where: any = {};
      if (category) where.category = category;
      if (muscleGroup) where.muscleGroup = muscleGroup;
      if (equipment) where.equipment = equipment;

      const exercises = await prisma.exercise.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: {
          exerciseId: true,
          exerciseName: true,
          category: true,
          muscleGroup: true,
          equipment: true,
          difficulty: true,
          imageUrl: true
        }
      });

      const total = await prisma.exercise.count({ where });

      res.json({
        exercises: exercises.map(e => ({
          ...e,
          exerciseId: e.exerciseId.toString()
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async searchExercises(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;

      if (!q) {
        throw new AppError('Search query is required', 400);
      }

      const exercises = await prisma.exercise.findMany({
        where: {
          OR: [
            { exerciseName: { contains: String(q), mode: 'insensitive' } },
            { muscleGroup: { contains: String(q), mode: 'insensitive' } }
          ]
        },
        take: 10,
        select: {
          exerciseId: true,
          exerciseName: true,
          category: true,
          muscleGroup: true,
          equipment: true,
          difficulty: true
        }
      });

      res.json({
        exercises: exercises.map(e => ({
          ...e,
          exerciseId: e.exerciseId.toString()
        }))
      });
    } catch (error) {
      next(error);
    }
  }

  async getExerciseById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const exercise = await prisma.exercise.findUnique({
        where: { exerciseId: BigInt(id) }
      });

      if (!exercise) {
        throw new AppError('Exercise not found', 404);
      }

      res.json({
        ...exercise,
        exerciseId: exercise.exerciseId.toString()
      });
    } catch (error) {
      next(error);
    }
  }
}