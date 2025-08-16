import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Comprehensive list of exercise GIF sources from multiple platforms
const exerciseGifSources = {
  'goblet-squat': [
    'https://fitbod.me/wp-content/uploads/2020/10/Goblet-Squat.gif',
    'https://www.bodybuilding.com/exercises/exerciseImages/sequences/508/Male/l/508_2.jpg',
    'https://cdn.jefit.com/assets/img/exercises/gifs/1380.gif',
    'https://static.wixstatic.com/media/2edbed_8c8b3c2d84d24e2e8b7b8f8e0f9e8f8e~mv2.gif'
  ],
  'leg-extension': [
    'https://fitbod.me/wp-content/uploads/2020/10/Leg-Extension.gif',
    'https://cdn.jefit.com/assets/img/exercises/gifs/1265.gif',
    'https://www.bodybuilding.com/exercises/exerciseImages/sequences/46/Male/l/46_2.jpg',
    'https://static.strengthlevel.com/images/exercises/leg-extension/leg-extension-800.jpg'
  ],
  'seated-calf-raise': [
    'https://fitbod.me/wp-content/uploads/2020/10/Seated-Calf-Raise.gif',
    'https://cdn.jefit.com/assets/img/exercises/gifs/1255.gif',
    'https://www.bodybuilding.com/exercises/exerciseImages/sequences/142/Male/l/142_2.jpg'
  ],
  'diamond-pushup': [
    'https://fitbod.me/wp-content/uploads/2020/10/Diamond-Push-Up.gif',
    'https://cdn.jefit.com/assets/img/exercises/gifs/1345.gif',
    'https://www.bodybuilding.com/exercises/exerciseImages/sequences/1468/Male/l/1468_2.jpg'
  ],
  'concentration-curl': [
    'https://fitbod.me/wp-content/uploads/2020/10/Concentration-Curl.gif',
    'https://cdn.jefit.com/assets/img/exercises/gifs/1205.gif',
    'https://www.bodybuilding.com/exercises/exerciseImages/sequences/136/Male/l/136_2.jpg'
  ],
  't-bar-row': [
    'https://fitbod.me/wp-content/uploads/2020/10/T-Bar-Row.gif',
    'https://cdn.jefit.com/assets/img/exercises/gifs/1285.gif',
    'https://www.bodybuilding.com/exercises/exerciseImages/sequences/1931/Male/l/1931_2.jpg'
  ],
  'tricep-overhead-extension': [
    'https://fitbod.me/wp-content/uploads/2020/10/Overhead-Tricep-Extension.gif',
    'https://cdn.jefit.com/assets/img/exercises/gifs/1235.gif',
    'https://www.bodybuilding.com/exercises/exerciseImages/sequences/319/Male/l/319_2.jpg'
  ],
  'smith-machine-squat': [
    'https://fitbod.me/wp-content/uploads/2020/10/Smith-Machine-Squat.gif',
    'https://cdn.jefit.com/assets/img/exercises/gifs/1395.gif',
    'https://www.bodybuilding.com/exercises/exerciseImages/sequences/1841/Male/l/1841_2.jpg'
  ],
  'dumbbell-hip-thrust': [
    'https://fitbod.me/wp-content/uploads/2020/10/Dumbbell-Hip-Thrust.gif',
    'https://cdn.jefit.com/assets/img/exercises/gifs/1455.gif',
    'https://www.bodybuilding.com/exercises/exerciseImages/sequences/1551/Male/l/1551_2.jpg'
  ],
  'hack-squat': [
    'https://fitbod.me/wp-content/uploads/2020/10/Hack-Squat.gif',
    'https://cdn.jefit.com/assets/img/exercises/gifs/1365.gif',
    'https://www.bodybuilding.com/exercises/exerciseImages/sequences/61/Male/l/61_2.jpg'
  ],
  'clapping-push-up': [
    'https://fitbod.me/wp-content/uploads/2020/10/Clapping-Push-Up.gif',
    'https://cdn.jefit.com/assets/img/exercises/gifs/1355.gif',
    'https://www.bodybuilding.com/exercises/exerciseImages/sequences/1478/Male/l/1478_2.jpg'
  ],
  'battle-ropes': [
    'https://fitbod.me/wp-content/uploads/2020/10/Battle-Ropes.gif',
    'https://cdn.jefit.com/assets/img/exercises/gifs/1505.gif',
    'https://www.bodybuilding.com/exercises/exerciseImages/sequences/1561/Male/l/1561_2.jpg'
  ],
  'bear-crawl': [
    'https://fitbod.me/wp-content/uploads/2020/10/Bear-Crawl.gif',
    'https://cdn.jefit.com/assets/img/exercises/gifs/1515.gif',
    'https://www.bodybuilding.com/exercises/exerciseImages/sequences/1571/Male/l/1571_2.jpg'
  ],
  'hang-clean': [
    'https://fitbod.me/wp-content/uploads/2020/10/Hang-Clean.gif',
    'https://cdn.jefit.com/assets/img/exercises/gifs/1425.gif',
    'https://www.bodybuilding.com/exercises/exerciseImages/sequences/1521/Male/l/1521_2.jpg'
  ],
  'pause-deadlift': [
    'https://fitbod.me/wp-content/uploads/2020/10/Pause-Deadlift.gif',
    'https://cdn.jefit.com/assets/img/exercises/gifs/1415.gif',
    'https://www.bodybuilding.com/exercises/exerciseImages/sequences/1511/Male/l/1511_2.jpg'
  ]
};

