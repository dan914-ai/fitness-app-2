#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const GIF_DIR = path.join(ASSETS_DIR, 'exercise-gifs');
const THUMBNAIL_DIR = path.join(ASSETS_DIR, 'exercise-thumbnails');

// Exercises with known issues from the screenshot
const PROBLEMATIC_EXERCISES = [
  'quadriceps/kettlebell-squat-clean',
  'quadriceps/kettlebell-squat',
  'quadriceps/landmine-squat',
  'quadriceps/landmine-squat-2',
  'quadriceps/leg-extension',
  'quadriceps/leg-extension-2',
  'quadriceps/low-bar-squat',
  'quadriceps/machine-leg-press',
];

// Function to get GIF duration and frame count
function getGifInfo(gifPath) {
  try {
    const output = execSync(`ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "${gifPath}"`, { encoding: 'utf8' });
    const frameCount = parseInt(output.trim());
    return frameCount;
  } catch (error) {
    console.error(`Error getting info for ${gifPath}:`, error.message);
    return 30; // Default assumption
  }
}

// Function to extract a clean frame from GIF
function extractCleanFrame(gifPath, outputPath, frameNumber = null) {
  const gifName = path.basename(gifPath, '.gif');
  
  try {
    // Get total frames if not specified
    if (frameNumber === null) {
      const totalFrames = getGifInfo(gifPath);
      // Use frame at 30% into the animation (avoiding start/end transitions)
      frameNumber = Math.floor(totalFrames * 0.3);
      console.log(`  Total frames: ${totalFrames}, extracting frame: ${frameNumber}`);
    }
    
    // Method 1: Extract specific frame with proper color space conversion
    // -vf flags:
    // - select: selects specific frame
    // - scale: ensures proper dimensions
    // - format: converts to RGB to avoid transparency issues
    const command = `ffmpeg -i "${gifPath}" -vf "select=eq(n\\,${frameNumber}),scale=1080:1080:flags=lanczos,format=rgb24" -vframes 1 -q:v 2 "${outputPath}" -y 2>&1`;
    
    execSync(command, { encoding: 'utf8' });
    
    // Check if file was created and has reasonable size
    const stats = fs.statSync(outputPath);
    if (stats.size < 10000) {
      throw new Error(`Thumbnail too small: ${stats.size} bytes`);
    }
    
    return true;
  } catch (error) {
    console.error(`  ERROR: Failed to extract frame ${frameNumber}:`, error.message);
    
    // Fallback: Try extracting first non-blank frame
    try {
      console.log('  Trying fallback: first frame extraction...');
      const fallbackCommand = `ffmpeg -i "${gifPath}" -vf "select=eq(n\\,0),scale=1080:1080:flags=lanczos,format=rgb24" -vframes 1 -q:v 2 "${outputPath}" -y 2>&1`;
      execSync(fallbackCommand, { encoding: 'utf8' });
      
      const stats = fs.statSync(outputPath);
      if (stats.size > 10000) {
        console.log('  Fallback successful');
        return true;
      }
    } catch (fallbackError) {
      console.error('  Fallback also failed:', fallbackError.message);
    }
    
    return false;
  }
}

// Function to check all thumbnails for quality issues
function checkThumbnailQuality() {
  console.log('Checking thumbnail quality...\n');
  
  const issues = [];
  
  // Check each problematic exercise
  for (const exercisePath of PROBLEMATIC_EXERCISES) {
    const thumbnailPath = path.join(THUMBNAIL_DIR, exercisePath + '.jpg');
    const gifPath = path.join(GIF_DIR, exercisePath + '.gif');
    
    console.log(`Checking ${exercisePath}...`);
    
    if (!fs.existsSync(thumbnailPath)) {
      console.log(`  WARNING: Thumbnail doesn't exist`);
      issues.push({ path: exercisePath, issue: 'missing' });
      continue;
    }
    
    if (!fs.existsSync(gifPath)) {
      console.log(`  WARNING: Source GIF doesn't exist`);
      issues.push({ path: exercisePath, issue: 'no-source' });
      continue;
    }
    
    const stats = fs.statSync(thumbnailPath);
    console.log(`  Size: ${(stats.size / 1024).toFixed(2)}KB`);
    
    // Files with unusual sizes might have issues
    if (stats.size > 150000) {
      console.log(`  WARNING: Unusually large file`);
      issues.push({ path: exercisePath, issue: 'large', size: stats.size });
    }
  }
  
  return issues;
}

