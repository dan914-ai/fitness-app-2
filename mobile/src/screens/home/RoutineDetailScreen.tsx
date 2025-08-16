import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Modal,
  Pressable,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/types';
// Removed MuscleVisualization import
import { useWorkout } from '../../contexts/WorkoutContext';
import { useWorkoutSession } from '../../hooks/useWorkoutSession';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import ExercisePickerSheet from '../../components/workout/ExercisePickerSheet';
import storageService from '../../services/storage.service';
import { routinesService, Routine, RoutineExercise as ExerciseType } from '../../services/routines.service';
import { getStaticThumbnail } from '../../constants/staticThumbnails';
import { exerciseDatabaseService } from '../../services/exerciseDatabase.service';
import progressionService from '../../services/progression.service';
import { supabase } from '../../config/supabase';
import { getLastExerciseWeight } from '../../utils/workoutHistory';
import { getNumericExerciseId } from '../../utils/exerciseIdMapping';
import { getThumbnail } from '../../constants/thumbnailMapping';
import GlobalExerciseThumbnail from '../../components/ExerciseThumbnail';

type RoutineDetailScreenProps = {
  navigation: StackNavigationProp<HomeStackParamList, 'RoutineDetail'>;
  route: RouteProp<HomeStackParamList, 'RoutineDetail'>;
};

const { width } = Dimensions.get('window');

// Use Exercise type from routines service
type Exercise = ExerciseType & { isFavorite?: boolean };

// Local Exercise Thumbnail Component wrapper
const ExerciseThumbnail = ({ exerciseId, targetMuscles, thumbnail }: { exerciseId: string; targetMuscles: string[]; thumbnail?: any }) => {
  const muscleGroup = targetMuscles?.[0] || '운동';
  
  // Get static thumbnail if not provided
  let finalThumbnail = thumbnail;
  if (!finalThumbnail) {
    // Try to convert string ID to number for database lookup
    const numericId = typeof exerciseId === 'string' ? parseInt(exerciseId, 10) : exerciseId;
    
    if (!isNaN(numericId)) {
      // Get from database service which already includes static thumbnails
      const exercise = exerciseDatabaseService.getExerciseById(numericId);
      finalThumbnail = exercise?.thumbnail || null;
      
      // If still no thumbnail, try direct static thumbnail lookup
      if (!finalThumbnail) {
        finalThumbnail = getStaticThumbnail(numericId);
      }
    }
  }
  
  // Debug log
  
  return (
    <GlobalExerciseThumbnail
      source={finalThumbnail}
      exerciseName={exerciseId}
      muscleGroup={muscleGroup}
      style={styles.exerciseThumbnail}
    />
  );
};

