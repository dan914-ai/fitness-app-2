-- Production Data Cleanup Script
-- Generated on 2025-07-29
-- WARNING: Review carefully before executing!

BEGIN;

-- Remove test/dummy users and all their data
-- Test user ID: 1 (test@example.com)
DELETE FROM post_comments WHERE user_id = 1;
DELETE FROM post_likes WHERE user_id = 1;
DELETE FROM social_posts WHERE user_id = 1;
DELETE FROM notifications WHERE user_id = 1;
DELETE FROM challenge_participants WHERE user_id = 1;
DELETE FROM user_achievements WHERE user_id = 1;
DELETE FROM goals WHERE user_id = 1;
DELETE FROM user_workout_programs WHERE user_id = 1;
DELETE FROM diet_logs WHERE user_id = 1;
DELETE FROM body_measurements WHERE user_id = 1;
DELETE FROM progress_photos WHERE user_id = 1;
DELETE FROM exercise_sets WHERE workout_exercise_id IN (SELECT workout_exercise_id FROM workout_exercises WHERE workout_id IN (SELECT workout_id FROM workouts WHERE user_id = 1));
DELETE FROM workout_exercises WHERE workout_id IN (SELECT workout_id FROM workouts WHERE user_id = 1);
DELETE FROM workouts WHERE user_id = 1;
DELETE FROM user_follows WHERE follower_id = 1 OR following_id = 1;
DELETE FROM users WHERE user_id = 1;

-- Fix social post count mismatches (preventive)
UPDATE social_posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = social_posts.post_id);
UPDATE social_posts SET comments_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = social_posts.post_id);

-- Clean orphaned records
DELETE FROM exercise_sets WHERE workout_exercise_id NOT IN (SELECT workout_exercise_id FROM workout_exercises);
DELETE FROM workout_exercises WHERE workout_id NOT IN (SELECT workout_id FROM workouts);

COMMIT;