const fs = require('fs');
const path = require('path');

console.log('=== GIF Implementation Guide ===\n');

// 1. Check what GIFs we have in Downloads
const downloadDirs = {
  chest: '/mnt/c/Users/danny/Downloads/chest exercises',
  back: '/mnt/c/Users/danny/Downloads/back exercises',
  shoulder: '/mnt/c/Users/danny/Downloads/shoulder exercises'
};

const availableGifs = {
  chest: [],
  back: [],
  shoulder: []
};

// Scan download directories
for (const [category, dir] of Object.entries(downloadDirs)) {
  try {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      availableGifs[category] = files.filter(f => f.endsWith('.gif'));
      console.log(`${category} GIFs available: ${availableGifs[category].length}`);
    }
  } catch (e) {
    console.log(`Could not read ${category} directory`);
  }
}

// 2. Create implementation steps
const implementationSteps = `
# Steps to Implement New GIFs into Pre-existing Exercises

## 1. Copy GIF Files to Assets Folder
First, copy all Korean GIF files from Downloads to the mobile app assets:

\`\`\`bash
# Create directories if they don't exist
mkdir -p mobile/assets/exercise-gifs/chest
mkdir -p mobile/assets/exercise-gifs/back
mkdir -p mobile/assets/exercise-gifs/shoulders

# Copy chest exercises
cp "/mnt/c/Users/danny/Downloads/chest exercises"/*.gif mobile/assets/exercise-gifs/chest/

# Copy back exercises  
cp "/mnt/c/Users/danny/Downloads/back exercises"/*.gif mobile/assets/exercise-gifs/back/

# Copy shoulder exercises
cp "/mnt/c/Users/danny/Downloads/shoulder exercises"/*.gif mobile/assets/exercise-gifs/shoulders/
\`\`\`

## 2. Update Existing Exercises with Korean GIFs

For exercises that already exist in the database but need Korean GIFs:

### Chest Exercises to Update:
${availableGifs.chest.map(gif => `- ${gif}`).join('\n')}

### Back Exercises to Update:
${availableGifs.back.map(gif => `- ${gif}`).join('\n')}

### Shoulder Exercises to Update:
${availableGifs.shoulder.map(gif => `- ${gif}`).join('\n')}

## 3. Manual Mapping Required

You'll need to manually map English exercise IDs to Korean GIF names. 
For example:
- 'barbell_bench_press' → '바벨 벤치프레스.gif'
- 'lat_pulldown' → '랫 풀다운.gif'
- 'dumbbell_shoulder_press' → '덤벨 숄더 프레스.gif'

## 4. Upload to Supabase

After updating the database, upload all GIFs to Supabase:

1. Go to Supabase Dashboard
2. Navigate to Storage → exercise-gifs bucket
3. Upload files with English IDs (e.g., barbell_bench_press.gif)
4. The Korean GIF should be renamed to match the exercise ID

## 5. Run Update Script

Use the generated updateWithKoreanGifs.js script to update the database:

\`\`\`bash
node scripts/updateWithKoreanGifs.js
\`\`\`
`;

fs.writeFileSync(
  path.join(__dirname, 'gif-implementation-guide.md'),
  implementationSteps
);

