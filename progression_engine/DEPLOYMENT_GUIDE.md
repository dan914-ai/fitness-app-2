# Progression Engine Deployment Guide

This guide walks through deploying the enhanced Progression Engine with Session RPE logging and DOMS surveys.

## Prerequisites

- Supabase project with authentication enabled
- Flutter 3.22+ with Riverpod and GoRouter
- Supabase CLI installed
- Access to your Supabase dashboard

## 1. Database Setup

### Step 1: Run Database Migration

```sql
-- Execute the migration.sql file in your Supabase SQL editor
-- This creates the session_logs, doms_surveys, and readiness_metrics tables
```

1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `migration.sql`
3. Execute the script

### Step 2: Verify Tables Created

Check that these tables were created:
- `session_logs`
- `doms_surveys` 
- `readiness_metrics`

All tables should have RLS (Row Level Security) enabled.

## 2. Edge Functions Deployment

### Step 1: Login to Supabase CLI

```bash
supabase login
```

### Step 2: Link Your Project

```bash
supabase link --project-ref your-project-reference
```

### Step 3: Deploy Edge Functions

```bash
# Deploy progression-enhanced function
supabase functions deploy progression-enhanced --project-ref your-project-reference

# Deploy session-complete function  
supabase functions deploy session-complete --project-ref your-project-reference

# Deploy doms-survey function
supabase functions deploy doms-survey --project-ref your-project-reference
```

### Step 4: Verify Deployment

1. Go to Supabase Dashboard → Edge Functions
2. Confirm all three functions are deployed and active
3. Test each function with sample data

## 3. Flutter Integration

### Step 1: Update Dependencies

Add to your `pubspec.yaml`:

```yaml
dependencies:
  supabase_flutter: ^2.0.0
  http: ^1.1.0
  riverpod: ^2.4.0
  flutter_riverpod: ^2.4.0
```

### Step 2: Configure Supabase Client

Update your Supabase configuration:

```dart
// lib/config/supabase.dart
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  static const String url = 'YOUR_SUPABASE_URL';
  static const String anonKey = 'YOUR_SUPABASE_ANON_KEY';
  
  static Future<void> initialize() async {
    await Supabase.initialize(
      url: url,
      anonKey: anonKey,
    );
  }
}
```

### Step 3: Update ProgressionService

Update the base URL in `progression_service.dart`:

```dart
class ProgressionService {
  static const String _baseUrl = 'https://YOUR_PROJECT_REF.supabase.co/functions/v1';
  // ... rest of implementation
}
```

### Step 4: Add UI Components

Copy the widget files to your project:
- `lib/widgets/session_rpe_modal.dart`
- `lib/widgets/doms_survey_card.dart`
- `lib/models/progression_models.dart`
- `lib/services/progression_service.dart`

## 4. Integration Points

### Post-Workout Integration

Add Session RPE logging after workout completion:

```dart
// In your workout completion screen
Future<void> _completeWorkout() async {
  // Show RPE modal after workout
  await showSessionRPEModal(
    context: context,
    onSubmit: (rpe, notes) async {
      await _progressionService.logSessionComplete(
        userId: currentUser.id,
        sessionRPE: rpe,
        workoutDurationMinutes: workoutDuration,
        exercisesCompleted: completedExercises,
        notes: notes,
      );
    },
  );
}
```

### Morning Check-in Integration

Add DOMS survey to your home/dashboard screen:

```dart
// In your home screen
Widget build(BuildContext context) {
  return Column(
    children: [
      // Show DOMS survey card if not completed today
      if (shouldShowDOMSSurvey) 
        DOMSSurveyCard(
          onSubmit: (surveyData) async {
            await _progressionService.submitDOMSSurvey(
              userId: currentUser.id,
              surveyData: surveyData,
            );
          },
        ),
      // ... rest of home screen
    ],
  );
}
```

### Progression Suggestions

Use progression suggestions in your workout planning:

