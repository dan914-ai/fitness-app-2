-- ============================================
-- SUPABASE SECURITY & OPTIMIZATION SQL
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- ============================================
-- SECTION 1: ENABLE ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all user tables
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 2: CREATE RLS POLICIES
-- ============================================

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "select_own_workouts" ON workouts;
DROP POLICY IF EXISTS "insert_own_workouts" ON workouts;
DROP POLICY IF EXISTS "update_own_workouts" ON workouts;
DROP POLICY IF EXISTS "delete_own_workouts" ON workouts;

DROP POLICY IF EXISTS "select_own_workout_exercises" ON workout_exercises;
DROP POLICY IF EXISTS "insert_own_workout_exercises" ON workout_exercises;
DROP POLICY IF EXISTS "update_own_workout_exercises" ON workout_exercises;
DROP POLICY IF EXISTS "delete_own_workout_exercises" ON workout_exercises;

DROP POLICY IF EXISTS "select_own_routines" ON routines;
DROP POLICY IF EXISTS "insert_own_routines" ON routines;
DROP POLICY IF EXISTS "update_own_routines" ON routines;
DROP POLICY IF EXISTS "delete_own_routines" ON routines;

DROP POLICY IF EXISTS "select_own_records" ON personal_records;
DROP POLICY IF EXISTS "insert_own_records" ON personal_records;
DROP POLICY IF EXISTS "update_own_records" ON personal_records;
DROP POLICY IF EXISTS "delete_own_records" ON personal_records;

DROP POLICY IF EXISTS "select_own_settings" ON user_settings;
DROP POLICY IF EXISTS "insert_own_settings" ON user_settings;
DROP POLICY IF EXISTS "update_own_settings" ON user_settings;
DROP POLICY IF EXISTS "delete_own_settings" ON user_settings;

-- Workouts policies - users can only access their own workouts
CREATE POLICY "select_own_workouts" ON workouts 
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "insert_own_workouts" ON workouts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "update_own_workouts" ON workouts 
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "delete_own_workouts" ON workouts 
  FOR DELETE USING (auth.uid() = user_id);

-- Workout exercises policies - access via workout ownership
CREATE POLICY "select_own_workout_exercises" ON workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "insert_own_workout_exercises" ON workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "update_own_workout_exercises" ON workout_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "delete_own_workout_exercises" ON workout_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- Routines policies - users can only access their own routines
CREATE POLICY "select_own_routines" ON routines 
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "insert_own_routines" ON routines 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "update_own_routines" ON routines 
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "delete_own_routines" ON routines 
  FOR DELETE USING (auth.uid() = user_id);

-- Personal records policies - users can only access their own records
CREATE POLICY "select_own_records" ON personal_records 
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "insert_own_records" ON personal_records 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "update_own_records" ON personal_records 
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "delete_own_records" ON personal_records 
  FOR DELETE USING (auth.uid() = user_id);

-- User settings policies - users can only access their own settings
CREATE POLICY "select_own_settings" ON user_settings 
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "insert_own_settings" ON user_settings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "update_own_settings" ON user_settings 
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "delete_own_settings" ON user_settings 
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SECTION 3: ADD MISSING TIMESTAMPS
-- ============================================

-- Add created_at and updated_at to tables that are missing them
DO $$ 
BEGIN
  -- Add to workout_exercises if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'workout_exercises' 
                 AND column_name = 'created_at') THEN
    ALTER TABLE workout_exercises 
      ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'workout_exercises' 
                 AND column_name = 'updated_at') THEN
    ALTER TABLE workout_exercises 
      ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add updated_at to workouts if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'workouts' 
                 AND column_name = 'updated_at') THEN
    ALTER TABLE workouts 
      ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add updated_at to routines if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'routines' 
                 AND column_name = 'updated_at') THEN
    ALTER TABLE routines 
      ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add updated_at to personal_records if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'personal_records' 
                 AND column_name = 'updated_at') THEN
    ALTER TABLE personal_records 
      ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add updated_at to user_settings if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_settings' 
                 AND column_name = 'updated_at') THEN
    ALTER TABLE user_settings 
      ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- ============================================
