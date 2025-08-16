#!/usr/bin/env node

const exerciseDatabase = require('../src/data/exerciseDatabase.ts');
const https = require('https');

console.log('=== Checking ALL Supabase URLs ===\n');

const exercises = exerciseDatabase.default;
const results = {
  working: [],
  notFound: [],
  errors: [],
  noUrl: []
};

// Function to check URL
function checkUrl(url, exercise) {
  return new Promise((resolve) => {
    if (!url || !url.includes('http')) {
      resolve({ status: 'no-url', exercise });
      return;
    }
    
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      timeout: 5000
    };
    
    const req = https.request(options, (res) => {
      resolve({ 
        status: res.statusCode === 200 ? 'ok' : (res.statusCode === 404 ? 'not-found' : 'error'),
        code: res.statusCode,
        exercise,
        url 
      });
    });
    
    req.on('error', (err) => {
      resolve({ status: 'error', error: err.message, exercise, url });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'error', error: 'timeout', exercise, url });
    });
    
    req.end();
  });
}

// Check all exercises
async function checkAll() {
  console.log(`Checking ${exercises.length} exercises...\n`);
  
  for (let i = 0; i < exercises.length; i++) {
    const exercise = exercises[i];
    process.stdout.write(`\rChecking: ${i + 1}/${exercises.length}`);
    
    const result = await checkUrl(exercise.imageUrl, exercise);
    
    if (result.status === 'ok') {
      results.working.push(result);
    } else if (result.status === 'not-found') {
      results.notFound.push(result);
    } else if (result.status === 'no-url') {
      results.noUrl.push(result);
    } else {
      results.errors.push(result);
    }
  }
  
  console.log('\n\n=== RESULTS ===\n');
  
  console.log(`✅ Working URLs: ${results.working.length}`);
  console.log(`❌ Not Found (404): ${results.notFound.length}`);
  console.log(`⚠️  Errors: ${results.errors.length}`);
  console.log(`🚫 No URL: ${results.noUrl.length}`);
  
  if (results.notFound.length > 0) {
    console.log('\n=== NOT FOUND (404) - These exercises have thumbnails but NO GIFs ===');
    results.notFound.forEach(r => {
      console.log(`ID ${r.exercise.id}: ${r.exercise.name} (${r.exercise.englishName})`);
      console.log(`  Missing: ${r.url}`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\n=== ERRORS ===');
    results.errors.forEach(r => {
      console.log(`ID ${r.exercise.id}: ${r.exercise.name} - ${r.error || `Code: ${r.code}`}`);
    });
  }
  
  if (results.noUrl.length > 0) {
    console.log('\n=== NO URL ===');
    results.noUrl.forEach(r => {
      console.log(`ID ${r.exercise.id}: ${r.exercise.name}`);
    });
  }
  
  // Save detailed results
  const fs = require('fs');
  const path = require('path');
  const outputFile = path.join(__dirname, 'supabase-url-check-results.json');
  fs.writeFileSync(outputFile, JSON.stringify({
    summary: {
      total: exercises.length,
      working: results.working.length,
      notFound: results.notFound.length,
      errors: results.errors.length,
      noUrl: results.noUrl.length
    },
    notFound: results.notFound.map(r => ({
      id: r.exercise.id,
      name: r.exercise.name,
      englishName: r.exercise.englishName,
      url: r.url
    })),
    errors: results.errors.map(r => ({
      id: r.exercise.id,
      name: r.exercise.name,
      url: r.url,
      error: r.error || `Code: ${r.code}`
    }))
  }, null, 2));
  
  console.log(`\nDetailed results saved to: ${outputFile}`);
}

checkAll();