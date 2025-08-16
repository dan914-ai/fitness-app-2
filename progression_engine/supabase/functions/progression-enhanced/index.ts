import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProgressionRequest {
  user_id: string;
  current_load: number;
  exercise_type: string;
  days_since_last?: number;
}

interface SessionLog {
  date: string;
  session_rpe: number;
  total_load: number;
  rpe_load: number;
}

interface DomsData {
  date: string;
  overall_soreness: number;
  chest_soreness: number;
  back_soreness: number;
  legs_soreness: number;
  arms_soreness: number;
  shoulders_soreness: number;
  core_soreness: number;
  sleep_quality: number;
  energy_level: number;
  motivation: number;
}

interface ReadinessMetrics {
  date: string;
  hrv_score?: number;
  resting_hr?: number;
  sleep_score?: number;
  stress_level?: number;
  readiness_index?: number;
}

function calculateACWR(recentLoads: number[], chronicLoads: number[]): number {
  const acuteLoad = recentLoads.reduce((sum, load) => sum + load, 0) / Math.max(recentLoads.length, 1);
  const chronicLoad = chronicLoads.reduce((sum, load) => sum + load, 0) / Math.max(chronicLoads.length, 1);
  
  if (chronicLoad === 0) return 1.0;
  return acuteLoad / chronicLoad;
}

function calculateReadinessIndex(
  sleepScore: number,
  hrvDelta: number,
  acwr: number,
  sessionRPE: number | null = null,
  domsScore: number | null = null
): number {
  // Normalize sleep score (0-100 to 0-1)
  const sleepFactor = Math.max(0, Math.min(1, sleepScore / 100));
  
  // Normalize HRV delta (-50 to +50 to 0-1)
  const hrvFactor = Math.max(0, Math.min(1, (hrvDelta + 50) / 100));
  
  // ACWR factor (optimal range 0.8-1.3)
  const acwrFactor = acwr >= 0.8 && acwr <= 1.3 ? 1.0 : Math.max(0.3, 1.0 - Math.abs(acwr - 1.05) * 2);
  
  // RPE factor (0-10 scale, lower is better)
  const rpeFactor = sessionRPE !== null ? Math.max(0, (10 - sessionRPE) / 10) : 0.7;
  
  // DOMS factor (0-10 scale, lower is better)
  const domsFactor = domsScore !== null ? Math.max(0, (10 - domsScore) / 10) : 0.7;
  
  // Weighted combination with enhanced factors
  return (
    0.25 * sleepFactor +
    0.20 * hrvFactor +
    0.20 * acwrFactor +
    0.20 * rpeFactor +
    0.15 * domsFactor
  );
}

