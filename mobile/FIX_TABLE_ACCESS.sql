-- Fix table access issues
-- Run this in Supabase SQL Editor

-- 1. Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('doms_surveys', 'session_logs');

-- 2. Disable RLS temporarily to test
ALTER TABLE doms_surveys DISABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs DISABLE ROW LEVEL SECURITY;

-- 3. Grant permissions
GRANT ALL ON doms_surveys TO authenticated;
GRANT ALL ON session_logs TO authenticated;
GRANT ALL ON doms_surveys TO anon;
GRANT ALL ON session_logs TO anon;

-- 4. Test insert
INSERT INTO doms_surveys (
    user_id,
    chest_soreness,
    back_soreness,
    legs_soreness,
    arms_soreness,
    shoulders_soreness,
    core_soreness,
    overall_soreness,
    sleep_quality,
    energy_level,
    motivation
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'dannyboy0914@gmail.com'),
    2, 2, 2, 2, 2, 2, 2, 3, 5, 7
) RETURNING *;