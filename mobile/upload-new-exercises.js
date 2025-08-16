// Script to upload new exercise GIFs to Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://nwpyliujuimufkfjolsj.supabase.co', 
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHlsaXVqdWltdWZrZmpvbHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjIzNjgsImV4cCI6MjA2OTIzODM2OH0.dWYh2ROhXN6n4scKc-gKMMPUjVXBXD2xv5l-UGqyTZA'
);

const NEW_EXERCISES_PATH = '/mnt/c/Users/PW1234/.vscode/new finess app/new exercises';

async function uploadNewExercises() {
  console.log('🚀 Uploading new exercise GIFs to Supabase...\n');
  
  try {
    // Read all GIF files from the new exercises folder
    const files = fs.readdirSync(NEW_EXERCISES_PATH).filter(file => file.endsWith('.gif'));
    console.log(`Found ${files.length} GIF files to upload:\n`);
    
    for (const fileName of files) {
      const filePath = path.join(NEW_EXERCISES_PATH, fileName);
      const fileBuffer = fs.readFileSync(filePath);
      
      // Most are abdominal exercises, but push-up goes to pectorals
      const folder = fileName === '푸시업.gif' ? 'pectorals' : 'abdominals';
      const storagePath = `${folder}/${fileName}`;
      
      console.log(`Uploading ${fileName} to ${storagePath}...`);
      
      const { data, error } = await supabase.storage
        .from('exercise-gifs')
        .upload(storagePath, fileBuffer, {
          contentType: 'image/gif',
          upsert: true // Overwrite if exists
        });
      
      if (error) {
        console.log(`❌ Failed to upload ${fileName}:`, error.message);
      } else {
        console.log(`✅ Successfully uploaded ${fileName}`);
      }
    }
    
    console.log('\n🎉 Upload process completed!');
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  }
}

uploadNewExercises();