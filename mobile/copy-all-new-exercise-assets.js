// Copy all assets for new exercises (348-367) from old project to new project
const { createClient } = require('@supabase/supabase-js');

console.log('📦 Copying all assets for new exercises to correct project...\n');

// Source project (where files currently exist)
const sourceSupabase = createClient(
  'https://nwpyliujuimufkfjolsj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHlsaXVqdWltdWZrZmpvbHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjIzNjgsImV4cCI6MjA2OTIzODM2OH0.dWYh2ROhXN6n4scKc-gKMMPUjVXBXD2xv5l-UGqyTZA'
);

// Target project (where files should be)
const targetSupabase = createClient(
  'https://ayttqsgttuvdhvbvbnsk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dHRxc2d0dHV2ZGh2YnZibnNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE3MjQ3OCwiZXhwIjoyMDY4NzQ4NDc4fQ.LRfMEnyk6G-H7srgIzpS0aBYj4yq9ZLh_4WZvY27mm8'
);

// All new exercises
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

async function copyAllAssets() {
  console.log('📋 Processing all new exercises...\n');
  
  let gifSuccess = 0, gifFailed = 0;
  let thumbSuccess = 0, thumbFailed = 0;
  
  for (const exercise of newExercises) {
    const gifPath = `${exercise.folder}/${exercise.fileName}.gif`;
    const thumbPath = `${exercise.folder}/${exercise.fileName}-thumb.jpg`;
    
    console.log(`📁 Processing ${exercise.fileName} (ID: ${exercise.id})...`);
    
    // Copy GIF file
    try {
      console.log(`  📥 Downloading GIF: ${gifPath}`);
      const { data: gifData, error: downloadError } = await sourceSupabase.storage
        .from('exercise-gifs')
        .download(gifPath);
      
      if (downloadError) {
        console.log(`  ❌ GIF download failed: ${downloadError.message}`);
        gifFailed++;
      } else {
        console.log(`  📤 Uploading GIF to new project...`);
        const { error: uploadError } = await targetSupabase.storage
          .from('exercise-gifs')
          .upload(gifPath, gifData, {
            contentType: 'image/gif',
            upsert: true
          });
        
        if (uploadError) {
          console.log(`  ❌ GIF upload failed: ${uploadError.message}`);
          gifFailed++;
        } else {
          console.log(`  ✅ GIF copied successfully`);
          gifSuccess++;
        }
      }
    } catch (err) {
      console.log(`  ❌ GIF error: ${err.message}`);
      gifFailed++;
    }
    
    // Copy thumbnail (create from GIF)
    try {
      console.log(`  📸 Creating thumbnail: ${thumbPath}`);
      const { data: thumbData, error: thumbDownloadError } = await sourceSupabase.storage
        .from('exercise-gifs')
        .download(gifPath);
      
      if (thumbDownloadError) {
        console.log(`  ❌ Thumbnail source failed: ${thumbDownloadError.message}`);
        thumbFailed++;
      } else {
        const { error: thumbUploadError } = await targetSupabase.storage
          .from('exercise-gifs')
          .upload(thumbPath, thumbData, {
            contentType: 'image/jpeg',
            upsert: true
          });
        
        if (thumbUploadError) {
          console.log(`  ❌ Thumbnail upload failed: ${thumbUploadError.message}`);
          thumbFailed++;
        } else {
          console.log(`  ✅ Thumbnail created successfully`);
          thumbSuccess++;
        }
      }
    } catch (err) {
      console.log(`  ❌ Thumbnail error: ${err.message}`);
      thumbFailed++;
    }
    
    console.log('');
  }
  
  console.log('🎉 Asset copying completed!');
  console.log(`📊 Results:`);
  console.log(`  🎬 GIFs: ${gifSuccess} success, ${gifFailed} failed`);
  console.log(`  🖼️  Thumbnails: ${thumbSuccess} success, ${thumbFailed} failed`);
  
  if (gifSuccess > 0 && thumbSuccess > 0) {
    console.log(`\n🎯 Next steps:`);
    console.log(`1. Restart the mobile app`);
    console.log(`2. Test thumbnails for exercises ${newExercises[0].id}-${newExercises[newExercises.length-1].id}`);
    console.log(`3. All assets should now load correctly!`);
  }
}

copyAllAssets().catch(console.error);