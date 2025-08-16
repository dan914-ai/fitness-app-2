import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Reliable exercise GIF sources from established fitness platforms
const reliableGifSources = {
  'goblet-squat': [
    'https://musclewiki.com/media/uploads/male/Bodyweight/Goblet%20squat.gif',
    'https://www.jefit.com/images/exercises/800_600/5671.jpg', // Static image as fallback
    'https://gymvisual.com/img/p/1/6/8/0/1680.gif'
  ],
  'leg-extension': [
    'https://musclewiki.com/media/uploads/male/Machine/leg%20extension.gif',
    'https://gymvisual.com/img/p/2/2/5/4/2254.gif'
  ],
  'seated-calf-raise': [
    'https://musclewiki.com/media/uploads/male/Machine/Seated%20calf%20raise.gif',
    'https://gymvisual.com/img/p/1/7/5/1/1751.gif'
  ],
  'diamond-pushup': [
    'https://musclewiki.com/media/uploads/male/Bodyweight/diamond%20pushups.gif',
    'https://gymvisual.com/img/p/2/0/4/6/2046.gif'
  ],
  'concentration-curl': [
    'https://musclewiki.com/media/uploads/male/Dumbbell/concentration%20curl.gif',
    'https://gymvisual.com/img/p/1/6/1/2/1612.gif'
  ],
  't-bar-row': [
    'https://musclewiki.com/media/uploads/male/Barbell/t%20bar%20row.gif',
    'https://gymvisual.com/img/p/2/2/0/8/2208.gif'
  ],
  'battle-ropes': [
    'https://musclewiki.com/media/uploads/male/Cable/battle%20ropes.gif',
    'https://gymvisual.com/img/p/5/1/6/516.gif'
  ],
  'bear-crawl': [
    'https://musclewiki.com/media/uploads/male/Bodyweight/bear%20crawl.gif',
    'https://gymvisual.com/img/p/4/8/9/489.gif'
  ],
  'clapping-push-up': [
    'https://musclewiki.com/media/uploads/male/Bodyweight/clapping%20pushups.gif',
    'https://gymvisual.com/img/p/2/0/4/8/2048.gif'
  ],
  'hack-squat': [
    'https://musclewiki.com/media/uploads/male/Machine/hack%20squat.gif',
    'https://gymvisual.com/img/p/1/7/3/8/1738.gif'
  ],
  'tricep-overhead-extension': [
    'https://musclewiki.com/media/uploads/male/Dumbbell/overhead%20tricep%20extension.gif',
    'https://gymvisual.com/img/p/1/5/7/6/1576.gif'
  ],
  'smith-machine-squat': [
    'https://musclewiki.com/media/uploads/male/Machine/smith%20machine%20squat.gif',
    'https://gymvisual.com/img/p/2/2/7/6/2276.gif'
  ],
  'dumbbell-hip-thrust': [
    'https://musclewiki.com/media/uploads/female/Dumbbell/hip%20thrust.gif',
    'https://gymvisual.com/img/p/1/7/1/8/1718.gif'
  ],
  'hang-clean': [
    'https://musclewiki.com/media/uploads/male/Barbell/hang%20clean.gif',
    'https://gymvisual.com/img/p/1/7/0/1/1701.gif'
  ],
  'pause-deadlift': [
    'https://musclewiki.com/media/uploads/male/Barbell/deadlift.gif', // Regular deadlift as close alternative
    'https://gymvisual.com/img/p/2/1/5/6/2156.gif'
  ]
};

