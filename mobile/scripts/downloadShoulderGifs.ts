import * as fs from 'fs';
import * as path from 'path';
import https from 'https';
import http from 'http';

// Define shoulder exercise GIFs to download
// You can add Pinterest GIF URLs here after manually collecting them
const shoulderExerciseGifs = [
  {
    exerciseId: 'dumbbell-shoulder-press',
    koreanName: '덤벨 숄더프레스',
    englishName: 'Dumbbell Shoulder Press',
    gifUrl: '' // Add URL here
  },
  {
    exerciseId: 'barbell-shoulder-press',
    koreanName: '바벨 숄더프레스',
    englishName: 'Barbell Shoulder Press',
    gifUrl: '' // Add URL here
  },
  {
    exerciseId: 'dumbbell-lateral-raise',
    koreanName: '덤벨 레터럴 레이즈',
    englishName: 'Dumbbell Lateral Raise',
    gifUrl: '' // Add URL here
  },
  {
    exerciseId: 'cable-lateral-raise',
    koreanName: '케이블 레터럴 레이즈',
    englishName: 'Cable Lateral Raise',
    gifUrl: '' // Add URL here
  },
  {
    exerciseId: 'dumbbell-front-raise',
    koreanName: '덤벨 프론트 레이즈',
    englishName: 'Dumbbell Front Raise',
    gifUrl: '' // Add URL here
  },
  {
    exerciseId: 'barbell-upright-row',
    koreanName: '바벨 업라이트 로우',
    englishName: 'Barbell Upright Row',
    gifUrl: '' // Add URL here
  },
  {
    exerciseId: 'dumbbell-upright-row',
    koreanName: '덤벨 업라이트 로우',
    englishName: 'Dumbbell Upright Row',
    gifUrl: '' // Add URL here
  },
  {
    exerciseId: 'face-pulls',
    koreanName: '페이스 풀',
    englishName: 'Face Pulls',
    gifUrl: '' // Add URL here
  },
  {
    exerciseId: 'rear-delt-fly',
    koreanName: '리어 델트 플라이',
    englishName: 'Rear Delt Fly',
    gifUrl: '' // Add URL here
  },
  {
    exerciseId: 'arnold-press',
    koreanName: '아놀드 프레스',
    englishName: 'Arnold Press',
    gifUrl: '' // Add URL here
  },
  {
    exerciseId: 'machine-shoulder-press',
    koreanName: '머신 숄더프레스',
    englishName: 'Machine Shoulder Press',
    gifUrl: '' // Add URL here
  },
  {
    exerciseId: 'cable-front-raise',
    koreanName: '케이블 프론트 레이즈',
    englishName: 'Cable Front Raise',
    gifUrl: '' // Add URL here
  }
];

const OUTPUT_DIR = path.join(__dirname, '../assets/exercise-gifs/shoulders');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function downloadFile(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, outputPath).then(resolve).catch(reject);
          return;
        }
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${path.basename(outputPath)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {}); // Delete the file on error
      console.error(`❌ Error downloading ${path.basename(outputPath)}:`, err.message);
      reject(err);
    });
  });
}

async function downloadAllGifs() {
  console.log('🏋️ Starting shoulder exercise GIF downloads...\n');

  const results = {
    success: 0,
    failed: 0,
    skipped: 0
  };

  for (const exercise of shoulderExerciseGifs) {
    if (!exercise.gifUrl) {
      console.log(`⏭️  Skipped: ${exercise.englishName} (No URL provided)`);
      results.skipped++;
      continue;
    }

    const fileName = `${exercise.exerciseId}.gif`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    // Check if file already exists
    if (fs.existsSync(outputPath)) {
      console.log(`✓ Already exists: ${fileName}`);
      results.success++;
      continue;
    }

    try {
      await downloadFile(exercise.gifUrl, outputPath);
      results.success++;
    } catch (error) {
      results.failed++;
    }
  }

  console.log('\n📊 Download Summary:');
  console.log(`✅ Success: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`\nGIFs saved to: ${OUTPUT_DIR}`);
}

// Generate a mapping file for the database
function generateMappingFile() {
  const mapping = shoulderExerciseGifs
    .filter(ex => ex.gifUrl)
    .map(ex => ({
      id: ex.exerciseId,
      korean: ex.koreanName,
      english: ex.englishName,
      localPath: `./assets/exercise-gifs/shoulders/${ex.exerciseId}.gif`
    }));

  const mappingPath = path.join(OUTPUT_DIR, 'shoulder-exercises-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`\n📝 Mapping file created: ${mappingPath}`);
}

// Instructions for manual URL collection
console.log(`
📌 Instructions for collecting GIFs from Pinterest:

1. Open the Pinterest page in your browser
2. Right-click on each GIF/video and select "Copy image address" or "Copy video address"
3. Add the URLs to the shoulderExerciseGifs array above
4. Run this script again with: npm run download-shoulder-gifs

Tips for Pinterest:
- Look for URLs ending in .gif
- Some Pinterest "GIFs" are actually videos (.mp4)
- You might need to click on the pin to get the full-size image
- Consider using browser developer tools to find the actual media URLs
`);

// Only run download if URLs are provided
const hasUrls = shoulderExerciseGifs.some(ex => ex.gifUrl);
if (hasUrls) {
  downloadAllGifs().then(() => {
    generateMappingFile();
  });
} else {
  console.log('\n⚠️  No URLs provided yet. Please add GIF URLs first.');
}