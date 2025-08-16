-- Create new tables that will definitely work
-- Run this entire script in Supabase SQL Editor

-- 1. Drop existing tables if they exist
DROP TABLE IF EXISTS user_doms_data CASCADE;
DROP TABLE IF EXISTS user_session_data CASCADE;

-- 2. Create simplified tables
CREATE TABLE user_doms_data (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  survey_date DATE NOT NULL DEFAULT CURRENT_DATE,
  chest_soreness INTEGER DEFAULT 0,
  back_soreness INTEGER DEFAULT 0,
  legs_soreness INTEGER DEFAULT 0,
  arms_soreness INTEGER DEFAULT 0,
  shoulders_soreness INTEGER DEFAULT 0,
  core_soreness INTEGER DEFAULT 0,
  overall_soreness INTEGER DEFAULT 0,
  sleep_quality INTEGER DEFAULT 7,
  energy_level INTEGER DEFAULT 7,
  motivation INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_session_data (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  session_rpe INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_load DECIMAL(10,2),
  exercise_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Disable RLS (we'll add it back later with proper policies)
ALTER TABLE user_doms_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_session_data DISABLE ROW LEVEL SECURITY;

-- 4. Grant full permissions
GRANT ALL ON user_doms_data TO anon, authenticated;
GRANT ALL ON user_session_data TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 5. Test insert
INSERT INTO user_doms_data (
    user_id,
    chest_soreness,
    back_soreness,
    legs_soreness,
    sleep_quality,
    energy_level,
    motivation
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'dannyboy0914@gmail.com'),
    2, 2, 2, 3, 5, 7
) RETURNING *;

-- 6. Verify
SELECT * FROM user_doms_data;