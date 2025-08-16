#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const exerciseDatabase = require('../src/data/exerciseDatabase.ts').default;

console.log('=== CHECKING WHICH GIFS NEED TO BE UPLOADED TO SUPABASE ===\n');

// Function to check if URL works
function checkUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'HEAD',
      timeout: 5000
    };
    
    const req = https.request(options, (res) => {
      resolve({ url, status: res.statusCode });
    });
    
    req.on('error', () => resolve({ url, status: 0 }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ url, status: 'timeout' });
    });
    
    req.end();
  });
}

async function checkAllUrls() {
  const toUpload = [];
  const working = [];
  const errors = [];
  
  console.log(`Checking ${exerciseDatabase.length} exercises...\n`);
  
  // Check in batches for speed
  const batchSize = 10;
  for (let i = 0; i < exerciseDatabase.length; i += batchSize) {
    const batch = exerciseDatabase.slice(i, Math.min(i + batchSize, exerciseDatabase.length));
    process.stdout.write(`\rChecking: ${Math.min(i + batchSize, exerciseDatabase.length)}/${exerciseDatabase.length}`);
    
    const results = await Promise.all(
      batch.map(ex => checkUrl(ex.imageUrl))
    );
    
    results.forEach((result, idx) => {
      const exercise = batch[idx];
      if (result.status === 200) {
        working.push(exercise);
      } else {
        const urlParts = exercise.imageUrl.split('/');
        const muscleGroup = urlParts[urlParts.length - 2];
        const filename = urlParts[urlParts.length - 1];
        const localPath = path.join(__dirname, '..', 'assets', 'exercise-gifs', muscleGroup, filename);
        
        if (fs.existsSync(localPath)) {
          toUpload.push({
            exercise,
            localPath,
            supabasePath: `${muscleGroup}/${filename}`,
            status: result.status
          });
        } else {
          errors.push({
            exercise,
            reason: 'Local file not found',
            expectedPath: localPath
          });
        }
      }
    });
  }
  
  console.log('\n\n=== RESULTS ===');
  console.log(`✅ Working on Supabase: ${working.length}`);
  console.log(`📤 Need to upload: ${toUpload.length}`);
  console.log(`❌ Errors: ${errors.length}\n`);
  
  if (toUpload.length > 0) {
    console.log('=== FILES TO UPLOAD ===');
    console.log('These local files need to be uploaded to Supabase:\n');
    
    // Group by muscle group
    const byMuscle = {};
    toUpload.forEach(item => {
      const muscle = item.supabasePath.split('/')[0];
      if (!byMuscle[muscle]) byMuscle[muscle] = [];
      byMuscle[muscle].push(item);
    });
    
    Object.entries(byMuscle).forEach(([muscle, items]) => {
      console.log(`\n${muscle.toUpperCase()} (${items.length} files):`);
      items.forEach(item => {
        console.log(`  - ${item.supabasePath} (${item.exercise.name})`);
      });
    });
    
    // Create upload list file
    const uploadList = toUpload.map(item => ({
      id: item.exercise.id,
      name: item.exercise.name,
      englishName: item.exercise.englishName,
      localPath: item.localPath,
      supabasePath: item.supabasePath
    }));
    
    fs.writeFileSync(
      path.join(__dirname, 'to-upload.json'),
      JSON.stringify(uploadList, null, 2)
    );
    
    console.log('\n✅ Upload list saved to: scripts/to-upload.json');
    console.log('\nTo upload these files to Supabase:');
    console.log('1. Go to Supabase dashboard > Storage > exercise-gifs');
    console.log('2. Upload the files listed above to their respective folders');
    console.log('3. Or use the sync-to-supabase.js script with your API key');
  }
  
  if (errors.length > 0) {
    console.log('\n=== ERRORS ===');
    errors.forEach(err => {
      console.log(`❌ ${err.exercise.name}: ${err.reason}`);
    });
  }
}

checkAllUrls().catch(console.error);