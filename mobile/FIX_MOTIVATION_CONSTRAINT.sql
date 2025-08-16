-- Fix the motivation constraint error
-- Run this in Supabase SQL Editor

-- 1. Drop the incorrect constraint
ALTER TABLE doms_surveys 
DROP CONSTRAINT IF EXISTS doms_surveys_motivation_check;

-- 2. Add the correct constraint
ALTER TABLE doms_surveys 
ADD CONSTRAINT doms_surveys_motivation_check 
CHECK (motivation >= 1 AND motivation <= 10);

-- 3. Verify the fix
SELECT 
    tc.constraint_name, 
    cc.check_clause
FROM 
    information_schema.table_constraints tc
    JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
WHERE 
    tc.table_name = 'doms_surveys'
    AND tc.constraint_type = 'CHECK';