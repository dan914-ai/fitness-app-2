#!/usr/bin/env node
/**
 * Test thumbnail generation with first 5 exercises
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch').default;

// Directly read the database file
const EXERCISE_DATABASE = require('../src/data/exerciseDatabase.ts');

const THUMBNAILS_DIR = path.join(__dirname, '../assets/thumbnails');

async function testDownload() {
  // Ensure directory exists
  if (!fs.existsSync(THUMBNAILS_DIR)) {
    fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
  }

  const first5Exercises = EXERCISE_DATABASE.slice(0, 5);
  
  console.log('Testing thumbnail download with first 5 exercises:');
  
  for (const exercise of first5Exercises) {
    console.log(`\nTesting exercise ${exercise.id}: ${exercise.name}`);
    console.log(`Image URL: ${exercise.imageUrl}`);
    
    if (exercise.imageUrl) {
      try {
        const response = await fetch(exercise.imageUrl);
        if (response.ok) {
          const buffer = await response.buffer();
          const outputPath = path.join(THUMBNAILS_DIR, `${exercise.id}.gif`);
          fs.writeFileSync(outputPath, buffer);
          console.log(`✅ Downloaded: ${buffer.length} bytes -> ${outputPath}`);
        } else {
          console.log(`❌ Failed: HTTP ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    } else {
      console.log('⚠️  No imageUrl');
    }
  }
  
  console.log('\n🎉 Test complete!');
}

testDownload().catch(console.error);