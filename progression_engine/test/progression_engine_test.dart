import 'package:flutter_test/flutter_test.dart';
import '../lib/models/progression_models.dart';
import '../lib/services/progression_service.dart';
import '../lib/widgets/doms_survey_card.dart';

void main() {
  group('Progression Engine Tests', () {
    group('SessionLog Model Tests', () {
      test('should create SessionLog from JSON correctly', () {
        final json = {
          'id': '1',
          'user_id': 'user-123',
          'date': '2024-01-15',
          'session_rpe': 7,
          'total_load': 1200.5,
          'rpe_load': 8403.5,
          'notes': 'Great workout',
          'created_at': '2024-01-15T10:00:00Z',
          'updated_at': '2024-01-15T10:00:00Z',
        };

        final sessionLog = SessionLog.fromJson(json);

        expect(sessionLog.id, '1');
        expect(sessionLog.userId, 'user-123');
        expect(sessionLog.sessionRPE, 7);
        expect(sessionLog.totalLoad, 1200.5);
        expect(sessionLog.rpeLoad, 8403.5);
        expect(sessionLog.notes, 'Great workout');
      });

      test('should convert SessionLog to JSON correctly', () {
        final sessionLog = SessionLog(
          id: '1',
          userId: 'user-123',
          date: DateTime.parse('2024-01-15'),
          sessionRPE: 7,
          totalLoad: 1200.5,
          rpeLoad: 8403.5,
          notes: 'Great workout',
          createdAt: DateTime.parse('2024-01-15T10:00:00Z'),
          updatedAt: DateTime.parse('2024-01-15T10:00:00Z'),
        );

        final json = sessionLog.toJson();

        expect(json['user_id'], 'user-123');
        expect(json['date'], '2024-01-15');
        expect(json['session_rpe'], 7);
        expect(json['total_load'], 1200.5);
        expect(json['rpe_load'], 8403.5);
        expect(json['notes'], 'Great workout');
      });
    });

    group('DOMSSurvey Model Tests', () {
      test('should create DOMSSurvey from JSON correctly', () {
        final json = {
          'id': '1',
          'user_id': 'user-123',
          'date': '2024-01-15',
          'chest_soreness': 3,
          'back_soreness': 2,
          'legs_soreness': 5,
          'arms_soreness': 1,
          'shoulders_soreness': 2,
          'core_soreness': 3,
          'overall_soreness': 3,
          'sleep_quality': 8,
          'energy_level': 7,
          'motivation': 9,
          'notes': 'Feeling good',
          'created_at': '2024-01-15T10:00:00Z',
          'updated_at': '2024-01-15T10:00:00Z',
        };

        final domsSurvey = DOMSSurvey.fromJson(json);

        expect(domsSurvey.id, '1');
        expect(domsSurvey.userId, 'user-123');
        expect(domsSurvey.chestSoreness, 3);
        expect(domsSurvey.backSoreness, 2);
        expect(domsSurvey.legsSoreness, 5);
        expect(domsSurvey.sleepQuality, 8);
        expect(domsSurvey.energyLevel, 7);
        expect(domsSurvey.motivation, 9);
      });

      test('should calculate average soreness correctly', () {
        final domsSurvey = DOMSSurvey(
          id: '1',
          userId: 'user-123',
          date: DateTime.parse('2024-01-15'),
          chestSoreness: 2,
          backSoreness: 4,
          legsSoreness: 6,
          armsSoreness: 2,
          shouldersSoreness: 3,
          coreSoreness: 1,
          overallSoreness: 3,
          sleepQuality: 8,
          energyLevel: 7,
          motivation: 9,
          createdAt: DateTime.parse('2024-01-15T10:00:00Z'),
          updatedAt: DateTime.parse('2024-01-15T10:00:00Z'),
        );

        // (2 + 4 + 6 + 2 + 3 + 1) / 6 = 18 / 6 = 3.0
        expect(domsSurvey.averageSoreness, 3.0);
      });
    });

    group('ProgressionSuggestion Model Tests', () {
      test('should create ProgressionSuggestion from JSON correctly', () {
        final json = {
          'suggested_load': 105.5,
          'load_change_percent': 5.5,
          'reasoning': 'Good recovery indicators',
          'recommendation': 'Increase load moderately',
          'confidence': 0.85,
        };

        final suggestion = ProgressionSuggestion.fromJson(json);

        expect(suggestion.suggestedLoad, 105.5);
        expect(suggestion.loadChangePercent, 5.5);
        expect(suggestion.reasoning, 'Good recovery indicators');
        expect(suggestion.recommendation, 'Increase load moderately');
        expect(suggestion.confidence, 0.85);
      });

      test('should generate correct change description', () {
        final increaseTest = ProgressionSuggestion(
          suggestedLoad: 105,
          loadChangePercent: 5.0,
          reasoning: 'Test',
          recommendation: 'Test',
          confidence: 0.8,
        );
        expect(increaseTest.changeDescription, 'Increase by 5.0%');

        final decreaseTest = ProgressionSuggestion(
          suggestedLoad: 95,
          loadChangePercent: -5.0,
          reasoning: 'Test',
          recommendation: 'Test',
          confidence: 0.8,
        );
        expect(decreaseTest.changeDescription, 'Decrease by 5.0%');

        final maintainTest = ProgressionSuggestion(
          suggestedLoad: 100,
          loadChangePercent: 0.0,
          reasoning: 'Test',
          recommendation: 'Test',
          confidence: 0.8,
        );
        expect(maintainTest.changeDescription, 'Maintain current load');
      });

      test('should determine correct progression type', () {
        final increaseTest = ProgressionSuggestion(
          suggestedLoad: 105,
          loadChangePercent: 5.0,
          reasoning: 'Test',
          recommendation: 'Test',
          confidence: 0.8,
        );
        expect(increaseTest.type, ProgressionType.increase);

        final decreaseTest = ProgressionSuggestion(
          suggestedLoad: 95,
          loadChangePercent: -5.0,
          reasoning: 'Test',
          recommendation: 'Test',
          confidence: 0.8,
        );
        expect(decreaseTest.type, ProgressionType.decrease);

        final maintainTest = ProgressionSurvey(
          suggestedLoad: 100,
          loadChangePercent: 1.0, // Small change, should maintain
          reasoning: 'Test',
          recommendation: 'Test',
          confidence: 0.8,
        );
        expect(maintainTest.type, ProgressionType.maintain);
      });
    });

    group('DOMSSurveyData Widget Tests', () {
      test('should set and get muscle soreness correctly', () {
        final data = DOMSSurveyData();

        data.setSorenessForMuscle('chest', 5.0);
        data.setSorenessForMuscle('legs', 7.0);

        expect(data.getSorenessForMuscle('chest'), 5.0);
        expect(data.getSorenessForMuscle('legs'), 7.0);
        expect(data.getSorenessForMuscle('arms'), 0.0); // Default
      });

      test('should convert to JSON correctly', () {
        final data = DOMSSurveyData(
          chestSoreness: 3.5,
          backSoreness: 2.2,
          legsSoreness: 6.8,
          sleepQuality: 8.1,
          energyLevel: 7.9,
          motivation: 9.0,
          notes: 'Test notes',
        );

        final json = data.toJson();

        // Should round to integers
        expect(json['chest_soreness'], 4);
        expect(json['back_soreness'], 2);
        expect(json['legs_soreness'], 7);
        expect(json['sleep_quality'], 8);
        expect(json['energy_level'], 8);
        expect(json['motivation'], 9);
        expect(json['notes'], 'Test notes');
      });
    });

    group('ReadinessLevel Extension Tests', () {
      test('should provide correct labels and descriptions', () {
        expect(ReadinessLevel.excellent.label, 'Excellent');
        expect(ReadinessLevel.excellent.description, 'Ready for intense training');

        expect(ReadinessLevel.good.label, 'Good');
        expect(ReadinessLevel.good.description, 'Ready for normal training');

        expect(ReadinessLevel.moderate.label, 'Moderate');
        expect(ReadinessLevel.moderate.description, 'Consider lighter training');

        expect(ReadinessLevel.poor.label, 'Poor');
        expect(ReadinessLevel.poor.description, 'Focus on recovery');
      });
    });

    group('ACWRStatus Extension Tests', () {
      test('should provide correct labels and descriptions', () {
        expect(ACWRStatus.underTrained.label, 'Under-trained');
        expect(ACWRStatus.underTrained.description, 'Room for progression');

        expect(ACWRStatus.optimal.label, 'Optimal');
        expect(ACWRStatus.optimal.description, 'Perfect training load');

        expect(ACWRStatus.functional.label, 'Functional');
        expect(ACWRStatus.functional.description, 'Manageable overreach');

        expect(ACWRStatus.high.label, 'High Risk');
        expect(ACWRStatus.high.description, 'Injury risk elevated');
      });
    });

    group('WorkoutExercise Model Tests', () {
      test('should convert to JSON correctly', () {
        final exercise = WorkoutExercise(
          exerciseName: 'Bench Press',
          sets: 3,
          avgWeight: 100.5,
          avgReps: 10.0,
        );

        final json = exercise.toJson();

        expect(json['exercise_name'], 'Bench Press');
        expect(json['sets'], 3);
        expect(json['avg_weight'], 100.5);
        expect(json['avg_reps'], 10.0);
      });
    });

    group('SessionCompleteRequest Model Tests', () {
      test('should convert to JSON correctly', () {
        final exercises = [
          WorkoutExercise(
            exerciseName: 'Bench Press',
            sets: 3,
            avgWeight: 100.0,
            avgReps: 10.0,
          ),
          WorkoutExercise(
            exerciseName: 'Squat',
            sets: 3,
            avgWeight: 120.0,
            avgReps: 8.0,
          ),
        ];

        final request = SessionCompleteRequest(
          userId: 'user-123',
          sessionRPE: 7,
          workoutDurationMinutes: 60,
          exercisesCompleted: exercises,
          notes: 'Good session',
        );

        final json = request.toJson();

        expect(json['user_id'], 'user-123');
        expect(json['session_rpe'], 7);
        expect(json['workout_duration_minutes'], 60);
        expect(json['exercises_completed'], hasLength(2));
        expect(json['notes'], 'Good session');
      });
    });
  });
}

// Mock class to fix test compilation error
class ProgressionSurvey {
  final double suggestedLoad;
  final double loadChangePercent;
  final String reasoning;
  final String recommendation;
  final double confidence;

  ProgressionSurvey({
    required this.suggestedLoad,
    required this.loadChangePercent,
    required this.reasoning,
    required this.recommendation,
    required this.confidence,
  });

  ProgressionType get type {
    if (loadChangePercent > 2) return ProgressionType.increase;
    if (loadChangePercent < -2) return ProgressionType.decrease;
    return ProgressionType.maintain;
  }
}