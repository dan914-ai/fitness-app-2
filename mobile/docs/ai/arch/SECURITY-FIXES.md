# Security Fixes - Critical Implementation Guide

## 🔴 HIGH-IMPACT ISSUES (Implement Immediately)

### 1. Mock-Auth Flags Environment Guard

**Risk**: Accidental authentication bypass in production

**Fix Implementation**:

```typescript
// src/navigation/AppNavigator.tsx - REPLACE ALL INSTANCES
const SKIP_LOGIN = __DEV__ && process.env.EXPO_PUBLIC_ENABLE_MOCK_AUTH === 'true';
const TEST_MODE = __DEV__ && process.env.EXPO_PUBLIC_ENABLE_MOCK_AUTH === 'true';

// src/contexts/MockAuthContext.tsx - ADD AT TOP
if (!__DEV__ || process.env.EXPO_PUBLIC_ENABLE_MOCK_AUTH !== 'true') {
  throw new Error('MockAuthContext cannot be used in production');
}
```

**CI/CD Check** (add to `.github/workflows/build.yml`):
```yaml
- name: Verify no mock auth in production
  run: |
    if [ "${{ github.ref }}" == "refs/heads/main" ] || [ "${{ github.ref }}" == "refs/heads/production" ]; then
      if grep -r "EXPO_PUBLIC_ENABLE_MOCK_AUTH=true" .; then
        echo "ERROR: Mock auth enabled in production build"
        exit 1
      fi
    fi
```

### 2. Public Endpoint Rate Limiting

**Risk**: API abuse, bandwidth spikes, scraping

**Supabase Edge Function** (`supabase/functions/rate-limiter/index.ts`):
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RATE_LIMITS = {
  '/exercises': { requests: 100, window: 3600 }, // 100 req/hour
  '/storage/gifs': { requests: 50, window: 3600 }, // 50 req/hour
  '/programs': { requests: 30, window: 3600 }, // 30 req/hour
};

serve(async (req) => {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const path = new URL(req.url).pathname;
  
  // Check rate limit
  const limit = RATE_LIMITS[path];
  if (limit) {
    const key = `rate:${ip}:${path}`;
    const count = await redis.incr(key);
    
    if (count === 1) {
      await redis.expire(key, limit.window);
    }
    
    if (count > limit.requests) {
      return new Response('Rate limit exceeded', { status: 429 });
    }
  }
  
  return fetch(req);
});
```

### 3. RLS Policy Implementation

**Risk**: Data leakage across users

**Execute these SQL commands**:
```sql
-- Enable RLS on all tables
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Workouts policies
CREATE POLICY "select_own_workouts" ON workouts 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_workouts" ON workouts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_workouts" ON workouts 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_workouts" ON workouts 
  FOR DELETE USING (auth.uid() = user_id);

-- Workout exercises policies (via workout ownership)
CREATE POLICY "select_own_workout_exercises" ON workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );
CREATE POLICY "insert_own_workout_exercises" ON workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );
CREATE POLICY "update_own_workout_exercises" ON workout_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );
CREATE POLICY "delete_own_workout_exercises" ON workout_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- Routines policies
CREATE POLICY "select_own_routines" ON routines 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_routines" ON routines 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_routines" ON routines 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_routines" ON routines 
  FOR DELETE USING (auth.uid() = user_id);

-- Personal records policies
CREATE POLICY "select_own_records" ON personal_records 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_records" ON personal_records 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_records" ON personal_records 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_records" ON personal_records 
  FOR DELETE USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "select_own_settings" ON user_settings 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_settings" ON user_settings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_settings" ON user_settings 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_settings" ON user_settings 
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Data Normalization Fix

**Risk**: Poor query performance, no constraints

