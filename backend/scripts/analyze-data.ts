import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DataAnalysis {
  table: string;
  totalRecords: number;
  suspiciousRecords?: any[];
  notes: string[];
}

async function analyzeData() {
  console.log('🔍 Analyzing database for dummy/legacy data...\n');
  
  const analyses: DataAnalysis[] = [];
  
  // 1. Analyze Users
  console.log('📊 Analyzing Users...');
  const users = await prisma.user.findMany({
    include: {
      workouts: {
        take: 1
      },
      socialPosts: {
        take: 1
      }
    }
  });
  
  const userAnalysis: DataAnalysis = {
    table: 'users',
    totalRecords: users.length,
    suspiciousRecords: [],
    notes: []
  };
  
  users.forEach(user => {
    // Check for test/dummy users
    if (user.email.includes('test') || 
        user.email.includes('dummy') || 
        user.email.includes('example') ||
        user.username.toLowerCase().includes('test')) {
      userAnalysis.suspiciousRecords!.push({
        id: user.userId.toString(),
        email: user.email,
        username: user.username,
        reason: 'Test/dummy user pattern'
      });
    }
    
    // Check for users with no activity
    if (user.workouts.length === 0 && user.socialPosts.length === 0) {
      userAnalysis.suspiciousRecords!.push({
        id: user.userId.toString(),
        email: user.email,
        username: user.username,
        reason: 'No activity (no workouts or posts)',
        createdAt: user.createdAt
      });
    }
  });
  
  if (userAnalysis.suspiciousRecords!.length > 0) {
    userAnalysis.notes.push(`Found ${userAnalysis.suspiciousRecords!.length} suspicious users`);
  }
  analyses.push(userAnalysis);
  
  // 2. Analyze Workouts
  console.log('📊 Analyzing Workouts...');
  const workouts = await prisma.workout.findMany({
    include: {
      workoutExercises: true
    }
  });
  
  const workoutAnalysis: DataAnalysis = {
    table: 'workouts',
    totalRecords: workouts.length,
    suspiciousRecords: [],
    notes: []
  };
  
  workouts.forEach(workout => {
    // Check for workouts with no exercises
    if (workout.workoutExercises.length === 0) {
      workoutAnalysis.suspiciousRecords!.push({
        id: workout.workoutId.toString(),
        userId: workout.userId.toString(),
        date: workout.workoutDate,
        reason: 'Workout with no exercises'
      });
    }
    
    // Check for unrealistic durations
    if (workout.totalDuration && (workout.totalDuration > 300 || workout.totalDuration < 5)) {
      workoutAnalysis.suspiciousRecords!.push({
        id: workout.workoutId.toString(),
        duration: workout.totalDuration,
        reason: `Unrealistic duration: ${workout.totalDuration} minutes`
      });
    }
    
    // Check for workouts without end times (unfinished)
    if (workout.startTime && !workout.endTime) {
      const hoursSinceStart = (Date.now() - workout.startTime.getTime()) / (1000 * 60 * 60);
      if (hoursSinceStart > 24) {
        workoutAnalysis.suspiciousRecords!.push({
          id: workout.workoutId.toString(),
          startTime: workout.startTime,
          reason: `Unfinished workout started ${Math.floor(hoursSinceStart)} hours ago`
        });
      }
    }
  });
  
  analyses.push(workoutAnalysis);
  
  // 3. Analyze Exercises
  console.log('📊 Analyzing Exercises...');
  const exercises = await prisma.exercise.findMany({
    include: {
      workoutExercises: {
        take: 1
      }
    }
  });
  
  const exerciseAnalysis: DataAnalysis = {
    table: 'exercises',
    totalRecords: exercises.length,
    suspiciousRecords: [],
    notes: []
  };
  
  exercises.forEach(exercise => {
    // Check for unused exercises
    if (exercise.workoutExercises.length === 0) {
      exerciseAnalysis.notes.push(`Exercise "${exercise.exerciseName}" has never been used`);
    }
    
    // Check for duplicate exercise names
    const duplicates = exercises.filter(e => 
      e.exerciseName === exercise.exerciseName && 
      e.exerciseId !== exercise.exerciseId
    );
    if (duplicates.length > 0) {
      exerciseAnalysis.suspiciousRecords!.push({
        id: exercise.exerciseId.toString(),
        name: exercise.exerciseName,
        reason: 'Duplicate exercise name'
      });
    }
  });
  
  analyses.push(exerciseAnalysis);
  
  // 4. Analyze Social Posts
  console.log('📊 Analyzing Social Posts...');
  const socialPosts = await prisma.socialPost.findMany({
    include: {
      postLikes: true,
      postComments: true
    }
  });
  
  const socialAnalysis: DataAnalysis = {
    table: 'socialPosts',
    totalRecords: socialPosts.length,
    suspiciousRecords: [],
    notes: []
  };
  
  socialPosts.forEach(post => {
    // Check for orphaned posts (user deleted)
    if (!post.userId) {
      socialAnalysis.suspiciousRecords!.push({
        id: post.postId.toString(),
        reason: 'Orphaned post (no user)'
      });
    }
    
    // Check for posts with mismatched counts
    if (post.likesCount !== post.postLikes.length) {
      socialAnalysis.suspiciousRecords!.push({
        id: post.postId.toString(),
        reason: `Like count mismatch: stored ${post.likesCount}, actual ${post.postLikes.length}`
      });
    }
    
    if (post.commentsCount !== post.postComments.length) {
      socialAnalysis.suspiciousRecords!.push({
        id: post.postId.toString(),
        reason: `Comment count mismatch: stored ${post.commentsCount}, actual ${post.postComments.length}`
      });
    }
  });
  
  analyses.push(socialAnalysis);
  
  // 5. Check for orphaned records
  console.log('📊 Checking for orphaned records...');
  
  // Check workout exercises with no workout
  const orphanedWorkoutExercises = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM workout_exercises we
    LEFT JOIN workouts w ON we.workout_id = w.workout_id
    WHERE w.workout_id IS NULL
  `;
  
  // Check exercise sets with no workout exercise
  const orphanedExerciseSets = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM exercise_sets es
    LEFT JOIN workout_exercises we ON es.workout_exercise_id = we.workout_exercise_id
    WHERE we.workout_exercise_id IS NULL
  `;
  
  // Generate report
  console.log('\n📋 ANALYSIS REPORT\n' + '='.repeat(50));
  
  analyses.forEach(analysis => {
    console.log(`\n${analysis.table.toUpperCase()}`);
    console.log(`Total records: ${analysis.totalRecords}`);
    if (analysis.suspiciousRecords && analysis.suspiciousRecords.length > 0) {
      console.log(`Suspicious records: ${analysis.suspiciousRecords.length}`);
      analysis.suspiciousRecords.slice(0, 5).forEach(record => {
        console.log(`  - ${JSON.stringify(record)}`);
      });
      if (analysis.suspiciousRecords.length > 5) {
        console.log(`  ... and ${analysis.suspiciousRecords.length - 5} more`);
      }
    }
    if (analysis.notes.length > 0) {
      console.log('Notes:');
      analysis.notes.forEach(note => console.log(`  - ${note}`));
    }
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('Orphaned records:');
  console.log(`  - Workout exercises without workouts: ${(orphanedWorkoutExercises as any)[0].count}`);
  console.log(`  - Exercise sets without workout exercises: ${(orphanedExerciseSets as any)[0].count}`);
  
  // Summary recommendations
  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('1. Remove test/dummy users and their associated data');
  console.log('2. Clean up unfinished workouts older than 24 hours');
  console.log('3. Remove orphaned records in related tables');
  console.log('4. Fix social post count mismatches');
  console.log('5. Consider removing unused exercises or merging duplicates');
  
  return analyses;
}

// Create cleanup SQL script
async function generateCleanupScript(analyses: DataAnalysis[]) {
  const sqlStatements: string[] = [];
  
  sqlStatements.push('-- Dummy/Legacy Data Cleanup Script');
  sqlStatements.push(`-- Generated on ${new Date().toISOString()}`);
  sqlStatements.push('-- WARNING: Review carefully before executing!');
  sqlStatements.push('');
  sqlStatements.push('BEGIN;');
  sqlStatements.push('');
  
  // Find test user IDs
  const userAnalysis = analyses.find(a => a.table === 'users');
  if (userAnalysis && userAnalysis.suspiciousRecords) {
    const testUserIds = userAnalysis.suspiciousRecords
      .filter(u => u.reason === 'Test/dummy user pattern')
      .map(u => u.id);
    
    if (testUserIds.length > 0) {
      sqlStatements.push('-- Remove test/dummy users and all their data');
      sqlStatements.push(`-- Test user IDs: ${testUserIds.join(', ')}`);
      
      // Delete in correct order to respect foreign keys
      sqlStatements.push(`DELETE FROM post_comments WHERE user_id IN (${testUserIds.join(', ')});`);
      sqlStatements.push(`DELETE FROM post_likes WHERE user_id IN (${testUserIds.join(', ')});`);
      sqlStatements.push(`DELETE FROM social_posts WHERE user_id IN (${testUserIds.join(', ')});`);
      sqlStatements.push(`DELETE FROM notifications WHERE user_id IN (${testUserIds.join(', ')});`);
      sqlStatements.push(`DELETE FROM challenge_participants WHERE user_id IN (${testUserIds.join(', ')});`);
      sqlStatements.push(`DELETE FROM user_achievements WHERE user_id IN (${testUserIds.join(', ')});`);
      sqlStatements.push(`DELETE FROM goals WHERE user_id IN (${testUserIds.join(', ')});`);
      sqlStatements.push(`DELETE FROM user_workout_programs WHERE user_id IN (${testUserIds.join(', ')});`);
      sqlStatements.push(`DELETE FROM diet_logs WHERE user_id IN (${testUserIds.join(', ')});`);
      sqlStatements.push(`DELETE FROM body_measurements WHERE user_id IN (${testUserIds.join(', ')});`);
      sqlStatements.push(`DELETE FROM progress_photos WHERE user_id IN (${testUserIds.join(', ')});`);
      sqlStatements.push(`DELETE FROM exercise_sets WHERE workout_exercise_id IN (SELECT workout_exercise_id FROM workout_exercises WHERE workout_id IN (SELECT workout_id FROM workouts WHERE user_id IN (${testUserIds.join(', ')})));`);
      sqlStatements.push(`DELETE FROM workout_exercises WHERE workout_id IN (SELECT workout_id FROM workouts WHERE user_id IN (${testUserIds.join(', ')}));`);
      sqlStatements.push(`DELETE FROM workouts WHERE user_id IN (${testUserIds.join(', ')});`);
      sqlStatements.push(`DELETE FROM user_follows WHERE follower_id IN (${testUserIds.join(', ')}) OR following_id IN (${testUserIds.join(', ')});`);
      sqlStatements.push(`DELETE FROM users WHERE user_id IN (${testUserIds.join(', ')});`);
      sqlStatements.push('');
    }
  }
  
  // Clean up unfinished workouts
  const workoutAnalysis = analyses.find(a => a.table === 'workouts');
  if (workoutAnalysis && workoutAnalysis.suspiciousRecords) {
    const unfinishedWorkoutIds = workoutAnalysis.suspiciousRecords
      .filter(w => w.reason && w.reason.includes('Unfinished workout'))
      .map(w => w.id);
    
    if (unfinishedWorkoutIds.length > 0) {
      sqlStatements.push('-- Remove unfinished workouts older than 24 hours');
      sqlStatements.push(`DELETE FROM exercise_sets WHERE workout_exercise_id IN (SELECT workout_exercise_id FROM workout_exercises WHERE workout_id IN (${unfinishedWorkoutIds.join(', ')}));`);
      sqlStatements.push(`DELETE FROM workout_exercises WHERE workout_id IN (${unfinishedWorkoutIds.join(', ')});`);
      sqlStatements.push(`DELETE FROM workouts WHERE workout_id IN (${unfinishedWorkoutIds.join(', ')});`);
      sqlStatements.push('');
    }
  }
  
  // Fix social post counts
  sqlStatements.push('-- Fix social post count mismatches');
  sqlStatements.push('UPDATE social_posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = social_posts.post_id);');
  sqlStatements.push('UPDATE social_posts SET comments_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = social_posts.post_id);');
  sqlStatements.push('');
  
  // Clean orphaned records
  sqlStatements.push('-- Clean orphaned records');
  sqlStatements.push('DELETE FROM exercise_sets WHERE workout_exercise_id NOT IN (SELECT workout_exercise_id FROM workout_exercises);');
  sqlStatements.push('DELETE FROM workout_exercises WHERE workout_id NOT IN (SELECT workout_id FROM workouts);');
  sqlStatements.push('');
  
  sqlStatements.push('COMMIT;');
  
  // Write to file
  const fs = require('fs').promises;
  const cleanupPath = '/mnt/c/Users/danny/.vscode/new finess app/backend/scripts/cleanup-dummy-data.sql';
  await fs.writeFile(cleanupPath, sqlStatements.join('\n'));
  console.log(`\n✅ Cleanup script generated: ${cleanupPath}`);
}

// Run analysis
analyzeData()
  .then(generateCleanupScript)
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });