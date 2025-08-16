import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exercises = [
  // Chest exercises
  {
    exerciseName: '벤치프레스',
    category: '근력운동',
    muscleGroup: '가슴',
    equipment: '바벨',
    difficulty: '중급',
    instructions: '벤치에 누워 바벨을 가슴까지 내렸다가 밀어올립니다.',
    caloriesPerMinute: 8
  },
  {
    exerciseName: '덤벨 플라이',
    category: '근력운동',
    muscleGroup: '가슴',
    equipment: '덤벨',
    difficulty: '초급',
    instructions: '덤벨을 양손에 들고 가슴 근육을 늘렸다가 모읍니다.',
    caloriesPerMinute: 6
  },
  
  // Back exercises
  {
    exerciseName: '랫풀다운',
    category: '근력운동',
    muscleGroup: '등',
    equipment: '케이블',
    difficulty: '초급',
    instructions: '바를 가슴쪽으로 당겨 등 근육을 수축시킵니다.',
    caloriesPerMinute: 7
  },
  {
    exerciseName: '데드리프트',
    category: '근력운동',
    muscleGroup: '등',
    equipment: '바벨',
    difficulty: '고급',
    instructions: '바닥의 바벨을 허리를 곧게 펴고 들어올립니다.',
    caloriesPerMinute: 10
  },
  
  // Leg exercises
  {
    exerciseName: '스쿼트',
    category: '근력운동',
    muscleGroup: '하체',
    equipment: '바벨',
    difficulty: '중급',
    instructions: '바벨을 어깨에 메고 앉았다가 일어섭니다.',
    caloriesPerMinute: 9
  },
  {
    exerciseName: '레그프레스',
    category: '근력운동',
    muscleGroup: '하체',
    equipment: '머신',
    difficulty: '초급',
    instructions: '발판을 밀어 다리를 펴고 천천히 굽힙니다.',
    caloriesPerMinute: 8
  },
  
  // Shoulder exercises
  {
    exerciseName: '숄더프레스',
    category: '근력운동',
    muscleGroup: '어깨',
    equipment: '덤벨',
    difficulty: '중급',
    instructions: '덤벨을 어깨 위로 밀어올립니다.',
    caloriesPerMinute: 7
  },
  {
    exerciseName: '사이드 래터럴 레이즈',
    category: '근력운동',
    muscleGroup: '어깨',
    equipment: '덤벨',
    difficulty: '초급',
    instructions: '덤벨을 옆으로 들어올려 어깨 높이까지 올립니다.',
    caloriesPerMinute: 5
  },
  
  // Arm exercises
  {
    exerciseName: '바벨 컬',
    category: '근력운동',
    muscleGroup: '팔',
    equipment: '바벨',
    difficulty: '초급',
    instructions: '바벨을 들고 팔을 굽혀 이두근을 수축시킵니다.',
    caloriesPerMinute: 5
  },
  {
    exerciseName: '트라이셉스 익스텐션',
    category: '근력운동',
    muscleGroup: '팔',
    equipment: '덤벨',
    difficulty: '초급',
    instructions: '덤벨을 머리 뒤로 들고 팔을 펴서 삼두근을 자극합니다.',
    caloriesPerMinute: 4
  },
  
  // Core exercises
  {
    exerciseName: '플랭크',
    category: '코어운동',
    muscleGroup: '복근',
    equipment: '맨몸',
    difficulty: '초급',
    instructions: '팔꿈치로 지탱하며 몸을 일직선으로 유지합니다.',
    caloriesPerMinute: 4
  },
  {
    exerciseName: '크런치',
    category: '코어운동',
    muscleGroup: '복근',
    equipment: '맨몸',
    difficulty: '초급',
    instructions: '누워서 상체를 들어올려 복근을 수축시킵니다.',
    caloriesPerMinute: 5
  },
  
  // Cardio exercises
  {
    exerciseName: '트레드밀 러닝',
    category: '유산소',
    muscleGroup: '전신',
    equipment: '트레드밀',
    difficulty: '초급',
    instructions: '트레드밀에서 일정한 속도로 달립니다.',
    caloriesPerMinute: 12
  },
  {
    exerciseName: '사이클',
    category: '유산소',
    muscleGroup: '하체',
    equipment: '사이클',
    difficulty: '초급',
    instructions: '사이클 머신에서 일정한 속도로 페달을 밟습니다.',
    caloriesPerMinute: 10
  },
  {
    exerciseName: '로잉머신',
    category: '유산소',
    muscleGroup: '전신',
    equipment: '로잉머신',
    difficulty: '중급',
    instructions: '로잉머신에서 노 젓기 동작을 반복합니다.',
    caloriesPerMinute: 11
  }
];

