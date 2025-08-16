# App Issues Audit - Fitness App

## 1. Mock Data Usage

### Issues:
- **mockRoutines.ts** - Still using hardcoded mock workout routines throughout the app
- **WorkoutSummaryScreen** - Using mock data for workout summary (line 57)
- **ExerciseHistoryScreen** - Using mock personal records data (line 51)
- **RecordScreen** - Combines mock routines with user routines (lines 109-121)
- **HomeScreen** - Displays mock routines alongside user routines (lines 122-126)
- **RoutineManagementScreen** - Has duplicate mock routines definition (line 40)

## 2. Non-functional Buttons/Features

### Buttons that don't work:
- **StatsScreenLocal** - Download button does nothing (line 244: `onPress={() => {}}`)
- **StatsScreenLocal** - Stat card press does nothing (line 282: `onPress={() => {}}`)
- **RecordScreen** - "Repeat workout" button has TODO comment (line 370)
- **WorkoutProgramsScreen** - Edit button shows "준비 중입니다" (feature not ready) alert (line 213)

## 3. Duplicate Features

### Same features in multiple places:
- **Body Measurements** - Exists in both Record stack and Stats stack (different screens)
- **Progress Photos** - Exists in both Record stack and Stats stack (different screens)
- **Workout History** - Available in Record tab and partially in Home tab
- **Exercise Selection** - Available in multiple places with different implementations

## 4. Test/Debug Features in Production

### Should be removed:
- **ThumbnailTest** screen still accessible from Home stack (line 112-115)
- **ExerciseTestScreen** in Menu stack (line 444-447)
- **DOMSSurveyModal** has test API access buttons (lines 380-405)
- Authentication is bypassed for testing (AppNavigator line 533)
- Debug console.logs throughout the codebase

## 5. Commented Out Features

### Temporarily disabled:
- **RecoveryDashboardScreen** - Commented out (lines 147-161)
- **DOMSSurveyScreen** - Commented out
- **RecoveryHistoryScreen** - Commented out
- Authentication check is commented out (lines 536-564)

## 6. UI/UX Issues

### Navigation confusion:
- Two different ways to start a workout (Home tab routines vs Record tab)
- Workout completion flow is different between Home and Record tabs
- No clear indication which features require authentication

### Missing features:
- No search functionality in exercise selection
- No way to edit existing workouts after completion
- No way to pause and resume workouts
- No offline support indication

## 7. Data Consistency Issues

### Problems:
- Exercise IDs inconsistent between mockRoutines and exerciseDatabase
- Some exercises reference non-existent GIF files
- Duplicate exercise entries in the database
- Mix of Korean and English names without proper fallbacks

## 8. Performance Issues

### Potential problems:
- Loading all exercises at once in selection screens
- No pagination for workout history
- Large exercise database loaded on every screen that needs it
- No image caching strategy for exercise GIFs

## 9. Missing Error Handling

### Areas lacking error handling:
- Network failures when loading GIFs
- Supabase connection errors
- Missing exercise data
- Invalid workout states

## 10. Incomplete Features

### Features that need completion:
- Social tab - appears to be placeholder only
- Achievements system - not implemented
- Workout programs - basic implementation only
- Data export - UI exists but functionality unclear
- Macro/Calorie calculators - basic implementation

## 11. Localization Issues

### Problems:
- Mix of Korean and English throughout the app
- Some hardcoded Korean strings
- No language switching capability despite having LanguageSettings screen
- Date/time formats not consistent

## 12. State Management Issues

### Problems:
- Workout state can get out of sync between screens
- No proper state persistence for interrupted workouts
- Exercise selection doesn't update properly in some flows

## Priority Fixes:

1. **Remove all mock data** and implement proper data fetching
2. **Fix non-functional buttons** or remove them
3. **Remove test screens** from production build
4. **Consolidate duplicate features** into single implementations
5. **Implement proper error handling** throughout
6. **Fix authentication flow** and remove bypass
7. **Complete social features** or remove the tab
8. **Implement proper offline support**
9. **Fix exercise data consistency**
10. **Add proper loading and error states**