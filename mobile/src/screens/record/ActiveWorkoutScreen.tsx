import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { RecordStackScreenProps } from '../../navigation/types';
import { Workout, WorkoutExercise, ExerciseSet, Exercise } from '../../types';
import { workoutService } from '../../services/workout.service';

type ActiveWorkoutScreenProps = RecordStackScreenProps<'ActiveWorkout'>;

interface WorkoutTimer {
  totalSeconds: number;
  isRunning: boolean;
}

interface RestTimer {
  seconds: number;
  isActive: boolean;
  targetSeconds: number;
}

interface PreviousWorkoutData {
  sets: ExerciseSet[];
  maxWeight: number;
  totalVolume: number;
  lastWorkoutDate: string;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ActiveWorkoutScreen({ navigation, route }: ActiveWorkoutScreenProps) {
  const { workoutId } = route.params;
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [workoutTimer, setWorkoutTimer] = useState<WorkoutTimer>({ totalSeconds: 0, isRunning: true });
  const [restTimer, setRestTimer] = useState<RestTimer>({ seconds: 0, isActive: false, targetSeconds: 0 });
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompletingWorkout, setIsCompletingWorkout] = useState(false);
  const [restModalVisible, setRestModalVisible] = useState(false);
  const [previousWorkoutData, setPreviousWorkoutData] = useState<Map<string, PreviousWorkoutData>>(new Map());
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  
  const workoutIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    loadWorkout();
    startWorkoutTimer();

