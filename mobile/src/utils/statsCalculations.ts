import { WorkoutHistoryItem } from './workoutHistory';
import { format, startOfWeek, endOfWeek, subWeeks, subDays, isWithinInterval, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export interface DailyVolume {
  date: string;
  dayName: string;
  currentVolume: number;
  previousVolume: number;
  difference: number;
}

export interface WeeklyData {
  week: string;
  volume: number;
  workouts: number;
  date: Date;
}

export interface MuscleGroupDistribution {
  muscleGroup: string;
  percentage: number;
  volume: number;
}

export interface PeriodStats {
  totalVolume: number;
  totalWorkouts: number;
  averageVolume: number;
  averageDuration: number;
  mostTrainedMuscle: string;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
}

// Map exercise names to muscle groups
const muscleGroupMapping: Record<string, string> = {
  // 가슴 (Chest)
  '벤치프레스': '가슴',
  '인클라인 벤치프레스': '가슴',
  '덤벨 플라이': '가슴',
  '푸시업': '가슴',
  '케이블 크로스오버': '가슴',
  '딥스': '가슴',
  
  // 등 (Back)
  '데드리프트': '등',
  '랫 풀다운': '등',
  '바벨 로우': '등',
  '시티드 로우': '등',
  '풀업': '등',
  '친업': '등',
  
  // 어깨 (Shoulders)
  '숄더 프레스': '어깨',
  '사이드 레터럴 레이즈': '어깨',
  '프론트 레이즈': '어깨',
  '리어 델트 플라이': '어깨',
  '업라이트 로우': '어깨',
  
  // 팔 (Arms)
  '바벨 컬': '팔',
  '덤벨 컬': '팔',
  '해머 컬': '팔',
  '트라이셉스 익스텐션': '팔',
  '케이블 푸시다운': '팔',
  '프리처 컬': '팔',
  
  // 하체 (Legs)
  '스쿼트': '하체',
  '레그 프레스': '하체',
  '런지': '하체',
  '레그 컬': '하체',
  '레그 익스텐션': '하체',
  '카프 레이즈': '하체',
  
  // 코어 (Core)
  '플랭크': '코어',
  '크런치': '코어',
  '레그 레이즈': '코어',
  '러시안 트위스트': '코어',
  '사이드 플랭크': '코어',
};

export function getMuscleGroup(exerciseName: string): string {
  // Try exact match first
  if (muscleGroupMapping[exerciseName]) {
    return muscleGroupMapping[exerciseName];
  }
  
  // Try partial match
  for (const [exercise, muscle] of Object.entries(muscleGroupMapping)) {
    if (exerciseName.includes(exercise) || exercise.includes(exerciseName)) {
      return muscle;
    }
  }
  
  // Default fallback based on keywords
  if (exerciseName.includes('프레스') || exerciseName.includes('플라이')) return '가슴';
  if (exerciseName.includes('로우') || exerciseName.includes('풀')) return '등';
  if (exerciseName.includes('레이즈') || exerciseName.includes('숄더')) return '어깨';
  if (exerciseName.includes('컬') || exerciseName.includes('익스텐션')) return '팔';
  if (exerciseName.includes('스쿼트') || exerciseName.includes('레그')) return '하체';
  if (exerciseName.includes('플랭크') || exerciseName.includes('크런치')) return '코어';
  
  return '기타';
}

export function calculateDailyVolumes(workouts: WorkoutHistoryItem[], days: number = 7): DailyVolume[] {
  const today = new Date();
  const dailyVolumes: DailyVolume[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const currentDate = subDays(today, i);
    const previousDate = subDays(today, i + 7);
    
    const currentDateStr = format(currentDate, 'yyyy-MM-dd');
    const previousDateStr = format(previousDate, 'yyyy-MM-dd');
    
    const currentVolume = workouts
      .filter(w => w.date === currentDateStr)
      .reduce((sum, w) => sum + w.totalVolume, 0);
      
    const previousVolume = workouts
      .filter(w => w.date === previousDateStr)
      .reduce((sum, w) => sum + w.totalVolume, 0);
    
    dailyVolumes.push({
      date: currentDateStr,
      dayName: format(currentDate, 'EEE', { locale: ko }),
      currentVolume,
      previousVolume,
      difference: currentVolume - previousVolume,
    });
  }
  
  return dailyVolumes;
}

export function calculateWeeklyData(workouts: WorkoutHistoryItem[], weeks: number = 6): WeeklyData[] {
  const weeklyData: WeeklyData[] = [];
  const today = new Date();
  
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
    
    const weekWorkouts = workouts.filter(w => {
      const workoutDate = parseISO(w.date);
      return isWithinInterval(workoutDate, { start: weekStart, end: weekEnd });
    });
    
    const totalVolume = weekWorkouts.reduce((sum, w) => sum + w.totalVolume, 0);
    
    weeklyData.push({
      week: format(weekStart, 'MM/dd'),
      volume: totalVolume,
      workouts: weekWorkouts.length,
      date: weekStart,
    });
  }
  
  return weeklyData;
}

