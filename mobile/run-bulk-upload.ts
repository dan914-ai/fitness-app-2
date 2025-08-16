// TypeScript version of bulk upload script
// Run with: npx ts-node run-bulk-upload.ts

import { gifService } from './src/services/gif.service';
import EXERCISE_DATABASE from './src/data/exerciseDatabase';

async function runBulkUpload() {
  console.log('Starting bulk upload of exercise GIFs...\n');
  
  // Get exercises with GIF URLs
  const exercisesWithGifs = EXERCISE_DATABASE
    .filter(e => e.media?.gifUrl && !e.media?.gifUnavailable)
    .map(e => ({ 
      id: e.id, 
      gifUrl: e.media.gifUrl 
    }));
  
  console.log(`Found ${exercisesWithGifs.length} exercises with valid GIF URLs`);
  console.log('\n⚠️  Make sure you have created the exercise-gifs bucket in Supabase first!');
  console.log('Go to: https://supabase.com/dashboard/project/nwpyliujuimufkfjolsj/storage/buckets\n');
  
  console.log('Starting upload in 5 seconds...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Download and upload to Supabase
  await gifService.bulkDownloadGifs(exercisesWithGifs);
  
  console.log('\nBulk upload complete!');
  console.log('You can now view the GIFs in your app.');
}

// Run the upload
runBulkUpload().catch(error => {
  console.error('Error during bulk upload:', error);
  process.exit(1);
});