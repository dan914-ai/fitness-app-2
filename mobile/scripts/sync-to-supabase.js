#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment or hardcode temporarily
const SUPABASE_URL = 'https://ayttqsgttuvdhvbvbnsk.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE';

if (SUPABASE_KEY === 'YOUR_ANON_KEY_HERE') {
  console.error('ERROR: Please set SUPABASE_ANON_KEY environment variable or update the script');
  console.log('You can find your anon key in the Supabase dashboard under Settings > API');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getAllLocalGifs() {
  const gifsDir = path.join(__dirname, '..', 'assets', 'exercise-gifs');
  const allGifs = [];
  
  const muscleGroups = fs.readdirSync(gifsDir).filter(f => 
    fs.statSync(path.join(gifsDir, f)).isDirectory()
  );
  
  for (const muscleGroup of muscleGroups) {
    const groupDir = path.join(gifsDir, muscleGroup);
    const gifs = fs.readdirSync(groupDir).filter(f => f.endsWith('.gif'));
    
    for (const gif of gifs) {
      allGifs.push({
        muscleGroup,
        filename: gif,
        localPath: path.join(groupDir, gif),
        supabasePath: `${muscleGroup}/${gif}`
      });
    }
  }
  
  return allGifs;
}

async function checkSupabaseFile(filePath) {
  try {
    const { data, error } = await supabase.storage
      .from('exercise-gifs')
      .list(path.dirname(filePath), {
        limit: 1000,
        search: path.basename(filePath)
      });
    
    if (error) throw error;
    return data.some(file => file.name === path.basename(filePath));
  } catch (error) {
    console.error(`Error checking ${filePath}:`, error.message);
    return false;
  }
}

async function uploadToSupabase(localPath, supabasePath) {
  try {
    const fileBuffer = fs.readFileSync(localPath);
    
    // First try to remove if exists (update)
    await supabase.storage
      .from('exercise-gifs')
      .remove([supabasePath]);
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('exercise-gifs')
      .upload(supabasePath, fileBuffer, {
        contentType: 'image/gif',
        upsert: true
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error uploading ${supabasePath}:`, error.message);
    return false;
  }
}

async function syncToSupabase() {
  console.log('=== SYNCING LOCAL GIFS TO SUPABASE ===\n');
  
  const localGifs = await getAllLocalGifs();
  console.log(`Found ${localGifs.length} local GIF files\n`);
  
  const toUpload = [];
  const existing = [];
  
  console.log('Checking which files need to be uploaded...\n');
  
  for (let i = 0; i < localGifs.length; i++) {
    const gif = localGifs[i];
    process.stdout.write(`\rChecking: ${i + 1}/${localGifs.length}`);
    
    const exists = await checkSupabaseFile(gif.supabasePath);
    if (exists) {
      existing.push(gif);
    } else {
      toUpload.push(gif);
    }
  }
  
  console.log('\n\n=== SUMMARY ===');
  console.log(`✅ Already on Supabase: ${existing.length}`);
  console.log(`📤 Need to upload: ${toUpload.length}\n`);
  
  if (toUpload.length === 0) {
    console.log('All files are already synced to Supabase!');
    return;
  }
  
  console.log('Files to upload:');
  toUpload.forEach(gif => {
    console.log(`  - ${gif.supabasePath}`);
  });
  
  console.log('\nStarting upload...\n');
  
  let successCount = 0;
  for (let i = 0; i < toUpload.length; i++) {
    const gif = toUpload[i];
    process.stdout.write(`Uploading ${i + 1}/${toUpload.length}: ${gif.filename}...`);
    
    const success = await uploadToSupabase(gif.localPath, gif.supabasePath);
    if (success) {
      successCount++;
      console.log(' ✅');
    } else {
      console.log(' ❌');
    }
  }
  
  console.log('\n=== UPLOAD COMPLETE ===');
  console.log(`✅ Successfully uploaded: ${successCount}/${toUpload.length}`);
  
  if (successCount < toUpload.length) {
    console.log(`❌ Failed uploads: ${toUpload.length - successCount}`);
  }
}

// Check if we have Supabase package installed
try {
  require('@supabase/supabase-js');
} catch (e) {
  console.log('Installing @supabase/supabase-js...');
  require('child_process').execSync('npm install @supabase/supabase-js', { stdio: 'inherit' });
}

syncToSupabase().catch(console.error);