import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

// All analytics routes require authentication
router.use(authMiddleware);

// Get overall workout statistics
router.get('/overall-stats', analyticsController.getOverallStats);

// Get workout frequency data
// Query params: period (7, 30, 90, or 365)
router.get('/workout-frequency', analyticsController.getWorkoutFrequency);

// Get muscle group distribution
router.get('/muscle-groups', analyticsController.getMuscleGroupDistribution);

// Get progress for a specific exercise
router.get('/exercise-progress/:exerciseId', analyticsController.getExerciseProgress);

// Get personal records for all exercises
router.get('/personal-records', analyticsController.getPersonalRecords);

// Get workout trends and patterns
router.get('/trends', analyticsController.getWorkoutTrends);

export default router;