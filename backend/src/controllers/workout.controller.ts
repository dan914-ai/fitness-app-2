import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/error.middleware';

const prisma = new PrismaClient();

export class WorkoutController {
  async createWorkout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { exercises, notes } = req.body;
      
      if (!exercises || !Array.isArray(exercises)) {
        throw new AppError('Exercises array is required', 400);
      }

      // Create workout with current timestamp
      const workout = await prisma.workout.create({
        data: {
          userId: BigInt(userId),
          workoutDate: new Date(),
          startTime: new Date(),
          notes: notes || null,
          workoutExercises: {
            create: exercises.map((exercise: any, index: number) => ({
              exerciseId: BigInt(exercise.exerciseId),
              orderInWorkout: index + 1,
              targetSets: exercise.targetSets || null,
              targetReps: exercise.targetReps || null,
              targetWeight: exercise.targetWeight || null,
              targetDuration: exercise.targetDuration || null,
              notes: exercise.notes || null
            }))
          }
        },
        include: {
          workoutExercises: {
            include: {
              exercise: true,
              exerciseSets: true
            }
          }
        }
      });

      res.status(201).json({
        workout: {
          ...workout,
          workoutId: workout.workoutId.toString(),
          userId: workout.userId.toString(),
          workoutExercises: workout.workoutExercises.map(we => ({
            ...we,
            workoutExerciseId: we.workoutExerciseId.toString(),
            workoutId: we.workoutId.toString(),
            exerciseId: we.exerciseId.toString(),
            exercise: {
              ...we.exercise,
              exerciseId: we.exercise.exerciseId.toString()
            },
            exerciseSets: we.exerciseSets.map(set => ({
              ...set,
              setId: set.setId.toString(),
              workoutExerciseId: set.workoutExerciseId.toString()
            }))
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkouts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { page = 1, limit = 10 } = req.query;

      const workouts = await prisma.workout.findMany({
        where: { userId: BigInt(userId) },
        include: {
          workoutExercises: {
            include: {
              exercise: true,
              exerciseSets: true
            }
          }
        },
        orderBy: { workoutDate: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      const total = await prisma.workout.count({
        where: { userId: BigInt(userId) }
      });

      res.json({
        workouts: workouts.map(workout => ({
          ...workout,
          workoutId: workout.workoutId.toString(),
          userId: workout.userId.toString(),
          workoutExercises: workout.workoutExercises.map(we => ({
            ...we,
            workoutExerciseId: we.workoutExerciseId.toString(),
            workoutId: we.workoutId.toString(),
            exerciseId: we.exerciseId.toString(),
            exercise: {
              ...we.exercise,
              exerciseId: we.exercise.exerciseId.toString()
            },
            exerciseSets: we.exerciseSets.map(set => ({
              ...set,
              setId: set.setId.toString(),
              workoutExerciseId: set.workoutExerciseId.toString()
            }))
          }))
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

  async getWorkoutById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const workout = await prisma.workout.findFirst({
        where: {
          workoutId: BigInt(id),
          userId: BigInt(userId)
        },
        include: {
          workoutExercises: {
            include: {
              exercise: true,
              exerciseSets: {
                orderBy: { setNumber: 'asc' }
              }
            },
            orderBy: { orderInWorkout: 'asc' }
          }
        }
      });

      if (!workout) {
        throw new AppError('Workout not found', 404);
      }

      res.json({
        workout: {
          ...workout,
          workoutId: workout.workoutId.toString(),
          userId: workout.userId.toString(),
          workoutExercises: workout.workoutExercises.map(we => ({
            ...we,
            workoutExerciseId: we.workoutExerciseId.toString(),
            workoutId: we.workoutId.toString(),
            exerciseId: we.exerciseId.toString(),
            exercise: {
              ...we.exercise,
              exerciseId: we.exercise.exerciseId.toString()
            },
            exerciseSets: we.exerciseSets.map(set => ({
              ...set,
              setId: set.setId.toString(),
              workoutExerciseId: set.workoutExerciseId.toString()
            }))
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateWorkout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { endTime, totalCalories, workoutRating, notes } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const existingWorkout = await prisma.workout.findFirst({
        where: {
          workoutId: BigInt(id),
          userId: BigInt(userId)
        }
      });

      if (!existingWorkout) {
        throw new AppError('Workout not found', 404);
      }

      const updateData: any = {};
      if (endTime) {
        updateData.endTime = new Date(endTime);
        if (existingWorkout.startTime) {
          updateData.totalDuration = Math.floor(
            (new Date(endTime).getTime() - existingWorkout.startTime.getTime()) / 1000 / 60
          );
        }
      }
      if (totalCalories !== undefined) updateData.totalCalories = totalCalories;
      if (workoutRating !== undefined) updateData.workoutRating = workoutRating;
      if (notes !== undefined) updateData.notes = notes;

      const updatedWorkout = await prisma.workout.update({
        where: { workoutId: BigInt(id) },
        data: updateData,
        include: {
          workoutExercises: {
            include: {
              exercise: true,
              exerciseSets: true
            }
          }
        }
      });

      res.json({
        workout: {
          ...updatedWorkout,
          workoutId: updatedWorkout.workoutId.toString(),
          userId: updatedWorkout.userId.toString(),
          workoutExercises: updatedWorkout.workoutExercises.map(we => ({
            ...we,
            workoutExerciseId: we.workoutExerciseId.toString(),
            workoutId: we.workoutId.toString(),
            exerciseId: we.exerciseId.toString(),
            exercise: {
              ...we.exercise,
              exerciseId: we.exercise.exerciseId.toString()
            },
            exerciseSets: we.exerciseSets.map(set => ({
              ...set,
              setId: set.setId.toString(),
              workoutExerciseId: set.workoutExerciseId.toString()
            }))
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteWorkout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const workout = await prisma.workout.findFirst({
        where: {
          workoutId: BigInt(id),
          userId: BigInt(userId)
        }
      });

      if (!workout) {
        throw new AppError('Workout not found', 404);
      }

      await prisma.workout.delete({
        where: { workoutId: BigInt(id) }
      });

      res.json({ message: 'Workout deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async addExerciseSet(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { workoutExerciseId } = req.params;
      const { reps, weight, duration, distance, restTime, isWarmup = false } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Verify workout exercise belongs to user
      const workoutExercise = await prisma.workoutExercise.findFirst({
        where: {
          workoutExerciseId: BigInt(workoutExerciseId),
          workout: { userId: BigInt(userId) }
        },
        include: { exerciseSets: true }
      });

      if (!workoutExercise) {
        throw new AppError('Workout exercise not found', 404);
      }

      const setNumber = workoutExercise.exerciseSets.length + 1;

      const exerciseSet = await prisma.exerciseSet.create({
        data: {
          workoutExerciseId: BigInt(workoutExerciseId),
          setNumber,
          reps: reps || null,
          weight: weight || null,
          duration: duration || null,
          distance: distance || null,
          restTime: restTime || null,
          isWarmup
        }
      });

      res.status(201).json({
        exerciseSet: {
          ...exerciseSet,
          setId: exerciseSet.setId.toString(),
          workoutExerciseId: exerciseSet.workoutExerciseId.toString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateExerciseSet(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { setId } = req.params;
      const { reps, weight, duration, distance, restTime, isWarmup } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Verify set belongs to user
      const existingSet = await prisma.exerciseSet.findFirst({
        where: {
          setId: BigInt(setId),
          workoutExercise: {
            workout: { userId: BigInt(userId) }
          }
        }
      });

      if (!existingSet) {
        throw new AppError('Exercise set not found', 404);
      }

      const updateData: any = {};
      if (reps !== undefined) updateData.reps = reps;
      if (weight !== undefined) updateData.weight = weight;
      if (duration !== undefined) updateData.duration = duration;
      if (distance !== undefined) updateData.distance = distance;
      if (restTime !== undefined) updateData.restTime = restTime;
      if (isWarmup !== undefined) updateData.isWarmup = isWarmup;

      const updatedSet = await prisma.exerciseSet.update({
        where: { setId: BigInt(setId) },
        data: updateData
      });

      res.json({
        exerciseSet: {
          ...updatedSet,
          setId: updatedSet.setId.toString(),
          workoutExerciseId: updatedSet.workoutExerciseId.toString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteExerciseSet(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { setId } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Verify set belongs to user
      const existingSet = await prisma.exerciseSet.findFirst({
        where: {
          setId: BigInt(setId),
          workoutExercise: {
            workout: { userId: BigInt(userId) }
          }
        }
      });

      if (!existingSet) {
        throw new AppError('Exercise set not found', 404);
      }

      await prisma.exerciseSet.delete({
        where: { setId: BigInt(setId) }
      });

      res.json({ message: 'Exercise set deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Workout Session Methods
  async startWorkoutSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { routineId, routineName } = req.body;
      
      if (!routineId || !routineName) {
        throw new AppError('Routine ID and name are required', 400);
      }

      // Check for active session
      const activeSession = await prisma.workout.findFirst({
        where: {
          userId: BigInt(userId),
          endTime: null
        }
      });

      if (activeSession) {
        throw new AppError('You already have an active workout session', 400);
      }

      // Create new workout session
      const workout = await prisma.workout.create({
        data: {
          userId: BigInt(userId),
          workoutDate: new Date(),
          startTime: new Date(),
          routineId: routineId,
          notes: `Workout session for ${routineName}`
        }
      });

      res.status(201).json({
        workout: {
          workoutId: workout.workoutId.toString(),
          userId: workout.userId.toString(),
          routineId: workout.routineId,
          startTime: workout.startTime,
          routineName
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async endWorkoutSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { workoutId } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const workout = await prisma.workout.findFirst({
        where: {
          workoutId: BigInt(workoutId),
          userId: BigInt(userId),
          endTime: null
        },
        include: {
          workoutExercises: {
            include: {
              exerciseSets: true
            }
          }
        }
      });

      if (!workout) {
        throw new AppError('Active workout session not found', 404);
      }

      // Calculate totals
      const totalDuration = Math.floor((new Date().getTime() - workout.startTime.getTime()) / 60000); // minutes
      const totalSets = workout.workoutExercises.reduce((sum, we) => sum + we.exerciseSets.length, 0);
      const totalCalories = Math.floor(totalDuration * 5); // Simple estimate

      // Update workout with end time and totals
      const updatedWorkout = await prisma.workout.update({
        where: { workoutId: BigInt(workoutId) },
        data: {
          endTime: new Date(),
          totalDuration,
          totalCalories,
          workoutRating: 5 // Default rating, can be updated later
        }
      });

      res.json({
        workout: {
          ...updatedWorkout,
          workoutId: updatedWorkout.workoutId.toString(),
          userId: updatedWorkout.userId.toString(),
          routineId: updatedWorkout.routineId,
          totalSets
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getActiveSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const activeSession = await prisma.workout.findFirst({
        where: {
          userId: BigInt(userId),
          endTime: null
        },
        include: {
          workoutExercises: {
            include: {
              exercise: true,
              exerciseSets: true
            }
          }
        }
      });

      if (!activeSession) {
        res.json({ activeSession: null });
        return;
      }

      res.json({
        activeSession: {
          ...activeSession,
          workoutId: activeSession.workoutId.toString(),
          userId: activeSession.userId.toString(),
          routineId: activeSession.routineId,
          workoutExercises: activeSession.workoutExercises.map(we => ({
            ...we,
            workoutExerciseId: we.workoutExerciseId.toString(),
            workoutId: we.workoutId.toString(),
            exerciseId: we.exerciseId.toString(),
            exercise: {
              ...we.exercise,
              exerciseId: we.exercise.exerciseId.toString()
            },
            exerciseSets: we.exerciseSets.map(set => ({
              ...set,
              setId: set.setId.toString(),
              workoutExerciseId: set.workoutExerciseId.toString()
            }))
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async addExerciseToSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { workoutId } = req.params;
      const { exerciseId } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Verify workout belongs to user and is active
      const workout = await prisma.workout.findFirst({
        where: {
          workoutId: BigInt(workoutId),
          userId: BigInt(userId),
          endTime: null
        },
        include: {
          workoutExercises: true
        }
      });

      if (!workout) {
        throw new AppError('Active workout session not found', 404);
      }

      // Add exercise to workout
      const workoutExercise = await prisma.workoutExercise.create({
        data: {
          workoutId: BigInt(workoutId),
          exerciseId: BigInt(exerciseId),
          orderInWorkout: workout.workoutExercises.length + 1
        },
        include: {
          exercise: true
        }
      });

      res.status(201).json({
        workoutExercise: {
          ...workoutExercise,
          workoutExerciseId: workoutExercise.workoutExerciseId.toString(),
          workoutId: workoutExercise.workoutId.toString(),
          exerciseId: workoutExercise.exerciseId.toString(),
          exercise: {
            ...workoutExercise.exercise,
            exerciseId: workoutExercise.exercise.exerciseId.toString()
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async removeExerciseFromSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { workoutId, workoutExerciseId } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Verify workout belongs to user and is active
      const workoutExercise = await prisma.workoutExercise.findFirst({
        where: {
          workoutExerciseId: BigInt(workoutExerciseId),
          workoutId: BigInt(workoutId),
          workout: {
            userId: BigInt(userId),
            endTime: null
          }
        }
      });

      if (!workoutExercise) {
        throw new AppError('Exercise not found in active workout session', 404);
      }

      // Delete exercise and its sets
      await prisma.workoutExercise.delete({
        where: { workoutExerciseId: BigInt(workoutExerciseId) }
      });

      res.json({ message: 'Exercise removed from workout session' });
    } catch (error) {
      next(error);
    }
  }

  async updateSessionExerciseSets(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { workoutExerciseId } = req.params;
      const { sets } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Verify exercise belongs to user's active workout
      const workoutExercise = await prisma.workoutExercise.findFirst({
        where: {
          workoutExerciseId: BigInt(workoutExerciseId),
          workout: {
            userId: BigInt(userId),
            endTime: null
          }
        },
        include: {
          exerciseSets: true
        }
      });

      if (!workoutExercise) {
        throw new AppError('Exercise not found in active workout session', 404);
      }

      // Delete existing sets
      await prisma.exerciseSet.deleteMany({
        where: { workoutExerciseId: BigInt(workoutExerciseId) }
      });

      // Create new sets
      const createdSets = await Promise.all(
        sets.map((set: any, index: number) =>
          prisma.exerciseSet.create({
            data: {
              workoutExerciseId: BigInt(workoutExerciseId),
              setNumber: index + 1,
              reps: set.reps ? parseInt(set.reps) : null,
              weight: set.weight ? parseFloat(set.weight) : null,
              isWarmup: set.type === 'Warmup',
              restTime: set.restTime || null
            }
          })
        )
      );

      res.json({
        sets: createdSets.map(set => ({
          ...set,
          setId: set.setId.toString(),
          workoutExerciseId: set.workoutExerciseId.toString()
        }))
      });
    } catch (error) {
      next(error);
    }
  }
}