function generateProgressionSuggestion(
  readinessIndex: number,
  acwr: number,
  currentLoad: number,
  exerciseType: string,
  latestRPE: number | null = null,
  latestDOMS: number | null = null
): {
  suggested_load: number;
  load_change_percent: number;
  reasoning: string;
  recommendation: string;
  confidence: number;
} {
  let loadMultiplier = 1.0;
  let reasoning = "";
  let recommendation = "";
  let confidence = 0.8;
  
  // Base readiness assessment
  if (readinessIndex >= 0.8) {
    loadMultiplier = 1.05; // 5% increase
    reasoning = "High readiness index indicates good recovery";
    recommendation = "Progress with moderate load increase";
    confidence = 0.9;
  } else if (readinessIndex >= 0.6) {
    loadMultiplier = 1.0; // Maintain
    reasoning = "Moderate readiness suggests maintaining current load";
    recommendation = "Maintain current intensity";
    confidence = 0.8;
  } else if (readinessIndex >= 0.4) {
    loadMultiplier = 0.9; // 10% decrease
    reasoning = "Lower readiness indicates need for deload";
    recommendation = "Reduce load for recovery";
    confidence = 0.85;
  } else {
    loadMultiplier = 0.8; // 20% decrease
    reasoning = "Very low readiness requires significant deload";
    recommendation = "Focus on recovery and technique";
    confidence = 0.9;
  }
  
  // ACWR considerations
  if (acwr > 1.5) {
    loadMultiplier *= 0.85; // Additional reduction for high ACWR
    reasoning += ". High ACWR suggests overreaching";
    confidence = Math.max(0.9, confidence);
  } else if (acwr < 0.5) {
    loadMultiplier *= 1.1; // Can push harder if underloaded
    reasoning += ". Low ACWR allows for progression";
  }
  
  // Session RPE considerations
  if (latestRPE !== null) {
    if (latestRPE >= 8) {
      loadMultiplier *= 0.95; // Reduce if last session was very hard
      reasoning += ". Recent high RPE suggests fatigue";
    } else if (latestRPE <= 5) {
      loadMultiplier *= 1.05; // Can increase if last session was easy
      reasoning += ". Recent low RPE indicates capacity for more";
    }
  }
  
  // DOMS considerations
  if (latestDOMS !== null) {
    if (latestDOMS >= 7) {
      loadMultiplier *= 0.9; // Significant reduction for high soreness
      reasoning += ". High muscle soreness indicates incomplete recovery";
      confidence = Math.max(0.85, confidence);
    } else if (latestDOMS <= 3) {
      loadMultiplier *= 1.03; // Small increase if minimal soreness
      reasoning += ". Low soreness suggests good recovery";
    }
  }
  
  // Exercise-specific adjustments
  const exerciseMultipliers: Record<string, number> = {
    'compound': 1.0,
    'isolation': 1.05,
    'cardio': 1.08,
    'power': 0.95
  };
  
  loadMultiplier *= exerciseMultipliers[exerciseType] || 1.0;
  
  const suggestedLoad = Math.round(currentLoad * loadMultiplier * 100) / 100;
  const changePercent = Math.round((loadMultiplier - 1) * 100 * 100) / 100;
  
  return {
    suggested_load: suggestedLoad,
    load_change_percent: changePercent,
    reasoning,
    recommendation,
    confidence
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

    const { user_id, current_load, exercise_type, days_since_last = 1 }: ProgressionRequest = await req.json()

    // Get recent session logs (last 7 days for acute load)
    const { data: recentSessions } = await supabaseClient
      .from('session_logs')
      .select('*')
      .eq('user_id', user_id)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false })

    // Get chronic load data (last 28 days)
    const { data: chronicSessions } = await supabaseClient
      .from('session_logs')
      .select('*')
      .eq('user_id', user_id)
      .gte('date', new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false })

    // Get latest DOMS data
    const { data: latestDoms } = await supabaseClient
      .from('doms_surveys')
      .select('*')
      .eq('user_id', user_id)
      .order('date', { ascending: false })
      .limit(1)

    // Get latest readiness metrics
    const { data: latestReadiness } = await supabaseClient
      .from('readiness_metrics')
      .select('*')
      .eq('user_id', user_id)
      .order('date', { ascending: false })
      .limit(1)

    // Calculate metrics
    const recentLoads = (recentSessions as SessionLog[] || []).map(s => s.rpe_load || s.total_load || 0)
    const chronicLoads = (chronicSessions as SessionLog[] || []).map(s => s.rpe_load || s.total_load || 0)
    const acwr = calculateACWR(recentLoads, chronicLoads)

    // Extract latest metrics
    const latestDomsData = latestDoms?.[0] as DomsData | undefined
    const latestReadinessData = latestReadiness?.[0] as ReadinessMetrics | undefined
    const latestSessionData = recentSessions?.[0] as SessionLog | undefined

    // Calculate readiness index
    const sleepScore = latestDomsData?.sleep_quality ? latestDomsData.sleep_quality * 10 : 70
    const hrvDelta = latestReadinessData?.hrv_score || 0
    const latestRPE = latestSessionData?.session_rpe || null
    const avgDOMS = latestDomsData ? (
      latestDomsData.overall_soreness +
      latestDomsData.chest_soreness +
      latestDomsData.back_soreness +
      latestDomsData.legs_soreness +
      latestDomsData.arms_soreness +
      latestDomsData.shoulders_soreness +
      latestDomsData.core_soreness
    ) / 7 : null

    const readinessIndex = calculateReadinessIndex(
      sleepScore,
      hrvDelta,
      acwr,
      latestRPE,
      avgDOMS
    )

    // Generate progression suggestion
    const suggestion = generateProgressionSuggestion(
      readinessIndex,
      acwr,
      current_load,
      exercise_type,
      latestRPE,
      avgDOMS
    )

    const response = {
      readiness_index: Math.round(readinessIndex * 100) / 100,
      acwr: Math.round(acwr * 100) / 100,
      progression: suggestion,
      metrics: {
        latest_rpe: latestRPE,
        latest_doms: avgDOMS ? Math.round(avgDOMS * 100) / 100 : null,
        sleep_score: Math.round(sleepScore),
        sessions_last_7_days: recentLoads.length,
        sessions_last_28_days: chronicLoads.length
      },
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})