export function calculateMuscleGroupDistribution(workouts: WorkoutHistoryItem[]): MuscleGroupDistribution[] {
  const muscleVolumes: Record<string, number> = {
    '가슴': 0,
    '등': 0,
    '어깨': 0,
    '팔': 0,
    '하체': 0,
    '코어': 0,
  };
  
  workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      const muscleGroup = getMuscleGroup(exercise.exerciseName);
      if (muscleGroup !== '기타') {
        muscleVolumes[muscleGroup] += exercise.totalVolume;
      }
    });
  });
  
  const totalVolume = Object.values(muscleVolumes).reduce((sum, v) => sum + v, 0);
  
  return Object.entries(muscleVolumes).map(([muscle, volume]) => ({
    muscleGroup: muscle,
    volume,
    percentage: totalVolume > 0 ? (volume / totalVolume) * 100 : 0,
  }));
}

export function calculatePeriodStats(
  workouts: WorkoutHistoryItem[],
  currentPeriodDays: number,
  previousPeriodDays?: number
): PeriodStats {
  const today = new Date();
  const currentStart = subDays(today, currentPeriodDays);
  const previousStart = subDays(today, (previousPeriodDays || currentPeriodDays) * 2);
  const previousEnd = subDays(today, previousPeriodDays || currentPeriodDays);
  
  const currentWorkouts = workouts.filter(w => {
    const workoutDate = parseISO(w.date);
    return workoutDate >= currentStart && workoutDate <= today;
  });
  
  const previousWorkouts = workouts.filter(w => {
    const workoutDate = parseISO(w.date);
    return workoutDate >= previousStart && workoutDate <= previousEnd;
  });
  
  const currentVolume = currentWorkouts.reduce((sum, w) => sum + w.totalVolume, 0);
  const previousVolume = previousWorkouts.reduce((sum, w) => sum + w.totalVolume, 0);
  const currentDuration = currentWorkouts.reduce((sum, w) => sum + w.duration, 0);
  
  const muscleDistribution = calculateMuscleGroupDistribution(currentWorkouts);
  const mostTrained = muscleDistribution.reduce((max, curr) => 
    curr.volume > max.volume ? curr : max, 
    { muscleGroup: '없음', volume: 0, percentage: 0 }
  );
  
  const changePercentage = previousVolume > 0 
    ? ((currentVolume - previousVolume) / previousVolume) * 100 
    : 0;
  
  return {
    totalVolume: currentVolume,
    totalWorkouts: currentWorkouts.length,
    averageVolume: currentWorkouts.length > 0 ? currentVolume / currentWorkouts.length : 0,
    averageDuration: currentWorkouts.length > 0 ? currentDuration / currentWorkouts.length : 0,
    mostTrainedMuscle: mostTrained.muscleGroup,
    trend: changePercentage > 5 ? 'up' : changePercentage < -5 ? 'down' : 'stable',
    changePercentage,
  };
}

export function getWeeklyTrend(workouts: WorkoutHistoryItem[]): {
  currentWeek: number[];
  previousWeek: number[];
  labels: string[];
} {
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const previousWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
  
  const labels = ['월', '화', '수', '목', '금', '토', '일'];
  const currentWeek: number[] = [];
  const previousWeek: number[] = [];
  
  for (let i = 0; i < 7; i++) {
    const currentDate = format(new Date(currentWeekStart.getTime() + i * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    const previousDate = format(new Date(previousWeekStart.getTime() + i * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    
    const currentVolume = workouts
      .filter(w => w.date === currentDate)
      .reduce((sum, w) => sum + w.totalVolume, 0);
      
    const previousVolume = workouts
      .filter(w => w.date === previousDate)
      .reduce((sum, w) => sum + w.totalVolume, 0);
    
    currentWeek.push(currentVolume);
    previousWeek.push(previousVolume);
  }
  
  return { currentWeek, previousWeek, labels };
}