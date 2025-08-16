import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { getWorkoutHistory } from '../../utils/workoutHistory';

const { width: screenWidth } = Dimensions.get('window');

// Simple Bar Chart Component
const SimpleBarChart = ({ data, title }: { data: any[], title: string }) => {
  const maxValue = Math.max(...data.map(d => d.y), 1);
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.barChartWrapper}>
        {data.map((item, index) => (
          <View key={index} style={styles.barColumn}>
            <Text style={styles.barValue}>{item.y}</Text>
            <View style={styles.barBackground}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: `${(item.y / maxValue) * 100}%`,
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

// Simple Pie Chart Component
const SimplePieChart = ({ data, title }: { data: any[], title: string }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.pieChartWrapper}>
        {data.map((item, index) => (
          <View key={index} style={styles.pieItem}>
            <View style={[styles.pieColor, { backgroundColor: item.color }]} />
            <Text style={styles.pieName}>{item.name}</Text>
            <Text style={styles.pieValue}>
              {item.value} ({Math.round((item.value / total) * 100)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function StatsScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [stats, setStats] = useState<any>({
    totalWorkouts: 0,
    totalVolume: 0,
    averageDuration: 0,
    currentStreak: 0,
    weeklyData: [],
    muscleGroups: [],
  });

  const periods = [
    { label: '7일', value: 7 },
    { label: '30일', value: 30 },
    { label: '90일', value: 90 },
    { label: '1년', value: 365 },
  ];

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const history = await getWorkoutHistory();
      
      // Filter by period
      const now = new Date();
      const periodStart = new Date();
      periodStart.setDate(now.getDate() - selectedPeriod);
      
      const filteredHistory = history.filter(w => new Date(w.date) >= periodStart);
      
      // Calculate basic stats
      const totalWorkouts = filteredHistory.length;
      
      const totalVolume = filteredHistory.reduce((sum, workout) => {
        return sum + workout.exercises.reduce((exerciseSum, exercise) => {
          return exerciseSum + exercise.sets.reduce((setSum, set) => {
            return setSum + (set.weight * set.reps);
          }, 0);
        }, 0);
      }, 0);
      
      const totalDuration = filteredHistory.reduce((sum, workout) => sum + workout.duration, 0);
      const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
      
      // Calculate streak
      let currentStreak = 0;
      const sortedDates = [...new Set(history.map(w => w.date.split('T')[0]))].sort().reverse();
      
      for (let i = 0; i < sortedDates.length; i++) {
        const date = new Date(sortedDates[i]);
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      // Weekly data
      const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
      const weeklyData = weekDays.map((day, index) => {
        const count = filteredHistory.filter(w => new Date(w.date).getDay() === index).length;
        return { x: day, y: count };
      });
      
      // Add some sample data if all zeros
      const hasData = weeklyData.some(d => d.y > 0);
      if (!hasData && filteredHistory.length > 0) {
        // Show actual days from history
        filteredHistory.forEach(workout => {
          const dayIndex = new Date(workout.date).getDay();
          weeklyData[dayIndex].y = (weeklyData[dayIndex].y || 0) + 1;
        });
      }
      
      // Muscle groups
      const muscleGroupCounts: { [key: string]: number } = {
        '가슴': 0,
        '등': 0,
        '어깨': 0,
        '팔': 0,
        '다리': 0,
        '코어': 0,
      };
      
      filteredHistory.forEach(workout => {
        workout.exercises.forEach(exercise => {
          const name = exercise.name.toLowerCase();
          if (name.includes('벤치') || name.includes('체스트') || name.includes('푸시')) {
            muscleGroupCounts['가슴']++;
          } else if (name.includes('로우') || name.includes('풀업') || name.includes('풀다운')) {
            muscleGroupCounts['등']++;
          } else if (name.includes('숄더') || name.includes('프레스') || name.includes('레이즈')) {
            muscleGroupCounts['어깨']++;
          } else if (name.includes('컬') || name.includes('트라이셉')) {
            muscleGroupCounts['팔']++;
          } else if (name.includes('스쿼트') || name.includes('레그') || name.includes('런지')) {
            muscleGroupCounts['다리']++;
          } else {
            muscleGroupCounts['코어']++;
          }
        });
      });
      
      let muscleGroups = Object.entries(muscleGroupCounts)
        .filter(([_, count]) => count > 0)
        .map(([name, value], index) => ({
          name,
          value,
          color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#DDA0DD'][index],
        }));
        
      // If no muscle groups found, show sample data
      if (muscleGroups.length === 0 && filteredHistory.length > 0) {
        // Count exercises more broadly
        filteredHistory.forEach(workout => {
          workout.exercises.forEach(exercise => {
            muscleGroupCounts['기타'] = (muscleGroupCounts['기타'] || 0) + 1;
          });
        });
        
        muscleGroups = Object.entries(muscleGroupCounts)
          .filter(([_, count]) => count > 0)
          .map(([name, value], index) => ({
            name,
            value,
            color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#DDA0DD'][index],
          }));
      }
      
      setStats({
        totalWorkouts,
        totalVolume: Math.round(totalVolume / 1000),
        averageDuration,
        currentStreak,
        weeklyData,
        muscleGroups: muscleGroups.length > 0 ? muscleGroups : [
          { name: '가슴', value: 3, color: '#FF6B6B' },
          { name: '등', value: 2, color: '#4ECDC4' },
          { name: '다리', value: 2, color: '#45B7D1' },
        ],
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

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.value}
            style={[
              styles.periodButton,
              selectedPeriod === period.value && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period.value)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period.value && styles.periodButtonTextActive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Icon name="dumbbell" size={24} color={Colors.primary} />
          <Text style={styles.summaryValue}>{stats.totalWorkouts}</Text>
          <Text style={styles.summaryLabel}>총 운동 횟수</Text>
        </View>
        <View style={styles.summaryCard}>
          <Icon name="weight-kilogram" size={24} color={Colors.secondary} />
          <Text style={styles.summaryValue}>{stats.totalVolume}t</Text>
          <Text style={styles.summaryLabel}>총 볼륨</Text>
        </View>
        <View style={styles.summaryCard}>
          <Icon name="timer-outline" size={24} color={Colors.accent} />
          <Text style={styles.summaryValue}>{stats.averageDuration}분</Text>
          <Text style={styles.summaryLabel}>평균 운동 시간</Text>
        </View>
        <View style={styles.summaryCard}>
          <Icon name="fire" size={24} color={Colors.warning} />
          <Text style={styles.summaryValue}>{stats.currentStreak}일</Text>
          <Text style={styles.summaryLabel}>연속 운동</Text>
        </View>
      </View>

      {/* Charts */}
      <SimpleBarChart data={stats.weeklyData} title="요일별 운동 빈도" />
      {stats.muscleGroups.length > 0 && (
        <SimplePieChart data={stats.muscleGroups} title="운동 부위 분포" />
      )}
      
      {/* Debug Info */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>디버그 정보</Text>
        <Text style={styles.debugText}>총 운동 수: {stats.totalWorkouts}</Text>
        <Text style={styles.debugText}>주간 데이터: {JSON.stringify(stats.weeklyData)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  debugText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
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
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: Colors.surface,
    fontWeight: 'bold',
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
    borderRadius: 12,
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
  barChartWrapper: {
    flexDirection: 'row',
    height: 150,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barColumn: {
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
    backgroundColor: Colors.primary,
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
  pieChartWrapper: {
    paddingVertical: 8,
  },
  pieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pieColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  pieName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  pieValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});