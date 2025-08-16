const Jimp = require('/home/dan914/.nvm/versions/node/v22.18.0/lib/node_modules/jimp');
const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_BASE = 'https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs';

// Map of exercise IDs to their GIF URLs
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

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });
  });
}

async function generateStaticThumbnails() {
  console.log('Generating static JPEG thumbnails from GIFs...\n');
  
  // Create output directory
  const outputDir = path.join(__dirname, 'assets', 'static-thumbnails');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [id, gifPath] of Object.entries(exerciseGifs)) {
    const gifUrl = SUPABASE_BASE + gifPath;
    const fileName = path.basename(gifPath, '.gif');
    const outputPath = path.join(outputDir, `${id}-${fileName}.jpg`);
    
    try {
      console.log(`Processing ${fileName} (ID: ${id})...`);
      
      // Download the GIF
      const buffer = await downloadImage(gifUrl);
      
      // Read with Jimp (it will extract first frame from GIF)
      const image = await Jimp.read(buffer);
      
      // Resize if needed (optional - to reduce file size)
      if (image.bitmap.width > 400) {
        image.resize(400, Jimp.AUTO);
      }
      
      // Save as JPEG
      await image.quality(85).writeAsync(outputPath);
      
      console.log(`✅ Generated: ${id}-${fileName}.jpg`);
      successCount++;
      
    } catch (error) {
      console.log(`❌ Error processing ${fileName}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Static thumbnail generation complete!');
  console.log(`✅ Success: ${successCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
  console.log(`📁 Output directory: ${outputDir}`);
  console.log('='.repeat(50));
}

generateStaticThumbnails().catch(console.error);