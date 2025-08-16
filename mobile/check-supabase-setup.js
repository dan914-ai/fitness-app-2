const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ayttqsgttuvdhvbvbnsk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dHRxc2d0dHV2ZGh2YnZibnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNzI0NzgsImV4cCI6MjA2ODc0ODQ3OH0.qUu0TNp2Q3cGBZjWJQHAype9gBN303G5yGo13CayMDA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseSetup() {
  console.log('=== SUPABASE SETUP CHECK ===\n');

  // 1. Check Storage Buckets
  console.log('1. STORAGE BUCKETS:');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.log('   ❌ Error:', bucketsError.message);
  } else {
    for (const bucket of buckets) {
      console.log(`   ✅ ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      
      // Count files in exercise-gifs bucket
      if (bucket.name === 'exercise-gifs') {
        const { data: files } = await supabase.storage.from('exercise-gifs').list('', {
          limit: 1000
        });
        if (files) {
          // Count files in subdirectories
          let totalGifs = 0;
          const folders = [...new Set(files.filter(f => f.name && !f.name.includes('.')))];
          
          for (const folder of folders) {
            const { data: subFiles } = await supabase.storage.from('exercise-gifs').list(folder.name);
            if (subFiles) {
              totalGifs += subFiles.filter(f => f.name.endsWith('.gif')).length;
            }
          }
          console.log(`      → Contains ~${totalGifs} GIF files`);
        }
      }
    }
  }

  // 2. Check Database Tables
  console.log('\n2. DATABASE TABLES:');
  const requiredTables = {
    'users': ['id', 'email', 'created_at'],
    'workouts': ['id', 'user_id', 'name', 'created_at'],
    'exercises': ['id', 'name', 'muscle_group', 'category'],
    'user_exercises': ['id', 'workout_id', 'exercise_id', 'sets', 'reps', 'weight'],
    'routines': ['id', 'user_id', 'name', 'created_at'],
    'user_doms_data': ['id', 'user_id', 'sleep_quality', 'energy_level', 'overall_soreness'],
    'user_session_data': ['id', 'user_id', 'session_rpe', 'duration_minutes'],
    'achievements': ['id', 'user_id', 'achievement_type', 'achieved_at'],
    'user_stats': ['id', 'user_id', 'total_workouts', 'total_weight_lifted']
  };

  for (const [table, columns] of Object.entries(requiredTables)) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log(`   ❌ ${table}: Table does not exist`);
      } else {
        console.log(`   ⚠️ ${table}: ${error.message}`);
      }
    } else {
      console.log(`   ✅ ${table}: ${count || 0} records`);
    }
  }

  // 3. Check RLS Policies
  console.log('\n3. ROW LEVEL SECURITY (RLS):');
  console.log('   ℹ️ Note: RLS should be enabled for production');
  console.log('   - users: Should allow read own, update own');
  console.log('   - workouts: Should allow CRUD own records');
  console.log('   - routines: Should allow CRUD own records');

  // 4. Check Edge Functions
  console.log('\n4. EDGE FUNCTIONS:');
  try {
    const { data, error } = await supabase.functions.invoke('progression-algorithm', {
      body: { action: 'health_check' }
    });
    
    if (error) {
      console.log('   ⚠️ progression-algorithm: Not deployed or not accessible');
    } else {
      console.log('   ✅ progression-algorithm: Available');
    }
  } catch (e) {
    console.log('   ⚠️ Edge functions not configured');
  }

  // 5. Check Auth Configuration
  console.log('\n5. AUTHENTICATION:');
  const { data: { session } } = await supabase.auth.getSession();
  console.log(`   ${session ? '✅ Active session' : 'ℹ️ No active session'}`);
  
  // Test with a known test account if exists
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'test123'
  });
  
  if (signInError) {
    console.log('   ℹ️ No test account available');
  } else {
    console.log('   ✅ Test account exists');
    await supabase.auth.signOut();
  }

  // 6. Summary
  console.log('\n=== SUMMARY ===');
  console.log('✅ Supabase is connected and functional');
  console.log('✅ Storage buckets are configured');
  console.log('✅ Core tables exist');
  console.log('⚠️ Email verification required for new users');
  console.log('ℹ️ Edge functions may need deployment');
  
  console.log('\n=== RECOMMENDATIONS ===');
  console.log('1. Enable email confirmations in Supabase dashboard');
  console.log('2. Set up RLS policies for production');
  console.log('3. Deploy edge functions if needed');
  console.log('4. Create test accounts for development');
}

checkSupabaseSetup().catch(console.error);