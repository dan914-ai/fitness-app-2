const fs = require('fs');
const path = require('path');

const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');

// Read the database file
let databaseContent = fs.readFileSync(databasePath, 'utf-8');

// Backup the original
const backupPath = path.join(__dirname, '../src/data/exerciseDatabase.backup-before-format-fix.ts');
fs.writeFileSync(backupPath, databaseContent);
console.log('Created backup at:', backupPath);

// Function to check if an exercise needs fixing
function needsFormatFix(exerciseText) {
  // Check if it has direct gifUrl or supabaseGifUrl (not inside media object)
  const hasDirectGifUrl = /^\s*gifUrl:/m.test(exerciseText);
  const hasDirectSupabaseGifUrl = /^\s*supabaseGifUrl:/m.test(exerciseText);
  
  // Check if it's missing tips or commonMistakes
  const hasTips = /tips:\s*{/m.test(exerciseText);
  const hasCommonMistakes = /commonMistakes:\s*{/m.test(exerciseText);
  const hasMedia = /media:\s*{/m.test(exerciseText);
  
  return (hasDirectGifUrl || hasDirectSupabaseGifUrl) || (!hasTips || !hasCommonMistakes || !hasMedia);
}

// Function to fix an exercise entry
function fixExerciseFormat(exerciseText) {
  let fixed = exerciseText;
  
  // Extract gifUrl and supabaseGifUrl if they exist
  const gifUrlMatch = exerciseText.match(/^\s*gifUrl:\s*['"`]([^'"`]+)['"`],?\s*$/m);
  const supabaseGifUrlMatch = exerciseText.match(/^\s*supabaseGifUrl:\s*['"`]([^'"`]+)['"`],?\s*$/m);
  
  if (gifUrlMatch || supabaseGifUrlMatch) {
    // Remove direct gifUrl and supabaseGifUrl lines
    fixed = fixed.replace(/^\s*gifUrl:.*$/m, '');
    fixed = fixed.replace(/^\s*supabaseGifUrl:.*$/m, '');
    
    // Clean up any double commas or trailing commas
    fixed = fixed.replace(/,\s*,/g, ',');
    fixed = fixed.replace(/,\s*}/g, '}');
  }
  
  // Check if it has media object
  if (!fixed.includes('media:')) {
    // Find where to insert media (after reps)
    const repsMatch = fixed.match(/(\s*reps:\s*{[^}]+})(,?)\s*$/m);
    if (repsMatch) {
      const mediaObject = gifUrlMatch || supabaseGifUrlMatch ? `,
    media: {
      gifUrl: '${gifUrlMatch ? gifUrlMatch[1] : './assets/exercise-gifs/placeholder.gif'}',
      supabaseGifUrl: '${supabaseGifUrlMatch ? supabaseGifUrlMatch[1] : 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/placeholder.gif'}'
    }` : '';
      
      fixed = fixed.replace(repsMatch[0], repsMatch[0] + mediaObject);
    }
  }
  
  // Add tips if missing
  if (!fixed.includes('tips:')) {
    // Find where to insert tips (after reps or media)
    const insertAfter = fixed.includes('media:') ? /(\s*media:\s*{[^}]+})(,?)\s*$/m : /(\s*reps:\s*{[^}]+})(,?)\s*$/m;
    const insertMatch = fixed.match(insertAfter);
    if (insertMatch) {
      const tipsObject = `,
    tips: {
      english: [
        'Maintain proper form throughout the movement',
        'Control the weight on both phases',
        'Focus on target muscle engagement'
      ],
      korean: [
        '전체 동작 중 올바른 자세를 유지하세요',
        '양 구간에서 중량을 제어하세요',
        '목표 근육 참여에 집중하세요'
      ]
    }`;
      fixed = fixed.replace(insertMatch[0], insertMatch[0] + tipsObject);
    }
  }
  
  // Add commonMistakes if missing
  if (!fixed.includes('commonMistakes:')) {
    // Find where to insert (after tips)
    const insertAfter = fixed.includes('tips:') ? /(\s*tips:\s*{[^}]+})(,?)\s*$/m : /(\s*media:\s*{[^}]+})(,?)\s*$/m;
    const insertMatch = fixed.match(insertAfter);
    if (insertMatch) {
      const mistakesObject = `,
    commonMistakes: {
      english: [
        'Using too much weight',
        'Rushing through the movement',
        'Poor breathing technique'
      ],
      korean: [
        '너무 무거운 중량 사용',
        '동작을 서두르기',
        '잘못된 호흡 기법'
      ]
    }`;
      fixed = fixed.replace(insertMatch[0], insertMatch[0] + mistakesObject);
    }
  }
  
  return fixed;
}

// Process the database
let fixedCount = 0;
let processedCount = 0;

// Find all exercise objects
const exercisePattern = /(\s*{\s*\n\s*id:\s*['"`][^'"`]+['"`][\s\S]*?^\s*})/gm;
const exercises = databaseContent.match(exercisePattern);

if (exercises) {
  console.log(`Found ${exercises.length} exercises to check`);
  
  exercises.forEach((exercise, index) => {
    processedCount++;
    if (needsFormatFix(exercise)) {
      const fixed = fixExerciseFormat(exercise);
      databaseContent = databaseContent.replace(exercise, fixed);
      fixedCount++;
      
      if (fixedCount % 10 === 0) {
        console.log(`Fixed ${fixedCount} exercises...`);
      }
    }
  });
}

// Write the fixed database
fs.writeFileSync(databasePath, databaseContent);

console.log(`\nFormat fix complete!`);
console.log(`Total exercises processed: ${processedCount}`);
console.log(`Exercises fixed: ${fixedCount}`);
console.log(`Database updated successfully`);

// Create a summary report
const report = `# Exercise Format Fix Report

## Summary
- Total exercises processed: ${processedCount}
- Exercises fixed: ${fixedCount}
- Backup created: ${backupPath}

## Changes Made
1. Moved direct gifUrl and supabaseGifUrl into media object
2. Added missing tips field with default values
3. Added missing commonMistakes field with default values
4. Ensured all exercises follow the ExerciseData interface structure

## Next Steps
1. Test the app to ensure exercises display correctly
2. Upload GIF files to Supabase storage
3. Update any exercises with placeholder values as needed
`;

fs.writeFileSync(path.join(__dirname, 'format-fix-report.md'), report);
console.log('\nCreated format-fix-report.md with details');