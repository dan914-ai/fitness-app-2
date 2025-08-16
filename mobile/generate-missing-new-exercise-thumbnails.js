#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎯 GENERATE MISSING NEW EXERCISE THUMBNAILS');
console.log('='.repeat(50));

// New exercises 348-367 that need local thumbnails
const newExercises = {
  348: { filename: '45-degree-extension', category: 'abdominals' },
  349: { filename: 'ab-roller', category: 'abdominals' },
  350: { filename: 'decline-sit-up', category: 'abdominals' },
  351: { filename: 'leg-raise', category: 'abdominals' },
  352: { filename: 'mountain-climber', category: 'abdominals' },
  353: { filename: 'machine-crunch', category: 'abdominals' },
  354: { filename: 'bicycle-crunch', category: 'abdominals' },
  355: { filename: 'side-plank', category: 'abdominals' },
  356: { filename: 'sit-up', category: 'abdominals' },
  357: { filename: 'weighted-russian-twist', category: 'abdominals' },
  358: { filename: 'weighted-cable-crunch', category: 'abdominals' },
  359: { filename: 'weighted-plank', category: 'abdominals' },
  360: { filename: 'captains-chair-knee-raise', category: 'abdominals' }, // already exists
  361: { filename: 'crunch', category: 'abdominals' }, // using knee-touch-crunch
  362: { filename: 'cross-body-crunch', category: 'abdominals' },
  363: { filename: 'toes-to-bar', category: 'abdominals' },
  364: { filename: '푸시업', category: 'pectorals', localName: 'push-up' }, // Korean name
  365: { filename: 'plank', category: 'abdominals' }, // using body-saw-plank
  366: { filename: 'flutter-kick', category: 'abdominals' },
  367: { filename: 'hanging-leg-raise', category: 'abdominals' },
};

console.log('\n📋 NEW EXERCISES NEEDING THUMBNAILS:');
console.log('ID  | Category    | Filename');
console.log('-'.repeat(40));

Object.entries(newExercises).forEach(([id, info]) => {
  const displayName = info.localName || info.filename;
  console.log(`${id.padEnd(3)} | ${info.category.padEnd(11)} | ${displayName}`);
});

console.log('\n🔧 TO GENERATE MISSING THUMBNAILS:');
console.log('1. Use ffmpeg to extract first frames from Supabase GIFs');
console.log('2. Save as JPEG thumbnails in assets/exercise-thumbnails/');
console.log('3. Add entries to thumbnailMapping.ts');

console.log('\n📝 FFMPEG COMMANDS TO RUN:');
console.log('(Run these from mobile/ directory)');

// Generate ffmpeg commands for downloading and converting
Object.entries(newExercises).forEach(([id, info]) => {
  const supabaseUrl = `https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/${info.category}/${info.filename}.gif`;
  const outputPath = `assets/exercise-thumbnails/${info.category}/${info.localName || info.filename}.jpg`;
  
  // Skip if already exists (360, 361, 365 are mapped)
  if (['360', '361', '365'].includes(id)) return;
  
  console.log(`# Exercise ${id}: ${info.localName || info.filename}`);
  console.log(`curl -o "temp-${id}.gif" "${supabaseUrl}"`);
  console.log(`ffmpeg -i "temp-${id}.gif" -vf "select=eq(n\\,0)" -q:v 3 "${outputPath}"`);
  console.log(`rm "temp-${id}.gif"`);
  console.log('');
});

console.log('\n🚀 AFTER GENERATING THUMBNAILS:');
console.log('Run: node update-thumbnail-mapping.js to add all new entries');