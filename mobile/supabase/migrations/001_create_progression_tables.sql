-- Create users table if not exists
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_doms_data table for recovery tracking
CREATE TABLE IF NOT EXISTS public.user_doms_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  overall_soreness INTEGER CHECK (overall_soreness >= 1 AND overall_soreness <= 10),
  motivation INTEGER CHECK (motivation >= 1 AND motivation <= 10),
  
  -- Detailed soreness tracking
  chest_soreness INTEGER CHECK (chest_soreness >= 0 AND chest_soreness <= 10) DEFAULT 0,
  back_soreness INTEGER CHECK (back_soreness >= 0 AND back_soreness <= 10) DEFAULT 0,
  shoulders_soreness INTEGER CHECK (shoulders_soreness >= 0 AND shoulders_soreness <= 10) DEFAULT 0,
  arms_soreness INTEGER CHECK (arms_soreness >= 0 AND arms_soreness <= 10) DEFAULT 0,
  legs_soreness INTEGER CHECK (legs_soreness >= 0 AND legs_soreness <= 10) DEFAULT 0,
  core_soreness INTEGER CHECK (core_soreness >= 0 AND core_soreness <= 10) DEFAULT 0,
  
  -- Additional metrics
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  nutrition_quality INTEGER CHECK (nutrition_quality >= 1 AND nutrition_quality <= 10),
  hydration_level INTEGER CHECK (hydration_level >= 1 AND hydration_level <= 10),
  
  survey_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one survey per day per user
  UNIQUE(user_id, survey_date)
);

-- Create user_session_data table for workout RPE tracking
CREATE TABLE IF NOT EXISTS public.user_session_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_rpe INTEGER CHECK (session_rpe >= 1 AND session_rpe <= 10),
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  total_load NUMERIC(10, 2),
  exercise_count INTEGER DEFAULT 0,
  
  -- Additional session metrics
  session_type TEXT CHECK (session_type IN ('strength', 'cardio', 'mixed', 'recovery')),
  body_weight NUMERIC(5, 2),
  session_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_user_doms_data_user_id ON public.user_doms_data(user_id);
CREATE INDEX idx_user_doms_data_survey_date ON public.user_doms_data(survey_date DESC);
CREATE INDEX idx_user_session_data_user_id ON public.user_session_data(user_id);
CREATE INDEX idx_user_session_data_created_at ON public.user_session_data(created_at DESC);

-- Create RLS (Row Level Security) policies
ALTER TABLE public.user_doms_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_session_data ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own recovery data" ON public.user_doms_data
  FOR SELECT USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can insert own recovery data" ON public.user_doms_data
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can update own recovery data" ON public.user_doms_data
  FOR UPDATE USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can delete own recovery data" ON public.user_doms_data
  FOR DELETE USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can view own session data" ON public.user_session_data
  FOR SELECT USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can insert own session data" ON public.user_session_data
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can update own session data" ON public.user_session_data
  FOR UPDATE USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can delete own session data" ON public.user_session_data
  FOR DELETE USING (auth.uid()::TEXT = user_id::TEXT);

-- Create Edge Function for progression algorithm (optional)
-- This would be deployed separately through Supabase CLI