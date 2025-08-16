#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('=== BACKEND CONNECTION VERIFICATION ===\n');

// Read exercise database
const dbPath = path.join(__dirname, '..', 'src', 'data', 'exerciseDatabase.ts');
const dbContent = fs.readFileSync(dbPath, 'utf8');

// Extract exercises from database
const exerciseMatches = dbContent.match(/\{[^}]*id:\s*\d+[^}]*\}/gs) || [];
const exercises = exerciseMatches.map(match => {
  const id = match.match(/id:\s*(\d+)/)?.[1];
  const name = match.match(/name:\s*['"`]([^'"`]+)/)?.[1];
  const imageUrl = match.match(/imageUrl:\s*['"`]([^'"`]+)/)?.[1];
  return { id, name, imageUrl };
}).filter(ex => ex.id && ex.imageUrl);

console.log(`Total exercises in database: ${exercises.length}`);

// Read static thumbnails
const thumbPath = path.join(__dirname, '..', 'src', 'constants', 'staticThumbnails.ts');
const thumbContent = fs.readFileSync(thumbPath, 'utf8');
const thumbMatches = thumbContent.match(/['"`](\d+)['"`]:/g) || [];
const thumbIds = thumbMatches.map(m => m.match(/(\d+)/)?.[1]).filter(Boolean);

console.log(`Total thumbnail mappings: ${thumbIds.length}`);

// Check issues
const issues = [];
const warnings = [];

// 1. Check URL format
console.log('\n1️⃣ URL FORMAT CHECK');
const badUrls = exercises.filter(ex => 
  !ex.imageUrl.includes('ayttqsgttuvdhvbvbnsk.supabase.co')
);
if (badUrls.length > 0) {
  console.log(`   ❌ Invalid URLs: ${badUrls.length}`);
  badUrls.forEach(ex => issues.push(`ID ${ex.id}: Bad URL`));
} else {
  console.log('   ✅ All URLs properly formatted');
}

// 2. Check thumbnail mappings
console.log('\n2️⃣ THUMBNAIL MAPPING CHECK');
const missingThumbs = exercises.filter(ex => !thumbIds.includes(ex.id));
if (missingThumbs.length > 0) {
  console.log(`   ❌ Missing mappings: ${missingThumbs.length}`);
  missingThumbs.forEach(ex => issues.push(`ID ${ex.id} (${ex.name}): No thumbnail`));
} else {
  console.log('   ✅ All exercises have thumbnails');
}

// 3. Check local files
console.log('\n3️⃣ LOCAL FILE CHECK');
const gifsDir = path.join(__dirname, '..', 'assets', 'exercise-gifs');
const thumbDir = path.join(__dirname, '..', 'assets', 'exercise-thumbnails');

let missingGifs = 0;
let missingThumbFiles = 0;

exercises.forEach(ex => {
  const urlParts = ex.imageUrl.split('/');
  const muscle = urlParts[urlParts.length - 2];
  const filename = urlParts[urlParts.length - 1];
  
  const gifPath = path.join(gifsDir, muscle, filename);
  const thumbPath = path.join(thumbDir, muscle, filename.replace('.gif', '.jpg'));
  
  if (!fs.existsSync(gifPath)) {
    missingGifs++;
    warnings.push(`Missing GIF: ${muscle}/${filename}`);
  }
  if (!fs.existsSync(thumbPath)) {
    missingThumbFiles++;
    warnings.push(`Missing thumb: ${muscle}/${filename.replace('.gif', '.jpg')}`);
  }
});

console.log(`   GIFs: ${missingGifs === 0 ? '✅ All exist' : `❌ ${missingGifs} missing`}`);
console.log(`   Thumbnails: ${missingThumbFiles === 0 ? '✅ All exist' : `❌ ${missingThumbFiles} missing`}`);

// 4. Check services
console.log('\n4️⃣ SERVICE CHECK');
const servicesDir = path.join(__dirname, '..', 'src', 'services');
const services = fs.readdirSync(servicesDir).filter(f => f.endsWith('.ts'));

const exerciseServices = services.filter(service => {
  const content = fs.readFileSync(path.join(servicesDir, service), 'utf8');
  return content.includes('exerciseDatabase') || content.includes('EXERCISE_DATABASE');
});

console.log(`   Services using exercises: ${exerciseServices.length}`);
exerciseServices.forEach(s => console.log(`     - ${s}`));

// 5. Check components
console.log('\n5️⃣ COMPONENT CHECK');
const componentsToCheck = [
  'src/screens/record/ExerciseSelectionScreen.tsx',
  'src/screens/home/ExerciseTrackScreen.tsx',
  'src/screens/home/WorkoutSessionScreen.tsx'
];

componentsToCheck.forEach(comp => {
  const fullPath = path.join(__dirname, '..', comp);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const usesDb = content.includes('exerciseDatabase');
    const usesThumbs = content.includes('staticThumbnails');
    console.log(`   ${path.basename(comp)}: DB=${usesDb ? '✅' : '❌'} Thumbs=${usesThumbs ? '✅' : '❌'}`);
  }
});

// Final report
console.log('\n' + '='.repeat(50));
console.log('📊 FINAL REPORT');
console.log('='.repeat(50));

if (issues.length === 0 && warnings.length === 0) {
  console.log('\n🎉 PERFECT! All backend connections verified!');
  console.log(`\n✅ Summary:`);
  console.log(`  • ${exercises.length} exercises in database`);
  console.log(`  • ${thumbIds.length} thumbnail mappings`);
  console.log(`  • All URLs properly formatted`);
  console.log(`  • All files exist`);
} else {
  if (issues.length > 0) {
    console.log(`\n❌ ISSUES: ${issues.length}`);
    issues.slice(0, 5).forEach(i => console.log(`  • ${i}`));
  }
  if (warnings.length > 0) {
    console.log(`\n⚠️ WARNINGS: ${warnings.length}`);
    warnings.slice(0, 5).forEach(w => console.log(`  • ${w}`));
  }
}

console.log('\n' + '='.repeat(50));