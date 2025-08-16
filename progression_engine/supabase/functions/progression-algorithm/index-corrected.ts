import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', 
      {
        global: {
          headers: {
            Authorization: req.headers.get('Authorization')!
          }
        }
      }
    );

    const { action, user_id, ...data } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({
        error: 'user_id is required'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    switch (action) {
      case 'log_session':
        return await logSession(supabaseClient, user_id, data);
      case 'submit_doms':
        return await submitDOMS(supabaseClient, user_id, data);
      case 'get_suggestion':
        return await getSuggestion(supabaseClient, user_id, data);
      default:
        return new Response(JSON.stringify({
          message: 'Progression Algorithm Ready!',
          available_actions: ['log_session', 'submit_doms', 'get_suggestion'],
          user_id: user_id
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});

async function logSession(supabase: any, user_id: string, data: any) {
  const { session_rpe, duration_minutes = 60, exercises = [] } = data;
  
  // Calculate total load
  const totalLoad = exercises.reduce((sum: number, ex: any) => 
    sum + ((ex?.sets || 0) * (ex?.reps || 0) * (ex?.weight || 0)), 0
  );

  // FIXED: Use correct table name for mobile app
  const { data: result, error } = await supabase
    .from('user_session_data')  // Changed from 'session_logs'
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

  return new Response(JSON.stringify({
    success: true,
    session: result
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

async function submitDOMS(supabase: any, user_id: string, data: any) {
  const {
    chest_soreness = 0,
    back_soreness = 0,
    legs_soreness = 0,
    arms_soreness = 0,
    shoulders_soreness = 0,
    core_soreness = 0,
    overall_soreness = 0,
    sleep_quality = 7,
    energy_level = 7,
    motivation = 7
  } = data;

  // Calculate readiness metrics
  const avgSoreness = (chest_soreness + back_soreness + legs_soreness + arms_soreness + shoulders_soreness + core_soreness) / 6;
  const readinessScore = (sleep_quality + energy_level + (10 - overall_soreness) + motivation) / 4;

  // FIXED: Use correct table name for mobile app
  const { data: result, error } = await supabase
    .from('user_doms_data')  // Changed from 'doms_surveys'
    .insert({
      user_id,
      survey_date: new Date().toISOString().split('T')[0],
      chest_soreness,
      back_soreness,
      legs_soreness,
      arms_soreness,
      shoulders_soreness,
      core_soreness,
      overall_soreness,
      sleep_quality,
      energy_level,
      motivation
    })
    .select()
    .single();

  if (error) throw error;

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

  return new Response(JSON.stringify({
    success: true,
    survey: result,
    readiness_score: Math.round(readinessScore * 10) / 10,
    recommendation
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

async function getSuggestion(supabase: any, user_id: string, data: any) {
  const { current_load = 0, exercise_type = 'compound' } = data;

  // FIXED: Use correct table names for mobile app
  const { data: sessions } = await supabase
    .from('user_session_data')  // Changed from 'session_logs'
    .select('session_rpe')
    .eq('user_id', user_id)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  const { data: doms } = await supabase
    .from('user_doms_data')  // Changed from 'doms_surveys'
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(1);

  // Calculate readiness index
  let readinessIndex = 0.5;
  let recovery_metrics = {
    sleep: 5,
    energy: 5,
    soreness: 5,
    motivation: 5
  };

  if (doms && doms.length > 0) {
    const survey = doms[0];
    const sleep_quality = survey.sleep_quality || 5;
    const energy_level = survey.energy_level || 5;
    const overall_soreness = survey.overall_soreness || 5;
    const motivation = survey.motivation || 5;
    
    readinessIndex = (sleep_quality + energy_level + (10 - overall_soreness) + motivation) / 40;
    
    recovery_metrics = {
      sleep: sleep_quality,
      energy: energy_level,
      soreness: overall_soreness,
      motivation: motivation
    };
  }

  // Get recent RPE
  const validRPEs = sessions?.filter((s: any) => s.session_rpe != null) || [];
  const recentRPE = validRPEs.length > 0 
    ? validRPEs.reduce((sum: number, s: any) => sum + s.session_rpe, 0) / validRPEs.length 
    : null;

  // Progression logic
  let suggestedLoad = current_load;
  let reason = '';

  if (current_load === 0) {
    suggestedLoad = exercise_type === 'compound' ? 20 : 10;
    reason = '📝 시작 중량 제안';
  } else if (readinessIndex >= 0.8 && recentRPE && recentRPE < 7) {
    suggestedLoad = Math.round(current_load * 1.05);
    reason = '↑ 뛰어난 회복! 5% 증량';
  } else if (readinessIndex >= 0.7) {
    suggestedLoad = Math.round(current_load * 1.025);
    reason = '→ 좋은 회복, 소폭 증량';
  } else if (readinessIndex <= 0.4 || (recovery_metrics.soreness >= 7)) {
    suggestedLoad = Math.round(current_load * 0.9);
    reason = '↓ 낮은 회복도, 10% 감량';
  } else {
    suggestedLoad = current_load;
    reason = '→ 정상 회복, 중량 유지';
  }

  // FIXED: Return format expected by mobile app
  return new Response(JSON.stringify({
    suggested_load: suggestedLoad,
    readiness_index: Math.round(readinessIndex * 100) / 100,
    reason: reason,  // Changed from 'reasoning'
    recovery_metrics: recovery_metrics  // Added missing field
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}