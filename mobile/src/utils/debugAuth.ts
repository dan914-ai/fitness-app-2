// Debug helper for authentication issues
export function debugAuthError(error: any, context: string) {
  console.log(`\n========== AUTH DEBUG: ${context} ==========`);
  console.log('Error Type:', error?.constructor?.name || 'Unknown');
  console.log('Error Message:', error?.message || 'No message');
  console.log('Error Status:', error?.status || 'No status');
  console.log('Error Code:', error?.code || 'No code');
  
  if (error?.message) {
    console.log('\nError Analysis:');
    if (error.message.includes('Email not confirmed')) {
      console.log('→ Email confirmation required');
      console.log('→ Should use mock auth for testing');
    } else if (error.message.includes('invalid')) {
      console.log('→ Email format rejected by Supabase');
      console.log('→ Should try alternative email formats');
    } else if (error.message.includes('Invalid login credentials')) {
      console.log('→ Wrong email/password combination');
      console.log('→ Account might not exist');
    }
  }
  
  console.log('==========================================\n');
}

export function debugLoginAttempt(email: string, password: string) {
  console.log('\n========== LOGIN ATTEMPT ==========');
  console.log('Email:', email);
  console.log('Password length:', password.length);
  console.log('Password:', password === 'test123456' ? 'test123456 ✓' : 'NOT test123456 ✗');
  console.log('===================================\n');
}