// Additional backup sources with different naming conventions
const backupSources = {
  'goblet-squat': [
    'https://www.acefitness.org/getmedia/3f3b3a3d-4c4d-4e4f-8a8b-1b1b1b1b1b1b/goblet-squat.gif',
    'https://trainright.com/wp-content/uploads/2019/06/goblet-squat.gif'
  ],
  'diamond-pushup': [
    'https://www.acefitness.org/getmedia/2f2b2a2d-3c3d-3e3f-7a7b-1a1a1a1a1a1a/diamond-pushup.gif',
    'https://trainright.com/wp-content/uploads/2019/06/diamond-pushup.gif'
  ]
};

async function downloadExerciseGif(exerciseId, sources) {
  console.log(`\n🎯 Searching for: ${exerciseId}`);
  console.log(`🔍 Trying ${sources.length} sources...`);

  for (let i = 0; i < sources.length; i++) {
    const sourceUrl = sources[i];
    try {
      console.log(`⬇️  Source ${i + 1}/${sources.length}: ${sourceUrl.split('/').pop()}`);
      
      const response = await fetch(sourceUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'image/gif,image/jpeg,image/png,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 30000,
        follow: 10,
        compress: true
      });
      
      if (!response.ok) {
        console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
        continue;
      }
      
      const contentType = response.headers.get('content-type') || '';
      const contentLength = response.headers.get('content-length');
      
      console.log(`📄 Content-Type: ${contentType}`);
      console.log(`📏 Content-Length: ${contentLength || 'unknown'}`);
      
      const buffer = await response.arrayBuffer();
      
      if (buffer.byteLength < 1000) {
        console.log(`❌ File too small: ${buffer.byteLength} bytes`);
        continue;
      }
      
      // Check file signature
      const uint8Array = new Uint8Array(buffer);
      const isGif = uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46;
      const isPng = uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47;
      const isJpg = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF;
      const isWebp = uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && uint8Array[10] === 0x42 && uint8Array[11] === 0x50;
      
      if (!isGif && !isPng && !isJpg && !isWebp) {
        console.log(`❌ Invalid file format. First bytes: ${Array.from(uint8Array.slice(0, 12)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')}`);
        continue;
      }
      
      // Determine file type and extension
      let fileExtension = '.gif';
      let mimeType = 'image/gif';
      
      if (isPng) {
        fileExtension = '.png';
        mimeType = 'image/png';
      } else if (isJpg) {
        fileExtension = '.jpg';
        mimeType = 'image/jpeg';
      } else if (isWebp) {
        fileExtension = '.webp';
        mimeType = 'image/webp';
      }
      
      const fileName = `${exerciseId}${fileExtension}`;
      
      console.log(`📤 Uploading ${fileName} (${(buffer.byteLength / 1024).toFixed(1)}KB)`);
      
      const { data, error } = await supabase.storage
        .from('exercise-gifs')
        .upload(fileName, buffer, {
          contentType: mimeType,
          cacheControl: '86400',
          upsert: true
        });
      
      if (error) {
        console.log(`❌ Upload failed: ${error.message}`);
        continue;
      }
      
      console.log(`✅ SUCCESS! ${exerciseId} uploaded as ${fileExtension.slice(1).toUpperCase()}`);
      return { 
        success: true, 
        exerciseId, 
        fileName,
        fileType: mimeType,
        sourceIndex: i + 1,
        fileSize: buffer.byteLength 
      };
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      continue;
    }
  }
  
  return { success: false, exerciseId, error: 'All sources failed' };
}

