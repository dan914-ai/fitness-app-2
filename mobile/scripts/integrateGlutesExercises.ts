const fs = require('fs');
const path = require('path');

function integrateGlutesExercises() {
  const sourceDir = '/mnt/c/Users/danny/Downloads/glutes';
  const files = fs.readdirSync(sourceDir);
  const gifFiles = files.filter(file => file.endsWith('.gif'));
  
  console.log(`Total glutes exercises: ${gifFiles.length}`);
  
  // Generate exercise data
  const newExercises = gifFiles.map(file => {
    const koreanName = file.replace('.gif', '');
    const englishId = generateEnglishId(koreanName);
    
    return {
      koreanName,
      englishId,
      gifPath: `./assets/exercise-gifs/legs/${file}`,
      supabaseUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/${englishId}.gif`
    };
  });
  
  // Create TypeScript file for new exercises
  const exerciseCode = `// New glutes exercises to add to database
export const newGlutesExercises = [
${newExercises.map(ex => `  {
    id: '${ex.englishId}',
    name: {
      korean: '${ex.koreanName}'
    },
    category: 'legs',
    equipment: ['${getEquipment(ex.koreanName)}'],
    targetMuscles: ['glutes'],
    difficulty: 'intermediate',
    instructions: [
      '시작 자세를 취합니다',
      '동작을 수행합니다',
      '시작 자세로 돌아갑니다'
    ],
    tips: [
      '정확한 자세를 유지하세요',
      '호흡을 일정하게 유지하세요'
    ],
    commonMistakes: [
      '너무 빠른 동작',
      '불완전한 가동 범위'
    ],
    breathingPattern: '동작 시 호흡을 내쉬고, 돌아올 때 들이마십니다',
    media: {
      gifUrl: '${ex.gifPath}',
      supabaseGifUrl: '${ex.supabaseUrl}'
    }
  }`).join(',\n')}
];`;

  fs.writeFileSync(
    path.join(__dirname, 'newGlutesExercises.ts'),
    exerciseCode,
    'utf8'
  );
  
  // Create implementation script
  const implementScript = `const fs = require('fs');
const path = require('path');

function implementGlutesGifs() {
  const sourceDir = '/mnt/c/Users/danny/Downloads/glutes';
  const destDir = path.join(__dirname, '../assets/exercise-gifs/legs');
  
  // Create backup
  const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
  const backupPath = databasePath.replace('.ts', \`.backup-glutes-\${new Date().toISOString().replace(/:/g, '-')}.ts\`);
  fs.copyFileSync(databasePath, backupPath);
  console.log(\`✅ Backup created: \${backupPath}\`);
  
  // Copy GIFs
  const files = fs.readdirSync(sourceDir);
  const gifFiles = files.filter(file => file.endsWith('.gif'));
  
  let copiedCount = 0;
  for (const file of gifFiles) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    
    try {
      fs.copyFileSync(sourcePath, destPath);
      copiedCount++;
      console.log(\`✅ Copied: \${file}\`);
    } catch (error) {
      console.log(\`❌ Failed to copy \${file}: \${error.message}\`);
    }
  }
  
  console.log(\`\\n✅ Copied \${copiedCount} glutes exercise GIFs\\n\`);
  console.log('Next: Add exercises to database using newGlutesExercises.ts');
}

implementGlutesGifs();`;

  fs.writeFileSync(
    path.join(__dirname, 'implementGlutesGifs.js'),
    implementScript,
    'utf8'
  );
  
  // Create Supabase upload summary
  const supabaseDoc = `# Glutes Exercises - Supabase Upload Summary

## Total: ${gifFiles.length} exercises

## Upload Instructions:
${newExercises.map((ex, i) => `
### ${i + 1}. ${ex.koreanName}
- Local file: \`${ex.gifPath}\`
- Upload as: \`${ex.englishId}.gif\`
- Full URL: \`${ex.supabaseUrl}\`
`).join('')}

## Bulk Upload Script:
\`\`\`bash
cd /mnt/c/Users/danny/.vscode/new\\ finess\\ app/mobile/assets/exercise-gifs/legs
${newExercises.map(ex => `# Upload ${ex.koreanName} as ${ex.englishId}.gif`).join('\n')}
\`\`\`
`;

  fs.writeFileSync(
    path.join(__dirname, 'glutes-supabase-upload-summary.md'),
    supabaseDoc,
    'utf8'
  );
  
  console.log('Created files:');
  console.log('1. newGlutesExercises.ts - Exercises to add to database');
  console.log('2. glutes-supabase-upload-summary.md - Supabase upload guide');
  console.log('3. implementGlutesGifs.js - Implementation script');
}

function generateEnglishId(koreanName) {
  const mapping = {
    '글루트 킥 백 (힙 익스텐션)': 'glute_kickback',
    '글루트 킥 백 머신': 'glute_kickback_machine',
    '머신 스탠딩 힙 어브덕션 (스탠딩 아웃 타이 머신)': 'standing_hip_abduction_machine',
    '스미스 머신 힙 쓰러스트': 'smith_machine_hip_thrust',
    '싱글 레그 케이블 킥백': 'single_leg_cable_kickback',
    '케이블 힙 어덕션': 'cable_hip_adduction',
    '힙 어브덕션': 'hip_abduction'
  };
  
  return mapping[koreanName] || koreanName.toLowerCase().replace(/\s+/g, '_');
}

function getEquipment(koreanName) {
  if (koreanName.includes('머신')) return 'machine';
  if (koreanName.includes('케이블')) return 'cable';
  if (koreanName.includes('스미스')) return 'smith_machine';
  return 'bodyweight';
}

integrateGlutesExercises();