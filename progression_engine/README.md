# 🏋️ Enhanced Progression Engine

An intelligent workout progression algorithm that combines objective and subjective recovery indicators to provide personalized training recommendations.

## 🌟 Features

### 📊 Session RPE Logging
- **Post-workout perception tracking** with intuitive 0-10 scale
- **Color-coded interface** with descriptive labels
- **Load calculation** using Foster's RPE method
- **Automatic integration** with progression algorithm

### 🎯 DOMS Surveys  
- **Muscle-specific soreness tracking** for 6 major muscle groups
- **Overall wellness assessment** (sleep, energy, motivation)
- **Morning check-in workflow** with expandable card UI
- **Readiness score calculation** based on recovery indicators

### 🧠 Enhanced Progression Algorithm
- **ACWR calculation** (Acute:Chronic Workload Ratio)
- **Multi-factor readiness index** incorporating:
  - Session RPE data
  - Muscle soreness levels
  - Sleep quality metrics
  - Energy and motivation scores
  - Optional HRV integration
- **Intelligent load suggestions** with confidence scoring
- **Injury risk assessment** and recovery recommendations

## 🏗️ Architecture

### Database Schema
```sql
session_logs
├── id (BIGINT, PRIMARY KEY)
├── user_id (UUID, FOREIGN KEY)
├── date (DATE)
├── session_rpe (SMALLINT 0-10)
├── total_load (NUMERIC)
├── rpe_load (NUMERIC)
└── notes (TEXT)

doms_surveys  
├── id (BIGINT, PRIMARY KEY)
├── user_id (UUID, FOREIGN KEY)
├── date (DATE)
├── chest_soreness (SMALLINT 0-10)
├── back_soreness (SMALLINT 0-10)
├── legs_soreness (SMALLINT 0-10)
├── arms_soreness (SMALLINT 0-10)
├── shoulders_soreness (SMALLINT 0-10)
├── core_soreness (SMALLINT 0-10)
├── overall_soreness (SMALLINT 0-10)
├── sleep_quality (SMALLINT 1-10)
├── energy_level (SMALLINT 1-10)
└── motivation (SMALLINT 1-10)
```

### Edge Functions
- **`progression-enhanced`** - Main algorithm with multi-factor analysis
- **`session-complete`** - RPE logging and load calculation
- **`doms-survey`** - Recovery assessment and recommendations

### Flutter Components
- **`SessionRPEModal`** - Post-workout RPE collection
- **`DOMSSurveyCard`** - Morning recovery check-in
- **`ProgressionService`** - API integration layer
- **Data Models** - Type-safe data structures

## 🚀 Quick Start

### 1. Database Setup
```sql
-- Run migration.sql in Supabase SQL Editor
-- Creates tables with RLS policies and indexes
```

### 2. Deploy Edge Functions
```bash
supabase functions deploy progression-enhanced
supabase functions deploy session-complete  
supabase functions deploy doms-survey
```

### 3. Flutter Integration
```dart
// Add to post-workout flow
await showSessionRPEModal(
  context: context,
  onSubmit: (rpe, notes) async {
    await progressionService.logSessionComplete(
      userId: user.id,
      sessionRPE: rpe,
      workoutDurationMinutes: duration,
      exercisesCompleted: exercises,
    );
  },
);

// Add to morning dashboard
DOMSSurveyCard(
  onSubmit: (surveyData) async {
    await progressionService.submitDOMSSurvey(
      userId: user.id,
      surveyData: surveyData,
    );
  },
)
```

## 📈 Algorithm Details

### Readiness Index Calculation
```dart
readinessIndex = (
  0.25 * sleepFactor +
  0.20 * hrvFactor +
  0.20 * acwrFactor +
  0.20 * rpeFactor +
  0.15 * domsFactor
)
```

### ACWR Calculation
```dart
acwr = acuteLoad (7 days) / chronicLoad (28 days)
```

### Load Progression Logic
- **High Readiness (≥0.8)**: 5% increase
- **Good Readiness (≥0.6)**: Maintain load  
- **Moderate Readiness (≥0.4)**: 10% decrease
- **Poor Readiness (<0.4)**: 20% decrease

