import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProgressionRequest {
  action: 'get_suggestion' | 'log_session' | 'submit_doms';
  user_id: string;
  current_load?: number;
  exercise_type?: string;
  session_rpe?: number;
  duration_minutes?: number;
  exercises?: any[];
  // DOMS survey fields
  sleep_quality?: number;
  energy_level?: number;
  motivation?: number;
  overall_soreness?: number;
  chest_soreness?: number;
  back_soreness?: number;
  legs_soreness?: number;
  arms_soreness?: number;
  shoulders_soreness?: number;
  core_soreness?: number;
}

// Progression calculation logic
function calculateProgressionSuggestion(
  currentLoad: number,
  exerciseType: string,
  recovery: any,
  recentRPE: number | null
): {
  suggested_load: number;
  readiness_index: number;
  reason: string;
  recovery_metrics: any;
} {
  let suggestedLoad = currentLoad;
  let reason = '';
  let readinessIndex = 0.5;

  if (!recovery) {
    // No recovery data - use default progression
    if (currentLoad === 0) {
      suggestedLoad = exerciseType === 'compound' ? 20 : 10;
      reason = '📝 시작 중량 제안';
    } else {
      suggestedLoad = Math.round(currentLoad * 1.025);
      reason = '↑ 표준 증량 (2.5%)';
    }
    
    return {
      suggested_load: suggestedLoad,
      readiness_index: 0.5,
      reason,
      recovery_metrics: {
        sleep: 5,
        energy: 5,
        soreness: 5,
        motivation: 5
      }
    };
  }

  // Calculate readiness based on recovery metrics
  const sleep_quality = recovery.sleep_quality || 5;
  const energy_level = recovery.energy_level || 5;
  const overall_soreness = recovery.overall_soreness || 5;
  const motivation = recovery.motivation || 5;
  
  const readinessScore = (sleep_quality + energy_level + (10 - overall_soreness) + motivation) / 4;
  readinessIndex = readinessScore / 10;
  
  // Simple progression logic
  if (currentLoad === 0) {
    suggestedLoad = exerciseType === 'compound' ? 20 : 10;
    reason = '📝 이전 중량 기록 없음 - 시작 중량 제안';
  } else if (readinessScore >= 8 && recentRPE && recentRPE < 7) {
    suggestedLoad = Math.round(currentLoad * 1.05);
    reason = '↑ 뛰어난 회복! 5% 증량';
  } else if (readinessScore >= 7) {
    suggestedLoad = Math.round(currentLoad * 1.025);
    reason = '→ 좋은 회복, 소폭 증량';
  } else if (readinessScore <= 4 || overall_soreness >= 7) {
    suggestedLoad = Math.round(currentLoad * 0.9);
    reason = '↓ 낮은 회복도, 10% 감량';
  } else {
    suggestedLoad = currentLoad;
    reason = '→ 정상 회복, 중량 유지';
  }

  return {
    suggested_load: suggestedLoad,
    readiness_index: readinessIndex,
    reason,
    recovery_metrics: {
      sleep: sleep_quality,
      energy: energy_level,
      soreness: overall_soreness,
      motivation
    }
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const requestData: ProgressionRequest = await req.json()
    const { action, user_id } = requestData

    if (!user_id) {
      throw new Error('user_id is required')
    }

    switch (action) {
      case 'get_suggestion': {
        const { current_load = 0, exercise_type = 'compound' } = requestData;
        
        // Get latest recovery data
        const { data: recoveryData } = await supabaseClient
          .from('user_doms_data')
          .select('*')
          .eq('user_id', user_id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Get recent RPE average
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const { data: sessionData } = await supabaseClient
          .from('user_session_data')
          .select('session_rpe')
          .eq('user_id', user_id)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false });

        const validRPEs = sessionData?.filter(s => s.session_rpe != null) || [];
        const recentRPE = validRPEs.length > 0 
          ? validRPEs.reduce((sum, s) => sum + s.session_rpe, 0) / validRPEs.length 
          : null;

        const recovery = recoveryData && recoveryData.length > 0 ? recoveryData[0] : null;
        const suggestion = calculateProgressionSuggestion(current_load, exercise_type, recovery, recentRPE);

        return new Response(
          JSON.stringify(suggestion),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      case 'log_session': {
        const { session_rpe, duration_minutes, exercises = [] } = requestData;
        
        if (typeof session_rpe !== 'number' || session_rpe < 1 || session_rpe > 10) {
          throw new Error('session_rpe must be between 1 and 10');
        }

        // Calculate total load
        const totalLoad = exercises.reduce((sum: number, ex: any) => 
          sum + ((ex?.sets || 0) * (ex?.reps || 0) * (ex?.weight || 0)), 0
        );

        const { data, error } = await supabaseClient
          .from('user_session_data')
          .insert({
            user_id,
            session_rpe,
            duration_minutes,
            total_load: totalLoad,
            exercise_count: exercises.length
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, session: data }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      case 'submit_doms': {
        const {
          sleep_quality = 5,
          energy_level = 5,
          motivation = 5,
          overall_soreness = 5,
          chest_soreness = 0,
          back_soreness = 0,
          legs_soreness = 0,
          arms_soreness = 0,
          shoulders_soreness = 0,
          core_soreness = 0
        } = requestData;

        const insertData = {
          user_id,
          sleep_quality,
          energy_level,
          motivation,
          overall_soreness,
          chest_soreness,
          back_soreness,
          legs_soreness,
          arms_soreness,
          shoulders_soreness,
          core_soreness,
          survey_date: new Date().toISOString().split('T')[0],
        };

        const { data, error } = await supabaseClient
          .from('user_doms_data')
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;

        // Calculate readiness score
        const readinessScore = (sleep_quality + energy_level + (10 - overall_soreness) + motivation) / 4;
        let recommendation = '';
        
        if (readinessScore >= 8) {
          recommendation = 'Excellent recovery! Ready for intense training.';
        } else if (readinessScore >= 6) {
          recommendation = 'Good recovery. Moderate training recommended.';
        } else if (readinessScore >= 4) {
          recommendation = 'Below average recovery. Consider light training.';
        } else {
          recommendation = 'Poor recovery. Focus on rest and recovery.';
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            survey: data,
            readiness_score: Math.round(readinessScore * 10) / 10,
            recommendation
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})