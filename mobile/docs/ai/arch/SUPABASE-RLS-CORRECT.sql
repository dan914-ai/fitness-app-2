-- ============================================
-- SUPABASE SECURITY FOR YOUR ACTUAL SCHEMA
-- Based on your provided database structure
-- ============================================

-- ============================================
-- SECTION 1: ENABLE ROW LEVEL SECURITY
-- ============================================

-- Core workout tables
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_templates ENABLE ROW LEVEL SECURITY;

-- User data tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_session_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_doms_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbody_history ENABLE ROW LEVEL SECURITY;

-- Survey and metrics tables
ALTER TABLE doms_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;

-- Social features
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Program and challenge features
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- Public reference table (no RLS needed, but we'll add read-only policy)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 2: WORKOUT TABLES POLICIES
-- ============================================

-- Workouts table (simple structure)
DROP POLICY IF EXISTS "Users can view own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can create own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts;

CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Workout history
DROP POLICY IF EXISTS "Users can view own workout history" ON workout_history;
DROP POLICY IF EXISTS "Users can create own workout history" ON workout_history;
DROP POLICY IF EXISTS "Users can update own workout history" ON workout_history;
DROP POLICY IF EXISTS "Users can delete own workout history" ON workout_history;

CREATE POLICY "Users can view own workout history" ON workout_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workout history" ON workout_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout history" ON workout_history
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout history" ON workout_history
  FOR DELETE USING (auth.uid() = user_id);

-- Workout sessions
DROP POLICY IF EXISTS "Users can view own workout sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can create own workout sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can update own workout sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can delete own workout sessions" ON workout_sessions;

CREATE POLICY "Users can view own workout sessions" ON workout_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workout sessions" ON workout_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout sessions" ON workout_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout sessions" ON workout_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Workout routines
DROP POLICY IF EXISTS "Users can view workout routines" ON workout_routines;
DROP POLICY IF EXISTS "Users can create own routines" ON workout_routines;
DROP POLICY IF EXISTS "Users can update own routines" ON workout_routines;
DROP POLICY IF EXISTS "Users can delete own routines" ON workout_routines;

-- Allow viewing public routines OR own routines
CREATE POLICY "Users can view workout routines" ON workout_routines
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can create own routines" ON workout_routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own routines" ON workout_routines
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own routines" ON workout_routines
  FOR DELETE USING (auth.uid() = user_id);

-- Workout exercises (linked to workout_history)
DROP POLICY IF EXISTS "Users can view own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can create own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can update own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can delete own workout exercises" ON workout_exercises;

CREATE POLICY "Users can view own workout exercises" ON workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_history 
      WHERE workout_history.id = workout_exercises.workout_id 
      AND workout_history.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create own workout exercises" ON workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_history 
      WHERE workout_history.id = workout_exercises.workout_id 
      AND workout_history.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own workout exercises" ON workout_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workout_history 
      WHERE workout_history.id = workout_exercises.workout_id 
      AND workout_history.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own workout exercises" ON workout_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workout_history 
      WHERE workout_history.id = workout_exercises.workout_id 
      AND workout_history.user_id = auth.uid()
    )
  );

-- Workout sets (linked to workout_exercises via exercise_id)
DROP POLICY IF EXISTS "Users can view own workout sets" ON workout_sets;
DROP POLICY IF EXISTS "Users can create own workout sets" ON workout_sets;
DROP POLICY IF EXISTS "Users can update own workout sets" ON workout_sets;
DROP POLICY IF EXISTS "Users can delete own workout sets" ON workout_sets;

CREATE POLICY "Users can view own workout sets" ON workout_sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workout_history wh ON wh.id = we.workout_id
      WHERE we.id = workout_sets.exercise_id
      AND wh.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create own workout sets" ON workout_sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workout_history wh ON wh.id = we.workout_id
      WHERE we.id = workout_sets.exercise_id
      AND wh.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own workout sets" ON workout_sets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workout_history wh ON wh.id = we.workout_id
      WHERE we.id = workout_sets.exercise_id
      AND wh.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own workout sets" ON workout_sets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workout_history wh ON wh.id = we.workout_id
      WHERE we.id = workout_sets.exercise_id
      AND wh.user_id = auth.uid()
    )
  );

-- Exercise sets (linked to workout_sessions)
DROP POLICY IF EXISTS "Users can view own exercise sets" ON exercise_sets;
DROP POLICY IF EXISTS "Users can create own exercise sets" ON exercise_sets;
DROP POLICY IF EXISTS "Users can update own exercise sets" ON exercise_sets;
DROP POLICY IF EXISTS "Users can delete own exercise sets" ON exercise_sets;

CREATE POLICY "Users can view own exercise sets" ON exercise_sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = exercise_sets.workout_session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create own exercise sets" ON exercise_sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = exercise_sets.workout_session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own exercise sets" ON exercise_sets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = exercise_sets.workout_session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own exercise sets" ON exercise_sets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = exercise_sets.workout_session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );

-- Exercise templates (linked to workout_routines)
DROP POLICY IF EXISTS "Users can view exercise templates" ON exercise_templates;
DROP POLICY IF EXISTS "Users can create exercise templates" ON exercise_templates;
DROP POLICY IF EXISTS "Users can update exercise templates" ON exercise_templates;
DROP POLICY IF EXISTS "Users can delete exercise templates" ON exercise_templates;

