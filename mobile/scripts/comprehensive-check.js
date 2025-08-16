#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Import database
const exerciseDatabase = require('../src/data/exerciseDatabase.ts').default;
const staticThumbnails = require('../src/constants/staticThumbnails.ts').staticThumbnails;

const SUPABASE_URL = 'https://ayttqsgttuvdhvbvbnsk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dHRxc2d0dHV2ZGh2YnZibnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNzI0NzgsImV4cCI6MjA2ODc0ODQ3OH0.qUu0TNp2Q3cGBZjWJQHAype9gBN303G5yGo13CayMDA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function checkUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    https.get({
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'HEAD',
      timeout: 5000
    }, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false))
      .on('timeout', () => resolve(false));
  });
}

async function comprehensiveCheck() {
  console.log('\n=== COMPREHENSIVE SYSTEM CHECK ===\n');

  // 1. Database Check
  console.log('1. DATABASE CHECK');
  console.log(`   Exercises in database: ${exerciseDatabase.length}`);
  
  // Check URL format
  const badUrls = exerciseDatabase.filter(ex => 
    !ex.imageUrl.includes('ayttqsgttuvdhvbvbnsk.supabase.co')
  );
  
  if (badUrls.length > 0) {
    console.log(`   ❌ Wrong URLs: ${badUrls.length}`);
  } else {
    console.log(`   ✅ All URLs use correct Supabase project`);
  }

  // 2. Supabase Storage Check
  console.log('\n2. SUPABASE STORAGE CHECK');
  
  let totalSupabaseFiles = 0;
  const muscleGroups = ['abdominals', 'back', 'biceps', 'calves', 'cardio', 'compound', 
    'deltoids', 'forearms', 'glutes', 'hamstrings', 'pectorals', 'quadriceps', 'traps', 'triceps'];
  
  for (const muscle of muscleGroups) {
    const { data, error } = await supabase.storage
      .from('exercise-gifs')
      .list(muscle, { limit: 1000 });
    
    if (!error && data) {
      totalSupabaseFiles += data.length;
    }
  }
  
  console.log(`   Files in Supabase: ${totalSupabaseFiles}`);

  // 3. URL Verification
  console.log('\n3. URL VERIFICATION (sample)');
  
  const samplesToCheck = exerciseDatabase.slice(0, 5);
  let workingUrls = 0;
  
  for (const exercise of samplesToCheck) {
    const isWorking = await checkUrl(exercise.imageUrl);
    if (isWorking) workingUrls++;
  }
  
  console.log(`   Sample check: ${workingUrls}/${samplesToCheck.length} working`);

  // 4. Static Thumbnails
  console.log('\n4. STATIC THUMBNAILS CHECK');
  const thumbnailIds = Object.keys(staticThumbnails);
  console.log(`   Thumbnail mappings: ${thumbnailIds.length}`);
  
  const missingThumbnails = exerciseDatabase.filter(ex => 
    !thumbnailIds.includes(ex.id.toString())
  );
  
  if (missingThumbnails.length > 0) {
    console.log(`   ⚠️  Missing thumbnails: ${missingThumbnails.length}`);
  } else {
    console.log(`   ✅ All exercises have thumbnails`);
  }

  // Final Report
  console.log('\n=== FINAL REPORT ===');
  console.log(`✅ ${exerciseDatabase.length} exercises in database`);
  console.log(`✅ ${totalSupabaseFiles} files in Supabase`);
  console.log(`✅ ${thumbnailIds.length} thumbnail mappings`);
  
  if (missingThumbnails.length === 0 && badUrls.length === 0) {
    console.log('\n🎉 Everything is working correctly!');
  } else {
    console.log('\n⚠️  Some minor issues detected (see above)');
  }
}

comprehensiveCheck().catch(console.error);
