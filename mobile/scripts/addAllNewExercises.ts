const fs = require('fs');
const path = require('path');

// Import all new exercise data
const { newTrapsRearDeltsExercises } = require('./newTrapsRearDeltsExercises.ts');
const { newTricepExercises } = require('./newTricepExercises.ts');
const { newCalfExercises } = require('./newCalfExercises.ts');
const { newCardioExercises } = require('./newCardioExercises.ts');
const { newBicepExercises } = require('./newBicepExercises.ts');
const { newLegsExercises } = require('./newLegsExercises.ts');
const { newGlutesExercises } = require('./newGlutesExercises.ts');

function addAllNewExercises() {
  const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
  
  // Create backup
  const backupPath = databasePath.replace('.ts', `.backup-all-new-${new Date().toISOString().replace(/:/g, '-')}.ts`);
  fs.copyFileSync(databasePath, backupPath);
  console.log(`✅ Backup created: ${backupPath}`);
  
  // Read current database
  let databaseContent = fs.readFileSync(databasePath, 'utf8');
  
  // Combine all new exercises
  const allNewExercises = [
    ...newTrapsRearDeltsExercises,
    ...newTricepExercises,
    ...newCalfExercises,
    ...newCardioExercises,
    ...newBicepExercises,
    ...newLegsExercises,
    ...newGlutesExercises
  ];
  
  console.log(`\nAdding ${allNewExercises.length} new exercises to database...`);
  
  // Find the closing bracket of exercises array
  const exercisesEndIndex = databaseContent.lastIndexOf('];');
  
  if (exercisesEndIndex === -1) {
    console.error('❌ Could not find exercises array closing bracket');
    return;
  }
  
  // Format new exercises
  const newExercisesString = allNewExercises.map(exercise => {
    return `  {
    id: '${exercise.id}',
    name: {
      korean: '${exercise.name.korean}'
    },
    category: '${exercise.category}',
    equipment: [${exercise.equipment.map(e => `'${e}'`).join(', ')}],
    targetMuscles: [${exercise.targetMuscles.map(m => `'${m}'`).join(', ')}],
    difficulty: '${exercise.difficulty}',
    instructions: [
${exercise.instructions.map(i => `      '${i}'`).join(',\n')}
    ],
    tips: [
${exercise.tips.map(t => `      '${t}'`).join(',\n')}
    ],
    commonMistakes: [
${exercise.commonMistakes.map(m => `      '${m}'`).join(',\n')}
    ],
    breathingPattern: '${exercise.breathingPattern}',
    media: {
      gifUrl: '${exercise.media.gifUrl}',
      supabaseGifUrl: '${exercise.media.supabaseGifUrl}'
    }
  }`;
  }).join(',\n');
  
  // Insert new exercises before the closing bracket
  const updatedContent = 
    databaseContent.slice(0, exercisesEndIndex) +
    ',\n' +
    newExercisesString +
    '\n' +
    databaseContent.slice(exercisesEndIndex);
  
  // Write updated database
  fs.writeFileSync(databasePath, updatedContent, 'utf8');
  
  console.log(`\n✅ Successfully added ${allNewExercises.length} exercises to database!`);
  
  // Create summary report
  const categories = {
    'Traps & Rear Delts': newTrapsRearDeltsExercises.length,
    'Tricep': newTricepExercises.length,
    'Calf': newCalfExercises.length,
    'Cardio': newCardioExercises.length,
    'Bicep': newBicepExercises.length,
    'Legs': newLegsExercises.length,
    'Glutes': newGlutesExercises.length
  };
  
  console.log('\nExercises added by category:');
  Object.entries(categories).forEach(([category, count]) => {
    console.log(`- ${category}: ${count} exercises`);
  });
  
  console.log(`\nTotal: ${allNewExercises.length} exercises`);
  console.log('\nNext step: Upload all GIFs to Supabase using the upload summaries');
}

// Run the script
try {
  addAllNewExercises();
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}