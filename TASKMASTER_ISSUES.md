# Fitness App - Task Master Issue List

## Priority Level Legend
- 🔴 **Critical** - Blocks production release
- 🟠 **High** - Major user impact
- 🟡 **Medium** - Should fix soon
- 🟢 **Low** - Nice to have

---

## 🔴 Critical Issues (Must Fix Before Production)

### Mock Data Removal
- [ ] Remove mockRoutines.ts usage throughout app
- [ ] Fix WorkoutSummaryScreen mock data (line 57)
- [ ] Fix ExerciseHistoryScreen mock personal records (line 51)
- [ ] Fix RecordScreen mock routines combination (lines 109-121)
- [ ] Fix HomeScreen mock routines display (lines 122-126)
- [ ] Remove duplicate mock routines in RoutineManagementScreen (line 40)

### Test/Debug Feature Removal
- [ ] Remove ThumbnailTest screen from Home stack (lines 112-115)
- [ ] Remove ExerciseTestScreen from Menu stack (lines 444-447)
- [ ] Remove test API buttons from DOMSSurveyModal (lines 380-405)
- [ ] Fix authentication bypass in AppNavigator (line 533)
- [ ] Remove all debug console.logs from production code

### Authentication Issues
- [ ] Fix authentication flow (currently bypassed)
- [ ] Enable Supabase email verification
- [ ] Implement proper session management
- [ ] Add authentication requirement indicators

### Error Handling
- [ ] Add network failure handling for GIF loading
- [ ] Add Supabase connection error handling
- [ ] Handle missing exercise data gracefully
- [ ] Add invalid workout state handling

---

## 🟠 High Priority (Major User Impact)

### Non-functional Buttons
- [ ] Fix StatsScreenLocal download button (line 244)
- [ ] Fix StatsScreenLocal stat card press (line 282)
- [ ] Implement RecordScreen "Repeat workout" (line 370)
- [ ] Complete WorkoutProgramsScreen edit feature (line 213)

### Duplicate Features (Consolidation Needed)
- [ ] Consolidate Body Measurements (Record + Stats stacks)
- [ ] Consolidate Progress Photos (Record + Stats stacks)
- [ ] Unify Workout History implementation
- [ ] Standardize Exercise Selection across screens

### State Management
- [ ] Fix workout state sync between screens
- [ ] Implement workout state persistence
- [ ] Fix exercise selection update issues
- [ ] Add proper loading states

---

## 🟡 Medium Priority (Should Fix Soon)

### Performance Optimization
- [ ] Implement exercise list pagination
- [ ] Add workout history pagination
- [ ] Optimize exercise database loading
- [ ] Implement GIF image caching strategy
- [ ] Add lazy loading for heavy components

### UI/UX Improvements
- [ ] Add exercise search functionality
- [ ] Enable editing completed workouts
- [ ] Add workout pause/resume feature
- [ ] Add offline support indicators
- [ ] Unify workout start flow (Home vs Record)
- [ ] Standardize workout completion flow

### Localization
- [ ] Fix mixed Korean/English text
- [ ] Remove hardcoded Korean strings
- [ ] Implement language switching
- [ ] Standardize date/time formats
- [ ] Add proper i18n support

---

## 🟢 Low Priority (Nice to Have)

### Feature Completion
- [ ] Complete Social tab or remove it
- [ ] Implement Achievements system
- [ ] Enhance Workout Programs
- [ ] Implement Data Export functionality
- [ ] Complete Macro/Calorie calculators

### Recovery Features (Currently Commented Out)
- [ ] Enable RecoveryDashboardScreen
- [ ] Enable DOMSSurveyScreen
- [ ] Enable RecoveryHistoryScreen
- [ ] Integrate recovery features properly

---

## Task Breakdown by Component

### HomeScreen Tasks
1. Remove mock routines
2. Fix navigation flow
3. Add proper loading states
4. Implement error handling

### RecordScreen Tasks
1. Remove mock data
2. Fix "Repeat workout" button
3. Consolidate with Home workout flow
4. Add workout editing

### StatsScreen Tasks
1. Fix non-functional buttons
2. Implement data export
3. Add proper pagination
4. Consolidate duplicate features

### ExerciseSelection Tasks
1. Add search functionality
2. Implement pagination
3. Fix consistency issues
4. Add proper thumbnails (✅ DONE)

### Authentication Tasks
1. Remove bypass
2. Enable email verification
3. Add session management
4. Add auth indicators

---

## Completed Tasks ✅
- [x] Fix missing exercise thumbnails (5 exercises)
- [x] Reduce repository size (2.3GB → 39MB)
- [x] Fix React version mismatch
- [x] Move GIFs to Supabase storage

---

## Sprint Recommendations

### Sprint 1 (Critical - 1 week)
- Remove all mock data
- Remove test screens
- Fix authentication
- Basic error handling

### Sprint 2 (High Priority - 1 week)
- Fix non-functional buttons
- Consolidate duplicate features
- State management fixes
- Performance optimization

### Sprint 3 (Polish - 1 week)
- UI/UX improvements
- Localization fixes
- Feature completion
- Final testing

---

## Notes for Development Team

1. **Mock Data**: Search for "mockRoutines" across codebase
2. **Test Code**: Search for "Test", "test", "TODO", "console.log"
3. **Authentication**: Check AppNavigator.tsx line 533
4. **Buttons**: Search for "onPress={() => {}}" 
5. **Korean Text**: Search for Korean characters in source files

## Testing Checklist After Fixes

- [ ] All buttons functional
- [ ] No mock data displayed
- [ ] Authentication required where needed
- [ ] Proper error messages shown
- [ ] Consistent navigation flow
- [ ] Data persists correctly
- [ ] Offline mode works
- [ ] All text properly localized

---

## Estimated Time: 3-4 weeks for all issues
## Minimum for Production: 1-2 weeks (Critical + High only)