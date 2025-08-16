import * as fs from 'fs';
import * as path from 'path';
import { newBackExercises } from '../src/data/newBackExercises';

async function integrateBackExercises() {
  const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
  const originalContent = fs.readFileSync(databasePath, 'utf8');
  
  const closingBracketIndex = originalContent.lastIndexOf('];');
  
  if (closingBracketIndex === -1) {
    throw new Error('Could not find closing bracket of exercise array');
  }
  
  // Convert to database format
  const newExercisesString = newBackExercises.map(exercise => {
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
  
  // Insert new exercises
  const beforeClosing = originalContent.substring(0, closingBracketIndex);
  const afterClosing = originalContent.substring(closingBracketIndex);
  
  const updatedContent = beforeClosing + ',\n\n' + newExercisesString + '\n' + afterClosing;
  
  fs.writeFileSync(databasePath, updatedContent);
  
  console.log(`✅ Successfully integrated ${newBackExercises.length} new back exercises`);
  console.log(`📁 Updated: ${databasePath}`);
  
  // List added exercises
  console.log(`\n📋 Added back exercises:`);
  newBackExercises.forEach((ex, i) => {
    console.log(`${i + 1}. ${ex.name.korean} (${ex.name.english})`);
  });
}

integrateBackExercises().catch(console.error);