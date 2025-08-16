import * as fs from 'fs';
import * as path from 'path';

// Exercise IDs that now have matched GIFs
const exerciseGifUpdates: { [exerciseId: string]: string } = {
  'barbell-row': './assets/exercise-gifs/matched/barbell-row.gif',
  'bent-over-dumbbell-row': './assets/exercise-gifs/matched/bent-over-dumbbell-row.gif',
  'cable-row': './assets/exercise-gifs/matched/cable-row.gif',
  't-bar-row': './assets/exercise-gifs/matched/t-bar-row.gif',
  'wide-grip-lat-pulldown': './assets/exercise-gifs/matched/wide-grip-lat-pulldown.gif',
  'close-grip-lat-pulldown': './assets/exercise-gifs/matched/close-grip-lat-pulldown.gif',
  'neutral-grip-pull-up': './assets/exercise-gifs/matched/pull-ups.gif',
  'barbell-pullover': './assets/exercise-gifs/matched/barbell-pullover.gif',
  'arnold-press': './assets/exercise-gifs/matched/arnold-press.gif',
  'face-pull': './assets/exercise-gifs/matched/face-pull.gif'
};

async function updateExerciseGifs() {
  const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
  let content = fs.readFileSync(databasePath, 'utf8');
  
  console.log('🔄 Updating exercise GIF paths...\n');
  
  let updatedCount = 0;
  
  for (const [exerciseId, gifPath] of Object.entries(exerciseGifUpdates)) {
    // Look for this exercise ID and update its gifUrl
    const idPattern = new RegExp(`(\\s+id: '${exerciseId}',[\\s\\S]*?gifUrl: ')[^']*(')`);
    
    if (idPattern.test(content)) {
      content = content.replace(idPattern, `$1${gifPath}$2`);
      console.log(`✅ Updated ${exerciseId}`);
      updatedCount++;
    } else {
      console.log(`❓ Could not find ${exerciseId} in database`);
    }
  }
  
  // Write updated content back
  fs.writeFileSync(databasePath, content);
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Updated ${updatedCount} exercises with new GIF paths`);
  console.log(`📁 Database updated: ${databasePath}`);
  
  return updatedCount;
}

updateExerciseGifs().catch(console.error);