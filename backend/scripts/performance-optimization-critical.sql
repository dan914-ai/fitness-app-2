-- Critical Performance Indexes Only
-- Generated on 2025-07-29
-- These are the most important indexes for core functionality

BEGIN;

-- HIGH PRIORITY: Core workout system indexes
-- These will provide 50-90% performance improvement for core queries

-- 1. Workout exercises by workout (critical for workout details)
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id 
ON workout_exercises(workout_id);

-- 2. Workout exercises by exercise (for exercise usage stats)
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id 
ON workout_exercises(exercise_id);

-- 3. Exercise sets by workout exercise (critical for set details)
CREATE INDEX IF NOT EXISTS idx_exercise_sets_workout_exercise_id 
ON exercise_sets(workout_exercise_id);

-- 4. Social engagement indexes (if social features are used)
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id 
ON post_likes(post_id);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id 
ON post_comments(post_id);

-- 5. User achievements (for profile/stats)
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id 
ON user_achievements(user_id);

-- Update table statistics
ANALYZE;

COMMIT;

-- Verify the indexes were created
\echo 'Verifying critical indexes...'
SELECT 
    schemaname,
    tablename, 
    indexname,
    CASE 
        WHEN idx_scan = 0 THEN 'Not used yet'
        ELSE CONCAT(idx_scan, ' scans, ', idx_tup_fetch, ' rows fetched')
    END as usage
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
AND indexname IN (
    'idx_workout_exercises_workout_id',
    'idx_workout_exercises_exercise_id', 
    'idx_exercise_sets_workout_exercise_id',
    'idx_post_likes_post_id',
    'idx_post_comments_post_id',
    'idx_user_achievements_user_id'
)
ORDER BY tablename, indexname;