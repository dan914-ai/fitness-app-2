import { supabase } from '../config/supabase';

export async function testSupabaseConnection() {
  console.log('=== Testing Supabase Connection ===');
  
  try {
    // Test 1: Check if Supabase client is initialized
    console.log('Supabase client initialized:', !!supabase);
    
    // Test 2: Try to get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
    } else {
      console.log('Session check successful, logged in:', !!session);
    }
    
    // Test 3: Try to access storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('exercise-gifs')
      .list('', { limit: 1 });
    
    if (storageError) {
      console.error('Storage error:', storageError);
    } else {
      console.log('Storage access successful, found items:', storageData?.length || 0);
    }
    
    // Test 4: Check auth health
    const { error: healthError } = await supabase.auth.getUser();
    if (healthError && healthError.message !== 'Auth session missing!') {
      console.error('Auth health check error:', healthError);
    } else {
      console.log('Auth system is responsive');
    }
    
    console.log('=== Supabase Connection Test Complete ===');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}