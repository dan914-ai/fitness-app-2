import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { RecordStackScreenProps } from '../../navigation/types';
import { workoutService } from '../../services/workout.service';
import WorkoutCalendar from '../../components/calendar/WorkoutCalendar';
import { routinesService } from '../../services/routines.service';
import { useFocusEffect } from '@react-navigation/native';
import storageService from '../../services/storage.service';
import { getWorkoutHistory, WorkoutHistoryItem } from '../../utils/workoutHistory';

const { width } = Dimensions.get('window');

type RecordScreenProps = RecordStackScreenProps<'RecordMain'>;

interface QuickStats {
  totalWorkouts: number;
  thisWeekWorkouts: number;
  totalVolume: number;
  averageDuration: number;
}

export default function RecordScreen({ navigation }: RecordScreenProps) {
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalWorkouts: 12,
    thisWeekWorkouts: 3,
    totalVolume: 5420,
    averageDuration: 45,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [workoutDates, setWorkoutDates] = useState<Date[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [photoDates, setPhotoDates] = useState<Date[]>([
    new Date(2025, 0, 10),
    new Date(2025, 0, 20),
  ]);
  const [measurementDates, setMeasurementDates] = useState<Date[]>([
    new Date(2025, 0, 1),
    new Date(2025, 0, 15),
  ]);
  const [savedRoutines, setSavedRoutines] = useState<any[]>([]);
  const [isLoadingRoutines, setIsLoadingRoutines] = useState(true);

  // Load routines and workout history when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRoutines();
      loadWorkoutHistory();
    }, [])
  );

  const loadWorkoutHistory = async () => {
    try {
      // Load actual workout history
      const history = await getWorkoutHistory();
      
      // Extract dates from workout history for calendar
      const dates = history.map(workout => new Date(workout.date));
      setWorkoutDates(dates);
      
      // Get recent workouts (last 5)
      const recent = history.slice(0, 5);
      setRecentWorkouts(recent);
      
      // Calculate stats
      if (history.length > 0) {
        const totalVolume = history.reduce((sum, w) => sum + w.totalVolume, 0);
        const avgDuration = Math.floor(history.reduce((sum, w) => sum + w.duration, 0) / history.length / 60);
        
        // Get this week's workouts
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const thisWeekWorkouts = history.filter(w => new Date(w.date) >= weekStart).length;
        
        setQuickStats({
          totalWorkouts: history.length,
          thisWeekWorkouts,
          totalVolume,
          averageDuration: avgDuration,
        });
      }
    } catch (error) {
      console.error('Error loading workout history:', error);
    }
  };

  const loadRoutines = async () => {
    try {
      setIsLoadingRoutines(true);
      
      // REMOVED: No longer initializing default routines
      // await routinesService.initializeDefaultRoutines();
      
      // Get all routines from the service
      const routines = await routinesService.getAllRoutines();
      
      // Format routines for display
      const formattedRoutines = routines.map(routine => ({
        id: routine.id,
        name: routine.name,
        exercises: routine.exercises.map(ex => ex.name),
        lastUsed: routine.lastUsed ? new Date(routine.lastUsed).toLocaleDateString('ko-KR') : '없음',
        totalExercises: routine.exercises.length,
      }));
      
      setSavedRoutines(formattedRoutines);
    } catch (error) {
      console.error('Error loading routines:', error);
    } finally {
      setIsLoadingRoutines(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return '-';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}시간 ${remainingMinutes}분`;
    }
    return `${remainingMinutes}분`;
  };

  const startRoutine = (routineId: string, routineName: string) => {
    // Navigate to routine detail screen to start workout
    try {
      navigation.navigate('홈', {
        screen: 'RoutineDetail',
        params: {
          routineId,
          routineName,
        },
      });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Navigate to workout history filtered by date
    navigation.navigate('WorkoutHistory', { selectedDate: date });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>기록</Text>
          <Text style={styles.subtitle}>운동을 기록하고 진행 상황을 확인하세요</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              try {
                navigation.navigate('WorkoutHistory');
              } catch (error) {
                console.error('Navigation error:', error);
              }
            }}
          >
            <Icon name="history" size={32} color={Colors.primary} />
            <Text style={styles.actionButtonText}>운동 기록</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('InBodyScreen')}
          >
            <Icon name="assessment" size={32} color={Colors.primary} />
            <Text style={styles.actionButtonText}>InBody</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar View */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>월별 활동</Text>
          <View style={styles.calendarContainer}>
            <WorkoutCalendar
              workoutDates={workoutDates}
              photoDates={photoDates}
              measurementDates={measurementDates}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
          </View>
        </View>

        {/* My Routines Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>내 루틴</Text>
            <TouchableOpacity 
              style={styles.addRoutineButton}
              onPress={() => navigation.navigate('홈', { screen: 'CreateRoutine' })}
            >
              <Icon name="add" size={20} color={Colors.primary} />
              <Text style={styles.addRoutineText}>루틴 추가</Text>
            </TouchableOpacity>
          </View>

          {isLoadingRoutines ? (
            <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routinesList}>
              {savedRoutines.map((routine) => (
              <View key={routine.id} style={styles.routineCard}>
                <View style={styles.routineContent}>
                  <View style={styles.routineHeader}>
                    <Text style={styles.routineName}>{routine.name}</Text>
                    <TouchableOpacity style={styles.routineMenu}>
                      <Icon name="more-vert" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.routineExercises}>
                    {routine.exercises.slice(0, 3).map((exercise, index) => (
                      <Text key={index} style={styles.exerciseItem}>{`• ${exercise}`}</Text>
                    ))}
                    {routine.totalExercises > 3 && (
                      <Text style={styles.moreExercises}>
                        +{routine.totalExercises - 3}개 더
                      </Text>
                    )}
                  </View>

                  <Text style={styles.lastUsed}>마지막: {routine.lastUsed}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.startRoutineButton}
                  onPress={() => startRoutine(routine.id, routine.name)}
                >
                  <Icon name="play-arrow" size={18} color="#FFFFFF" />
                  <Text style={styles.startRoutineText}>시작</Text>
                </TouchableOpacity>
              </View>
              ))}

              {/* Add New Routine Card */}
            <TouchableOpacity 
              style={styles.addRoutineCard}
              onPress={() => navigation.navigate('홈', { screen: 'CreateRoutine' })}
            >
              <Icon name="add-circle-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.addRoutineCardText}>새 루틴 만들기</Text>
            </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* Weekly Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이번 주 요약</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="fitness-center" size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{quickStats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>총 운동</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="event" size={24} color={Colors.secondary} />
              <Text style={styles.statValue}>{quickStats.thisWeekWorkouts}</Text>
              <Text style={styles.statLabel}>이번 주</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="fitness-center" size={24} color={Colors.accent} />
              <Text style={styles.statValue}>{quickStats.totalVolume.toLocaleString()}</Text>
              <Text style={styles.statLabel}>총 볼륨(kg)</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="timer" size={24} color={Colors.warning} />
              <Text style={styles.statValue}>{formatDuration(quickStats.averageDuration)}</Text>
              <Text style={styles.statLabel}>평균 시간</Text>
            </View>
          </View>
        </View>

        {/* Recent Workouts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 운동</Text>
            <TouchableOpacity onPress={() => navigation.navigate('WorkoutHistory', undefined)}>
              <Text style={styles.seeAllText}>전체보기</Text>
            </TouchableOpacity>
          </View>

          {recentWorkouts.length === 0 ? (
            <View style={styles.emptyWorkouts}>
              <Icon name="fitness-center" size={48} color={Colors.textLight} />
              <Text style={styles.emptyWorkoutsText}>아직 운동 기록이 없습니다</Text>
              <Text style={styles.emptyWorkoutsSubtext}>운동을 시작하고 기록을 남겨보세요!</Text>
            </View>
          ) : (
            recentWorkouts.map((workout) => (
              <TouchableOpacity
                key={workout.id}
                style={styles.workoutCard}
                onPress={() => navigation.navigate('WorkoutDetail', { workoutId: workout.id })}
              >
                <View style={styles.workoutIcon}>
                  <Icon name="fitness-center" size={24} color={Colors.primary} />
                </View>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutTitle}>{workout.routineName}</Text>
                  <Text style={styles.workoutDate}>
                    {new Date(workout.startTime).toLocaleDateString('ko-KR', {
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })} • {Math.floor(workout.duration / 60)}분
                  </Text>
                  <View style={styles.workoutStats}>
                    <Text style={styles.workoutStat}>
                      {workout.exercises.length}개 운동
                    </Text>
                    <Text style={styles.workoutStat}>
                      {workout.totalVolume.toLocaleString()}kg
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.repeatButton}
                  onPress={() => {
                    // Navigate to the routine with the same exercises
                    if (workout.routineId) {
                      navigation.navigate('홈', {
                        screen: 'RoutineDetail',
                        params: {
                          routineId: workout.routineId,
                          routineName: workout.routineName,
                        },
                      });
                    } else {
                      // If no routine ID, show alert
                      Alert.alert(
                        '루틴 없음',
                        '이 운동은 루틴 없이 진행되었습니다. 루틴을 만들어 운동을 반복해보세요.',
                        [{ text: '확인' }]
                      );
                    }
                  }}
                >
                  <Icon name="refresh" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 20 }} />
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
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
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
  quickActions: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  primaryAction: {
    backgroundColor: Colors.primary,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  actionButtonText: {
    color: Colors.text,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  calendarContainer: {
    paddingHorizontal: 20,
  },
  addRoutineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addRoutineText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
  },
  routinesList: {
    paddingLeft: 20,
  },
  routineCard: {
    width: 200,
    height: 200,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    justifyContent: 'space-between',
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  routineMenu: {
    padding: 4,
  },
  routineContent: {
    flex: 1,
  },
  routineExercises: {
    marginBottom: 12,
  },
  exerciseItem: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  moreExercises: {
    fontSize: 13,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },
  lastUsed: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 12,
  },
  startRoutineButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  startRoutineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addRoutineCard: {
    width: 200,
    height: 200,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addRoutineCardText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  workoutCard: {
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  workoutDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  workoutStats: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 12,
  },
  workoutStat: {
    fontSize: 12,
    color: Colors.textLight,
  },
  repeatButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
  },
  loader: {
    paddingVertical: 40,
  },
  emptyWorkouts: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyWorkoutsText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyWorkoutsSubtext: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
});