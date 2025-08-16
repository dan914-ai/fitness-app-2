import { supabase } from '../config/supabase';

class ProgressionService {
  // Get latest recovery data
  async getLatestRecovery(userId: string) {
    try {
      if (!userId) {
        console.log('No userId provided for recovery data');
        return null;
      }

      const { data, error } = await supabase
        .from('user_doms_data')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Recovery data query error:', error);
        return null; // Don't throw, return null to continue with fallback
      }
      
      // Return first item or null
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching recovery data:', error);
      return null;
    }
  }

  // Get recent RPE average
  async getRecentRPE(userId: string, days: number = 7) {
    try {
      if (!userId) {
        console.log('No userId provided for RPE data');
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
        console.log('No userId provided for progression suggestion');
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
      console.log('Attempting to use Supabase Edge Function for progression');
      console.log('Input - userId:', userId, 'currentLoad:', currentLoad, 'exerciseType:', exerciseType);
      
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
          console.log('Edge Function response:', data);
          
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
        console.log('Edge Function failed, falling back to local logic:', edgeFunctionError);
        console.log('Error type:', edgeFunctionError.name);
        console.log('Error message:', edgeFunctionError.message);
      }

      // Fallback to local logic if Edge Function fails
      console.log('Using fallback local progression logic');
      console.log('Starting fallback calculation...');
      
      // Get latest recovery data
      const recovery = await this.getLatestRecovery(userId);
      console.log('Recovery data:', recovery);
      
      const recentRPE = await this.getRecentRPE(userId);
      console.log('Recent RPE average:', recentRPE);
      
      if (!recovery) {
        console.log('No recovery data found - using default progression');
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
      
      console.log('Recovery metrics - sleep:', sleep_quality, 'energy:', energy_level, 'soreness:', overall_soreness, 'motivation:', motivation);
      
      const readinessScore = (sleep_quality + energy_level + (10 - overall_soreness) + motivation) / 4;
      console.log('Calculated readiness score:', readinessScore);
      
      let suggestedLoad = currentLoad;
      let reason = '';
      
      console.log('Starting progression logic with currentLoad:', currentLoad);

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
      
      console.log('Final progression result:', result);
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
        throw new Error('사용자 ID가 필요합니다');
      }
      
      if (typeof sessionRPE !== 'number' || sessionRPE < 1 || sessionRPE > 10) {
        throw new Error('세션 RPE는 1과 10 사이여야 합니다');
      }

      // Try Edge Function first (ready for deployment)
      console.log('Attempting to use Supabase Edge Function for RPE logging');
      
      try {
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('progression-algorithm', {
          body: {
            action: 'log_session',
            user_id: userId,
            session_rpe: sessionRPE,
            duration_minutes: duration,
            exercises: exercises
          }
        });

        if (edgeError) {
          throw edgeError;
        }

        if (edgeData) {
          console.log('Edge Function RPE log response:', edgeData);
          return { success: true, session: edgeData.session || edgeData };
        }
      } catch (edgeFunctionError) {
        console.log('Edge Function failed, falling back to direct save:', edgeFunctionError);
      }

      // Fallback to direct database save
      console.log('Using fallback direct database save');
      
      // Calculate total load (simplified version) with null checks
      const totalLoad = Array.isArray(exercises) ? exercises.reduce((sum, ex) => 
        sum + ((ex?.sets || 0) * (ex?.reps || 0) * (ex?.weight || 0)), 0
      ) : 0;

      const { data, error } = await supabase
        .from('user_session_data') // Changed table name
        .insert({
          user_id: userId,
          session_rpe: sessionRPE,
          duration_minutes: duration,
          total_load: totalLoad,
          exercise_count: exercises.length
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, session: data };
    } catch (error) {
      console.error('Error logging session:', error);
      throw error;
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

      // Try Edge Function first (ready for deployment)
      console.log('Attempting to use Supabase Edge Function for DOMS survey');
      console.log('Saving DOMS data:', { user_id: userId, ...surveyData });
      
      try {
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('progression-algorithm', {
          body: {
            action: 'submit_doms',
            user_id: userId,
            ...surveyData
          }
        });

        if (edgeError) {
          throw edgeError;
        }

        if (edgeData) {
          console.log('Edge Function DOMS response:', edgeData);
          return { 
            success: true, 
            survey: edgeData.survey || edgeData,
            readiness_score: edgeData.readiness_score,
            recommendation: edgeData.recommendation
          };
        }
      } catch (edgeFunctionError) {
        console.log('Edge Function failed, falling back to direct save:', edgeFunctionError);
      }

      // Fallback to direct database save
      console.log('Using fallback direct database save');
      
      const insertData = {
        user_id: userId,
        ...surveyData,
        survey_date: new Date().toISOString().split('T')[0], // Changed from 'date' to 'survey_date'
      };
      
      console.log('Exact data being inserted:', JSON.stringify(insertData, null, 2));
      
      const { data, error } = await supabase
        .from('user_doms_data') // Changed table name
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Database error details:', error);
        throw error;
      }
      
      console.log('Data returned from database after insert:', JSON.stringify(data, null, 2));
      console.log('DOMS survey saved successfully:', data);
      return { success: true, survey: data };
    } catch (error) {
      console.error('Error submitting DOMS survey:', error);
      throw error;
    }
  }
}

export default new ProgressionService();