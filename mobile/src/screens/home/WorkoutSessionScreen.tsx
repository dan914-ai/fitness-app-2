import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  PanResponder,
  Animated,
  Pressable,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/types';
import { useWorkout } from '../../contexts/WorkoutContext';
// import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { saveWorkoutToHistory } from '../../utils/workoutHistory';
import { calculateAdjustedVolume } from '../../utils/workoutCalculations';
import { exerciseDatabaseService } from '../../services/exerciseDatabase.service';
import ExercisePickerSheet from '../../components/workout/ExercisePickerSheet';
// MIGRATION: Removed unused getStaticThumbnail import
import { getThumbnail } from '../../constants/thumbnailMapping';
import { getNumericExerciseId } from '../../utils/exerciseIdMapping';
import EnhancedRestTimer from '../../components/workout/EnhancedRestTimer';
import EnhancedWorkoutTimer from '../../components/workout/EnhancedWorkoutTimer';
import { achievementService } from '../../services/achievement.service';
import LoadingState from '../../components/common/LoadingState';
import useAuth from '../../hooks/useAuth';
import AuthRequiredIndicator from '../../components/auth/AuthRequiredIndicator';
import { useSettings } from '../../hooks/useSettings';

type WorkoutSessionScreenProps = {
  navigation: StackNavigationProp<HomeStackParamList, 'WorkoutSession'>;
  route: RouteProp<HomeStackParamList, 'WorkoutSession'>;
};

const { width } = Dimensions.get('window');

interface ExerciseItem {
  id: string;
  name: string;
  sets: number;
  completedSets: number;
  isCompleted: boolean;
}

