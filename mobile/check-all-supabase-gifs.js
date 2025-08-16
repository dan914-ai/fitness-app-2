// Check which exercise GIFs are uploaded to Supabase
import('node-fetch').then(async ({ default: fetch }) => {
  const SUPABASE_URL = 'https://nwpyliujuimufkfjolsj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHlsaXVqdWltdWZrZmpvbHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjIzNjgsImV4cCI6MjA2OTIzODM2OH0.dWYh2ROhXN6n4scKc-gKMMPUjVXBXD2xv5l-UGqyTZA';
  
  console.log('Checking all GIFs in Supabase bucket...\n');
  
  // First, get list of all files in bucket
  let allFiles = [];
  let offset = 0;
  const limit = 100;
  
  try {
    while (true) {
      const response = await fetch(`${SUPABASE_URL}/storage/v1/object/list/exercise-gifs?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (!response.ok) {
        console.error('Error listing bucket:', response.status);
        break;
      }
      
      const files = await response.json();
      if (files.length === 0) break;
      
      allFiles = allFiles.concat(files);
      offset += limit;
      
      if (files.length < limit) break;
    }
    
    console.log(`Total files in bucket: ${allFiles.length}\n`);
    
    // Extract exercise IDs from filenames
    const uploadedExerciseIds = new Set();
    allFiles.forEach(file => {
      if (file.name.endsWith('.gif')) {
        const exerciseId = file.name.replace('.gif', '');
        uploadedExerciseIds.add(exerciseId);
      }
    });
    
    // Load exercise database to compare
    const fs = await import('fs');
    const dbPath = './src/data/exerciseDatabase.ts';
    const dbContent = fs.readFileSync(dbPath, 'utf-8');
    
    // Extract exercise IDs from database
    const exerciseIds = [];
    const idRegex = /id:\s*['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = idRegex.exec(dbContent)) !== null) {
      exerciseIds.push(match[1]);
    }
    
    // Also check for exercises with GIF URLs
    const exercisesWithGifs = [];
    const exerciseRegex = /\{[\s\S]*?id:\s*['"]([^'"]+)['"][\s\S]*?gifUrl:\s*['"]([^'"]+)['"][\s\S]*?\}/g;
    
    dbContent.replace(exerciseRegex, (fullMatch, id, gifUrl) => {
      if (!fullMatch.includes('gifUnavailable: true')) {
        exercisesWithGifs.push(id);
      }
      return fullMatch;
    });
    
    console.log(`Total exercises in database: ${exerciseIds.length}`);
    console.log(`Exercises with GIF URLs: ${exercisesWithGifs.length}`);
    console.log(`GIFs uploaded to Supabase: ${uploadedExerciseIds.size}\n`);
    
    // Find missing GIFs
    const missingGifs = exercisesWithGifs.filter(id => {
      // Check both with hyphens and underscores
      const withHyphens = uploadedExerciseIds.has(id);
      const withUnderscores = uploadedExerciseIds.has(id.replace(/-/g, '_'));
      return !withHyphens && !withUnderscores;
    });
    
    console.log(`Missing GIFs: ${missingGifs.length}`);
    if (missingGifs.length > 0) {
      console.log('\nFirst 20 missing exercises:');
      missingGifs.slice(0, 20).forEach(id => {
        console.log(`  - ${id}`);
      });
      if (missingGifs.length > 20) {
        console.log(`  ... and ${missingGifs.length - 20} more`);
      }
    }
    
    // Show sample of uploaded files
    console.log('\nSample of uploaded GIFs:');
    const sampleFiles = allFiles.slice(0, 10);
    sampleFiles.forEach(file => {
      console.log(`  - ${file.name} (${(file.metadata?.size / 1024).toFixed(1)} KB)`);
    });
    
    // Calculate coverage percentage
    const coverage = ((exercisesWithGifs.length - missingGifs.length) / exercisesWithGifs.length * 100).toFixed(1);
    console.log(`\nCoverage: ${coverage}% of exercises with GIFs have been uploaded to Supabase`);
    
  } catch (error) {
    console.error('Error:', error);
  }
});