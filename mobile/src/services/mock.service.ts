// Mock data service for testing without backend
export const mockData = {
  user: {
    userId: '1',
    username: 'testuser',
    email: 'test@example.com',
    userTier: '브론즈',
    totalPoints: 1250,
    profileImage: null,
    bio: '운동을 사랑하는 사람입니다',
    height: 175,
    weight: 70,
    birthDate: '1990-01-01',
  },

  exercises: [
    { exerciseId: '1', exerciseName: '벤치프레스', category: '근력운동', muscleGroup: '가슴', equipment: '바벨' },
    { exerciseId: '2', exerciseName: '스쿼트', category: '근력운동', muscleGroup: '하체', equipment: '바벨' },
    { exerciseId: '3', exerciseName: '데드리프트', category: '근력운동', muscleGroup: '등', equipment: '바벨' },
    { exerciseId: '4', exerciseName: '숄더프레스', category: '근력운동', muscleGroup: '어깨', equipment: '덤벨' },
    { exerciseId: '5', exerciseName: '바이셉컬', category: '근력운동', muscleGroup: '팔', equipment: '덤벨' },
    { exerciseId: '6', exerciseName: '런닝', category: '유산소', muscleGroup: '전신', equipment: '없음' },
    { exerciseId: '7', exerciseName: '사이클', category: '유산소', muscleGroup: '하체', equipment: '자전거' },
    { exerciseId: '8', exerciseName: '플랭크', category: '코어운동', muscleGroup: '코어', equipment: '없음' },
  ],

  workouts: [
    {
      workoutId: '1',
      workoutDate: '2025-01-23',
      workoutType: '상체 운동',
      duration: 45,
      totalVolume: 3500,
      caloriesBurned: 250,
      exercises: [
        { exerciseName: '벤치프레스', sets: 3, totalReps: 30, totalWeight: 2250 },
        { exerciseName: '숄더프레스', sets: 3, totalReps: 36, totalWeight: 1080 },
      ],
    },
    {
      workoutId: '2',
      workoutDate: '2025-01-21',
      workoutType: '하체 운동',
      duration: 50,
      totalVolume: 4200,
      caloriesBurned: 300,
      exercises: [
        { exerciseName: '스쿼트', sets: 4, totalReps: 40, totalWeight: 3200 },
        { exerciseName: '데드리프트', sets: 3, totalReps: 24, totalWeight: 2400 },
      ],
    },
  ],

  posts: [
    {
      postId: '1',
      userId: '2',
      username: 'fitness_lover',
      userTier: '실버',
      content: '오늘 스쿼트 새로운 기록 달성! 💪',
      imageUrl: null,
      likeCount: 15,
      commentCount: 3,
      isLiked: false,
      createdAt: '2025-01-24T10:30:00',
    },
    {
      postId: '2',
      userId: '3',
      username: 'gym_warrior',
      userTier: '골드',
      content: '3개월 만에 벤치프레스 100kg 성공했습니다!',
      imageUrl: null,
      likeCount: 32,
      commentCount: 8,
      isLiked: true,
      createdAt: '2025-01-24T08:15:00',
    },
  ],

  challenges: [
    {
      challengeId: '1',
      challengeName: '1월 운동왕 챌린지',
      description: '1월 한 달 동안 가장 많이 운동한 사람이 우승!',
      challengeType: 'monthly',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      participantCount: 128,
      isParticipating: true,
      currentRank: 5,
      progress: 70,
    },
    {
      challengeId: '2',
      challengeName: '벤치프레스 100kg 클럽',
      description: '벤치프레스 100kg를 달성하면 완료되는 챌린지',
      challengeType: 'achievement',
      participantCount: 45,
      isParticipating: false,
      completedCount: 12,
    },
  ],

  achievements: [
    {
      achievementId: '1',
      achievementName: '첫 운동',
      description: '첫 운동을 완료했습니다',
      category: 'beginner',
      points: 10,
      unlockedAt: '2025-01-01',
      progress: 100,
    },
    {
      achievementId: '2',
      achievementName: '일주일 연속 운동',
      description: '7일 연속으로 운동했습니다',
      category: 'consistency',
      points: 50,
      unlockedAt: null,
      progress: 28,
    },
  ],

  analytics: {
    weeklyWorkouts: [
      { date: '2025-01-18', count: 1 },
      { date: '2025-01-19', count: 0 },
      { date: '2025-01-20', count: 1 },
      { date: '2025-01-21', count: 1 },
      { date: '2025-01-22', count: 0 },
      { date: '2025-01-23', count: 1 },
      { date: '2025-01-24', count: 0 },
    ],
    muscleGroupDistribution: [
      { muscleGroup: '가슴', percentage: 25 },
      { muscleGroup: '등', percentage: 20 },
      { muscleGroup: '하체', percentage: 30 },
      { muscleGroup: '어깨', percentage: 15 },
      { muscleGroup: '팔', percentage: 10 },
    ],
    strengthProgress: {
      '벤치프레스': [
        { date: '2025-01-01', weight: 60 },
        { date: '2025-01-10', weight: 65 },
        { date: '2025-01-20', weight: 70 },
      ],
      '스쿼트': [
        { date: '2025-01-01', weight: 80 },
        { date: '2025-01-10', weight: 85 },
        { date: '2025-01-20', weight: 90 },
      ],
    },
  },
};

// Mock API delay
export const mockDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const mockApi = {
  async getUser() {
    await mockDelay();
    return { data: mockData.user };
  },

  async getExercises() {
    await mockDelay();
    return { data: mockData.exercises };
  },

  async getWorkouts() {
    await mockDelay();
    return { data: mockData.workouts };
  },

  async getPosts() {
    await mockDelay();
    return { data: mockData.posts };
  },

  async getChallenges() {
    await mockDelay();
    return { data: mockData.challenges };
  },

  async getAchievements() {
    await mockDelay();
    return { data: mockData.achievements };
  },

  async getAnalytics() {
    await mockDelay();
    return { data: mockData.analytics };
  },
};