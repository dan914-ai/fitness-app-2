-- Create user_doms_data table for storing Daily Optimal Muscle Soreness surveys
CREATE TABLE IF NOT EXISTS user_doms_data (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  overall_soreness integer CHECK (overall_soreness >= 1 AND overall_soreness <= 10),
  motivation integer CHECK (motivation >= 1 AND motivation <= 10),
  readiness_score numeric(3, 1),
  survey_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_doms_data_user_id ON user_doms_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_doms_data_survey_date ON user_doms_data(survey_date);

-- Enable Row Level Security
ALTER TABLE user_doms_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own DOMS data" ON user_doms_data;
DROP POLICY IF EXISTS "Users can insert own DOMS data" ON user_doms_data;
DROP POLICY IF EXISTS "Users can update own DOMS data" ON user_doms_data;
DROP POLICY IF EXISTS "Users can delete own DOMS data" ON user_doms_data;

-- Create RLS policies
CREATE POLICY "Users can view own DOMS data" ON user_doms_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own DOMS data" ON user_doms_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own DOMS data" ON user_doms_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own DOMS data" ON user_doms_data
  FOR DELETE USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE user_doms_data IS 'Stores daily recovery and readiness survey data for users';