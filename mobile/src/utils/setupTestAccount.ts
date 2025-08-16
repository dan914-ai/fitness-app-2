import { supabase } from '../config/supabase';

export const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'test123456',
  username: 'testuser',
};

export async function ensureTestAccountExists() {
  try {
    
    // Try to sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_CREDENTIALS.email,
      password: TEST_CREDENTIALS.password,
    });
    
    if (signInData?.session) {
      await supabase.auth.signOut(); // Sign out so user can manually sign in
      return { success: true, message: 'Test account exists' };
    }
    
    // If sign in failed, try to create the account
    if (signInError?.message?.includes('Invalid login credentials')) {
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: TEST_CREDENTIALS.email,
        password: TEST_CREDENTIALS.password,
        options: {
          data: {
            username: TEST_CREDENTIALS.username,
          },
        },
      });
      
      if (signUpError) {
        console.error('Failed to create test account:', signUpError);
        return { success: false, message: signUpError.message };
      }
      
      if (signUpData.user) {
        // Sign out immediately so user can sign in manually
        await supabase.auth.signOut();
        return { 
          success: true, 
          message: 'Test account created',
          requiresEmailConfirmation: !signUpData.session 
        };
      }
    }
    
    return { 
      success: false, 
      message: signInError?.message || 'Unknown error' 
    };
  } catch (error: any) {
    console.error('Error setting up test account:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to setup test account' 
    };
  }
}

// Alternative test accounts if the main one doesn't work
export const ALTERNATIVE_TEST_ACCOUNTS = [
  { email: 'demo@example.com', password: 'demo123456' },
  { email: 'user@test.com', password: 'test123456' },
  { email: 'test.user@example.com', password: 'password123' },
];