import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SessionCompleteRequest {
  user_id: string;
  session_rpe: number;
  workout_duration_minutes: number;
  exercises_completed: Array<{
    exercise_name: string;
    sets: number;
    avg_weight: number;
    avg_reps: number;
  }>;
  notes?: string;
}

function calculateTotalLoad(exercises: any[], duration: number): number {
  // Calculate total load using volume (sets * reps * weight) and duration
  const volumeLoad = exercises.reduce((total, exercise) => {
    return total + (exercise.sets * exercise.avg_reps * exercise.avg_weight);
  }, 0);
  
  // Normalize by duration to get load per minute, then scale
  const durationFactor = Math.max(1, duration / 60); // Minimum 1 hour baseline
  return Math.round(volumeLoad * durationFactor * 100) / 100;
}

function calculateRPELoad(totalLoad: number, sessionRPE: number): number {
  // RPE Load = Total Load * RPE (Foster's method)
  return Math.round(totalLoad * sessionRPE * 100) / 100;
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

    const { 
      user_id, 
      session_rpe, 
      workout_duration_minutes, 
      exercises_completed,
      notes 
    }: SessionCompleteRequest = await req.json()

    // Validate input
    if (!user_id || session_rpe < 0 || session_rpe > 10) {
      throw new Error('Invalid input: user_id required and session_rpe must be 0-10')
    }

    const today = new Date().toISOString().split('T')[0]

    // Calculate loads
    const totalLoad = calculateTotalLoad(exercises_completed, workout_duration_minutes)
    const rpeLoad = calculateRPELoad(totalLoad, session_rpe)

    // Insert or update session log
    const { data: existingSession } = await supabaseClient
      .from('session_logs')
      .select('id')
      .eq('user_id', user_id)
      .eq('date', today)
      .single()

    let sessionResult;
    
    if (existingSession) {
      // Update existing session
      sessionResult = await supabaseClient
        .from('session_logs')
        .update({
          session_rpe,
          total_load: totalLoad,
          rpe_load: rpeLoad,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSession.id)
        .select()
        .single()
    } else {
      // Insert new session
      sessionResult = await supabaseClient
        .from('session_logs')
        .insert({
          user_id,
          date: today,
          session_rpe,
          total_load: totalLoad,
          rpe_load: rpeLoad,
          notes: notes || null
        })
        .select()
        .single()
    }

    if (sessionResult.error) {
      throw new Error(`Failed to save session: ${sessionResult.error.message}`)
    }

    // Calculate recent metrics for context
    const { data: recentSessions } = await supabaseClient
      .from('session_logs')
      .select('*')
      .eq('user_id', user_id)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false })

    const recentLoads = (recentSessions || []).map(s => s.rpe_load || 0)
    const avgRPELast7Days = recentLoads.length > 0 
      ? Math.round(recentLoads.reduce((sum, load) => sum + load, 0) / recentLoads.length * 100) / 100
      : 0

    const response = {
      session: sessionResult.data,
      calculated_metrics: {
        total_load: totalLoad,
        rpe_load: rpeLoad,
        workout_duration_minutes,
        exercises_count: exercises_completed.length
      },
      context: {
        avg_rpe_load_last_7_days: avgRPELast7Days,
        sessions_last_7_days: recentLoads.length,
        load_trend: recentLoads.length >= 2 
          ? rpeLoad > recentLoads[1] ? 'increasing' : rpeLoad < recentLoads[1] ? 'decreasing' : 'stable'
          : 'insufficient_data'
      },
      suggestions: {
        tomorrow_doms_survey: session_rpe >= 7,
        recovery_focus: rpeLoad > avgRPELast7Days * 1.2,
        progression_ready: session_rpe <= 6 && rpeLoad <= avgRPELast7Days * 1.1
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