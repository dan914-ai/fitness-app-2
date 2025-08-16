import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Svg, { Line, Circle, Polyline } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { getWorkoutHistory, WorkoutHistoryItem } from '../../utils/workoutHistory';
import { getInBodyHistory, InBodyRecord } from '../../utils/inbodyHistory';
import { StatsStackScreenProps } from '../../navigation/types';

const { width: screenWidth } = Dimensions.get('window');

type StatsScreenProps = StatsStackScreenProps<'StatsMain'>;

// Enhanced Bar Chart Component
const BarChart = ({ data, title, color = Colors.primary }: { data: any[], title: string, color?: string }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <Text style={styles.noDataText}>데이터가 없습니다</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value || 0), 1);
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.barChartWrapper}>
        {data.map((item, index) => (
          <View key={index} style={styles.barColumn}>
            <Text style={styles.barValue}>{item.value || 0}</Text>
            <View style={styles.barBackground}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: `${((item.value || 0) / maxValue) * 100}%`,
                    backgroundColor: color,
                  }
                ]} 
              />
            </View>
            <Text style={styles.barLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Progress Line Chart
const ProgressChart = ({ data, title, unit }: { data: any[], title: string, unit: string }) => {
  if (data.length === 0) return null;

  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  
  const chartPadding = 40;
  const chartWidth = screenWidth - chartPadding * 2 - 60;
  const chartHeight = 180;
  const graphHeight = 120;
  const dotRadius = 5;
  const svgPadding = dotRadius + 2;

  // Create points for the polyline
  const points = data.map((item, index) => {
    const x = svgPadding + (index / (data.length - 1)) * (chartWidth - svgPadding * 2);
    const y = svgPadding + (graphHeight - svgPadding * 2) - ((item.value - minValue) / range) * (graphHeight - svgPadding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.progressChartWrapper}>
        <View style={styles.yAxis}>
          <View style={styles.yAxisTop}>
            <Text style={styles.yAxisLabel}>{maxValue.toFixed(1)}{unit}</Text>
          </View>
          <View style={styles.yAxisMiddle}>
            <Text style={styles.yAxisLabel}>{((maxValue + minValue) / 2).toFixed(1)}{unit}</Text>
          </View>
          <View style={styles.yAxisBottom}>
            <Text style={styles.yAxisLabel}>{minValue.toFixed(1)}{unit}</Text>
          </View>
        </View>
        <View style={styles.lineChartArea}>
          {/* Grid lines */}
          <View style={styles.gridLines}>
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
          </View>
          
          {/* SVG for lines and dots */}
          <Svg 
            width={chartWidth} 
            height={graphHeight} 
            style={styles.svgContainer}
          >
            {/* Draw the line */}
            <Polyline
              points={points}
              fill="none"
              stroke={Colors.primary}
              strokeWidth="3"
            />
            
            {/* Draw dots */}
            {data.map((item, index) => {
              const x = svgPadding + (index / (data.length - 1)) * (chartWidth - svgPadding * 2);
              const y = svgPadding + (graphHeight - svgPadding * 2) - ((item.value - minValue) / range) * (graphHeight - svgPadding * 2);
              
              return (
                <Circle
                  key={index}
                  cx={x}
                  cy={y}
                  r={dotRadius}
                  fill="white"
                  stroke={Colors.primary}
                  strokeWidth="3"
                />
              );
            })}
          </Svg>
          
          {/* Value labels above dots */}
          <View style={styles.labelsContainer}>
            {data.map((item, index) => {
              const x = svgPadding + (index / (data.length - 1)) * (chartWidth - svgPadding * 2);
              const y = svgPadding + (graphHeight - svgPadding * 2) - ((item.value - minValue) / range) * (graphHeight - svgPadding * 2);
              
              // Only show labels for every other point if there are too many
              if (data.length > 6 && index % 2 !== 0) return null;
              
              return (
                <Text
                  key={`label-${index}`}
                  style={[
                    styles.dataPointLabel,
                    {
                      position: 'absolute',
                      left: x - 20,
                      top: y - 25,
                      width: 40,
                      textAlign: 'center',
                    }
                  ]}
                >
                  {item.value.toFixed(1)}
                </Text>
              );
            })}
          </View>
          
          {/* X-axis labels */}
          <View style={styles.xAxis}>
            {data.map((item, index) => (
              <View key={index} style={styles.xAxisItem}>
                <Text style={styles.xAxisLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

// Muscle Group Distribution
const MuscleGroupChart = ({ data }: { data: any[] }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>운동 부위 분포</Text>
      <View style={styles.muscleGroupWrapper}>
        {data.map((item, index) => (
          <View key={index} style={styles.muscleGroupItem}>
            <View style={styles.muscleGroupHeader}>
              <View style={[styles.muscleGroupColor, { backgroundColor: item.color }]} />
              <Text style={styles.muscleGroupName}>{item.name}</Text>
              <Text style={styles.muscleGroupPercent}>
                {total > 0 ? Math.round((item.count / total) * 100) : 0}%
              </Text>
            </View>
            <View style={styles.muscleGroupBarContainer}>
              <View 
                style={[
                  styles.muscleGroupBar, 
                  { 
                    width: `${(item.count / total) * 100}%`,
                    backgroundColor: item.color,
                  }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function StatsScreen({ navigation }: StatsScreenProps) {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [workoutStats, setWorkoutStats] = useState<any>({
    totalWorkouts: 0,
    totalVolume: 0,
    averageDuration: 0,
    currentStreak: 0,
    weeklyData: [],
    muscleGroups: [],
    volumeProgress: [],
  });
  const [inbodyStats, setInbodyStats] = useState<any>({
    latestWeight: 0,
    weightChange: 0,
    latestBodyFat: 0,
    bodyFatChange: 0,
    latestMuscle: 0,
    muscleChange: 0,
  });

  const periods = [
    { label: '1주', value: 7 },
    { label: '1개월', value: 30 },
    { label: '3개월', value: 90 },
    { label: '6개월', value: 180 },
  ];

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Load workout history
      const workoutHistory = await getWorkoutHistory();
      console.log('📊 StatsScreen - workoutHistory loaded:', workoutHistory.length, 'workouts');
      
      // Load InBody history
      const inbodyHistory = await getInBodyHistory();
      
      // Filter by period
      const now = new Date();
      const periodStart = new Date();
      periodStart.setDate(now.getDate() - selectedPeriod);
      
      const filteredWorkouts = workoutHistory.filter(w => new Date(w.date) >= periodStart);
      console.log('📊 StatsScreen - filteredWorkouts for period:', filteredWorkouts.length, 'workouts');
      
      // Calculate workout stats
      const totalWorkouts = filteredWorkouts.length;
      
      const totalVolume = filteredWorkouts.reduce((sum, workout) => {
        return sum + workout.totalVolume;
      }, 0);
      
      const totalDuration = filteredWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
      const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts / 60) : 0;
      
      // Calculate streak
      let currentStreak = 0;
      const sortedDates = [...new Set(workoutHistory.map(w => w.date.split('T')[0]))].sort().reverse();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < sortedDates.length; i++) {
        const workoutDate = new Date(sortedDates[i]);
        workoutDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        
        if (workoutDate.getTime() === expectedDate.getTime() || 
            (i === 0 && workoutDate.getTime() === today.getTime() - 86400000)) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      // Weekly data
      const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
      const weeklyData = weekDays.map((day, index) => {
        const count = filteredWorkouts.filter(w => new Date(w.date).getDay() === index).length;
        return { label: day, value: count };
      });
      console.log('📊 StatsScreen - weeklyData:', weeklyData);
      
      // Muscle groups
      const muscleGroupMap: { [key: string]: number } = {};
      const muscleGroupKeywords = {
        '가슴': ['벤치', '체스트', '푸시업', '플라이', 'chest', 'bench', 'push'],
        '등': ['로우', '풀업', '풀다운', '데드리프트', 'row', 'pull', 'back'],
        '어깨': ['숄더', '프레스', '레이즈', 'shoulder', 'press', 'raise'],
        '팔': ['컬', '트라이셉', '암', 'curl', 'tricep', 'bicep', 'arm'],
        '다리': ['스쿼트', '레그', '런지', '카프', 'squat', 'leg', 'lunge', 'calf'],
        '코어': ['크런치', '플랭크', '앱', 'crunch', 'plank', 'ab', 'core'],
      };
      
      filteredWorkouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
          const exerciseName = exercise.exerciseName.toLowerCase();
          let matched = false;
          
          for (const [muscle, keywords] of Object.entries(muscleGroupKeywords)) {
            if (keywords.some(keyword => exerciseName.includes(keyword))) {
              muscleGroupMap[muscle] = (muscleGroupMap[muscle] || 0) + 1;
              matched = true;
              break;
            }
          }
          
          if (!matched) {
            muscleGroupMap['기타'] = (muscleGroupMap['기타'] || 0) + 1;
          }
        });
      });
      
      const muscleGroups = Object.entries(muscleGroupMap)
        .map(([name, count], index) => ({
          name,
          count,
          color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#DDA0DD', '#FD79A8'][index] || '#95A5A6',
        }))
        .sort((a, b) => b.count - a.count);
      
      // Volume progress (weekly averages)
      const volumeProgress = [];
      const weeksToShow = Math.min(Math.ceil(selectedPeriod / 7), 12);
      
      for (let i = weeksToShow - 1; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - i * 7);
        
        const weekWorkouts = filteredWorkouts.filter(w => {
          const date = new Date(w.date);
          return date >= weekStart && date < weekEnd;
        });
        
        const weekVolume = weekWorkouts.reduce((sum, w) => sum + w.totalVolume, 0);
        const avgVolume = weekWorkouts.length > 0 ? Math.round(weekVolume / weekWorkouts.length) : 0;
        
        volumeProgress.push({
          label: `${i + 1}주전`,
          value: avgVolume / 1000, // Convert to tons
        });
      }
      
      // InBody stats
      if (inbodyHistory.length > 0) {
        const latest = inbodyHistory[0];
        const previous = inbodyHistory.length > 1 ? inbodyHistory[1] : null;
        
        setInbodyStats({
          latestWeight: latest.weight,
          weightChange: previous ? latest.weight - previous.weight : 0,
          latestBodyFat: latest.bodyFatPercentage,
          bodyFatChange: previous ? latest.bodyFatPercentage - previous.bodyFatPercentage : 0,
          latestMuscle: latest.skeletalMuscleMass,
          muscleChange: previous ? latest.skeletalMuscleMass - previous.skeletalMuscleMass : 0,
        });
      }
      
      const finalStats = {
        totalWorkouts,
        totalVolume: Math.round(totalVolume / 1000), // Convert to tons
        averageDuration,
        currentStreak,
        weeklyData,
        muscleGroups,
        volumeProgress,
      };
      
      console.log('📊 StatsScreen - final stats:', finalStats);
      setWorkoutStats(finalStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>통계를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>운동 통계</Text>
          <Text style={styles.subtitle}>진행 상황을 한눈에 확인하세요</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
          </ScrollView>
        </View>

        {/* Summary Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryScroll}>
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, { backgroundColor: '#E3F2FD' }]}>
              <Icon name="dumbbell" size={32} color="#1976D2" />
              <Text style={[styles.summaryValue, { color: '#1976D2' }]}>{workoutStats.totalWorkouts}</Text>
              <Text style={styles.summaryLabel}>총 운동</Text>
            </View>
            
            <View style={[styles.summaryCard, { backgroundColor: '#F3E5F5' }]}>
              <Icon name="weight-kilogram" size={32} color="#7B1FA2" />
              <Text style={[styles.summaryValue, { color: '#7B1FA2' }]}>{workoutStats.totalVolume}t</Text>
              <Text style={styles.summaryLabel}>총 볼륨</Text>
            </View>
            
            <View style={[styles.summaryCard, { backgroundColor: '#E8F5E9' }]}>
              <Icon name="timer-outline" size={32} color="#388E3C" />
              <Text style={[styles.summaryValue, { color: '#388E3C' }]}>{workoutStats.averageDuration}분</Text>
              <Text style={styles.summaryLabel}>평균 시간</Text>
            </View>
            
            <View style={[styles.summaryCard, { backgroundColor: '#FFF3E0' }]}>
              <Icon name="fire" size={32} color="#F57C00" />
              <Text style={[styles.summaryValue, { color: '#F57C00' }]}>{workoutStats.currentStreak}일</Text>
              <Text style={styles.summaryLabel}>연속 운동</Text>
            </View>
          </View>
        </ScrollView>

        {/* InBody Summary */}
        {inbodyStats.latestWeight > 0 && (
          <View style={styles.inbodySummary}>
            <Text style={styles.sectionTitle}>최근 인바디 변화</Text>
            <View style={styles.inbodyCards}>
              <TouchableOpacity 
                style={styles.inbodyCard}
                onPress={() => navigation.navigate('기록', { screen: 'InBodyScreen' })}
              >
                <Text style={styles.inbodyLabel}>체중</Text>
                <Text style={styles.inbodyValue}>{inbodyStats.latestWeight}kg</Text>
                <Text style={[
                  styles.inbodyChange,
                  { color: inbodyStats.weightChange > 0 ? '#F44336' : '#4CAF50' }
                ]}>
                  {inbodyStats.weightChange > 0 ? '+' : ''}{inbodyStats.weightChange.toFixed(1)}kg
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.inbodyCard}
                onPress={() => navigation.navigate('기록', { screen: 'InBodyScreen' })}
              >
                <Text style={styles.inbodyLabel}>체지방률</Text>
                <Text style={styles.inbodyValue}>{inbodyStats.latestBodyFat}%</Text>
                <Text style={[
                  styles.inbodyChange,
                  { color: inbodyStats.bodyFatChange > 0 ? '#F44336' : '#4CAF50' }
                ]}>
                  {inbodyStats.bodyFatChange > 0 ? '+' : ''}{inbodyStats.bodyFatChange.toFixed(1)}%
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.inbodyCard}
                onPress={() => navigation.navigate('기록', { screen: 'InBodyScreen' })}
              >
                <Text style={styles.inbodyLabel}>골격근량</Text>
                <Text style={styles.inbodyValue}>{inbodyStats.latestMuscle}kg</Text>
                <Text style={[
                  styles.inbodyChange,
                  { color: inbodyStats.muscleChange > 0 ? '#4CAF50' : '#F44336' }
                ]}>
                  {inbodyStats.muscleChange > 0 ? '+' : ''}{inbodyStats.muscleChange.toFixed(1)}kg
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Charts */}
        <BarChart 
          data={workoutStats.weeklyData} 
          title="요일별 운동 빈도" 
          color="#1976D2"
        />
        
        {workoutStats.volumeProgress.length > 0 && (
          <ProgressChart 
            data={workoutStats.volumeProgress} 
            title="주간 평균 볼륨 추이" 
            unit="t"
          />
        )}
        
        {workoutStats.muscleGroups.length > 0 && (
          <MuscleGroupChart data={workoutStats.muscleGroups} />
        )}

        {/* Navigation Buttons */}
        <View style={styles.navigationSection}>
          <Text style={styles.sectionTitle}>상세 분석</Text>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('WorkoutAnalytics')}
          >
            <Icon name="chart-line" size={24} color={Colors.primary} />
            <View style={styles.navButtonContent}>
              <Text style={styles.navButtonTitle}>운동 분석</Text>
              <Text style={styles.navButtonSubtitle}>상세한 운동 패턴과 트렌드</Text>
            </View>
            <Icon name="chevron-right" size={24} color={Colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('StrengthProgress')}
          >
            <Icon name="trending-up" size={24} color={Colors.secondary} />
            <View style={styles.navButtonContent}>
              <Text style={styles.navButtonTitle}>근력 발달</Text>
              <Text style={styles.navButtonSubtitle}>운동별 중량 증가 추이</Text>
            </View>
            <Icon name="chevron-right" size={24} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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
  },
  loadingText: {
    marginTop: 16,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  periodSelector: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  periodButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginRight: 12,
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
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  summaryScroll: {
    marginBottom: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  summaryCard: {
    width: 120,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  inbodySummary: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  inbodyCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inbodyCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  inbodyLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  inbodyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 4,
  },
  inbodyChange: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  chartContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
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
    width: '70%',
    height: 120,
    backgroundColor: Colors.background,
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
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  progressChartWrapper: {
    flexDirection: 'row',
    height: 180,
  },
  yAxis: {
    width: 50,
    position: 'relative',
    height: 120,
    paddingRight: 8,
  },
  yAxisTop: {
    position: 'absolute',
    top: 7,
    right: 8,
  },
  yAxisMiddle: {
    position: 'absolute',
    top: '50%',
    right: 8,
    marginTop: -6,
  },
  yAxisBottom: {
    position: 'absolute',
    bottom: 7,
    right: 8,
  },
  yAxisLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  lineChartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.3,
  },
  dataPointLabel: {
    fontSize: 9,
    color: Colors.text,
    fontWeight: '600',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  labelsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  xAxis: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 40,
    paddingTop: 8,
  },
  xAxisItem: {
    flex: 1,
    alignItems: 'center',
  },
  xAxisLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  muscleGroupWrapper: {
    paddingVertical: 8,
  },
  muscleGroupItem: {
    marginBottom: 16,
  },
  muscleGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  muscleGroupColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  muscleGroupName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  muscleGroupPercent: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  muscleGroupBarContainer: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  muscleGroupBar: {
    height: '100%',
    borderRadius: 4,
  },
  navigationSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  navButtonContent: {
    flex: 1,
    marginLeft: 16,
  },
  navButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  navButtonSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  noDataText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
});