# Fitness App Architecture Overview

## Executive Summary
React Native/Expo fitness tracking application with Supabase backend, offline-first architecture, and comprehensive workout management capabilities.

## Tech Stack

### Frontend
- **Framework**: React Native 0.79.5 + Expo SDK 53
- **Navigation**: React Navigation v7 (Stack + Tab)
- **State Management**: React Context API
- **UI Components**: React Native Paper, Custom Components
- **Charts**: react-native-chart-kit, react-native-gifted-charts
- **Forms**: react-hook-form
- **TypeScript**: ~5.8.3

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (exercise GIFs, thumbnails)
- **Real-time**: Supabase Realtime (future)
- **API**: RESTful via Supabase client

### Infrastructure
- **Offline Storage**: AsyncStorage
- **Image Caching**: expo-image
- **Notifications**: expo-notifications
- **Analytics**: Custom analytics service

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Mobile App (Expo)                 │
├─────────────────────────────────────────────────────┤
│                  Navigation Layer                    │
│           (React Navigation - Stack + Tabs)         │
├─────────────────────────────────────────────────────┤
│                  Context Providers                   │
│     (Workout, Auth, Theme, MockAuth, Settings)      │
├─────────────────────────────────────────────────────┤
│                   Service Layer                      │
│  (Auth, Workout, Exercise, Analytics, Network)      │
├─────────────────────────────────────────────────────┤
│                   Storage Layer                      │
│          (AsyncStorage + Supabase Client)           │
├─────────────────────────────────────────────────────┤
│                   Network Layer                      │
│              (Axios + NetInfo + Offline)            │
└─────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────┐
│                 Supabase Backend                     │
├─────────────────────────────────────────────────────┤
│   PostgreSQL    │    Auth    │    Storage           │
│   (workouts,    │  (users,   │   (GIFs,            │
│    exercises,   │   auth)    │   thumbnails)        │
│    programs)    │            │                      │
└─────────────────────────────────────────────────────┘
```

## Core Modules

### 1. Authentication System
- **Primary**: Supabase Auth (`src/services/auth.service.supabase.ts`)
- **Fallback**: Mock Auth Context for testing
- **Production**: `auth.service.production.ts`
- **Features**: Email/password, session persistence, token refresh

### 2. Workout Management
- **Context**: `WorkoutContext.tsx` - Active workout state
- **Storage**: AsyncStorage for offline persistence
- **Services**: 
  - `workout.service.ts` - Business logic
  - `workoutApi.ts` - API interactions
  - `workoutTimer.service.ts` - Timing functionality

### 3. Exercise System
- **Database**: 700+ exercises with Korean/English names
- **Categories**: 15 muscle groups
- **Equipment**: 20+ types (barbell, dumbbell, machine, etc.)
- **Media**: Static thumbnails + GIF animations
- **Service**: `exerciseDatabase.service.ts`

### 4. Data Persistence
- **Offline-First**: AsyncStorage for all critical data
- **Sync Strategy**: Queue-based sync when online
- **Services**:
  - `storage.service.ts` - Generic storage
  - `localProgression.service.ts` - Progression tracking
  - `personalRecords.service.ts` - PR management

### 5. Navigation Structure
```
AppNavigator
├── AuthStack (unauthenticated)
│   ├── LoginScreen
│   └── RegisterScreen
└── MainTabs (authenticated)
    ├── HomeStack
    │   ├── HomeScreen
    │   ├── WorkoutSessionScreen
    │   ├── ExerciseTrackScreen
    │   └── WorkoutCompleteScreen
    ├── RecordStack
    │   ├── RecordScreen
    │   ├── WorkoutHistoryScreen
    │   └── ExerciseHistoryScreen
    ├── StatsStack
    │   ├── StatsScreen
    │   ├── PRStatsScreen
    │   └── AchievementsScreen
    └── MenuStack
        ├── MenuScreen
        ├── ProfileScreen
        └── SettingsScreen
```

## Critical Data Flows

### 1. Workout Session Flow
```
StartWorkout → WorkoutContext.startWorkout()
    ↓
Add Exercises → WorkoutContext.addExercise()
    ↓
Track Sets → ExerciseTrackScreen → WorkoutContext.updateSet()
    ↓
Complete Exercise → WorkoutContext.completeExercise()
    ↓
End Workout → saveWorkoutToHistory() → AsyncStorage + Supabase
    ↓
Show Summary → WorkoutCompleteScreen
```

### 2. Authentication Flow
```
App Launch → Check AsyncStorage Token
    ↓
Valid Token → Verify with Supabase → Main App
    ↓
Invalid/No Token → Login Screen → Supabase Auth
    ↓
Success → Store Token → Main App
```

### 3. Offline Sync Flow
```
User Action → Check Network Status
    ↓
Online → Direct API Call → Update Local + Remote
    ↓
Offline → Update Local → Queue Sync Action
    ↓
Network Restored → Process Sync Queue → Reconcile Data
```

## Performance Optimizations

### Current
- Static image imports for thumbnails (no network calls)
- AsyncStorage caching for all data
- Lazy loading for screens
- Memoization in complex components

### Needed
- Image lazy loading implementation
- Virtual list for large exercise lists
- Bundle size optimization
- Code splitting for features

## Security Considerations

### Current Issues
- Hardcoded test credentials (removed in opt branch)
- Console.log statements exposing data (removed)
- Missing input validation in some forms
- No rate limiting on API calls

### Recommendations
- Implement SecureStore for sensitive data
- Add input sanitization
- Implement API rate limiting
- Add certificate pinning

## Scalability Concerns

### Current Limitations
- All data in AsyncStorage (size limits)
- No pagination for workout history
- Memory leaks in image handling
- No background sync

### Future Needs
- SQLite for local database
- Pagination for all lists
- Image memory management
- Background task manager

## Technical Debt

### High Priority
1. TypeScript errors (100+)
2. Duplicate components (15+)
3. Missing error boundaries
4. Inconsistent state management

### Medium Priority
1. No unit tests
2. No E2E tests
3. Inconsistent naming conventions
4. Mixed async patterns

### Low Priority
1. Unused dependencies
2. Deprecated React Native APIs
3. Console statements
4. Code comments

## Development Guidelines

### Code Organization
```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── services/       # Business logic & APIs
├── utils/          # Helper functions
├── constants/      # App constants
├── hooks/          # Custom React hooks
├── types/          # TypeScript definitions
└── data/           # Static data & mocks
```

### Naming Conventions
- **Components**: PascalCase (e.g., `WorkoutCard.tsx`)
- **Services**: camelCase with .service suffix
- **Utils**: camelCase functions
- **Types**: PascalCase interfaces/types
- **Constants**: UPPER_SNAKE_CASE

### State Management Rules
1. Use Context for cross-component state
2. Use local state for component-specific data
3. Use AsyncStorage for persistence
4. Sync to Supabase when online

## Deployment Considerations

### Build Process
```bash
# Development
expo start --web

# Production Build
expo build:android
expo build:ios
```

### Environment Variables
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_ENV` (development/production)

### Release Checklist
1. Remove all console.log statements
2. Update version in package.json
3. Test offline functionality
4. Verify Supabase credentials
5. Run TypeScript checks
6. Test on physical devices

## Maintenance Notes

### Regular Tasks
- Update Expo SDK quarterly
- Review and update dependencies monthly
- Monitor AsyncStorage usage
- Clean up old workout data
- Review error logs

### Monitoring Points
- API response times
- App crash rates
- Memory usage patterns
- AsyncStorage size
- Network retry attempts