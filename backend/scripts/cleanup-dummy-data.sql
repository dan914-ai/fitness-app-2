-- Dummy/Legacy Data Cleanup Script
-- Generated on 2025-07-29T07:29:22.940Z
-- WARNING: Review carefully before executing!

BEGIN;

-- Fix social post count mismatches
UPDATE social_posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = social_posts.post_id);
UPDATE social_posts SET comments_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = social_posts.post_id);

-- Clean orphaned records
DELETE FROM exercise_sets WHERE workout_exercise_id NOT IN (SELECT workout_exercise_id FROM workout_exercises);
DELETE FROM workout_exercises WHERE workout_id NOT IN (SELECT workout_id FROM workouts);

COMMIT;