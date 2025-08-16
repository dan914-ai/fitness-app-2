import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestData() {
  console.log('🏗️ Creating test data to demonstrate performance improvements...\n');

  try {
    // Get the test user
    const user = await prisma.user.findFirst({
      where: {
        email: 'test2@example.com'
      }
    });

    if (!user) {
      console.log('❌ No test user found. Please run registration first.');
      return;
    }

    console.log(`✅ Found test user: ${user.username} (ID: ${user.userId})`);

    // Get some exercises
    const exercises = await prisma.exercise.findMany({
      take: 5
    });

    if (exercises.length === 0) {
      console.log('❌ No exercises found. Please seed the database first.');
      return;
    }

    console.log(`✅ Found ${exercises.length} exercises`);

    // Create test workouts
    console.log('\n📝 Creating test workouts...');
    
    for (let i = 0; i < 3; i++) {
      const workoutDate = new Date();
      workoutDate.setDate(workoutDate.getDate() - i);
      
      const workout = await prisma.workout.create({
        data: {
          userId: user.userId,
          workoutDate: workoutDate,
          startTime: workoutDate,
          endTime: new Date(workoutDate.getTime() + 60 * 60 * 1000), // 1 hour later
          totalDuration: 60,
          totalCalories: 300,
          workoutRating: 4,
          routineId: `test-routine-${i + 1}`,
          notes: `Test workout ${i + 1}`
        }
      });

      console.log(`  ✅ Created workout ${i + 1} (ID: ${workout.workoutId})`);

      // Add exercises to each workout
      for (let j = 0; j < 3; j++) {
        const exercise = exercises[j % exercises.length];
        
        const workoutExercise = await prisma.workoutExercise.create({
          data: {
            workoutId: workout.workoutId,
            exerciseId: exercise.exerciseId,
            orderInWorkout: j + 1,
            targetSets: 3,
            targetReps: 12,
            actualSets: 3
          }
        });

        // Add sets for each exercise
        for (let k = 0; k < 3; k++) {
          await prisma.exerciseSet.create({
            data: {
              workoutExerciseId: workoutExercise.workoutExerciseId,
              setNumber: k + 1,
              reps: 12 - k, // 12, 11, 10
              weight: 50 + (k * 5), // 50, 55, 60
              restTime: 90
            }
          });
        }
      }
    }

    console.log('\n✅ Test data created successfully!');
    
    // Now test the performance
    console.log('\n🚀 Testing query performance with new data...');
    
    const start = Date.now();
    const workoutsWithDetails = await prisma.workout.findMany({
      where: {
        userId: user.userId
      },
      include: {
        workoutExercises: {
          include: {
            exercise: true,
            exerciseSets: true
          }
        }
      },
      orderBy: {
        workoutDate: 'desc'
      }
    });
    const queryTime = Date.now() - start;

    console.log(`✅ Retrieved ${workoutsWithDetails.length} workouts with full details in ${queryTime}ms`);
    
    workoutsWithDetails.forEach((workout, i) => {
      console.log(`  Workout ${i + 1}: ${workout.workoutExercises.length} exercises, ${workout.workoutExercises.reduce((sum, we) => sum + we.exerciseSets.length, 0)} total sets`);
    });

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
}

// Create test data
createTestData()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });