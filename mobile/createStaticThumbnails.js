#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Since we can't easily convert GIFs to JPEGs without proper tools,
// let's just copy the existing GIF files and rename them for now
// This at least sets up the structure for when we can properly convert them

const sourceDir = path.join(__dirname, 'assets', 'exercise-thumbnails');
const outputDir = path.join(__dirname, 'assets', 'static-thumbnails');

// Map of exercise IDs to file names
const exerciseMapping = {
  // Abdominals
  '1': { file: 'alternate-heel-touches.jpg', category: 'abdominals' },
  '2': { file: 'body-saw-plank.jpg', category: 'abdominals' },
  '3': { file: 'captains-chair-leg-raise.jpg', category: 'abdominals' },
  '4': { file: 'knee-touch-crunch.jpg', category: 'abdominals' },
  '5': { file: 'tuck-crunch.jpg', category: 'abdominals' },
  '348': { file: '45-degree-extension.jpg', category: 'abdominals' },
  '349': { file: 'ab-roller.jpg', category: 'abdominals' },
  '350': { file: 'decline-sit-up.jpg', category: 'abdominals' },
  '351': { file: 'leg-raise.jpg', category: 'abdominals' },
  '352': { file: 'mountain-climber.jpg', category: 'abdominals' },
  '353': { file: 'machine-crunch.jpg', category: 'abdominals' },
  '354': { file: 'bicycle-crunch.jpg', category: 'abdominals' },
  '355': { file: 'side-plank.jpg', category: 'abdominals' },
  '356': { file: 'sit-up.jpg', category: 'abdominals' },
  '357': { file: 'weighted-russian-twist.jpg', category: 'abdominals' },
  '358': { file: 'weighted-cable-crunch.jpg', category: 'abdominals' },
  '359': { file: 'weighted-plank.jpg', category: 'abdominals' },
  '360': { file: 'captains-chair-knee-raise.jpg', category: 'abdominals' },
  '361': { file: 'crunch.jpg', category: 'abdominals' },
  '362': { file: 'cross-body-crunch.jpg', category: 'abdominals' },
  '363': { file: 'toes-to-bar.jpg', category: 'abdominals' },
  '365': { file: 'plank.jpg', category: 'abdominals' },
  '366': { file: 'flutter-kick.jpg', category: 'abdominals' },
  '367': { file: 'hanging-leg-raise.jpg', category: 'abdominals' },
  // Pectorals
  '364': { file: 'push-up.jpg', category: 'pectorals' }
};

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Setting up static thumbnails structure...\n');

let successCount = 0;
let errorCount = 0;

for (const [id, info] of Object.entries(exerciseMapping)) {
  const sourcePath = path.join(sourceDir, info.category, info.file);
  const outputFileName = `${id}-${path.basename(info.file, '.jpg')}.jpg`;
  const outputPath = path.join(outputDir, outputFileName);
  
  if (fs.existsSync(sourcePath)) {
    try {
      // Copy the file (even though it's a GIF, we'll set up the structure)
      fs.copyFileSync(sourcePath, outputPath);
      console.log(`✅ Copied: ${outputFileName}`);
      successCount++;
    } catch (error) {
      console.log(`❌ Error copying ${info.file}:`, error.message);
      errorCount++;
    }
  } else {
    console.log(`⚠️  Source file not found: ${sourcePath}`);
    errorCount++;
  }
}

console.log('\n' + '='.repeat(50));
console.log('Static thumbnail setup complete!');
console.log(`✅ Success: ${successCount} files`);
console.log(`❌ Errors: ${errorCount} files`);
console.log(`📁 Output directory: ${outputDir}`);
console.log('\nNote: These are still GIFs. To convert to real JPEGs, you need:');
console.log('1. Install ImageMagick: sudo apt-get install imagemagick');
console.log('2. Run: for f in *.jpg; do convert "$f[0]" "${f%.jpg}-converted.jpg"; done');
console.log('='.repeat(50));