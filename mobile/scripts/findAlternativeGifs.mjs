import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Alternative GIF sources for the failed exercises
const alternativeGifSources = {
  'goblet-squat': [
    'https://cdn.shopify.com/s/files/1/1497/9682/files/2_10.gif?v=1641913319',
    'https://www.inspireusafoundation.org/wp-content/uploads/2022/05/goblet-squat.gif',
    'https://hips.hearstapps.com/hmg-prod/images/workouts/2016/03/goblettsquat-1457100810.gif'
  ],
  'tricep-overhead-extension': [
    'https://cdn.shopify.com/s/files/1/1497/9682/files/8_20.gif?v=1641914135',
    'https://www.inspireusafoundation.org/wp-content/uploads/2022/06/tricep-overhead-extension.gif',
    'https://hips.hearstapps.com/hmg-prod/images/workouts/2016/03/overheadtricepextension-1457101942.gif'
  ],
  'leg-extension': [
    'https://cdn.shopify.com/s/files/1/1497/9682/files/4_8.gif?v=1641913748',
    'https://www.inspireusafoundation.org/wp-content/uploads/2022/04/leg-extension.gif',
    'https://hips.hearstapps.com/hmg-prod/images/workouts/2016/03/legextension-1457101598.gif'
  ],
  'smith-machine-squat': [
    'https://cdn.shopify.com/s/files/1/1497/9682/files/3_15.gif?v=1641913575',
    'https://www.inspireusafoundation.org/wp-content/uploads/2022/05/smith-machine-squat.gif'
  ],
  'pause-deadlift': [
    'https://cdn.shopify.com/s/files/1/1497/9682/files/1_19.gif?v=1641913180',
    'https://www.inspireusafoundation.org/wp-content/uploads/2022/06/pause-deadlift.gif'
  ],
  'clapping-push-up': [
    'https://cdn.shopify.com/s/files/1/1497/9682/files/7_17.gif?v=1641914019',
    'https://hips.hearstapps.com/hmg-prod/images/workouts/2016/03/clappingpushup-1457100636.gif'
  ],
  't-bar-row': [
    'https://cdn.shopify.com/s/files/1/1497/9682/files/6_12.gif?v=1641913887',
    'https://www.inspireusafoundation.org/wp-content/uploads/2022/05/t-bar-row.gif'
  ],
  'seated-calf-raise': [
    'https://cdn.shopify.com/s/files/1/1497/9682/files/5_6.gif?v=1641913812',
    'https://www.inspireusafoundation.org/wp-content/uploads/2022/04/seated-calf-raise.gif'
  ],
  'dumbbell-hip-thrust': [
    'https://cdn.shopify.com/s/files/1/1497/9682/files/2_11.gif?v=1641913351',
    'https://www.inspireusafoundation.org/wp-content/uploads/2022/05/dumbbell-hip-thrust.gif'
  ],
  'hang-clean': [
    'https://cdn.shopify.com/s/files/1/1497/9682/files/1_20.gif?v=1641913214',
    'https://www.inspireusafoundation.org/wp-content/uploads/2022/06/hang-clean.gif'
  ],
  'battle-ropes': [
    'https://cdn.shopify.com/s/files/1/1497/9682/files/9_3.gif?v=1641914232',
    'https://hips.hearstapps.com/hmg-prod/images/workouts/2016/03/battleropes-1457100473.gif'
  ],
  'diamond-pushup': [
    'https://cdn.shopify.com/s/files/1/1497/9682/files/7_18.gif?v=1641914052',
    'https://hips.hearstapps.com/hmg-prod/images/workouts/2016/03/diamondpushup-1457100698.gif'
  ],
  'concentration-curl': [
    'https://cdn.shopify.com/s/files/1/1497/9682/files/8_21.gif?v=1641914169',
    'https://hips.hearstapps.com/hmg-prod/images/workouts/2016/03/concentrationcurl-1457100658.gif'
  ],
  'bear-crawl': [
    'https://cdn.shopify.com/s/files/1/1497/9682/files/9_4.gif?v=1641914266',
    'https://hips.hearstapps.com/hmg-prod/images/workouts/2016/03/bearcrawl-1457100491.gif'
  ],
  'hack-squat': [
    'https://cdn.shopify.com/s/files/1/1497/9682/files/3_16.gif?v=1641913607',
    'https://www.inspireusafoundation.org/wp-content/uploads/2022/05/hack-squat.gif'
  ]
};

