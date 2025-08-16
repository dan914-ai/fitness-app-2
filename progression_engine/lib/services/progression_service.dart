import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/progression_models.dart';
import '../widgets/doms_survey_card.dart'; // For DOMSSurveyData

class ProgressionService {
  final SupabaseClient _supabase = Supabase.instance.client;
  static const String _baseUrl = 'https://your-project-ref.supabase.co/functions/v1';
  
  // Replace with your actual Supabase project URL
  String get baseUrl => _baseUrl;
  
  Future<Map<String, String>> get _headers async {
    final session = _supabase.auth.currentSession;
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ${session?.accessToken ?? ''}',
    };
  }

  /// Get enhanced progression suggestion using Session RPE and DOMS data
  Future<ProgressionResponse> getProgressionSuggestion({
    required String userId,
    required double currentLoad,
    required String exerciseType,
    int? daysSinceLast,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/progression-enhanced'),
        headers: await _headers,
        body: jsonEncode({
          'user_id': userId,
          'current_load': currentLoad,
          'exercise_type': exerciseType,
          'days_since_last': daysSinceLast,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return ProgressionResponse.fromJson(data);
      } else {
        throw Exception('Failed to get progression suggestion: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error getting progression suggestion: $e');
    }
  }

  /// Log session completion with RPE and workout details
  Future<Map<String, dynamic>> logSessionComplete({
    required String userId,
    required int sessionRPE,
    required int workoutDurationMinutes,
    required List<WorkoutExercise> exercisesCompleted,
    String? notes,
  }) async {
    try {
      final request = SessionCompleteRequest(
        userId: userId,
        sessionRPE: sessionRPE,
        workoutDurationMinutes: workoutDurationMinutes,
        exercisesCompleted: exercisesCompleted,
        notes: notes,
      );

      final response = await http.post(
        Uri.parse('$baseUrl/session-complete'),
        headers: await _headers,
        body: jsonEncode(request.toJson()),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to log session: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error logging session: $e');
    }
  }

  /// Submit DOMS survey
  Future<Map<String, dynamic>> submitDOMSSurvey({
    required String userId,
    required DOMSSurveyData surveyData,
    DateTime? date,
  }) async {
    try {
      final requestData = {
        'user_id': userId,
        'date': date?.toIso8601String().split('T')[0],
        ...surveyData.toJson(),
      };

      final response = await http.post(
        Uri.parse('$baseUrl/doms-survey'),
        headers: await _headers,
        body: jsonEncode(requestData),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to submit DOMS survey: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error submitting DOMS survey: $e');
    }
  }

  /// Get recent session logs for analysis
  Future<List<SessionLog>> getRecentSessions({
    required String userId,
    int days = 7,
  }) async {
    try {
      final startDate = DateTime.now().subtract(Duration(days: days));
      
      final response = await _supabase
          .from('session_logs')
          .select()
          .eq('user_id', userId)
          .gte('date', startDate.toIso8601String().split('T')[0])
          .order('date', ascending: false);

      return response.map<SessionLog>((json) => SessionLog.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Error fetching recent sessions: $e');
    }
  }

  /// Get recent DOMS surveys
  Future<List<DOMSSurvey>> getRecentDOMSSurveys({
    required String userId,
    int days = 7,
  }) async {
    try {
      final startDate = DateTime.now().subtract(Duration(days: days));
      
      final response = await _supabase
          .from('doms_surveys')
          .select()
          .eq('user_id', userId)
          .gte('date', startDate.toIso8601String().split('T')[0])
          .order('date', ascending: false);

      return response.map<DOMSSurvey>((json) => DOMSSurvey.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Error fetching recent DOMS surveys: $e');
    }
  }

  /// Get latest readiness metrics
  Future<ReadinessMetrics?> getLatestReadinessMetrics({
    required String userId,
  }) async {
    try {
      final response = await _supabase
          .from('readiness_metrics')
          .select()
          .eq('user_id', userId)
          .order('date', ascending: false)
          .limit(1);

      if (response.isNotEmpty) {
        return ReadinessMetrics.fromJson(response.first);
      }
      return null;
    } catch (e) {
      throw Exception('Error fetching readiness metrics: $e');
    }
  }

  /// Create or update readiness metrics
  Future<ReadinessMetrics> upsertReadinessMetrics({
    required String userId,
    double? hrvScore,
    int? restingHR,
    double? sleepScore,
    int? stressLevel,
    DateTime? date,
  }) async {
    try {
      final targetDate = date ?? DateTime.now();
      final dateString = targetDate.toIso8601String().split('T')[0];

      final data = {
        'user_id': userId,
        'date': dateString,
        'hrv_score': hrvScore,
        'resting_hr': restingHR,
        'sleep_score': sleepScore,
        'stress_level': stressLevel,
      };

      final response = await _supabase
          .from('readiness_metrics')
          .upsert(data, onConflict: 'user_id,date')
          .select()
          .single();

      return ReadinessMetrics.fromJson(response);
    } catch (e) {
      throw Exception('Error updating readiness metrics: $e');
    }
  }

  /// Calculate simple ACWR (Acute:Chronic Workload Ratio)
  Future<double> calculateACWR({
    required String userId,
  }) async {
    try {
      // Get last 7 days (acute)
      final acuteSessions = await getRecentSessions(userId: userId, days: 7);
      final acuteLoads = acuteSessions.map((s) => s.rpeLoad).toList();
      
      // Get last 28 days (chronic)
      final chronicSessions = await getRecentSessions(userId: userId, days: 28);
      final chronicLoads = chronicSessions.map((s) => s.rpeLoad).toList();
      
      // Calculate averages
      final acuteAvg = acuteLoads.isEmpty ? 0 : 
          acuteLoads.reduce((a, b) => a + b) / acuteLoads.length;
      final chronicAvg = chronicLoads.isEmpty ? 0 : 
          chronicLoads.reduce((a, b) => a + b) / chronicLoads.length;
      
      // Return ACWR (avoid division by zero)
      return chronicAvg == 0 ? 1.0 : acuteAvg / chronicAvg;
    } catch (e) {
      throw Exception('Error calculating ACWR: $e');
    }
  }

  /// Get comprehensive readiness analysis
  Future<Map<String, dynamic>> getReadinessAnalysis({
    required String userId,
  }) async {
    try {
      final futures = await Future.wait([
        getRecentSessions(userId: userId, days: 7),
        getRecentDOMSSurveys(userId: userId, days: 3),
        getLatestReadinessMetrics(userId: userId),
        calculateACWR(userId: userId),
      ]);

      final recentSessions = futures[0] as List<SessionLog>;
      final recentDOMS = futures[1] as List<DOMSSurvey>;
      final latestReadiness = futures[2] as ReadinessMetrics?;
      final acwr = futures[3] as double;

      // Calculate readiness score
      double readinessScore = 0.7; // Default moderate readiness
      
      if (recentDOMS.isNotEmpty) {
        final latestDOMSData = recentDOMS.first;
        final sorenessScore = (10 - latestDOMSData.averageSoreness) / 10;
        final wellnessScore = (latestDOMSData.sleepQuality + 
                              latestDOMSData.energyLevel + 
                              latestDOMSData.motivation) / 30;
        readinessScore = (sorenessScore * 0.4 + wellnessScore * 0.6);
      }

      // Adjust for HRV if available
      if (latestReadiness?.readinessIndex != null) {
        readinessScore = (readinessScore + latestReadiness!.readinessIndex!) / 2;
      }

      return {
        'readiness_score': readinessScore,
        'acwr': acwr,
        'recent_sessions': recentSessions.length,
        'latest_rpe': recentSessions.isNotEmpty ? recentSessions.first.sessionRPE : null,
        'latest_doms': recentDOMS.isNotEmpty ? recentDOMS.first.averageSoreness : null,
        'has_hrv_data': latestReadiness?.hrvScore != null,
        'recommendations': _generateRecommendations(readinessScore, acwr),
      };
    } catch (e) {
      throw Exception('Error getting readiness analysis: $e');
    }
  }

  List<String> _generateRecommendations(double readinessScore, double acwr) {
    final recommendations = <String>[];

    // Readiness-based recommendations
    if (readinessScore >= 0.8) {
      recommendations.add('Excellent readiness - ready for high intensity training');
    } else if (readinessScore >= 0.6) {
      recommendations.add('Good readiness - proceed with normal training');
    } else if (readinessScore >= 0.4) {
      recommendations.add('Moderate readiness - consider reducing intensity');
    } else {
      recommendations.add('Poor readiness - focus on recovery today');
    }

    // ACWR-based recommendations
    if (acwr > 1.5) {
      recommendations.add('High training load - consider deload week');
    } else if (acwr < 0.8) {
      recommendations.add('Low training load - room for progression');
    } else {
      recommendations.add('Optimal training load balance');
    }

    return recommendations;
  }

  /// Get progression history for trending
  Future<List<Map<String, dynamic>>> getProgressionHistory({
    required String userId,
    int days = 30,
  }) async {
    try {
      final sessions = await getRecentSessions(userId: userId, days: days);
      final domsSurveys = await getRecentDOMSSurveys(userId: userId, days: days);

      // Combine data by date
      final historyMap = <String, Map<String, dynamic>>{};

      for (final session in sessions) {
        final dateKey = session.date.toIso8601String().split('T')[0];
        historyMap[dateKey] = {
          'date': dateKey,
          'session_rpe': session.sessionRPE,
          'rpe_load': session.rpeLoad,
          'total_load': session.totalLoad,
        };
      }

      for (final doms in domsSurveys) {
        final dateKey = doms.date.toIso8601String().split('T')[0];
        if (historyMap.containsKey(dateKey)) {
          historyMap[dateKey]!.addAll({
            'overall_soreness': doms.overallSoreness,
            'sleep_quality': doms.sleepQuality,
            'energy_level': doms.energyLevel,
          });
        }
      }

      // Convert to sorted list
      final history = historyMap.values.toList();
      history.sort((a, b) => b['date'].compareTo(a['date']));

      return history;
    } catch (e) {
      throw Exception('Error fetching progression history: $e');
    }
  }
}