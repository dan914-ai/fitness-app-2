import { supabase } from '../config/supabase';

class ProgressionService {
  // Get latest recovery data
  async getLatestRecovery(userId: string) {
    try {
      if (!userId) {
        return null;
      }

      // Try Supabase first
      try {
        const { data, error } = await supabase
          .from('user_doms_data')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          return data[0];
        }
      } catch (supabaseError) {
        console.log('Supabase recovery data fetch failed, trying local storage');
      }

      // Fallback to local storage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const existingSurveys = await AsyncStorage.getItem('@doms_surveys');
      
      if (!existingSurveys) {
        return null;
      }

      const surveys = JSON.parse(existingSurveys);
      
      // Filter by userId and sort by date
      const userSurveys = surveys
        .filter((s: any) => s.user_id === userId)
        .sort((a: any, b: any) => {
          const dateA = new Date(a.created_at || a.survey_date);
          const dateB = new Date(b.created_at || b.survey_date);
          return dateB.getTime() - dateA.getTime();
        });
      
      // Return the most recent survey
      return userSurveys.length > 0 ? userSurveys[0] : null;
    } catch (error) {
      console.error('Error fetching recovery data:', error);
      return null;
    }
  }

  // Get recent RPE average
  async getRecentRPE(userId: string, days: number = 7) {
    try {
      if (!userId) {
        return null;
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('user_session_data')
        .select('session_rpe')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('RPE data query error:', error);
        return null;
      }
      
      if (!data || data.length === 0) return null;
      
      // Add null check for session_rpe values
      const validRPEs = data.filter(session => session.session_rpe != null);
      if (validRPEs.length === 0) return null;
      
      const avgRPE = validRPEs.reduce((sum, session) => sum + session.session_rpe, 0) / validRPEs.length;
      return avgRPE;
    } catch (error) {
      console.error('Error fetching RPE data:', error);
      return null;
    }
  }

  // Get progression suggestion
  async getProgressionSuggestion(userId: string, currentLoad: number, exerciseType: string = 'compound') {
    try {
      // Input validation
      if (!userId) {
        return { 
          suggested_load: currentLoad || 0, 
          reason: '유효하지 않은 사용자 ID',
          readiness_index: 0.5,
          recovery_metrics: { sleep: 5, energy: 5, soreness: 5, motivation: 5 }
        };
      }

      if (typeof currentLoad !== 'number' || currentLoad < 0) {
        currentLoad = 0;
      }

      // Try Edge Function first (ready for deployment)
      
      try {
        // Call the Edge Function
        const { data, error } = await supabase.functions.invoke('progression-algorithm', {
          body: {
            action: 'get_suggestion',
            user_id: userId,
            current_load: currentLoad,
            exercise_type: exerciseType
          }
        });

        if (error) {
          throw error;
        }

        if (data) {
          
          // Transform the response to match our expected format
          return {
            suggested_load: data.suggested_load || currentLoad,
            readiness_index: data.readiness_index || 0.5,
            reason: data.reason || '중량 유지',
            recovery_metrics: data.recovery_metrics || {
              sleep: 5,
              energy: 5,
              soreness: 5,
              motivation: 5
            }
          };
        }
      } catch (edgeFunctionError) {
      }

      // Fallback to local logic if Edge Function fails
      
      // Get latest recovery data
      const recovery = await this.getLatestRecovery(userId);
      
      const recentRPE = await this.getRecentRPE(userId);
      
      if (!recovery) {
        // If no recovery data, still suggest progression based on current load
        let suggestedLoad = currentLoad;
        let reason = '';
        
        if (currentLoad === 0) {
          // No previous weight data - suggest starting weight
          suggestedLoad = exerciseType === 'compound' ? 20 : 10;
          reason = '📝 시작 중량 제안';
        } else {
          // Default 2.5% increase if no recovery data
          suggestedLoad = Math.round(currentLoad * 1.025);
          reason = '↑ 표준 증량 (2.5%)';
        }
        
        return { 
          suggested_load: suggestedLoad, 
          reason: reason,
          readiness_index: 0.5,
          recovery_metrics: {
            sleep: 5,
            energy: 5,
            soreness: 5,
            motivation: 5
          }
        };
      }

      // Calculate readiness based on recovery metrics with null checks
      const sleep_quality = recovery.sleep_quality || 5;
      const energy_level = recovery.energy_level || 5;
      const overall_soreness = recovery.overall_soreness || 5;
      const motivation = recovery.motivation || 5;
      
      
      const readinessScore = (sleep_quality + energy_level + (10 - overall_soreness) + motivation) / 4;
      
      let suggestedLoad = currentLoad;
      let reason = '';
      

      // Simple progression logic
      if (currentLoad === 0) {
        // No previous weight data - suggest starting weight
        suggestedLoad = exerciseType === 'compound' ? 20 : 10; // 20kg for compound, 10kg for isolation
        reason = '📝 이전 중량 기록 없음 - 시작 중량 제안';
      } else if (readinessScore >= 8 && recentRPE && recentRPE < 7) {
        // High recovery + easy recent workouts = increase load
        suggestedLoad = Math.round(currentLoad * 1.05); // +5%
        reason = '↑ 뛰어난 회복! 5% 증량';
      } else if (readinessScore >= 7) {
        // Good recovery = maintain or slight increase
        suggestedLoad = Math.round(currentLoad * 1.025); // +2.5%
        reason = '→ 좋은 회복, 소폭 증량';
      } else if (readinessScore <= 4 || overall_soreness >= 7) {
        // Poor recovery = decrease load
        suggestedLoad = Math.round(currentLoad * 0.9); // -10%
        reason = '↓ 낮은 회복도, 10% 감량';
      } else {
        // Normal recovery = maintain
        suggestedLoad = currentLoad;
        reason = '→ 정상 회복, 중량 유지';
      }

      const result = {
        suggested_load: suggestedLoad,
        readiness_index: readinessScore / 10,
        reason,
        recovery_metrics: {
          sleep: sleep_quality,
          energy: energy_level,
          soreness: overall_soreness,
          motivation
        }
      };
      
      return result;
    } catch (error) {
      console.error('Error getting progression suggestion:', error);
      return { 
        suggested_load: currentLoad, 
        reason: '제안 계산 중 오류 발생' 
      };
    }
  }

  // Log session RPE
  async logSessionRPE(userId: string, sessionRPE: number, exercises: any[], duration: number) {
    try {
      // Input validation
      if (!userId) {
        console.warn('logSessionRPE: No userId provided');
        return { success: false, error: 'No user ID' };
      }
      
      if (typeof sessionRPE !== 'number' || sessionRPE < 1 || sessionRPE > 10) {
        console.warn('logSessionRPE: Invalid RPE value:', sessionRPE);
        return { success: false, error: 'Invalid RPE value' };
      }

      // Skip Edge Function call to avoid CORS errors
      // Edge functions need to be deployed via Supabase CLI
      
      // Calculate total load (simplified version) with null checks
      const totalLoad = Array.isArray(exercises) ? exercises.reduce((sum, ex) => 
        sum + ((ex?.sets || 0) * (ex?.reps || 0) * (ex?.weight || 0)), 0
      ) : 0;

      // Check if userId is a valid UUID
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      
      if (!isValidUUID || userId.startsWith('test-')) {
        // If not a valid UUID or is a test user, save to local storage only
        console.log('Non-UUID or test user detected, saving to local storage');
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const localKey = `@rpe_session_${Date.now()}`;
        await AsyncStorage.setItem(localKey, JSON.stringify({
          user_id: userId,
          session_rpe: sessionRPE,
          duration_minutes: duration,
          total_load: totalLoad,
          created_at: new Date().toISOString()
        }));
        return { success: true, session: null, local: true };
      }

      try {
        const { data, error } = await supabase
          .from('user_session_data')
          .insert({
            user_id: userId,
            session_rpe: sessionRPE,
            duration_minutes: duration,
            total_load: totalLoad,
            exercise_count: exercises?.length || 0
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase error logging RPE:', error);
          // Don't throw, save to local storage instead
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const localKey = `@rpe_session_${Date.now()}`;
          await AsyncStorage.setItem(localKey, JSON.stringify({
            user_id: userId,
            session_rpe: sessionRPE,
            duration_minutes: duration,
            total_load: totalLoad,
            created_at: new Date().toISOString()
          }));
          console.log('Saved RPE to local storage as fallback');
          return { success: true, session: null, local: true };
        }
        
        return { success: true, session: data };
      } catch (dbError) {
        console.warn('Database error, saving to local storage:', dbError);
        // Save to local storage as fallback
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const localKey = `@rpe_session_${Date.now()}`;
        await AsyncStorage.setItem(localKey, JSON.stringify({
          user_id: userId,
          session_rpe: sessionRPE,
          duration_minutes: duration,
          total_load: totalLoad,
          created_at: new Date().toISOString()
        }));
        return { success: true, session: null, local: true };
      }
    } catch (error) {
      console.error('Error in logSessionRPE:', error);
      // Return error response instead of throwing
      return { success: false, error: error.message || 'Failed to log RPE' };
    }
  }

  // Submit DOMS survey
  async submitDOMSSurvey(userId: string, surveyData: any) {
    try {
      // Input validation
      if (!userId) {
        throw new Error('사용자 ID가 필요합니다');
      }
      
      if (!surveyData || typeof surveyData !== 'object') {
        throw new Error('설문 데이터가 필요합니다');
      }

      // Check if userId is a valid UUID before trying Supabase
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      
      if (isValidUUID && !userId.startsWith('test-')) {
        // Try Supabase if valid UUID
        try {
          const { data, error } = await supabase
            .from('user_doms_data')
            .insert({
              user_id: userId,
              ...surveyData,
              survey_date: new Date().toISOString().split('T')[0],
            })
            .select()
            .single();

          if (!error && data) {
            console.log('DOMS survey saved to Supabase');
            return { success: true, survey: data };
          }
          if (error) {
            console.log('DOMS survey table may not exist, using local storage');
          }
        } catch (supabaseError) {
          console.log('Supabase save failed, using local storage');
        }
      }

      // Fallback to local storage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      // Get existing surveys
      const existingSurveys = await AsyncStorage.getItem('@doms_surveys');
      const surveys = existingSurveys ? JSON.parse(existingSurveys) : [];
      
      // Add new survey with userId and timestamp
      const newSurvey = {
        ...surveyData,
        user_id: userId,
        survey_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };
      
      surveys.push(newSurvey);
      
      // Keep only last 30 days of surveys
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSurveys = surveys.filter((s: any) => 
        new Date(s.created_at) > thirtyDaysAgo
      );
      
      // Save to local storage
      await AsyncStorage.setItem('@doms_surveys', JSON.stringify(recentSurveys));
      await AsyncStorage.setItem('@last_doms_survey', newSurvey.survey_date);
      
      console.log('DOMS survey saved to local storage');
      
      // Calculate readiness score locally
      const readinessScore = (
        (surveyData.sleep_quality || 5) * 0.3 +
        (surveyData.energy_level || 5) * 0.3 +
        (10 - (surveyData.overall_soreness || 5)) * 0.2 +
        (surveyData.motivation || 5) * 0.2
      );
      
      return { 
        success: true, 
        survey: newSurvey,
        readiness_score: readinessScore,
        recommendation: readinessScore >= 7 ? '강한 운동 가능' : 
                        readinessScore >= 5 ? '적당한 운동 권장' : 
                        '가벼운 운동 또는 휴식'
      };
    } catch (error) {
      console.error('Error submitting DOMS survey:', error);
      // Don't throw - return success with local save
      return { 
        success: false, 
        error: '설문 저장 실패',
        survey: null 
      };
    }
  }

  // Get DOMS survey history for a user
  async getDOMSSurveyHistory(userId: string, days: number = 30) {
    try {
      if (!userId) {
        return [];
      }

      // Try Supabase first
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
          .from('user_doms_data')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (supabaseError) {
        console.log('Supabase DOMS history fetch failed, trying local storage');
      }

      // Fallback to local storage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const existingSurveys = await AsyncStorage.getItem('@doms_surveys');
      
      if (!existingSurveys) {
        return [];
      }

      const surveys = JSON.parse(existingSurveys);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Filter by userId and date range
      const userSurveys = surveys
        .filter((s: any) => {
          const surveyDate = new Date(s.created_at || s.survey_date);
          return s.user_id === userId && surveyDate >= startDate;
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(a.created_at || a.survey_date);
          const dateB = new Date(b.created_at || b.survey_date);
          return dateB.getTime() - dateA.getTime();
        });
      
      return userSurveys;
    } catch (error) {
      console.error('Error fetching DOMS survey history:', error);
      return [];
    }
  }
}

export default new ProgressionService();