# Exercise Tracking Test Plan

## Test Scenario 1: Basic Exercise Tracking
1. Open the app
2. Navigate to "루틴 관리" (Routine Management)
3. Select a routine (e.g., "상체 루틴")
4. Click "운동 시작" button
5. In workout session screen, tap on first exercise
6. In exercise tracking screen:
   - Enter weight and reps for first set
   - Mark set as complete (checkbox)
   - Verify rest timer starts
   - Add a new set
   - Complete the exercise
7. Navigate to next exercise
8. Complete workout

## Expected Results:
- [ ] Exercise data persists when navigating between screens
- [ ] Rest timer shows visual feedback when complete (no Alert)
- [ ] Set type cycling works on web (no Alert)
- [ ] Fill all sets works without Alert on web
- [ ] Exercise completion works without Alert on web
- [ ] Workout data is saved to AsyncStorage

## Test Scenario 2: Workout Persistence
1. Start a workout
2. Complete some sets
3. Close the app
4. Reopen the app
5. Navigate back to workout

## Expected Results:
- [ ] Workout state is restored from AsyncStorage
- [ ] Completed sets are still marked as complete
- [ ] Can continue workout from where left off

## Issues Found:
- Exercise tracking uses mock data instead of real exercise data
- Need to implement real exercise data fetching