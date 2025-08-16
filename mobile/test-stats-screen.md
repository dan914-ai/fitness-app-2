# Stats Screen Test Plan

## Test the new StatsScreenFinal.tsx

### Features to test:

1. **Period Selector**
   - Tap each period button (7일, 30일, 90일, 1년)
   - Verify data updates accordingly

2. **Summary Cards**
   - Check "총 운동" (Total Workouts) count
   - Check "총 시간" (Total Time) display
   - Check "현재 스트릭" (Current Streak)
   - Check "최장 스트릭" (Longest Streak)

3. **Progress Circles**
   - Verify streak progress animation
   - Check workout frequency percentage
   - Check daily average calculation

4. **Charts**
   - **Bar Chart (Weekly Frequency)**
     - Verify bars animate on load
     - Check day labels (일-토)
     - Check workout counts per day
   
   - **Line Chart (Volume Trend)**
     - Check line animation
     - Verify Y-axis shows tons (t)
     - Check last 7 days data points
   
   - **Pie Chart (Muscle Groups)**
     - Verify muscle group distribution
     - Check percentages add up to 100%
     - Test both web (SVG) and mobile (bars) versions

5. **Quick Actions**
   - Tap "운동 기록" → Should navigate to WorkoutHistory
   - Other buttons should log to console for now

6. **Performance**
   - Check loading state displays properly
   - Verify smooth animations
   - Test on both web and mobile platforms

### Known Issues to Watch:
- Muscle group data may not be available in older workouts
- Exercise name patterns are used as fallback for categorization
- Duration is stored in seconds but displayed in minutes

### Test Data Requirements:
- Need at least a few workout sessions saved
- Workouts should have different exercises for muscle group variety
- Some workouts on different days for weekly frequency chart