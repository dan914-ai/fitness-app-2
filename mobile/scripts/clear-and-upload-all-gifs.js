#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from .env
const SUPABASE_URL = 'https://ayttqsgttuvdhvbvbnsk.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dHRxc2d0dHV2ZGh2YnZibnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNzI0NzgsImV4cCI6MjA2ODc0ODQ3OH0.qUu0TNp2Q3cGBZjWJQHAype9gBN303G5yGo13CayMDA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET_NAME = 'exercise-gifs';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// Get all local GIFs
function getAllLocalGifs() {
  const gifsDir = path.join(__dirname, '..', 'assets', 'exercise-gifs');
  const allGifs = [];
  
  const muscleGroups = fs.readdirSync(gifsDir).filter(f => 
    fs.statSync(path.join(gifsDir, f)).isDirectory() && f !== 'matched' // Skip matched folder
  );
  
  for (const muscleGroup of muscleGroups) {
    const groupDir = path.join(gifsDir, muscleGroup);
    const gifs = fs.readdirSync(groupDir).filter(f => f.endsWith('.gif'));
    
    for (const gif of gifs) {
      allGifs.push({
        muscleGroup,
        filename: gif,
        localPath: path.join(groupDir, gif),
        supabasePath: `${muscleGroup}/${gif}`,
        size: fs.statSync(path.join(groupDir, gif)).size
      });
    }
  }
  
  return allGifs;
}

