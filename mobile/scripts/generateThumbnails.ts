#!/usr/bin/env tsx
/**
 * Generate Static Thumbnails Script
 * 
 * Downloads GIFs from Supabase and generates small, optimized JPEG thumbnails
 * that are bundled with the app for instant loading.
 * 
 * Usage:
 *   npx tsx scripts/generateThumbnails.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
// Note: For initial testing, we'll use a simpler approach without sharp
// import sharp from 'sharp';
import EXERCISE_DATABASE, { ExerciseData } from '../src/data/exerciseDatabase';
import { getExerciseGifUrls } from '../src/utils/gifUrlHelper';

// Configuration
const THUMBNAIL_SIZE = 60; // 60x60 pixels
const JPEG_QUALITY = 75;   // 75% quality for good balance
const THUMBNAILS_DIR = path.join(__dirname, '../assets/thumbnails');
const MAX_CONCURRENT = 5;  // Process 5 thumbnails at once
const TIMEOUT_MS = 30000;  // 30 second timeout per download

interface ThumbnailResult {
  exerciseId: string;
  success: boolean;
  error?: string;
  outputPath?: string;
  fileSize?: number;
}

/**
 * Ensure the thumbnails directory exists
 */
function ensureThumbnailsDirectory(): void {
  if (!fs.existsSync(THUMBNAILS_DIR)) {
    fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
    console.log(`📁 Created thumbnails directory: ${THUMBNAILS_DIR}`);
  }
}

/**
 * Download a GIF with timeout and retry logic
 */
async function downloadGif(url: string, exerciseId: string): Promise<Buffer | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    console.log(`⬇️  Downloading GIF for exercise ${exerciseId}...`);
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ThumbnailGenerator/1.0)',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('image')) {
      throw new Error(`Invalid content type: ${contentType}`);
    }
    
    const buffer = await response.buffer();
    console.log(`✅ Downloaded ${buffer.length} bytes for exercise ${exerciseId}`);
    return buffer;
    
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Download timeout after ${TIMEOUT_MS}ms`);
    }
    throw error;
  }
}

/**
 * For now, just save the original GIF as a reference
 * TODO: Add proper image processing with Sharp after dependencies are resolved
 */
async function generateThumbnail(
  gifBuffer: Buffer, 
  exerciseId: string
): Promise<{ buffer: Buffer; size: number }> {
  try {
    console.log(`📋 Saving GIF reference for exercise ${exerciseId}...`);
    
    // For now, just return the original buffer
    // This will be replaced with proper Sharp processing later
    console.log(`✅ Saved reference: ${gifBuffer.length} bytes`);
    return { buffer: gifBuffer, size: gifBuffer.length };
    
  } catch (error) {
    throw new Error(`Failed to process thumbnail: ${error.message}`);
  }
}

/**
 * Process a single exercise
 */
async function processSingleExercise(exercise: ExerciseData): Promise<ThumbnailResult> {
  const exerciseId = exercise.id.toString();
  const outputPath = path.join(THUMBNAILS_DIR, `${exerciseId}.gif`); // Save as GIF for now
  
  // Skip if thumbnail already exists
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    console.log(`⏭️  Thumbnail already exists for exercise ${exerciseId} (${stats.size} bytes)`);
    return {
      exerciseId,
      success: true,
      outputPath,
      fileSize: stats.size,
    };
  }
  
  try {
    // Try the direct imageUrl first (fastest)
    let gifBuffer: Buffer | null = null;
    
    if (exercise.imageUrl) {
      try {
        gifBuffer = await downloadGif(exercise.imageUrl, exerciseId);
      } catch (error) {
        console.log(`⚠️  Failed to download from imageUrl for ${exerciseId}: ${error.message}`);
      }
    }
    
    // If direct URL failed, try the generated URLs
    if (!gifBuffer) {
      const gifUrls = getExerciseGifUrls(exerciseId);
      console.log(`🔄 Trying ${gifUrls.length} alternative URLs for exercise ${exerciseId}`);
      
      for (const url of gifUrls) {
        try {
          gifBuffer = await downloadGif(url, exerciseId);
          break; // Success, stop trying more URLs
        } catch (error) {
          console.log(`⚠️  URL failed for ${exerciseId}: ${error.message}`);
          continue; // Try next URL
        }
      }
    }
    
    if (!gifBuffer) {
      throw new Error('No working GIF URL found');
    }
    
    // Generate thumbnail
    const { buffer: thumbnailBuffer, size } = await generateThumbnail(gifBuffer, exerciseId);
    
    // Save to file
    fs.writeFileSync(outputPath, thumbnailBuffer);
    
    console.log(`💾 Saved thumbnail: ${outputPath} (${size} bytes)`);
    
    return {
      exerciseId,
      success: true,
      outputPath,
      fileSize: size,
    };
    
  } catch (error) {
    console.error(`❌ Failed to process exercise ${exerciseId}: ${error.message}`);
    return {
      exerciseId,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Process exercises in batches with concurrency control
 */
async function processExercisesInBatches(
  exercises: ExerciseData[],
  batchSize: number
): Promise<ThumbnailResult[]> {
  const results: ThumbnailResult[] = [];
  
  console.log(`🚀 Processing ${exercises.length} exercises in batches of ${batchSize}...`);
  
  for (let i = 0; i < exercises.length; i += batchSize) {
    const batch = exercises.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(exercises.length / batchSize);
    
    console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (exercises ${i + 1}-${Math.min(i + batchSize, exercises.length)})`);
    
    const batchPromises = batch.map(exercise => processSingleExercise(exercise));
    const batchResults = await Promise.all(batchPromises);
    
    results.push(...batchResults);
    
    // Show batch summary
    const successful = batchResults.filter(r => r.success).length;
    const failed = batchResults.filter(r => !r.success).length;
    console.log(`✅ Batch ${batchNumber} complete: ${successful} successful, ${failed} failed`);
    
    // Small delay between batches to be nice to the server
    if (i + batchSize < exercises.length) {
      console.log('⏳ Waiting 1 second before next batch...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Generate summary report
 */
function generateReport(results: ThumbnailResult[]): void {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalSize = successful.reduce((sum, r) => sum + (r.fileSize || 0), 0);
  
  console.log('\n📊 THUMBNAIL GENERATION REPORT');
  console.log('=====================================');
  console.log(`Total exercises processed: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Total thumbnail size: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`Average thumbnail size: ${successful.length > 0 ? (totalSize / successful.length / 1024).toFixed(2) : 0} KB`);
  
  if (failed.length > 0) {
    console.log('\n❌ Failed exercises:');
    failed.forEach(f => {
      console.log(`  - Exercise ${f.exerciseId}: ${f.error}`);
    });
  }
  
  console.log(`\n📁 Thumbnails saved to: ${THUMBNAILS_DIR}`);
  console.log('🎉 Thumbnail generation complete!');
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    console.log('🎨 Static Thumbnail Generator');
    console.log('============================');
    
    // Setup
    ensureThumbnailsDirectory();
    
    // Get all exercises from database
    const exercises = EXERCISE_DATABASE;
    console.log(`📋 Found ${exercises.length} exercises in database`);
    
    // Process exercises
    const results = await processExercisesInBatches(exercises, MAX_CONCURRENT);
    
    // Generate report
    generateReport(results);
    
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Check for required dependencies
function checkDependencies(): void {
  console.log('⚠️  Running in simplified mode without Sharp image processing');
  console.log('💡 To enable JPEG thumbnail generation, install Sharp: npm install --save-dev sharp');
}

// Run if called directly
if (require.main === module) {
  checkDependencies();
  main();
}

export { main as generateThumbnails };