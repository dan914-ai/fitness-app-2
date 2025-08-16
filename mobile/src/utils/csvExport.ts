import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

interface WorkoutData {
  date: string;
  duration: number;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: {
      weight: string | number;
      reps: string | number;
      type: string;
    }[];
    totalVolume: number;
  }[];
}

/**
 * Generate CSV content from workout history
 */
function generateCSV(workouts: WorkoutData[]): string {
  // CSV Headers
  const headers = [
    'Date',
    'Duration (min)',
    'Exercise Name',
    'Set Number',
    'Weight (kg)',
    'Reps',
    'Volume (kg)',
    'Set Type'
  ].join(',');

  // Process each workout into CSV rows
  const rows: string[] = [];
  
  workouts.forEach(workout => {
    const workoutDate = new Date(workout.date).toLocaleDateString('ko-KR');
    const duration = Math.round(workout.duration / 60); // Convert to minutes
    
    workout.exercises.forEach(exercise => {
      exercise.sets.forEach((set, index) => {
        const row = [
          workoutDate,
          duration,
          `"${exercise.exerciseName}"`, // Quote to handle names with commas
          index + 1,
          set.weight || 0,
          set.reps || 0,
          (Number(set.weight) || 0) * (Number(set.reps) || 0),
          set.type || 'normal'
        ].join(',');
        
        rows.push(row);
      });
    });
  });

  return [headers, ...rows].join('\n');
}

/**
 * Export workout data to CSV file and share
 */
export async function exportWorkoutDataToCSV(
  workouts: WorkoutData[],
  periodLabel: string = 'all'
): Promise<void> {
  try {
    if (!workouts || workouts.length === 0) {
      Alert.alert('알림', '내보낼 운동 기록이 없습니다.');
      return;
    }

    // Generate CSV content
    const csvContent = generateCSV(workouts);
    
    // Create filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `workout_data_${periodLabel}_${date}.csv`;
    const fileUri = FileSystem.documentDirectory + filename;
    
    // Write CSV to file
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (isAvailable) {
      // Share the file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: '운동 기록 내보내기',
        UTI: 'public.comma-separated-values-text',
      });
    } else {
      Alert.alert(
        '성공',
        `파일이 생성되었습니다: ${filename}`,
        [{ text: '확인' }]
      );
    }
  } catch (error) {
    console.error('CSV export error:', error);
    Alert.alert(
      '오류',
      '데이터 내보내기 중 오류가 발생했습니다.',
      [{ text: '확인' }]
    );
  }
}

/**
 * Generate summary statistics CSV
 */
export function generateSummaryCSV(stats: any, period: string): string {
  const headers = ['Metric', 'Value'];
  
  const rows = [
    ['Period', period],
    ['Total Workouts', stats.totalWorkouts],
    ['Total Volume (kg)', stats.totalVolume],
    ['Average Duration (min)', stats.averageDuration],
    ['Current Streak (days)', stats.currentStreak],
    ['This Week Workouts', stats.thisWeek],
    ['Average Per Week', stats.averagePerWeek || 0],
  ];
  
  // Add muscle group distribution
  if (stats.muscleGroups && stats.muscleGroups.length > 0) {
    rows.push(['', '']); // Empty row for separation
    rows.push(['Muscle Group Distribution', '']);
    stats.muscleGroups.forEach((group: any) => {
      rows.push([group.name, group.value]);
    });
  }
  
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

/**
 * Export summary statistics to CSV
 */
export async function exportSummaryToCSV(
  stats: any,
  periodLabel: string
): Promise<void> {
  try {
    const csvContent = generateSummaryCSV(stats, periodLabel);
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `workout_summary_${periodLabel}_${date}.csv`;
    const fileUri = FileSystem.documentDirectory + filename;
    
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: '운동 요약 내보내기',
        UTI: 'public.comma-separated-values-text',
      });
    }
  } catch (error) {
    console.error('Summary export error:', error);
    Alert.alert('오류', '요약 데이터 내보내기 중 오류가 발생했습니다.');
  }
}