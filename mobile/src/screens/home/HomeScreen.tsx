import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Dimensions } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList, HomeStackParamList } from '../../navigation/types';
import storageService from '../../services/storage.service';
import { routinesService, Routine } from '../../services/routines.service';
import { useLoading } from '../../components/common/LoadingIndicator';
import { clearAllRoutines } from '../../utils/clearAllRoutines';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugStorage } from '../../utils/debugStorage';
// Removed unused import
import { HomeScreenSkeleton } from '../../components/common/SkeletonLoaders';
import { LOADING_IDS } from '../../services/loading.service';
import { getWorkoutHistory } from '../../utils/workoutHistory';
import DOMSSurveyModal from '../../components/DOMSSurveyModal';
import { supabase } from '../../config/supabase';
import workoutProgramsService, { WorkoutProgram } from '../../services/workoutPrograms.service';

const { width } = Dimensions.get('window');

type NavigationProp = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [currentDate, setCurrentDate] = useState('');
  const [userRoutines, setUserRoutines] = useState<Routine[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { isLoadingId, withLoading } = useLoading();
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [showDOMSSurvey, setShowDOMSSurvey] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeProgram, setActiveProgram] = useState<WorkoutProgram | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState([
    { day: '월', completed: true },
    { day: '화', completed: true },
    { day: '수', completed: false },
    { day: '목', completed: false },
    { day: '금', completed: false },
    { day: '토', completed: false },
    { day: '일', completed: false },
  ]);
  const [workoutStats, setWorkoutStats] = useState({
    totalWorkouts: 0,
    averageDuration: 0
  });

  useEffect(() => {
    const date = new Date();
    const koreanDate = `${date.getMonth() + 1}월 ${date.getDate()}일`;
    setCurrentDate(koreanDate);
    
    // Get user ID and check DOMS survey
    getUserId();
    
    // Load user routines on mount
    loadUserRoutines();
  }, []);

  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('HomeScreen - User:', user);
    if (user) {
      setUserId(user.id);
      checkDOMSSurvey();
    } else {
      console.log('No user found - DOMS survey will not show');
    }
  };


  const checkDOMSSurvey = async () => {
    const today = new Date().toISOString().split('T')[0];
    const lastSurvey = await storageService.getGenericItem('lastDOMSSurvey');
    console.log('DOMS Survey Check - Today:', today, 'Last Survey:', lastSurvey);
    
    if (lastSurvey !== today) {
      // Show DOMS survey modal for morning check-in
      console.log('Showing DOMS survey modal');
      // Delay showing modal to ensure screen is fully loaded
      setTimeout(() => {
        setShowDOMSSurvey(true);
      }, 1000);
    }
  };

  // Load user routines when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.error('📢 HOME SCREEN FOCUSED - LOADING ROUTINES');
      loadUserRoutines();
      loadRecentWorkouts();
      loadActiveProgram();
    }, [])
  );

  const loadUserRoutines = async () => {
    try {
      console.log('Loading user routines...');
      
      // Load all routines from the service
      const allRoutines = await routinesService.getAllRoutines();
      
      // The program routines are already saved to storage when a program is activated,
      // so we just need to load all routines
      
      console.log(`Loaded ${allRoutines.length} routines`);
      setUserRoutines(allRoutines);
      setIsInitialLoading(false);
    } catch (error) {
      console.error('Error loading routines:', error);
      setUserRoutines([]);
      setIsInitialLoading(false);
    }
  };

  const updateWeeklyProgress = (workouts: any[]) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
    const newProgress = weekDays.map((day, index) => {
      const checkDate = new Date(startOfWeek);
      checkDate.setDate(startOfWeek.getDate() + index);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasWorkout = workouts.some(w => 
        new Date(w.date).toISOString().split('T')[0] === dateStr
      );
      
      return { day, completed: hasWorkout };
    });
    
    setWeeklyProgress(newProgress);
  };

  const loadRecentWorkouts = async () => {
    try {
      const history = await getWorkoutHistory();
      // Sort by date and get the 4 most recent workouts
      const sortedHistory = history.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecentWorkouts(sortedHistory.slice(0, 4));
      
      // Calculate stats from workout history
      if (history.length > 0) {
        // Total workouts
        const totalWorkouts = history.length;
        
        // Average duration in minutes
        const totalDuration = history.reduce((sum, w) => sum + w.duration, 0);
        const averageDuration = Math.round(totalDuration / history.length / 60);
        
        setWorkoutStats({
          totalWorkouts,
          averageDuration
        });
        
        // Update weekly progress
        updateWeeklyProgress(sortedHistory);
      }
    } catch (error) {
      console.error('최근 운동 로드 실패:', error);
    }
  };

  const loadActiveProgram = async () => {
    try {
      const program = await workoutProgramsService.getActiveProgram();
      setActiveProgram(program);
    } catch (error) {
      console.error('Error loading active program:', error);
    }
  };

  // Show skeleton loader during initial load
  if (isInitialLoading || isLoadingId(LOADING_IDS.LOAD_ROUTINES)) {
    return (
      <SafeAreaView style={styles.container}>
        <HomeScreenSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>루틴 완전 제거됨! 🧹</Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Icon name="notifications" size={24} color={Colors.text} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Active Program Banner */}
        {activeProgram && (
          <TouchableOpacity
            style={styles.activeProgramBanner}
            onPress={() => navigation.navigate('Menu', { screen: 'WorkoutPrograms' })}
          >
            <View style={styles.activeProgramContent}>
              <Icon name="fitness-center" size={24} color={Colors.primary} />
              <View style={styles.activeProgramText}>
                <Text style={styles.activeProgramLabel}>활성 프로그램</Text>
                <Text style={styles.activeProgramName}>{activeProgram.name}</Text>
                <Text style={styles.activeProgramWeek}>
                  {activeProgram.currentWeek || 1}주차 • {activeProgram.currentDay || 1}일차
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* My Routine Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>내 루틴</Text>
            <View style={styles.routineHeaderActions}>
              <TouchableOpacity onPress={() => navigation.navigate('RoutineManagement')}>
                <Text style={styles.seeAllText}>관리</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addRoutineButton}
                onPress={() => navigation.navigate('CreateRoutine')}
              >
                <Icon name="add" size={20} color={Colors.primary} />
                <Text style={styles.addRoutineText}>루틴 추가</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Saved Routines */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {console.log('🎯 RENDERING ROUTINES:', userRoutines.length, 'routines:', userRoutines.map(r => r.name))}
            {userRoutines.map((routine) => (
              <TouchableOpacity 
                key={routine.id}
                style={styles.routineCard}
                onPress={() => navigation.navigate('RoutineDetail', { routineId: routine.id, routineName: routine.name })}
              >
                <View style={styles.routineIcon}>
                  <Icon name="fitness-center" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.routineTitle}>{routine.name}</Text>
                <Text style={styles.routineExercises}>
                  {routine.exercises.length > 0 
                    ? `${routine.exercises[0].name} 외 ${routine.exercises.length - 1}개`
                    : '운동 없음'
                  }
                </Text>
                <Text style={styles.routineLastUsed}>{routine.duration}</Text>
                <TouchableOpacity 
                  style={styles.routineStartButton}
                  onPress={() => navigation.navigate('RoutineDetail', { routineId: routine.id, routineName: routine.name })}
                >
                  <Text style={styles.routineStartText}>시작</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.addRoutineCard}
              onPress={() => navigation.navigate('CreateRoutine')}
            >
              <Icon name="add-circle-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.addRoutineCardText}>새 루틴 만들기</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>


        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('기록' as any)}
          >
            <Icon name="play-arrow" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>빠른기록</Text>
          </TouchableOpacity>
          
          {/* Temporarily disabled for testing */}
          {/*<TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('RecoveryDashboard')}
          >
            <Icon name="favorite" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>회복관리</Text>
          </TouchableOpacity>*/}
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('메뉴' as any, { screen: 'WorkoutPrograms' })}
          >
            <Icon name="school" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>프로그램</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('QuickTimer')}
          >
            <Icon name="timer" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>타이머</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => {
              console.log('DOMS button pressed!');
              console.log('Current userId:', userId);
              console.log('Setting showDOMSSurvey to true');
              setShowDOMSSurvey(true);
            }}
          >
            <Icon name="assessment" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>DOMS</Text>
          </TouchableOpacity>
          
        </View>

        {/* Weekly Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이번 주 운동</Text>
          <View style={styles.weeklyProgress}>
            {weeklyProgress.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <View style={[styles.dayCircle, day.completed && styles.dayCompleted]}>
                  {day.completed && <Icon name="check" size={16} color="#FFFFFF" />}
                </View>
                <Text style={styles.dayText}>{day.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <TouchableOpacity style={styles.statCard}>
            <Icon name="fitness-center" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{workoutStats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>총 운동 횟수</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard}>
            <Icon name="timer" size={24} color="#4ECDC4" />
            <Text style={styles.statValue}>{workoutStats.averageDuration}분</Text>
            <Text style={styles.statLabel}>평균 운동시간</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Workouts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 운동</Text>
            <TouchableOpacity onPress={() => navigation.navigate('기록' as any)}>
              <Text style={styles.seeAllText}>모두 보기</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentWorkouts}>
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map((workout, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.workoutCard}
                  onPress={() => navigation.navigate('기록' as any, { 
                    screen: 'WorkoutDetail', 
                    params: { workoutId: workout.id } 
                  })}
                >
                  <View style={styles.workoutIcon}>
                    <Icon name="fitness-center" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutTitle}>{workout.routineName || '무제 운동'}</Text>
                    <Text style={styles.workoutDate}>
                      {`${new Date(workout.date).toLocaleDateString('ko-KR', { 
                        month: 'long', 
                        day: 'numeric' 
                      })} • ${Math.round(workout.duration / 60)}분`}
                    </Text>
                    <View style={styles.workoutExercises}>
                      {workout.exercises.slice(0, 2).map((exercise: any, idx: number) => (
                        <Text key={idx} style={styles.exerciseText}>
                          {exercise.exerciseName} {exercise.sets.length}세트
                        </Text>
                      ))}
                      {workout.exercises.length > 2 && (
                        <Text style={styles.exerciseText}>
                          외 {workout.exercises.length - 2}개 운동
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.repeatButton}
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent triggering the parent onPress
                      if (workout.routineId) {
                        navigation.navigate('RoutineDetail', { 
                          routineId: workout.routineId, 
                          routineName: workout.routineName 
                        });
                      } else {
                        Alert.alert(
                          '루틴 없음',
                          '이 운동은 루틴 없이 진행되었습니다.',
                          [{ text: '확인' }]
                        );
                      }
                    }}
                  >
                    <Icon name="refresh" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyWorkouts}>
                <Icon name="fitness-center" size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyWorkoutsText}>아직 운동 기록이 없습니다</Text>
                <Text style={styles.emptyWorkoutsSubtext}>첫 운동을 시작해보세요!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Calculators */}
        <View style={[styles.section, { paddingHorizontal: 14 }]}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 6 }]}>운동 계산기</Text>
          <View style={styles.calculatorGrid}>
            <TouchableOpacity 
              style={styles.calculatorCard}
              onPress={() => navigation.navigate('메뉴' as any, { screen: 'OneRMCalculator' })}
            >
              <View style={styles.calculatorIcon}>
                <Icon name="fitness-center" size={width > 360 ? 24 : 20} color={Colors.primary} />
              </View>
              <Text style={styles.calculatorTitle}>1RM 계산기</Text>
              <Text style={styles.calculatorDescription}>최대 중량 계산</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.calculatorCard}
              onPress={() => navigation.navigate('메뉴' as any, { screen: 'CalorieCalculator' })}
            >
              <View style={styles.calculatorIcon}>
                <Icon name="local-fire-department" size={width > 360 ? 24 : 20} color={Colors.warning} />
              </View>
              <Text style={styles.calculatorTitle}>칼로리 계산기</Text>
              <Text style={styles.calculatorDescription}>일일 칼로리 계산</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.calculatorCard}
              onPress={() => navigation.navigate('메뉴' as any, { screen: 'MacroCalculator' })}
            >
              <View style={styles.calculatorIcon}>
                <Icon name="pie-chart" size={width > 360 ? 24 : 20} color={Colors.success} />
              </View>
              <Text style={styles.calculatorTitle}>매크로 계산기</Text>
              <Text style={styles.calculatorDescription}>영양소 비율 계산</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Challenges - Temporarily disabled (mock data) */}
        {/*
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>진행 중인 챌린지</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>더 보기</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.challengeCard}>
            <View style={styles.challengeIcon}>
              <Icon name="emoji-events" size={24} color="#FFD700" />
            </View>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>12월 운동왕 챌린지</Text>
              <Text style={styles.challengeProgress}>현재 5위 • 참가자 128명</Text>
              <View style={styles.challengeProgressBar}>
                <View style={[styles.progressFill, { width: '70%', backgroundColor: '#FFD700' }]} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
        */}

        <View style={{ height: 20 }} />{/* Spacer */}
      </ScrollView>

      {/* DOMS Survey Modal */}
      <DOMSSurveyModal
        visible={showDOMSSurvey}
        onClose={() => {
          console.log('Closing DOMS modal');
          setShowDOMSSurvey(false);
        }}
        userId={userId || 'guest-user'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  date: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  startButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 18,
    borderRadius: 12,
    gap: 12,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeProgramBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginTop: 15,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  activeProgramContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeProgramText: {
    marginLeft: 12,
    flex: 1,
  },
  activeProgramLabel: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  activeProgramName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 2,
  },
  activeProgramWeek: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
  },
  weeklyProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dayCompleted: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.surface,
    padding: width > 360 ? 16 : 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  recentWorkouts: {
    gap: 12,
  },
  workoutCard: {
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  programCard: {
    width: 150,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
  },
  programImage: {
    width: '100%',
    height: 80,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  programTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  programDuration: {
    fontSize: 12,
    color: Colors.primary,
    marginBottom: 2,
  },
  programFrequency: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  challengeCard: {
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  challengeProgress: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  challengeProgressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
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
  routineHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  routineCard: {
    width: 160,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  routineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  routineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  routineExercises: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  routineLastUsed: {
    fontSize: 11,
    color: Colors.textLight,
    marginBottom: 12,
  },
  routineStartButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  routineStartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addRoutineCard: {
    width: 160,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
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
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: width > 360 ? 12 : 8,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: width > 360 ? 14 : 12,
    paddingHorizontal: width > 360 ? 12 : 8,
    borderRadius: 12,
    gap: width > 360 ? 8 : 4,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: width > 360 ? 14 : 12,
    fontWeight: 'bold',
  },
  workoutExercises: {
    marginTop: 4,
  },
  exerciseText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  emptyWorkouts: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyWorkoutsText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
    fontWeight: '600',
  },
  emptyWorkoutsSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  repeatButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
  },
  calculatorGrid: {
    flexDirection: 'row',
    flexWrap: 'nowrap', // Force single row
    paddingHorizontal: 6,
    justifyContent: 'space-between', // Distribute evenly
  },
  calculatorCard: {
    flex: 1, // Use flex instead of fixed width
    maxWidth: 120, // Slightly larger max width
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: width > 360 ? 12 : 10, // Adjusted padding
    marginHorizontal: 4, // Space between cards
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  calculatorIcon: {
    width: width > 360 ? 45 : 40,
    height: width > 360 ? 45 : 40,
    borderRadius: width > 360 ? 22.5 : 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  calculatorTitle: {
    fontSize: width > 360 ? 12 : 11,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 3,
  },
  calculatorDescription: {
    fontSize: width > 360 ? 10 : 9,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});