CREATE POLICY "Users can view exercise templates" ON exercise_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_routines 
      WHERE workout_routines.id = exercise_templates.routine_id 
      AND (workout_routines.is_public = true OR workout_routines.user_id = auth.uid())
    )
  );
CREATE POLICY "Users can create exercise templates" ON exercise_templates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_routines 
      WHERE workout_routines.id = exercise_templates.routine_id 
      AND workout_routines.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update exercise templates" ON exercise_templates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workout_routines 
      WHERE workout_routines.id = exercise_templates.routine_id 
      AND workout_routines.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete exercise templates" ON exercise_templates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workout_routines 
      WHERE workout_routines.id = exercise_templates.routine_id 
      AND workout_routines.user_id = auth.uid()
    )
  );

-- ============================================
-- SECTION 3: USER DATA POLICIES
-- ============================================

-- Users table
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true); -- Public user list
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- User profiles
DROP POLICY IF EXISTS "Anyone can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Anyone can view profiles" ON user_profiles
  FOR SELECT USING (true); -- Public profiles
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- User progress
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can create own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON user_progress;

CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress" ON user_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Personal records
DROP POLICY IF EXISTS "Users can view own records" ON personal_records;
DROP POLICY IF EXISTS "Users can create own records" ON personal_records;
DROP POLICY IF EXISTS "Users can update own records" ON personal_records;
DROP POLICY IF EXISTS "Users can delete own records" ON personal_records;

CREATE POLICY "Users can view own records" ON personal_records
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own records" ON personal_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own records" ON personal_records
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own records" ON personal_records
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SECTION 4: EXERCISES (PUBLIC READ)
-- ============================================

-- Exercises table - anyone can read, only creators can modify their custom exercises
DROP POLICY IF EXISTS "Anyone can view exercises" ON exercises;
DROP POLICY IF EXISTS "Users can create custom exercises" ON exercises;
DROP POLICY IF EXISTS "Users can update own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can delete own exercises" ON exercises;

CREATE POLICY "Anyone can view exercises" ON exercises
  FOR SELECT USING (true);
CREATE POLICY "Users can create custom exercises" ON exercises
  FOR INSERT WITH CHECK (auth.uid() = created_by AND is_custom = true);
CREATE POLICY "Users can update own exercises" ON exercises
  FOR UPDATE USING (auth.uid() = created_by AND is_custom = true);
CREATE POLICY "Users can delete own exercises" ON exercises
  FOR DELETE USING (auth.uid() = created_by AND is_custom = true);

-- ============================================
-- SECTION 5: ADD CRITICAL INDEXES
-- ============================================

-- Workout tables
CREATE INDEX IF NOT EXISTS idx_workouts_user_created 
  ON workouts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_history_user_date 
  ON workout_history(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_start 
  ON workout_sessions(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_workout_routines_user 
  ON workout_routines(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout 
  ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise 
  ON workout_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_session 
  ON exercise_sets(workout_session_id);
CREATE INDEX IF NOT EXISTS idx_exercise_templates_routine 
  ON exercise_templates(routine_id);

-- User data
CREATE INDEX IF NOT EXISTS idx_personal_records_user_exercise 
  ON personal_records(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_date 
  ON user_progress(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_inbody_history_user_date 
  ON inbody_history(user_id, date DESC);

-- ============================================
-- SECTION 6: ADD IDEMPOTENCY
-- ============================================

-- Add client_id to workout tables for idempotency
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'workouts' 
                 AND column_name = 'client_id') THEN
    ALTER TABLE workouts ADD COLUMN client_id UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'workout_sessions' 
                 AND column_name = 'client_id') THEN
    ALTER TABLE workout_sessions ADD COLUMN client_id UUID;
  END IF;
END $$;

-- Add unique constraints
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_workouts_client_id') THEN
    ALTER TABLE workouts 
      ADD CONSTRAINT uq_workouts_client_id UNIQUE (user_id, client_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_workout_sessions_client_id') THEN
    ALTER TABLE workout_sessions 
      ADD CONSTRAINT uq_workout_sessions_client_id UNIQUE (user_id, client_id);
  END IF;
END $$;

-- ============================================
-- SECTION 7: VERIFY SECURITY
-- ============================================

-- Check RLS status
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as security_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'workouts', 'workout_history', 'workout_sessions',
    'workout_routines', 'workout_exercises', 'workout_sets',
    'exercise_sets', 'exercises', 'personal_records',
    'users', 'user_profiles', 'user_progress'
  )
ORDER BY tablename;

-- Count policies
SELECT 
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ Protected'
    WHEN COUNT(*) > 0 THEN '⚠️  Partial'
    ELSE '❌ UNPROTECTED!'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- COMPLETION
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SECURITY SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Fixed relationships:';
  RAISE NOTICE '- workout_sets.exercise_id → workout_exercises.id';
  RAISE NOTICE '- exercise_sets.workout_session_id → workout_sessions.id';
  RAISE NOTICE '- workout_exercises.workout_id → workout_history.id';
  RAISE NOTICE '========================================';
END $$;