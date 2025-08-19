-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.user_session_data CASCADE;
DROP TABLE IF EXISTS public.user_doms_data CASCADE;
DROP TABLE IF EXISTS public.workout_history CASCADE;
DROP TABLE IF EXISTS public.workout_exercises CASCADE;
DROP TABLE IF EXISTS public.workout_sets CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.inbody_history CASCADE;
DROP TABLE IF EXISTS public.workout_programs CASCADE;
DROP TABLE IF EXISTS public.program_enrollments CASCADE;

-- Create user_profiles table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_doms_data table
CREATE TABLE public.user_doms_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    survey_date DATE NOT NULL,
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    overall_soreness INTEGER CHECK (overall_soreness >= 1 AND overall_soreness <= 10),
    motivation INTEGER CHECK (motivation >= 1 AND motivation <= 10),
    readiness_score DECIMAL(3,1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, survey_date)
);

-- Create user_session_data table
CREATE TABLE public.user_session_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    session_rpe INTEGER CHECK (session_rpe >= 1 AND session_rpe <= 10),
    session_duration INTEGER, -- in minutes
    session_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create workout_history table
CREATE TABLE public.workout_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER, -- in seconds
    total_volume DECIMAL(10,2),
    total_sets INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create workout_exercises table
CREATE TABLE public.workout_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_id UUID NOT NULL REFERENCES workout_history(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    exercise_id TEXT,
    order_index INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create workout_sets table
CREATE TABLE public.workout_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    reps INTEGER,
    weight DECIMAL(10,2),
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
    rest_seconds INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create inbody_history table
CREATE TABLE public.inbody_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    skeletal_muscle_mass DECIMAL(5,2),
    bmi DECIMAL(4,2),
    body_fat_mass DECIMAL(5,2),
    basal_metabolic_rate INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Create workout_programs table
CREATE TABLE public.workout_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration_weeks INTEGER,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    program_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create program_enrollments table
CREATE TABLE public.program_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    current_week INTEGER DEFAULT 1,
    current_day INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    progress_data JSONB,
    UNIQUE(user_id, program_id, started_at)
);

-- Create indexes for better query performance
CREATE INDEX idx_user_doms_data_user_id ON user_doms_data(user_id);
CREATE INDEX idx_user_doms_data_survey_date ON user_doms_data(survey_date DESC);
CREATE INDEX idx_user_session_data_user_id ON user_session_data(user_id);
CREATE INDEX idx_user_session_data_session_date ON user_session_data(session_date DESC);
CREATE INDEX idx_workout_history_user_id ON workout_history(user_id);
CREATE INDEX idx_workout_history_date ON workout_history(date DESC);
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX idx_workout_sets_exercise_id ON workout_sets(exercise_id);
CREATE INDEX idx_inbody_history_user_id ON inbody_history(user_id);
CREATE INDEX idx_inbody_history_date ON inbody_history(date DESC);
CREATE INDEX idx_program_enrollments_user_id ON program_enrollments(user_id);
CREATE INDEX idx_program_enrollments_active ON program_enrollments(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_doms_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_session_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbody_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- User profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- DOMS data
CREATE POLICY "Users can view own DOMS data" ON user_doms_data
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own DOMS data" ON user_doms_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own DOMS data" ON user_doms_data
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own DOMS data" ON user_doms_data
    FOR DELETE USING (auth.uid() = user_id);

-- Session data
CREATE POLICY "Users can view own session data" ON user_session_data
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own session data" ON user_session_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own session data" ON user_session_data
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own session data" ON user_session_data
    FOR DELETE USING (auth.uid() = user_id);

-- Workout history
CREATE POLICY "Users can view own workout history" ON workout_history
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout history" ON workout_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout history" ON workout_history
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout history" ON workout_history
    FOR DELETE USING (auth.uid() = user_id);

-- Workout exercises
CREATE POLICY "Users can view own workout exercises" ON workout_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workout_history 
            WHERE workout_history.id = workout_exercises.workout_id 
            AND workout_history.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert own workout exercises" ON workout_exercises
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

-- Workout sets
CREATE POLICY "Users can view own workout sets" ON workout_sets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workout_exercises
            JOIN workout_history ON workout_history.id = workout_exercises.workout_id
            WHERE workout_exercises.id = workout_sets.exercise_id 
            AND workout_history.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert own workout sets" ON workout_sets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workout_exercises
            JOIN workout_history ON workout_history.id = workout_exercises.workout_id
            WHERE workout_exercises.id = workout_sets.exercise_id 
            AND workout_history.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update own workout sets" ON workout_sets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workout_exercises
            JOIN workout_history ON workout_history.id = workout_exercises.workout_id
            WHERE workout_exercises.id = workout_sets.exercise_id 
            AND workout_history.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can delete own workout sets" ON workout_sets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workout_exercises
            JOIN workout_history ON workout_history.id = workout_exercises.workout_id
            WHERE workout_exercises.id = workout_sets.exercise_id 
            AND workout_history.user_id = auth.uid()
        )
    );

-- InBody history
CREATE POLICY "Users can view own InBody data" ON inbody_history
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own InBody data" ON inbody_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own InBody data" ON inbody_history
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own InBody data" ON inbody_history
    FOR DELETE USING (auth.uid() = user_id);

-- Workout programs (public read, admin write)
CREATE POLICY "Anyone can view active programs" ON workout_programs
    FOR SELECT USING (is_active = true);

-- Program enrollments
CREATE POLICY "Users can view own enrollments" ON program_enrollments
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own enrollments" ON program_enrollments
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments" ON program_enrollments
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own enrollments" ON program_enrollments
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to calculate readiness score
CREATE OR REPLACE FUNCTION calculate_readiness_score(
    p_sleep_quality INTEGER,
    p_energy_level INTEGER,
    p_overall_soreness INTEGER,
    p_motivation INTEGER
)
RETURNS DECIMAL(3,1) AS $$
BEGIN
    RETURN ROUND(
        (p_sleep_quality * 0.3 + 
         p_energy_level * 0.3 + 
         (10 - p_overall_soreness) * 0.2 + 
         p_motivation * 0.2)::DECIMAL, 
        1
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to auto-calculate readiness score
CREATE OR REPLACE FUNCTION update_readiness_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.readiness_score := calculate_readiness_score(
        NEW.sleep_quality,
        NEW.energy_level,
        NEW.overall_soreness,
        NEW.motivation
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_readiness_before_insert
    BEFORE INSERT ON user_doms_data
    FOR EACH ROW
    EXECUTE FUNCTION update_readiness_score();

CREATE TRIGGER calculate_readiness_before_update
    BEFORE UPDATE ON user_doms_data
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION update_readiness_score();