-- Run this in your Supabase SQL Editor to create the tables

-- Create session_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS session_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  session_rpe INTEGER NOT NULL CHECK (session_rpe >= 0 AND session_rpe <= 10),
  duration_minutes INTEGER NOT NULL,
  total_load DECIMAL(10,2),
  exercise_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create doms_surveys table if it doesn't exist
CREATE TABLE IF NOT EXISTS doms_surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  chest_soreness INTEGER DEFAULT 0 CHECK (chest_soreness >= 0 AND chest_soreness <= 10),
  back_soreness INTEGER DEFAULT 0 CHECK (back_soreness >= 0 AND back_soreness <= 10),
  legs_soreness INTEGER DEFAULT 0 CHECK (legs_soreness >= 0 AND legs_soreness <= 10),
  arms_soreness INTEGER DEFAULT 0 CHECK (arms_soreness >= 0 AND arms_soreness <= 10),
  shoulders_soreness INTEGER DEFAULT 0 CHECK (shoulders_soreness >= 0 AND shoulders_soreness <= 10),
  core_soreness INTEGER DEFAULT 0 CHECK (core_soreness >= 0 AND core_soreness <= 10),
  overall_soreness INTEGER DEFAULT 0 CHECK (overall_soreness >= 0 AND overall_soreness <= 10),
  sleep_quality INTEGER DEFAULT 7 CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  energy_level INTEGER DEFAULT 7 CHECK (energy_level >= 1 AND energy_level <= 10),
  motivation INTEGER DEFAULT 7 CHECK (motivation >= 1 AND motivation_level <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE doms_surveys ENABLE ROW LEVEL SECURITY;

-- Create policies for users to manage their own data
CREATE POLICY "Users can insert own session logs" ON session_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own session logs" ON session_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own DOMS surveys" ON doms_surveys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own DOMS surveys" ON doms_surveys
  FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_session_logs_user_id ON session_logs(user_id);
CREATE INDEX idx_session_logs_created_at ON session_logs(created_at);
CREATE INDEX idx_doms_surveys_user_id ON doms_surveys(user_id);
CREATE INDEX idx_doms_surveys_created_at ON doms_surveys(created_at);