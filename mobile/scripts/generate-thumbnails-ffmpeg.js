#!/usr/bin/env node

/**
 * Generate clean, static thumbnail images from abdominal exercise GIFs using ffmpeg.
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
        // Use ffmpeg to extract a clean frame from the GIF
        // -i: input file
        // -vf "select=eq(n\,10)": select frame 10 (usually a good representative frame)
        // -vframes 1: output only 1 frame
        // -q:v 2: high quality (scale 1-31, lower is better)
        const command = `ffmpeg -i "${gifPath}" -vf "select=eq(n\\,10)" -vframes 1 -q:v 2 "${thumbPath}" -y 2>&1`;
        
        execSync(command, { stdio: 'pipe' });
        
        // Verify the file was created and has content
        if (fs.existsSync(thumbPath)) {
            const stats = fs.statSync(thumbPath);
            if (stats.size > 0) {
                console.log(`  ✓ Created: ${thumbName} (${Math.round(stats.size / 1024)}KB)`);
                successCount++;
            } else {
                // Try with a different frame if first attempt resulted in empty file
                console.log(`  Retrying with different frame...`);
                const altCommand = `ffmpeg -i "${gifPath}" -vframes 1 -q:v 2 "${thumbPath}" -y 2>&1`;
                execSync(altCommand, { stdio: 'pipe' });
                
                const newStats = fs.statSync(thumbPath);
                if (newStats.size > 0) {
                    console.log(`  ✓ Created: ${thumbName} (${Math.round(newStats.size / 1024)}KB)`);
                    successCount++;
                } else {
                    console.log(`  ✗ Failed to create: ${thumbName}`);
                }
            }
        } else {
            console.log(`  ✗ Failed to create: ${thumbName}`);
        }
    } catch (error) {
        // Try simpler approach if advanced filter fails
        try {
            const simpleCommand = `ffmpeg -i "${gifPath}" -vframes 1 -q:v 2 "${thumbPath}" -y 2>&1`;
            execSync(simpleCommand, { stdio: 'pipe' });
            
            const stats = fs.statSync(thumbPath);
            if (stats.size > 0) {
                console.log(`  ✓ Created: ${thumbName} (${Math.round(stats.size / 1024)}KB)`);
                successCount++;
            } else {
                console.log(`  ✗ Failed: ${thumbName}`);
            }
        } catch (fallbackError) {
            console.log(`  ✗ Error processing ${gifFile}`);
        }
    }
});

console.log(`\n✨ Completed: ${successCount}/${gifFiles.length} thumbnails generated`);