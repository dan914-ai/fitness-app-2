#!/usr/bin/env node

/**
 * Generate clean, static thumbnail images from abdominal exercise GIFs.
 * Uses ffmpeg to extract high-quality frames from GIFs.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const GIF_DIR = path.join(BASE_DIR, 'assets', 'exercise-gifs', 'abdominals');
const THUMB_DIR = path.join(BASE_DIR, 'assets', 'exercise-thumbnails', 'abdominals');

// Ensure thumbnail directory exists
if (!fs.existsSync(THUMB_DIR)) {
    fs.mkdirSync(THUMB_DIR, { recursive: true });
}

// Get all GIF files
const gifFiles = fs.readdirSync(GIF_DIR).filter(f => f.endsWith('.gif'));

console.log(`Found ${gifFiles.length} GIF files to process\n`);

let successCount = 0;

gifFiles.forEach(gifFile => {
    const gifPath = path.join(GIF_DIR, gifFile);
    const thumbName = gifFile.replace('.gif', '.jpg');
    const thumbPath = path.join(THUMB_DIR, thumbName);
    
    console.log(`Processing: ${gifFile} -> ${thumbName}`);
    
    try {
        // Use ffmpeg to extract a frame from the middle of the GIF
        // -ss 00:00:00.5 seeks to 0.5 seconds (middle of most exercise GIFs)
        // -frames:v 1 extracts just one frame
        // -q:v 2 sets high quality (lower number = higher quality, 2 is very good)
        execSync(
            `ffmpeg -i "${gifPath}" -ss 00:00:00.5 -frames:v 1 -q:v 2 "${thumbPath}" -y 2>/dev/null`,
            { stdio: 'pipe' }
        );
        
        // Verify the file was created
        if (fs.existsSync(thumbPath)) {
            const stats = fs.statSync(thumbPath);
            console.log(`  ✓ Created: ${thumbName} (${Math.round(stats.size / 1024)}KB)`);
            successCount++;
        } else {
            console.log(`  ✗ Failed to create: ${thumbName}`);
        }
    } catch (error) {
        console.log(`  ✗ Error processing ${gifFile}: ${error.message}`);
    }
});

console.log(`\n✨ Completed: ${successCount}/${gifFiles.length} thumbnails generated`);