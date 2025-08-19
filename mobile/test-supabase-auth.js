const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://ayttqsgttuvdhvbvbnsk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dHRxc2d0dHV2ZGh2YnZibnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNzI0NzgsImV4cCI6MjA2ODc0ODQ3OH0.qUu0TNp2Q3cGBZjWJQHAype9gBN303G5yGo13CayMDA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignUp() {
  console.log('🔍 Testing Supabase Signup...\n');
  
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@gmail.com`;
  const testPassword = 'TestPassword123!';
  
  console.log(`📧 Attempting signup with: ${testEmail}`);
  console.log(`🔑 Password: ${testPassword}\n`);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });
    
    if (error) {
      console.error('❌ Signup Error:', error);
      console.error('\nError Details:');
      console.error('- Message:', error.message);
      console.error('- Status:', error.status);
      console.error('- Code:', error.code);
      
      // Check for specific error types
      if (error.message?.includes('not enabled')) {
        console.log('\n⚠️  SOLUTION: Enable email signups in your Supabase dashboard:');
        console.log('1. Go to https://app.supabase.com/project/ayttqsgttuvdhvbvbnsk/auth/providers');
        console.log('2. Enable "Email" provider');
        console.log('3. Disable "Confirm email" if you want immediate access\n');
      } else if (error.message?.includes('rate limit')) {
        console.log('\n⚠️  SOLUTION: You\'ve hit the rate limit. Wait a few minutes and try again.\n');
      } else if (error.message?.includes('already registered')) {
        console.log('\n⚠️  This email is already registered. Try signing in instead.\n');
      }
    } else {
      console.log('✅ Signup Successful!');
      console.log('\nUser Data:', JSON.stringify(data.user, null, 2));
      
      if (data.session) {
        console.log('\n🔐 Session created successfully');
      } else {
        console.log('\n⚠️  No session created - email confirmation may be required');
        console.log('Check your Supabase settings: Auth > Providers > Email > Confirm email');
      }
    }
  } catch (err) {
    console.error('❌ Unexpected Error:', err);
  }
}

async function testSignIn() {
  console.log('\n🔍 Testing Supabase SignIn...\n');
  
  const testEmail = 'testuser@gmail.com';
  const testPassword = 'TestPassword123!';
  
  console.log(`📧 Attempting signin with: ${testEmail}`);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (error) {
      console.error('❌ SignIn Error:', error);
      console.error('\nError Details:');
      console.error('- Message:', error.message);
      console.error('- Status:', error.status);
    } else {
      console.log('✅ SignIn Successful!');
      console.log('\nUser:', data.user?.email);
      console.log('Session:', data.session ? 'Active' : 'None');
    }
  } catch (err) {
    console.error('❌ Unexpected Error:', err);
  }
}

async function checkAuthSettings() {
  console.log('\n🔍 Checking Supabase Connection...\n');
  
  try {
    // Test basic connection
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Connection Error:', error);
    } else {
      console.log('✅ Connected to Supabase');
      console.log('Current Session:', session ? 'Active' : 'None');
    }
    
    // Try to get auth settings (this might fail due to permissions)
    console.log('\n📋 Project Info:');
    console.log('- URL:', supabaseUrl);
    console.log('- Key (first 40 chars):', supabaseKey.substring(0, 40) + '...');
    
  } catch (err) {
    console.error('❌ Error checking settings:', err);
  }
}

// Run tests
async function runTests() {
  await checkAuthSettings();
  await testSignUp();
  await testSignIn();
  
  console.log('\n✅ Tests Complete!\n');
  console.log('If signup is failing, check these common issues:');
  console.log('1. Email provider not enabled in Supabase dashboard');
  console.log('2. Email confirmation required (disable for testing)');
  console.log('3. Rate limiting (too many attempts)');
  console.log('4. Invalid email domain restrictions');
  console.log('\nVisit: https://app.supabase.com/project/ayttqsgttuvdhvbvbnsk/auth/providers');
  
  process.exit(0);
}

runTests();