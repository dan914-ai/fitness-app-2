#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ayttqsgttuvdhvbvbnsk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dHRxc2d0dHV2ZGh2YnZibnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNzI0NzgsImV4cCI6MjA2ODc0ODQ3OH0.qUu0TNp2Q3cGBZjWJQHAype9gBN303G5yGo13CayMDA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET_NAME = 'exercise-gifs';

// Missing files identified
const missingFiles = [
  // Compressed quadriceps files
  'quadriceps/300_smith-machine-squat-2.gif',
  'quadriceps/smith-machine-squat-2.gif',
  // Triceps files
  'triceps/cable-rope-tricep-extension.gif',
  'triceps/cable-single-arm-reverse-grip-tricep-pushdown.gif',
  'triceps/cable-tricep-kickback.gif',
  'triceps/cable-v-bar-tricep-pushdown.gif',
  'triceps/close-grip-bench-press.gif',
  'triceps/cobra-push-up.gif',
  'triceps/dive-bomber-push-ups.gif',
  'triceps/dumbbell-tricep-extension-2.gif',
  'triceps/dumbbell-tricep-extension.gif',
  'triceps/dumbbell-tricep-kickback-2.gif',
  'triceps/dumbbell-tricep-kickback.gif',
  'triceps/kneeling-cable-overhead-tricep-extension.gif',
  'triceps/machine-tricep-extension-2.gif',
  'triceps/machine-tricep-extension.gif',
  'triceps/overhead-tricep-stretch.gif',
  'triceps/single-arm-cable-tricep-extension.gif',
  'triceps/single-arm-dumbbell-tricep-extension.gif',
  'triceps/triceps-pushdown.gif',
  'triceps/underhand-tricep-pushdown.gif'
];

async function uploadFile(filePath) {
  const fullPath = path.join(__dirname, '..', 'assets', 'exercise-gifs', filePath);
  
  if (!fs.existsSync(fullPath)) {
    return { success: false, error: 'File not found' };
  }
  
  try {
    const fileBuffer = fs.readFileSync(fullPath);
    const fileSize = fs.statSync(fullPath).size;
    const sizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    
    // Check if file is too large
    if (fileSize > 10 * 1024 * 1024) {
      return { success: false, error: `File too large: ${sizeMB}MB (max 10MB)` };
    }
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: 'image/gif',
        upsert: true,
        cacheControl: '3600'
      });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, size: sizeMB };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function uploadMissingFiles() {
  console.log('=== UPLOADING MISSING FILES TO SUPABASE ===\n');
  
  const results = {
    successful: [],
    failed: []
  };
  
  for (let i = 0; i < missingFiles.length; i++) {
    const file = missingFiles[i];
    process.stdout.write(`[${i + 1}/${missingFiles.length}] Uploading ${file}...`);
    
    const result = await uploadFile(file);
    
    if (result.success) {
      console.log(` ✅ (${result.size}MB)`);
      results.successful.push(file);
    } else {
      console.log(` ❌ ${result.error}`);
      results.failed.push({ file, error: result.error });
    }
    
    // Small delay between uploads to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n=== RESULTS ===');
  console.log(`✅ Successfully uploaded: ${results.successful.length}/${missingFiles.length}`);
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Failed uploads: ${results.failed.length}`);
    results.failed.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }
  
  // Verify final count
  console.log('\n=== VERIFYING FINAL STATUS ===');
  
  const muscleGroups = ['quadriceps', 'triceps'];
  let totalInSupabase = 0;
  
  for (const muscle of muscleGroups) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(muscle, { limit: 1000 });
    
    if (!error && data) {
      console.log(`  ${muscle}: ${data.length} files`);
      totalInSupabase += data.length;
    }
  }
  
  console.log('\n✅ Upload complete!');
  
  if (results.successful.length === missingFiles.length) {
    console.log('🎉 All missing files have been uploaded successfully!');
  }
}

uploadMissingFiles().catch(console.error);