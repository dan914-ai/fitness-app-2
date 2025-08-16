-- Performance Optimization Script
-- Generated on 2025-07-29T07:40:45.109Z
-- Apply in order: High -> Medium -> Low priority

-- Monitor query performance before and after applying
-- Use EXPLAIN ANALYZE to verify improvements

BEGIN;

-- HIGH PRIORITY INDEXES
-- These target the most critical performance bottlenecks

-- Foreign key joins for workout details on workout_exercises
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);

-- Foreign key joins for exercise details on workout_exercises
CREATE INDEX idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);

-- Nested queries for exercise sets on exercise_sets
CREATE INDEX idx_exercise_sets_workout_exercise_id ON exercise_sets(workout_exercise_id);

-- Counting likes per post on post_likes
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);

-- Comments per post queries on post_comments
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);

-- User achievement listings on user_achievements
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- MEDIUM PRIORITY INDEXES
-- These improve common query patterns

-- User social feeds with chronological order on social_posts
CREATE INDEX idx_social_posts_user_id_created_at ON social_posts(created_at, user_id);

-- Unread notifications queries on notifications
CREATE INDEX idx_notifications_user_id_is_read ON notifications(is_read, user_id);

-- Active vs completed goals on goals
CREATE INDEX idx_goals_user_id_is_achieved ON goals(is_achieved, user_id);

-- Recent workout queries and session tracking on workouts
CREATE INDEX idx_workouts_user_id_start_time ON workouts(user_id, start_time DESC);

-- Unread notifications only (partial index) on notifications
CREATE INDEX idx_notifications_user_id_unread ON notifications(user_id) WHERE is_read = false;

-- LOW PRIORITY INDEXES
-- These provide marginal improvements

-- Global feed chronological ordering on social_posts
CREATE INDEX idx_social_posts_created_at ON social_posts(created_at DESC);

-- Update table statistics after adding indexes
ANALYZE;

COMMIT;

-- Verify new indexes
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;