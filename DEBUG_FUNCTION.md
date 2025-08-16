# 🐛 Debug Function - Simple Test

## Create a simple test function first

1. Go to Edge Functions → Create new function → Name: `test-algorithm`
2. Use this minimal code:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Function called successfully')
    
    const body = await req.json().catch(() => ({}))
    console.log('Request body:', body)
    
    return new Response(
      JSON.stringify({ 
        message: 'Function working!', 
        received: body,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
```

3. Deploy and test with:

```bash
curl -X POST https://YOUR_PROJECT_URL/functions/v1/test-algorithm \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## If that works, the issue is in the complex function

## Common 500 Error Causes:

### 1. Missing Environment Variables
Your function might not have access to `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### 2. Wrong Table References
Check if you have a `users` table or if it should be `auth.users`.

### 3. RLS Policy Issues
User might not have permission to access tables.

## Quick Fix - Updated Simple Algorithm

Replace your function with this safer version:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    })

    const { action, user_id, ...data } = await req.json()

    // Validate user_id
    if (!user_id) {
      throw new Error('user_id is required')
    }

    switch (action) {
      case 'get_suggestion':
        return await getSimpleSuggestion(supabaseClient, user_id, data)
      
      case 'log_session':
        return await logSimpleSession(supabaseClient, user_id, data)
        
      default:
        return new Response(
          JSON.stringify({ 
            message: 'Algorithm is working!',
            available_actions: ['get_suggestion', 'log_session'],
            user_id: user_id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more info'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

async function getSimpleSuggestion(supabase: any, user_id: string, data: any) {
  const { current_load = 100 } = data
  
  // Simple algorithm without database dependency
  const readinessIndex = 0.7 // Default readiness
  const loadMultiplier = readinessIndex >= 0.7 ? 1.05 : 0.95
  const suggestedLoad = Math.round(current_load * loadMultiplier)
  
  return new Response(
    JSON.stringify({
      user_id,
      current_load,
      suggested_load: suggestedLoad,
      readiness_index: readinessIndex,
      reasoning: 'Simple algorithm - increase by 5% or decrease by 5%',
      algorithm_status: 'working'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function logSimpleSession(supabase: any, user_id: string, data: any) {
  const { session_rpe = 7 } = data
  
  try {
    // Try to insert into session_logs
    const { data: result, error } = await supabase
      .from('session_logs')
      .insert({
        user_id: user_id,
        date: new Date().toISOString().split('T')[0],
        session_rpe: session_rpe,
        total_load: 100,
        rpe_load: 100 * session_rpe
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Database insert failed',
          details: error.message,
          suggestion: 'Check if tables exist and RLS policies allow access'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({
        message: 'Session logged successfully',
        data: result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Failed to log session',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}
```

## Test Commands:

```bash
# Test basic function
curl -X POST https://YOUR_PROJECT_URL/functions/v1/progression-algorithm \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test-123"}'

# Test suggestion
curl -X POST https://YOUR_PROJECT_URL/functions/v1/progression-algorithm \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get_suggestion", 
    "user_id": "test-123",
    "current_load": 100
  }'
```

Try this and let me know what error you get!