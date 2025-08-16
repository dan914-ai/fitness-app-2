import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { getWorkoutHistory } from '../../utils/workoutHistory';

const { width: screenWidth } = Dimensions.get('window');

// Custom Bar Chart Component
const CustomBarChart = ({ 
  data, 
  title, 
  height = 200,
  animate = true 
}: { 
  data: Array<{ x: string; y: number }>;
  title: string;
  height?: number;
  animate?: boolean;
}) => {
  const animatedValues = useRef(
    data.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (animate) {
      const animations = animatedValues.map((animatedValue, index) => {
        return Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          delay: index * 100,
          useNativeDriver: false,
        });
      });
      Animated.stagger(100, animations).start();
    } else {
      animatedValues.forEach(av => av.setValue(1));
    }
  }, [data]);

  const maxValue = Math.max(...data.map(d => d.y), 1);

  return (
    <View style={[styles.chartContainer, { height: height + 80 }]}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={[styles.barChartContent, { height }]}>
        {data.map((item, index) => {
          const barHeight = (item.y / maxValue) * (height - 40);
          return (
            <View key={index} style={styles.barWrapper}>
              <Text style={styles.barValue}>{item.y}</Text>
              <View style={[styles.barContainer, { height: height - 40 }]}>
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      height: animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, barHeight],
                      }),
                      backgroundColor: Colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{item.x}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Custom Line Chart Component
const CustomLineChart = ({ 
  data, 
  title, 
  height = 200,
  yAxisSuffix = '',
  animate = true 
}: { 
  data: Array<{ x: string; y: number }>;
  title: string;
  height?: number;
  yAxisSuffix?: string;
  animate?: boolean;
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (animate) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(1);
    }
  }, [data]);

  const maxValue = Math.max(...data.map(d => d.y), 1);
  const minValue = Math.min(...data.map(d => d.y), 0);
  const range = maxValue - minValue || 1;

  const getPoints = () => {
    if (dimensions.width === 0 || data.length === 0) return '';
    
    const padding = 20;
    const chartWidth = dimensions.width - padding * 2;
    const chartHeight = height - 60;
    const stepX = chartWidth / (data.length - 1);
    
    return data.map((point, index) => {
      const x = padding + index * stepX;
      const y = chartHeight - ((point.y - minValue) / range) * chartHeight + 20;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <View style={[styles.chartContainer, { height: height + 60 }]}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View 
        style={[styles.lineChartContent, { height }]}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setDimensions({ width, height });
        }}
      >
        {dimensions.width > 0 && (
          <>
            {/* Y-axis labels */}
            <View style={styles.yAxisLabels}>
              <Text style={styles.axisLabel}>{maxValue}{yAxisSuffix}</Text>
              <Text style={styles.axisLabel}>{Math.round((maxValue + minValue) / 2)}{yAxisSuffix}</Text>
              <Text style={styles.axisLabel}>{minValue}{yAxisSuffix}</Text>
            </View>
            
            {/* Chart */}
            <View style={styles.lineChartArea}>
              {Platform.OS === 'web' ? (
                <svg width="100%" height="100%" viewBox={`0 0 ${dimensions.width} ${height}`}>
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                    <line
                      key={index}
                      x1="20"
                      y1={20 + ratio * (height - 60)}
                      x2={dimensions.width - 20}
                      y2={20 + ratio * (height - 60)}
                      stroke={Colors.border}
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  ))}
                  
                  {/* Line */}
                  <Animated.polyline
                    points={getPoints()}
                    fill="none"
                    stroke={Colors.primary}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={`${dimensions.width * 2}`}
                    strokeDashoffset={animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [dimensions.width * 2, 0],
                    })}
                  />
                  
                  {/* Dots */}
                  {data.map((point, index) => {
                    const padding = 20;
                    const chartWidth = dimensions.width - padding * 2;
                    const chartHeight = height - 60;
                    const stepX = chartWidth / (data.length - 1);
                    const x = padding + index * stepX;
                    const y = chartHeight - ((point.y - minValue) / range) * chartHeight + 20;
                    
                    return (
                      <Animated.circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="4"
                        fill={Colors.primary}
                        opacity={animatedValue}
                      />
                    );
                  })}
                </svg>
              ) : (
                // For mobile, use a simpler representation
                <View style={styles.simpleLine}>
                  {data.map((point, index) => {
                    const barHeight = ((point.y - minValue) / range) * (height - 60);
                    return (
                      <View key={index} style={styles.lineBarWrapper}>
                        <Animated.View
                          style={[
                            styles.lineBar,
                            {
                              height: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, barHeight],
                              }),
                              backgroundColor: Colors.primary,
                            },
                          ]}
                        />
                      </View>
                    );
                  })}
                </View>
              )}
              
              {/* X-axis labels */}
              <View style={styles.xAxisLabels}>
                {data.map((point, index) => (
                  <Text key={index} style={styles.axisLabel}>{point.x}</Text>
                ))}
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

