import * as fs from 'fs';
import * as path from 'path';
import { newExercises } from '../src/data/newExercises';

async function integrateNewExercises() {
  const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
  const originalContent = fs.readFileSync(databasePath, 'utf8');
  
  // Find the closing bracket of the main exercise array
  const closingBracketIndex = originalContent.lastIndexOf('];');
  
  if (closingBracketIndex === -1) {
    throw new Error('Could not find closing bracket of exercise array');
  }
  
  // Convert new exercises to string format matching the existing database
  const newExercisesString = newExercises.map(exercise => {
    return `  {
    id: '${exercise.id}',
    name: {
      english: '${exercise.name.english}',
      korean: '${exercise.name.korean}',
      romanization: '${exercise.name.romanization}'
    },
    description: {
      english: '${exercise.description.english}',
      korean: '${exercise.description.korean}'
    },
    targetMuscles: {
      primary: [${exercise.targetMuscles.primary.map(m => `'${m}'`).join(', ')}],
      secondary: [${exercise.targetMuscles.secondary.map(m => `'${m}'`).join(', ')}],
      stabilizers: [${exercise.targetMuscles.stabilizers.map(m => `'${m}'`).join(', ')}]
    },
    equipment: [${exercise.equipment.map(e => `'${e}'`).join(', ')}],
    category: '${exercise.category}',
    bodyParts: [${exercise.bodyParts.map(bp => `'${bp}'`).join(', ')}],
    difficulty: '${exercise.difficulty}',
    instructions: {
      english: [
        ${exercise.instructions.english.map(i => `'${i}'`).join(',\n        ')}
      ],
      korean: [
        ${exercise.instructions.korean.map(i => `'${i}'`).join(',\n        ')}
      ]
    },
    sets: {
      recommended: '${exercise.sets.recommended}',
      beginner: '${exercise.sets.beginner}',
      intermediate: '${exercise.sets.intermediate}',
      advanced: '${exercise.sets.advanced}'
    },
    reps: {
      recommended: '${exercise.reps.recommended}',
      beginner: '${exercise.reps.beginner}',
      intermediate: '${exercise.reps.intermediate}',
      advanced: '${exercise.reps.advanced}'
    },
    media: {
      gifUrl: '${exercise.media.gifUrl}',
      supabaseGifUrl: '${exercise.media.supabaseGifUrl}'
    },
    tags: [${exercise.tags.map(t => `'${t}'`).join(', ')}],
    tips: {
      english: [
        ${exercise.tips.english.map(t => `'${t}'`).join(',\n        ')}
      ],
      korean: [
        ${exercise.tips.korean.map(t => `'${t}'`).join(',\n        ')}
      ]
    },
    commonMistakes: {
      english: [
        ${exercise.commonMistakes.english.map(m => `'${m}'`).join(',\n        ')}
      ],
      korean: [
        ${exercise.commonMistakes.korean.map(m => `'${m}'`).join(',\n        ')}
      ]
    },
    alternatives: [${exercise.alternatives.map(a => `'${a}'`).join(', ')}]
  }`;
  }).join(',\n\n');
  
  // Insert new exercises before the closing bracket
  const beforeClosing = originalContent.substring(0, closingBracketIndex);
  const afterClosing = originalContent.substring(closingBracketIndex);
  
  const updatedContent = beforeClosing + ',\n\n' + newExercisesString + '\n' + afterClosing;
  
  // Write the updated content back to the file
  fs.writeFileSync(databasePath, updatedContent);
  
  console.log(`✅ Successfully integrated ${newExercises.length} new exercises into the database`);
  console.log(`📁 Updated: ${databasePath}`);
  
  // Create backup of the original
  const backupPath = databasePath.replace('.ts', '.backup.ts');
  fs.writeFileSync(backupPath, originalContent);
  console.log(`💾 Backup created: ${backupPath}`);
  
  // Update mock routines to use some of the new exercises
  updateMockRoutines();
}

function updateMockRoutines() {
  const routinesPath = path.join(__dirname, '../src/data/mockRoutines.ts');
  const routinesContent = fs.readFileSync(routinesPath, 'utf8');
  
  console.log('📝 Consider updating mock routines to include new exercises');
  console.log('   Some recommended additions:');
  console.log('   - barbell_bench_press (already updated)');
  console.log('   - dumbbell-bicep-curl');
  console.log('   - barbell_squat');
  console.log('   - hammer-curls');
  console.log('   - arnold-press');
}

// Run the integration
integrateNewExercises().catch(console.error);