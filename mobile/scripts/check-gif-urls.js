#!/usr/bin/env node

const exerciseDatabase = require('../src/data/exerciseDatabase.ts');
const https = require('https');

console.log('=== Checking GIF URL Accessibility ===\n');

// Sample 20 random exercises
const exercises = exerciseDatabase.default;
const sampleSize = 20;
const sampled = [];

// Get random sample
for (let i = 0; i < sampleSize && i < exercises.length; i++) {
  const randomIndex = Math.floor(Math.random() * exercises.length);
  sampled.push(exercises[randomIndex]);
}

let workingCount = 0;
let notFoundCount = 0;
let checkedCount = 0;

// Function to check URL
function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url || !url.includes('http')) {
      resolve({ status: 'invalid', url });
      return;
    }
    
    https.get(url, (res) => {
      resolve({ 
        status: res.statusCode === 200 ? 'ok' : 'error',
        code: res.statusCode,
        url 
      });
    }).on('error', (err) => {
      resolve({ status: 'error', error: err.message, url });
    });
  });
}

// Check each sampled exercise
async function checkAll() {
  for (const exercise of sampled) {
    const result = await checkUrl(exercise.imageUrl);
    checkedCount++;
    
    if (result.status === 'ok') {
      workingCount++;
      console.log(`✅ ${exercise.name}: OK`);
    } else if (result.code === 404) {
      notFoundCount++;
      console.log(`❌ ${exercise.name}: NOT FOUND`);
      console.log(`   URL: ${result.url}`);
    } else {
      console.log(`⚠️  ${exercise.name}: ${result.status} (${result.code || result.error})`);
    }
  }
  
  console.log('\n=== Summary ===');
  console.log(`Checked: ${checkedCount}`);
  console.log(`Working: ${workingCount}`);
  console.log(`Not Found: ${notFoundCount}`);
  console.log(`Success Rate: ${(workingCount / checkedCount * 100).toFixed(1)}%`);
  
  if (notFoundCount > 0) {
    console.log('\n⚠️  Some GIFs are missing from Supabase!');
    console.log('These exercises may not display animations correctly.');
  }
}

checkAll();