#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const exerciseDatabase = require('../src/data/exerciseDatabase.ts').default;

console.log('=== CHECKING GIF FILE SIZES ===\n');

// Get actual file size with full download
function getFileSize(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let size = 0;
      
      res.on('data', chunk => {
        size += chunk.length;
      });
      
      res.on('end', () => {
        resolve({
          url,
          size,
          status: res.statusCode,
          contentLength: res.headers['content-length'] ? parseInt(res.headers['content-length']) : null
        });
      });
      
      res.on('error', () => {
        resolve({ url, size: 0, status: 'error' });
      });
    }).on('error', () => {
      resolve({ url, size: 0, status: 'error' });
    });
  });
}

// Check files in batches
async function checkAllSizes() {
  const results = [];
  const batchSize = 5; // Smaller batches for full downloads
  
  console.log(`Downloading and checking ${exerciseDatabase.length} GIFs...\n`);
  console.log('This will take a few minutes as we need to download each file to check its actual size.\n');
  
  for (let i = 0; i < exerciseDatabase.length; i += batchSize) {
    const batch = exerciseDatabase.slice(i, Math.min(i + batchSize, exerciseDatabase.length));
    process.stdout.write(`\rProgress: ${Math.min(i + batchSize, exerciseDatabase.length)}/${exerciseDatabase.length}`);
    
    const batchResults = await Promise.all(
      batch.map(async (ex) => {
        const sizeInfo = await getFileSize(ex.imageUrl);
        return {
          id: ex.id,
          name: ex.name,
          englishName: ex.englishName,
          url: ex.imageUrl,
          size: sizeInfo.size,
          status: sizeInfo.status,
          contentLength: sizeInfo.contentLength
        };
      })
    );
    
    results.push(...batchResults);
  }
  
  console.log('\n\n=== ANALYSIS ===\n');
  
  // Categorize by size
  const tooSmall = results.filter(r => r.size > 0 && r.size < 10000); // Less than 10KB
  const small = results.filter(r => r.size >= 10000 && r.size < 100000); // 10KB - 100KB
  const normal = results.filter(r => r.size >= 100000 && r.size < 5000000); // 100KB - 5MB
  const large = results.filter(r => r.size >= 5000000); // Over 5MB
  const failed = results.filter(r => r.size === 0 || r.status !== 200);
  
  console.log(`📊 Size Distribution:`);
  console.log(`  ❌ Too Small (<10KB): ${tooSmall.length}`);
  console.log(`  ⚠️  Small (10-100KB): ${small.length}`);
  console.log(`  ✅ Normal (100KB-5MB): ${normal.length}`);
  console.log(`  📦 Large (>5MB): ${large.length}`);
  console.log(`  🚫 Failed/Error: ${failed.length}`);
  
  if (tooSmall.length > 0) {
    console.log('\n=== CORRUPTED GIFs (Too Small) ===\n');
    tooSmall.forEach(gif => {
      console.log(`ID ${gif.id}: ${gif.name} (${gif.englishName})`);
      console.log(`  Size: ${gif.size} bytes (${(gif.size / 1024).toFixed(1)} KB)`);
      console.log(`  URL: ${gif.url}`);
    });
  }
  
  if (small.length > 0) {
    console.log('\n=== SUSPICIOUS GIFs (Small) ===\n');
    console.log('These might be corrupted or just very short animations:\n');
    small.slice(0, 10).forEach(gif => {
      console.log(`ID ${gif.id}: ${gif.name} - ${(gif.size / 1024).toFixed(1)} KB`);
    });
    if (small.length > 10) {
      console.log(`... and ${small.length - 10} more`);
    }
  }
  
  // Save detailed results
  const output = {
    summary: {
      total: results.length,
      tooSmall: tooSmall.length,
      small: small.length,
      normal: normal.length,
      large: large.length,
      failed: failed.length
    },
    corrupted: tooSmall,
    suspicious: small.map(g => ({
      id: g.id,
      name: g.name,
      englishName: g.englishName,
      sizeKB: (g.size / 1024).toFixed(1)
    }))
  };
  
  const outputPath = path.join(__dirname, 'gif-size-analysis.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n📁 Full analysis saved to: gif-size-analysis.json`);
  
  return tooSmall;
}

checkAllSizes().catch(console.error);