**Migration to normalized structure**:
```sql
-- Create normalized sets table
CREATE TABLE workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight DECIMAL(10,2),
  reps INTEGER,
  completed BOOLEAN DEFAULT false,
  rest_seconds INTEGER,
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workout_exercise_id, set_number)
);

-- Create normalized routine exercises table
CREATE TABLE routine_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  sets_config JSONB, -- Default sets/reps/rest configuration
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(routine_id, order_index)
);

-- Migration function
CREATE OR REPLACE FUNCTION migrate_workout_sets() RETURNS void AS $$
DECLARE
  rec RECORD;
  set_data JSONB;
  set_num INTEGER;
BEGIN
  FOR rec IN SELECT id, sets FROM workout_exercises WHERE sets IS NOT NULL LOOP
    set_num := 1;
    FOR set_data IN SELECT * FROM jsonb_array_elements(rec.sets) LOOP
      INSERT INTO workout_sets (
        workout_exercise_id, set_number, weight, reps, 
        completed, rest_seconds
      ) VALUES (
        rec.id, set_num, 
        (set_data->>'weight')::DECIMAL,
        (set_data->>'reps')::INTEGER,
        (set_data->>'completed')::BOOLEAN,
        (set_data->>'rest_seconds')::INTEGER
      );
      set_num := set_num + 1;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run migration
SELECT migrate_workout_sets();
```

### 5. Missing Timestamps & Audit Fields

**Risk**: No audit trail, can't debug issues