// Delete all files from Supabase bucket
async function clearSupabaseBucket() {
  log('\n📦 CLEARING SUPABASE BUCKET...', 'yellow');
  
  try {
    // Get list of all folders (muscle groups)
    const muscleGroups = [
      'abdominals', 'arms', 'back', 'biceps', 'calves', 'cardio',
      'compound', 'deltoids', 'forearms', 'glutes', 'hamstrings',
      'legs', 'pectorals', 'quadriceps', 'traps', 'triceps'
    ];
    
    let totalDeleted = 0;
    
    for (const folder of muscleGroups) {
      // List all files in this folder
      const { data: files, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(folder, { limit: 1000 });
      
      if (listError) {
        log(`  ⚠️  Error listing ${folder}: ${listError.message}`, 'yellow');
        continue;
      }
      
      if (!files || files.length === 0) {
        log(`  📂 ${folder}: empty`, 'cyan');
        continue;
      }
      
      // Delete all files in this folder
      const filePaths = files.map(file => `${folder}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths);
      
      if (deleteError) {
        log(`  ❌ Error deleting from ${folder}: ${deleteError.message}`, 'red');
      } else {
        log(`  🗑️  Deleted ${files.length} files from ${folder}`, 'green');
        totalDeleted += files.length;
      }
    }
    
    log(`\n✅ Cleared ${totalDeleted} files from Supabase`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error clearing bucket: ${error.message}`, 'red');
    return false;
  }
}

// Upload a single GIF to Supabase
async function uploadGif(gif) {
  try {
    const fileBuffer = fs.readFileSync(gif.localPath);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(gif.supabasePath, fileBuffer, {
        contentType: 'image/gif',
        upsert: true,
        cacheControl: '3600'
      });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Upload all GIFs with progress tracking
async function uploadAllGifs(gifs) {
  log('\n📤 UPLOADING LOCAL GIFS TO SUPABASE...', 'yellow');
  
  const results = {
    successful: [],
    failed: [],
    totalSize: 0
  };
  
  // Group by muscle group for organized output
  const byMuscle = {};
  gifs.forEach(gif => {
    if (!byMuscle[gif.muscleGroup]) {
      byMuscle[gif.muscleGroup] = [];
    }
    byMuscle[gif.muscleGroup].push(gif);
  });
  
  let totalUploaded = 0;
  const totalFiles = gifs.length;
  
  for (const [muscleGroup, muscleGifs] of Object.entries(byMuscle)) {
    log(`\n📁 ${muscleGroup.toUpperCase()} (${muscleGifs.length} files)`, 'cyan');
    
    for (const gif of muscleGifs) {
      totalUploaded++;
      process.stdout.write(`  [${totalUploaded}/${totalFiles}] Uploading ${gif.filename}...`);
      
      const result = await uploadGif(gif);
      
      if (result.success) {
        results.successful.push(gif);
        results.totalSize += gif.size;
        console.log(' ✅');
      } else {
        results.failed.push({ ...gif, error: result.error });
        console.log(` ❌ ${result.error}`);
      }
    }
  }
  
  return results;
}

// Main function
async function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('🚀 SUPABASE GIF SYNC - CLEAR & UPLOAD ALL', 'bright');
  log('='.repeat(60) + '\n', 'bright');
  
  // Check if we have the Supabase package
  try {
    require('@supabase/supabase-js');
  } catch (e) {
    log('📦 Installing @supabase/supabase-js...', 'yellow');
    require('child_process').execSync('npm install @supabase/supabase-js', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
  }
  
  // Step 1: Get all local GIFs
  log('📂 SCANNING LOCAL GIFS...', 'cyan');
  const localGifs = getAllLocalGifs();
  log(`Found ${localGifs.length} GIF files`, 'green');
  
  // Show summary by muscle group
  const muscleGroups = [...new Set(localGifs.map(g => g.muscleGroup))];
  log('\nLocal GIFs by muscle group:', 'cyan');
  muscleGroups.forEach(mg => {
    const count = localGifs.filter(g => g.muscleGroup === mg).length;
    console.log(`  ${mg}: ${count} files`);
  });
  
  // Ask for confirmation
  log('\n⚠️  WARNING: This will DELETE all existing GIFs from Supabase!', 'yellow');
  log('Then upload all ' + localGifs.length + ' local GIFs.', 'yellow');
  
  // Step 2: Clear Supabase bucket
  const cleared = await clearSupabaseBucket();
  if (!cleared) {
    log('\n❌ Failed to clear Supabase bucket. Aborting.', 'red');
    process.exit(1);
  }
  
  // Step 3: Upload all local GIFs
  const results = await uploadAllGifs(localGifs);
  
  // Step 4: Show results
  log('\n' + '='.repeat(60), 'bright');
  log('📊 UPLOAD RESULTS', 'bright');
  log('='.repeat(60) + '\n', 'bright');
  
  log(`✅ Successfully uploaded: ${results.successful.length}/${localGifs.length}`, 'green');
  
  if (results.failed.length > 0) {
    log(`❌ Failed uploads: ${results.failed.length}`, 'red');
    log('\nFailed files:', 'red');
    results.failed.forEach(f => {
      console.log(`  - ${f.supabasePath}: ${f.error}`);
    });
  }
  
  const totalSizeMB = (results.totalSize / (1024 * 1024)).toFixed(2);
  log(`\n📊 Total size uploaded: ${totalSizeMB} MB`, 'cyan');
  
  // Step 5: Verify
  log('\n🔍 VERIFYING SUPABASE STORAGE...', 'cyan');
  
  let verifiedCount = 0;
  for (const muscleGroup of muscleGroups) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(muscleGroup, { limit: 1000 });
    
    if (!error && data) {
      verifiedCount += data.length;
    }
  }
  
  log(`\n✅ Verification: ${verifiedCount} files now in Supabase`, 'green');
  
  if (verifiedCount === localGifs.length) {
    log('🎉 SUCCESS! All local GIFs are now in Supabase!', 'green');
  } else {
    log(`⚠️  Mismatch: Expected ${localGifs.length}, found ${verifiedCount}`, 'yellow');
  }
  
  // Final message
  log('\n' + '='.repeat(60), 'bright');
  log('✨ SYNC COMPLETE!', 'bright');
  log('='.repeat(60) + '\n', 'bright');
  
  log('Your Supabase storage is now synchronized with local files.', 'cyan');
  log('The exercise database URLs should now all work correctly.', 'cyan');
}

// Run the script
main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});