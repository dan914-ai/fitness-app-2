-- Run these queries in Supabase SQL Editor to check your tables

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('session_logs', 'doms_surveys');

-- 2. Check table structures
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'doms_surveys'
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('session_logs', 'doms_surveys');

-- 4. Test insert (replace with your actual user ID)
-- First, get your user ID:
SELECT id, email FROM auth.users WHERE email = 'dannyboy0914@gmail.com';

-- 5. If you need to fix the motivation column (there was a typo):
ALTER TABLE doms_surveys 
DROP CONSTRAINT IF EXISTS doms_surveys_motivation_check;

ALTER TABLE doms_surveys 
ADD CONSTRAINT doms_surveys_motivation_check 
CHECK (motivation >= 1 AND motivation <= 10);