## 🎨 UI/UX Features

### Session RPE Modal
- **Visual scale** with color-coded intensity levels
- **Descriptive labels** for each RPE level
- **Notes field** for additional context
- **Validation** and error handling

### DOMS Survey Card
- **Expandable interface** to reduce visual clutter
- **Muscle-specific sliders** with visual indicators
- **Wellness metrics** (sleep, energy, motivation)
- **Real-time readiness calculation**

## 📊 Data Analytics

### Key Metrics Tracked
- **Session completion rates** and RPE distributions
- **DOMS survey compliance** and trends
- **Readiness score patterns** over time
- **Progression accuracy** vs. user outcomes

### Insights Generated
- **Overtraining risk** based on ACWR patterns
- **Recovery quality** trends from DOMS data
- **Load tolerance** individual profiles
- **Optimal training windows** prediction

## 🔒 Security & Privacy

### Row Level Security
- **User isolation** - users only access their data
- **JWT authentication** required for all operations
- **Input validation** on all endpoints

### Data Protection
- **Minimal data collection** - only training-relevant metrics
- **Anonymized analytics** options available
- **GDPR compliance** ready with data export/deletion

## 🧪 Testing

### Unit Tests
```bash
flutter test test/progression_engine_test.dart
```
- Model serialization/deserialization
- Algorithm calculation accuracy
- UI component behavior
- Data validation logic

### Integration Tests
- End-to-end user workflows
- Database consistency checks
- Edge Function integration
- Error handling scenarios

## 📈 Performance

### Database Optimization
- **Indexed queries** on user_id and date
- **Efficient pagination** for historical data
- **Query optimization** in Edge Functions

### Client Performance
- **Lazy loading** for survey components
- **Caching** of readiness calculations
- **Optimistic updates** for better UX

## 🔧 Configuration

### Environment Variables
```dart
// lib/config/progression_config.dart
class ProgressionConfig {
  static const bool enableHRVIntegration = true;
  static const int defaultLookbackDays = 28;
  static const double minConfidenceThreshold = 0.6;
}
```

### Algorithm Tuning
- **Readiness factor weights** adjustable
- **ACWR thresholds** customizable  
- **Progression percentages** configurable
- **Confidence scoring** parameters

## 🚀 Deployment Checklist

- [ ] Database migration executed
- [ ] Edge Functions deployed and tested
- [ ] Flutter components integrated
- [ ] RLS policies verified
- [ ] Test user workflows complete
- [ ] Performance monitoring active
- [ ] Error handling tested

## 📚 API Reference

### Progression Suggestion
```http
POST /functions/v1/progression-enhanced
{
  "user_id": "uuid",
  "current_load": 100.0,
  "exercise_type": "compound",
  "days_since_last": 1
}
```

### Session Completion
```http
POST /functions/v1/session-complete
{
  "user_id": "uuid",
  "session_rpe": 7,
  "workout_duration_minutes": 60,
  "exercises_completed": [...]
}
```

### DOMS Survey
```http
POST /functions/v1/doms-survey
{
  "user_id": "uuid",
  "chest_soreness": 3,
  "overall_soreness": 4,
  "sleep_quality": 8,
  ...
}
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/enhancement`)
3. **Add tests** for new functionality
4. **Commit** changes (`git commit -am 'Add enhancement'`)
5. **Push** to branch (`git push origin feature/enhancement`)
6. **Create** Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Foster's RPE Method** for session load calculation
- **ACWR Research** from sports science literature
- **DOMS Assessment** protocols from exercise physiology
- **Supabase** for backend infrastructure
- **Flutter** community for UI/UX patterns

## 📞 Support

- **Documentation**: Check deployment guide and API reference
- **Issues**: Create GitHub issue with reproduction steps
- **Questions**: Use discussions for general questions
- **Security**: Email security@yourapp.com for vulnerabilities

---

**Built with ❤️ for evidence-based fitness progression**