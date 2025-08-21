import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { getWorkoutHistory, WorkoutHistoryItem } from '../../utils/workoutHistory';
import { StatsStackScreenProps } from '../../navigation/types';

const { width: screenWidth } = Dimensions.get('window');

type StrengthProgressScreenProps = StatsStackScreenProps<'StrengthProgress'>;

interface ExerciseProgress {
  name: string;
  data: {
    date: string;
    maxWeight: number;
    totalVolume: number;
    sets: number;
  }[];
  improvement: number;
  personalRecord: number;
}

// Simple Progress Chart
const ProgressChart = ({ data, title }: { data: any[], title: string }) => {
  if (data.length === 0) return null;

  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  
  const chartPadding = 40;
  const chartWidth = screenWidth - chartPadding * 2 - 60; // Account for padding and y-axis
  const chartHeight = 180;
  const graphHeight = 120; // Height for the actual graph area
  const dotRadius = 5;
  const svgPadding = dotRadius + 2; // Add padding so dots aren't cut off

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
            <Text style={styles.yAxisLabel}>{maxValue}kg</Text>
          </View>
          <View style={styles.yAxisMiddle}>
            <Text style={styles.yAxisLabel}>{((maxValue + minValue) / 2).toFixed(0)}kg</Text>
          </View>
          <View style={styles.yAxisBottom}>
            <Text style={styles.yAxisLabel}>{minValue}kg</Text>
          </View>
        </View>
        <View style={styles.chartArea}>
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
                  {item.value}kg
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

export default function StrengthProgressScreen({ navigation }: StrengthProgressScreenProps) {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [availableExercises, setAvailableExercises] = useState<string[]>([]);

  const periods = [
    { label: '1개월', value: 30 },
    { label: '3개월', value: 90 },
    { label: '6개월', value: 180 },
    { label: '1년', value: 365 },
  ];

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      const history = await getWorkoutHistory();
      
      // Filter by period
      const now = new Date();
      const periodStart = new Date();
      periodStart.setDate(now.getDate() - selectedPeriod);
      
      const filteredHistory = history.filter(w => new Date(w.date) >= periodStart);
      
      // Group by exercise
      const exerciseMap: { [key: string]: any[] } = {};
      
      filteredHistory.forEach(workout => {
        workout.exercises.forEach(exercise => {
          if (!exerciseMap[exercise.exerciseName]) {
            exerciseMap[exercise.exerciseName] = [];
          }
          
          const maxWeight = Math.max(...exercise.sets.map(s => Number(s.weight) || 0));
          const totalVolume = exercise.sets.reduce((sum, s) => sum + ((Number(s.weight) || 0) * (Number(s.reps) || 0)), 0);
          
          exerciseMap[exercise.exerciseName].push({
            date: workout.date,
            maxWeight,
            totalVolume,
            sets: exercise.sets.length,
          });
        });
      });
      
      // Calculate progress for each exercise
      const progressData: ExerciseProgress[] = [];
      
      Object.entries(exerciseMap).forEach(([exerciseName, data]) => {
        if (data.length >= 2) {
          // Sort by date
          data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          const firstWeight = data[0].maxWeight;
          const lastWeight = data[data.length - 1].maxWeight;
          const improvement = firstWeight > 0 ? ((lastWeight - firstWeight) / firstWeight) * 100 : 0;
          const personalRecord = Math.max(...data.map(d => d.maxWeight));
          
          progressData.push({
            name: exerciseName,
            data,
            improvement,
            personalRecord,
          });
        }
      });
      
      // Sort by improvement
      progressData.sort((a, b) => b.improvement - a.improvement);
      
      setExerciseProgress(progressData);
      setAvailableExercises(progressData.map(p => p.name));
      
      if (progressData.length > 0 && !selectedExercise) {
        setSelectedExercise(progressData[0].name);
      }
    } catch (error) {
      console.error('Error loading strength progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedExerciseData = () => {
    const exercise = exerciseProgress.find(e => e.name === selectedExercise);
    if (!exercise) return null;
    
    // Get last 10 data points
    const recentData = exercise.data.slice(-10);
    
    return recentData.map((d, index) => ({
      label: new Date(d.date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
      value: d.maxWeight,
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>근력 발달 데이터를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedExerciseInfo = exerciseProgress.find(e => e.name === selectedExercise);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>근력 발달</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
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

        {exerciseProgress.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="trending-up" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>운동 기록이 부족합니다</Text>
            <Text style={styles.emptySubtitle}>
              근력 발달을 추적하려면 동일한 운동을 2회 이상 수행하세요
            </Text>
          </View>
        ) : (
          <>
            {/* Top Improvements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>가장 많이 발전한 운동</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {exerciseProgress.slice(0, 5).map((exercise) => (
                  <TouchableOpacity
                    key={exercise.name}
                    style={[
                      styles.improvementCard,
                      selectedExercise === exercise.name && styles.improvementCardActive,
                    ]}
                    onPress={() => setSelectedExercise(exercise.name)}
                  >
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <View style={styles.improvementRow}>
                      <Icon 
                        name={exercise.improvement > 0 ? "trending-up" : "trending-down"} 
                        size={24} 
                        color={exercise.improvement > 0 ? Colors.success : Colors.error} 
                      />
                      <Text 
                        style={[
                          styles.improvementValue,
                          { color: exercise.improvement > 0 ? Colors.success : Colors.error }
                        ]}
                      >
                        {exercise.improvement > 0 ? '+' : ''}{exercise.improvement.toFixed(1)}%
                      </Text>
                    </View>
                    <Text style={styles.prText}>PR: {exercise.personalRecord}kg</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Exercise Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>운동 선택</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {availableExercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise}
                    style={[
                      styles.exerciseButton,
                      selectedExercise === exercise && styles.exerciseButtonActive,
                    ]}
                    onPress={() => setSelectedExercise(exercise)}
                  >
                    <Text
                      style={[
                        styles.exerciseButtonText,
                        selectedExercise === exercise && styles.exerciseButtonTextActive,
                      ]}
                    >
                      {exercise}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Progress Chart */}
            {selectedExerciseInfo && getSelectedExerciseData() && (
              <ProgressChart 
                data={getSelectedExerciseData()!}
                title={`${selectedExercise} 중량 변화`}
              />
            )}

            {/* Exercise Stats */}
            {selectedExerciseInfo && (
              <View style={styles.statsSection}>
                <Text style={styles.statsTitle}>운동 통계</Text>
                <View style={styles.statsGrid}>
                  <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
                    <Icon name="trophy" size={24} color="#1976D2" />
                    <Text style={[styles.statValue, { color: '#1976D2' }]}>
                      {selectedExerciseInfo.personalRecord}kg
                    </Text>
                    <Text style={styles.statLabel}>개인 기록</Text>
                  </View>
                  
                  <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
                    <Icon name="trending-up" size={24} color="#7B1FA2" />
                    <Text style={[styles.statValue, { color: '#7B1FA2' }]}>
                      {selectedExerciseInfo.improvement > 0 ? '+' : ''}{selectedExerciseInfo.improvement.toFixed(1)}%
                    </Text>
                    <Text style={styles.statLabel}>향상도</Text>
                  </View>
                  
                  <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
                    <Icon name="event" size={24} color="#388E3C" />
                    <Text style={[styles.statValue, { color: '#388E3C' }]}>
                      {selectedExerciseInfo.data.length}회
                    </Text>
                    <Text style={styles.statLabel}>수행 횟수</Text>
                  </View>
                  
                  <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
                    <Icon name="fitness-center" size={24} color="#F57C00" />
                    <Text style={[styles.statValue, { color: '#F57C00' }]}>
                      {Math.round(selectedExerciseInfo.data.reduce((sum, d) => sum + d.totalVolume, 0) / 1000)}t
                    </Text>
                    <Text style={styles.statLabel}>총 볼륨</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  periodSelector: {
    paddingVertical: 16,
    paddingLeft: 20,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  improvementCard: {
    width: 150,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginLeft: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  improvementCardActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  improvementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  improvementValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  prText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  exerciseButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginLeft: 20,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exerciseButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  exerciseButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  exerciseButtonTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
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
  chartArea: {
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
  statsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});