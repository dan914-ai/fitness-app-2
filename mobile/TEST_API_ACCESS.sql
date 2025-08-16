-- Test if the API can access ANY table
-- Run this in Supabase SQL Editor

-- 1. Create a super simple test table
DROP TABLE IF EXISTS test_table;
CREATE TABLE test_table (
  id SERIAL PRIMARY KEY,
  message TEXT
);

-- 2. Disable all security
ALTER TABLE test_table DISABLE ROW LEVEL SECURITY;
GRANT ALL ON test_table TO anon, authenticated, service_role;
GRANT ALL ON SEQUENCE test_table_id_seq TO anon, authenticated, service_role;

-- 3. Insert test data
INSERT INTO test_table (message) VALUES ('Hello from SQL');

-- 4. Check what tables are visible
SELECT schemaname, tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5. Check your Supabase project settings
-- IMPORTANT: In your Supabase Dashboard, go to:
-- Settings > API > Check that "Schema" includes "public"
-- Make sure the API is enabled for your project