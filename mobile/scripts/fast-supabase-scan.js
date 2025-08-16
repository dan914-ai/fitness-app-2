#!/usr/bin/env node

const https = require('https');
const exerciseDatabase = require('../src/data/exerciseDatabase.ts').default;

console.log('=== Fast Supabase GIF Scan ===\n');

// Function to check multiple URLs in parallel
function checkUrlsBatch(urls) {
  return Promise.all(urls.map(url => {
    return new Promise((resolve) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'HEAD',
        timeout: 3000
      };
      
      const req = https.request(options, (res) => {
        resolve({ url, status: res.statusCode });
      });
      
      req.on('error', () => {
        resolve({ url, status: 'error' });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ url, status: 'timeout' });
      });
      
      req.end();
    });
  }));
}

async function scanAll() {
  // Get all unique URLs
  const urls = exerciseDatabase.map(ex => ex.imageUrl);
  console.log(`Scanning ${urls.length} exercise GIFs...\n`);
  
  // Process in batches of 10
  const batchSize = 10;
  const results = {
    working: 0,
    notFound: 0,
    error: 0
  };
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, Math.min(i + batchSize, urls.length));
    const batchResults = await checkUrlsBatch(batch);
    
    batchResults.forEach(result => {
      if (result.status === 200) {
        results.working++;
      } else if (result.status === 404) {
        results.notFound++;
      } else {
        results.error++;
      }
    });
    
    process.stdout.write(`\rProgress: ${Math.min(i + batchSize, urls.length)}/${urls.length} - Working: ${results.working}, Errors: ${results.error + results.notFound}`);
  }
  
  console.log('\n\n=== RESULTS ===');
  console.log(`✅ Working GIFs: ${results.working}`);
  console.log(`❌ Not Found (404): ${results.notFound}`);
  console.log(`⚠️  Errors/Timeouts: ${results.error}`);
  console.log(`\nSuccess Rate: ${(results.working / urls.length * 100).toFixed(1)}%`);
  
  // Show which exercises have errors
  if (results.error + results.notFound > 0) {
    console.log('\n=== Problematic Exercises ===');
    const batchResults = await checkUrlsBatch(urls);
    
    batchResults.forEach((result, index) => {
      if (result.status !== 200) {
        const exercise = exerciseDatabase[index];
        console.log(`ID ${exercise.id}: ${exercise.name} - Status: ${result.status}`);
      }
    });
  }
}

scanAll();