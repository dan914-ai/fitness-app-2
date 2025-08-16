import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/error.middleware';

const prisma = new PrismaClient();

export class AnalyticsController {
  async getOverallStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Get total workouts
      const totalWorkouts = await prisma.workout.count({
        where: { 
          userId: BigInt(userId),
          endTime: { not: null } // Only completed workouts
        }
      });

      // Get total volume (sum of weight * reps for all sets)
      const volumeData = await prisma.$queryRaw<Array<{ total_volume: bigint | null }>>`
        SELECT SUM(es.weight * es.reps) as total_volume
        FROM exercise_sets es
        JOIN workout_exercises we ON es.workout_exercise_id = we.workout_exercise_id
        JOIN workouts w ON we.workout_id = w.workout_id
        WHERE w.user_id = ${BigInt(userId)}
        AND w.end_time IS NOT NULL
        AND es.weight IS NOT NULL
        AND es.reps IS NOT NULL
      `;
      
      const totalVolume = volumeData[0]?.total_volume ? Number(volumeData[0].total_volume) : 0;

      // Get average duration
      const durationData = await prisma.workout.aggregate({
        where: { 
          userId: BigInt(userId),
          endTime: { not: null },
          totalDuration: { not: null }
        },
        _avg: {
          totalDuration: true
        }
      });

      // Calculate current streak
      const recentWorkouts = await prisma.workout.findMany({
        where: { 
          userId: BigInt(userId),
          endTime: { not: null }
        },
        orderBy: { workoutDate: 'desc' },
        select: { workoutDate: true }
      });

