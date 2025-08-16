#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Using Cloudinary's fetch API to convert GIFs to JPEGs
// This will extract the first frame and convert to JPEG

const SUPABASE_BASE = 'https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs';

// Map of exercise IDs to their GIF paths
const exerciseGifs = {
  // Abdominals
  '1': '/abdominals/alternate-heel-touches.gif',
  '2': '/abdominals/body-saw-plank.gif',
  '3': '/abdominals/captains-chair-leg-raise.gif',
  '4': '/abdominals/knee-touch-crunch.gif',
  '5': '/abdominals/tuck-crunch.gif',
  '348': '/abdominals/45-degree-extension.gif',
  '349': '/abdominals/ab-roller.gif',
  '350': '/abdominals/decline-sit-up.gif',
  '351': '/abdominals/leg-raise.gif',
  '352': '/abdominals/mountain-climber.gif',
  '353': '/abdominals/machine-crunch.gif',
  '354': '/abdominals/bicycle-crunch.gif',
  '355': '/abdominals/side-plank.gif',
  '356': '/abdominals/sit-up.gif',
  '357': '/abdominals/weighted-russian-twist.gif',
  '358': '/abdominals/weighted-cable-crunch.gif',
  '359': '/abdominals/weighted-plank.gif',
  '360': '/abdominals/captains-chair-knee-raise.gif',
  '361': '/abdominals/crunch.gif',
  '362': '/abdominals/cross-body-crunch.gif',
  '363': '/abdominals/toes-to-bar.gif',
  '365': '/abdominals/plank.gif',
  '366': '/abdominals/flutter-kick.gif',
  '367': '/abdominals/hanging-leg-raise.gif',
  // Pectorals
  '364': '/pectorals/push-up.gif'
};

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function convertGifsToJpeg() {
  console.log('Converting GIFs to JPEGs using online service...\n');
  
  const outputDir = path.join(__dirname, 'assets', 'static-thumbnails-real');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  // Using weserv.nl - a free image proxy and manipulation service
  // It can convert GIFs to JPEGs by extracting the first frame
  
  for (const [id, gifPath] of Object.entries(exerciseGifs)) {
    const originalUrl = SUPABASE_BASE + gifPath;
    const fileName = path.basename(gifPath, '.gif');
    const outputPath = path.join(outputDir, `${id}-${fileName}.jpg`);
    
    // weserv.nl API: convert to JPEG, extract first frame, optimize
    const convertUrl = `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}&output=jpg&q=85&n=-1`;
    
    try {
      console.log(`Converting ${fileName} (ID: ${id})...`);
      await downloadFile(convertUrl, outputPath);
      
      // Check if file was created and has size
      const stats = fs.statSync(outputPath);
      if (stats.size > 0) {
        console.log(`✅ Converted: ${id}-${fileName}.jpg (${Math.round(stats.size / 1024)}KB)`);
        successCount++;
      } else {
        console.log(`❌ File is empty: ${id}-${fileName}.jpg`);
        fs.unlinkSync(outputPath);
        errorCount++;
      }
    } catch (error) {
      console.log(`❌ Error converting ${fileName}:`, error.message);
      errorCount++;
    }
    
    // Add a small delay to be respectful to the free service
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('GIF to JPEG conversion complete!');
  console.log(`✅ Success: ${successCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
  console.log(`📁 Output directory: ${outputDir}`);
  console.log('='.repeat(50));
}

convertGifsToJpeg().catch(console.error);