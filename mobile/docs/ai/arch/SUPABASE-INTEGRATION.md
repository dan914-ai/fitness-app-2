# Supabase Integration Documentation

## Overview
The fitness app uses Supabase as its Backend-as-a-Service (BaaS) platform, providing authentication, database, real-time subscriptions, and file storage capabilities.

## Supabase Configuration

### Connection Details
```typescript
// src/config/supabase.ts
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: undefined, // Uses AsyncStorage for React Native
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Environment Variables Required
```bash
EXPO_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ[...]  # Public anon key
```

## Database Schema (PostgreSQL)

### Core Tables

#### users (Managed by Supabase Auth)
```sql
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password VARCHAR(255),
  email_confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  raw_user_meta_data JSONB,
  -- Metadata includes: username, avatar_url, etc.
);
```

#### workouts
```sql
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES routines(id),
  routine_name VARCHAR(255),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  total_volume DECIMAL(10,2),
  total_sets INTEGER,
  memo TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_created_at ON workouts(created_at DESC);
```

#### workout_exercises
```sql
CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id INTEGER,
  exercise_name VARCHAR(255),
  sets JSONB, -- Array of set objects
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Example sets JSON structure:
-- [
--   {"weight": 50, "reps": 10, "completed": true, "rest_seconds": 90},
--   {"weight": 50, "reps": 8, "completed": true, "rest_seconds": 90}
-- ]
```

#### routines
```sql
CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  exercises JSONB, -- Array of exercise IDs and configurations
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_routines_user_id ON routines(user_id);
```

#### personal_records
```sql
CREATE TABLE public.personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL,
  weight DECIMAL(10,2) NOT NULL,
  reps INTEGER NOT NULL,
  date DATE NOT NULL,
  previous_weight DECIMAL(10,2),
  previous_reps INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_pr_user_exercise ON personal_records(user_id, exercise_id);
```

#### user_settings
```sql
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  units VARCHAR(10) DEFAULT 'metric', -- 'metric' or 'imperial'
  language VARCHAR(10) DEFAULT 'ko',
  theme VARCHAR(10) DEFAULT 'light',
  notifications JSONB DEFAULT '{}',
  rest_timer_seconds INTEGER DEFAULT 90,
  auto_rest BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Workouts policies
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables...
```

## Storage Buckets

### exercise-gifs
```typescript
// Bucket configuration
{
  name: 'exercise-gifs',
  public: true, // Public read access
  fileSizeLimit: 10485760, // 10MB
  allowedMimeTypes: ['image/gif', 'image/webp']
}

// File structure:
// /exercise-gifs/
//   ├── chest/
//   │   ├── bench-press.gif
//   │   └── push-ups.gif
//   ├── back/
//   │   ├── pull-ups.gif
//   │   └── rows.gif
//   └── legs/
//       ├── squats.gif
//       └── lunges.gif
```

### exercise-thumbnails
```typescript
{
  name: 'exercise-thumbnails',
  public: true,
  fileSizeLimit: 1048576, // 1MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
}
```

### progress-photos
```typescript
{
  name: 'progress-photos',
  public: false, // Private - requires authentication
  fileSizeLimit: 5242880, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/png']
}
```

## Authentication Flow

### 1. Sign Up
```typescript
// auth.service.supabase.ts
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { username }, // Custom metadata
    emailRedirectTo: `${window.location.origin}/auth/confirm`
  }
});
```

### 2. Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
// Returns: session with access_token and refresh_token
```

### 3. Session Management
```typescript
// Auto-refresh handled by Supabase client
supabase.auth.onAuthStateChange(async (event, session) => {
  switch(event) {
    case 'SIGNED_IN':
      // Store tokens in AsyncStorage
      break;
    case 'SIGNED_OUT':
      // Clear local storage
      break;
    case 'TOKEN_REFRESHED':
      // Update stored tokens
      break;
  }
});
```

### 4. Email Verification
```typescript
// After signup, verify email token
await supabase.auth.verifyOtp({
  email,
  token,
  type: 'email'
});
```

## API Integration Patterns

### 1. Authenticated Requests
```typescript
// All requests automatically include auth headers when session exists
const { data, error } = await supabase
  .from('workouts')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

### 2. Real-time Subscriptions (Future)
```typescript
const subscription = supabase
  .channel('workouts')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'workouts' },
    (payload) => {
      console.log('New workout:', payload.new);
    }
  )
  .subscribe();
```

### 3. File Upload
```typescript
const { data, error } = await supabase.storage
  .from('exercise-gifs')
  .upload(`${category}/${fileName}`, file, {
    cacheControl: '3600',
    contentType: 'image/gif',
    upsert: false
  });
```

### 4. File Retrieval
```typescript
const { data } = supabase.storage
  .from('exercise-gifs')
  .getPublicUrl(fileName);
// Returns: https://[PROJECT_ID].supabase.co/storage/v1/object/public/exercise-gifs/[fileName]
```

## Error Handling

### Common Supabase Errors
```typescript
// Auth errors
{
  code: 'invalid_credentials',
  message: 'Invalid login credentials'
}

