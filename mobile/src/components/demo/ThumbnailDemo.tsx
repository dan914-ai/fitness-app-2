import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
// MIGRATION: Replacing StaticThumbnail with UnifiedExerciseThumbnail
// import StaticThumbnail from '../common/StaticThumbnail';
import UnifiedExerciseThumbnail from '../common/UnifiedExerciseThumbnail';
import { Colors } from '../../constants/colors';

/**
 * Demo component to showcase the StaticThumbnail system
 * Shows various exercises with instant-loading thumbnails
 */
export default function ThumbnailDemo() {
  // Test with various exercise IDs to show different states:
  // - Exercises with matching GIF assets (instant loading)
  // - Exercises without assets (colored placeholders)
  const testExercises = [
    { id: '1', name: '얼터네이트 힐 터치', muscle: '복근' },
    { id: '4', name: '니 터치 크런치', muscle: '복근' },
    { id: '60', name: '바벨 컬', muscle: '이두근' },
    { id: '204', name: '바벨 벤치 프레스', muscle: '가슴' },
    { id: '255', name: '바벨 불가리안 스플릿 스쿼트', muscle: '대퇴사두근' },
    { id: '999', name: '테스트 운동', muscle: '등' }, // No matching asset - will show placeholder
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>정적 썸네일 시스템 데모</Text>
      <Text style={styles.subtitle}>
        로컬 GIF 에셋을 사용하여 즉시 로딩되는 운동 썸네일
      </Text>
      
      <ScrollView contentContainerStyle={styles.grid}>
        {testExercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <UnifiedExerciseThumbnail
              exerciseId={exercise.id}
              exerciseName={exercise.name}
              muscleGroup={exercise.muscle}
              size={80}
              variant="static"  // Use static variant for demo (no modal)
            />
            <Text style={styles.exerciseName} numberOfLines={2}>
              {exercise.name}
            </Text>
            <Text style={styles.muscleGroup}>
              {exercise.muscle}
            </Text>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>시스템 설명:</Text>
        <Text style={styles.legendText}>
          • GIF 에셋이 있는 운동: 즉시 이미지 표시
        </Text>
        <Text style={styles.legendText}>
          • GIF 에셋이 없는 운동: 근육군별 색상 플레이스홀더
        </Text>
        <Text style={styles.legendText}>
          • 네트워크 요청 없음 - 모든 썸네일이 앱에 번들됨
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: Colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  exerciseCard: {
    alignItems: 'center',
    marginBottom: 20,
    width: '45%',
    padding: 10,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    color: Colors.text,
  },
  muscleGroup: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  legend: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.text,
  },
  legendText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
});