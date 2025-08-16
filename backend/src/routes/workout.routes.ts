import { Router } from 'express';
import { WorkoutController } from '../controllers/workout.controller';

const router = Router();
const workoutController = new WorkoutController();

// Workout CRUD operations
router.post('/', workoutController.createWorkout);
router.get('/', workoutController.getWorkouts);
router.get('/:id', workoutController.getWorkoutById);
router.put('/:id', workoutController.updateWorkout);
router.delete('/:id', workoutController.deleteWorkout);

// Exercise set operations
router.post('/exercise/:workoutExerciseId/sets', workoutController.addExerciseSet);
router.put('/sets/:setId', workoutController.updateExerciseSet);
router.delete('/sets/:setId', workoutController.deleteExerciseSet);

// Workout session operations
router.post('/session/start', workoutController.startWorkoutSession);
router.post('/session/:workoutId/end', workoutController.endWorkoutSession);
router.get('/session/active', workoutController.getActiveSession);
router.post('/session/:workoutId/exercise', workoutController.addExerciseToSession);
router.delete('/session/:workoutId/exercise/:workoutExerciseId', workoutController.removeExerciseFromSession);
router.put('/session/exercise/:workoutExerciseId/sets', workoutController.updateSessionExerciseSets);

export default router;