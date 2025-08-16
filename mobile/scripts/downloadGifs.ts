#!/usr/bin/env tsx

import { gifService } from '../src/services/gif.service';
import { exerciseDatabase } from '../src/data/exerciseDatabase';

/**
 * Script to bulk download all exercise GIFs from their source URLs
 * and upload them to Supabase storage for the fitness app
 */
async function downloadAllGifs() {
  console.log('🚀 Starting bulk GIF download process...');
  console.log(`📊 Total exercises in database: ${exerciseDatabase.length}`);

  // Filter exercises that have GIF URLs
  const exercisesWithGifs = exerciseDatabase.filter(exercise => 
    exercise.media?.gifUrl && exercise.media.gifUrl.startsWith('http')
  );

  console.log(`📸 Exercises with valid GIF URLs: ${exercisesWithGifs.length}`);

  if (exercisesWithGifs.length === 0) {
    console.log('❌ No exercises with valid GIF URLs found!');
    return;
  }

  // Prepare the exercise data for bulk download
  const gifDownloadData = exercisesWithGifs.map(exercise => ({
    id: exercise.id,
    gifUrl: exercise.media.gifUrl!,
  }));

  console.log('🔥 Starting bulk download...');
  console.log('⏱️  This may take several minutes depending on the number of GIFs...');

  try {
    // Use the gif service to bulk download
    await gifService.bulkDownloadGifs(gifDownloadData);

    console.log('✅ Bulk download completed!');
    
    // Get storage statistics
    const stats = await gifService.getStorageStats();
    if (stats) {
      console.log(`📊 Storage Stats: ${stats.totalFiles} files, ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB total`);
    }

  } catch (error) {
    console.error('❌ Error during bulk download:', error);
  }
}

/**
 * Verify that all GIFs were successfully downloaded
 */
async function verifyDownloads() {
  console.log('🔍 Verifying downloaded GIFs...');
  
  const exercisesWithGifs = exerciseDatabase.filter(exercise => 
    exercise.media?.gifUrl && exercise.media.gifUrl.startsWith('http')
  );

  let successCount = 0;
  let failedCount = 0;
  const failedExercises: string[] = [];

  for (const exercise of exercisesWithGifs) {
    const exists = await gifService.checkGifExists(`${exercise.id}.gif`);
    if (exists) {
      successCount++;
    } else {
      failedCount++;
      failedExercises.push(exercise.id);
    }
  }

  console.log(`✅ Successfully downloaded: ${successCount}`);
  console.log(`❌ Failed downloads: ${failedCount}`);
  
  if (failedExercises.length > 0) {
    console.log('Failed exercises:', failedExercises.join(', '));
  }
}

// Main execution
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'download':
      await downloadAllGifs();
      break;
    case 'verify':
      await verifyDownloads();
      break;
    case 'stats':
      const stats = await gifService.getStorageStats();
      if (stats) {
        console.log(`📊 Storage Stats: ${stats.totalFiles} files, ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB total`);
      } else {
        console.log('❌ Could not retrieve storage stats');
      }
      break;
    default:
      console.log('Usage:');
      console.log('  npx tsx scripts/downloadGifs.ts download  - Download all GIFs');
      console.log('  npx tsx scripts/downloadGifs.ts verify   - Verify downloads');
      console.log('  npx tsx scripts/downloadGifs.ts stats    - Show storage stats');
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { downloadAllGifs, verifyDownloads };