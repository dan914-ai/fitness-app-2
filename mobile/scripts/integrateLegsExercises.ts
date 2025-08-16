const fs = require('fs');
const path = require('path');

function integrateLegsExercises() {
  const sourceDir = '/mnt/c/Users/danny/Downloads/legs';
  const files = fs.readdirSync(sourceDir);
  const gifFiles = files.filter(file => file.endsWith('.gif'));
  
  console.log(`Total leg exercises: ${gifFiles.length}`);
  
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
  const exerciseCode = `// New leg exercises to add to database
export const newLegsExercises = [
${newExercises.map(ex => `  {
    id: '${ex.englishId}',
    name: {
      korean: '${ex.koreanName}'
    },
    category: 'legs',
    equipment: ['${getEquipment(ex.koreanName)}'],
    targetMuscles: ['${getTargetMuscle(ex.koreanName)}'],
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
    path.join(__dirname, 'newLegsExercises.ts'),
    exerciseCode,
    'utf8'
  );
  
  // Create implementation script
  const implementScript = `const fs = require('fs');
const path = require('path');

function implementLegsGifs() {
  const sourceDir = '/mnt/c/Users/danny/Downloads/legs';
  const destDir = path.join(__dirname, '../assets/exercise-gifs/legs');
  
  // Create backup
  const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
  const backupPath = databasePath.replace('.ts', \`.backup-legs-\${new Date().toISOString().replace(/:/g, '-')}.ts\`);
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
  
  console.log(\`\\n✅ Copied \${copiedCount} leg exercise GIFs\\n\`);
  console.log('Next: Add exercises to database using newLegsExercises.ts');
}

implementLegsGifs();`;

  fs.writeFileSync(
    path.join(__dirname, 'implementLegsGifs.js'),
    implementScript,
    'utf8'
  );
  
  // Create Supabase upload summary
  const supabaseDoc = `# Legs Exercises - Supabase Upload Summary

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
    path.join(__dirname, 'legs-supabase-upload-summary.md'),
    supabaseDoc,
    'utf8'
  );
  
  console.log('Created files:');
  console.log('1. newLegsExercises.ts - Exercises to add to database');
  console.log('2. legs-supabase-upload-summary.md - Supabase upload guide');
  console.log('3. implementLegsGifs.js - Implementation script');
}

function generateEnglishId(koreanName) {
  const mapping = {
    '닐링 레그컬': 'kneeling_leg_curl',
    '덤벨 리버스 리스트 컬': 'dumbbell_reverse_wrist_curl',
    '덤벨 리스트 컬': 'dumbbell_wrist_curl',
    '덤벨 스쿼트': 'dumbbell_squat',
    '덤벨 스티프 레그 데드리프트': 'dumbbell_stiff_leg_deadlift',
    '라잉 레그컬': 'lying_leg_curl',
    '랜드마인 스쿼트': 'landmine_squat',
    '레그 익스텐션': 'leg_extension',
    '레그 프레스': 'leg_press',
    '루마니안 데드리프트': 'romanian_deadlift',
    '리버스 브이 스쿼트': 'reverse_v_squat',
    '맨몸 런지': 'bodyweight_lunge',
    '맨몸 스쿼트': 'bodyweight_squat',
    '머신 레그 프레스': 'machine_leg_press',
    '바벨 굿모닝': 'barbell_good_morning',
    '바벨 런지': 'barbell_lunge',
    '바벨 리버스 리스트 컬': 'barbell_reverse_wrist_curl',
    '바벨 리스트 컬': 'barbell_wrist_curl',
    '바벨 불가리안 스필릿 스쿼트': 'barbell_bulgarian_split_squat',
    '바벨 프론트 스쿼트': 'barbell_front_squat',
    '바벨 힙 쓰러스트': 'barbell_hip_thrust',
    '벨트 스쿼트': 'belt_squat',
    '불가리안 스플릿 스쿼트': 'bulgarian_split_squat',
    '스모 데드리프트': 'sumo_deadlift',
    '스미스 머신 스쿼트': 'smith_machine_squat',
    '스미스머신 런지': 'smith_machine_lunge',
    '스티프 레그 데드리프트': 'stiff_leg_deadlift',
    '시티드 레그컬': 'seated_leg_curl',
    '싱글 레그 익스텐션': 'single_leg_extension',
    '싱글 레그 컬': 'single_leg_curl',
    '싱글 레그 프레스': 'single_leg_press',
    '짐볼 스쿼트': 'swiss_ball_squat',
    '케틀벨 스쿼트': 'kettlebell_squat',
    '트랩 바 데드리프트': 'trap_bar_deadlift',
    '핵 스쿼트': 'hack_squat',
    '힙 어덕션 (이너싸이 머신)': 'hip_adduction_machine'
  };
  
  return mapping[koreanName] || koreanName.toLowerCase().replace(/\s+/g, '_');
}

function getEquipment(koreanName) {
  if (koreanName.includes('덤벨')) return 'dumbbell';
  if (koreanName.includes('바벨')) return 'barbell';
  if (koreanName.includes('머신') || koreanName.includes('레그 프레스') || koreanName.includes('레그컬') || koreanName.includes('익스텐션')) return 'machine';
  if (koreanName.includes('케이블')) return 'cable';
  if (koreanName.includes('케틀벨')) return 'kettlebell';
  if (koreanName.includes('스미스')) return 'smith_machine';
  if (koreanName.includes('맨몸')) return 'bodyweight';
  if (koreanName.includes('짐볼')) return 'swiss_ball';
  if (koreanName.includes('트랩 바')) return 'trap_bar';
  if (koreanName.includes('랜드마인')) return 'landmine';
  return 'barbell';
}

function getTargetMuscle(koreanName) {
  if (koreanName.includes('레그컬')) return 'hamstrings';
  if (koreanName.includes('익스텐션')) return 'quadriceps';
  if (koreanName.includes('스쿼트') || koreanName.includes('레그 프레스')) return 'quadriceps';
  if (koreanName.includes('데드리프트')) return 'hamstrings';
  if (koreanName.includes('런지')) return 'quadriceps';
  if (koreanName.includes('힙')) return 'glutes';
  if (koreanName.includes('리스트')) return 'forearms';
  if (koreanName.includes('어덕션')) return 'hip_adductors';
  return 'quadriceps';
}

integrateLegsExercises();