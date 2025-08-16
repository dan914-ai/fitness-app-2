// Upload only missing GIFs to Supabase
import('node-fetch').then(async ({ default: fetch }) => {
  global.fetch = fetch;
  
  const SUPABASE_URL = 'https://nwpyliujuimufkfjolsj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHlsaXVqdWltdWZrZmpvbHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjIzNjgsImV4cCI6MjA2OTIzODM2OH0.dWYh2ROhXN6n4scKc-gKMMPUjVXBXD2xv5l-UGqyTZA';
  
  console.log('Checking for missing GIFs...\n');
  
  // Read exercise database
  const fs = await import('fs');
  const dbPath = './src/data/exerciseDatabase.ts';
  const dbContent = fs.readFileSync(dbPath, 'utf-8');
  
  // Extract exercises with GIF URLs
  const exercises = [];
  const exerciseRegex = /\{[\s\S]*?id:\s*['"]([^'"]+)['"][\s\S]*?gifUrl:\s*['"]([^'"]+)['"][\s\S]*?\}/g;
  
  dbContent.replace(exerciseRegex, (fullMatch, id, gifUrl) => {
    if (!fullMatch.includes('gifUnavailable: true')) {
      exercises.push({ id, gifUrl });
    }
    return fullMatch;
  });
  
  console.log(`Found ${exercises.length} exercises with GIF URLs\n`);
  
  // Check which ones are missing
  const missing = [];
  
  for (const exercise of exercises) {
    // Check both naming conventions
    const urls = [
      `${SUPABASE_URL}/storage/v1/object/public/exercise-gifs/${exercise.id}.gif`,
      `${SUPABASE_URL}/storage/v1/object/public/exercise-gifs/${exercise.id.replace(/-/g, '_')}.gif`
    ];
    
    let found = false;
    for (const url of urls) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          found = true;
          break;
        }
      } catch (error) {
        // ignore
      }
    }
    
    if (!found) {
      missing.push(exercise);
    }
  }
  
  console.log(`Missing GIFs: ${missing.length}\n`);
  
  if (missing.length === 0) {
    console.log('All GIFs are already uploaded! 🎉');
    return;
  }
  
  console.log('Starting upload of missing GIFs...\n');
  
  // Upload missing GIFs
  async function uploadGif(exerciseId, gifUrl) {
    try {
      console.log(`Downloading ${exerciseId}...`);
      
      // Download the GIF
      const response = await fetch(gifUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`);
      }
      
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Try uploading with both naming conventions
      const filenames = [
        `${exerciseId}.gif`,
        `${exerciseId.replace(/-/g, '_')}.gif`
      ];
      
      for (const filename of filenames) {
        const uploadUrl = `${SUPABASE_URL}/storage/v1/object/exercise-gifs/${filename}`;
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'image/gif'
          },
          body: buffer
        });
        
        if (uploadResponse.ok) {
          console.log(`✅ ${exerciseId} uploaded as ${filename}`);
          return true;
        }
      }
      
      console.log(`❌ ${exerciseId} upload failed`);
      return false;
      
    } catch (error) {
      console.log(`❌ ${exerciseId} error: ${error.message}`);
      return false;
    }
  }
  
  const BATCH_SIZE = 5;
  const results = { success: 0, failed: 0 };
  
  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);
    console.log(`\nBatch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(missing.length / BATCH_SIZE)}`);
    
    const batchPromises = batch.map(exercise => uploadGif(exercise.id, exercise.gifUrl));
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.success++;
      } else {
        results.failed++;
      }
    });
    
    // Delay between batches
    if (i + BATCH_SIZE < missing.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Upload complete!`);
  console.log(`✅ Success: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`${'='.repeat(50)}`);
  
}).catch(err => {
  console.error('Failed to load dependencies:', err);
});