-- SECTION 4: CREATE UPDATE TRIGGER
-- ============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_workouts_updated_at ON workouts;
DROP TRIGGER IF EXISTS update_workout_exercises_updated_at ON workout_exercises;
DROP TRIGGER IF EXISTS update_routines_updated_at ON routines;
DROP TRIGGER IF EXISTS update_personal_records_updated_at ON personal_records;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_workouts_updated_at 
  BEFORE UPDATE ON workouts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workout_exercises_updated_at 
  BEFORE UPDATE ON workout_exercises 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_routines_updated_at 
  BEFORE UPDATE ON routines 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_personal_records_updated_at 
  BEFORE UPDATE ON personal_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON user_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SECTION 5: ADD CRITICAL INDEXES
-- ============================================

-- Create indexes for foreign keys and common queries (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_workouts_user_created 
  ON workouts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workouts_user_id 
  ON workouts(user_id);

CREATE INDEX IF NOT EXISTS idx_workouts_created_at 
  ON workouts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout 
  ON workout_exercises(workout_id, order_index);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id 
  ON workout_exercises(workout_id);

CREATE INDEX IF NOT EXISTS idx_routines_user_active 
  ON routines(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_routines_user_id 
  ON routines(user_id);

CREATE INDEX IF NOT EXISTS idx_personal_records_user_exercise 
  ON personal_records(user_id, exercise_id);

CREATE INDEX IF NOT EXISTS idx_personal_records_date 
  ON personal_records(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id 
  ON user_settings(user_id);

-- ============================================
-- SECTION 6: ADD IDEMPOTENCY CONSTRAINTS
-- ============================================

-- Add unique constraint to prevent duplicate workouts (idempotency)
-- First, add client_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'workouts' 
                 AND column_name = 'client_id') THEN
    ALTER TABLE workouts ADD COLUMN client_id UUID;
  END IF;
END $$;

-- Add unique constraint for client_id (prevents duplicate submissions)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                 WHERE conname = 'uq_workout_client_id') THEN
    ALTER TABLE workouts 
      ADD CONSTRAINT uq_workout_client_id UNIQUE (user_id, client_id);
  END IF;
END $$;

-- Add unique constraint for start_time (prevents workouts at exact same time)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                 WHERE conname = 'uq_workout_start') THEN
    ALTER TABLE workouts 
      ADD CONSTRAINT uq_workout_start UNIQUE (user_id, start_time);
  END IF;
EXCEPTION
  WHEN unique_violation THEN
    -- If there are duplicates, don't add the constraint
    RAISE NOTICE 'Duplicate start_time values exist. Constraint not added.';
END $$;

-- Add unique constraint for workout_exercises order
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                 WHERE conname = 'uq_we_workout_order') THEN
    ALTER TABLE workout_exercises 
      ADD CONSTRAINT uq_we_workout_order UNIQUE (workout_id, order_index);
  END IF;
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'Duplicate order_index values exist. Constraint not added.';
END $$;

-- ============================================
-- SECTION 7: VERIFY SECURITY STATUS
-- ============================================

-- Check RLS status on all important tables
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ ENABLED'
    ELSE '❌ DISABLED - SECURITY RISK!'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'workouts', 
    'workout_exercises', 
    'routines', 
    'personal_records', 
    'user_settings'
  )
ORDER BY tablename;

-- Count policies per table
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ Fully Protected'
    WHEN COUNT(*) > 0 THEN '⚠️  Partially Protected'
    ELSE '❌ No Policies!'
  END as protection_status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'workouts', 
    'workout_exercises', 
    'routines', 
    'personal_records', 
    'user_settings'
  )
GROUP BY schemaname, tablename
ORDER BY tablename;

-- ============================================
-- SECTION 8: PERFORMANCE CHECK
-- ============================================

-- List all indexes on our main tables
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'workouts', 
    'workout_exercises', 
    'routines', 
    'personal_records', 
    'user_settings'
  )
ORDER BY tablename, indexname;

-- ============================================
-- SECTION 9: CLEANUP & OPTIMIZATION
-- ============================================

-- Analyze tables for query optimizer
ANALYZE workouts;
ANALYZE workout_exercises;
ANALYZE routines;
ANALYZE personal_records;
ANALYZE user_settings;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SECURITY SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Check the results above to verify:';
  RAISE NOTICE '1. RLS is ENABLED on all tables';
  RAISE NOTICE '2. Each table has 4 policies (CRUD)';
  RAISE NOTICE '3. Indexes are created';
  RAISE NOTICE '4. Timestamps and triggers are set';
  RAISE NOTICE '========================================';
END $$;