    return () => {
      if (workoutIntervalRef.current) clearInterval(workoutIntervalRef.current);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (restTimer.isActive && restTimer.seconds > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTimer(prev => {
          if (prev.seconds <= 1) {
            setRestModalVisible(false);
            playCompletionSound();
            return { ...prev, seconds: 0, isActive: false };
          }
          return { ...prev, seconds: prev.seconds - 1 };
        });
      }, 1000);
    } else {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
    }

    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [restTimer.isActive]); // FIX: Remove restTimer.seconds to prevent infinite loop

  const loadWorkout = async () => {
    try {
      const workoutData = await workoutService.getWorkoutById(workoutId);
      setWorkout(workoutData);
      
      // Load previous workout data for each exercise
      const previousData = new Map<string, PreviousWorkoutData>();
      // This would normally fetch from API - simulating for now
      workoutData.exercises.forEach(exercise => {
        previousData.set(exercise.exercise.exerciseId, {
          sets: [],
          maxWeight: 0,
          totalVolume: 0,
          lastWorkoutDate: new Date().toISOString(),
        });
      });
      setPreviousWorkoutData(previousData);
    } catch (error) {
      console.error('Error loading workout:', error);
      Alert.alert('오류', '운동 데이터를 불러올 수 없습니다.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const startWorkoutTimer = () => {
    workoutIntervalRef.current = setInterval(() => {
      setWorkoutTimer(prev => ({
        ...prev,
        totalSeconds: prev.totalSeconds + 1,
      }));
    }, 1000);
  };

  const playCompletionSound = () => {
    // Play sound effect when rest timer completes
  };

  const addSet = async (workoutExerciseId: string, setData: Partial<ExerciseSet>) => {
    try {
      const newSet = await workoutService.addExerciseSet(workoutExerciseId, {
        reps: setData.reps,
        weight: setData.weight,
        duration: setData.duration,
        restTime: setData.restTime,
        isWarmup: setData.isWarmup || false,
      });
      
      // Log setId to verify uniqueness
      
      // Update local workout state and check if we should prompt for next exercise
      let shouldPromptNext = false;
      let exerciseIndexForNext = -1;
      
      setWorkout(prev => {
        if (!prev) return prev;
        
        const updatedExercises = prev.exercises.map((exercise, index) => {
          if (exercise.workoutExerciseId === workoutExerciseId) {
            const updatedSets = [...exercise.sets, newSet];
            
            // Check if this exercise now has enough sets (using fresh data)
            if (updatedSets.length >= 3) {
              shouldPromptNext = true;
              exerciseIndexForNext = index;
            }
            
            return {
              ...exercise,
              sets: updatedSets,
            };
          }
          return exercise;
        });
        
        return {
          ...prev,
          exercises: updatedExercises,
        };
      });

      // Show prompt outside of setState to avoid side effects in updater
      if (shouldPromptNext && exerciseIndexForNext >= 0) {
        // Use setTimeout to ensure state has updated
        setTimeout(() => {
          Alert.alert(
            '운동 완료',
            '다음 운동으로 이동하시겠습니까?',
            [
              { text: '계속하기', style: 'cancel' },
              { 
                text: '다음 운동', 
                onPress: () => {
                  setCurrentExerciseIndex(prev => {
                    // Ensure we don't go past the last exercise
                    const nextIndex = exerciseIndexForNext + 1;
                    const maxIndex = workout?.exercises.length ? workout.exercises.length - 1 : prev;
                    return Math.min(nextIndex, maxIndex);
                  });
                }
              },
            ]
          );
        }, 0);
      }
    } catch (error) {
      console.error('Error adding set:', error);
      Alert.alert('오류', '세트를 추가할 수 없습니다.');
    }
  };

  const updateSet = async (setId: string, setData: Partial<ExerciseSet>) => {
    try {
      const updatedSet = await workoutService.updateExerciseSet(setId, setData);
      
      // Update local workout state
      setWorkout(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          exercises: prev.exercises.map(exercise => {
            // Only update the exercise that actually contains this setId
            if (!exercise.sets.some(s => s.setId === setId)) {
              return exercise;
            }
            return {
              ...exercise,
              sets: exercise.sets.map(s => s.setId === setId ? updatedSet : s),
            };
          }),
        };
      });
    } catch (error) {
      console.error('Error updating set:', error);
      Alert.alert('오류', '세트를 업데이트할 수 없습니다.');
    }
  };

  const startRestTimer = (seconds: number) => {
    setRestTimer({
      seconds,
      isActive: true,
      targetSeconds: seconds,
    });
    setRestModalVisible(true);
    
    // Animate rest timer modal
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const addExerciseToWorkout = async (exercise: Exercise) => {
    // Implementation to add exercise to current workout
    setShowExerciseModal(false);
    Alert.alert('알림', `${exercise.exerciseName}이(가) 추가되었습니다.`);
  };

  const completeWorkout = async () => {
    Alert.alert(
      '운동 완료',
      '정말로 운동을 완료하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '완료',
          onPress: async () => {
            setIsCompletingWorkout(true);
            try {
              const endTime = new Date().toISOString();
              await workoutService.updateWorkout(workoutId, {
                endTime,
                totalCalories: calculateEstimatedCalories(),
                workoutRating: 5, // Default rating, will be customizable in complete screen
              });
              
              navigation.replace('WorkoutComplete', { workoutId });
            } catch (error) {
              console.error('Error completing workout:', error);
              Alert.alert('오류', '운동을 완료할 수 없습니다.');
            } finally {
              setIsCompletingWorkout(false);
            }
          },
        },
      ]
    );
  };

  const calculateEstimatedCalories = (): number => {
    // Simple calorie estimation based on duration and intensity
    const minutes = Math.floor(workoutTimer.totalSeconds / 60);
    const caloriesPerMinute = 8; // Average for strength training
    return Math.round(minutes * caloriesPerMinute);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading || !workout) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>운동을 불러오는 중...</Text>
      </View>
    );
  }

  // FIX: Add bounds checking to prevent index out of range errors
  const safeIndex = Math.min(Math.max(0, currentExerciseIndex), workout.exercises.length - 1);
  const currentExercise = workout.exercises[safeIndex];
  
  if (!currentExercise) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>운동을 찾을 수 없습니다</Text>
      </View>
    );
  }
  
  const currentVolume = workoutService.getTotalVolume(currentExercise.sets);
  const previousData = previousWorkoutData.get(currentExercise.exercise.exerciseId);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>운동 시간</Text>
          <Text style={styles.timer}>{formatTime(workoutTimer.totalSeconds)}</Text>
        </View>
        <TouchableOpacity style={styles.addExerciseButton} onPress={() => setShowExerciseModal(true)}>
          <Text style={styles.addExerciseButtonText}>+ 운동 추가</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.completeButton} onPress={completeWorkout}>
          <Text style={styles.completeButtonText}>완료</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${((safeIndex + 1) / workout.exercises.length) * 100}%` }
          ]} 
        />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseNumber}>
            {safeIndex + 1} / {workout.exercises.length}
          </Text>
          <Text style={styles.exerciseName}>{currentExercise.exercise.exerciseName}</Text>
          <Text style={styles.exerciseDetails}>
            {`${currentExercise.exercise.muscleGroup} • ${currentExercise.exercise.difficulty}`}
          </Text>
          
          {previousData && previousData.sets.length > 0 && (
            <View style={styles.previousWorkoutInfo}>
              <Text style={styles.previousWorkoutTitle}>이전 운동 기록</Text>
              <Text style={styles.previousWorkoutText}>
                {`최대 무게: ${previousData.maxWeight}kg • 총 볼륨: ${previousData.totalVolume.toLocaleString()}kg`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.volumeInfo}>
          <Text style={styles.volumeLabel}>현재 볼륨</Text>
          <Text style={styles.volumeValue}>{currentVolume.toLocaleString()} kg</Text>
        </View>

        <ExerciseTracker
          key={currentExercise.workoutExerciseId}
          workoutExercise={currentExercise}
          onAddSet={addSet}
          onUpdateSet={updateSet}
          onStartRest={startRestTimer}
          previousData={previousData}
        />

        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, safeIndex === 0 && styles.navButtonDisabled]}
            onPress={() => setCurrentExerciseIndex(prev => Math.max(0, prev - 1))}
            disabled={safeIndex === 0}
          >
            <Text style={styles.navButtonText}>이전 운동</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navButton, safeIndex === workout.exercises.length - 1 && styles.navButtonDisabled]}
            onPress={() => setCurrentExerciseIndex(prev => Math.min(workout.exercises.length - 1, prev + 1))}
            disabled={safeIndex === workout.exercises.length - 1}
          >
            <Text style={styles.navButtonText}>다음 운동</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <RestTimerModal
        visible={restModalVisible}
        restTimer={restTimer}
        onClose={() => setRestModalVisible(false)}
        onSkip={() => {
          setRestTimer(prev => ({ ...prev, isActive: false, seconds: 0 }));
          setRestModalVisible(false);
        }}
        onAddTime={() => {
          setRestTimer(prev => ({ ...prev, seconds: prev.seconds + 30 }));
        }}
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
      />

      <ExerciseSelectionModal
        visible={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        onSelectExercise={addExerciseToWorkout}
      />

      {isCompletingWorkout && (
        <View style={styles.completingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.completingText}>운동을 완료하는 중...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

interface ExerciseTrackerProps {
  workoutExercise: WorkoutExercise;
  onAddSet: (workoutExerciseId: string, setData: Partial<ExerciseSet>) => void;
  onUpdateSet: (setId: string, setData: Partial<ExerciseSet>) => void;
  onStartRest: (seconds: number) => void;
  previousData?: PreviousWorkoutData;
}

function ExerciseTracker({ workoutExercise, onAddSet, onUpdateSet, onStartRest, previousData }: ExerciseTrackerProps) {
  const [newSet, setNewSet] = useState<Partial<ExerciseSet>>({
    reps: undefined,
    weight: undefined,
  });
  const [selectedRestTime, setSelectedRestTime] = useState(60);

  // Reset input state when exercise changes
  useEffect(() => {
    setNewSet({
      reps: undefined,
      weight: undefined,
    });
    // Reset to default rest time if needed
    setSelectedRestTime(60);
  }, [workoutExercise.workoutExerciseId]);

  const handleAddSet = () => {
    if (!newSet.reps && !newSet.weight) {
      Alert.alert('알림', '횟수 또는 무게를 입력해주세요.');
      return;
    }

    onAddSet(workoutExercise.workoutExerciseId, newSet);
    setNewSet({ reps: newSet.reps, weight: newSet.weight }); // Keep same values for next set
    
    // Start rest timer
    onStartRest(selectedRestTime);
  };

  const restTimeOptions = [30, 60, 90, 120, 180];

  return (
    <View style={styles.tracker}>
      <View style={styles.setsHeader}>
        <Text style={styles.setsTitle}>세트</Text>
        <View style={styles.restTimeSelector}>
          <Text style={styles.restTimeSelectorLabel}>휴식 시간:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {restTimeOptions.map(time => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.restTimeOption,
                  selectedRestTime === time && styles.restTimeOptionActive
                ]}
                onPress={() => setSelectedRestTime(time)}
              >
                <Text style={[
                  styles.restTimeOptionText,
                  selectedRestTime === time && styles.restTimeOptionTextActive
                ]}>
                  {time < 60 ? `${time}초` : `${time / 60}분`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.setsGrid}>
        <View style={styles.gridHeader}>
          <Text style={styles.gridHeaderText}>세트</Text>
          <Text style={styles.gridHeaderText}>이전</Text>
          <Text style={styles.gridHeaderText}>무게</Text>
          <Text style={styles.gridHeaderText}>횟수</Text>
          <Text style={styles.gridHeaderText}>✓</Text>
        </View>

        {workoutExercise.sets.map((set, index) => (
          <SetRow
            key={set.setId}
            set={set}
            setNumber={index + 1}
            previousSet={previousData?.sets[index]}
            onUpdate={(data) => onUpdateSet(set.setId, data)}
          />
        ))}

        <View style={styles.addSetRow}>
          <Text style={styles.setNumber}>{workoutExercise.sets.length + 1}</Text>
          <Text style={styles.previousSetData}>-</Text>
          <TextInput
            style={styles.setInput}
            placeholder="0"
            keyboardType="decimal-pad"
            value={newSet.weight?.toString() || ''}
            onChangeText={(value) => setNewSet(prev => ({ ...prev, weight: value ? parseFloat(value) : undefined }))}
          />
          <TextInput
            style={styles.setInput}
            placeholder="0"
            keyboardType="numeric"
            value={newSet.reps?.toString() || ''}
            onChangeText={(value) => setNewSet(prev => ({ ...prev, reps: value ? parseInt(value) : undefined }))}
          />
          <TouchableOpacity style={styles.addSetButton} onPress={handleAddSet}>
            <Text style={styles.addSetButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

interface SetRowProps {
  set: ExerciseSet;
  setNumber: number;
  previousSet?: ExerciseSet;
  onUpdate: (data: Partial<ExerciseSet>) => void;
}

function SetRow({ set, setNumber, previousSet, onUpdate }: SetRowProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [localWeight, setLocalWeight] = useState(set.weight?.toString() || '');
  const [localReps, setLocalReps] = useState(set.reps?.toString() || '');

  const toggleComplete = () => {
    const newCompleted = !isCompleted;
    setIsCompleted(newCompleted);
    
    if (newCompleted) {
      onUpdate({
        weight: localWeight ? parseFloat(localWeight) : undefined,
        reps: localReps ? parseInt(localReps) : undefined,
      });
    }
  };

  const previousInfo = previousSet ? `${previousSet.weight || 0}kg x ${previousSet.reps || 0}` : '-';

  return (
    <View style={[styles.setRow, isCompleted && styles.setRowCompleted]}>
      <Text style={styles.setNumber}>{setNumber}</Text>
      <Text style={styles.previousSetData}>{previousInfo}</Text>
      <TextInput
        style={[styles.setInput, isCompleted && styles.setInputCompleted]}
        placeholder="0"
        keyboardType="decimal-pad"
        value={localWeight}
        onChangeText={setLocalWeight}
        editable={!isCompleted}
      />
      <TextInput
        style={[styles.setInput, isCompleted && styles.setInputCompleted]}
        placeholder="0"
        keyboardType="numeric"
        value={localReps}
        onChangeText={setLocalReps}
        editable={!isCompleted}
      />
      <TouchableOpacity
        style={[styles.completeSetButton, isCompleted && styles.completeSetButtonActive]}
        onPress={toggleComplete}
      >
        <Text style={[styles.completeSetButtonText, isCompleted && styles.completeSetButtonTextActive]}>
          {isCompleted ? '✓' : ''}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

interface RestTimerModalProps {
  visible: boolean;
  restTimer: RestTimer;
  onClose: () => void;
  onSkip: () => void;
  onAddTime: () => void;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
}

function RestTimerModal({ visible, restTimer, onClose, onSkip, onAddTime, fadeAnim, slideAnim }: RestTimerModalProps) {
  const progress = restTimer.targetSeconds > 0 ? (restTimer.targetSeconds - restTimer.seconds) / restTimer.targetSeconds : 0;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(rotation, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [progress, visible]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.modalOverlay,
        { opacity: fadeAnim }
      ]}
    >
      <Animated.View 
        style={[
          styles.restModal,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        <Text style={styles.restTitle}>휴식 시간</Text>
        <View style={styles.timerCircle}>
          <Text style={styles.restTimer}>
            {`${Math.floor(restTimer.seconds / 60)}:${(restTimer.seconds % 60).toString().padStart(2, '0')}`}
          </Text>
          <Animated.View 
            style={[
              styles.progressCircle,
              {
                transform: [{
                  rotate: rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }]
              }
            ]}
          />
        </View>

        <View style={styles.restActions}>
          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipButtonText}>건너뛰기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addTimeButton} onPress={onAddTime}>
            <Text style={styles.addTimeButtonText}>+30초</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

interface ExerciseSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

function ExerciseSelectionModal({ visible, onClose, onSelectExercise }: ExerciseSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadExercises();
    }
  }, [visible]);

  const loadExercises = async () => {
    setIsLoading(true);
    try {
      const response = await workoutService.getExercises({ limit: 50 });
      setExercises(response.exercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.exerciseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.exerciseModal}>
        <View style={styles.exerciseModalHeader}>
          <Text style={styles.exerciseModalTitle}>운동 추가</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.exerciseModalClose}>닫기</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="운동 검색..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <ScrollView style={styles.exerciseList}>
            {filteredExercises.map(exercise => (
              <TouchableOpacity
                key={exercise.exerciseId}
                style={styles.exerciseItem}
                onPress={() => onSelectExercise(exercise)}
              >
                <View>
                  <Text style={styles.exerciseItemName}>{exercise.exerciseName}</Text>
                  <Text style={styles.exerciseItemDetails}>
                    {`${exercise.muscleGroup} • ${exercise.equipment || '맨몸'}`}
                  </Text>
                </View>
                <Text style={styles.exerciseItemAdd}>추가</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
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
    marginTop: 10,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  timerContainer: {
    alignItems: 'flex-start',
  },
  timerLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  timer: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  addExerciseButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addExerciseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
  },
  exerciseInfo: {
    padding: 20,
    alignItems: 'center',
  },
  exerciseNumber: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  exerciseDetails: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  previousWorkoutInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    alignItems: 'center',
  },
  previousWorkoutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  previousWorkoutText: {
    fontSize: 14,
    color: Colors.primary,
  },
  volumeInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  volumeLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  volumeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  tracker: {
    margin: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  setsHeader: {
    marginBottom: 15,
  },
  setsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  restTimeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  restTimeSelectorLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 10,
  },
  restTimeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  restTimeOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  restTimeOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  restTimeOptionTextActive: {
    color: '#FFFFFF',
  },
  setsGrid: {
    marginTop: 10,
  },
  gridHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: Colors.background,
    borderRadius: 16,
    marginBottom: 8,
  },
  gridHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: Colors.background,
  },
  setRowCompleted: {
    backgroundColor: Colors.primaryLight,
  },
  addSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  setNumber: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  previousSetData: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  setInput: {
    flex: 1,
    marginHorizontal: 4,
    padding: 8,
    backgroundColor: Colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
    fontSize: 16,
  },
  setInputCompleted: {
    backgroundColor: Colors.background,
    borderColor: Colors.success,
  },
  completeSetButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    marginLeft: 4,
  },
  completeSetButtonActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  completeSetButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  completeSetButtonTextActive: {
    color: '#FFFFFF',
  },
  addSetButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginLeft: 4,
  },
  addSetButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 15,
  },
  navButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restModal: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  restTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  timerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  restTimer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  progressCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    borderColor: Colors.primary,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  restActions: {
    flexDirection: 'row',
    gap: 15,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skipButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  addTimeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  addTimeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  completingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  exerciseModal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  exerciseModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  exerciseModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  exerciseModalClose: {
    fontSize: 16,
    color: Colors.primary,
  },
  searchInput: {
    margin: 20,
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
  },
  exerciseList: {
    flex: 1,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  exerciseItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  exerciseItemDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  exerciseItemAdd: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
});