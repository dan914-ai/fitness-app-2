-- Schema Tightening Migration Script (Safe Version)
-- Generated on 2025-07-29
-- This version includes only the most critical improvements

BEGIN;

-- HIGH PRIORITY: Composite index for workout queries
-- This will significantly improve performance for user workout history queries
CREATE INDEX IF NOT EXISTS idx_workouts_user_id_workout_date 
ON workouts(user_id, workout_date DESC);

-- CRITICAL FOREIGN KEY INDEXES
-- These prevent full table scans on joins

CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id 
ON workout_exercises(workout_id);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id 
ON workout_exercises(exercise_id);

CREATE INDEX IF NOT EXISTS idx_exercise_sets_workout_exercise_id 
ON exercise_sets(workout_exercise_id);

-- User-related indexes for common queries
CREATE INDEX IF NOT EXISTS idx_goals_user_id 
ON goals(user_id);

CREATE INDEX IF NOT EXISTS idx_social_posts_user_id 
ON social_posts(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
ON notifications(user_id);

-- Data integrity constraints (safe to add)
ALTER TABLE social_posts 
ADD CONSTRAINT chk_social_posts_likes_count_non_negative 
CHECK (likes_count >= 0);

ALTER TABLE social_posts 
ADD CONSTRAINT chk_social_posts_comments_count_non_negative 
CHECK (comments_count >= 0);

-- Email format validation
ALTER TABLE users 
ADD CONSTRAINT chk_users_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Percentage constraints
ALTER TABLE body_measurements 
ADD CONSTRAINT chk_body_measurements_body_fat_percentage_range 
CHECK (body_fat_percentage IS NULL OR (body_fat_percentage >= 0 AND body_fat_percentage <= 100));

ALTER TABLE user_workout_programs 
ADD CONSTRAINT chk_user_workout_programs_completion_rate_range 
CHECK (completion_rate IS NULL OR (completion_rate >= 0 AND completion_rate <= 100));

COMMIT;

-- Verification queries
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
    'idx_workouts_user_id_workout_date',
    'idx_workout_exercises_workout_id',
    'idx_workout_exercises_exercise_id',
    'idx_exercise_sets_workout_exercise_id'
)
ORDER BY tablename, indexname;