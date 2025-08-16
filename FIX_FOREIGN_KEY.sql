-- Fix Foreign Key Constraints for Progression Engine
-- This fixes the user_id reference to point to auth.users correctly

-- 1. Drop existing foreign key constraints
ALTER TABLE session_logs DROP CONSTRAINT IF EXISTS session_logs_user_id_fkey;
ALTER TABLE doms_surveys DROP CONSTRAINT IF EXISTS doms_surveys_user_id_fkey;
ALTER TABLE readiness_metrics DROP CONSTRAINT IF EXISTS readiness_metrics_user_id_fkey;

-- 2. Add correct foreign key constraints pointing to auth.users
ALTER TABLE session_logs 
ADD CONSTRAINT session_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE doms_surveys 
ADD CONSTRAINT doms_surveys_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE readiness_metrics 
ADD CONSTRAINT readiness_metrics_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Verify the constraints are working
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('session_logs', 'doms_surveys', 'readiness_metrics');