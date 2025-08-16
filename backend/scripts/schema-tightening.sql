-- Schema Tightening Migration Script
-- Generated on 2025-07-29T07:34:58.393Z
-- Review each change carefully before executing

-- HIGH PRIORITY FIXES
-- These significantly impact performance or data integrity

-- Missing composite index on user_id and workout_date on workouts
CREATE INDEX idx_workouts_user_id_workout_date ON workouts(user_id, workout_date DESC);

-- MEDIUM PRIORITY FIXES
-- These improve data validation and query performance

-- Count column without non-negative constraint on _prisma_migrations.applied_steps_count
ALTER TABLE _prisma_migrations ADD CONSTRAINT chk__prisma_migrations_applied_steps_count_non_negative CHECK (applied_steps_count >= 0);

-- Frequently queried timestamp without index on achievements.created_at
CREATE INDEX idx_achievements_created_at ON achievements(created_at DESC);

-- Percentage column without range constraint on body_measurements.body_fat_percentage
ALTER TABLE body_measurements ADD CONSTRAINT chk_body_measurements_body_fat_percentage_range CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100);

-- Frequently queried timestamp without index on body_measurements.created_at
CREATE INDEX idx_body_measurements_created_at ON body_measurements(created_at DESC);

-- Frequently queried timestamp without index on challenges.created_at
CREATE INDEX idx_challenges_created_at ON challenges(created_at DESC);

-- Frequently queried timestamp without index on diet_logs.created_at
CREATE INDEX idx_diet_logs_created_at ON diet_logs(created_at DESC);

-- Frequently queried timestamp without index on exercise_sets.created_at
CREATE INDEX idx_exercise_sets_created_at ON exercise_sets(created_at DESC);

-- Frequently queried timestamp without index on exercises.created_at
CREATE INDEX idx_exercises_created_at ON exercises(created_at DESC);

-- Frequently queried timestamp without index on goals.created_at
CREATE INDEX idx_goals_created_at ON goals(created_at DESC);

-- Frequently queried timestamp without index on notifications.created_at
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Frequently queried timestamp without index on post_comments.created_at
CREATE INDEX idx_post_comments_created_at ON post_comments(created_at DESC);

-- Frequently queried timestamp without index on post_likes.created_at
CREATE INDEX idx_post_likes_created_at ON post_likes(created_at DESC);

-- Frequently queried timestamp without index on progress_photos.created_at
CREATE INDEX idx_progress_photos_created_at ON progress_photos(created_at DESC);

-- Count column without non-negative constraint on social_posts.likes_count
ALTER TABLE social_posts ADD CONSTRAINT chk_social_posts_likes_count_non_negative CHECK (likes_count >= 0);

-- Count column without non-negative constraint on social_posts.comments_count
ALTER TABLE social_posts ADD CONSTRAINT chk_social_posts_comments_count_non_negative CHECK (comments_count >= 0);

-- Frequently queried timestamp without index on social_posts.created_at
CREATE INDEX idx_social_posts_created_at ON social_posts(created_at DESC);

-- Frequently queried timestamp without index on user_follows.created_at
CREATE INDEX idx_user_follows_created_at ON user_follows(created_at DESC);

-- Percentage column without range constraint on user_workout_programs.completion_rate
ALTER TABLE user_workout_programs ADD CONSTRAINT chk_user_workout_programs_completion_rate_range CHECK (completion_rate >= 0 AND completion_rate <= 100);

-- Frequently queried timestamp without index on user_workout_programs.created_at
CREATE INDEX idx_user_workout_programs_created_at ON user_workout_programs(created_at DESC);

-- Email column without validation constraint on users.email
ALTER TABLE users ADD CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Frequently queried timestamp without index on users.created_at
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Frequently queried timestamp without index on workout_exercises.created_at
CREATE INDEX idx_workout_exercises_created_at ON workout_exercises(created_at DESC);

-- Frequently queried timestamp without index on workout_programs.created_at
CREATE INDEX idx_workout_programs_created_at ON workout_programs(created_at DESC);

-- Frequently queried timestamp without index on workouts.created_at
CREATE INDEX idx_workouts_created_at ON workouts(created_at DESC);

-- Missing index on foreign key on workout_exercises.workout_id
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);

-- Missing index on foreign key on workout_exercises.exercise_id
CREATE INDEX idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);

-- Missing index on foreign key on exercise_sets.workout_exercise_id
CREATE INDEX idx_exercise_sets_workout_exercise_id ON exercise_sets(workout_exercise_id);

-- Missing index on foreign key on user_workout_programs.user_id
CREATE INDEX idx_user_workout_programs_user_id ON user_workout_programs(user_id);

-- Missing index on foreign key on user_workout_programs.program_id
CREATE INDEX idx_user_workout_programs_program_id ON user_workout_programs(program_id);

-- Missing index on foreign key on workout_program_exercises.program_id
CREATE INDEX idx_workout_program_exercises_program_id ON workout_program_exercises(program_id);

-- Missing index on foreign key on workout_program_exercises.exercise_id
CREATE INDEX idx_workout_program_exercises_exercise_id ON workout_program_exercises(exercise_id);

-- Missing index on foreign key on goals.user_id
CREATE INDEX idx_goals_user_id ON goals(user_id);

-- Missing index on foreign key on social_posts.user_id
CREATE INDEX idx_social_posts_user_id ON social_posts(user_id);

-- Missing index on foreign key on post_comments.post_id
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);

-- Missing index on foreign key on post_comments.user_id
CREATE INDEX idx_post_comments_user_id ON post_comments(user_id);

-- Missing index on foreign key on notifications.user_id
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Missing index on foreign key on progress_photos.user_id
CREATE INDEX idx_progress_photos_user_id ON progress_photos(user_id);

-- Missing index on foreign key on body_measurements.user_id
CREATE INDEX idx_body_measurements_user_id ON body_measurements(user_id);

-- Missing index on foreign key on diet_logs.user_id
CREATE INDEX idx_diet_logs_user_id ON diet_logs(user_id);