```sql
-- Add timestamps to all tables
ALTER TABLE workout_exercises 
  ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE exercises 
  ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_workouts_updated_at 
  BEFORE UPDATE ON workouts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_routines_updated_at 
  BEFORE UPDATE ON routines 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON user_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 6. Missing Indexes

**Risk**: Slow queries, poor performance

```sql
-- Critical indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workouts_user_created 
  ON workouts(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workout_exercises_workout 
  ON workout_exercises(workout_id, order_index);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_routines_user_active 
  ON routines(user_id, is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_personal_records_user_exercise 
  ON personal_records(user_id, exercise_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_personal_records_date 
  ON personal_records(user_id, date DESC);

-- For the new normalized tables
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workout_sets_exercise 
  ON workout_sets(workout_exercise_id, set_number);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_routine_exercises_routine 
  ON routine_exercises(routine_id, order_index);
```

### 7. Idempotency Implementation

**Risk**: Duplicate workouts from double-taps

```sql
-- Add unique constraint to prevent duplicates
ALTER TABLE workouts 
  ADD COLUMN client_id UUID,
  ADD CONSTRAINT uq_workout_client_id UNIQUE (user_id, client_id);

-- Or use start_time uniqueness (simpler)
ALTER TABLE workouts 
  ADD CONSTRAINT uq_workout_start UNIQUE (user_id, start_time);
```

**Client-side implementation**:
```typescript
// src/services/workoutApi.ts
import { v4 as uuidv4 } from 'uuid';

const createWorkout = async (workoutData: WorkoutData) => {
  const clientId = uuidv4(); // Generate once per workout
  
  try {
    const { data, error } = await supabase
      .from('workouts')
      .insert({
        ...workoutData,
        client_id: clientId,
        user_id: user.id
      })
      .select()
      .single();
    
    if (error?.code === '23505') { // Duplicate key
      // Workout already exists, fetch it
      const { data: existing } = await supabase
        .from('workouts')
        .select()
        .eq('client_id', clientId)
        .single();
      
      return existing;
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};
```

### 8. Storage Security

**Risk**: Hotlinking, bandwidth theft

```typescript
// src/services/storage.service.ts
const getSignedUrl = async (path: string, expiresIn = 3600) => {
  const { data, error } = await supabase.storage
    .from('exercise-gifs')
    .createSignedUrl(path, expiresIn);
  
  if (error) throw error;
  return data.signedUrl;
};

// Use CDN for public assets
const PUBLIC_CDN = 'https://cdn.fitnessapp.com';
const getPublicAssetUrl = (path: string) => {
  return `${PUBLIC_CDN}/assets/${path}`;
};
```

## 🟡 MEDIUM-IMPACT FIXES

### 9. Pagination Implementation

```typescript
// src/services/api.service.ts
interface PaginationParams {
  limit?: number;
  cursor?: string;
  sort?: string;
}

const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 50;

const getWorkouts = async ({ 
  limit = DEFAULT_LIMIT, 
  cursor, 
  sort = 'created_at.desc' 
}: PaginationParams) => {
  const query = supabase
    .from('workouts')
    .select('*')
    .order(sort.split('.')[0], { ascending: sort.includes('asc') })
    .limit(Math.min(limit, MAX_LIMIT));
  
  if (cursor) {
    query.gt('id', cursor);
  }
  
  const { data, error } = await query;
  
  return {
    data,
    nextCursor: data?.length === limit ? data[data.length - 1].id : null
  };
};
```

### 10. Error Taxonomy

```typescript
// src/constants/errors.ts
export enum ErrorCode {
  // Auth errors
  AUTH_EXPIRED = 'ERR_AUTH_EXPIRED',
  AUTH_INVALID = 'ERR_AUTH_INVALID',
  
  // Input errors
  INPUT_INVALID = 'ERR_INPUT_INVALID',
  INPUT_MISSING = 'ERR_INPUT_MISSING',
  
  // Conflict errors
  CONFLICT_DUPLICATE = 'ERR_CONFLICT_DUP',
  CONFLICT_VERSION = 'ERR_CONFLICT_VERSION',
  
  // System errors
  SYSTEM_UNAVAILABLE = 'ERR_SYSTEM_UNAVAILABLE',
  SYSTEM_TIMEOUT = 'ERR_SYSTEM_TIMEOUT',
}

// src/utils/errorHandler.ts
export const formatError = (code: ErrorCode, message: string, hint?: string) => ({
  ok: false,
  error: {
    code,
    message,
    hint,
    timestamp: new Date().toISOString()
  }
});
```

## 📊 SQL Audit Scripts

### RLS Inventory Check
```sql
-- sql/rls_inventory.sql
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'workouts', 'workout_exercises', 'routines', 
    'personal_records', 'user_settings'
  )
ORDER BY tablename;
```

### Missing FK Indexes
```sql
-- sql/missing_fk_indexes.sql
SELECT
  c.conname AS constraint_name,
  c.conrelid::regclass AS table_name,
  a.attname AS column_name,
  'CREATE INDEX CONCURRENTLY idx_' || c.conrelid::regclass || '_' || a.attname || 
  ' ON ' || c.conrelid::regclass || '(' || a.attname || ');' as create_statement
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
LEFT JOIN pg_index i ON i.indrelid = c.conrelid AND a.attnum = ANY(i.indkey)
WHERE c.contype = 'f'
  AND i.indexrelid IS NULL
  AND c.connamespace = 'public'::regnamespace;
```

### Duplicate Indexes
```sql
-- sql/duplicate_indexes.sql
SELECT 
  pg_size_pretty(SUM(pg_relation_size(idx))::BIGINT) AS total_size,
  string_agg(idx::text, ', ') AS duplicate_indexes
FROM (
  SELECT 
    indexrelid::regclass AS idx, 
    indrelid, 
    indkey
  FROM pg_index
  WHERE indrelid IN (
    SELECT oid FROM pg_class 
    WHERE relnamespace = 'public'::regnamespace
  )
) sub
GROUP BY indrelid, indkey
HAVING COUNT(*) > 1;
```

### Unused Indexes
```sql
-- sql/unused_indexes.sql
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexrelname NOT LIKE 'pg_%'
ORDER BY pg_relation_size(indexrelid) DESC;
```

## 🚀 Implementation Priority

1. **TODAY**: Mock-auth environment guards + RLS policies
2. **TOMORROW**: Idempotency + Missing indexes
3. **THIS WEEK**: Data normalization + Pagination
4. **NEXT WEEK**: Rate limiting + Storage security

## 🔍 Verification Checklist

- [ ] All SKIP_LOGIN flags wrapped with `__DEV__` check
- [ ] RLS enabled on all user tables
- [ ] Indexes created on all foreign keys
- [ ] Idempotency implemented for workout creation
- [ ] Pagination added to all list endpoints
- [ ] Error taxonomy documented and implemented
- [ ] Rate limiting configured for public endpoints
- [ ] Storage using signed URLs for private content
- [ ] Audit fields added to all tables
- [ ] CI/CD checks for production build safety