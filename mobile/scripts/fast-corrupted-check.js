#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://ayttqsgttuvdhvbvbnsk.supabase.co';
const exerciseDatabase = require('../src/data/exerciseDatabase.ts').default;

console.log('=== FAST SCAN FOR CORRUPTED GIFs ===\n');

// Quick HEAD request to check status and size
function quickCheck(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'HEAD',
      timeout: 5000
    };
    
    const req = https.request(options, (res) => {
      const size = parseInt(res.headers['content-length'] || '0');
      
      // Check for obvious issues
      if (res.statusCode !== 200) {
        resolve({ 
          url, 
          corrupted: true, 
          reason: `HTTP ${res.statusCode}` 
        });
      } else if (size < 100) {
        resolve({ 
          url, 
          corrupted: true, 
          reason: `Too small (${size} bytes)` 
        });
      } else {
        resolve({ 
          url, 
          corrupted: false, 
          size 
        });
      }
    });
    
    req.on('error', () => {
      resolve({ url, corrupted: true, reason: 'Network error' });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ url, corrupted: true, reason: 'Timeout' });
    });
    
    req.end();
  });
}

// Process in batches
async function scanAll() {
  const batchSize = 20;
  const results = [];
  
  console.log(`Scanning ${exerciseDatabase.length} GIFs in batches of ${batchSize}...\n`);
  
  for (let i = 0; i < exerciseDatabase.length; i += batchSize) {
    const batch = exerciseDatabase.slice(i, Math.min(i + batchSize, exerciseDatabase.length));
    process.stdout.write(`\rProgress: ${Math.min(i + batchSize, exerciseDatabase.length)}/${exerciseDatabase.length}`);
    
    const batchResults = await Promise.all(
      batch.map(ex => quickCheck(ex.imageUrl).then(result => ({
        ...result,
        id: ex.id,
        name: ex.name,
        englishName: ex.englishName
      })))
    );
    
    results.push(...batchResults);
  }
  
  const corrupted = results.filter(r => r.corrupted);
  const working = results.filter(r => !r.corrupted);
  
  console.log('\n\n=== SCAN RESULTS ===\n');
  console.log(`✅ Working GIFs: ${working.length}`);
  console.log(`❌ Corrupted/Problematic GIFs: ${corrupted.length}`);
  
  if (corrupted.length === 0) {
    console.log('\n✨ All GIFs are accessible! No corrupted files found.');
    return;
  }
  
  console.log('\n=== CORRUPTED/PROBLEMATIC GIFs ===\n');
  
  // Group by reason
  const byReason = {};
  corrupted.forEach(gif => {
    if (!byReason[gif.reason]) byReason[gif.reason] = [];
    byReason[gif.reason].push(gif);
  });
  
  Object.entries(byReason).forEach(([reason, gifs]) => {
    console.log(`\n${reason} (${gifs.length} files):`);
    gifs.slice(0, 5).forEach(gif => {
      console.log(`  ID ${gif.id}: ${gif.name} (${gif.englishName})`);
    });
    if (gifs.length > 5) {
      console.log(`  ... and ${gifs.length - 5} more`);
    }
  });
  
  // Save results
  const outputPath = path.join(__dirname, 'corrupted-gifs.json');
  fs.writeFileSync(outputPath, JSON.stringify(corrupted, null, 2));
  console.log(`\n📁 Full list saved to: corrupted-gifs.json`);
  
  // Show which exercises would be removed
  console.log('\n=== EXERCISES TO REMOVE ===\n');
  console.log('The following exercises have corrupted/inaccessible GIFs:');
  corrupted.forEach(gif => {
    console.log(`- ID ${gif.id}: ${gif.name} (${gif.reason})`);
  });
  
  return corrupted;
}

scanAll().catch(console.error);