export default function RoutineDetailScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, 'RoutineDetail'>>();
  const { routineId, routineName } = route.params;
  const workout = useWorkout();
  const workoutSession = useWorkoutSession();
  const [showConfirmationSheet, setShowConfirmationSheet] = useState(false);
  const [favoriteExercises, setFavoriteExercises] = useState<string[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [routineData, setRoutineData] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteMessage, setShowDeleteMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [progressionSuggestions, setProgressionSuggestions] = useState<Record<string, {
    load: number;
    reason: string;
    readiness: number;
  }>>({});

  // Get user ID on mount
  React.useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  // Load routine data from either mock data or user-created routines
  React.useEffect(() => {
    const loadRoutineData = async () => {
      try {
        // Check if we need to reset (if old format detected)
        const needsReset = await checkIfNeedsReset();
        if (needsReset) {
          await routinesService.resetToDefaults();
        }
        
        // Get routine from the service
        const routine = await routinesService.getRoutineById(routineId);
        
        if (routine) {
          setRoutineData(routine);
        } else {
          // Fallback if routine not found
          setRoutineData({
            id: routineId,
            name: routineName,
            description: '운동 루틴입니다.',
            targetMuscles: [],
            duration: '45-60분',
            difficulty: 'intermediate' as const,
            exercises: [] as Exercise[],
          });
        }
      } catch (error) {
        console.error('Error loading routine:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to check if routines need reset
    const checkIfNeedsReset = async () => {
      const routines = await routinesService.getAllRoutines();
      // Check if any routine has old-style string IDs like 'barbell-bench-press'
      return routines.some(r => 
        r.exercises.some(ex => 
          ex.id && isNaN(parseInt(ex.id, 10))
        )
      );
    };
    
    loadRoutineData();
  }, [routineId, routineName]);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  
  // Update exercises when routineData is loaded
  React.useEffect(() => {
    if (routineData) {
      setExercises(routineData.exercises);
    }
  }, [routineData]);

  // Load favorite exercises on mount
  React.useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await storageService.getFavoriteExercises();
        setFavoriteExercises(savedFavorites);
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return Colors.success;
      case 'intermediate': return Colors.warning;
      case 'advanced': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return '중급';
    }
  };

  const handleExerciseTap = (exercise: Exercise) => {
    // Show exercise details instead of starting workout tracking
    // This prevents auto-timer starts and preserves routine context
    Alert.alert(
      exercise.name,
      `${exercise.sets}세트 × ${exercise.reps}회\n휴식시간: ${exercise.restTime}\n\n타겟 근육: ${exercise.targetMuscles.join(', ')}`,
      [
        { text: '확인', style: 'default' }
      ]
    );
  };

  const handleStartWorkout = async () => {
    try {
      // Simplified workout start - just initialize basic data and navigate
      if (workout && exercises.length > 0) {
        // Start the workout context first
        workout.startWorkout(routineId, routineName);
        
        // Initialize exercises with basic data immediately after starting
        for (let index = 0; index < exercises.length; index++) {
          const exercise = exercises[index];
          
          const defaultSets = Array.from({ length: exercise.sets }, (_, i) => ({
            id: (i + 1).toString(),
            weight: '',
            reps: exercise.reps.toString().split('-')[0] || '10',
            completed: false,
            type: i === 0 ? 'Warmup' as const : 'Normal' as const,
          }));
          
          workout.initializeExercise(exercise.id, exercise.name, defaultSets);
        }
        
        // Use requestAnimationFrame to ensure React state updates are processed
        requestAnimationFrame(() => {
          // Pass exercises as backup in case context timing fails on mobile
          navigation.navigate('WorkoutSession', { 
            routineId,
            fallbackExercises: exercises.map(e => ({
              exerciseId: e.id,
              exerciseName: e.name,
              sets: Array.from({ length: e.sets }, (_, i) => ({
                id: (i + 1).toString(),
                weight: '',
                reps: e.reps.toString().split('-')[0] || '10',
                completed: false,
                type: i === 0 ? 'Warmup' as const : 'Normal' as const,
              }))
            }))
          });
        });
        
      } else {
        Alert.alert('오류', '운동을 시작할 수 없습니다. 루틴에 운동이 없거나 운동 컨텍스트를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('Error starting workout:', error);
      Alert.alert('오류', '운동 세션을 시작할 수 없습니다. 다시 시도해주세요.');
    }
  };

  const handleDeleteRoutine = async () => {
    const deleteRoutine = async () => {
      try {
        // Check if it's a default routine (cannot be deleted)
        const routine = await routinesService.getRoutineById(routineId);
        if (routine && !routine.isCustom) {
          if (Platform.OS === 'web') {
            setShowDeleteMessage('기본 루틴은 삭제할 수 없습니다.');
            setTimeout(() => setShowDeleteMessage(''), 3000);
          } else {
            Alert.alert('알림', '기본 루틴은 삭제할 수 없습니다.');
          }
          return;
        }
        
        // Delete routine using storage service
        await storageService.deleteUserRoutine(routineId);
        
        
        // Show success message on web
        if (Platform.OS === 'web') {
          setShowDeleteMessage('루틴이 삭제되었습니다.');
          setTimeout(() => {
            navigation.navigate('RoutineManagement');
          }, 1000);
        } else {
          // Navigate back to routine management
          navigation.navigate('RoutineManagement');
        }
      } catch (error) {
        console.error('Error deleting routine:', error);
        if (Platform.OS === 'web') {
        } else {
          Alert.alert('오류', '루틴 삭제 중 오류가 발생했습니다.');
        }
      }
    };

    if (Platform.OS === 'web') {
      // For web, directly delete
      deleteRoutine();
    } else {
      Alert.alert(
        '루틴 삭제',
        `"${routineData?.name || routineName}" 루틴을 삭제하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          { text: '삭제', style: 'destructive', onPress: deleteRoutine }
        ]
      );
    }
  };

  const handleEditRoutine = () => {
    // For now, show a message that edit functionality is coming soon
    if (Platform.OS === 'web') {
      setShowDeleteMessage('루틴 편집 기능은 곧 추가됩니다.');
      setTimeout(() => setShowDeleteMessage(''), 3000);
    } else {
      Alert.alert('알림', '루틴 편집 기능은 곧 추가됩니다.');
    }
  };

  const getProgressionSuggestions = async () => {
    if (!userId) {
      return {};
    }
    
    const suggestions: Record<string, {
      load: number;
      reason: string;
      readiness: number;
    }> = {};
    
    for (const exercise of exercises) {
      try {
        // Get actual last weight from workout history instead of routine template
        const lastWeight = await getLastExerciseWeight(exercise.id);
        const exerciseType = exercise.targetMuscles?.length > 1 ? 'compound' : 'isolation';
        
        
        const suggestion = await progressionService.getProgressionSuggestion(
          userId,
          lastWeight,
          exerciseType
        );
        
        
        if (suggestion && typeof suggestion.suggested_load === 'number') {
          // Sanity check: prevent unreasonable increases (>20% or >10kg)
          let finalSuggestedLoad = suggestion.suggested_load;
          if (lastWeight > 0) {
            const percentIncrease = ((suggestion.suggested_load - lastWeight) / lastWeight) * 100;
            const absoluteIncrease = suggestion.suggested_load - lastWeight;
            
            if (percentIncrease > 20 || absoluteIncrease > 10) {
              // Cap at 10% or 5kg increase, whichever is smaller
              const tenPercentIncrease = lastWeight * 1.1;
              const fiveKgIncrease = lastWeight + 5;
              finalSuggestedLoad = Math.min(tenPercentIncrease, fiveKgIncrease);
              console.warn(`⚠️ Capped excessive progression: ${suggestion.suggested_load}kg → ${finalSuggestedLoad}kg`);
            } else if (percentIncrease < -20 || absoluteIncrease < -10) {
              // Cap decreases at 20% or 10kg
              const twentyPercentDecrease = lastWeight * 0.8;
              const tenKgDecrease = lastWeight - 10;
              finalSuggestedLoad = Math.max(twentyPercentDecrease, tenKgDecrease);
              console.warn(`⚠️ Capped excessive deload: ${suggestion.suggested_load}kg → ${finalSuggestedLoad}kg`);
            }
          }
          
          suggestions[exercise.id] = {
            load: Math.round(finalSuggestedLoad),
            reason: suggestion.reason || '',
            readiness: (suggestion as any).readiness_index || 0
          };
        }
      } catch (error) {
        console.error(`Failed to get suggestion for ${exercise.name}:`, error);
      }
    }
    
    setProgressionSuggestions(suggestions);
    
    // Show summary if there are suggestions
    if (Object.keys(suggestions).length > 0) {
      const hasChanges = Object.values(suggestions).some(s => 
        s.reason !== '→ Normal recovery, maintain weight'
      );
      
      if (hasChanges) {
        const summaryText = Object.entries(suggestions)
          .map(([id, s]) => {
            const exercise = exercises.find(e => e.id === id);
            return `${exercise?.name}: ${s.reason}`;
          })
          .join('\n');
        
        Alert.alert(
          'Today\'s Progression Suggestions',
          `Based on your recovery (${(suggestions[Object.keys(suggestions)[0]].readiness * 10).toFixed(1)}/10):\n\n${summaryText}`,
          [{ text: 'Got it!', style: 'default' }]
        );
      }
    }
    
    return suggestions;
  };

  const confirmStartWorkout = async () => {
    setShowConfirmationSheet(false);
    try {
      
      let currentSuggestions = progressionSuggestions;
      
      // Get progression suggestions if user is logged in
      if (userId) {
        currentSuggestions = await getProgressionSuggestions();
      }
      
      // Start the workout
      workout.startWorkout(routineId, routineName);
      
      // Initialize all exercises from the routine
      for (let index = 0; index < exercises.length; index++) {
        const exercise = exercises[index];
        // Get actual last weight from workout history
        const lastWeight = await getLastExerciseWeight(exercise.id);
        
        // Use progression suggestion if available
        const suggestion = currentSuggestions[exercise.id];
        const originalWeight = lastWeight > 0 ? lastWeight.toString() : '';
        const defaultWeight = suggestion 
          ? suggestion.load.toString() 
          : originalWeight;
        
        
        if (suggestion) {
          
          // Show alert with suggestion info  
          if (suggestion.reason && suggestion.reason !== '→ Normal recovery, maintain weight') {
            setTimeout(() => {
              Alert.alert(
                'Weight Suggestion',
                `${exercise.name}: ${suggestion.reason}\n\nSuggested: ${suggestion.load}kg (was ${lastWeight}kg)`,
                [{ text: 'OK' }]
              );
            }, 100);
          }
        } else {
        }
        
        const defaultSets = Array.from({ length: exercise.sets }, (_, i) => ({
          id: (i + 1).toString(),
          weight: defaultWeight,
          reps: exercise.reps.toString().split('-')[1] || exercise.reps.toString().split('-')[0] || '10',
          completed: false,
          type: i === 0 ? 'Warmup' as const : 'Normal' as const,
        }));
        
        // Create progression suggestion object
        const progressionSuggestion = suggestion ? {
          originalWeight: lastWeight,
          suggestedWeight: suggestion.load,
          reason: suggestion.reason,
          readiness: suggestion.readiness || 0.5
        } : undefined;

        workout.initializeExercise(exercise.id, exercise.name, defaultSets, progressionSuggestion);
      }
      
      
      try {
        navigation.navigate('WorkoutSession', {
          routineId: routineId,
        });
      } catch (navError) {
        console.error('❌ Navigation error:', navError);
        Alert.alert('Navigation Error', `Failed to navigate: ${navError.message}`);
      }
    } catch (error) {
      console.error('Error starting workout:', error);
      Alert.alert('오류', '운동 세션을 시작할 수 없습니다. 다시 시도해주세요.');
    }
  };

  const toggleFavorite = async (exerciseId: string) => {
    const newFavorites = favoriteExercises.includes(exerciseId)
      ? favoriteExercises.filter(id => id !== exerciseId)
      : [...favoriteExercises, exerciseId];
    
    setFavoriteExercises(newFavorites);
    await storageService.saveFavoriteExercises(newFavorites);
  };

  const showExerciseMenu = (exercise: Exercise) => {
    Alert.alert(
      exercise.name,
      '운동 옵션',
      [
        { text: '수정', onPress: () => {} },
        { text: '복제', onPress: () => duplicateExercise(exercise) },
        { text: '삭제', onPress: () => removeExercise(exercise.id), style: 'destructive' },
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  const duplicateExercise = (exercise: Exercise) => {
    const newExercise = {
      ...exercise,
      id: `${exercise.id}_copy_${Date.now()}`,
      name: `${exercise.name} (복사본)`,
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (exerciseId: string) => {
    Alert.alert(
      '운동 삭제',
      '이 운동을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => setExercises(exercises.filter(ex => ex.id !== exerciseId))
        },
      ]
    );
  };

  if (loading || !routineData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>루틴 로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      {showDeleteMessage && Platform.OS === 'web' ? (
        <View style={styles.deleteMessageBanner}>
          <Icon name="info" size={24} color="#FFFFFF" />
          <Text style={styles.deleteMessageText}>{showDeleteMessage}</Text>
        </View>
      ) : null}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{routineData.name}</Text>
          <Text style={styles.headerSubtitle}>{routineData.exercises.length}개 운동</Text>
        </View>
        {routineData?.isCustom ? (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteRoutine}
          >
            <Icon name="delete" size={24} color={Colors.error} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Routine Info */}
        <View style={styles.routineInfo}>
          <View style={styles.routineStats}>
            <View style={styles.statItem}>
              <Icon name="schedule" size={20} color={Colors.textSecondary} />
              <Text style={styles.statText}>{routineData.duration}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="trending-up" size={20} color={getDifficultyColor(routineData.difficulty)} />
              <Text style={[styles.statText, { color: getDifficultyColor(routineData.difficulty) }]}>{getDifficultyText(routineData.difficulty)}</Text>
            </View>
          </View>
          <Text style={styles.routineDescription}>{routineData.description}</Text>
        </View>

        {/* Exercise List */}
        <View style={styles.exerciseSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>운동 목록</Text>
            <TouchableOpacity 
              style={styles.addExerciseButton}
              onPress={() => setShowExercisePicker(true)}
            >
              <Icon name="add" size={20} color={Colors.primary} />
              <Text style={styles.addExerciseText}>운동 추가</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.exerciseListContainer}>
            {exercises.map((exercise, index) => {
              const isCompleted = workout.isExerciseCompleted(exercise.id);
              const isFavorite = favoriteExercises.includes(exercise.id);
              
              return (
                <TouchableOpacity
                  key={exercise.id}
                  style={[
                    styles.exerciseCard,
                    isCompleted && styles.exerciseCardCompleted,
                  ]}
                  onPress={() => handleExerciseTap(exercise)}
                >
                  <View style={styles.dragHandle}>
                    <Icon name="drag-indicator" size={24} color={Colors.textSecondary} />
                  </View>
                  
                  <ExerciseThumbnail 
                    exerciseId={exercise.id}
                    targetMuscles={exercise.targetMuscles}
                    thumbnail={null}  // Let ExerciseThumbnail fetch it
                  />
                  
                  <View style={styles.exerciseInfo}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) + '20' }]}>
                    <Text style={[styles.difficultyText, { color: getDifficultyColor(exercise.difficulty) }]}>{getDifficultyText(exercise.difficulty)}</Text>
                  </View>
                </View>
                
                <View style={styles.exerciseDetails}>
                  <View style={styles.exerciseDetailItem}>
                    <Icon name="fitness-center" size={16} color={Colors.textSecondary} />
                    <Text style={styles.exerciseDetailText}>{exercise.sets}세트</Text>
                  </View>
                  <View style={styles.exerciseDetailItem}>
                    <Icon name="repeat" size={16} color={Colors.textSecondary} />
                    <Text style={styles.exerciseDetailText}>{exercise.reps}회</Text>
                  </View>
                  {exercise.weight ? (
                    <View style={styles.exerciseDetailItem}>
                      <Icon name="line-weight" size={16} color={Colors.textSecondary} />
                      <Text style={styles.exerciseDetailText}>{exercise.weight}</Text>
                    </View>
                  ) : null}
                  <View style={styles.exerciseDetailItem}>
                    <Icon name="schedule" size={16} color={Colors.textSecondary} />
                    <Text style={styles.exerciseDetailText}>{exercise.restTime}</Text>
                  </View>
                </View>

                <View style={styles.targetMuscles}>
                  {exercise.targetMuscles.map((muscle, muscleIndex) => (
                    <View key={muscleIndex} style={styles.muscleTag}>
                      <Text style={styles.muscleTagText}>{muscle}</Text>
                    </View>
                  ))}
                </View>
              </View>

                  
                  <View style={styles.exerciseActions}>
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={() => toggleFavorite(exercise.id)}
                    >
                      <Icon 
                        name={isFavorite ? "favorite" : "favorite-border"} 
                        size={20} 
                        color={isFavorite ? Colors.error : Colors.textSecondary} 
                      />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.exerciseMenuButton}
                      onPress={() => showExerciseMenu(exercise)}
                    >
                      <Icon name="more-vert" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartWorkout}
        >
          <Icon name="play-arrow" size={24} color="#FFFFFF" />
          <Text style={styles.startButtonText}>운동 시작</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Sheet Modal */}
      <Modal
        visible={showConfirmationSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmationSheet(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowConfirmationSheet(false)}
        >
          <Pressable style={styles.confirmationSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            
            <Text style={styles.confirmationTitle}>운동을 시작하시겠습니까?</Text>
            <Text style={styles.confirmationSubtitle}>{`${exercises.length}개 운동 • 예상 시간 ${routineData.duration}`}</Text>
            <View style={styles.confirmationInfo}>
              <View style={styles.confirmationItem}>
                <Icon name="fitness-center" size={20} color={Colors.primary} />
                <Text style={styles.confirmationText}>총 {exercises.reduce((acc, ex) => acc + ex.sets, 0)} 세트</Text>
              </View>
              <View style={styles.confirmationItem}>
                <Icon name="local-fire-department" size={20} color={Colors.warning} />
                <Text style={styles.confirmationText}>예상 칼로리 250 kcal</Text>
              </View>
            </View>
            
            <View style={styles.confirmationButtons}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setShowConfirmationSheet(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.startConfirmButton]}
                onPress={confirmStartWorkout}
              >
                <Icon name="play-arrow" size={20} color="#FFFFFF" />
                <Text style={styles.startConfirmButtonText}>시작하기</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Exercise Picker Sheet */}
      <ExercisePickerSheet
        visible={showExercisePicker}
        onClose={() => setShowExercisePicker(false)}
        selectedExercises={exercises.map(ex => ex.id)}
        onSelectExercises={(selectedExercises) => {
          // Add new exercises to the routine
          const newExercises = selectedExercises.filter(
            ex => !exercises.find(existing => existing.id === ex.id)
          ).map(ex => ({
            ...ex,
            sets: 3,
            reps: '8-12',
            restTime: '90초',
            difficulty: 'intermediate' as const,
          }));
          setExercises([...exercises, ...newExercises]);
          setShowExercisePicker(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90, // Space for bottom button
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteMessageBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: Colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  deleteMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  routineInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    marginBottom: 8,
  },
  routineStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  routineDescription: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  // anatomySection removed
  exerciseSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  exerciseListContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addExerciseText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 12,
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
  dragHandle: {
    marginRight: 12,
  },
  exerciseThumbnail: {
    marginRight: 12,
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  thumbnailPlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  imageContainer: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
  },
  exerciseList: {
    paddingBottom: 20,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  exerciseDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exerciseDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  targetMuscles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  muscleTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  muscleTagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  exerciseMenuButton: {
    padding: 4,
    marginLeft: 8,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  startButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseCardCompleted: {
    opacity: 0.7,
    backgroundColor: Colors.success + '10',
  },
  exerciseCheckbox: {
    marginLeft: 12,
    padding: 4,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  confirmationSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmationSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  confirmationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmationText: {
    fontSize: 16,
    color: Colors.text,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  startConfirmButton: {
    backgroundColor: Colors.primary,
  },
  startConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});