```dart
Future<void> _getWorkoutSuggestion() async {
  final suggestion = await _progressionService.getProgressionSuggestion(
    userId: currentUser.id,
    currentLoad: currentExerciseLoad,
    exerciseType: 'compound',
  );
  
  // Use suggestion.progression.suggestedLoad for next workout
  setState(() {
    recommendedLoad = suggestion.progression.suggestedLoad;
    readinessLevel = suggestion.readinessLevel;
  });
}
```

## 5. Testing

### Unit Tests

Run the provided unit tests:

```bash
flutter test test/progression_engine_test.dart
```

### Integration Testing

1. Create test users in your Supabase project
2. Configure test environment variables
3. Run integration tests against test database

### Manual Testing Checklist

- [ ] Can log Session RPE after workout
- [ ] Can submit DOMS survey in morning
- [ ] Progression suggestions update based on RPE/DOMS
- [ ] Readiness scores calculate correctly
- [ ] ACWR calculations work with session data
- [ ] Historical data displays properly

## 6. Monitoring and Analytics

### Database Monitoring

Monitor these key metrics:
- Session log completion rates
- DOMS survey completion rates
- Progression suggestion usage
- User readiness trends

### Edge Function Monitoring

Check function performance:
- Response times for each function
- Error rates and failure modes
- Function invocation frequency

### User Experience Metrics

Track user engagement:
- RPE modal completion rate
- DOMS survey daily completion
- Progression suggestion follow-through

## 7. Maintenance

### Regular Tasks

1. **Weekly**: Review Edge Function logs for errors
2. **Monthly**: Analyze progression accuracy vs. user feedback
3. **Quarterly**: Update progression algorithms based on data

### Data Cleanup

Consider implementing:
- Archive old session logs (>6 months)
- Aggregate historical readiness metrics
- Clean up incomplete survey submissions

## 8. Security Considerations

### Row Level Security

Ensure RLS policies are working:
- Users can only access their own data
- No cross-user data leakage
- Proper authentication required

### API Security

- All Edge Functions require valid JWT tokens
- Input validation on all endpoints
- Rate limiting on survey submissions

## 9. Scaling Considerations

### Database Optimization

- Index on user_id and date columns
- Partition large tables by date if needed
- Regular VACUUM and ANALYZE operations

### Edge Function Optimization

- Cache readiness calculations where possible
- Optimize database queries in functions
- Consider CDN for function responses

## 10. Troubleshooting

### Common Issues

**Error: "Failed to get progression suggestion"**
- Check Edge Function deployment status
- Verify JWT token is valid
- Ensure user has recent session data

**Error: "Failed to submit DOMS survey"**
- Check RLS policies on doms_surveys table
- Verify all required fields are provided
- Check for duplicate submissions on same date

**Low progression accuracy**
- Ensure users are consistently logging RPE
- Check DOMS survey completion rates
- Review algorithm parameters

### Debug Tools

Use these SQL queries to debug:

```sql
-- Check user's recent sessions
SELECT * FROM session_logs 
WHERE user_id = 'USER_ID' 
ORDER BY date DESC LIMIT 10;

-- Check DOMS survey completion
SELECT COUNT(*) as survey_count,
       AVG(overall_soreness) as avg_soreness
FROM doms_surveys 
WHERE user_id = 'USER_ID' 
AND date >= NOW() - INTERVAL '7 days';

-- Check readiness trends
SELECT date, readiness_index
FROM readiness_metrics
WHERE user_id = 'USER_ID'
ORDER BY date DESC LIMIT 30;
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase function logs
3. Check Flutter console for client-side errors
4. Verify database table contents and RLS policies

## Next Steps

After successful deployment:
1. Gather user feedback on RPE and DOMS interfaces
2. A/B test different progression algorithms
3. Add more sophisticated readiness indicators (HRV, etc.)
4. Implement machine learning for personalized suggestions