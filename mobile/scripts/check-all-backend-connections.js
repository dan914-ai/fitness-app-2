#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Import database and thumbnails
const exerciseDatabase = require('../src/data/exerciseDatabase.ts').default;
const staticThumbnails = require('../src/constants/staticThumbnails.ts').staticThumbnails;

console.log('=== BACKEND CONNECTION CHECK ===\n');

const issues = [];
const warnings = [];

// 1. Check Database Structure
console.log('1️⃣ DATABASE STRUCTURE CHECK');
console.log(`   Total exercises: ${exerciseDatabase.length}`);

// Check for required fields
const missingFields = [];
exerciseDatabase.forEach((ex, index) => {
  const required = ['id', 'name', 'englishName', 'imageUrl', 'thumbnailUrl', 'category', 'muscleGroup'];
  required.forEach(field => {
    if (!ex[field]) {
      missingFields.push(`Exercise ${ex.id || index}: missing ${field}`);
    }
  });
});

if (missingFields.length > 0) {
  console.log(`   ❌ Missing fields: ${missingFields.length}`);
  issues.push(...missingFields);
} else {
  console.log('   ✅ All required fields present');
}

// 2. Check URL Format
console.log('\n2️⃣ URL FORMAT CHECK');
const urlPattern = /^https:\/\/ayttqsgttuvdhvbvbnsk\.supabase\.co\/storage\/v1\/object\/public\/exercise-gifs\/.+\.gif$/;
const badUrls = exerciseDatabase.filter(ex => !urlPattern.test(ex.imageUrl));

if (badUrls.length > 0) {
  console.log(`   ❌ Invalid URL format: ${badUrls.length} exercises`);
  badUrls.forEach(ex => {
    issues.push(`Exercise ${ex.id} (${ex.name}): Invalid URL format`);
  });
} else {
  console.log('   ✅ All URLs properly formatted');
}

// 3. Check Database vs Local Files
console.log('\n3️⃣ DATABASE vs LOCAL FILES');
const gifsDir = path.join(__dirname, '..', 'assets', 'exercise-gifs');
const localGifs = new Set();

// Collect all local GIF files
const muscleGroups = fs.readdirSync(gifsDir).filter(f => 
  fs.statSync(path.join(gifsDir, f)).isDirectory() && f !== 'matched'
);

muscleGroups.forEach(muscle => {
  const files = fs.readdirSync(path.join(gifsDir, muscle))
    .filter(f => f.endsWith('.gif'));
  files.forEach(file => {
    localGifs.add(`${muscle}/${file}`);
  });
});

// Check if database URLs match local files
const dbToLocal = [];
exerciseDatabase.forEach(ex => {
  const urlParts = ex.imageUrl.split('/');
  const filePath = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;
  
  if (!localGifs.has(filePath)) {
    dbToLocal.push({
      id: ex.id,
      name: ex.name,
      expectedPath: filePath
    });
  }
});

if (dbToLocal.length > 0) {
  console.log(`   ❌ Database references ${dbToLocal.length} missing local files`);
  warnings.push(`${dbToLocal.length} exercises reference non-existent local files`);
} else {
  console.log('   ✅ All database URLs have corresponding local files');
}

// 4. Check Static Thumbnails
console.log('\n4️⃣ STATIC THUMBNAIL MAPPINGS');
const thumbnailIds = Object.keys(staticThumbnails);
console.log(`   Total mappings: ${thumbnailIds.length}`);

// Check if all database exercises have thumbnails
const missingThumbnails = [];
exerciseDatabase.forEach(ex => {
  if (!thumbnailIds.includes(ex.id.toString())) {
    missingThumbnails.push({
      id: ex.id,
      name: ex.name,
      englishName: ex.englishName
    });
  }
});

if (missingThumbnails.length > 0) {
  console.log(`   ❌ Missing thumbnail mappings: ${missingThumbnails.length}`);
  missingThumbnails.forEach(ex => {
    issues.push(`Exercise ${ex.id} (${ex.name}): No thumbnail mapping`);
  });
} else {
  console.log('   ✅ All exercises have thumbnail mappings');
}

// Check if thumbnail files actually exist
console.log('\n5️⃣ THUMBNAIL FILE CHECK');
const thumbDir = path.join(__dirname, '..', 'assets', 'exercise-thumbnails');
let missingThumbFiles = 0;