// Database errors
{
  code: '23505', // Unique violation
  message: 'Duplicate key value violates unique constraint'
}

// Storage errors
{
  code: 'PayloadTooLarge',
  message: 'The object exceeded the maximum allowed size'
}

// Network errors
{
  code: 'NetworkError',
  message: 'Failed to fetch'
}
```

### Error Handling Strategy
```typescript
try {
  const { data, error } = await supabase.from('workouts').insert(workout);
  
  if (error) {
    if (error.code === '23505') {
      throw new Error('This workout already exists');
    }
    throw error;
  }
  
  return data;
} catch (error) {
  // Log to analytics
  console.error('Supabase error:', error);
  
  // Handle offline scenario
  if (error.message === 'Failed to fetch') {
    // Add to sync queue
    await addToSyncQueue('INSERT', 'workouts', workout);
  }
  
  throw error;
}
```

## Offline Support Strategy

### 1. Queue Operations When Offline
```typescript
// When offline, queue operations
const syncQueue = {
  id: generateId(),
  operation: 'INSERT',
  table: 'workouts',
  data: workoutData,
  timestamp: Date.now(),
  retryCount: 0
};

await AsyncStorage.setItem(`sync_${syncQueue.id}`, JSON.stringify(syncQueue));
```

### 2. Sync When Online
```typescript
// Process sync queue when connection restored
const syncItems = await getSyncQueue();

for (const item of syncItems) {
  try {
    const { error } = await supabase
      .from(item.table)
      [item.operation.toLowerCase()](item.data);
    
    if (!error) {
      await removeSyncItem(item.id);
    }
  } catch (error) {
    item.retryCount++;
    if (item.retryCount > MAX_RETRY) {
      await markSyncItemFailed(item.id);
    }
  }
}
```

## Performance Optimizations

### 1. Connection Pooling
```typescript
// Supabase handles connection pooling automatically
// Max connections per project: 60 (Free tier)
```

### 2. Query Optimization
```typescript
// Use select to limit fields
const { data } = await supabase
  .from('workouts')
  .select('id, routine_name, created_at') // Only needed fields
  .eq('user_id', userId)
  .limit(20); // Pagination

// Use indexes for frequent queries
// Created in database: idx_workouts_user_id, idx_workouts_created_at
```

### 3. Caching Strategy
```typescript
// Cache frequently accessed data
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedExercises = async () => {
  const cached = await AsyncStorage.getItem('exercises_cache');
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  // Fetch fresh data
  const { data } = await supabase.from('exercises').select('*');
  await AsyncStorage.setItem('exercises_cache', JSON.stringify({
    data,
    timestamp: Date.now()
  }));
  
  return data;
};
```

## Monitoring & Analytics

### Key Metrics to Track
1. **Authentication**:
   - Sign-up rate
   - Login success/failure rate
   - Token refresh frequency
   - Session duration

2. **Database**:
   - Query performance (p50, p95, p99)
   - Most frequent queries
   - Slow queries (>1s)
   - Connection pool usage

3. **Storage**:
   - Upload/download success rate
   - Bandwidth usage
   - Storage capacity
   - CDN cache hit rate

4. **Errors**:
   - Error rate by type
   - Network timeout frequency
   - RLS policy violations
   - Rate limit hits

## Security Best Practices

### 1. Environment Variables
- Never commit Supabase keys to version control
- Use different keys for development/production
- Rotate keys periodically

### 2. Row Level Security
- Enable RLS on all tables
- Test policies thoroughly
- Use service role key only on backend

### 3. API Security
- Implement rate limiting
- Validate all inputs
- Use prepared statements
- Sanitize user-generated content

### 4. Storage Security
- Set appropriate bucket policies
- Validate file types and sizes
- Scan uploads for malware
- Use signed URLs for private content

## Migration Guide

### From Mock Auth to Supabase Auth
```typescript
// 1. Update environment variables
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key

// 2. Switch auth service
// Change: import { mockAuthService } from './mock.service';
// To: import { authService } from './auth.service.supabase';

// 3. Update login/register screens to use Supabase service

// 4. Migrate existing users (one-time script)
const migrateUsers = async () => {
  const localUsers = await AsyncStorage.getItem('mock_users');
  for (const user of localUsers) {
    await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true
    });
  }
};
```

## Troubleshooting

### Common Issues

1. **"Failed to fetch" errors**
   - Check internet connection
   - Verify Supabase URL is correct
   - Check if project is paused (free tier)

2. **Authentication failures**
   - Verify email confirmation settings
   - Check if user exists in auth.users table
   - Ensure tokens are not expired

3. **RLS policy violations**
   - Check if user is authenticated
   - Verify policy conditions
   - Test with service role key (development only)

4. **Storage upload failures**
   - Check file size limits
   - Verify MIME types allowed
   - Ensure bucket exists and is configured

5. **Slow queries**
   - Add appropriate indexes
   - Limit result sets with pagination
   - Use select to reduce payload size
   - Consider caching frequently accessed data