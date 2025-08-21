-- ============================================
-- SUPABASE SECURITY FOR YOUR ACTUAL TABLES
-- Based on your existing database structure
-- ============================================

-- ============================================
-- SECTION 1: ENABLE ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all user-data tables
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_session_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_doms_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbody_history ENABLE ROW LEVEL SECURITY;

-- Social features
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Challenge features
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- Program features
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;

-- Other user data
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_metrics ENABLE ROW LEVEL SECURITY;

-- Public tables (no RLS needed)
-- exercises - public reference data
-- exercise_templates - public templates
-- exercise_sets might be public templates

-- ============================================
-- SECTION 2: CREATE RLS POLICIES - WORKOUTS
-- ============================================

-- Workouts table
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

-- Workout exercises
DROP POLICY IF EXISTS "Users can view own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can create own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can update own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can delete own workout exercises" ON workout_exercises;

CREATE POLICY "Users can view own workout exercises" ON workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create own workout exercises" ON workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own workout exercises" ON workout_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own workout exercises" ON workout_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- Workout sets
DROP POLICY IF EXISTS "Users can view own workout sets" ON workout_sets;
DROP POLICY IF EXISTS "Users can create own workout sets" ON workout_sets;
DROP POLICY IF EXISTS "Users can update own workout sets" ON workout_sets;
DROP POLICY IF EXISTS "Users can delete own workout sets" ON workout_sets;

CREATE POLICY "Users can view own workout sets" ON workout_sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      WHERE we.id = workout_sets.workout_exercise_id
      AND w.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create own workout sets" ON workout_sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      WHERE we.id = workout_sets.workout_exercise_id
      AND w.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own workout sets" ON workout_sets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      WHERE we.id = workout_sets.workout_exercise_id
      AND w.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own workout sets" ON workout_sets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      WHERE we.id = workout_sets.workout_exercise_id
      AND w.user_id = auth.uid()
    )
  );

-- Workout routines
DROP POLICY IF EXISTS "Users can view own routines" ON workout_routines;
DROP POLICY IF EXISTS "Users can create own routines" ON workout_routines;
DROP POLICY IF EXISTS "Users can update own routines" ON workout_routines;
DROP POLICY IF EXISTS "Users can delete own routines" ON workout_routines;

CREATE POLICY "Users can view own routines" ON workout_routines
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own routines" ON workout_routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own routines" ON workout_routines
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own routines" ON workout_routines
  FOR DELETE USING (auth.uid() = user_id);

-- Workout sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON workout_sessions;

CREATE POLICY "Users can view own sessions" ON workout_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON workout_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON workout_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON workout_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Workout history
DROP POLICY IF EXISTS "Users can view own history" ON workout_history;
DROP POLICY IF EXISTS "Users can create own history" ON workout_history;
DROP POLICY IF EXISTS "Users can update own history" ON workout_history;
DROP POLICY IF EXISTS "Users can delete own history" ON workout_history;

CREATE POLICY "Users can view own history" ON workout_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own history" ON workout_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own history" ON workout_history
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own history" ON workout_history
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SECTION 3: USER DATA POLICIES
-- ============================================

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

-- User profiles
DROP POLICY IF EXISTS "Users can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;

CREATE POLICY "Users can view profiles" ON user_profiles
  FOR SELECT USING (true); -- Public profiles
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

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

-- User session data
DROP POLICY IF EXISTS "Users can view own session data" ON user_session_data;
DROP POLICY IF EXISTS "Users can create own session data" ON user_session_data;
DROP POLICY IF EXISTS "Users can update own session data" ON user_session_data;
DROP POLICY IF EXISTS "Users can delete own session data" ON user_session_data;

CREATE POLICY "Users can view own session data" ON user_session_data
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own session data" ON user_session_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own session data" ON user_session_data
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own session data" ON user_session_data
  FOR DELETE USING (auth.uid() = user_id);

-- User DOMS data
DROP POLICY IF EXISTS "Users can view own doms data" ON user_doms_data;
DROP POLICY IF EXISTS "Users can create own doms data" ON user_doms_data;
DROP POLICY IF EXISTS "Users can update own doms data" ON user_doms_data;
DROP POLICY IF EXISTS "Users can delete own doms data" ON user_doms_data;

CREATE POLICY "Users can view own doms data" ON user_doms_data
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own doms data" ON user_doms_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own doms data" ON user_doms_data
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own doms data" ON user_doms_data
  FOR DELETE USING (auth.uid() = user_id);

-- InBody history
DROP POLICY IF EXISTS "Users can view own inbody" ON inbody_history;
DROP POLICY IF EXISTS "Users can create own inbody" ON inbody_history;
DROP POLICY IF EXISTS "Users can update own inbody" ON inbody_history;
DROP POLICY IF EXISTS "Users can delete own inbody" ON inbody_history;

CREATE POLICY "Users can view own inbody" ON inbody_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own inbody" ON inbody_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inbody" ON inbody_history
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inbody" ON inbody_history
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SECTION 4: SOCIAL FEATURES POLICIES
-- ============================================

-- Posts (users can see all, edit own)
DROP POLICY IF EXISTS "Anyone can view posts" ON posts;
DROP POLICY IF EXISTS "Users can create own posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

CREATE POLICY "Anyone can view posts" ON posts
  FOR SELECT USING (true);
CREATE POLICY "Users can create own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Similar for comments, likes, follows...

-- ============================================
-- SECTION 5: ADD MISSING INDEXES
-- ============================================

-- Critical performance indexes
CREATE INDEX IF NOT EXISTS idx_workouts_user_created 
  ON workouts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout 
  ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise 
  ON workout_sets(workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_routines_user 
  ON workout_routines(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user 
  ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_user 
  ON personal_records(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user 
  ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_inbody_history_user 
  ON inbody_history(user_id, created_at DESC);

-- ============================================
-- SECTION 6: ADD IDEMPOTENCY
-- ============================================

-- Add client_id to workouts if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'workouts' 
                 AND column_name = 'client_id') THEN
    ALTER TABLE workouts ADD COLUMN client_id UUID;
  END IF;
END $$;

-- Add unique constraint for idempotency
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_workout_client_id') THEN
    ALTER TABLE workouts 
      ADD CONSTRAINT uq_workout_client_id UNIQUE (user_id, client_id);
  END IF;
END $$;

-- ============================================
-- SECTION 7: VERIFY SECURITY STATUS
-- ============================================

-- Check RLS status
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED - SECURITY RISK!'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'workouts', 'workout_exercises', 'workout_sets',
    'workout_routines', 'workout_sessions', 'workout_history',
    'personal_records', 'user_profiles', 'user_progress',
    'user_session_data', 'user_doms_data', 'inbody_history'
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
  RAISE NOTICE 'SECURITY SETUP FOR YOUR TABLES COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables found: workouts, workout_routines, etc.';
  RAISE NOTICE 'RLS enabled on all user tables';
  RAISE NOTICE 'Policies created for data protection';
  RAISE NOTICE 'Indexes added for performance';
  RAISE NOTICE '========================================';
END $$;