// Function to regenerate problematic thumbnails
function regenerateProblematicThumbnails() {
  console.log('\n=== Regenerating Problematic Thumbnails ===\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const exercisePath of PROBLEMATIC_EXERCISES) {
    const gifPath = path.join(GIF_DIR, exercisePath + '.gif');
    const thumbnailPath = path.join(THUMBNAIL_DIR, exercisePath + '.jpg');
    
    console.log(`Processing ${exercisePath}...`);
    
    if (!fs.existsSync(gifPath)) {
      console.log(`  SKIP: Source GIF doesn't exist`);
      failCount++;
      continue;
    }
    
    // Try multiple frame positions to find the cleanest one
    const framePositions = [0.3, 0.5, 0.2, 0.4, 0.1]; // Try 30%, 50%, 20%, 40%, 10%
    let success = false;
    
    for (const position of framePositions) {
      const totalFrames = getGifInfo(gifPath);
      const frameNumber = Math.floor(totalFrames * position);
      
      console.log(`  Trying position ${position * 100}% (frame ${frameNumber})...`);
      
      // Create temp file
      const tempPath = thumbnailPath + '.tmp';
      
      if (extractCleanFrame(gifPath, tempPath, frameNumber)) {
        // Check if the new thumbnail is better
        const newStats = fs.statSync(tempPath);
        
        if (newStats.size > 10000 && newStats.size < 200000) {
          // Replace the old thumbnail
          fs.renameSync(tempPath, thumbnailPath);
          console.log(`  SUCCESS: Created clean thumbnail (${(newStats.size / 1024).toFixed(2)}KB)`);
          successCount++;
          success = true;
          break;
        } else {
          // Remove temp file if not good
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
          }
        }
      }
    }
    
    if (!success) {
      console.log(`  FAILED: Could not create clean thumbnail`);
      failCount++;
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  
  return { successCount, failCount };
}

// Function to find and fix all thumbnails with ghosting
function findAndFixAllGhosting() {
  console.log('\n=== Scanning ALL thumbnails for quality issues ===\n');
  
  const muscleGroups = fs.readdirSync(THUMBNAIL_DIR)
    .filter(item => fs.statSync(path.join(THUMBNAIL_DIR, item)).isDirectory());
  
  const allIssues = [];
  
  for (const muscleGroup of muscleGroups) {
    const muscleDir = path.join(THUMBNAIL_DIR, muscleGroup);
    const thumbnails = fs.readdirSync(muscleDir)
      .filter(file => file.endsWith('.jpg'));
    
    console.log(`\nChecking ${muscleGroup} (${thumbnails.length} thumbnails)...`);
    
    for (const thumbnail of thumbnails) {
      const thumbnailPath = path.join(muscleDir, thumbnail);
      const stats = fs.statSync(thumbnailPath);
      const exerciseName = path.basename(thumbnail, '.jpg');
      
      // Check for potential issues
      if (stats.size > 150000) {
        console.log(`  ${exerciseName}: Large file (${(stats.size / 1024).toFixed(2)}KB) - may have ghosting`);
        allIssues.push({
          muscleGroup,
          exercise: exerciseName,
          size: stats.size
        });
      }
    }
  }
  
  if (allIssues.length > 0) {
    console.log(`\n\nFound ${allIssues.length} potentially problematic thumbnails`);
    console.log('Regenerating them with better extraction...\n');
    
    for (const issue of allIssues) {
      const gifPath = path.join(GIF_DIR, issue.muscleGroup, issue.exercise + '.gif');
      const thumbnailPath = path.join(THUMBNAIL_DIR, issue.muscleGroup, issue.exercise + '.jpg');
      
      if (fs.existsSync(gifPath)) {
        console.log(`Fixing ${issue.muscleGroup}/${issue.exercise}...`);
        const totalFrames = getGifInfo(gifPath);
        const frameNumber = Math.floor(totalFrames * 0.3); // 30% into animation
        
        if (extractCleanFrame(gifPath, thumbnailPath, frameNumber)) {
          const newStats = fs.statSync(thumbnailPath);
          console.log(`  Fixed: ${(issue.size / 1024).toFixed(2)}KB -> ${(newStats.size / 1024).toFixed(2)}KB`);
        }
      }
    }
  }
  
  return allIssues;
}

// Main execution
console.log('=== Thumbnail Quality Fix Script ===\n');

// Step 1: Check current quality
console.log('Step 1: Checking current thumbnail quality...');
const issues = checkThumbnailQuality();

// Step 2: Regenerate problematic thumbnails
console.log('\nStep 2: Regenerating problematic thumbnails...');
const result = regenerateProblematicThumbnails();

// Step 3: Find and fix all potential ghosting issues
console.log('\nStep 3: Scanning for all ghosting issues...');
const allIssues = findAndFixAllGhosting();

console.log('\n=== Complete ===');
console.log(`Fixed ${result.successCount} thumbnails from known issues`);
console.log(`Found and processed ${allIssues.length} additional potential issues`);