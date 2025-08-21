import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { getWorkoutHistory } from '../../utils/workoutHistory';

const { width: screenWidth } = Dimensions.get('window');

export default function StatsScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    averageDuration: 0,
    favoriteExercise: '-',
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const history = await getWorkoutHistory();
      
      // Calculate basic stats
      const totalWorkouts = history.length;
      
      const totalVolume = history.reduce((sum, workout) => {
        return sum + workout.exercises.reduce((exerciseSum, exercise) => {
          return exerciseSum + exercise.sets.reduce((setSum, set) => {
            return setSum + (set.weight * set.reps);
          }, 0);
        }, 0);
      }, 0);
      
      const totalDuration = history.reduce((sum, workout) => sum + workout.duration, 0);
      const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
      
      const exerciseCount: { [key: string]: number } = {};
      history.forEach(workout => {
        workout.exercises.forEach(exercise => {
          exerciseCount[exercise.name] = (exerciseCount[exercise.name] || 0) + 1;
        });
      });
      
      const favoriteExercise = Object.entries(exerciseCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
      
      setStats({
        totalWorkouts,
        totalVolume: Math.round(totalVolume / 1000),
        averageDuration,
        favoriteExercise,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>통계를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>운동 통계</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Icon name="dumbbell" size={24} color={Colors.primary} />
          <Text style={styles.summaryValue}>{stats.totalWorkouts}</Text>
          <Text style={styles.summaryLabel}>총 운동 횟수</Text>
        </View>
        <View style={styles.summaryCard}>
          <Icon name="chart-line" size={24} color={Colors.secondary} />
          <Text style={styles.summaryValue}>{stats.totalVolume}t</Text>
          <Text style={styles.summaryLabel}>총 볼륨</Text>
        </View>
        <View style={styles.summaryCard}>
          <Icon name="timer-outline" size={24} color={Colors.accent} />
          <Text style={styles.summaryValue}>{stats.averageDuration}분</Text>
          <Text style={styles.summaryLabel}>평균 운동 시간</Text>
        </View>
        <View style={styles.summaryCard}>
          <Icon name="star" size={24} color={Colors.warning} />
          <Text style={styles.summaryValue} numberOfLines={1}>{stats.favoriteExercise}</Text>
          <Text style={styles.summaryLabel}>자주하는 운동</Text>
        </View>
      </View>

      {/* Coming Soon Section */}
      <View style={styles.comingSoonContainer}>
        <Icon name="chart-box-outline" size={48} color={Colors.textSecondary} />
        <Text style={styles.comingSoonTitle}>더 많은 통계가 곧 추가됩니다!</Text>
        <Text style={styles.comingSoonText}>
          운동 빈도 차트, 근육 그룹 분포, 개인 기록 등이 준비 중입니다.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    marginRight: '2%',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  comingSoonContainer: {
    padding: 40,
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});