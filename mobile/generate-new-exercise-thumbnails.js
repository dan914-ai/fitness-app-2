// Generate thumbnails for new exercises
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://nwpyliujuimufkfjolsj.supabase.co', 
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHlsaXVqdWltdWZrZmpvbHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjIzNjgsImV4cCI6MjA2OTIzODM2OH0.dWYh2ROhXN6n4scKc-gKMMPUjVXBXD2xv5l-UGqyTZA'
);

// New exercises that need thumbnails
const newExercises = [
  { id: 348, fileName: '45-degree-extension' },
  { id: 349, fileName: 'ab-roller' },
  { id: 350, fileName: 'decline-sit-up' },
  { id: 351, fileName: 'leg-raise' },
  { id: 352, fileName: 'mountain-climber' },
  { id: 353, fileName: 'machine-crunch' },
  { id: 354, fileName: 'bicycle-crunch' },
  { id: 355, fileName: 'side-plank' },
  { id: 356, fileName: 'sit-up' },
  { id: 357, fileName: 'weighted-russian-twist' },
  { id: 358, fileName: 'weighted-cable-crunch' },
  { id: 359, fileName: 'weighted-plank' },
  { id: 360, fileName: 'captains-chair-knee-raise' },
  { id: 361, fileName: 'crunch' },
  { id: 362, fileName: 'cross-body-crunch' },
  { id: 363, fileName: 'toes-to-bar' },
  { id: 364, fileName: 'push-up' },
  { id: 365, fileName: 'plank' },
  { id: 366, fileName: 'flutter-kick' },
  { id: 367, fileName: 'hanging-leg-raise' }
];

async function generateThumbnails() {
  console.log('📸 Generating thumbnails for new exercises...\n');
  
  // For now, we'll copy the same GIF as thumbnail
  // In production, you'd want to generate actual JPEG thumbnails
  for (const exercise of newExercises) {
    const folder = exercise.id === 364 ? 'pectorals' : 'abdominals'; // push-up goes to pectorals
    const sourcePath = `${folder}/${exercise.fileName}.gif`;
    const thumbnailPath = `thumbnails/${exercise.id}.jpg`;
    
    console.log(`Creating thumbnail for ${exercise.fileName} (ID: ${exercise.id})...`);
    
    try {
      // Download the GIF
      const { data: gifData, error: downloadError } = await supabase.storage
        .from('exercise-gifs')
        .download(sourcePath);
      
      if (downloadError) {
        console.log(`❌ Failed to download ${sourcePath}: ${downloadError.message}`);
        continue;
      }
      
      // For now, upload the same content as thumbnail
      // In a real app, you'd convert to JPEG first frame
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('exercise-thumbnails')
        .upload(thumbnailPath, gifData, {
          contentType: 'image/jpeg',
          upsert: true
        });
      
      if (uploadError) {
        console.log(`❌ Failed to upload thumbnail ${thumbnailPath}: ${uploadError.message}`);
      } else {
        console.log(`✅ Generated thumbnail for ${exercise.fileName}`);
      }
      
    } catch (err) {
      console.log(`❌ Error with ${exercise.fileName}: ${err.message}`);
    }
  }
  
  console.log('\n📸 Thumbnail generation completed!');
}

generateThumbnails();