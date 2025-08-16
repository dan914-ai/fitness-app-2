import * as fs from 'fs';
import * as path from 'path';

// Korean translations for common exercise terms
const exerciseTranslations: { [key: string]: { korean: string; romanization: string } } = {
  // Press exercises
  'arnold-press': { korean: '아놀드 프레스', romanization: 'anoldeu peuleseu' },
  'military-press': { korean: '밀리터리 프레스', romanization: 'milliteoli peuleseu' },
  'floor-press': { korean: '플로어 프레스', romanization: 'peulloeo peuleseu' },
  'landmine-press': { korean: '랜드마인 프레스', romanization: 'raendeumain peuleseu' },
  'pin-press': { korean: '핀 프레스', romanization: 'pin peuleseu' },
  'svend-press': { korean: '스벤드 프레스', romanization: 'seubeneu peuleseu' },
  
  // Bench Press variations
  'barbell_bench_press': { korean: '바벨 벤치프레스', romanization: 'babel benchipreuleseu' },
  'barbell-decline-bench-press': { korean: '바벨 디클라인 벤치프레스', romanization: 'babel dikullain benchipreuleseu' },
  'incline-barbell-bench-press': { korean: '인클라인 바벨 벤치프레스', romanization: 'inkullain babel benchipreuleseu' },
  'board-bench-press': { korean: '보드 벤치프레스', romanization: 'bodeu benchipreuleseu' },
  'suicide_grip_bench_press': { korean: '수어사이드 그립 벤치프레스', romanization: 'sueosaideu geurip benchipreuleseu' },
  
  // Squat variations
  'barbell_squat': { korean: '바벨 스쿼트', romanization: 'babel seukwoteu' },
  'front-squat': { korean: '프론트 스쿼트', romanization: 'peuronteu seukwoteu' },
  'overhead-squat': { korean: '오버헤드 스쿼트', romanization: 'obeohedeu seukwoteu' },
  'goblet-squat': { korean: '고블릿 스쿼트', romanization: 'gobeullit seukwoteu' },
  'barbell-sumo-squat': { korean: '바벨 스모 스쿼트', romanization: 'babel seumo seukwoteu' },
  'dumbbell-squat': { korean: '덤벨 스쿼트', romanization: 'deombel seukwoteu' },
  'dumbbell-sumo-squat': { korean: '덤벨 스모 스쿼트', romanization: 'deombel seumo seukwoteu' },
  'dumbbell-front-squat': { korean: '덤벨 프론트 스쿼트', romanization: 'deombel peuronteu seukwoteu' },
  'bulgarian-split-squat': { korean: '불가리안 스플릿 스쿼트', romanization: 'bulgar-ian seupeullit seukwoteu' },
  'pistol-squat': { korean: '피스톨 스쿼트', romanization: 'piseutol seukwoteu' },
  'hack_squat': { korean: '핵 스쿼트', romanization: 'haek seukwoteu' },
  'dumbbell-hack-squat': { korean: '덤벨 핵 스쿼트', romanization: 'deombel haek seukwoteu' },
  'smith-machine-squat': { korean: '스미스 머신 스쿼트', romanization: 'seumssi meosin seukwoteu' },
  'low-bar-squat': { korean: '로우바 스쿼트', romanization: 'rouba seukwoteu' },
  'kneeling_squat': { korean: '니링 스쿼트', romanization: 'niling seukwoteu' },
  'landmine-squat': { korean: '랜드마인 스쿼트', romanization: 'raendeumain seukwoteu' },
  'reverse-squat': { korean: '리버스 스쿼트', romanization: 'ribeoseu seukwoteu' },
  'sissy_squat': { korean: '시시 스쿼트', romanization: 'sisi seukwoteu' },
  'wide_stance_squat': { korean: '와이드 스탠스 스쿼트', romanization: 'waideu seutaenseu seukwoteu' },
  'zercher-squat': { korean: '제처 스쿼트', romanization: 'jecheo seukwoteu' },
  
  // Deadlift variations
  'sumo_deadlift': { korean: '스모 데드리프트', romanization: 'seumo dedeuripteu' },
  'kettlebell_deadlift': { korean: '케틀벨 데드리프트', romanization: 'keteulbel dedeuripteu' },
  'trap_bar_deadlift': { korean: '트랩바 데드리프트', romanization: 'teuraepba dedeuripteu' },
  'deficit-deadlift': { korean: '데피싯 데드리프트', romanization: 'depisit dedeuripteu' },
  'pause-deadlift': { korean: '포즈 데드리프트', romanization: 'pojeu dedeuripteu' },
  'landmine-deadlift': { korean: '랜드마인 데드리프트', romanization: 'raendeumain dedeuripteu' },
  'suitcase-deadlift': { korean: '수트케이스 데드리프트', romanization: 'suteukeiseu dedeuripteu' },
  'dumbbell-sumo-deadlift': { korean: '덤벨 스모 데드리프트', romanization: 'deombel seumo dedeuripteu' },
  'kettlebell-sumo-deadlift': { korean: '케틀벨 스모 데드리프트', romanization: 'keteulbel seumo dedeuripteu' },
  'block_pull_deadlift': { korean: '블록 풀 데드리프트', romanization: 'beullok pul dedeuripteu' },
  'rack_pull': { korean: '랙 풀', romanization: 'raek pul' },
  'mixed_grip_deadlift': { korean: '믹스드 그립 데드리프트', romanization: 'mikseudeu geurip dedeuripteu' },
  
  // Row exercises
  'barbell-row': { korean: '바벨 로우', romanization: 'babel rou' },
  'bent-over-dumbbell-row': { korean: '벤트오버 덤벨 로우', romanization: 'benteubeo deombel rou' },
  'single-arm-landmine-row': { korean: '싱글암 랜드마인 로우', romanization: 'singgeulam raendeumain rou' },
  'inverted-row': { korean: '인버티드 로우', romanization: 'inbeotideu rou' },
  'cable-row': { korean: '케이블 로우', romanization: 'keibeul rou' },
  't-bar-row': { korean: 'T바 로우', romanization: 'tibar rou' },
  'yates-row': { korean: '예이츠 로우', romanization: 'yeiteu rou' },
  'upright-row': { korean: '업라이트 로우', romanization: 'eobeuraiteu rou' },
  
  // Curl exercises
  'dumbbell-bicep-curl': { korean: '덤벨 바이셉 컬', romanization: 'deombel baisep keol' },
  'hammer-curls': { korean: '해머 컬', romanization: 'haemeo keol' },
  'preacher-curls': { korean: '프리처 컬', romanization: 'peuricheo keol' },
  'reverse-curl': { korean: '리버스 컬', romanization: 'ribeoseu keol' },
  'spider-curl': { korean: '스파이더 컬', romanization: 'seupaideo keol' },
  'barbell-cheat-curl': { korean: '바벨 치트 컬', romanization: 'babel chiteu keol' },
  'cable-drag-curl': { korean: '케이블 드래그 컬', romanization: 'keibeul deuraegeu keol' },
  'crossbody-hammer-curl': { korean: '크로스바디 해머 컬', romanization: 'keuroseubaodi haemeo keol' },
  'high-pulley-cable-curl': { korean: '하이 풀리 케이블 컬', romanization: 'hai pulli keibeul keol' },
  'incline-dumbbell-curl': { korean: '인클라인 덤벨 컬', romanization: 'inkullain deombel keol' },
  'incline-hammer-curls': { korean: '인클라인 해머 컬', romanization: 'inkullain haemeo keol' },
  'inner-biceps-curl': { korean: '이너 바이셉 컬', romanization: 'ineo baisep keol' },
  'wide-grip-barbell-curl': { korean: '와이드 그립 바벨 컬', romanization: 'waideu geurip babel keol' },
  'zottman-curl': { korean: '조트만 컬', romanization: 'joteuman keol' },
  'nordic-curl': { korean: '노르딕 컬', romanization: 'noreuaik keol' },
  'barbell-wrist-curl': { korean: '바벨 손목 컬', romanization: 'babel sonmok keol' },
  'barbell-reverse-wrist-curl': { korean: '바벨 리버스 손목 컬', romanization: 'babel ribeseu sonmok keol' },
  
  // Push-up variations
  'push-ups-with-rotation': { korean: '회전 푸시업', romanization: 'hoejeon pusieop' },
  'assisted-push-up': { korean: '보조 푸시업', romanization: 'bajo pusieop' },
  'clapping-push-up': { korean: '클래핑 푸시업', romanization: 'keullaeping pusieop' },
  'deck_of_cards_pushups': { korean: '덱 오브 카드 푸시업', romanization: 'dek obeu kadeu pusieop' },
  'deficit-push-ups': { korean: '데피싯 푸시업', romanization: 'depisit pusieop' },
  'forearm-push-up': { korean: '포암 푸시업', romanization: 'poam pusieop' },
  'handstand-push-up': { korean: '핸드스탠드 푸시업', romanization: 'haendeuseutaendeu pusieop' },
  'incline-push-up': { korean: '인클라인 푸시업', romanization: 'inkullain pusieop' },
  'knee-push-up': { korean: '니 푸시업', romanization: 'ni pusieop' },
  'negative-push-up': { korean: '네거티브 푸시업', romanization: 'negeobeub pusieop' },
  'pike-push-up': { korean: '파이크 푸시업', romanization: 'paikeu pusieop' },
  'plyometric-push-up': { korean: '플라이오메트릭 푸시업', romanization: 'peullai-ometeulik pusieop' },
  'resistance-band-push-up': { korean: '저항밴드 푸시업', romanization: 'jeoihangbaendeu pusieop' },
  'shoulder-push-up': { korean: '숄더 푸시업', romanization: 'syoldeo pusieop' },
  'sphinx-push-up': { korean: '스핑크스 푸시업', romanization: 'seupeingkeuseu pusieop' },
  'weighted-push-up': { korean: '웨이티드 푸시업', romanization: 'weitideu pusieop' },
  'wrist-push-up': { korean: '손목 푸시업', romanization: 'sonmok pusieop' },
  
  // Pull-up variations
  'chin-up': { korean: '친업', romanization: 'chineop' },
  'close-grip-pull-up': { korean: '클로즈 그립 풀업', romanization: 'keullojeu geurip puleop' },
  'dead-hang': { korean: '데드 행', romanization: 'dedeu haeng' },
  'muscle-up': { korean: '머슬업', romanization: 'meoseureop' },
  'negative-pull-up': { korean: '네거티브 풀업', romanization: 'negeobeub puleop' },
  'neutral-grip-pull-up': { korean: '뉴트럴 그립 풀업', romanization: 'nyuteueal geurip puleop' },
  'ring-muscle-up': { korean: '링 머슬업', romanization: 'ring meoseureop' },
  'scapular-pull-up': { korean: '견갑골 풀업', romanization: 'gyeongapgol puleop' },
  'weighted-pull-up': { korean: '웨이티드 풀업', romanization: 'weitideu puleop' },
  
  // Other exercises
  'dips': { korean: '딥스', romanization: 'dipseu' },
  'parallel-dips': { korean: '패러렐 딥스', romanization: 'paereorel dipseu' },
  'face-pull': { korean: '페이스 풀', romanization: 'peiseu pul' },
  'dumbbell-face-pull': { korean: '덤벨 페이스 풀', romanization: 'deombel peiseu pul' },
  'banded-face-pull': { korean: '밴드 페이스 풀', romanization: 'baendeu peiseu pul' },
  'barbell-shrug': { korean: '바벨 슈러그', romanization: 'babel syureo-geu' },
  'cable-pull-through': { korean: '케이블 풀 스루', romanization: 'keibeul pul seureu' },
  'clean-and-press': { korean: '클린 앤 프레스', romanization: 'keullin aen peuleseu' },
  'hang-clean': { korean: '행 클린', romanization: 'haeng keullin' },
  'hang-clean-and-jerk': { korean: '행 클린 앤 저크', romanization: 'haeng keullin aen jeokeu' },
  'barbell-power-clean': { korean: '바벨 파워 클린', romanization: 'babel pawo keullin' },
  'kettlebell-clean-and-jerk': { korean: '케틀벨 클린 앤 저크', romanization: 'keteulbel keullin aen jeokeu' },
  'kettlebell-squat-clean': { korean: '케틀벨 스쿼트 클린', romanization: 'keteulbel seukwoteu keullin' },
  'barbell-push-press': { korean: '바벨 푸시 프레스', romanization: 'babel pusi peuleseu' },
  'barbell-pullover': { korean: '바벨 풀오버', romanization: 'babel pul-obeo' }
};

