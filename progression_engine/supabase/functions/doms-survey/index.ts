import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DOMSSurveyRequest {
  user_id: string;
  date?: string; // Optional, defaults to today
  chest_soreness: number;
  back_soreness: number;
  legs_soreness: number;
  arms_soreness: number;
  shoulders_soreness: number;
  core_soreness: number;
  overall_soreness: number;
  sleep_quality: number;
  energy_level: number;
  motivation: number;
  notes?: string;
}

function validateSorenessScale(value: number, fieldName: string): void {
  if (value < 0 || value > 10) {
    throw new Error(`${fieldName} must be between 0 and 10`)
  }
}

function validateWellnessScale(value: number, fieldName: string): void {
  if (value < 1 || value > 10) {
    throw new Error(`${fieldName} must be between 1 and 10`)
  }
}

function calculateReadinessScore(domsSurvey: DOMSSurveyRequest): number {
  // Calculate muscle soreness average (lower is better)
  const muscleAreas = [
    domsSurvey.chest_soreness,
    domsSurvey.back_soreness,
    domsSurvey.legs_soreness,
    domsSurvey.arms_soreness,
    domsSurvey.shoulders_soreness,
    domsSurvey.core_soreness
  ];
  
  const avgMuscleScore = muscleAreas.reduce((sum, score) => sum + score, 0) / muscleAreas.length;
  
  // Normalize scores to 0-1 scale
  const sorenessScore = Math.max(0, (10 - avgMuscleScore) / 10); // Invert so lower soreness = higher score
  const overallScore = Math.max(0, (10 - domsSurvey.overall_soreness) / 10);
  const sleepScore = domsSurvey.sleep_quality / 10;
  const energyScore = domsSurvey.energy_level / 10;
  const motivationScore = domsSurvey.motivation / 10;
  
  // Weighted readiness calculation
  const readinessScore = (
    0.25 * sorenessScore +      // 25% muscle-specific soreness
    0.20 * overallScore +       // 20% overall feeling
    0.25 * sleepScore +         // 25% sleep quality
    0.15 * energyScore +        // 15% energy level
    0.15 * motivationScore      // 15% motivation
  );
  
  return Math.round(readinessScore * 100) / 100;
}