// Custom Pie Chart Component
const CustomPieChart = ({ 
  data, 
  title, 
  size = 200,
  animate = true 
}: { 
  data: Array<{ name: string; value: number; color: string }>;
  title: string;
  size?: number;
  animate?: boolean;
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animate) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(1);
    }
  }, [data]);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (Platform.OS === 'web') {
    let currentAngle = -90; // Start from top
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.pieChartContent}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const startX = size / 2 + (size / 2 - 20) * Math.cos((startAngle * Math.PI) / 180);
              const startY = size / 2 + (size / 2 - 20) * Math.sin((startAngle * Math.PI) / 180);
              const endX = size / 2 + (size / 2 - 20) * Math.cos((endAngle * Math.PI) / 180);
              const endY = size / 2 + (size / 2 - 20) * Math.sin((endAngle * Math.PI) / 180);
              
              const pathData = `
                M ${size / 2} ${size / 2}
                L ${startX} ${startY}
                A ${size / 2 - 20} ${size / 2 - 20} 0 ${largeArcFlag} 1 ${endX} ${endY}
                Z
              `;
              
              currentAngle = endAngle;
              
              return (
                <Animated.path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  opacity={animatedValue}
                />
              );
            })}
          </svg>
          
          <View style={styles.pieChartLegend}>
            {data.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>
                  {item.name} ({Math.round((item.value / total) * 100)}%)
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  } else {
    // For mobile, use a simpler representation with bars
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.pieChartContent}>
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            return (
              <View key={index} style={styles.pieBarItem}>
                <View style={styles.pieBarInfo}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={styles.pieBarName}>{item.name}</Text>
                  <Text style={styles.pieBarValue}>{Math.round(percentage)}%</Text>
                </View>
                <View style={styles.pieBarContainer}>
                  <Animated.View
                    style={[
                      styles.pieBar,
                      {
                        width: animatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${percentage}%`],
                        }),
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  }
};

// Progress Circle Component
const ProgressCircle = ({ 
  progress, 
  title, 
  subtitle, 
  color = Colors.primary,
  size = 80 
}: {
  progress: number;
  title: string;
  subtitle: string;
  color?: string;
  size?: number;
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.progressCircleContainer}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={Colors.border}
            strokeWidth="8"
            fill="none"
          />
          <Animated.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [circumference, 0],
            })}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <View style={[styles.progressCircleContent, { width: size, height: size }]}>
          <Text style={styles.progressTitle}>{title}</Text>
          <Text style={styles.progressSubtitle}>{subtitle}</Text>
        </View>
      </View>
    );
  } else {
    // For mobile, use a simpler circular progress
    return (
      <View style={styles.progressCircleContainer}>
        <View style={[styles.simpleCircle, { width: size, height: size }]}>
          <View style={[styles.simpleCircleInner, { borderColor: Colors.border }]}>
            <Animated.View
              style={[
                styles.simpleCircleProgress,
                {
                  borderColor: color,
                  transform: [{
                    rotate: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  }],
                },
              ]}
            />
          </View>
          <View style={styles.progressCircleContent}>
            <Text style={styles.progressTitle}>{title}</Text>
            <Text style={styles.progressSubtitle}>{subtitle}</Text>
          </View>
        </View>
      </View>
    );
  }
};

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  onPress 
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  trend?: { value: number; isPositive: boolean };
  onPress?: () => void;
}) => {
  const scaleValue = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <TouchableOpacity 
      style={styles.statCard} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.statCardContent, { transform: [{ scale: scaleValue }] }]}>
        <View style={styles.statCardHeader}>
          <Icon name={icon} size={24} color={Colors.primary} />
          {trend && (
            <View style={styles.trendContainer}>
              <Icon 
                name={trend.isPositive ? 'trending-up' : 'trending-down'} 
                size={16} 
                color={trend.isPositive ? Colors.success : Colors.error} 
              />
              <Text style={[styles.trendText, { color: trend.isPositive ? Colors.success : Colors.error }]}>
                {trend.value}%
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.statCardValue}>{value}</Text>
        <Text style={styles.statCardTitle}>{title}</Text>
        <Text style={styles.statCardSubtitle}>{subtitle}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Main Stats Screen Component
export default function StatsScreenFinal({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalDuration: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyData: [],
    volumeTrend: [],
    muscleGroupData: [],
    personalRecords: [],
  });

  const periods = [
    { label: '7일', value: 7 },
    { label: '30일', value: 30 },
    { label: '90일', value: 90 },
    { label: '1년', value: 365 },
  ];

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      const history = await getWorkoutHistory();
      setWorkoutHistory(history);

      // Filter history by selected period
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - selectedPeriod);

      const filteredHistory = history.filter((workout: any) => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= startDate && workoutDate <= endDate;
      });

      // Calculate weekly data
      const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
      const weeklyData = weekDays.map((day, index) => {
        const count = filteredHistory.filter((w: any) => {
          const date = new Date(w.date);
          return date.getDay() === index;
        }).length;
        return { x: day, y: count };
      });

      // Calculate volume trend (last 7 data points)
      const volumeTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayWorkouts = filteredHistory.filter((w: any) => {
          const workoutDate = new Date(w.date);
          return workoutDate.toDateString() === date.toDateString();
        });
        
        const totalVolume = dayWorkouts.reduce((sum: number, workout: any) => {
          return sum + workout.exercises.reduce((exerciseSum: number, exercise: any) => {
            return exerciseSum + exercise.sets.reduce((setSum: number, set: any) => {
              return setSum + (set.weight * set.reps || 0);
            }, 0);
          }, 0);
        }, 0);

        volumeTrend.push({
          x: date.getDate().toString(),
          y: Math.round(totalVolume / 1000), // Convert to tons
        });
      }

      // Calculate muscle group distribution
      const muscleGroups: { [key: string]: number } = {};
      filteredHistory.forEach((workout: any) => {
        workout.exercises.forEach((exercise: any) => {
          // Use bodyParts if available, otherwise categorize by exercise name
          if (exercise.bodyParts && exercise.bodyParts.length > 0) {
            exercise.bodyParts.forEach((part: string) => {
              muscleGroups[part] = (muscleGroups[part] || 0) + 1;
            });
          } else {
            // Fallback: categorize by exercise name patterns
            const exerciseName = exercise.exerciseName.toLowerCase();
            let group = 'Other';
            
            if (exerciseName.includes('chest') || exerciseName.includes('bench') || exerciseName.includes('fly')) {
              group = 'Chest';
            } else if (exerciseName.includes('back') || exerciseName.includes('row') || exerciseName.includes('pull')) {
              group = 'Back';
            } else if (exerciseName.includes('squat') || exerciseName.includes('leg') || exerciseName.includes('calf')) {
              group = 'Legs';
            } else if (exerciseName.includes('shoulder') || exerciseName.includes('press') || exerciseName.includes('raise')) {
              group = 'Shoulders';
            } else if (exerciseName.includes('bicep') || exerciseName.includes('tricep') || exerciseName.includes('curl')) {
              group = 'Arms';
            } else if (exerciseName.includes('core') || exerciseName.includes('abs') || exerciseName.includes('plank')) {
              group = 'Core';
            }
            
            muscleGroups[group] = (muscleGroups[group] || 0) + 1;
          }
        });
      });

      const muscleGroupColors = {
        'Chest': Colors.primary,
        'Back': Colors.secondary,
        'Legs': Colors.accent,
        'Shoulders': Colors.warning,
        'Arms': Colors.info,
        'Core': Colors.success,
        'Other': Colors.textSecondary,
      };

      const muscleGroupData = Object.entries(muscleGroups)
        .map(([name, value]) => ({
          name,
          value,
          color: muscleGroupColors[name as keyof typeof muscleGroupColors] || Colors.textSecondary,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 muscle groups

      // Calculate streaks
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Sort history by date
      const sortedHistory = [...history].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Calculate current streak
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        checkDate.setHours(0, 0, 0, 0);

        const hasWorkout = sortedHistory.some((w: any) => {
          const workoutDate = new Date(w.date);
          workoutDate.setHours(0, 0, 0, 0);
          return workoutDate.getTime() === checkDate.getTime();
        });

        if (hasWorkout) {
          if (i === 0 || i === 1) { // Today or yesterday
            currentStreak++;
          } else if (currentStreak > 0) {
            currentStreak++;
          }
        } else if (currentStreak > 0 && i > 1) {
          break;
        }
      }

      // Calculate longest streak (simplified)
      longestStreak = Math.max(currentStreak, Math.floor(history.length / 3));

      // Calculate total duration (convert from seconds to minutes)
      const totalDuration = filteredHistory.reduce((sum: number, workout: any) => 
        sum + Math.floor((workout.duration || 0) / 60), 0
      );

      setStats({
        totalWorkouts: filteredHistory.length,
        totalDuration,
        currentStreak,
        longestStreak,
        weeklyData,
        volumeTrend,
        muscleGroupData,
        personalRecords: [], // TODO: Calculate PRs
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>운동 통계</Text>
        <TouchableOpacity onPress={() => {}}>
          <Icon name="download" size={24} color={Colors.primary} />
        </TouchableOpacity>
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>운동 개요</Text>
        <View style={styles.cardGrid}>
          <View style={styles.cardRow}>
            <StatCard
              title="총 운동"
              value={stats.totalWorkouts}
              subtitle="회"
              icon="dumbbell"
              trend={stats.totalWorkouts > 0 ? { value: 12.5, isPositive: true } : undefined}
            />
            <StatCard
              title="총 시간"
              value={formatDuration(stats.totalDuration)}
              subtitle="누적 운동 시간"
              icon="clock-outline"
            />
          </View>
          <View style={styles.cardRow}>
            <StatCard
              title="현재 스트릭"
              value={stats.currentStreak}
              subtitle="연속 일수"
              icon="fire"
            />
            <StatCard
              title="최장 스트릭"
              value={stats.longestStreak}
              subtitle="최고 기록"
              icon="trophy"
            />
          </View>
        </View>
      </View>

      {/* Progress Circles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>진행 상황</Text>
        <View style={styles.circlesContainer}>
          <ProgressCircle
            progress={Math.min(100, (stats.currentStreak / 7) * 100)}
            title={`${stats.currentStreak}일`}
            subtitle="연속 운동"
            color={Colors.success}
          />
          <ProgressCircle
            progress={Math.min(100, (stats.totalWorkouts / selectedPeriod) * 100)}
            title={`${Math.round((stats.totalWorkouts / selectedPeriod) * 100)}%`}
            subtitle="운동 빈도"
            color={Colors.primary}
          />
          <ProgressCircle
            progress={Math.min(100, (stats.totalDuration / (selectedPeriod * 60)) * 100)}
            title={`${Math.round(stats.totalDuration / selectedPeriod)}분`}
            subtitle="일 평균"
            color={Colors.warning}
          />
        </View>
      </View>

      {/* Weekly Frequency Chart */}
      <CustomBarChart
        data={stats.weeklyData}
        title="요일별 운동 빈도"
        height={180}
      />

      {/* Volume Trend Chart */}
      <CustomLineChart
        data={stats.volumeTrend}
        title="볼륨 추이 (톤)"
        height={180}
        yAxisSuffix="t"
      />

      {/* Muscle Group Distribution */}
      {stats.muscleGroupData.length > 0 && (
        <CustomPieChart
          data={stats.muscleGroupData}
          title="운동 부위 분포"
          size={200}
        />
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>빠른 메뉴</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              // Navigate to Record tab and then to WorkoutHistory
              navigation.navigate('기록', {
                screen: 'WorkoutHistory'
              });
            }}
          >
            <Icon name="history" size={32} color={Colors.primary} />
            <Text style={styles.actionTitle}>운동 기록</Text>
            <Text style={styles.actionSubtitle}>전체 기록 보기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {}}
          >
            <Icon name="medal" size={32} color={Colors.secondary} />
            <Text style={styles.actionTitle}>개인 기록</Text>
            <Text style={styles.actionSubtitle}>최고 기록</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {}}
          >
            <Icon name="ruler" size={32} color={Colors.accent} />
            <Text style={styles.actionTitle}>신체 측정</Text>
            <Text style={styles.actionSubtitle}>체중, 둘레</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {}}
          >
            <Icon name="target" size={32} color={Colors.warning} />
            <Text style={styles.actionTitle}>목표</Text>
            <Text style={styles.actionSubtitle}>목표 관리</Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  cardGrid: {
    gap: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }),
  },
  statCardContent: {
    padding: 16,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statCardTitle: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  statCardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  circlesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  progressCircleContainer: {
    alignItems: 'center',
  },
  progressCircleContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  progressSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  simpleCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleCircleInner: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 50,
    borderWidth: 8,
  },
  simpleCircleProgress: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 50,
    borderWidth: 8,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }),
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  barChartContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barValue: {
    fontSize: 12,
    color: Colors.text,
    marginBottom: 4,
  },
  barContainer: {
    width: '70%',
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
  lineChartContent: {
    position: 'relative',
  },
  lineChartArea: {
    flex: 1,
  },
  yAxisLabels: {
    position: 'absolute',
    left: 0,
    top: 20,
    bottom: 40,
    justifyContent: 'space-between',
  },
  axisLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: 0,
    left: 40,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  simpleLine: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingBottom: 20,
    paddingTop: 20,
  },
  lineBarWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  lineBar: {
    width: '80%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  pieChartContent: {
    alignItems: 'center',
  },
  pieChartLegend: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pieBarItem: {
    marginBottom: 12,
  },
  pieBarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pieBarName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  pieBarValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  pieBarContainer: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  pieBar: {
    height: '100%',
    borderRadius: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (screenWidth - 52) / 2,
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }),
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 12,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});