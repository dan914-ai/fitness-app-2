import { supabase } from '../config/supabase';

export async function testSupabaseConnection() {
  
  try {
    // Test 1: Check if Supabase client is initialized
    
    // Test 2: Try to get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
    } else {
    }
    
    // Test 3: Try to access storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('exercise-gifs')
      .list('', { limit: 1 });
    
    if (storageError) {
      console.error('Storage error:', storageError);
    } else {
    }
    
    // Test 4: Check auth health
    const { error: healthError } = await supabase.auth.getUser();
    if (healthError && healthError.message !== 'Auth session missing!') {
      console.error('Auth health check error:', healthError);
    } else {
    }
    
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}