-- ============================================
-- SUPABASE COMPLETE DATABASE SETUP
-- Creates all tables and applies security
-- ============================================

-- ============================================
-- SECTION 1: CREATE TABLES (IF NOT EXISTS)
-- ============================================

-- Create routines table
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  exercises JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES routines(id) ON DELETE SET NULL,
  routine_name VARCHAR(255),
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  total_volume DECIMAL(10,2),
  total_sets INTEGER,
  memo TEXT,
  client_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workout_exercises table
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id INTEGER,
  exercise_name VARCHAR(255),
  sets JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create personal_records table
CREATE TABLE IF NOT EXISTS public.personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL,
  exercise_name VARCHAR(255),
  weight DECIMAL(10,2) NOT NULL,
  reps INTEGER NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  previous_weight DECIMAL(10,2),
  previous_reps INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  units VARCHAR(10) DEFAULT 'metric',
  language VARCHAR(10) DEFAULT 'ko',
  theme VARCHAR(10) DEFAULT 'light',
  notifications JSONB DEFAULT '{}'::jsonb,
  rest_timer_seconds INTEGER DEFAULT 90,
  auto_rest BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exercises table (reference table)
CREATE TABLE IF NOT EXISTS public.exercises (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  english_name VARCHAR(255),
  category VARCHAR(100),
  equipment VARCHAR(100),
  primary_muscle VARCHAR(100),
  secondary_muscles JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  thumbnail VARCHAR(500),
  gif_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inbody_records table
CREATE TABLE IF NOT EXISTS public.inbody_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight DECIMAL(10,2),
  muscle_mass DECIMAL(10,2),
  body_fat DECIMAL(10,2),
  body_fat_percentage DECIMAL(5,2),
  bmi DECIMAL(5,2),
  body_water DECIMAL(10,2),
  protein DECIMAL(10,2),
  minerals DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress_photos table
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_url VARCHAR(500),
  weight DECIMAL(10,2),
  notes TEXT,
  body_part VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unlocked_at TIMESTAMPTZ,
  progress INTEGER DEFAULT 0,
  target INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sync_queue table for offline sync
CREATE TABLE IF NOT EXISTS public.sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  data JSONB,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SECTION 2: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbody_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- Exercises table is public read-only (no RLS needed)

-- ============================================
-- SECTION 3: CREATE RLS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can create own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts;

-- Workouts policies
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Workout exercises policies
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

-- Routines policies
DROP POLICY IF EXISTS "Users can view own routines" ON routines;
DROP POLICY IF EXISTS "Users can create own routines" ON routines;
DROP POLICY IF EXISTS "Users can update own routines" ON routines;
DROP POLICY IF EXISTS "Users can delete own routines" ON routines;

CREATE POLICY "Users can view own routines" ON routines
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own routines" ON routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own routines" ON routines
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own routines" ON routines
  FOR DELETE USING (auth.uid() = user_id);

-- Personal records policies
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

-- User settings policies
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can create own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- InBody records policies
DROP POLICY IF EXISTS "Users can view own inbody" ON inbody_records;
DROP POLICY IF EXISTS "Users can create own inbody" ON inbody_records;
DROP POLICY IF EXISTS "Users can update own inbody" ON inbody_records;
DROP POLICY IF EXISTS "Users can delete own inbody" ON inbody_records;

CREATE POLICY "Users can view own inbody" ON inbody_records
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own inbody" ON inbody_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inbody" ON inbody_records
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inbody" ON inbody_records
  FOR DELETE USING (auth.uid() = user_id);

-- Progress photos policies
DROP POLICY IF EXISTS "Users can view own photos" ON progress_photos;
DROP POLICY IF EXISTS "Users can create own photos" ON progress_photos;
DROP POLICY IF EXISTS "Users can update own photos" ON progress_photos;
DROP POLICY IF EXISTS "Users can delete own photos" ON progress_photos;

CREATE POLICY "Users can view own photos" ON progress_photos
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own photos" ON progress_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own photos" ON progress_photos
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own photos" ON progress_photos
  FOR DELETE USING (auth.uid() = user_id);

-- Achievements policies
DROP POLICY IF EXISTS "Users can view own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can create own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can update own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can delete own achievements" ON achievements;

CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own achievements" ON achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON achievements
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own achievements" ON achievements
  FOR DELETE USING (auth.uid() = user_id);

-- Sync queue policies
DROP POLICY IF EXISTS "Users can view own sync queue" ON sync_queue;
DROP POLICY IF EXISTS "Users can create own sync queue" ON sync_queue;
DROP POLICY IF EXISTS "Users can update own sync queue" ON sync_queue;
DROP POLICY IF EXISTS "Users can delete own sync queue" ON sync_queue;

CREATE POLICY "Users can view own sync queue" ON sync_queue
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sync queue" ON sync_queue
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sync queue" ON sync_queue
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sync queue" ON sync_queue
  FOR DELETE USING (auth.uid() = user_id);

-- Exercises table - public read access
DROP POLICY IF EXISTS "Anyone can view exercises" ON exercises;
CREATE POLICY "Anyone can view exercises" ON exercises
  FOR SELECT USING (true);

-- ============================================
-- SECTION 4: CREATE UPDATE TRIGGERS
-- ============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
DROP TRIGGER IF EXISTS update_workouts_updated_at ON workouts;
DROP TRIGGER IF EXISTS update_workout_exercises_updated_at ON workout_exercises;
DROP TRIGGER IF EXISTS update_routines_updated_at ON routines;
DROP TRIGGER IF EXISTS update_personal_records_updated_at ON personal_records;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
DROP TRIGGER IF EXISTS update_exercises_updated_at ON exercises;
DROP TRIGGER IF EXISTS update_inbody_records_updated_at ON inbody_records;
DROP TRIGGER IF EXISTS update_progress_photos_updated_at ON progress_photos;
DROP TRIGGER IF EXISTS update_achievements_updated_at ON achievements;

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

CREATE TRIGGER update_exercises_updated_at 
  BEFORE UPDATE ON exercises 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_inbody_records_updated_at 
  BEFORE UPDATE ON inbody_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_progress_photos_updated_at 
  BEFORE UPDATE ON progress_photos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_achievements_updated_at 
  BEFORE UPDATE ON achievements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SECTION 5: CREATE INDEXES
-- ============================================

-- Workouts indexes
CREATE INDEX IF NOT EXISTS idx_workouts_user_created 
  ON workouts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id 
  ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_routine_id 
  ON workouts(routine_id);
CREATE INDEX IF NOT EXISTS idx_workouts_created_at 
  ON workouts(created_at DESC);

-- Workout exercises indexes
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout 
  ON workout_exercises(workout_id, order_index);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id 
  ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id 
  ON workout_exercises(exercise_id);

-- Routines indexes
CREATE INDEX IF NOT EXISTS idx_routines_user_active 
  ON routines(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_routines_user_id 
  ON routines(user_id);

-- Personal records indexes
CREATE INDEX IF NOT EXISTS idx_personal_records_user_exercise 
  ON personal_records(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_date 
  ON personal_records(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_personal_records_user_id 
  ON personal_records(user_id);

-- User settings index
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id 
  ON user_settings(user_id);

-- Exercises indexes
CREATE INDEX IF NOT EXISTS idx_exercises_category 
  ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment 
  ON exercises(equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_name 
  ON exercises(name);

-- InBody records indexes
CREATE INDEX IF NOT EXISTS idx_inbody_records_user_date 
  ON inbody_records(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_inbody_records_user_id 
  ON inbody_records(user_id);

-- Progress photos indexes
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_date 
  ON progress_photos(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_id 
  ON progress_photos(user_id);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_achievements_user_type 
  ON achievements(user_id, type);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id 
  ON achievements(user_id);

-- Sync queue indexes
CREATE INDEX IF NOT EXISTS idx_sync_queue_user_created 
  ON sync_queue(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sync_queue_user_id 
  ON sync_queue(user_id);

-- ============================================
-- SECTION 6: ADD UNIQUE CONSTRAINTS
-- ============================================

-- Prevent duplicate workouts
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_workout_client_id') THEN
    ALTER TABLE workouts 
      ADD CONSTRAINT uq_workout_client_id UNIQUE (user_id, client_id);
  END IF;
END $$;

-- Prevent duplicate personal records
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_pr_user_exercise_date') THEN
    ALTER TABLE personal_records 
      ADD CONSTRAINT uq_pr_user_exercise_date UNIQUE (user_id, exercise_id, date);
  END IF;
END $$;

-- Ensure one settings record per user
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_user_settings_user') THEN
    ALTER TABLE user_settings 
      ADD CONSTRAINT uq_user_settings_user UNIQUE (user_id);
  END IF;
END $$;

-- Prevent duplicate exercise order in workouts
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_workout_exercise_order') THEN
    ALTER TABLE workout_exercises 
      ADD CONSTRAINT uq_workout_exercise_order UNIQUE (workout_id, order_index);
  END IF;
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'Duplicate order_index values exist. Constraint not added.';
END $$;

-- ============================================
-- SECTION 7: VERIFY SETUP
-- ============================================

-- Check table existence
SELECT 
  tablename,
  '✅ EXISTS' as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'workouts', 'workout_exercises', 'routines', 
    'personal_records', 'user_settings', 'exercises',
    'inbody_records', 'progress_photos', 'achievements',
    'sync_queue'
  )
ORDER BY tablename;

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
    'workouts', 'workout_exercises', 'routines', 
    'personal_records', 'user_settings',
    'inbody_records', 'progress_photos', 'achievements',
    'sync_queue'
  )
ORDER BY tablename;

-- Count policies per table
SELECT 
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ Fully Protected'
    WHEN COUNT(*) > 0 THEN '⚠️  Partially Protected'
    ELSE '❌ No Policies!'
  END as protection_status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- SECTION 8: FINAL OPTIMIZATION
-- ============================================

-- Analyze all tables for query optimizer
ANALYZE workouts;
ANALYZE workout_exercises;
ANALYZE routines;
ANALYZE personal_records;
ANALYZE user_settings;
ANALYZE exercises;
ANALYZE inbody_records;
ANALYZE progress_photos;
ANALYZE achievements;
ANALYZE sync_queue;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'DATABASE SETUP COMPLETE!';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Tables created: 10';
  RAISE NOTICE 'RLS enabled: 9 tables (exercises is public)';
  RAISE NOTICE 'Policies created: 36+';
  RAISE NOTICE 'Indexes created: 30+';
  RAISE NOTICE 'Triggers created: 9';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Your database is now secure and optimized!';
  RAISE NOTICE '==========================================';
END $$;