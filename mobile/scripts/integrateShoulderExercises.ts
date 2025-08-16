import * as fs from 'fs';
import * as path from 'path';
import { newShoulderExercises } from '../src/data/newShoulderExercises';

async function integrateShoulderExercises() {
  const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
  const originalContent = fs.readFileSync(databasePath, 'utf8');
  
  // Find the closing bracket of the main exercise array
  const closingBracketIndex = originalContent.lastIndexOf('];');
  
  if (closingBracketIndex === -1) {
    throw new Error('Could not find closing bracket of exercise array');
  }
  
  // Convert new shoulder exercises to string format matching the existing database
  const newExercisesString = newShoulderExercises.map(exercise => {
    return `  {
    id: '${exercise.id}',
    name: {
      english: '${exercise.name.english}',
      korean: '${exercise.name.korean}',
      romanization: '${exercise.name.romanization}'
    },
    description: {
      english: '${exercise.description.english.replace(/'/g, "\\'")}',
      korean: '${exercise.description.korean.replace(/'/g, "\\'")}'
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
        ${exercise.instructions.english.map(i => `'${i.replace(/'/g, "\\'")}'`).join(',\n        ')}
      ],
      korean: [
        ${exercise.instructions.korean.map(i => `'${i.replace(/'/g, "\\'")}'`).join(',\n        ')}
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
        ${exercise.tips.english.map(t => `'${t.replace(/'/g, "\\'")}'`).join(',\n        ')}
      ],
      korean: [
        ${exercise.tips.korean.map(t => `'${t.replace(/'/g, "\\'")}'`).join(',\n        ')}
      ]
    },
    commonMistakes: {
      english: [
        ${exercise.commonMistakes.english.map(m => `'${m.replace(/'/g, "\\'")}'`).join(',\n        ')}
      ],
      korean: [
        ${exercise.commonMistakes.korean.map(m => `'${m.replace(/'/g, "\\'")}'`).join(',\n        ')}
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
  
  console.log(`✅ Successfully integrated ${newShoulderExercises.length} new shoulder exercises into the database`);
  console.log(`📁 Updated: ${databasePath}`);
  
  // Create backup of the current version
  const backupPath = databasePath.replace('.ts', '.shoulder-backup.ts');
  fs.writeFileSync(backupPath, originalContent);
  console.log(`💾 Backup created: ${backupPath}`);
  
  // Summary of what was added
  console.log(`\n📋 Added shoulder exercises:`);
  newShoulderExercises.forEach((exercise, index) => {
    console.log(`${index + 1}. ${exercise.name.korean} (${exercise.name.english})`);
  });
  
  console.log(`\n🏷️  Exercise categories:`);
  const categories = newShoulderExercises.reduce((acc, ex) => {
    acc[ex.category] = (acc[ex.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log(categories);
  
  console.log(`\n⚖️  Difficulty levels:`);
  const difficulties = newShoulderExercises.reduce((acc, ex) => {
    acc[ex.difficulty] = (acc[ex.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log(difficulties);
}

// Run the integration
integrateShoulderExercises().catch(console.error);