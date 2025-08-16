import { supabase } from '../config/supabase';

export async function testSupabaseAuth() {
  console.log('=== Testing Supabase Auth ===');
  
  try {
    // Test 1: Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Current session:', session ? 'Active' : 'None');
    if (sessionError) console.error('Session error:', sessionError);
    
    // Test 2: Try creating a test account
    const timestamp = Date.now();
    const testEmail = `test_${timestamp}@example.com`;
    const testPassword = `test${timestamp}`;
    
    console.log('Creating test account:', testEmail);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      console.error('❌ Sign up error:', signUpError);
      return false;
    }
    
    console.log('✅ Sign up response:', {
      user: signUpData.user?.id,
      email: signUpData.user?.email,
      confirmed: signUpData.user?.confirmed_at,
      session: !!signUpData.session,
    });
    
    // Test 3: Try signing in with the account
    console.log('Attempting sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (signInError) {
      console.error('❌ Sign in error:', signInError);
      
      // Check if it's email confirmation required
      if (signInError.message.includes('confirm') || signInError.message.includes('Email')) {
        console.log('ℹ️  This Supabase project requires email confirmation. Test accounts won\'t work without it.');
      }
    } else {
      console.log('✅ Sign in successful!', {
        userId: signInData.user?.id,
        session: !!signInData.session,
      });
      
      // Sign out to clean up
      await supabase.auth.signOut();
    }
    
    console.log('=== Auth Test Complete ===');
    return true;
  } catch (error) {
    console.error('Auth test failed:', error);
    return false;
  }
}

// Also export a function to check if email confirmations are required
export async function checkEmailConfirmationRequired() {
  // This is a heuristic - try to sign up and see if we get a session back
  const timestamp = Date.now();
  const testEmail = `check_${timestamp}@example.com`;
  const testPassword = `check${timestamp}`;
  
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });
  
  if (error) {
    console.error('Check failed:', error);
    return null;
  }
  
  // If we get a session immediately, email confirmation is NOT required
  // If we don't get a session, email confirmation IS required
  const requiresConfirmation = !data.session;
  
  console.log('Email confirmation required:', requiresConfirmation);
  
  return requiresConfirmation;
}