async function downloadFromReliableSource(exerciseId, sources) {
  for (let i = 0; i < sources.length; i++) {
    const sourceUrl = sources[i];
    try {
      console.log(`⬇️  ${exerciseId} from reliable source ${i + 1}/${sources.length}`);
      console.log(`🔗 URL: ${sourceUrl}`);
      
      const response = await fetch(sourceUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/gif,image/*,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://musclewiki.com/',
          'Origin': 'https://musclewiki.com',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Dest': 'image'
        },
        timeout: 45000,
        follow: 5
      });
      
      if (!response.ok) {
        console.log(`❌ Source ${i + 1}: HTTP ${response.status} - ${response.statusText}`);
        continue;
      }
      
      const buffer = await response.arrayBuffer();
      
      if (buffer.byteLength < 500) {
        console.log(`❌ Source ${i + 1}: File too small (${buffer.byteLength} bytes)`);
        continue;
      }
      
      // Check content type
      const contentType = response.headers.get('content-type');
      console.log(`📄 Content-Type: ${contentType}`);
      
      // Validate it's an image
      const uint8Array = new Uint8Array(buffer);
      const isGif = uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46;
      const isPng = uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47;
      const isJpg = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF;
      
      if (!isGif && !isPng && !isJpg) {
        console.log(`❌ Source ${i + 1}: Not a valid image file`);
        console.log(`🔍 First bytes: ${Array.from(uint8Array.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}`);
        continue;
      }
      
      let fileName = `${exerciseId}.gif`;
      let uploadContentType = 'image/gif';
      
      // If it's not a GIF, keep original format but note it
      if (isPng) {
        fileName = `${exerciseId}.png`;
        uploadContentType = 'image/png';
        console.log(`📝 Note: Using PNG instead of GIF for ${exerciseId}`);
      } else if (isJpg) {
        fileName = `${exerciseId}.jpg`;
        uploadContentType = 'image/jpeg';
        console.log(`📝 Note: Using JPG instead of GIF for ${exerciseId}`);
      }
      
      console.log(`📤 Uploading ${exerciseId} (${(buffer.byteLength / 1024).toFixed(1)}KB) as ${uploadContentType}`);
      
      const { data, error } = await supabase.storage
        .from('exercise-gifs')
        .upload(fileName, buffer, {
          contentType: uploadContentType,
          cacheControl: '86400',
          upsert: true
        });
      
      if (error) {
        console.log(`❌ Upload failed: ${error.message}`);
        continue;
      }
      
      console.log(`✅ ${exerciseId} - SUCCESS from reliable source ${i + 1}!`);
      return { success: true, exerciseId, sourceUsed: i + 1, fileType: uploadContentType };
      
    } catch (error) {
      console.log(`❌ Source ${i + 1}: ${error.message}`);
      continue;
    }
  }
  
  return { success: false, exerciseId, error: 'All reliable sources failed' };
}

async function downloadReliableGifs() {
  console.log('💪 Downloading from reliable fitness databases...');
  console.log(`🎯 Found ${Object.keys(reliableGifSources).length} exercises with reliable sources`);
  
  const results = { success: 0, failed: 0, errors: [], successDetails: [] };
  
  for (const [exerciseId, sources] of Object.entries(reliableGifSources)) {
    console.log(`\n📦 Processing: ${exerciseId}`);
    
    // Check if already exists
    try {
      const { data: existing } = await supabase.storage
        .from('exercise-gifs')
        .list('', { search: exerciseId, limit: 5 });
      
      if (existing && existing.length > 0) {
        console.log(`✓ ${exerciseId} (already exists)`);
        continue;
      }
    } catch (e) {
      // Continue with download
    }
    
    const result = await downloadFromReliableSource(exerciseId, sources);
    
    if (result.success) {
      results.success++;
      results.successDetails.push(result);
    } else {
      results.failed++;
      results.errors.push(result);
    }
    
    // Delay between downloads
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n🏁 Reliable source download complete!');
  console.log(`✅ New successes: ${results.success}`);
  console.log(`❌ Still failed: ${results.failed}`);
  
  if (results.successDetails.length > 0) {
    console.log('\n✅ Successfully downloaded:');
    results.successDetails.forEach(success => {
      console.log(`   - ${success.exerciseId} (${success.fileType}) from source ${success.sourceUsed}`);
    });
  }
  
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

downloadReliableGifs().catch(console.error);