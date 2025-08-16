import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectUpload() {
  try {
    console.log('🧪 Testing direct upload to exercise-gifs bucket...');
    
    // Download a real GIF and upload it
    const testGifUrl = 'https://www.inspireusafoundation.org/wp-content/uploads/2024/02/cable-standing-crossover.gif';
    
    console.log('⬇️  Downloading test GIF...');
    const response = await fetch(testGifUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    
    const buffer = await response.buffer();
    console.log(`✅ Downloaded ${buffer.length} bytes`);
    
    console.log('⬆️  Uploading to Supabase...');
    const { data, error } = await supabase.storage
      .from('exercise-gifs')
      .upload('test-barbell-squat.gif', buffer, {
        contentType: 'image/gif',
        cacheControl: '86400',
        upsert: true
      });
    
    if (error) {
      console.error('❌ Upload failed:', error.message);
      return false;
    }
    
    console.log('✅ Upload successful!');
    console.log('📁 File path:', data.path);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('exercise-gifs')
      .getPublicUrl('test-barbell-squat.gif');
    
    console.log('🌐 Public URL:', urlData.publicUrl);
    
    // Test if we can access the URL
    console.log('🔍 Testing public URL access...');
    const testResponse = await fetch(urlData.publicUrl);
    console.log('📊 URL status:', testResponse.status, testResponse.statusText);
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testDirectUpload();