// Body parts mapping
const bodyPartsMapping: { [key: string]: string[] } = {
  'bench-press': ['가슴', '어깨', '삼두'],
  'squat': ['하체', '대퇴', '둔근'],
  'deadlift': ['등', '하체', '햄스트링'],
  'row': ['등', '승모근', '이두'],
  'curl': ['이두', '팔'],
  'press': ['가슴', '어깨', '삼두'],
  'pull-up': ['등', '승모근', '이두'],
  'push-up': ['가슴', '어깨', '삼두'],
  'dip': ['가슴', '삼두', '어깨']
};

// Generate exercise database entries from GIF files
async function generateExerciseEntries() {
  const tempDir = path.join(__dirname, '../temp');
  const gifFiles = fs.readdirSync(tempDir).filter(file => file.endsWith('.gif'));
  
  console.log(`Found ${gifFiles.length} GIF files to process`);
  
  const exercises = gifFiles.map(filename => {
    const id = filename.replace('.gif', '');
    const translation = exerciseTranslations[id];
    
    // Determine category based on exercise name
    let category: 'compound' | 'isolation' = 'compound';
    if (id.includes('curl') || id.includes('raise') || id.includes('extension')) {
      category = 'isolation';
    }
    
    // Determine body parts
    let bodyParts: string[] = ['전신'];
    for (const [key, parts] of Object.entries(bodyPartsMapping)) {
      if (id.includes(key)) {
        bodyParts = parts;
        break;
      }
    }
    
    // Determine difficulty
    let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
    if (id.includes('assisted') || id.includes('knee') || id.includes('incline-push')) {
      difficulty = 'beginner';
    } else if (id.includes('deficit') || id.includes('weighted') || id.includes('pistol') || id.includes('handstand')) {
      difficulty = 'advanced';
    }
    
    // Determine equipment
    let equipment: string[] = ['체중'];
    if (id.includes('barbell')) equipment = ['바벨'];
    else if (id.includes('dumbbell')) equipment = ['덤벨'];
    else if (id.includes('cable')) equipment = ['케이블'];
    else if (id.includes('kettlebell')) equipment = ['케틀벨'];
    else if (id.includes('band')) equipment = ['저항밴드'];
    else if (id.includes('machine')) equipment = ['머신'];
    
    const exercise = {
      id,
      name: {
        english: id.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        korean: translation?.korean || '운동명 번역 필요',
        romanization: translation?.romanization || 'beonyeok pilyeo'
      },
      description: {
        english: `A ${category} exercise targeting ${bodyParts.join(', ').toLowerCase()}`,
        korean: `${bodyParts.join(', ')}을 대상으로 하는 ${category === 'compound' ? '복합' : '고립'} 운동`
      },
      targetMuscles: {
        primary: bodyParts.slice(0, 2),
        secondary: bodyParts.slice(2),
        stabilizers: ['코어']
      },
      equipment,
      category,
      bodyParts,
      difficulty,
      instructions: {
        english: [
          'Set up in proper starting position',
          'Perform the movement with controlled form',
          'Focus on muscle engagement',
          'Return to starting position'
        ],
        korean: [
          '적절한 시작 자세로 준비',
          '통제된 동작으로 운동 수행',
          '근육 참여에 집중',
          '시작 자세로 돌아가기'
        ]
      },
      sets: {
        recommended: '3-4세트',
        beginner: '2-3세트',
        intermediate: '3-4세트',
        advanced: '4-5세트'
      },
      reps: {
        recommended: difficulty === 'beginner' ? '10-15회' : difficulty === 'intermediate' ? '8-12회' : '6-10회',
        beginner: '10-15회',
        intermediate: '8-12회',
        advanced: '6-10회'
      },
      media: {
        gifUrl: `./temp/${filename}`,
        supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/${id}.gif`
      },
      tags: [
        ...bodyParts,
        category === 'compound' ? '복합운동' : '고립운동',
        difficulty === 'beginner' ? '초급' : difficulty === 'intermediate' ? '중급' : '고급',
        ...equipment
      ],
      tips: {
        english: [
          'Maintain proper form throughout the movement',
          'Focus on controlled tempo',
          'Breathe properly during the exercise'
        ],
        korean: [
          '동작 전체에서 올바른 자세 유지',
          '통제된 템포에 집중',
          '운동 중 올바른 호흡'
        ]
      },
      commonMistakes: {
        english: [
          'Using too much weight',
          'Rushing through the movement',
          'Poor form and technique'
        ],
        korean: [
          '너무 무거운 중량 사용',
          '동작을 서두르기',
          '잘못된 자세와 기술'
        ]
      },
      alternatives: []
    };
    
    return exercise;
  });
  
  // Write to file
  const outputPath = path.join(__dirname, '../src/data/newExercises.ts');
  const content = `// Auto-generated exercise database entries
import { ExerciseData } from './exerciseDatabase';

export const newExercises: ExerciseData[] = ${JSON.stringify(exercises, null, 2)};
`;
  
  fs.writeFileSync(outputPath, content);
  console.log(`✅ Generated ${exercises.length} exercise entries`);
  console.log(`📁 Saved to: ${outputPath}`);
  
  // Create a summary report
  const categories = exercises.reduce((acc, ex) => {
    acc[ex.category] = (acc[ex.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const difficulties = exercises.reduce((acc, ex) => {
    acc[ex.difficulty] = (acc[ex.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n📊 Summary:');
  console.log('Categories:', categories);
  console.log('Difficulties:', difficulties);
  console.log(`🔤 Translated: ${exercises.filter(ex => ex.name.korean !== '운동명 번역 필요').length}/${exercises.length}`);
  console.log(`❓ Need translation: ${exercises.filter(ex => ex.name.korean === '운동명 번역 필요').length}`);
  
  return exercises;
}

// Run the script
generateExerciseEntries().catch(console.error);