      let currentStreak = 0;
      if (recentWorkouts.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let lastDate = new Date(recentWorkouts[0].workoutDate);
        lastDate.setHours(0, 0, 0, 0);
        
        // Check if last workout was today or yesterday
        const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 1) {
          currentStreak = 1;
          
          // Count consecutive days
          for (let i = 1; i < recentWorkouts.length; i++) {
            const currentDate = new Date(recentWorkouts[i].workoutDate);
            currentDate.setHours(0, 0, 0, 0);
            
            const diff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
              currentStreak++;
              lastDate = currentDate;
            } else {
              break;
            }
          }
        }
      }

      res.json({
        stats: {
          totalWorkouts,
          totalVolume,
          averageDuration: Math.round(durationData._avg.totalDuration || 0),
          currentStreak
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkoutFrequency(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const period = parseInt(req.query.period as string) || 30;
      const validPeriods = [7, 30, 90, 365];
      if (!validPeriods.includes(period)) {
        throw new AppError('Invalid period. Use 7, 30, 90, or 365', 400);
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      startDate.setHours(0, 0, 0, 0);

      // Get workouts in the period
      const workouts = await prisma.workout.findMany({
        where: {
          userId: BigInt(userId),
          endTime: { not: null },
          workoutDate: { gte: startDate }
        },
        select: { workoutDate: true }
      });

      // Group by date
      const frequencyMap = new Map<string, number>();
      workouts.forEach(workout => {
        const dateStr = workout.workoutDate.toISOString().split('T')[0];
        frequencyMap.set(dateStr, (frequencyMap.get(dateStr) || 0) + 1);
      });

      // Calculate statistics
      const totalDays = period;
      const daysWithWorkouts = frequencyMap.size;
      const totalWorkouts = workouts.length;
      const averagePerWeek = (totalWorkouts / period) * 7;

      // Create daily/weekly/monthly data
      let groupedData: { date: string; count: number }[] = [];
      
      if (period <= 30) {
        // Daily data for 7 and 30 day periods
        for (let i = 0; i < period; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          groupedData.push({
            date: dateStr,
            count: frequencyMap.get(dateStr) || 0
          });
        }
        groupedData.reverse();
      } else if (period === 90) {
        // Weekly data for 90 day period
        const weeks = new Map<string, number>();
        frequencyMap.forEach((count, dateStr) => {
          const date = new Date(dateStr);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekStr = weekStart.toISOString().split('T')[0];
          weeks.set(weekStr, (weeks.get(weekStr) || 0) + count);
        });
        
        groupedData = Array.from(weeks.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));
      } else {
        // Monthly data for 365 day period
        const months = new Map<string, number>();
        frequencyMap.forEach((count, dateStr) => {
          const date = new Date(dateStr);
          const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          months.set(monthStr, (months.get(monthStr) || 0) + count);
        });
        
        groupedData = Array.from(months.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));
      }

      res.json({
        frequency: {
          period,
          totalWorkouts,
          daysWithWorkouts,
          averagePerWeek: Math.round(averagePerWeek * 10) / 10,
          data: groupedData
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMuscleGroupDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Get muscle group distribution
      const distribution = await prisma.$queryRaw<Array<{
        muscle_group: string;
        exercise_count: bigint;
        set_count: bigint;
        total_volume: bigint | null;
      }>>`
        SELECT 
          e.muscle_group,
          COUNT(DISTINCT we.workout_exercise_id) as exercise_count,
          COUNT(DISTINCT es.set_id) as set_count,
          SUM(es.weight * es.reps) as total_volume
        FROM exercises e
        JOIN workout_exercises we ON e.exercise_id = we.exercise_id
        JOIN workouts w ON we.workout_id = w.workout_id
        LEFT JOIN exercise_sets es ON we.workout_exercise_id = es.workout_exercise_id
        WHERE w.user_id = ${BigInt(userId)}
        AND w.end_time IS NOT NULL
        GROUP BY e.muscle_group
        ORDER BY exercise_count DESC
      `;

      // Calculate percentages
      const totalExercises = distribution.reduce((sum, item) => sum + Number(item.exercise_count), 0);
      const totalSets = distribution.reduce((sum, item) => sum + Number(item.set_count), 0);
      const totalVolume = distribution.reduce((sum, item) => sum + Number(item.total_volume || 0), 0);

      const formattedDistribution = distribution.map(item => ({
        muscleGroup: item.muscle_group,
        exerciseCount: Number(item.exercise_count),
        exercisePercentage: totalExercises > 0 ? Math.round((Number(item.exercise_count) / totalExercises) * 100) : 0,
        setCount: Number(item.set_count),
        setPercentage: totalSets > 0 ? Math.round((Number(item.set_count) / totalSets) * 100) : 0,
        totalVolume: Number(item.total_volume || 0),
        volumePercentage: totalVolume > 0 ? Math.round((Number(item.total_volume || 0) / totalVolume) * 100) : 0
      }));

      res.json({
        distribution: formattedDistribution,
        totals: {
          totalExercises,
          totalSets,
          totalVolume
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getExerciseProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { exerciseId } = req.params;
      
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Verify exercise exists
      const exercise = await prisma.exercise.findUnique({
        where: { exerciseId: BigInt(exerciseId) }
      });

      if (!exercise) {
        throw new AppError('Exercise not found', 404);
      }

      // Get progress data
      const progressData = await prisma.$queryRaw<Array<{
        workout_date: Date;
        max_weight: number | null;
        max_reps: number | null;
        total_sets: bigint;
        total_volume: number | null;
        avg_reps: number | null;
      }>>`
        SELECT 
          w.workout_date,
          MAX(es.weight) as max_weight,
          MAX(es.reps) as max_reps,
          COUNT(es.set_id) as total_sets,
          SUM(es.weight * es.reps) as total_volume,
          AVG(es.reps) as avg_reps
        FROM workouts w
        JOIN workout_exercises we ON w.workout_id = we.workout_id
        JOIN exercise_sets es ON we.workout_exercise_id = es.workout_exercise_id
        WHERE w.user_id = ${BigInt(userId)}
        AND we.exercise_id = ${BigInt(exerciseId)}
        AND w.end_time IS NOT NULL
        AND es.is_warmup = false
        GROUP BY w.workout_date, w.workout_id
        ORDER BY w.workout_date ASC
      `;

      // Calculate trends
      let maxWeightTrend = 'stable';
      let volumeTrend = 'stable';
      
      if (progressData.length >= 2) {
        const recentData = progressData.slice(-5); // Last 5 workouts
        const oldData = progressData.slice(0, 5); // First 5 workouts
        
        const recentMaxWeight = Math.max(...recentData.map(d => d.max_weight || 0));
        const oldMaxWeight = Math.max(...oldData.map(d => d.max_weight || 0));
        
        const recentAvgVolume = recentData.reduce((sum, d) => sum + (d.total_volume || 0), 0) / recentData.length;
        const oldAvgVolume = oldData.reduce((sum, d) => sum + (d.total_volume || 0), 0) / oldData.length;
        
        if (recentMaxWeight > oldMaxWeight * 1.05) maxWeightTrend = 'increasing';
        else if (recentMaxWeight < oldMaxWeight * 0.95) maxWeightTrend = 'decreasing';
        
        if (recentAvgVolume > oldAvgVolume * 1.05) volumeTrend = 'increasing';
        else if (recentAvgVolume < oldAvgVolume * 0.95) volumeTrend = 'decreasing';
      }

      const formattedProgress = progressData.map(data => ({
        date: data.workout_date.toISOString().split('T')[0],
        maxWeight: data.max_weight || 0,
        maxReps: data.max_reps || 0,
        totalSets: Number(data.total_sets),
        totalVolume: data.total_volume || 0,
        avgReps: Math.round(data.avg_reps || 0)
      }));

      res.json({
        exercise: {
          exerciseId: exercise.exerciseId.toString(),
          exerciseName: exercise.exerciseName,
          muscleGroup: exercise.muscleGroup
        },
        progress: formattedProgress,
        trends: {
          maxWeightTrend,
          volumeTrend
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getPersonalRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Get personal records for each exercise
      const records = await prisma.$queryRaw<Array<{
        exercise_id: bigint;
        exercise_name: string;
        muscle_group: string;
        max_weight: number | null;
        max_weight_date: Date | null;
        max_reps: number | null;
        max_reps_date: Date | null;
        max_volume: number | null;
        max_volume_date: Date | null;
        total_workouts: bigint;
      }>>`
        WITH exercise_stats AS (
          SELECT 
            e.exercise_id,
            e.exercise_name,
            e.muscle_group,
            es.weight,
            es.reps,
            es.weight * es.reps as volume,
            w.workout_date
          FROM exercises e
          JOIN workout_exercises we ON e.exercise_id = we.exercise_id
          JOIN workouts w ON we.workout_id = w.workout_id
          JOIN exercise_sets es ON we.workout_exercise_id = es.workout_exercise_id
          WHERE w.user_id = ${BigInt(userId)}
          AND w.end_time IS NOT NULL
          AND es.is_warmup = false
          AND es.weight IS NOT NULL
          AND es.reps IS NOT NULL
        ),
        max_weight_data AS (
          SELECT DISTINCT ON (exercise_id)
            exercise_id,
            weight as max_weight,
            workout_date as max_weight_date
          FROM exercise_stats
          ORDER BY exercise_id, weight DESC, workout_date DESC
        ),
        max_reps_data AS (
          SELECT DISTINCT ON (exercise_id)
            exercise_id,
            reps as max_reps,
            workout_date as max_reps_date
          FROM exercise_stats
          ORDER BY exercise_id, reps DESC, workout_date DESC
        ),
        max_volume_data AS (
          SELECT DISTINCT ON (exercise_id)
            exercise_id,
            volume as max_volume,
            workout_date as max_volume_date
          FROM exercise_stats
          ORDER BY exercise_id, volume DESC, workout_date DESC
        ),
        workout_counts AS (
          SELECT 
            e.exercise_id,
            COUNT(DISTINCT w.workout_id) as total_workouts
          FROM exercises e
          JOIN workout_exercises we ON e.exercise_id = we.exercise_id
          JOIN workouts w ON we.workout_id = w.workout_id
          WHERE w.user_id = ${BigInt(userId)}
          AND w.end_time IS NOT NULL
          GROUP BY e.exercise_id
        )
        SELECT 
          e.exercise_id,
          e.exercise_name,
          e.muscle_group,
          mw.max_weight,
          mw.max_weight_date,
          mr.max_reps,
          mr.max_reps_date,
          mv.max_volume,
          mv.max_volume_date,
          wc.total_workouts
        FROM exercises e
        JOIN workout_counts wc ON e.exercise_id = wc.exercise_id
        LEFT JOIN max_weight_data mw ON e.exercise_id = mw.exercise_id
        LEFT JOIN max_reps_data mr ON e.exercise_id = mr.exercise_id
        LEFT JOIN max_volume_data mv ON e.exercise_id = mv.exercise_id
        ORDER BY wc.total_workouts DESC, e.exercise_name
      `;

      const formattedRecords = records.map(record => ({
        exerciseId: record.exercise_id.toString(),
        exerciseName: record.exercise_name,
        muscleGroup: record.muscle_group,
        records: {
          maxWeight: record.max_weight ? {
            value: record.max_weight,
            date: record.max_weight_date?.toISOString().split('T')[0] || null
          } : null,
          maxReps: record.max_reps ? {
            value: record.max_reps,
            date: record.max_reps_date?.toISOString().split('T')[0] || null
          } : null,
          maxVolume: record.max_volume ? {
            value: record.max_volume,
            date: record.max_volume_date?.toISOString().split('T')[0] || null
          } : null
        },
        totalWorkouts: Number(record.total_workouts)
      }));

      res.json({
        personalRecords: formattedRecords
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkoutTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Get workout trends for the last 12 weeks
      const twelveWeeksAgo = new Date();
      twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

      // Weekly workout data
      const weeklyData = await prisma.$queryRaw<Array<{
        week_start: Date;
        workout_count: bigint;
        total_duration: number | null;
        total_volume: number | null;
        avg_sets_per_workout: number | null;
        unique_exercises: bigint;
      }>>`
        WITH weekly_workouts AS (
          SELECT 
            DATE_TRUNC('week', w.workout_date) as week_start,
            w.workout_id,
            w.total_duration,
            COUNT(DISTINCT we.exercise_id) as unique_exercises,
            COUNT(DISTINCT es.set_id) as total_sets,
            SUM(es.weight * es.reps) as workout_volume
          FROM workouts w
          LEFT JOIN workout_exercises we ON w.workout_id = we.workout_id
          LEFT JOIN exercise_sets es ON we.workout_exercise_id = es.workout_exercise_id
          WHERE w.user_id = ${BigInt(userId)}
          AND w.end_time IS NOT NULL
          AND w.workout_date >= ${twelveWeeksAgo}
          GROUP BY DATE_TRUNC('week', w.workout_date), w.workout_id, w.total_duration
        )
        SELECT 
          week_start,
          COUNT(workout_id) as workout_count,
          SUM(total_duration) as total_duration,
          SUM(workout_volume) as total_volume,
          AVG(total_sets) as avg_sets_per_workout,
          AVG(unique_exercises) as unique_exercises
        FROM weekly_workouts
        GROUP BY week_start
        ORDER BY week_start ASC
      `;

      // Most frequent workout days
      const dayFrequency = await prisma.$queryRaw<Array<{
        day_of_week: number;
        workout_count: bigint;
      }>>`
        SELECT 
          EXTRACT(DOW FROM workout_date) as day_of_week,
          COUNT(*) as workout_count
        FROM workouts
        WHERE user_id = ${BigInt(userId)}
        AND end_time IS NOT NULL
        AND workout_date >= ${twelveWeeksAgo}
        GROUP BY EXTRACT(DOW FROM workout_date)
        ORDER BY workout_count DESC
      `;

      // Most popular exercises
      const popularExercises = await prisma.$queryRaw<Array<{
        exercise_id: bigint;
        exercise_name: string;
        usage_count: bigint;
      }>>`
        SELECT 
          e.exercise_id,
          e.exercise_name,
          COUNT(DISTINCT w.workout_id) as usage_count
        FROM exercises e
        JOIN workout_exercises we ON e.exercise_id = we.exercise_id
        JOIN workouts w ON we.workout_id = w.workout_id
        WHERE w.user_id = ${BigInt(userId)}
        AND w.end_time IS NOT NULL
        AND w.workout_date >= ${twelveWeeksAgo}
        GROUP BY e.exercise_id, e.exercise_name
        ORDER BY usage_count DESC
        LIMIT 10
      `;

      // Calculate trends
      const recentWeeks = weeklyData.slice(-4);
      const olderWeeks = weeklyData.slice(0, 4);
      
      let frequencyTrend = 'stable';
      let volumeTrend = 'stable';
      let durationTrend = 'stable';
      
      if (recentWeeks.length > 0 && olderWeeks.length > 0) {
        const recentAvgWorkouts = recentWeeks.reduce((sum, w) => sum + Number(w.workout_count), 0) / recentWeeks.length;
        const olderAvgWorkouts = olderWeeks.reduce((sum, w) => sum + Number(w.workout_count), 0) / olderWeeks.length;
        
        const recentAvgVolume = recentWeeks.reduce((sum, w) => sum + (w.total_volume || 0), 0) / recentWeeks.length;
        const olderAvgVolume = olderWeeks.reduce((sum, w) => sum + (w.total_volume || 0), 0) / olderWeeks.length;
        
        const recentAvgDuration = recentWeeks.reduce((sum, w) => sum + (w.total_duration || 0), 0) / recentWeeks.length;
        const olderAvgDuration = olderWeeks.reduce((sum, w) => sum + (w.total_duration || 0), 0) / olderWeeks.length;
        
        if (recentAvgWorkouts > olderAvgWorkouts * 1.1) frequencyTrend = 'increasing';
        else if (recentAvgWorkouts < olderAvgWorkouts * 0.9) frequencyTrend = 'decreasing';
        
        if (recentAvgVolume > olderAvgVolume * 1.1) volumeTrend = 'increasing';
        else if (recentAvgVolume < olderAvgVolume * 0.9) volumeTrend = 'decreasing';
        
        if (recentAvgDuration > olderAvgDuration * 1.1) durationTrend = 'increasing';
        else if (recentAvgDuration < olderAvgDuration * 0.9) durationTrend = 'decreasing';
      }

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      res.json({
        trends: {
          weeklyData: weeklyData.map(week => ({
            weekStart: week.week_start.toISOString().split('T')[0],
            workoutCount: Number(week.workout_count),
            totalDuration: week.total_duration || 0,
            totalVolume: week.total_volume || 0,
            avgSetsPerWorkout: Math.round(week.avg_sets_per_workout || 0),
            uniqueExercises: Number(week.unique_exercises)
          })),
          dayFrequency: dayFrequency.map(day => ({
            dayOfWeek: dayNames[Number(day.day_of_week)],
            workoutCount: Number(day.workout_count)
          })),
          popularExercises: popularExercises.map(ex => ({
            exerciseId: ex.exercise_id.toString(),
            exerciseName: ex.exercise_name,
            usageCount: Number(ex.usage_count)
          })),
          overallTrends: {
            frequencyTrend,
            volumeTrend,
            durationTrend
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}