// 3. Create a comprehensive mapping script
const mappingScript = `const fs = require('fs');
const path = require('path');

// Comprehensive mapping of exercise IDs to Korean GIF names
// Add more mappings as needed
const exerciseToGifMapping = {
  // Chest exercises
  'barbell_bench_press': '바벨 벤치프레스.gif',
  'dumbbell_bench_press': '덤벨 벤치프레스.gif',
  'incline_bench_press': '인클라인 벤치 프레스.gif',
  'decline_bench_press': '디클라인 벤치프레스.gif',
  'dips': '딥스.gif',
  'push_ups': '푸시업.gif',
  'cable_crossover': '케이블 크로스오버.gif',
  'chest_fly': '체스트 플라이.gif',
  'dumbbell_fly': '덤벨 체스트 플라이.gif',
  
  // Back exercises
  'deadlift': '데드리프트.gif',
  'lat_pulldown': '랫 풀다운.gif',
  'pull_ups': '풀업.gif',
  'barbell_row': '바벨 로우.gif',
  'dumbbell_row': '덤벨 로우.gif',
  'cable_row': '케이블 로우.gif',
  'seated_cable_row': '시티드 케이블 로우.gif',
  't_bar_row': '티바 로우.gif',
  'face_pull': '페이스 풀.gif',
  
  // Shoulder exercises
  'shoulder_press': '숄더 프레스.gif',
  'military_press': '밀리터리 프레스.gif',
  'dumbbell_shoulder_press': '덤벨 숄더 프레스.gif',
  'lateral_raise': '레터럴 레이즈.gif',
  'front_raise': '프론트 레이즈.gif',
  'rear_delt_fly': '리어 델트 플라이.gif',
  'arnold_press': '아놀드 프레스.gif',
  'upright_row': '업라이트 로우.gif'
};

// Function to update exercises with Korean GIFs
function implementKoreanGifs() {
  const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
  let databaseContent = fs.readFileSync(databasePath, 'utf-8');
  
  let updatedCount = 0;
  const updates = [];
  
  for (const [exerciseId, koreanGifName] of Object.entries(exerciseToGifMapping)) {
    // Check if exercise exists
    const exercisePattern = new RegExp(\`id:\\\\s*['\\"]\${exerciseId}['\\"]\`, 'g');
    
    if (databaseContent.match(exercisePattern)) {
      // Determine which folder the GIF should be in
      let category = 'all';
      if (koreanGifName.includes('체스트') || koreanGifName.includes('벤치') || koreanGifName.includes('딥스')) {
        category = 'chest';
      } else if (koreanGifName.includes('로우') || koreanGifName.includes('풀') || koreanGifName.includes('데드')) {
        category = 'back';
      } else if (koreanGifName.includes('숄더') || koreanGifName.includes('레이즈') || koreanGifName.includes('프레스')) {
        category = 'shoulders';
      }
      
      const gifPath = \`./assets/exercise-gifs/\${category}/\${koreanGifName}\`;
      
      // Update the exercise
      const updatePattern = new RegExp(
        \`(id:\\\\s*['\\"]\${exerciseId}['\\""][\\\\s\\\\S]*?media:\\\\s*{[\\\\s\\\\S]*?gifUrl:\\\\s*)['\\""][^'\\"]*['\\"]\`,
        'g'
      );
      
      const beforeUpdate = databaseContent;
      databaseContent = databaseContent.replace(updatePattern, (match, prefix) => {
        return prefix + \`'\${gifPath}'\`;
      });
      
      if (beforeUpdate !== databaseContent) {
        updatedCount++;
        updates.push({ exerciseId, gifPath });
      }
    }
  }
  
  // Save updated database
  fs.writeFileSync(databasePath, databaseContent);
  
  console.log(\`Updated \${updatedCount} exercises with Korean GIFs\`);
  console.log('\\nUpdated exercises:');
  updates.forEach(u => {
    console.log(\`  \${u.exerciseId} -> \${u.gifPath}\`);
  });
}

// Run the implementation
implementKoreanGifs();
`;

fs.writeFileSync(
  path.join(__dirname, 'implementKoreanGifs.js'),
  mappingScript
);

console.log('\nCreated files:');
console.log('1. gif-implementation-guide.md - Step-by-step guide');
console.log('2. implementKoreanGifs.js - Script to update database with Korean GIFs');
console.log('\nTotal available GIFs:');
console.log(`  Chest: ${availableGifs.chest.length}`);
console.log(`  Back: ${availableGifs.back.length}`);
console.log(`  Shoulder: ${availableGifs.shoulder.length}`);