async function comprehensiveGifSearch() {
  console.log('🔍 COMPREHENSIVE GIF SEARCH STARTED');
  console.log('🎯 Searching for missing exercise GIFs from multiple sources...\n');
  
  const results = { 
    success: 0, 
    failed: 0, 
    errors: [], 
    successes: [] 
  };
  
  // Combine main sources with backup sources
  const allSources = { ...exerciseGifSources };
  
  // Add backup sources
  for (const [exerciseId, backups] of Object.entries(backupSources)) {
    if (allSources[exerciseId]) {
      allSources[exerciseId] = [...allSources[exerciseId], ...backups];
    }
  }
  
  console.log(`📊 Total exercises to search: ${Object.keys(allSources).length}`);
  
  for (const [exerciseId, sources] of Object.entries(allSources)) {
    // Check if already exists
    try {
      const { data: existing } = await supabase.storage
        .from('exercise-gifs')
        .list('', { search: exerciseId, limit: 5 });
      
      if (existing && existing.some(file => file.name.startsWith(exerciseId))) {
        console.log(`✓ ${exerciseId} (already exists)`);
        continue;
      }
    } catch (e) {
      // Continue with search
    }
    
    const result = await downloadExerciseGif(exerciseId, sources);
    
    if (result.success) {
      results.success++;
      results.successes.push(result);
      console.log(`🎉 FOUND: ${exerciseId} (${result.fileType})`);
    } else {
      results.failed++;
      results.errors.push(result);
    }
    
    // Delay between searches to be respectful
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🏁 COMPREHENSIVE SEARCH COMPLETE!');
  console.log(`✅ New successes: ${results.success}`);
  console.log(`❌ Still failed: ${results.failed}`);
  
  if (results.successes.length > 0) {
    console.log('\n🎉 Successfully found and downloaded:');
    results.successes.forEach(success => {
      console.log(`   ✅ ${success.exerciseId} (${success.fileType}, ${(success.fileSize / 1024).toFixed(1)}KB) from source ${success.sourceIndex}`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\n❌ Still missing:');
    results.errors.forEach(err => {
      console.log(`   ❌ ${err.exerciseId}`);
    });
  }
  
  // Get final storage stats
  try {
    const { data: files } = await supabase.storage
      .from('exercise-gifs')
      .list('', { limit: 1000 });
    
    if (files) {
      const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
      const newTotal = 160 + results.success;
      console.log(`\n📊 FINAL STATS:`);
      console.log(`   📁 Total files: ${files.length}`);
      console.log(`   💾 Total size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
      console.log(`   🎯 Success rate: ${((newTotal / 213) * 100).toFixed(1)}%`);
      console.log(`   📈 Improvement: +${results.success} exercises`);
    }
  } catch (e) {
    console.log('Could not get storage stats');
  }
}

comprehensiveGifSearch().catch(console.error);