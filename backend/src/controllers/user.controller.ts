import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/error.middleware';

const prisma = new PrismaClient();

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await prisma.user.findUnique({
        where: { userId: BigInt(userId) },
        select: {
          userId: true,
          username: true,
          email: true,
          profileImageUrl: true,
          bio: true,
          height: true,
          weight: true,
          birthDate: true,
          gender: true,
          userTier: true,
          totalPoints: true,
          createdAt: true,
          _count: {
            select: {
              workouts: true,
              followersRelation: true,
              followingRelation: true
            }
          }
        }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        ...user,
        userId: user.userId.toString(),
        workoutCount: user._count.workouts,
        followersCount: user._count.followersRelation,
        followingCount: user._count.followingRelation
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { bio, height, weight, birthDate, gender } = req.body;

      const updatedUser = await prisma.user.update({
        where: { userId: BigInt(userId) },
        data: {
          bio,
          height: height ? parseFloat(height) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          gender
        },
        select: {
          userId: true,
          username: true,
          email: true,
          profileImageUrl: true,
          bio: true,
          height: true,
          weight: true,
          birthDate: true,
          gender: true,
          userTier: true,
          totalPoints: true
        }
      });

      res.json({
        message: 'Profile updated successfully',
        user: {
          ...updatedUser,
          userId: updatedUser.userId.toString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Get workout statistics
      const totalWorkouts = await prisma.workout.count({
        where: { userId: BigInt(userId) }
      });

      const currentMonth = new Date();
      currentMonth.setDate(1);
      
      const monthlyWorkouts = await prisma.workout.count({
        where: {
          userId: BigInt(userId),
          workoutDate: {
            gte: currentMonth
          }
        }
      });

      // Get achievement count
      const achievements = await prisma.userAchievement.count({
        where: { userId: BigInt(userId) }
      });

      // Get active goals
      const activeGoals = await prisma.goal.count({
        where: {
          userId: BigInt(userId),
          isAchieved: false
        }
      });

      res.json({
        totalWorkouts,
        monthlyWorkouts,
        achievements,
        activeGoals
      });
    } catch (error) {
      next(error);
    }
  }
}