export default function WorkoutSessionScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, 'WorkoutSession'>>();
  const workout = useWorkout(); // Use local context for testing
  const { routineId } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { settings } = useSettings();
  
  // Debug: Check workout state on mount
  React.useEffect(() => {
    
    // CRITICAL: Check if workout was started
    if (!workout.state.isWorkoutActive || !workout.state.startTime) {
      console.error('[WorkoutSession] ⚠️ WARNING: Workout not active or no start time!');
      console.error('[WorkoutSession] This will cause save to fail!');
    }
  }, []);

  const [showExerciseList, setShowExerciseList] = useState(false);
  const [isDragEnabled, setIsDragEnabled] = useState(true); // Debug flag
  const [isDragging, setIsDragging] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);

  // Get ordered exercises from workout context
  const exercises = workout.getOrderedExercises();
  const exerciseItems: ExerciseItem[] = exercises ? exercises.map(ex => ({
    id: ex.exerciseId,
    name: ex.exerciseName,
    sets: ex.sets.length,
    completedSets: ex.sets.filter(s => s.completed).length,
    isCompleted: ex.isCompleted,
  })) : [];

  // Calculate workout progress
  const totalExercises = exerciseItems.length;
  const completedExercises = exerciseItems.filter(ex => ex.isCompleted).length;
  const progress = totalExercises > 0 ? completedExercises / totalExercises : 0;

  // Calculate total volume with adjustments for dumbbells and unilateral movements
  const totalVolume = exercises && exercises.length > 0 ? exercises.reduce((total, exercise) => {
    // Get exercise data to check equipment type
    const exerciseData = exerciseDatabaseService.getExerciseById(exercise.exerciseId) || 
                        exerciseDatabaseService.getExerciseByName(exercise.exerciseName);
    const equipment = exerciseData?.equipment || '기타';
    const englishName = exerciseData?.englishName || '';
    
    const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
      if (set.completed && set.weight && set.reps) {
        // Use adjusted volume calculation
        const adjustedVolume = calculateAdjustedVolume(
          parseFloat(set.weight),
          parseInt(set.reps),
          exercise.exerciseName,
          equipment,
          englishName
        );
        return setTotal + adjustedVolume;
      }
      return setTotal;
    }, 0);
    return total + exerciseVolume;
  }, 0) : 0;

  // Calculate workout duration
  const startTime = workout.state.startTime;
  const [duration, setDuration] = useState(0);

  React.useEffect(() => {
    if (!startTime) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - new Date(startTime).getTime()) / 1000);
      setDuration(diff);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [startTime]); // Fixed: Don't use getTime() - it creates infinite loop!

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExerciseTap = (exerciseId: string, exerciseName: string) => {
    navigation.navigate('ExerciseTrack', {
      exerciseId,
      exerciseName,
      routineId,
    });
  };

  const handleAddExercise = () => {
    setShowExerciseList(true);
  };

  const handleSelectExercises = (exercises: any[]) => {
    // Add each selected exercise to the workout
    exercises.forEach(exercise => {
      // Handle both formats: { id, name } from picker and { exerciseId, exerciseName } from database
      const exerciseId = exercise.id || exercise.exerciseId;
      const exerciseName = exercise.name || exercise.exerciseName;
      
      // Check if exercise is already in the workout
      if (exerciseId && !workout.state.exercises[exerciseId]) {
        workout.addExercise(exerciseId, exerciseName);
      }
    });
    setShowExerciseList(false);
  };

  const handleRemoveExercise = (exerciseId: string, exerciseName: string) => {
    Alert.alert(
      '운동 삭제',
      `"${exerciseName}"을(를) 루틴에서 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            workout.removeExercise(exerciseId);
          },
        },
      ]
    );
  };

  const handleEndWorkoutSimple = () => {
    workout.endWorkout();
    navigation.navigate('HomeScreen');
  };

  const handleEndWorkout = () => {
    Alert.alert(
      '운동 종료',
      '운동을 종료하시겠습니까?',
      [
        { 
          text: '취소', 
          style: 'cancel'
        },
        {
          text: '종료',
          onPress: async () => {
            try {
              setIsSaving(true);
              
              // DEBUG: Log the complete workout state
              
              // Check if there are any completed exercises
              const hasCompletedExercises = Object.values(workout.state.exercises).some(
                exercise => exercise.sets.some(set => set.completed)
              );
              
              if (hasCompletedExercises) {
                // Skip the savedWorkoutId check - it's causing issues
                // Always try to save the workout fresh
                /*
                if (workout.state.savedWorkoutId) {
                  setIsSaving(false);
                  // Navigate to complete screen with existing ID
                  navigation.navigate('WorkoutComplete', { workoutId: workout.state.savedWorkoutId });
                  // End workout AFTER navigation
                  setTimeout(() => workout.endWorkout(), 100);
                  return;
                }
                */
                
                // CRITICAL: Create a deep copy of the state BEFORE any modifications
                // This prevents issues if the state gets modified during async operations
                const stateToSave = {
                  ...workout.state,
                  startTime: workout.state.startTime ? new Date(workout.state.startTime) : null,
                  endTime: workout.state.endTime ? new Date(workout.state.endTime) : null,
                  exercises: { ...workout.state.exercises }
                };
                
                // Save workout to history and get the workout ID
                const workoutData = await saveWorkoutToHistory(stateToSave);
                
                // Process achievements for workout completion
                if (workoutData) {
                  try {
                    await achievementService.processEvent({
                      type: 'workout_completed',
                      data: workoutData,
                      userId: 'current_user' // Will be replaced with actual user ID
                    });
                  } catch (achError) {
                    console.error('[WorkoutSession] Achievement processing error:', achError);
                    // Continue even if achievements fail
                  }
                  
                  // Mark workout as saved
                  workout.setSavedWorkoutId(workoutData.id);
                }
                
                setIsSaving(false);
                
                // Navigate to workout complete screen with the saved workout ID
                if (workoutData && workoutData.id) {
                  
                  // Small delay to ensure storage operations complete
                  setTimeout(() => {
                    navigation.navigate('WorkoutComplete', { workoutId: workoutData.id });
                    // End workout AFTER navigation with a longer delay
                    setTimeout(() => {
                      workout.endWorkout();
                    }, 1000);
                  }, 100);
                } else {
                  Alert.alert(
                    '알림',
                    '운동이 완료되었지만 기록 저장에 실패했습니다.',
                    [
                      {
                        text: '확인',
                        onPress: () => {
                          workout.endWorkout();
                          navigation.navigate('HomeScreen');
                        }
                      }
                    ]
                  );
                }
              } else {
                // No exercises completed, just end without saving
                workout.endWorkout();
                setIsSaving(false);
                navigation.navigate('HomeScreen');
              }
            } catch (error) {
              console.error('Error in workout completion:', error);
              setIsSaving(false);
              Alert.alert(
                '오류',
                '운동 종료 중 오류가 발생했습니다.',
                [
                  { text: '재시도', onPress: () => handleEndWorkout() },
                  { text: '강제 종료', onPress: () => {
                    workout.endWorkout();
                    navigation.navigate('HomeScreen');
                  }}
                ]
              );
            }
          },
        },
      ]
    );
  };

  const renderExerciseItem = ({ item, drag, isActive }: { item: ExerciseItem, drag: () => void, isActive: boolean }) => {
    // Get exercise from database to get thumbnail
    // Convert string ID to number for database lookup
    const numericId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;
    const exercise = !isNaN(numericId) ? exerciseDatabaseService.getExerciseById(numericId) : null;
    const thumbnail = exercise?.thumbnail || null;
    
    // Debug log
    
    return (
      <Pressable
        style={({pressed}) => [
          styles.exerciseCard,
          isActive && styles.exerciseCardActive,
          item.isCompleted && styles.exerciseCardCompleted,
          pressed && {opacity: 0.8}
        ]}
        onPress={() => handleExerciseTap(item.id, item.name)}
        onLongPress={isDragEnabled ? drag : undefined}
        delayLongPress={200}
        hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}
      >
        <View style={styles.dragHandle}>
          <Icon name="drag-indicator" size={24} color={Colors.textSecondary} />
        </View>
        
        {/* Thumbnail - Always use static images */}
        <View style={styles.thumbnailContainer}>
          {thumbnail ? (
            <Image
              source={thumbnail}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
              <Icon name="fitness-center" size={20} color={Colors.textSecondary} />
            </View>
          )}
        </View>

        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseName, item.isCompleted && styles.exerciseNameCompleted]}>
            {item.name}
          </Text>
          <View style={styles.exerciseStats}>
            <Text style={styles.exerciseSets}>
              {item.completedSets}/{item.sets} 세트
            </Text>
            {item.isCompleted && (
              <View style={styles.completedBadge}>
                <Icon name="check-circle" size={16} color={Colors.success} />
                <Text style={styles.completedText}>완료</Text>
              </View>
            )}
          </View>
        </View>

        <Pressable
          style={({pressed}) => [
            styles.removeButton,
            pressed && {opacity: 0.7}
          ]}
          onPress={() => handleRemoveExercise(item.id, item.name)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Icon name="close" size={20} color={Colors.error} />
        </Pressable>
      </Pressable>
    );
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return <LoadingState message="로딩 중..." />;
  }

  // Show authentication required indicator if not authenticated
  // DISABLED FOR TESTING - Authentication check bypassed
  if (false && !isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <AuthRequiredIndicator 
          message="운동 기록을 저장하려면 로그인이 필요합니다"
          showLoginButton={true}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header isolated from gesture handlers */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <Pressable 
            style={({pressed}) => [
              styles.backButton,
              pressed && {opacity: 0.7}
            ]}
            onPress={() => {
              navigation.goBack();
            }}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Icon name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{workout.state.routineName || '운동 세션'}</Text>
            {settings.workoutTimerEnabled && <EnhancedWorkoutTimer compact={true} autoStart={true} />}
          </View>
        </View>
      </View>

      {/* Main content wrapped to prevent gesture interference */}
      <View style={styles.contentWrapper}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                { width: `${progress * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{`${completedExercises}/${totalExercises} 운동 완료`}</Text>
        </View>

        {/* Enhanced Workout Timer - Removed duplicate, using compact timer in header instead */}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="fitness-center" size={20} color={Colors.primary} />
            <Text style={styles.statValue}>{totalVolume ? `${totalVolume.toLocaleString()}kg` : '0kg'}</Text>
            <Text style={styles.statLabel}>총 볼륨</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="repeat" size={20} color={Colors.warning} />
            <Text style={styles.statValue}>{exercises && exercises.length > 0 ? exercises.reduce((total, ex) => total + ex.sets.filter(s => s.completed).length, 0) : 0}</Text>
            <Text style={styles.statLabel}>완료 세트</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="schedule" size={20} color={Colors.info} />
            <Text style={styles.statValue}>{formatDuration(duration)}</Text>
            <Text style={styles.statLabel}>운동 시간</Text>
          </View>
        </View>
      </View>

      {/* Exercise List */}
      <View style={styles.exerciseListContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>운동 목록</Text>
          <Pressable 
            style={({pressed}) => [
              styles.addButton,
              pressed && {opacity: 0.7}
            ]}
            onPress={handleAddExercise}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Icon name="add" size={20} color={Colors.primary} />
            <Text style={styles.addButtonText}>운동 추가</Text>
          </Pressable>
        </View>

        {exerciseItems.length > 0 ? (
          <ScrollView style={{flex: 1}} contentContainerStyle={styles.listContent}>
            {exerciseItems.map((item) => (
              <View key={item.id} style={{ marginBottom: 10 }}>
                {renderExerciseItem({ item, drag: () => {}, isActive: false })}
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="fitness-center" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyStateText}>운동을 추가해주세요</Text>
            <Text style={styles.emptyStateSubtext}>위의 '운동 추가' 버튼을 눌러 시작하세요</Text>
          </View>
        )}
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.bottomEndButton}
          onPress={handleEndWorkout}
          activeOpacity={0.8}
        >
          <Icon name="stop" size={24} color="#FFFFFF" />
          <Text style={styles.bottomEndButtonText}>운동 종료</Text>
        </TouchableOpacity>

        {/* Floating Action Button */}
        <Pressable 
          style={({pressed}) => [
            styles.fab,
            pressed && {transform: [{scale: 0.95}]}
          ]}
          onPress={() => {
            if (exerciseItems.length > 0) {
              const nextExercise = exerciseItems.find(ex => !ex.isCompleted);
              if (nextExercise) {
                handleExerciseTap(nextExercise.id, nextExercise.name);
              } else {
                Alert.alert('완료', '모든 운동을 완료했습니다!');
              }
            }
          }}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Icon name="play-arrow" size={28} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Exercise Picker Modal */}
      <ExercisePickerSheet
        visible={showExerciseList}
        onClose={() => setShowExerciseList(false)}
        selectedExercises={exerciseItems.map(item => item.id)}
        onSelectExercises={handleSelectExercises}
      />
      
      {/* Enhanced Rest Timer - Modal with better UI */}
      {settings.restTimerEnabled && (
        <EnhancedRestTimer 
          isActive={showRestTimer}
          onComplete={() => setShowRestTimer(false)}
          onDismiss={() => setShowRestTimer(false)}
          exerciseName={exercises[0]?.exerciseName || "운동"}
          setNumber={exercises[0]?.sets.filter(s => s.completed).length + 1 || 1}
        />
      )}
      
      {/* Loading overlay when saving */}
      {isSaving && (
        <LoadingState 
          fullScreen 
          message="운동 기록 저장 중..." 
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerWrapper: {
    zIndex: 9999,
    elevation: 999,
    position: 'relative',
  },
  contentWrapper: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  endButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.error + '20',
    borderRadius: 16,
    minWidth: 60,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endButtonText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    padding: 20,
    backgroundColor: Colors.surface,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  timerSection: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: Colors.surface,
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  exerciseListContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    marginTop: 8,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 120, // Increased to account for bottom bar
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 2,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exerciseCardActive: {
    elevation: 5,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderColor: Colors.primary,
  },
  exerciseCardCompleted: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success + '30',
  },
  dragHandle: {
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  exerciseNameCompleted: {
    color: Colors.textSecondary,
  },
  exerciseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseSets: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomEndButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  bottomEndButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
  },
  thumbnailContainer: {
    marginRight: 12,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
});