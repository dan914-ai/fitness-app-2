import { Router } from 'express';
import { ExerciseController } from '../controllers/exercise.controller';

const router = Router();
const exerciseController = new ExerciseController();

router.get('/', exerciseController.getExercises);
router.get('/search', exerciseController.searchExercises);
router.get('/:id', exerciseController.getExerciseById);

export default router;