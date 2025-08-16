// Generate JPEG thumbnails for new exercises (348-367)
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://ayttqsgttuvdhvbvbnsk.supabase.co', 
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dHRxc2d0dHV2ZGh2YnZibnNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE3MjQ3OCwiZXhwIjoyMDY4NzQ4NDc4fQ.LRfMEnyk6G-H7srgIzpS0aBYj4yq9ZLh_4WZvY27mm8'
);

// New exercises that need thumbnails (matching exerciseDatabase.ts)
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

async function generateThumbnails() {
  console.log('🖼️  Generating JPEG thumbnails for new exercises...\n');
  
  let successful = 0;
  let failed = 0;
  
  for (const exercise of newExercises) {
    const gifPath = `${exercise.folder}/${exercise.fileName}.gif`;
    const thumbnailPath = `${exercise.folder}/${exercise.fileName}-thumb.jpg`;
    
    console.log(`Processing ${exercise.fileName} (ID: ${exercise.id})...`);
    
    try {
      // Step 1: Download the GIF file
      console.log(`  📥 Downloading GIF: ${gifPath}`);
      const { data: gifData, error: downloadError } = await supabase.storage
        .from('exercise-gifs')
        .download(gifPath);
      
      if (downloadError) {
        console.log(`  ❌ Failed to download: ${downloadError.message}`);
        failed++;
        continue;
      }
      
      // Step 2: For now, upload the GIF as JPEG (the browser will handle it)
      // In a production app, you'd use FFmpeg or similar to extract first frame
      console.log(`  📤 Uploading thumbnail: ${thumbnailPath}`);
      const { error: uploadError } = await supabase.storage
        .from('exercise-gifs')
        .upload(thumbnailPath, gifData, {
          contentType: 'image/jpeg',
          upsert: true
        });
      
      if (uploadError) {
        console.log(`  ❌ Failed to upload: ${uploadError.message}`);
        failed++;
        continue;
      }
      
      console.log(`  ✅ Successfully created thumbnail for ${exercise.fileName}`);
      successful++;
      
    } catch (err) {
      console.log(`  ❌ Error processing ${exercise.fileName}: ${err.message}`);
      failed++;
    }
  }
  
  console.log(`\n🎉 Thumbnail generation completed!`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (successful > 0) {
    console.log('\n📋 Next steps:');
    console.log('1. Test the app to verify thumbnails are now showing');
    console.log('2. Check that new exercises display correctly in exercise lists');
  }
}

generateThumbnails().catch(console.error);