async function downloadFromAlternativeSource(exerciseId, sources) {
  for (let i = 0; i < sources.length; i++) {
    const sourceUrl = sources[i];
    try {
      console.log(`⬇️  ${exerciseId} from source ${i + 1}/${sources.length}`);
      
      const response = await fetch(sourceUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/gif,image/*,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.google.com/'
        },
        timeout: 30000
      });
      
      if (!response.ok) {
        console.log(`❌ Source ${i + 1}: HTTP ${response.status}`);
        continue;
      }
      
      const buffer = await response.arrayBuffer();
      
      if (buffer.byteLength < 100) {
        console.log(`❌ Source ${i + 1}: File too small`);
        continue;
      }
      
      // Validate it's a GIF
      const uint8Array = new Uint8Array(buffer);
      const isGif = uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46;
      
      if (!isGif) {
        console.log(`❌ Source ${i + 1}: Not a valid GIF`);
        continue;
      }
      
      console.log(`📤 Uploading ${exerciseId} (${(buffer.byteLength / 1024).toFixed(1)}KB)`);
      
      const fileName = `${exerciseId}.gif`;
      const { data, error } = await supabase.storage
        .from('exercise-gifs')
        .upload(fileName, buffer, {
          contentType: 'image/gif',
          cacheControl: '86400',
          upsert: true
        });
      
      if (error) {
        console.log(`❌ Upload failed: ${error.message}`);
        continue;
      }
      
      console.log(`✅ ${exerciseId} - SUCCESS from alternative source!`);
      return { success: true, exerciseId, sourceUsed: i + 1 };
      
    } catch (error) {
      console.log(`❌ Source ${i + 1}: ${error.message}`);
      continue;
    }
  }
  
  return { success: false, exerciseId, error: 'All alternative sources failed' };
}

async function downloadAlternativeGifs() {
  console.log('🔍 Searching for alternative GIF sources...');
  console.log(`🎯 Found ${Object.keys(alternativeGifSources).length} exercises with alternative sources`);
  
  const results = { success: 0, failed: 0, errors: [] };
  
  for (const [exerciseId, sources] of Object.entries(alternativeGifSources)) {
    console.log(`\n📦 Processing: ${exerciseId}`);
    
    // Check if already exists
    try {
      const { data: existing } = await supabase.storage
        .from('exercise-gifs')
        .list('', { search: `${exerciseId}.gif`, limit: 1 });
      
      if (existing && existing.length > 0) {
        console.log(`✓ ${exerciseId} (already exists)`);
        continue;
      }
    } catch (e) {
      // Continue with download
    }
    
    const result = await downloadFromAlternativeSource(exerciseId, sources);
    
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push(result);
    }
    
    // Delay between downloads
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🏁 Alternative source download complete!');
  console.log(`✅ New successes: ${results.success}`);
  console.log(`❌ Still failed: ${results.failed}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Still failing:');
    results.errors.forEach(err => {
      console.log(`   - ${err.exerciseId}: ${err.error}`);
    });
  }
  
  // Get updated storage stats
  try {
    const { data: files } = await supabase.storage
      .from('exercise-gifs')
      .list('', { limit: 1000 });
    
    if (files) {
      const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
      console.log(`\n📊 Updated stats: ${files.length} files, ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
      console.log(`🎯 New success rate: ${((files.length / 213) * 100).toFixed(1)}%`);
    }
  } catch (e) {
    console.log('Could not get storage stats');
  }
}

downloadAlternativeGifs().catch(console.error);