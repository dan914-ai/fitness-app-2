const fs = require('fs');
const path = require('path');

// Function to add tricep exercises to database
function addTricepExercises() {
  // Create backup first
  const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, `../src/data/exerciseDatabase.backup-tricep-${timestamp}.ts`);
  
  try {
    fs.copyFileSync(databasePath, backupPath);
    console.log('✅ Backup created:', backupPath);
  } catch (error) {
    console.error('❌ Failed to create backup:', error.message);
    return;
  }

  // Read the new exercises
  const newExercisesModule = require('./newTricepExercises.ts');
  const exercisesToAdd = newExercisesModule.newTricepExercises;
  
  if (!exercisesToAdd || exercisesToAdd.length === 0) {
    console.log('No exercises to add');
    return;
  }

  // Read current database
  let databaseContent = fs.readFileSync(databasePath, 'utf-8');
  
  // Find the last exercise entry
  const lastExerciseIndex = databaseContent.lastIndexOf('},');
  if (lastExerciseIndex === -1) {
    console.error('❌ Could not find last exercise in database');
    return;
  }

  // Format exercises as string
  const exercisesString = exercisesToAdd.map(ex => {
    // Convert the exercise object to string
    return JSON.stringify(ex, null, 2)
      .replace(/"([^"]+)":/g, '$1:') // Remove quotes from keys
      .replace(/"/g, "'"); // Replace double quotes with single quotes
  }).join(',\n');

  // Insert new exercises
  const beforeLastExercise = databaseContent.substring(0, lastExerciseIndex + 2);
  const afterLastExercise = databaseContent.substring(lastExerciseIndex + 2);
  
  const newContent = beforeLastExercise + ',\n' + exercisesString + afterLastExercise;
  
  // Write updated database
  fs.writeFileSync(databasePath, newContent);
  
  console.log(`✅ Successfully added ${exercisesToAdd.length} tricep exercises`);
  
  // Copy GIF files
  console.log('\nCopying GIF files...');
  const sourceDir = '/mnt/c/Users/danny/Downloads/tricep exercises';
  const destDir = path.join(__dirname, '../assets/exercise-gifs/arms');
  
  // Create arms directory if it doesn't exist
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log('✅ Created arms directory');
  }
  
  // Copy each GIF
  let copiedCount = 0;
  const tricepExercises = require('./integrateTricepExercises.ts').tricepExercises || [];
  
  for (const exercise of tricepExercises) {
    const sourcePath = path.join(sourceDir, exercise.filename);
    const destPath = path.join(destDir, exercise.filename);
    
    try {
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        copiedCount++;
        console.log(`  ✅ Copied: ${exercise.filename}`);
      } else {
        console.log(`  ⚠️  Not found: ${exercise.filename}`);
      }
    } catch (error) {
      console.log(`  ❌ Failed to copy ${exercise.filename}: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Copied ${copiedCount} GIF files`);
  console.log('\n🎉 Tricep exercises implementation complete!');
  console.log('\nNext steps:');
  console.log('1. Upload GIFs to Supabase with English IDs');
  console.log('2. Test the exercises in the app');
  console.log('3. Check tricep-supabase-upload-summary.md for upload details');
}

// Run the implementation
addTricepExercises();