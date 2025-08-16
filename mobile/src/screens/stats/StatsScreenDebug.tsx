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

// Simple chart component for testing
const SimpleBarChart = ({ data, title }: { data: any[], title: string }) => {
  const maxValue = Math.max(...data.map(d => d.y), 1);
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.barChartContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.barWrapper}>
            <Text style={styles.barValue}>{item.y}</Text>
            <View style={styles.barBackground}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: `${(item.y / maxValue) * 100}%`,
                    backgroundColor: Colors.primary 
                  }
                ]} 
              />
            </View>
            <Text style={styles.barLabel}>{item.x}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function StatsScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalWorkouts: 0,
    weeklyData: [],
    debugInfo: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const history = await getWorkoutHistory();
      
      console.log('Raw workout history:', history);
      setWorkoutHistory(history);
      
      // Calculate weekly data
      const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
      const weeklyData = weekDays.map((day, index) => {
        const count = history.filter(w => {
          const date = new Date(w.date);
          return date.getDay() === index;
        }).length;
        return { x: day, y: count };
      });
      
      // Debug info
      const debugInfo = `
Total workouts: ${history.length}
First workout: ${history.length > 0 ? new Date(history[0].date).toLocaleDateString() : 'None'}
Last workout: ${history.length > 0 ? new Date(history[history.length - 1].date).toLocaleDateString() : 'None'}
Weekly distribution: ${weeklyData.map(d => `${d.x}:${d.y}`).join(', ')}
      `.trim();
      
      setStats({
        totalWorkouts: history.length,
        weeklyData,
        debugInfo,
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
        <Text style={styles.title}>운동 통계 (디버그)</Text>
      </View>

      {/* Debug Info */}
      <View style={styles.debugCard}>
        <Text style={styles.debugTitle}>디버그 정보</Text>
        <Text style={styles.debugText}>{stats.debugInfo}</Text>
      </View>

      {/* Simple Bar Chart */}
      <SimpleBarChart 
        data={stats.weeklyData} 
        title="요일별 운동 횟수"
      />

      {/* Raw Workout List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>운동 기록 (최근 5개)</Text>
        {workoutHistory.slice(0, 5).map((workout, index) => (
          <View key={index} style={styles.workoutCard}>
            <Text style={styles.workoutDate}>
              {`${new Date(workout.date).toLocaleDateString('ko-KR')} - ${workout.name}`}
            </Text>
            <Text style={styles.workoutDetail}>
              {`운동 시간: ${workout.duration}분 | 운동 수: ${workout.exercises.length}`}
            </Text>
            {workout.exercises.map((exercise: any, idx: number) => (
              <Text key={idx} style={styles.exerciseText}>
{`• ${exercise.name}: ${exercise.sets.length}세트`}
              </Text>
            ))}
          </View>
        ))}
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
  debugCard: {
    margin: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  chartContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  barChartContainer: {
    flexDirection: 'row',
    height: 150,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barBackground: {
    width: '60%',
    height: 100,
    backgroundColor: Colors.border,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  barValue: {
    fontSize: 12,
    color: Colors.text,
    marginBottom: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  workoutDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  workoutDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  exerciseText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
    marginLeft: 8,
  },
});