-- Complete SQL to fix DOMS survey table
-- Run this entire script in Supabase SQL Editor

-- 1. First check the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'doms_surveys'
ORDER BY ordinal_position;

-- 2. Disable RLS temporarily
ALTER TABLE doms_surveys DISABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs DISABLE ROW LEVEL SECURITY;

-- 3. Grant permissions
GRANT ALL ON doms_surveys TO authenticated;
GRANT ALL ON session_logs TO authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 4. Clear old test data
DELETE FROM doms_surveys 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'dannyboy0914@gmail.com');

-- 5. Test insert with all required fields including date
INSERT INTO doms_surveys (
    user_id,
    date,
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
    CURRENT_DATE,
    2, 2, 2, 2, 2, 2, 2, 3, 5, 7
) RETURNING *;

-- 6. Verify the data was inserted correctly
SELECT * FROM doms_surveys 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'dannyboy0914@gmail.com')
ORDER BY created_at DESC;