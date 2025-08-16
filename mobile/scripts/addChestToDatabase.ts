const fs = require('fs');
const path = require('path');

const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
const newExercisesPath = path.join(__dirname, 'newChestExercises.ts');

// Read the database
let databaseContent = fs.readFileSync(databasePath, 'utf-8');

// Read new exercises file
const newExercisesContent = fs.readFileSync(newExercisesPath, 'utf-8');

// Extract the exercises array content
const exercisesMatch = newExercisesContent.match(/export const newChestExercises = \[([\s\S]+?)\];/);
if (!exercisesMatch) {
  console.error('Could not find exercises array in new exercises file');
  process.exit(1);
}

const newExercisesArray = exercisesMatch[1].trim();

// Find the exercises array closing bracket in database
const exercisesArrayEnd = databaseContent.lastIndexOf('];');
if (exercisesArrayEnd === -1) {
  console.error('Could not find exercises array in database');
  process.exit(1);
}

// Insert new exercises before the closing bracket
const beforeArray = databaseContent.substring(0, exercisesArrayEnd);
const afterArray = databaseContent.substring(exercisesArrayEnd);

// Add comma if needed
const needsComma = beforeArray.trim().endsWith('}');
const insertion = (needsComma ? ',\n' : '') + newExercisesArray;

databaseContent = beforeArray + insertion + afterArray;

// Write back to database
fs.writeFileSync(databasePath, databaseContent);

console.log('Successfully added chest exercises to database');

// Now update existing exercises with GIFs
const updatesMatch = newExercisesContent.match(/export const exercisesToUpdate = \[([\s\S]+?)\];/);
if (updatesMatch) {
  const updates = eval('[' + updatesMatch[1] + ']');
  console.log(`Updating ${updates.length} existing exercises with GIF URLs`);
  
  for (const update of updates) {
    // Find the exercise by ID and update its GIF URL
    const idPattern = new RegExp(`id:\\s*['"]${update.id}['"]`, 'g');
    const matches = [...databaseContent.matchAll(idPattern)];
    
    if (matches.length > 0) {
      for (const match of matches) {
        // Find the exercise object boundaries
        const startIndex = databaseContent.lastIndexOf('{', match.index);
        let braceCount = 0;
        let endIndex = startIndex;
        
        for (let i = startIndex; i < databaseContent.length; i++) {
          if (databaseContent[i] === '{') braceCount++;
          if (databaseContent[i] === '}') braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
        
        const exerciseObject = databaseContent.substring(startIndex, endIndex + 1);
        
        // Check if it already has a supabaseGifUrl
        if (!exerciseObject.includes('supabaseGifUrl')) {
          // Add the GIF URLs
          const updatedObject = exerciseObject.replace(
            /(\s*)(})$/,
            `,\n    gifUrl: './assets/exercise-gifs/chest/${update.gifFile}',\n    supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/${update.id}.gif'$1$2`
          );
          
          databaseContent = databaseContent.substring(0, startIndex) + updatedObject + databaseContent.substring(endIndex + 1);
          console.log(`Updated ${update.id} with GIF URL`);
        }
      }
    }
  }
  
  // Write updated database
  fs.writeFileSync(databasePath, databaseContent);
  console.log('Successfully updated existing exercises with GIF URLs');
}