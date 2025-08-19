-- Add missing user_session_data table for RPE tracking
CREATE TABLE IF NOT EXISTS user_session_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_rpe INTEGER CHECK (session_rpe >= 0 AND session_rpe <= 10),
  duration_minutes INTEGER,
  total_load INTEGER,
  estimated_1rm JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for user_session_data
ALTER TABLE user_session_data ENABLE ROW LEVEL SECURITY;

-- Users can view their own session data
CREATE POLICY "Users can view own session data" ON user_session_data
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own session data
CREATE POLICY "Users can insert own session data" ON user_session_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own session data
CREATE POLICY "Users can update own session data" ON user_session_data
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own session data
CREATE POLICY "Users can delete own session data" ON user_session_data
  FOR DELETE USING (auth.uid() = user_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_session_data_user_id ON user_session_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_session_data_created_at ON user_session_data(created_at DESC);

-- Add function to clean up old session data (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_session_data()
RETURNS void AS $$
BEGIN
  DELETE FROM user_session_data 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create Supabase Edge Function (if not exists) for progression algorithm
-- Note: Edge functions must be deployed separately via Supabase CLI
-- This is just a placeholder comment to remind you to deploy the edge function