import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Debugging Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key prefix:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT SET');

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugConnection() {
  try {
    // Test 1: Check service role
    console.log('\n1️⃣ Testing storage service...');
    const { data: storageData, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.log('❌ Storage error:', storageError);
    } else {
      console.log('✅ Storage accessible');
      console.log('📦 Buckets found:', storageData.length);
      storageData.forEach(bucket => {
        console.log(`   - ${bucket.name} (public: ${bucket.public}, created: ${bucket.created_at})`);
      });
    }

    // Test 2: Try to access exercise-gifs specifically
    console.log('\n2️⃣ Testing exercise-gifs bucket access...');
    try {
      const { data: listData, error: listError } = await supabase.storage
        .from('exercise-gifs')
        .list('', { limit: 1 });
      
      if (listError) {
        console.log('❌ Bucket access error:', listError.message);
      } else {
        console.log('✅ Can access exercise-gifs bucket');
        console.log('📁 Files in bucket:', listData.length);
      }
    } catch (e) {
      console.log('❌ Exception accessing bucket:', e.message);
    }

    // Test 3: Check auth status
    console.log('\n3️⃣ Checking auth status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else {
      console.log('👤 User:', user ? user.email : 'Anonymous');
    }

    console.log('\n💡 Diagnosis:');
    if (storageData && storageData.length === 0) {
      console.log('- No buckets found - bucket may not be created or anon key lacks permissions');
      console.log('- Double-check bucket exists and is public in Supabase dashboard');
      console.log('- Make sure you\'re using the anon key, not the service role key');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugConnection();