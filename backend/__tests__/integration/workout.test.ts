import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import app from '../../src/app';

const prisma = new PrismaClient();

describe('Workout API Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await prisma.$connect();

    // Create a test user and get auth token
    const userData = {
      username: 'workouttest',
      email: 'workouttest@test.com',
      password: 'Test@123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = response.body.token;
    userId = response.body.user.userId;

    // Create some test exercises
    await prisma.exercise.createMany({
      data: [
        {
          exerciseName: 'Test Bench Press',
          category: 'strength',
          muscleGroup: 'chest',
          difficulty: 'intermediate'
        },
        {
          exerciseName: 'Test Squat',
          category: 'strength',
          muscleGroup: 'legs',
          difficulty: 'intermediate'
        }
      ]
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.workoutExercise.deleteMany({
      where: {
        workout: {
          userId: BigInt(userId)
        }
      }
    });
    
    await prisma.workout.deleteMany({
      where: {
        userId: BigInt(userId)
      }
    });

    await prisma.exercise.deleteMany({
      where: {
        exerciseName: {
          startsWith: 'Test'
        }
      }
    });

    await prisma.user.deleteMany({
      where: {
        email: 'workouttest@test.com'
      }
    });

    await prisma.$disconnect();
  });

  describe('POST /api/workouts/start', () => {
    it('should start a new workout session', async () => {
      const response = await request(app)
        .post('/api/workouts/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          routineId: 'test-routine-1'
        })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Workout session started');
      expect(response.body).toHaveProperty('workoutId');
      expect(response.body.workout).toHaveProperty('startTime');
      expect(response.body.workout.routineId).toBe('test-routine-1');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/workouts/start')
        .send({
          routineId: 'test-routine-1'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'No token provided');
    });
  });

  describe('GET /api/workouts/history', () => {
    beforeAll(async () => {
      // Create some workout history
      const exercises = await prisma.exercise.findMany({
        where: {
          exerciseName: {
            startsWith: 'Test'
          }
        }
      });

      const workout = await prisma.workout.create({
        data: {
          userId: BigInt(userId),
          workoutDate: new Date(),
          startTime: new Date(),
          endTime: new Date(Date.now() + 3600000), // 1 hour later
          totalDuration: 60,
          totalCalories: 300,
          workoutRating: 4,
          routineId: 'test-routine-1'
        }
      });

      // Add exercises to workout
      await prisma.workoutExercise.create({
        data: {
          workoutId: workout.workoutId,
          exerciseId: exercises[0].exerciseId,
          orderInWorkout: 1,
          targetSets: 3,
          targetReps: 10,
          actualSets: 3
        }
      });
    });

    it('should get workout history', async () => {
      const response = await request(app)
        .get('/api/workouts/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('workouts');
      expect(Array.isArray(response.body.workouts)).toBe(true);
      expect(response.body.workouts.length).toBeGreaterThan(0);
      expect(response.body.workouts[0]).toHaveProperty('workoutId');
      expect(response.body.workouts[0]).toHaveProperty('totalDuration');
    });

    it('should filter by date range', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      const endDate = new Date();

      const response = await request(app)
        .get('/api/workouts/history')
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('workouts');
      expect(Array.isArray(response.body.workouts)).toBe(true);
    });
  });

  describe('GET /api/workouts/:workoutId', () => {
    let testWorkoutId: string;

    beforeAll(async () => {
      // Create a test workout
      const workout = await prisma.workout.create({
        data: {
          userId: BigInt(userId),
          workoutDate: new Date(),
          startTime: new Date(),
          totalDuration: 45,
          routineId: 'test-routine-detail'
        }
      });
      testWorkoutId = workout.workoutId.toString();
    });

    it('should get workout details', async () => {
      const response = await request(app)
        .get(`/api/workouts/${testWorkoutId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('workoutId', testWorkoutId);
      expect(response.body).toHaveProperty('totalDuration');
      expect(response.body).toHaveProperty('exercises');
    });

    it('should fail to get workout from another user', async () => {
      // Create another user
      const anotherUser = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'anotheruser',
          email: 'another@test.com',
          password: 'Test@123'
        });

      const anotherToken = anotherUser.body.token;

      const response = await request(app)
        .get(`/api/workouts/${testWorkoutId}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Workout not found');

      // Clean up
      await prisma.user.deleteMany({
        where: { email: 'another@test.com' }
      });
    });
  });
});