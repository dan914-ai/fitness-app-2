# Supabase Integration Overview

## Supabase Project Details

### Project URL
- **URL**: `https://ayttqsgttuvdhvbvbnsk.supabase.co`
- **Project ID**: `ayttqsgttuvdhvbvbnsk`
- **Status**: Active and configured

### Authentication
- **Anon Key**: Configured in `.env` file
- **Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (truncated for security)

## How Supabase is Functioning in the App

### 1. **Storage System**
- **Bucket Name**: `exercise-gifs`
- **Purpose**: Stores all exercise GIF animations
- **Public Access**: Yes (publicly accessible URLs)
- **URL Format**: `https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/[muscle-group]/[filename].gif`

### 2. **Configuration Files**

#### `/src/config/supabase.ts`
- Main Supabase client configuration
- Exports helper functions:
  - `getExerciseGifUrl()` - Generate public URLs for GIFs
  - `uploadExerciseGif()` - Upload new GIFs to storage
  - `deleteExerciseGif()` - Remove GIFs from storage
  - `listExerciseGifs()` - List all GIFs in bucket

#### `.env`
- Contains Supabase credentials:
  ```
  EXPO_PUBLIC_SUPABASE_URL=https://ayttqsgttuvdhvbvbnsk.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-key]
  ```

### 3. **Data Flow**

```
Local App → Exercise Database → Supabase Storage URLs → Display GIFs
```

1. **Exercise Database** (`/src/data/exerciseDatabase.ts`)
   - Contains 309 exercises (after recent rebuild)
   - Each exercise has `imageUrl` and `thumbnailUrl` pointing to Supabase

2. **Static Thumbnails** (`/src/constants/staticThumbnails.ts`)
   - Maps exercise IDs to local thumbnail images
   - Used for fast list loading (avoids downloading GIFs for lists)

3. **Runtime Behavior**:
   - **List Views**: Use local thumbnails (JPEG) for performance
   - **Detail Views**: Load full GIFs from Supabase
   - **Offline Mode**: Falls back to local assets if available

### 4. **Storage Structure**

```
exercise-gifs/
├── abdominals/     (24 GIFs)
├── arms/           (2 GIFs)
├── back/           (47 GIFs)
├── biceps/         (25 GIFs)
├── calves/         (6 GIFs)
├── cardio/         (0 GIFs - need upload)
├── compound/       (1 GIF)
├── deltoids/       (39 GIFs)
├── forearms/       (5 GIFs)
├── glutes/         (15 GIFs)
├── hamstrings/     (15 GIFs)
├── legs/           (0 GIFs)
├── pectorals/      (46 GIFs)
├── quadriceps/     (45 GIFs)
├── traps/          (1 GIF)
└── triceps/        (26 GIFs)
```

**Total**: 272 GIFs currently on Supabase

### 5. **Current Status**

#### ✅ Working
- 272 exercises have working Supabase URLs
- Authentication is configured
- Storage bucket is accessible
- Public URLs are functioning

#### ⚠️ Needs Attention
- 37 exercises need GIFs uploaded to Supabase:
  - 5 cardio exercises
  - 9 compound exercises
  - 10 trap exercises
  - Others (see `scripts/to-upload.json`)

### 6. **Usage in Components**

The app uses Supabase URLs in several ways:

1. **Direct URL Usage**: Exercise database contains full Supabase URLs
2. **Helper Functions**: `getExerciseGifUrl()` generates URLs dynamically
3. **Fallback System**: Local thumbnails used when GIFs unavailable

### 7. **Security & Performance**

- **Public Bucket**: All GIFs are publicly accessible (no auth required)
- **Caching**: Browser/app caches reduce repeated downloads
- **Hybrid Approach**: Local thumbnails + remote GIFs balance performance and storage

## Complete Supabase Usage in App

### 1. **Authentication System** (`/src/services/auth.service.supabase.ts`)
- User login/signup
- Session management
- Token refresh
- Auth state monitoring
- Used in: Login/Signup screens, Navigation (checking auth state)

### 2. **Database Tables**

#### `user_doms_data`
- Stores user recovery/DOMS (Delayed Onset Muscle Soreness) data
- Fields: user_id, sleep, energy, soreness, motivation, created_at
- Used in: Recovery tracking, Progression suggestions

#### `user_session_data`
- Stores workout session data
- Fields: user_id, session_rpe (Rate of Perceived Exertion), created_at
- Used in: RPE tracking, Workout history

#### `workout_exercise_sets`
- Stores individual exercise set data
- Used in: Exercise tracking screen

#### `profiles` (implied from auth)
- User profile information
- Linked to Supabase Auth

### 3. **Storage Buckets**

#### `exercise-gifs`
- Public bucket for exercise animations
- 272 GIFs currently stored
- Organized by muscle group folders

### 4. **Edge Functions**

#### `progression-algorithm`
- Calculates progression suggestions
- Input: user_id, current_load, exercise_type
- Returns: suggested load adjustments based on recovery data

### 5. **Service Integration Map**

```
Auth Service → Supabase Auth
  ├─ Login/Signup
  ├─ Session Management
  └─ Token Refresh

Progression Service → Supabase Database
  ├─ user_doms_data (recovery metrics)
  ├─ user_session_data (RPE tracking)
  └─ Edge Function (progression calculations)

Exercise Service → Supabase Storage
  ├─ exercise-gifs bucket
  └─ Public URLs for GIFs

Workout Tracking → Supabase Database
  ├─ workout_exercise_sets
  └─ Session data storage
```

## How to Manage
```bash
# Using the sync script
SUPABASE_ANON_KEY=your-key node scripts/sync-to-supabase.js
```

### Check Status
```bash
# See what needs uploading
node scripts/check-what-to-upload.js
```

### Manual Upload
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ayttqsgttuvdhvbvbnsk)
2. Navigate to Storage → exercise-gifs
3. Upload files to appropriate muscle group folders

## Summary

Your app uses Supabase primarily as a **CDN for exercise GIF storage**. The integration is straightforward:
- Stores GIFs in organized folders by muscle group
- Provides public URLs for direct access
- No database tables or authentication features are being used
- Acts as a simple, reliable file storage solution