function generateRecoveryRecommendations(domsSurvey: DOMSSurveyRequest): string[] {
  const recommendations: string[] = [];
  
  // Sleep recommendations
  if (domsSurvey.sleep_quality <= 5) {
    recommendations.push("Focus on sleep hygiene - aim for 7-9 hours of quality sleep");
  }
  
  // Energy recommendations
  if (domsSurvey.energy_level <= 4) {
    recommendations.push("Consider reducing training intensity today");
    recommendations.push("Ensure adequate nutrition and hydration");
  }
  
  // Motivation recommendations
  if (domsSurvey.motivation <= 4) {
    recommendations.push("Consider a lighter workout or active recovery");
    recommendations.push("Try a different exercise style to maintain engagement");
  }
  
  // Muscle-specific recommendations
  const highSoreness = [];
  if (domsSurvey.chest_soreness >= 7) highSoreness.push("chest");
  if (domsSurvey.back_soreness >= 7) highSoreness.push("back");
  if (domsSurvey.legs_soreness >= 7) highSoreness.push("legs");
  if (domsSurvey.arms_soreness >= 7) highSoreness.push("arms");
  if (domsSurvey.shoulders_soreness >= 7) highSoreness.push("shoulders");
  if (domsSurvey.core_soreness >= 7) highSoreness.push("core");
  
  if (highSoreness.length > 0) {
    recommendations.push(`Avoid training ${highSoreness.join(', ')} today - high soreness detected`);
    recommendations.push("Consider massage, stretching, or foam rolling for sore areas");
  }
  
  // Overall soreness recommendations
  if (domsSurvey.overall_soreness >= 8) {
    recommendations.push("Take a full rest day - very high overall soreness");
  } else if (domsSurvey.overall_soreness >= 6) {
    recommendations.push("Consider active recovery only - walking, light stretching");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Good recovery status - ready for normal training");
  }
  
  return recommendations;
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

    const requestData: DOMSSurveyRequest = await req.json()
    const surveyDate = requestData.date || new Date().toISOString().split('T')[0]

    // Validate all inputs
    validateSorenessScale(requestData.chest_soreness, 'chest_soreness');
    validateSorenessScale(requestData.back_soreness, 'back_soreness');
    validateSorenessScale(requestData.legs_soreness, 'legs_soreness');
    validateSorenessScale(requestData.arms_soreness, 'arms_soreness');
    validateSorenessScale(requestData.shoulders_soreness, 'shoulders_soreness');
    validateSorenessScale(requestData.core_soreness, 'core_soreness');
    validateSorenessScale(requestData.overall_soreness, 'overall_soreness');
    validateWellnessScale(requestData.sleep_quality, 'sleep_quality');
    validateWellnessScale(requestData.energy_level, 'energy_level');
    validateWellnessScale(requestData.motivation, 'motivation');

    // Check if survey exists for this date
    const { data: existingSurvey } = await supabaseClient
      .from('doms_surveys')
      .select('id')
      .eq('user_id', requestData.user_id)
      .eq('date', surveyDate)
      .single()

    // Prepare survey data
    const surveyData = {
      user_id: requestData.user_id,
      date: surveyDate,
      chest_soreness: requestData.chest_soreness,
      back_soreness: requestData.back_soreness,
      legs_soreness: requestData.legs_soreness,
      arms_soreness: requestData.arms_soreness,
      shoulders_soreness: requestData.shoulders_soreness,
      core_soreness: requestData.core_soreness,
      overall_soreness: requestData.overall_soreness,
      sleep_quality: requestData.sleep_quality,
      energy_level: requestData.energy_level,
      motivation: requestData.motivation,
      notes: requestData.notes || null
    };

    let surveyResult;
    
    if (existingSurvey) {
      // Update existing survey
      surveyResult = await supabaseClient
        .from('doms_surveys')
        .update({
          ...surveyData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSurvey.id)
        .select()
        .single()
    } else {
      // Insert new survey
      surveyResult = await supabaseClient
        .from('doms_surveys')
        .insert(surveyData)
        .select()
        .single()
    }

    if (surveyResult.error) {
      throw new Error(`Failed to save DOMS survey: ${surveyResult.error.message}`)
    }

    // Calculate metrics
    const readinessScore = calculateReadinessScore(requestData);
    const recommendations = generateRecoveryRecommendations(requestData);

    // Get recent surveys for trend analysis
    const { data: recentSurveys } = await supabaseClient
      .from('doms_surveys')
      .select('overall_soreness, sleep_quality, energy_level, motivation, date')
      .eq('user_id', requestData.user_id)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(7)

    // Calculate trends
    const trends = {
      soreness_trend: 'stable' as 'improving' | 'worsening' | 'stable',
      sleep_trend: 'stable' as 'improving' | 'worsening' | 'stable',
      energy_trend: 'stable' as 'improving' | 'worsening' | 'stable',
      motivation_trend: 'stable' as 'improving' | 'worsening' | 'stable'
    };

    if (recentSurveys && recentSurveys.length >= 3) {
      const recent = recentSurveys.slice(0, 3);
      const older = recentSurveys.slice(-3);
      
      const avgRecentSoreness = recent.reduce((sum, s) => sum + s.overall_soreness, 0) / recent.length;
      const avgOlderSoreness = older.reduce((sum, s) => sum + s.overall_soreness, 0) / older.length;
      
      const avgRecentSleep = recent.reduce((sum, s) => sum + s.sleep_quality, 0) / recent.length;
      const avgOlderSleep = older.reduce((sum, s) => sum + s.sleep_quality, 0) / older.length;
      
      const avgRecentEnergy = recent.reduce((sum, s) => sum + s.energy_level, 0) / recent.length;
      const avgOlderEnergy = older.reduce((sum, s) => sum + s.energy_level, 0) / older.length;
      
      const avgRecentMotivation = recent.reduce((sum, s) => sum + s.motivation, 0) / recent.length;
      const avgOlderMotivation = older.reduce((sum, s) => sum + s.motivation, 0) / older.length;
      
      trends.soreness_trend = avgRecentSoreness < avgOlderSoreness - 0.5 ? 'improving' : 
                             avgRecentSoreness > avgOlderSoreness + 0.5 ? 'worsening' : 'stable';
      trends.sleep_trend = avgRecentSleep > avgOlderSleep + 0.5 ? 'improving' : 
                          avgRecentSleep < avgOlderSleep - 0.5 ? 'worsening' : 'stable';
      trends.energy_trend = avgRecentEnergy > avgOlderEnergy + 0.5 ? 'improving' : 
                           avgRecentEnergy < avgOlderEnergy - 0.5 ? 'worsening' : 'stable';
      trends.motivation_trend = avgRecentMotivation > avgOlderMotivation + 0.5 ? 'improving' : 
                               avgRecentMotivation < avgOlderMotivation - 0.5 ? 'worsening' : 'stable';
    }

    const response = {
      survey: surveyResult.data,
      analysis: {
        readiness_score: readinessScore,
        readiness_category: readinessScore >= 0.8 ? 'excellent' : 
                           readinessScore >= 0.6 ? 'good' : 
                           readinessScore >= 0.4 ? 'moderate' : 'poor',
        dominant_soreness_areas: Object.entries({
          chest: requestData.chest_soreness,
          back: requestData.back_soreness,
          legs: requestData.legs_soreness,
          arms: requestData.arms_soreness,
          shoulders: requestData.shoulders_soreness,
          core: requestData.core_soreness
        }).filter(([_, score]) => score >= 6).map(([area, _]) => area),
        trends
      },
      recommendations,
      training_guidance: {
        recommended_intensity: readinessScore >= 0.8 ? 'high' :
                              readinessScore >= 0.6 ? 'moderate' :
                              readinessScore >= 0.4 ? 'low' : 'rest',
        focus_areas: requestData.overall_soreness >= 6 ? ['recovery', 'mobility'] : 
                    readinessScore >= 0.7 ? ['strength', 'progression'] : 
                    ['maintenance', 'technique']
      },
      timestamp: new Date().toISOString()
    };

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