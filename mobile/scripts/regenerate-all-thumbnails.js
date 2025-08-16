#!/usr/bin/env node

/**
 * Regenerate ALL thumbnails from GIF files using ffmpeg
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const GIF_DIR = path.join(BASE_DIR, 'assets', 'exercise-gifs');
const THUMB_DIR = path.join(BASE_DIR, 'assets', 'exercise-thumbnails');

const directories = [
  'abdominals', 'arms', 'back', 'biceps', 'calves', 'cardio', 
  'compound', 'deltoids', 'forearms', 'glutes', 'hamstrings', 
  'legs', 'matched', 'pectorals', 'quadriceps', 'traps', 'triceps'
];

let totalProcessed = 0;
let successCount = 0;
let failCount = 0;

console.log('🚀 Starting thumbnail regeneration for ALL exercises...\n');

directories.forEach(dir => {
  const gifPath = path.join(GIF_DIR, dir);
  const thumbPath = path.join(THUMB_DIR, dir);
  
  if (!fs.existsSync(gifPath)) {
    console.log(`⚠️  Skipping ${dir}: GIF directory doesn't exist`);
    return;
  }
  
  // Ensure thumbnail directory exists
  if (!fs.existsSync(thumbPath)) {
    fs.mkdirSync(thumbPath, { recursive: true });
  }
  
  const gifs = fs.readdirSync(gifPath).filter(f => f.endsWith('.gif'));
  
  if (gifs.length === 0) {
    console.log(`⚠️  No GIFs found in ${dir}`);
    return;
  }
  
  console.log(`\n📁 Processing ${dir} (${gifs.length} files)...`);
  
  gifs.forEach(gifFile => {
    const gifFilePath = path.join(gifPath, gifFile);
    const thumbName = gifFile.replace('.gif', '.jpg');
    const thumbFilePath = path.join(thumbPath, thumbName);
    
    totalProcessed++;
    
    try {
      // Use ffmpeg to extract a frame from the GIF
      // Try to get frame 10 first, if that fails, get the first frame
      let command = `ffmpeg -i "${gifFilePath}" -vf "select=eq(n\\,10)" -vframes 1 -q:v 2 "${thumbFilePath}" -y 2>&1`;
      
      try {
        execSync(command, { stdio: 'pipe' });
      } catch (error) {
        // If frame 10 doesn't exist, try first frame
        command = `ffmpeg -i "${gifFilePath}" -vframes 1 -q:v 2 "${thumbFilePath}" -y 2>&1`;
        execSync(command, { stdio: 'pipe' });
      }
      
      // Verify the file was created and has reasonable size
      if (fs.existsSync(thumbFilePath)) {
        const stats = fs.statSync(thumbFilePath);
        if (stats.size > 10240) { // Greater than 10KB
          console.log(`  ✅ ${thumbName} (${Math.round(stats.size / 1024)}KB)`);
          successCount++;
        } else {
          console.log(`  ⚠️  ${thumbName} created but small (${Math.round(stats.size / 1024)}KB)`);
          failCount++;
        }
      } else {
        console.log(`  ❌ Failed to create ${thumbName}`);
        failCount++;
      }
    } catch (error) {
      console.log(`  ❌ Error processing ${gifFile}: ${error.message.split('\n')[0]}`);
      failCount++;
    }
  });
});

// Remove extra thumbnail that doesn't have a GIF
const extraThumb = path.join(THUMB_DIR, 'pectorals', 'push-up.jpg');
if (fs.existsSync(extraThumb)) {
  fs.unlinkSync(extraThumb);
  console.log('\n🗑️  Removed extra thumbnail: pectorals/push-up.jpg');
}

console.log('\n' + '='.repeat(60));
console.log('📊 Thumbnail Regeneration Complete!\n');
console.log(`✅ Successfully generated: ${successCount} thumbnails`);
console.log(`❌ Failed: ${failCount} thumbnails`);
console.log(`📁 Total processed: ${totalProcessed} files`);
console.log('='.repeat(60));