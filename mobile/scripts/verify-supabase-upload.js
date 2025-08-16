#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ayttqsgttuvdhvbvbnsk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dHRxc2d0dHV2ZGh2YnZibnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNzI0NzgsImV4cCI6MjA2ODc0ODQ3OH0.qUu0TNp2Q3cGBZjWJQHAype9gBN303G5yGo13CayMDA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET_NAME = 'exercise-gifs';

async function verifyUpload() {
  console.log('=== VERIFYING SUPABASE UPLOAD ===\n');
  
  // Get all local GIFs
  const gifsDir = path.join(__dirname, '..', 'assets', 'exercise-gifs');
  const localGifs = [];
  
  const muscleGroups = fs.readdirSync(gifsDir).filter(f => 
    fs.statSync(path.join(gifsDir, f)).isDirectory() && f !== 'matched'
  );
  
  for (const muscleGroup of muscleGroups) {
    const groupDir = path.join(gifsDir, muscleGroup);
    const gifs = fs.readdirSync(groupDir).filter(f => f.endsWith('.gif'));
    gifs.forEach(gif => {
      localGifs.push(`${muscleGroup}/${gif}`);
    });
  }
  
  console.log(`Local GIFs: ${localGifs.length} files`);
  
  // Get all Supabase GIFs
  const supabaseGifs = [];
  for (const muscleGroup of muscleGroups) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(muscleGroup, { limit: 1000 });
    
    if (!error && data) {
      data.forEach(file => {
        supabaseGifs.push(`${muscleGroup}/${file.name}`);
      });
    }
  }
  
  console.log(`Supabase GIFs: ${supabaseGifs.length} files\n`);
  
  // Find missing files
  const localSet = new Set(localGifs);
  const supabaseSet = new Set(supabaseGifs);
  
  const missing = [];
  for (const file of localGifs) {
    if (!supabaseSet.has(file)) {
      missing.push(file);
    }
  }
  
  if (missing.length > 0) {
    console.log('❌ MISSING FROM SUPABASE:');
    missing.forEach(file => {
      const filePath = path.join(gifsDir, file);
      const stats = fs.statSync(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`  - ${file} (${sizeMB} MB)`);
    });
  } else {
    console.log('✅ All local files are in Supabase!');
  }
  
  // Summary by muscle group
  console.log('\n=== SUPABASE CONTENT BY MUSCLE GROUP ===');
  const counts = {};
  supabaseGifs.forEach(file => {
    const muscle = file.split('/')[0];
    counts[muscle] = (counts[muscle] || 0) + 1;
  });
  
  Object.entries(counts).sort().forEach(([muscle, count]) => {
    const localCount = localGifs.filter(f => f.startsWith(muscle + '/')).length;
    const status = count === localCount ? '✅' : `⚠️  (local: ${localCount})`;
    console.log(`  ${muscle}: ${count} files ${status}`);
  });
  
  console.log('\n=== SUMMARY ===');
  console.log(`✅ Successfully uploaded: ${supabaseGifs.length}/${localGifs.length}`);
  if (missing.length > 0) {
    console.log(`❌ Failed/Missing: ${missing.length} files`);
    console.log('\nNote: Files over 10MB cannot be uploaded to Supabase Free tier');
  }
}

verifyUpload().catch(console.error);