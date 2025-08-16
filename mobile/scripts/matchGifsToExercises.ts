import * as fs from 'fs';
import * as path from 'path';

// Korean filename to existing exercise ID mapping
const koreanToExerciseMapping: { [korean: string]: string } = {
  // Back exercises
  '바벨 로우.gif': 'barbell-row',
  '덤벨 로우.gif': 'bent-over-dumbbell-row', // or could be dumbbell-row
  '케이블 로우.gif': 'cable-row',
  '티 바 로우.gif': 't-bar-row',
  '랫 풀 다운.gif': 'wide-grip-lat-pulldown', // or lat-pulldown
  '클로즈 그립 랫 풀 다운.gif': 'close-grip-lat-pulldown',
  '와이드 케이블 시티드 로우.gif': 'cable-row', // alternative
  '원 암 케이블 로우.gif': 'single-arm-cable-row',
  '풀업.gif': 'pull-ups',
  '바벨 풀오버.gif': 'barbell-pullover',
  
  // Shoulder exercises (if any missing)
  '아놀드 프레스.gif': 'arnold-press',
  '케이블 페이스 풀.gif': 'face-pull',
  
  // Check for other exercises that might match temp files
};

async function matchGifsToExercises() {
  const backDir = '/mnt/c/Users/danny/Downloads/back exercises';
  const shoulderDir = '/mnt/c/Users/danny/Downloads/shoulder exercises';
  const targetDir = path.join(__dirname, '../assets/exercise-gifs/matched');
  
  // Create target directory
  fs.mkdirSync(targetDir, { recursive: true });
  
  console.log('🔍 Matching Korean GIFs to existing exercises...\n');
  
  let matchedCount = 0;
  
  // Check back exercises
  if (fs.existsSync(backDir)) {
    const backFiles = fs.readdirSync(backDir).filter(f => f.endsWith('.gif'));
    
    for (const filename of backFiles) {
      if (koreanToExerciseMapping[filename]) {
        const exerciseId = koreanToExerciseMapping[filename];
        const sourcePath = path.join(backDir, filename);
        const targetPath = path.join(targetDir, `${exerciseId}.gif`);
        
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✅ ${filename} → ${exerciseId}.gif`);
        matchedCount++;
      } else {
        console.log(`❓ ${filename} - no mapping found`);
      }
    }
  }
  
  // Check shoulder exercises
  if (fs.existsSync(shoulderDir)) {
    const shoulderFiles = fs.readdirSync(shoulderDir).filter(f => f.endsWith('.gif'));
    
    for (const filename of shoulderFiles) {
      if (koreanToExerciseMapping[filename]) {
        const exerciseId = koreanToExerciseMapping[filename];
        const sourcePath = path.join(shoulderDir, filename);
        const targetPath = path.join(targetDir, `${exerciseId}.gif`);
        
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✅ ${filename} → ${exerciseId}.gif`);
        matchedCount++;
      }
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Matched ${matchedCount} GIFs to existing exercises`);
  console.log(`📁 Files saved to: ${targetDir}`);
  
  // List exercises that might still need GIFs
  console.log(`\n📋 Next steps:`);
  console.log(`1. Update database paths to point to matched GIFs`);
  console.log(`2. Review unmapped files for potential matches`);
  
  return matchedCount;
}

matchGifsToExercises().catch(console.error);