exerciseDatabase.forEach(ex => {
  const urlParts = ex.imageUrl.split('/');
  const muscle = urlParts[urlParts.length - 2];
  const filename = urlParts[urlParts.length - 1].replace('.gif', '.jpg');
  const thumbPath = path.join(thumbDir, muscle, filename);
  
  if (!fs.existsSync(thumbPath)) {
    missingThumbFiles++;
    warnings.push(`Missing thumbnail file: ${muscle}/${filename}`);
  }
});

if (missingThumbFiles > 0) {
  console.log(`   ❌ Missing thumbnail files: ${missingThumbFiles}`);
} else {
  console.log('   ✅ All thumbnail files exist');
}

// 6. Check for orphaned thumbnails
console.log('\n6️⃣ ORPHANED THUMBNAIL CHECK');
const orphanedMappings = [];
thumbnailIds.forEach(id => {
  if (!exerciseDatabase.find(ex => ex.id.toString() === id)) {
    orphanedMappings.push(id);
  }
});

if (orphanedMappings.length > 0) {
  console.log(`   ⚠️ Orphaned mappings: ${orphanedMappings.length} (IDs: ${orphanedMappings.join(', ')})`);
  warnings.push(`${orphanedMappings.length} thumbnail mappings for non-existent exercises`);
} else {
  console.log('   ✅ No orphaned thumbnail mappings');
}

// 7. Check Services
console.log('\n7️⃣ SERVICE INTEGRATION CHECK');
const servicesDir = path.join(__dirname, '..', 'src', 'services');
const services = fs.readdirSync(servicesDir).filter(f => f.endsWith('.ts') || f.endsWith('.js'));

const exerciseServices = services.filter(service => {
  const content = fs.readFileSync(path.join(servicesDir, service), 'utf8');
  return content.includes('exerciseDatabase') || content.includes('EXERCISE_DATABASE');
});

console.log(`   Services using exercise data: ${exerciseServices.length}`);
exerciseServices.forEach(service => {
  console.log(`   - ${service}`);
});

// 8. Check Components
console.log('\n8️⃣ COMPONENT CHECK');
const componentsToCheck = [
  'src/components/common/InstantThumbnail.tsx',
  'src/screens/record/ExerciseSelectionScreen.tsx',
  'src/screens/home/ExerciseTrackScreen.tsx'
];

componentsToCheck.forEach(componentPath => {
  const fullPath = path.join(__dirname, '..', componentPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const usesStaticThumbs = content.includes('staticThumbnails');
    const usesDatabase = content.includes('exerciseDatabase') || content.includes('EXERCISE_DATABASE');
    
    console.log(`   ${path.basename(componentPath)}:`);
    console.log(`     - Uses static thumbnails: ${usesStaticThumbs ? '✅' : '❌'}`);
    console.log(`     - Uses database: ${usesDatabase ? '✅' : '⚠️'}`);
  }
});

// Final Report
console.log('\n' + '='.repeat(50));
console.log('📊 FINAL REPORT');
console.log('='.repeat(50) + '\n');

if (issues.length === 0 && warnings.length === 0) {
  console.log('🎉 PERFECT! All backend connections are properly configured!');
  console.log('\n✅ Summary:');
  console.log(`  • ${exerciseDatabase.length} exercises in database`);
  console.log(`  • ${thumbnailIds.length} thumbnail mappings`);
  console.log(`  • All URLs properly formatted`);
  console.log(`  • All files exist`);
  console.log(`  • Services properly integrated`);
} else {
  if (issues.length > 0) {
    console.log(`❌ CRITICAL ISSUES: ${issues.length}`);
    issues.slice(0, 10).forEach(issue => {
      console.log(`  • ${issue}`);
    });
    if (issues.length > 10) {
      console.log(`  ... and ${issues.length - 10} more`);
    }
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️ WARNINGS: ${warnings.length}`);
    warnings.slice(0, 10).forEach(warning => {
      console.log(`  • ${warning}`);
    });
    if (warnings.length > 10) {
      console.log(`  ... and ${warnings.length - 10} more`);
    }
  }
}

console.log('\n' + '='.repeat(50));