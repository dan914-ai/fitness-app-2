// Script to upload new exercise GIFs to Supabase with English filenames
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://nwpyliujuimufkfjolsj.supabase.co', 
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHlsaXVqdWltdWZrZmpvbHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjIzNjgsImV4cCI6MjA2OTIzODM2OH0.dWYh2ROhXN6n4scKc-gKMMPUjVXBXD2xv5l-UGqyTZA'
);

const NEW_EXERCISES_PATH = '/mnt/c/Users/PW1234/.vscode/new finess app/new exercises';

const exerciseFiles = [
  { file: '45-degree-extension.gif', folder: 'abdominals' },
  { file: 'ab-roller.gif', folder: 'abdominals' },
  { file: 'decline-sit-up.gif', folder: 'abdominals' },
  { file: 'leg-raise.gif', folder: 'abdominals' },
  { file: 'mountain-climber.gif', folder: 'abdominals' },
  { file: 'machine-crunch.gif', folder: 'abdominals' },
  { file: 'bicycle-crunch.gif', folder: 'abdominals' },
  { file: 'side-plank.gif', folder: 'abdominals' },
  { file: 'sit-up.gif', folder: 'abdominals' },
  { file: 'weighted-russian-twist.gif', folder: 'abdominals' },
  { file: 'weighted-cable-crunch.gif', folder: 'abdominals' },
  { file: 'weighted-plank.gif', folder: 'abdominals' },
  { file: 'captains-chair-knee-raise.gif', folder: 'abdominals' },
  { file: 'crunch.gif', folder: 'abdominals' },
  { file: 'cross-body-crunch.gif', folder: 'abdominals' },
  { file: 'toes-to-bar.gif', folder: 'abdominals' },
  { file: 'push-up.gif', folder: 'pectorals' },
  { file: 'plank.gif', folder: 'abdominals' },
  { file: 'flutter-kick.gif', folder: 'abdominals' },
  { file: 'hanging-leg-raise.gif', folder: 'abdominals' }
];

async function uploadNewExercises() {
  console.log('🚀 Uploading new exercise GIFs to Supabase...\n');
  
  let uploaded = 0;
  let failed = 0;
  
  for (const { file, folder } of exerciseFiles) {
    const filePath = path.join(NEW_EXERCISES_PATH, file);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      failed++;
      continue;
    }
    
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const storagePath = `${folder}/${file}`;
      
      console.log(`Uploading ${file} to ${storagePath}...`);
      
      const { data, error } = await supabase.storage
        .from('exercise-gifs')
        .upload(storagePath, fileBuffer, {
          contentType: 'image/gif',
          upsert: true // Overwrite if exists
        });
      
      if (error) {
        console.log(`❌ Failed to upload ${file}:`, error.message);
        failed++;
      } else {
        console.log(`✅ Successfully uploaded ${file}`);
        uploaded++;
      }
    } catch (err) {
      console.log(`❌ Error with ${file}:`, err.message);
      failed++;
    }
  }
  
  console.log(`\n🎉 Upload completed! ✅ ${uploaded} successful, ❌ ${failed} failed`);
}

uploadNewExercises();