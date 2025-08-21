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
import { Colors } from '../../constants/colors';
import { getWorkoutHistory, WorkoutHistoryItem } from '../../utils/workoutHistory';
import { StatsStackScreenProps } from '../../navigation/types';

const { width: screenWidth } = Dimensions.get('window');

type WorkoutAnalyticsScreenProps = StatsStackScreenProps<'WorkoutAnalytics'>;

// Simple Bar Chart Component
const SimpleBarChart = ({ data, title, color = Colors.primary }: { data: any[], title: string, color?: string }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.barChartWrapper}>
        {data.map((item, index) => (
          <View key={index} style={styles.barColumn}>
            <Text style={styles.barValue}>{item.value}</Text>
            <View style={styles.barBackground}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: `${(item.value / maxValue) * 100}%`,
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

// Simple Line Chart Component
const SimpleLineChart = ({ data, title, unit }: { data: any[], title: string, unit: string }) => {
  if (data.length === 0) return null;

  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.lineChartWrapper}>
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>{maxValue.toFixed(0)}{unit}</Text>
          <Text style={styles.yAxisLabel}>{((maxValue + minValue) / 2).toFixed(0)}{unit}</Text>
          <Text style={styles.yAxisLabel}>{minValue.toFixed(0)}{unit}</Text>
        </View>
        <View style={styles.lineChartArea}>
          <View style={styles.gridLines}>
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
          </View>
          <View style={styles.dataLine}>
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.value - minValue) / range) * 100;
              
              return (
                <View
                  key={index}
                  style={[
                    styles.dataPoint,
                    {
                      left: `${x}%`,
                      top: `${y}%`,
                    }
                  ]}
                >
                  <View style={styles.dataPointDot} />
                </View>
              );
            })}
          </View>
          <View style={styles.xAxis}>
            {data.slice(0, 5).map((item, index) => (
              <Text key={index} style={styles.xAxisLabel}>{item.label}</Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default function WorkoutAnalyticsScreen({ navigation }: WorkoutAnalyticsScreenProps) {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    totalWorkouts: 0,
    totalDuration: 0,
    totalVolume: 0,
    avgDuration: 0,
    avgVolume: 0,
    workoutsByDay: [],
    volumeTrend: [],
    exerciseFrequency: [],
  });

  const periods = [
    { label: '1주', value: 7 },
    { label: '1개월', value: 30 },
    { label: '3개월', value: 90 },
    { label: '6개월', value: 180 },
  ];

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
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
      const totalDuration = filteredHistory.reduce((sum, w) => sum + w.duration, 0);
      const totalVolume = filteredHistory.reduce((sum, w) => sum + w.totalVolume, 0);
      const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts / 60) : 0;
      const avgVolume = totalWorkouts > 0 ? Math.round(totalVolume / totalWorkouts) : 0;
      
      // Calculate workouts by day of week
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      const workoutsByDay = dayNames.map((day, index) => ({
        label: day,
        value: filteredHistory.filter(w => new Date(w.date).getDay() === index).length,
      }));
      
      // Calculate volume trend (weekly averages)
      const volumeTrend = [];
      const weeksToShow = Math.min(Math.ceil(selectedPeriod / 7), 8);
      
      for (let i = weeksToShow - 1; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - i * 7);
        
        const weekWorkouts = filteredHistory.filter(w => {
          const date = new Date(w.date);
          return date >= weekStart && date < weekEnd;
        });
        
        const weekVolume = weekWorkouts.reduce((sum, w) => sum + w.totalVolume, 0);
        const avgVolume = weekWorkouts.length > 0 ? Math.round(weekVolume / weekWorkouts.length) : 0;
        
        volumeTrend.push({
          label: `${i + 1}주전`,
          value: Math.round(avgVolume / 1000), // Convert to tons
        });
      }
      
      // Calculate exercise frequency
      const exerciseCount: { [key: string]: number } = {};
      filteredHistory.forEach(workout => {
        workout.exercises.forEach(exercise => {
          exerciseCount[exercise.exerciseName] = (exerciseCount[exercise.exerciseName] || 0) + 1;
        });
      });
      
      const exerciseFrequency = Object.entries(exerciseCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({
          label: name.length > 10 ? name.substring(0, 10) + '...' : name,
          value: count,
        }));
      
      setWorkoutHistory(filteredHistory);
      setAnalytics({
        totalWorkouts,
        totalDuration: Math.round(totalDuration / 60), // Convert to minutes
        totalVolume: Math.round(totalVolume / 1000), // Convert to tons
        avgDuration,
        avgVolume: Math.round(avgVolume / 1000), // Convert to tons
        workoutsByDay,
        volumeTrend,
        exerciseFrequency,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>분석 데이터를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>운동 분석</Text>
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

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: '#E3F2FD' }]}>
              <Icon name="dumbbell" size={24} color="#1976D2" />
              <Text style={[styles.summaryValue, { color: '#1976D2' }]}>
                {analytics.totalWorkouts}
              </Text>
              <Text style={styles.summaryLabel}>총 운동</Text>
            </View>
            
            <View style={[styles.summaryCard, { backgroundColor: '#F3E5F5' }]}>
              <Icon name="timer-outline" size={24} color="#7B1FA2" />
              <Text style={[styles.summaryValue, { color: '#7B1FA2' }]}>
                {analytics.totalDuration}분
              </Text>
              <Text style={styles.summaryLabel}>총 시간</Text>
            </View>
          </View>
          
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: '#E8F5E9' }]}>
              <Icon name="weight-kilogram" size={24} color="#388E3C" />
              <Text style={[styles.summaryValue, { color: '#388E3C' }]}>
                {analytics.totalVolume}t
              </Text>
              <Text style={styles.summaryLabel}>총 볼륨</Text>
            </View>
            
            <View style={[styles.summaryCard, { backgroundColor: '#FFF3E0' }]}>
              <Icon name="chart-line" size={24} color="#F57C00" />
              <Text style={[styles.summaryValue, { color: '#F57C00' }]}>
                {analytics.avgVolume}t
              </Text>
              <Text style={styles.summaryLabel}>평균 볼륨</Text>
            </View>
          </View>
        </View>

        {/* Charts */}
        <SimpleBarChart 
          data={analytics.workoutsByDay} 
          title="요일별 운동 빈도" 
          color="#1976D2"
        />
        
        {analytics.volumeTrend.length > 0 && (
          <SimpleLineChart 
            data={analytics.volumeTrend} 
            title="주간 평균 볼륨 추이" 
            unit="t"
          />
        )}
        
        {analytics.exerciseFrequency.length > 0 && (
          <SimpleBarChart 
            data={analytics.exerciseFrequency} 
            title="자주 한 운동 TOP 5" 
            color="#7B1FA2"
          />
        )}

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>인사이트</Text>
          
          {analytics.totalWorkouts > 0 ? (
            <>
              <View style={styles.insightCard}>
                <Icon name="information" size={20} color={Colors.primary} />
                <Text style={styles.insightText}>
                  평균 운동 시간은 <Text style={styles.highlightText}>{analytics.avgDuration}분</Text>입니다.
                </Text>
              </View>
              
              {analytics.workoutsByDay.filter(d => d.value > 0).length > 0 && (
                <View style={styles.insightCard}>
                  <Icon name="calendar-check" size={20} color={Colors.secondary} />
                  <Text style={styles.insightText}>
                    가장 많이 운동한 요일은{' '}
                    <Text style={styles.highlightText}>
                      {analytics.workoutsByDay.reduce((max: any, curr: any) => 
                        curr.value > max.value ? curr : max
                      ).label}요일
                    </Text>입니다.
                  </Text>
                </View>
              )}
              
              <View style={styles.insightCard}>
                <Icon name="trending-up" size={20} color={Colors.accent} />
                <Text style={styles.insightText}>
                  이 기간 동안 총 <Text style={styles.highlightText}>{analytics.totalVolume}톤</Text>을 들어올렸습니다!
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.insightCard}>
              <Icon name="alert-circle" size={20} color={Colors.warning} />
              <Text style={styles.insightText}>
                선택한 기간에 운동 기록이 없습니다.
              </Text>
            </View>
          )}
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
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
  lineChartWrapper: {
    flexDirection: 'row',
    height: 180,
  },
  yAxis: {
    width: 50,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
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
    bottom: 30,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.3,
  },
  dataLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 30,
  },
  dataPoint: {
    position: 'absolute',
    alignItems: 'center',
  },
  dataPointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  xAxis: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xAxisLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  insightsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  insightText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  highlightText: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
});