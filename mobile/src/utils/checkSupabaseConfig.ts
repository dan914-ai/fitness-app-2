import { supabase } from '../config/supabase';

export async function checkSupabaseConfig() {
  
  try {
    // Check if Supabase client is initialized
    if (!supabase) {
      console.error('❌ Supabase client is not initialized');
      return false;
    }
    
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check error:', sessionError);
    } else {
    }
    
    // Test a simple database query (won't work without tables, but tests connection)
    const { error: dbError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (dbError) {
      if (dbError.message?.includes('does not exist')) {
        console.warn('⚠️ Database tables not created yet. Run the migration script.');
      } else if (dbError.message?.includes('JWT')) {
      } else {
        console.error('❌ Database connection error:', dbError.message);
      }
    } else {
    }
    
    // Check auth settings
    
    return true;
  } catch (error) {
    console.error('❌ Configuration check failed:', error);
    return false;
  }
}

// Function to test creating a user with different email formats
export async function testEmailFormats() {
  
  const testEmails = [
    'test@gmail.com',
    'test@outlook.com',
    'test@yahoo.com',
    'test@testmail.com',
    'test@example.org',
    'test@test.com',
  ];
  
  for (const email of testEmails) {
    try {
      // Just check if the email format is accepted (don't actually create)
      const { error } = await supabase.auth.signUp({
        email,
        password: 'TestPassword123!',
        options: {
          // Use a fake captcha token to prevent actual signup
          captchaToken: 'test-only'
        }
      });
      
      if (error) {
        if (error.message?.includes('invalid') || error.message?.includes('Invalid')) {
        } else if (error.message?.includes('already registered')) {
        } else {
        }
      } else {
      }
    } catch (err) {
    }
  }
}