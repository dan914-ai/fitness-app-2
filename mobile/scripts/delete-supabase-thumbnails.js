#!/usr/bin/env node

const https = require('https');

// Supabase configuration
const SUPABASE_URL = 'https://ayttqsgttuvdhvbvbnsk.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

console.log('=== DELETE SUPABASE THUMBNAIL JPGs ===\n');

if (!SUPABASE_ANON_KEY) {
  console.log('❌ Error: SUPABASE_ANON_KEY environment variable not set');
  console.log('\nTo delete files from Supabase, you need to:');
  console.log('1. Get your Supabase anon key from: https://app.supabase.com/project/ayttqsgttuvdhvbvbnsk/settings/api');
  console.log('2. Run: export SUPABASE_ANON_KEY="your-key-here"');
  console.log('3. Run this script again\n');
  
  console.log('Alternatively, you can delete them manually:');
  console.log('1. Go to: https://app.supabase.com/project/ayttqsgttuvdhvbvbnsk/storage/buckets/exercise-gifs');
  console.log('2. Navigate through each muscle group folder');
  console.log('3. Select all .jpg files and delete them');
  process.exit(1);
}

// Muscle group directories to check
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
  'triceps',
  'arms',
  'legs'
];

// Function to list files in a directory
async function listFiles(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ayttqsgttuvdhvbvbnsk.supabase.co',
      path: `/storage/v1/object/list/public/exercise-gifs/${path}`,
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const files = JSON.parse(data);
          resolve(files);
        } catch (e) {
          console.log(`Error parsing response for ${path}:`, e.message);
          resolve([]);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`Error listing ${path}:`, err.message);
      resolve([]);
    });

    req.write(JSON.stringify({
      limit: 1000,
      offset: 0
    }));
    
    req.end();
  });
}

// Function to delete a file
async function deleteFile(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'ayttqsgttuvdhvbvbnsk.supabase.co',
      path: `/storage/v1/object/public/exercise-gifs/${path}`,
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 204);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.end();
  });
}

// Main function to find and delete JPG files
async function deleteAllJpgs() {
  const jpgFiles = [];
  
  console.log('Searching for JPG files in Supabase storage...\n');
  
  // List files in each muscle group directory
  for (const group of muscleGroups) {
    console.log(`Checking ${group}...`);
    const files = await listFiles(group);
    
    if (Array.isArray(files)) {
      const jpgs = files.filter(f => f.name && f.name.endsWith('.jpg'));
      if (jpgs.length > 0) {
        console.log(`  Found ${jpgs.length} JPG files`);
        jpgs.forEach(jpg => {
          jpgFiles.push({
            path: `${group}/${jpg.name}`,
            name: jpg.name,
            group: group
          });
        });
      }
    }
  }
  
  if (jpgFiles.length === 0) {
    console.log('\n✅ No JPG thumbnail files found in Supabase storage');
    return;
  }
  
  console.log(`\n=== Found ${jpgFiles.length} JPG files to delete ===\n`);
  
  // Show what will be deleted
  const byGroup = {};
  jpgFiles.forEach(file => {
    if (!byGroup[file.group]) byGroup[file.group] = [];
    byGroup[file.group].push(file.name);
  });
  
  Object.entries(byGroup).forEach(([group, files]) => {
    console.log(`${group}: ${files.length} files`);
    files.slice(0, 3).forEach(f => console.log(`  - ${f}`));
    if (files.length > 3) console.log(`  ... and ${files.length - 3} more`);
  });
  
  // Confirm deletion
  console.log('\n⚠️  WARNING: This will permanently delete all JPG thumbnails from Supabase');
  console.log('Make sure you have local copies if needed!\n');
  
  // Delete the files
  console.log('Starting deletion...\n');
  
  let deleted = 0;
  let failed = 0;
  
  for (const file of jpgFiles) {
    process.stdout.write(`\rDeleting: ${deleted + failed + 1}/${jpgFiles.length}`);
    const success = await deleteFile(file.path);
    
    if (success) {
      deleted++;
    } else {
      failed++;
      console.log(`\n❌ Failed to delete: ${file.path}`);
    }
  }
  
  console.log('\n\n=== DELETION COMPLETE ===');
  console.log(`✅ Successfully deleted: ${deleted} files`);
  if (failed > 0) {
    console.log(`❌ Failed to delete: ${failed} files`);
  }
}

// Alternative: Generate curl commands for manual deletion
function generateCurlCommands() {
  console.log('\n=== CURL COMMANDS FOR MANUAL DELETION ===\n');
  console.log('If the script cannot delete files, you can use these curl commands:\n');
  
  const exerciseDatabase = require('../src/data/exerciseDatabase.ts').default;
  
  // Get unique muscle groups from database
  const groups = new Set();
  exerciseDatabase.forEach(ex => {
    if (ex.imageUrl && ex.imageUrl.includes('/exercise-gifs/')) {
      const group = ex.imageUrl.split('/exercise-gifs/')[1].split('/')[0];
      groups.add(group);
    }
  });
  
  groups.forEach(group => {
    console.log(`# Delete JPGs from ${group} folder:`);
    console.log(`curl -X DELETE \\`);
    console.log(`  'https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/${group}/*.jpg' \\`);
    console.log(`  -H 'apikey: YOUR_ANON_KEY' \\`);
    console.log(`  -H 'Authorization: Bearer YOUR_ANON_KEY'\n`);
  });
}

// Check if we can access Supabase
async function checkAccess() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'ayttqsgttuvdhvbvbnsk.supabase.co',
      path: '/storage/v1/object/public/exercise-gifs',
      method: 'GET'
    };

    https.request(options, (res) => {
      resolve(res.statusCode < 500);
    }).on('error', () => {
      resolve(false);
    }).end();
  });
}

// Main execution
async function main() {
  const hasAccess = await checkAccess();
  
  if (!hasAccess) {
    console.log('❌ Cannot connect to Supabase storage');
    generateCurlCommands();
    return;
  }
  
  if (SUPABASE_ANON_KEY) {
    await deleteAllJpgs();
  } else {
    generateCurlCommands();
  }
}

main();