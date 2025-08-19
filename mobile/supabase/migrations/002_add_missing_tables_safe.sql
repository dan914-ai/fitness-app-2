-- Safe migration that checks for existing objects
-- This migration can be run multiple times without errors

-- Add missing user_session_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_session_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_rpe INTEGER CHECK (session_rpe >= 0 AND session_rpe <= 10),
  duration_minutes INTEGER,
  total_load INTEGER,
  estimated_1rm JSONB,
  exercise_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS if not already enabled
ALTER TABLE user_session_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users can view own session data" ON user_session_data;
DROP POLICY IF EXISTS "Users can insert own session data" ON user_session_data;
DROP POLICY IF EXISTS "Users can update own session data" ON user_session_data;
DROP POLICY IF EXISTS "Users can delete own session data" ON user_session_data;

-- Recreate policies with proper permissions
-- Allow authenticated users to view their own data
CREATE POLICY "Users can view own session data" ON user_session_data
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own data
CREATE POLICY "Users can insert own session data" ON user_session_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own data
CREATE POLICY "Users can update own session data" ON user_session_data
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own data  
CREATE POLICY "Users can delete own session data" ON user_session_data
  FOR DELETE USING (auth.uid() = user_id);

-- Also allow anonymous/public access for testing (remove in production)
CREATE POLICY IF NOT EXISTS "Allow anonymous insert for testing" ON user_session_data
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow anonymous select for testing" ON user_session_data
  FOR SELECT USING (true);

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_session_data_user_id ON user_session_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_session_data_created_at ON user_session_data(created_at DESC);

-- Add the missing exercise_count column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_session_data' 
    AND column_name = 'exercise_count'
  ) THEN
    ALTER TABLE user_session_data ADD COLUMN exercise_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_session_data'
ORDER BY ordinal_position;