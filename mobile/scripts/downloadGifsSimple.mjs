import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = 'exercise-gifs';

console.log('🚀 Starting GIF download process...');

// Simple test to upload one GIF first
async function testUpload() {
  try {
    console.log('🧪 Testing upload with a simple test file...');
    
    // Create a simple test blob
    const testContent = 'test gif content';
    const testBlob = Buffer.from(testContent);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload('test.gif', testBlob, {
        contentType: 'image/gif',
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('❌ Test upload failed:', error.message);
      if (error.message.includes('Bucket not found')) {
        console.log('💡 You need to create the "exercise-gifs" bucket in your Supabase dashboard:');
        console.log('   1. Go to Storage in Supabase dashboard');
        console.log('   2. Click "Create bucket"');
        console.log('   3. Name: exercise-gifs');
        console.log('   4. Make it Public');
        console.log('   5. Click Create');
        return false;
      }
      return false;
    }
    
    console.log('✅ Test upload successful!');
    
    // Clean up test file
    await supabase.storage.from(BUCKET_NAME).remove(['test.gif']);
    
    return true;
  } catch (error) {
    console.error('❌ Test upload error:', error.message);
    return false;
  }
}

async function downloadSingleGif(exerciseId, sourceUrl) {
  try {
    console.log(`⬇️  Downloading: ${exerciseId}`);
    
    // Download from source
    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const buffer = await response.buffer();
    const fileName = `${exerciseId}.gif`;
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: 'image/gif',
        cacheControl: '86400',
        upsert: true
      });
    
    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);
    
    console.log(`✅ ${exerciseId}: ${urlData.publicUrl}`);
    return { success: true, url: urlData.publicUrl };
    
  } catch (error) {
    console.log(`❌ ${exerciseId}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  // Test upload first
  const testPassed = await testUpload();
  if (!testPassed) {
    return;
  }
  
  // Try downloading a few sample GIFs to test the process
  const sampleGifs = [
    { id: 'barbell_squat', url: 'https://www.inspireusafoundation.org/wp-content/uploads/2021/06/barbell-squat.gif' },
    { id: 'deadlift', url: 'https://www.inspireusafoundation.org/wp-content/uploads/2021/06/deadlift.gif' },
    { id: 'bench_press', url: 'https://www.inspireusafoundation.org/wp-content/uploads/2021/06/barbell-bench-press.gif' }
  ];
  
  console.log('🧪 Testing with 3 sample GIFs...');
  
  for (const gif of sampleGifs) {
    await downloadSingleGif(gif.id, gif.url);
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('🏁 Sample test complete!');
  console.log('💡 If this worked, we can proceed with all 213 exercises');
}

main().catch(console.error);