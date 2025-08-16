import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { challengesController } from '../controllers/challenges.controller';

const router = Router();

// All challenge routes require authentication
router.use(authMiddleware);

// Challenge management
router.get('/', challengesController.getChallenges);
router.get('/trending', challengesController.getTrendingChallenges);
router.get('/user', challengesController.getUserChallenges);
router.get('/:challengeId', challengesController.getChallenge);

// Challenge participation
router.post('/:challengeId/join', challengesController.joinChallenge);
router.post('/:challengeId/leave', challengesController.leaveChallenge);
router.post('/:challengeId/progress', challengesController.updateProgress);

// Leaderboard
router.get('/:challengeId/leaderboard', challengesController.getLeaderboard);

export default router;