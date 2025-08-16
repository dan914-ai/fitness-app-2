-- Run this in Supabase SQL Editor to see what tables exist

-- 1. List all tables in public schema
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename LIKE '%doms%' OR tablename LIKE '%session%';

-- 3. Check if you can access the tables directly
SELECT COUNT(*) as count FROM public.doms_surveys;
SELECT COUNT(*) as count FROM public.session_logs;

-- 4. Try inserting test data directly
INSERT INTO public.doms_surveys (
    user_id,
    chest_soreness,
    sleep_quality,
    energy_level,
    motivation
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'dannyboy0914@gmail.com'),
    5,
    5,
    5,
    5
) RETURNING *;