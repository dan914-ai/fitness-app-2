#!/usr/bin/env node

const https = require('https');

console.log('=== Scanning Supabase Exercise GIFs ===\n');

// The Supabase project URL
const SUPABASE_URL = 'https://ayttqsgttuvdhvbvbnsk.supabase.co';
const STORAGE_BASE = '/storage/v1/object/public/exercise-gifs';

// Muscle group directories to scan
const muscleGroups = [
  'abdominals',
  'back',
  'biceps',
  'calves',
  'cardio',
  'compound',
  'deltoids',
  'forearms',
  'glutes',
  'hamstrings',
  'pectorals',
  'quadriceps',
  'traps',
  'triceps'
];

// Function to list files in a directory
async function listSupabaseDirectory(directory) {
  return new Promise((resolve) => {
    const url = `${SUPABASE_URL}/storage/v1/object/list/public/exercise-gifs/${directory}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const files = JSON.parse(data);
          resolve(files);
        } catch (e) {
          console.log(`Error parsing ${directory}:`, e.message);
          resolve([]);
        }
      });
    }).on('error', (err) => {
      console.log(`Error fetching ${directory}:`, err.message);
      resolve([]);
    });
  });
}

// Function to check if a specific GIF exists
async function checkGifExists(path) {
  return new Promise((resolve) => {
    const url = `${SUPABASE_URL}${STORAGE_BASE}/${path}`;
    
    https.request(url, { method: 'HEAD' }, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    }).end();
  });
}

// Try different approaches to scan Supabase
async function scanSupabase() {
  console.log('Attempting to scan Supabase storage...\n');
  
  // Method 1: Try to list directories
  console.log('Method 1: Trying to list directories...');
  for (const group of muscleGroups.slice(0, 3)) { // Test with first 3
    console.log(`Checking ${group}...`);
    const files = await listSupabaseDirectory(group);
    if (files && files.length > 0) {
      console.log(`  Found ${files.length} files`);
      files.slice(0, 5).forEach(f => console.log(`    - ${f.name || f}`));
    }
  }
  
  // Method 2: Check known GIF paths
  console.log('\nMethod 2: Checking known GIF paths...');
  const knownPaths = [
    'abdominals/alternate-heel-touches.gif',
    'back/lat-pulldown.gif',
    'pectorals/bench-press.gif',
    'quadriceps/squat.gif',
    'biceps/barbell-curl.gif'
  ];
  
  for (const path of knownPaths) {
    const exists = await checkGifExists(path);
    console.log(`  ${path}: ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
  }
  
  // Method 3: Try the RPC endpoint
  console.log('\nMethod 3: Trying storage RPC...');
  const rpcUrl = `${SUPABASE_URL}/storage/v1/object/public/exercise-gifs`;
  
  https.get(rpcUrl, (res) => {
    console.log(`  Status: ${res.statusCode}`);
    console.log(`  Headers:`, res.headers['content-type']);
  }).on('error', (err) => {
    console.log(`  Error: ${err.message}`);
  });
}

// Since we can't directly list Supabase storage, let's check all URLs from our database
async function checkDatabaseUrls() {
  console.log('\n=== Checking All Database URLs ===\n');
  
  const exerciseDatabase = require('../src/data/exerciseDatabase.ts').default;
  const results = {
    working: [],
    notFound: [],
    error: []
  };
  
  // Extract unique GIF paths from database
  const gifPaths = new Set();
  exerciseDatabase.forEach(ex => {
    if (ex.imageUrl && ex.imageUrl.includes('exercise-gifs')) {
      const path = ex.imageUrl.split('exercise-gifs/')[1];
      if (path) gifPaths.add(path);
    }
  });
  
  console.log(`Found ${gifPaths.size} unique GIF paths in database\n`);
  
  // Group by muscle group
  const byMuscleGroup = {};
  for (const path of gifPaths) {
    const group = path.split('/')[0];
    if (!byMuscleGroup[group]) byMuscleGroup[group] = [];
    byMuscleGroup[group].push(path);
  }
  
  // Display organized results
  for (const [group, paths] of Object.entries(byMuscleGroup)) {
    console.log(`\n${group.toUpperCase()} (${paths.length} exercises):`);
    for (const path of paths.slice(0, 5)) { // Show first 5
      const exists = await checkGifExists(path);
      const name = path.split('/')[1].replace('.gif', '');
      console.log(`  ${exists ? '✅' : '❌'} ${name}`);
    }
    if (paths.length > 5) {
      console.log(`  ... and ${paths.length - 5} more`);
    }
  }
  
  // Check all and summarize
  console.log('\nChecking all GIFs...');
  let checked = 0;
  let working = 0;
  
  for (const path of gifPaths) {
    const exists = await checkGifExists(path);
    checked++;
    if (exists) working++;
    
    // Progress indicator
    if (checked % 10 === 0) {
      process.stdout.write(`\rChecked: ${checked}/${gifPaths.size} (${working} working)`);
    }
  }
  
  console.log(`\n\n=== SUMMARY ===`);
  console.log(`Total GIFs checked: ${checked}`);
  console.log(`Working: ${working}`);
  console.log(`Not found: ${checked - working}`);
  console.log(`Success rate: ${(working / checked * 100).toFixed(1)}%`);
}

// Run the scan
async function main() {
  // First try to scan Supabase directly
  await scanSupabase();
  
  // Then check our database URLs
  await checkDatabaseUrls();
}

main();