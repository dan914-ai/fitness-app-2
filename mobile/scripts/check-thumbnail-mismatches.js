#!/usr/bin/env node

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

let totalMismatches = 0;
let missingThumbnails = [];
let extraThumbnails = [];

directories.forEach(dir => {
  const gifPath = path.join(GIF_DIR, dir);
  const thumbPath = path.join(THUMB_DIR, dir);
  
  if (!fs.existsSync(gifPath) || !fs.existsSync(thumbPath)) {
    console.log(`⚠️  Directory missing: ${dir}`);
    return;
  }
  
  const gifs = fs.readdirSync(gifPath)
    .filter(f => f.endsWith('.gif'))
    .map(f => f.replace('.gif', ''));
    
  const thumbs = fs.readdirSync(thumbPath)
    .filter(f => f.endsWith('.jpg'))
    .map(f => f.replace('.jpg', ''));
  
  // Find missing thumbnails
  gifs.forEach(gif => {
    if (!thumbs.includes(gif)) {
      missingThumbnails.push(`${dir}/${gif}`);
      totalMismatches++;
    }
  });
  
  // Find extra thumbnails
  thumbs.forEach(thumb => {
    if (!gifs.includes(thumb)) {
      extraThumbnails.push(`${dir}/${thumb}`);
      totalMismatches++;
    }
  });
});

console.log('\n📊 Thumbnail Analysis Report\n');
console.log('=' .repeat(50));

if (missingThumbnails.length > 0) {
  console.log(`\n❌ Missing Thumbnails (${missingThumbnails.length}):`);
  missingThumbnails.forEach(file => {
    console.log(`   - ${file}`);
  });
}

if (extraThumbnails.length > 0) {
  console.log(`\n⚠️  Extra Thumbnails without GIFs (${extraThumbnails.length}):`);
  extraThumbnails.forEach(file => {
    console.log(`   - ${file}`);
  });
}

if (totalMismatches === 0) {
  console.log('\n✅ All thumbnails match their GIF files!');
} else {
  console.log(`\n📝 Total mismatches found: ${totalMismatches}`);
}

// Now let's check file sizes to identify potentially wrong thumbnails
console.log('\n\n🔍 Checking for suspiciously small thumbnails (might be placeholders)...\n');

let suspiciousThumbnails = [];

directories.forEach(dir => {
  const thumbPath = path.join(THUMB_DIR, dir);
  
  if (!fs.existsSync(thumbPath)) return;
  
  const files = fs.readdirSync(thumbPath).filter(f => f.endsWith('.jpg'));
  
  files.forEach(file => {
    const filePath = path.join(thumbPath, file);
    const stats = fs.statSync(filePath);
    
    // Thumbnails smaller than 10KB are suspicious
    if (stats.size < 10240) {
      suspiciousThumbnails.push({
        path: `${dir}/${file}`,
        size: Math.round(stats.size / 1024)
      });
    }
  });
});

if (suspiciousThumbnails.length > 0) {
  console.log(`⚠️  Suspiciously small thumbnails (< 10KB):`);
  suspiciousThumbnails.forEach(thumb => {
    console.log(`   - ${thumb.path} (${thumb.size}KB)`);
  });
} else {
  console.log('✅ All thumbnails have reasonable file sizes');
}

console.log('\n' + '=' .repeat(50));