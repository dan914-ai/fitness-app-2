// Generate JPEG thumbnails for new exercises (348-367)
// Downloads from old project, uploads to new project
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log('🖼️  Generating JPEG thumbnails for new exercises (cross-project)...\n');

// Old project (where GIFs are stored)
const sourceSupabase = createClient(
  'https://nwpyliujuimufkfjolsj.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHlsaXVqdWltdWZrZmpvbHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjIzNjgsImV4cCI6MjA2OTIzODM2OH0.dWYh2ROhXN6n4scKc-gKMMPUjVXBXD2xv5l-UGqyTZA'
);

// New project (where thumbnails should be uploaded)
const targetSupabase = createClient(
  'https://ayttqsgttuvdhvbvbnsk.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dHRxc2d0dHV2ZGh2YnZibnNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE3MjQ3OCwiZXhwIjoyMDY4NzQ4NDc4fQ.LRfMEnyk6G-H7srgIzpS0aBYj4yq9ZLh_4WZvY27mm8'
);

// Test the new project first
async function testNewProject() {
  console.log('🔧 Testing access to new Supabase project...');
  
  try {
    const { data, error } = await targetSupabase.storage
      .from('exercise-gifs')
      .list('abdominals', { limit: 5 });
    
    if (error) {
      console.log('❌ Cannot access new project exercise-gifs bucket:', error.message);
      return false;
    } else {
      console.log('✅ New project access successful');
      console.log(`   Found ${data.length} files in abdominals folder`);
      return true;
    }
  } catch (err) {
    console.log('❌ New project connection failed:', err.message);
    return false;
  }
}

// New exercises that need thumbnails (all 20)
const newExercises = [
  { id: 348, fileName: '45-degree-extension', folder: 'abdominals' },
  { id: 349, fileName: 'ab-roller', folder: 'abdominals' },
  { id: 350, fileName: 'decline-sit-up', folder: 'abdominals' },
  { id: 351, fileName: 'leg-raise', folder: 'abdominals' },
  { id: 352, fileName: 'mountain-climber', folder: 'abdominals' },
  { id: 353, fileName: 'machine-crunch', folder: 'abdominals' },
  { id: 354, fileName: 'bicycle-crunch', folder: 'abdominals' },
  { id: 355, fileName: 'side-plank', folder: 'abdominals' },
  { id: 356, fileName: 'sit-up', folder: 'abdominals' },
  { id: 357, fileName: 'weighted-russian-twist', folder: 'abdominals' },
  { id: 358, fileName: 'weighted-cable-crunch', folder: 'abdominals' },
  { id: 359, fileName: 'weighted-plank', folder: 'abdominals' },
  { id: 360, fileName: 'captains-chair-knee-raise', folder: 'abdominals' },
  { id: 361, fileName: 'crunch', folder: 'abdominals' },
  { id: 362, fileName: 'cross-body-crunch', folder: 'abdominals' },
  { id: 363, fileName: 'toes-to-bar', folder: 'abdominals' },
  { id: 364, fileName: 'push-up', folder: 'pectorals' },
  { id: 365, fileName: 'plank', folder: 'abdominals' },
  { id: 366, fileName: 'flutter-kick', folder: 'abdominals' },
  { id: 367, fileName: 'hanging-leg-raise', folder: 'abdominals' }
];

async function generateCrossPlatformThumbnails() {
  // Test new project access first
  const hasAccess = await testNewProject();
  if (!hasAccess) {
    console.log('\n❌ Cannot proceed - no access to target project');
    return;
  }
  
  console.log('\n📋 Processing all 20 new exercises...\n');
  
  let successful = 0;
  let failed = 0;
  
  for (const exercise of newExercises) {
    const gifPath = `${exercise.folder}/${exercise.fileName}.gif`;
    const thumbnailPath = `${exercise.folder}/${exercise.fileName}-thumb.jpg`;
    
    console.log(`Processing ${exercise.fileName} (ID: ${exercise.id})...`);
    
    try {
      // Step 1: Download from old project
      console.log(`  📥 Downloading from old project: ${gifPath}`);
      const { data: gifData, error: downloadError } = await sourceSupabase.storage
        .from('exercise-gifs')
        .download(gifPath);
      
      if (downloadError) {
        console.log(`  ❌ Download failed: ${downloadError.message}`);
        failed++;
        continue;
      }
      
      // Step 2: Upload to new project
      console.log(`  📤 Uploading to new project: ${thumbnailPath}`);
      const { error: uploadError } = await targetSupabase.storage
        .from('exercise-gifs')
        .upload(thumbnailPath, gifData, {
          contentType: 'image/jpeg',
          upsert: true
        });
      
      if (uploadError) {
        console.log(`  ❌ Upload failed: ${uploadError.message}`);
        failed++;
        continue;
      }
      
      console.log(`  ✅ Successfully created thumbnail`);
      successful++;
      
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
      failed++;
    }
    
    console.log('');
  }
  
  console.log(`🎉 Cross-project thumbnail generation completed!`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
}

generateCrossPlatformThumbnails().catch(console.error);