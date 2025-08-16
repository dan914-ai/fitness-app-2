// Progression Engine Data Models
// Handles all data structures for the enhanced progression algorithm

class SessionLog {
  final String id;
  final String userId;
  final DateTime date;
  final int sessionRPE;
  final double totalLoad;
  final double rpeLoad;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  SessionLog({
    required this.id,
    required this.userId,
    required this.date,
    required this.sessionRPE,
    required this.totalLoad,
    required this.rpeLoad,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SessionLog.fromJson(Map<String, dynamic> json) {
    return SessionLog(
      id: json['id'].toString(),
      userId: json['user_id'],
      date: DateTime.parse(json['date']),
      sessionRPE: json['session_rpe'] ?? 0,
      totalLoad: (json['total_load'] ?? 0).toDouble(),
      rpeLoad: (json['rpe_load'] ?? 0).toDouble(),
      notes: json['notes'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'date': date.toIso8601String().split('T')[0],
      'session_rpe': sessionRPE,
      'total_load': totalLoad,
      'rpe_load': rpeLoad,
      'notes': notes,
    };
  }
}

class DOMSSurvey {
  final String id;
  final String userId;
  final DateTime date;
  final int chestSoreness;
  final int backSoreness;
  final int legsSoreness;
  final int armsSoreness;
  final int shouldersSoreness;
  final int coreSoreness;
  final int overallSoreness;
  final int sleepQuality;
  final int energyLevel;
  final int motivation;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  DOMSSurvey({
    required this.id,
    required this.userId,
    required this.date,
    required this.chestSoreness,
    required this.backSoreness,
    required this.legsSoreness,
    required this.armsSoreness,
    required this.shouldersSoreness,
    required this.coreSoreness,
    required this.overallSoreness,
    required this.sleepQuality,
    required this.energyLevel,
    required this.motivation,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DOMSSurvey.fromJson(Map<String, dynamic> json) {
    return DOMSSurvey(
      id: json['id'].toString(),
      userId: json['user_id'],
      date: DateTime.parse(json['date']),
      chestSoreness: json['chest_soreness'] ?? 0,
      backSoreness: json['back_soreness'] ?? 0,
      legsSoreness: json['legs_soreness'] ?? 0,
      armsSoreness: json['arms_soreness'] ?? 0,
      shouldersSoreness: json['shoulders_soreness'] ?? 0,
      coreSoreness: json['core_soreness'] ?? 0,
      overallSoreness: json['overall_soreness'] ?? 0,
      sleepQuality: json['sleep_quality'] ?? 7,
      energyLevel: json['energy_level'] ?? 7,
      motivation: json['motivation'] ?? 7,
      notes: json['notes'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'date': date.toIso8601String().split('T')[0],
      'chest_soreness': chestSoreness,
      'back_soreness': backSoreness,
      'legs_soreness': legsSoreness,
      'arms_soreness': armsSoreness,
      'shoulders_soreness': shouldersSoreness,
      'core_soreness': coreSoreness,
      'overall_soreness': overallSoreness,
      'sleep_quality': sleepQuality,
      'energy_level': energyLevel,
      'motivation': motivation,
      'notes': notes,
    };
  }

  double get averageSoreness {
    return (chestSoreness + backSoreness + legsSoreness + 
            armsSoreness + shouldersSoreness + coreSoreness) / 6.0;
  }
}

class ReadinessMetrics {
  final String id;
  final String userId;
  final DateTime date;
  final double? hrvScore;
  final int? restingHR;
  final double? sleepScore;
  final int? stressLevel;
  final double? readinessIndex;
  final DateTime createdAt;
  final DateTime updatedAt;

  ReadinessMetrics({
    required this.id,
    required this.userId,
    required this.date,
    this.hrvScore,
    this.restingHR,
    this.sleepScore,
    this.stressLevel,
    this.readinessIndex,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ReadinessMetrics.fromJson(Map<String, dynamic> json) {
    return ReadinessMetrics(
      id: json['id'].toString(),
      userId: json['user_id'],
      date: DateTime.parse(json['date']),
      hrvScore: json['hrv_score']?.toDouble(),
      restingHR: json['resting_hr'],
      sleepScore: json['sleep_score']?.toDouble(),
      stressLevel: json['stress_level'],
      readinessIndex: json['readiness_index']?.toDouble(),
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'date': date.toIso8601String().split('T')[0],
      'hrv_score': hrvScore,
      'resting_hr': restingHR,
      'sleep_score': sleepScore,
      'stress_level': stressLevel,
    };
  }
}

class ProgressionSuggestion {
  final double suggestedLoad;
  final double loadChangePercent;
  final String reasoning;
  final String recommendation;
  final double confidence;

  ProgressionSuggestion({
    required this.suggestedLoad,
    required this.loadChangePercent,
    required this.reasoning,
    required this.recommendation,
    required this.confidence,
  });

  factory ProgressionSuggestion.fromJson(Map<String, dynamic> json) {
    return ProgressionSuggestion(
      suggestedLoad: (json['suggested_load'] ?? 0).toDouble(),
      loadChangePercent: (json['load_change_percent'] ?? 0).toDouble(),
      reasoning: json['reasoning'] ?? '',
      recommendation: json['recommendation'] ?? '',
      confidence: (json['confidence'] ?? 0.5).toDouble(),
    );
  }

  String get changeDescription {
    if (loadChangePercent > 0) {
      return 'Increase by ${loadChangePercent.toStringAsFixed(1)}%';
    } else if (loadChangePercent < 0) {
      return 'Decrease by ${(-loadChangePercent).toStringAsFixed(1)}%';
    } else {
      return 'Maintain current load';
    }
  }

  ProgressionType get type {
    if (loadChangePercent > 2) return ProgressionType.increase;
    if (loadChangePercent < -2) return ProgressionType.decrease;
    return ProgressionType.maintain;
  }
}

class ProgressionResponse {
  final double readinessIndex;
  final double acwr;
  final ProgressionSuggestion progression;
  final ProgressionMetrics metrics;
  final DateTime timestamp;

  ProgressionResponse({
    required this.readinessIndex,
    required this.acwr,
    required this.progression,
    required this.metrics,
    required this.timestamp,
  });

  factory ProgressionResponse.fromJson(Map<String, dynamic> json) {
    return ProgressionResponse(
      readinessIndex: (json['readiness_index'] ?? 0).toDouble(),
      acwr: (json['acwr'] ?? 1).toDouble(),
      progression: ProgressionSuggestion.fromJson(json['progression'] ?? {}),
      metrics: ProgressionMetrics.fromJson(json['metrics'] ?? {}),
      timestamp: DateTime.parse(json['timestamp']),
    );
  }

  ReadinessLevel get readinessLevel {
    if (readinessIndex >= 0.8) return ReadinessLevel.excellent;
    if (readinessIndex >= 0.6) return ReadinessLevel.good;
    if (readinessIndex >= 0.4) return ReadinessLevel.moderate;
    return ReadinessLevel.poor;
  }

  ACWRStatus get acwrStatus {
    if (acwr < 0.8) return ACWRStatus.underTrained;
    if (acwr <= 1.3) return ACWRStatus.optimal;
    if (acwr <= 1.5) return ACWRStatus.functional;
    return ACWRStatus.high;
  }
}

class ProgressionMetrics {
  final int? latestRPE;
  final double? latestDOMS;
  final int sleepScore;
  final int sessionsLast7Days;
  final int sessionsLast28Days;

  ProgressionMetrics({
    this.latestRPE,
    this.latestDOMS,
    required this.sleepScore,
    required this.sessionsLast7Days,
    required this.sessionsLast28Days,
  });

  factory ProgressionMetrics.fromJson(Map<String, dynamic> json) {
    return ProgressionMetrics(
      latestRPE: json['latest_rpe'],
      latestDOMS: json['latest_doms']?.toDouble(),
      sleepScore: json['sleep_score'] ?? 70,
      sessionsLast7Days: json['sessions_last_7_days'] ?? 0,
      sessionsLast28Days: json['sessions_last_28_days'] ?? 0,
    );
  }
}

class WorkoutExercise {
  final String exerciseName;
  final int sets;
  final double avgWeight;
  final double avgReps;

  WorkoutExercise({
    required this.exerciseName,
    required this.sets,
    required this.avgWeight,
    required this.avgReps,
  });

  Map<String, dynamic> toJson() {
    return {
      'exercise_name': exerciseName,
      'sets': sets,
      'avg_weight': avgWeight,
      'avg_reps': avgReps,
    };
  }
}

class SessionCompleteRequest {
  final String userId;
  final int sessionRPE;
  final int workoutDurationMinutes;
  final List<WorkoutExercise> exercisesCompleted;
  final String? notes;

  SessionCompleteRequest({
    required this.userId,
    required this.sessionRPE,
    required this.workoutDurationMinutes,
    required this.exercisesCompleted,
    this.notes,
  });

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'session_rpe': sessionRPE,
      'workout_duration_minutes': workoutDurationMinutes,
      'exercises_completed': exercisesCompleted.map((e) => e.toJson()).toList(),
      'notes': notes,
    };
  }
}

// Enums
enum ProgressionType {
  increase,
  maintain,
  decrease,
}

enum ReadinessLevel {
  excellent,
  good,
  moderate,
  poor,
}

enum ACWRStatus {
  underTrained,
  optimal,
  functional,
  high,
}

// Extensions for enhanced functionality
extension ReadinessLevelExtension on ReadinessLevel {
  String get label {
    switch (this) {
      case ReadinessLevel.excellent: return 'Excellent';
      case ReadinessLevel.good: return 'Good';
      case ReadinessLevel.moderate: return 'Moderate';
      case ReadinessLevel.poor: return 'Poor';
    }
  }

  String get description {
    switch (this) {
      case ReadinessLevel.excellent: return 'Ready for intense training';
      case ReadinessLevel.good: return 'Ready for normal training';
      case ReadinessLevel.moderate: return 'Consider lighter training';
      case ReadinessLevel.poor: return 'Focus on recovery';
    }
  }

  Color get color {
    switch (this) {
      case ReadinessLevel.excellent: return const Color(0xFF4CAF50);
      case ReadinessLevel.good: return const Color(0xFF2196F3);
      case ReadinessLevel.moderate: return const Color(0xFFFF9800);
      case ReadinessLevel.poor: return const Color(0xFFF44336);
    }
  }
}

extension ACWRStatusExtension on ACWRStatus {
  String get label {
    switch (this) {
      case ACWRStatus.underTrained: return 'Under-trained';
      case ACWRStatus.optimal: return 'Optimal';
      case ACWRStatus.functional: return 'Functional';
      case ACWRStatus.high: return 'High Risk';
    }
  }

  String get description {
    switch (this) {
      case ACWRStatus.underTrained: return 'Room for progression';
      case ACWRStatus.optimal: return 'Perfect training load';
      case ACWRStatus.functional: return 'Manageable overreach';
      case ACWRStatus.high: return 'Injury risk elevated';
    }
  }

  Color get color {
    switch (this) {
      case ACWRStatus.underTrained: return const Color(0xFF2196F3);
      case ACWRStatus.optimal: return const Color(0xFF4CAF50);
      case ACWRStatus.functional: return const Color(0xFFFF9800);
      case ACWRStatus.high: return const Color(0xFFF44336);
    }
  }
}

// Import statement for Color
import 'package:flutter/material.dart';