async function main() {
  console.log('🌱 Starting seed...');
  
  // Clear existing exercises
  await prisma.exercise.deleteMany();
  
  // Insert exercises
  for (const exercise of exercises) {
    await prisma.exercise.create({
      data: exercise
    });
  }
  
  console.log(`✅ Seeded ${exercises.length} exercises`);
  
  // Create comprehensive sample achievements
  const achievements = [
    // 운동 관련 업적
    { achievementName: '첫 운동 완료', description: '첫 번째 운동을 완료했습니다', category: '운동', requiredValue: 1, points: 50 },
    { achievementName: '운동 매니아', description: '10회 운동을 완료했습니다', category: '운동', requiredValue: 10, points: 100 },
    { achievementName: '헬스장 단골', description: '50회 운동을 완료했습니다', category: '운동', requiredValue: 50, points: 300 },
    { achievementName: '운동 전문가', description: '100회 운동을 완료했습니다', category: '운동', requiredValue: 100, points: 500 },
    { achievementName: '운동의 신', description: '365회 운동을 완료했습니다', category: '운동', requiredValue: 365, points: 1000 },

    // 볼륨/중량 관련 업적
    { achievementName: '첫 세트 완료', description: '첫 번째 세트를 완료했습니다', category: '운동', requiredValue: 1, points: 25 },
    { achievementName: '100세트 달성', description: '총 100세트를 완료했습니다', category: '운동', requiredValue: 100, points: 150 },
    { achievementName: '1000세트 달성', description: '총 1000세트를 완료했습니다', category: '운동', requiredValue: 1000, points: 400 },
    { achievementName: '5000세트 달성', description: '총 5000세트를 완료했습니다', category: '운동', requiredValue: 5000, points: 800 },

    // 일관성 관련 업적
    { achievementName: '3일 연속', description: '3일 연속 운동했습니다', category: '일관성', requiredValue: 3, points: 75 },
    { achievementName: '7일 연속', description: '7일 연속 운동했습니다', category: '일관성', requiredValue: 7, points: 150 },
    { achievementName: '14일 연속', description: '14일 연속 운동했습니다', category: '일관성', requiredValue: 14, points: 300 },
    { achievementName: '30일 연속', description: '30일 연속 운동했습니다', category: '일관성', requiredValue: 30, points: 600 },
    { achievementName: '불굴의 의지', description: '100일 연속 운동했습니다', category: '일관성', requiredValue: 100, points: 1500 },

    // 소셜 관련 업적
    { achievementName: '첫 팔로워', description: '첫 번째 팔로워를 얻었습니다', category: '소셜', requiredValue: 1, points: 50 },
    { achievementName: '인기인', description: '10명의 팔로워를 얻었습니다', category: '소셜', requiredValue: 10, points: 100 },
    { achievementName: '인플루언서', description: '50명의 팔로워를 얻었습니다', category: '소셜', requiredValue: 50, points: 300 },
    { achievementName: '소셜 스타', description: '100명의 팔로워를 얻었습니다', category: '소셜', requiredValue: 100, points: 500 },

    // 칼로리 관련 업적
    { achievementName: '칼로리 버너', description: '1000칼로리를 소모했습니다', category: '운동', requiredValue: 1000, points: 100 },
    { achievementName: '다이어터', description: '10000칼로리를 소모했습니다', category: '운동', requiredValue: 10000, points: 300 },
    { achievementName: '칼로리 킬러', description: '50000칼로리를 소모했습니다', category: '운동', requiredValue: 50000, points: 600 },
    { achievementName: '메가 버너', description: '100000칼로리를 소모했습니다', category: '운동', requiredValue: 100000, points: 1000 },

    // 시간 관련 업적
    { achievementName: '1시간 운동', description: '총 1시간 운동했습니다', category: '운동', requiredValue: 60, points: 50 },
    { achievementName: '10시간 운동', description: '총 10시간 운동했습니다', category: '운동', requiredValue: 600, points: 150 },
    { achievementName: '100시간 운동', description: '총 100시간 운동했습니다', category: '운동', requiredValue: 6000, points: 500 },
    { achievementName: '1000시간 운동', description: '총 1000시간 운동했습니다', category: '운동', requiredValue: 60000, points: 1500 },
  ];
  
  await prisma.achievement.deleteMany();
  
  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: achievement
    });
  }
  
  console.log(`✅ Seeded ${achievements.length} achievements`);
  
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });