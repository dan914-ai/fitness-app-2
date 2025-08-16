const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ayttqsgttuvdhvbvbnsk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dHRxc2d0dHV2ZGh2YnZibnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNzI0NzgsImV4cCI6MjA2ODc0ODQ3OH0.qUu0TNp2Q3cGBZjWJQHAype9gBN303G5yGo13CayMDA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('Testing Supabase Authentication...\n');
  
  // Test 1: Check connection
  console.log('1. Testing connection to Supabase...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.log('   ❌ Connection failed:', bucketsError.message);
  } else {
    console.log('   ✅ Connected to Supabase');
    console.log('   Buckets:', buckets.map(b => b.name).join(', '));
  }

  // Test 2: Create test user
  console.log('\n2. Testing user registration...');
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        username: 'testuser'
      }
    }
  });

  if (signUpError) {
    console.log('   ❌ Registration failed:', signUpError.message);
  } else {
    console.log('   ✅ User registered:', signUpData.user?.email);
  }

  // Test 3: Sign in
  console.log('\n3. Testing login...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  if (signInError) {
    console.log('   ❌ Login failed:', signInError.message);
  } else {
    console.log('   ✅ Login successful');
    console.log('   User ID:', signInData.user?.id);
    console.log('   Session:', signInData.session ? 'Active' : 'None');
  }

  // Test 4: Check tables
  console.log('\n4. Checking database tables...');
  const tables = [
    'users',
    'workouts', 
    'exercises',
    'user_exercises',
    'routines',
    'user_doms_data',
    'user_session_data'
  ];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`   ❌ ${table}: ${error.message}`);
    } else {
      console.log(`   ✅ ${table}: ${count || 0} records`);
    }
  }

  // Clean up - sign out
  await supabase.auth.signOut();
  console.log('\n✅ Test complete - signed out');
}

testAuth().catch(console.error);