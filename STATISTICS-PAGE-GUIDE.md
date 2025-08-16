# 통계 (Statistics) Page Implementation Guide

## Overview
The 통계 page provides comprehensive workout analytics and insights for users, perfectly linking data from exercises that have been completed.

## Backend Implementation

### Analytics Controller (`backend/src/controllers/analytics.controller.ts`)
The controller provides 6 main endpoints:

1. **Overall Stats** (`GET /api/analytics/overall-stats`)
   - Total workouts completed
   - Total volume (weight × reps)
   - Average workout duration
   - Current workout streak

2. **Workout Frequency** (`GET /api/analytics/workout-frequency?period=7|30|90|365`)
   - Daily/weekly/monthly workout counts
   - Customizable time periods
   - Frequency analysis

3. **Muscle Group Distribution** (`GET /api/analytics/muscle-groups`)
   - Exercise count by muscle group
   - Set count by muscle group
   - Total volume by muscle group
   - Percentage breakdowns

4. **Exercise Progress** (`GET /api/analytics/exercise-progress/:exerciseId`)
   - Historical data for specific exercises
   - Weight and volume trends
   - Average reps per workout

5. **Personal Records** (`GET /api/analytics/personal-records`)
   - Maximum weight lifted per exercise
   - Maximum reps performed
   - Maximum volume achieved
   - Dates of achievements

6. **Workout Trends** (`GET /api/analytics/trends`)
   - 12-week trend analysis
   - Most frequent workout days
   - Popular exercises
   - Overall patterns

## Frontend Implementation

### Analytics Service (`mobile/src/services/analytics.service.ts`)
- Handles all API calls to analytics endpoints
- Includes data processing methods for charts
- Provides formatting utilities
- Implements caching for performance

### Chart Components
Located in `mobile/src/components/charts/`:
- **LineChart**: Shows trends over time
- **BarChart**: Displays frequency data
- **PieChart**: Shows distribution data

### Analytics Components
Located in `mobile/src/components/analytics/`:
- **StatCard**: Displays key metrics
- **ProgressCircle**: Shows progress indicators

### Stats Screen (`mobile/src/screens/stats/StatsScreen.tsx`)
Main statistics screen with:
- Period selector (7일, 30일, 90일, 1년)
- Overview cards showing key metrics
- Progress circles for goals
- Multiple charts for data visualization
- Quick action menu for detailed views

## Data Flow

1. User completes workout → Data saved to database
2. Analytics controller queries workout data
3. Statistics calculated in real-time
4. Frontend fetches data via analytics service
5. Charts and components display visualized data

## Testing

Run the test script to verify all endpoints:
```bash
chmod +x test-analytics-api.sh
./test-analytics-api.sh
```

## Key Features

- **Real-time Calculations**: All statistics calculated from actual workout data
- **Multiple Views**: Daily, weekly, monthly, and yearly perspectives
- **Trend Analysis**: Identifies patterns and progress
- **Personal Records**: Tracks best performances
- **Visual Charts**: Easy-to-understand data visualization
- **Responsive Design**: Optimized for mobile viewing

## Navigation

The 통계 tab is accessible from the main bottom navigation:
- 홈 (Home)
- 기록 (Record)
- **통계 (Statistics)** ← Third tab
- 메뉴 (Menu)

## Performance Considerations

- Data is cached to reduce API calls
- Charts use efficient rendering
- Calculations optimized with database indexes
- Loading states prevent UI freezing