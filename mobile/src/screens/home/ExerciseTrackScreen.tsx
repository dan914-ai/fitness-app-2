import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TextInput,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/types';
import { useWorkout, WorkoutSet, SetType } from '../../contexts/WorkoutContext';
import { routinesService } from '../../services/routines.service';
import { gifService } from '../../services/gif.service';
import { exerciseService } from '../../services/exercise.service';
import { ExerciseData } from '../../data/exerciseDatabase';
import ProgressionIndicator from '../../components/widgets/ProgressionIndicator';
import storageService from '../../services/storage.service';
import { saveWorkoutToHistory, getExerciseHistory, ExerciseHistoryRecord, getLastExerciseWeight, getLastExerciseWeights } from '../../utils/workoutHistory';
import { calculateAdjustedVolume, getVolumeAdjustmentReason } from '../../utils/workoutCalculations';
import progressionService from '../../services/progression.service';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { getExerciseGifUrls, getPlaceholderUrl } from '../../utils/gifUrlHelper';
import { supabase } from '../../config/supabase';
import { exerciseDatabaseService } from '../../services/exerciseDatabase.service';
// MIGRATION: Removed unused getStaticThumbnail import
import RestTimer from '../../components/workout/RestTimer';
import PlateCalculator from '../../components/workout/PlateCalculator';
import ExerciseAlternatives from '../../components/workout/ExerciseAlternatives';
import PRCelebration from '../../components/workout/PRCelebration';
import EnhancedExerciseGifDisplay from '../../components/common/EnhancedExerciseGifDisplay';
import NetworkErrorBoundary from '../../components/common/NetworkErrorBoundary';
import NetworkStatusIndicator from '../../components/common/NetworkStatusIndicator';
import { 
  getWarmupProtocol, 
  getExerciseType, 
  shouldPerformWarmup,
  formatWarmupSet,
  getWarmupRecommendation 
} from '../../utils/warmupProtocol';

const { width } = Dimensions.get('window');

// Fixed GIF Display Component - prevents loading state reset on re-renders
const ExerciseGifDisplay = React.memo(({ exerciseId, exerciseName }: { exerciseId: string; exerciseName?: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  
  // Get exercise data from database service - try multiple methods for compatibility
  let exerciseData = exerciseDatabaseService.getExerciseWithDetailsById(exerciseId);
  
  // Fallback to regular getExerciseById if detailed version fails
  if (!exerciseData) {
    const basicExercise = exerciseDatabaseService.getExerciseById(exerciseId);
    if (basicExercise) {
      // Convert basic exercise to detailed format
      exerciseData = {
        ...basicExercise,
        koreanName: basicExercise.exerciseName,
        englishName: '', // Will be empty but that's OK
        romanization: '',
        targetMuscles: { primary: [], secondary: [] },
        bodyParts: [],
        description: { korean: '', english: '' },
        instructions: { korean: [], english: [] },
        tips: { korean: [], english: [] },
        commonMistakes: { korean: [], english: [] },
        sets: { recommended: '3', beginner: '2', intermediate: '3', advanced: '4' },
        reps: { recommended: '12', beginner: '10', intermediate: '12', advanced: '15' }
      };
    }
  }
  
  // Final fallback - try by name
  if (!exerciseData && exerciseName) {
    const byName = exerciseDatabaseService.getExerciseByName(exerciseName);
    if (byName) {
      exerciseData = {
        ...byName,
        koreanName: byName.exerciseName,
        englishName: '',
        romanization: '',
        targetMuscles: { primary: [], secondary: [] },
        bodyParts: [],
        description: { korean: '', english: '' },
        instructions: { korean: [], english: [] },
        tips: { korean: [], english: [] },
        commonMistakes: { korean: [], english: [] },
        sets: { recommended: '3', beginner: '2', intermediate: '3', advanced: '4' },
        reps: { recommended: '12', beginner: '10', intermediate: '12', advanced: '15' }
      };
    }
  }
  
  // DEBUG logging
  console.log('[ExerciseTrack] Exercise lookup result:', {
    exerciseId,
    exerciseName,
    found: !!exerciseData,
    equipment: exerciseData?.equipment,
    isDumbbell: exerciseData?.equipment?.includes('덤벨') || exerciseData?.equipment?.toLowerCase()?.includes('dumbbell')
  });
  
  // Build an array of URLs to try in order
  const gifUrls = useMemo(() => {
    const urls: string[] = [];
    
    // First priority: Database gifUrl (not imageUrl!)
    if (exerciseData && exerciseData.gifUrl) {
      urls.push(exerciseData.gifUrl);
    }
    
    // Second priority: Generated URLs
    const generatedUrls = getExerciseGifUrls(exerciseId);
    urls.push(...generatedUrls);
    
    // Last resort: placeholder
    if (!urls.length) {
      urls.push(getPlaceholderUrl(exerciseName));
    }
    
    return urls;
  }, [exerciseId, exerciseData, exerciseName]);
  
  const currentGifUrl = gifUrls[currentUrlIndex] || gifUrls[0];
  
  // Force log everything
  console.error('[FORCE DEBUG]', {
    gifUrls,
    currentUrlIndex,
    currentGifUrl,
    exerciseDataGifUrl: exerciseData?.gifUrl,
  });
  
  // Debug: Check if this is a thumbnail URL
  if (currentGifUrl && currentGifUrl.includes('-thumb')) {
    console.error(`[GIF ERROR] Loading thumbnail instead of GIF: ${currentGifUrl}`);
  }
  
  const handleLoadStart = () => {
    setIsLoading(true);
  };
  
  const handleLoadEnd = () => {
    setIsLoading(false);
    setHasError(false);
  };
  
  const handleError = (error: any) => {
    
    // Try next URL if available
    if (currentUrlIndex < gifUrls.length - 1) {
      setCurrentUrlIndex(currentUrlIndex + 1);
      setIsLoading(true);
      setHasError(false);
    } else {
      setIsLoading(false);
      setHasError(true);
    }
  };
  
  // Reset when exercise changes
  useEffect(() => {
    setCurrentUrlIndex(0);
    setHasError(false);
    setIsLoading(true);
  }, [exerciseId]);

  // Emergency debug
  console.warn('[EMERGENCY DEBUG] ExerciseGifDisplay:', {
    exerciseId,
    exerciseName,
    hasExerciseData: !!exerciseData,
    gifUrl: exerciseData?.gifUrl,
    gifUrlsCount: gifUrls.length,
    currentUrlIndex,
    currentGifUrl,
  });

  return (
    <View style={styles.gifContainer}>
      {/* Debug: Show what URL we're using */}
      <View style={{ position: 'absolute', top: 0, left: 0, backgroundColor: 'yellow', padding: 5, zIndex: 9999 }}>
        <Text style={{ fontSize: 10, color: 'black' }}>
          ID: {exerciseId}
        </Text>
        <Text style={{ fontSize: 10, color: 'black' }}>
          File: {currentGifUrl ? currentGifUrl.substring(currentGifUrl.lastIndexOf('/') + 1) : 'NO URL'}
        </Text>
        <Text style={{ fontSize: 8, color: 'black', width: 200 }} numberOfLines={2}>
          Full: {currentGifUrl || 'UNDEFINED'}
        </Text>
      </View>
      
      {/* Show loading indicator while loading */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>운동 동작 로딩중...</Text>
        </View>
      )}
      
      {/* Always render the Image component with key to force re-render on URL change */}
      <Image
        key={`${exerciseId}-${currentUrlIndex}`}
        source={{ uri: currentGifUrl }}
        style={[styles.exerciseGif, { borderWidth: 2, borderColor: 'red' }]}
        resizeMode="contain"
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      
      {/* Show error placeholder if all URLs failed */}
      {hasError && (
        <View style={styles.errorOverlay}>
          <Icon name="image-not-supported" size={48} color={Colors.textSecondary} />
          <Text style={styles.errorText}>이미지를 불러올 수 없습니다</Text>
        </View>
      )}
    </View>
  );
});

// Memoized GIF display component to prevent unnecessary re-renders
const MemoizedGifDisplay = memo(({ exerciseId, exerciseName }: { exerciseId: string; exerciseName: string }) => {
  return (
    <EnhancedExerciseGifDisplay 
      exerciseId={exerciseId} 
      exerciseName={exerciseName}
      showDebugInfo={__DEV__}
      height={200}
      onFallbackUsed={(fallbackType) => {
        console.log(`Exercise GIF fallback used: ${fallbackType}`);
      }}
      onNetworkError={(error) => {
        console.error('Exercise GIF network error:', error);
      }}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if exerciseId or exerciseName changes
  return prevProps.exerciseId === nextProps.exerciseId && 
         prevProps.exerciseName === nextProps.exerciseName;
});

export default function ExerciseTrackScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, 'ExerciseTrack'>>();
  const { exerciseId, exerciseName, routineId } = route.params;
  const workout = useWorkout();
  
  // Debug logging removed for production
  
  // Get exercise data including thumbnail
  const exercise = exerciseDatabaseService.getExerciseById(exerciseId);
  const thumbnail = exercise?.thumbnail || null;
  
  // Simple default sets (empty - will be filled by effect)
  const getDefaultSets = (): WorkoutSet[] => {
    return [
      { id: '1', weight: '', reps: '12', completed: false, type: 'Warmup' },
      { id: '2', weight: '', reps: '10', completed: false, type: 'Normal' },
      { id: '3', weight: '', reps: '8', completed: false, type: 'Normal' },
      { id: '4', weight: '', reps: '8', completed: false, type: 'Normal' },
    ];
  };
  
  const [sets, setSets] = useState<WorkoutSet[]>(getDefaultSets());
  const [isInitialLoading, setIsInitialLoading] = useState(false); // No longer need initial loading state
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [showRestComplete, setShowRestComplete] = useState(false);
  const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set());
  const [showExplanations, setShowExplanations] = useState(false);
  const [showPlateCalculator, setShowPlateCalculator] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showPRCelebration, setShowPRCelebration] = useState(false);
  const [prData, setPRData] = useState<any>(null);
  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null);
  const [routineExercises, setRoutineExercises] = useState<any[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistoryRecord[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [showSetTypeModal, setShowSetTypeModal] = useState(false);
  const [showWarmupSuggestion, setShowWarmupSuggestion] = useState(true);
  const [hasPerformedWarmup, setHasPerformedWarmup] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  // Load routine data and find current exercise index
  useEffect(() => {
    const loadRoutineData = async () => {
      try {
        
        // Get routine data from routines service
        const routine = await routinesService.getRoutineById(routineId);
        
        if (routine && routine.exercises) {
          // Debug logging removed for production
          
          setRoutineExercises(routine.exercises);
          const currentIndex = routine.exercises.findIndex((ex: any) => ex.id === exerciseId);
          setCurrentExerciseIndex(currentIndex !== -1 ? currentIndex : 0);
        } else {
          alert('ERROR: No routine data found! routineId=' + routineId);
        }
      } catch (error) {
        // Error loading routine data
        alert('ERROR loading routine: ' + (error instanceof Error ? error.message : String(error)));
      }
    };
    
    loadRoutineData();
  }, [routineId, exerciseId]);

  // Initialize exercise in workout context (simplified)
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    // Only initialize once per exercise, not on every workout change
    if (hasInitialized) return;
    
    workout.setCurrentExercise(exerciseId);
    
    const savedExerciseData = workout.getExerciseData(exerciseId);
    if (savedExerciseData) {
      setSets(savedExerciseData.sets);
    } else {
      // Initialize with empty sets - weight pre-filling happens in separate effect
      const defaultSets = getDefaultSets();
      workout.initializeExercise(exerciseId, exerciseName, defaultSets);
      setSets(defaultSets);
    }
    
    setHasInitialized(true);
  }, [exerciseId, exerciseName]); // Removed workout from dependencies

  // Separate effect for weight pre-filling that runs ONCE after exercise is loaded
  const [hasPrefilled, setHasPrefilled] = useState(false);
  
  useEffect(() => {
    // Only run prefill once per exercise
    if (hasPrefilled) return;
    
    const performWeightPrefill = async () => {
      
      // Multiple attempts with increasing delays
      let attempts = 0;
      const maxAttempts = 5;
      
      const tryPrefill = async () => {
        attempts++;
        
        const exerciseData = workout.getExerciseData(exerciseId);
        
        if (!exerciseData) {
          if (attempts < maxAttempts) {
            setTimeout(tryPrefill, attempts * 200);
            return;
          } else {
            return;
          }
        }

        // Debug logging removed for production

        // Check if any sets need weight pre-filling
        const needsWeightPrefill = exerciseData.sets.some(set => {
          const needsFill = !set.weight || set.weight === '0' || set.weight === '' || set.weight.trim() === '';
          return needsFill;
        });
        
        
        if (!needsWeightPrefill) {
          setHasPrefilled(true); // Mark as done
          return;
        }

        
        try {
          // Get actual weights from last workout (not just max)
          const lastWeights = await getLastExerciseWeights(exerciseId);
          
          // If we have weights from history
          if (lastWeights.normal.length > 0 || lastWeights.warmup > 0) {
            let normalSetIndex = 0;
            const totalHistoricalSets = (lastWeights.warmup > 0 ? 1 : 0) + lastWeights.normal.length;
            let setsFilledCount = 0;
            
            const prefilledSets = exerciseData.sets.map((set, index) => {
              // Only pre-fill if weight is empty/zero
              if (!set.weight || set.weight === '0' || set.weight === '' || set.weight.trim() === '') {
                let newWeight = '';  // Default to empty, not '0'
                
                if (set.type === 'Warmup' || set.type === 'warmup') {
                  // Use actual warmup weight from history if available
                  if (lastWeights.warmup > 0 && setsFilledCount < totalHistoricalSets) {
                    newWeight = lastWeights.warmup.toString();
                    setsFilledCount++;
                  }
                  // Don't fill warmup if there was no warmup in history
                } else {
                  // For normal sets, only fill up to the number of sets done last time
                  if (normalSetIndex < lastWeights.normal.length) {
                    newWeight = lastWeights.normal[normalSetIndex].toString();
                    normalSetIndex++;
                    setsFilledCount++;
                  }
                  // Leave remaining sets empty - don't use last weight
                }
                
                return { ...set, weight: newWeight };
              }
              return set;
            });
            
            console.log('Prefilled weights from history:', {
              warmup: lastWeights.warmup,
              normal: lastWeights.normal,
              sets: prefilledSets.map(s => ({ type: s.type, weight: s.weight }))
            });
            
            // Update both local state and workout context
            setSets(prefilledSets);
            workout.updateExerciseSets(exerciseId, prefilledSets);
          } else {
            // No local history, try Supabase as fallback
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: exerciseHistory } = await supabase
                .from('workout_exercise_sets')
                .select('weight, set_type')
                .eq('exercise_id', exerciseId)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);
              
              if (exerciseHistory && exerciseHistory.length > 0) {
                // Use the weights from Supabase
                const weights = exerciseHistory.map(s => parseFloat(s.weight) || 0);
                const maxWeight = Math.max(...weights);
                
                if (maxWeight > 0) {
                  const prefilledSets = exerciseData.sets.map(set => {
                    if (!set.weight || set.weight === '0' || set.weight === '' || set.weight.trim() === '') {
                      const newWeight = set.type === 'Warmup' 
                        ? Math.round(maxWeight * 0.5).toString()
                        : maxWeight.toString();
                      return { ...set, weight: newWeight };
                    }
                    return set;
                  });
                  
                  setSets(prefilledSets);
                  workout.updateExerciseSets(exerciseId, prefilledSets);
                }
              }
            }
          }
          
          // Mark as prefilled so it doesn't run again
          setHasPrefilled(true);
        } catch (error) {
          console.error('🏋️ Error during weight pre-fill:', error);
          setHasPrefilled(true); // Mark as done even on error
        }
      };
      
      // Start the first attempt immediately
      tryPrefill();
    };
    
    performWeightPrefill();
  }, [exerciseId, hasPrefilled]); // Removed workout from dependencies
  
  // Reset flags when exercise changes
  useEffect(() => {
    setHasPrefilled(false);
    setHasInitialized(false);
  }, [exerciseId]);

  // Fetch detailed exercise data for explanations
  useEffect(() => {
    const fetchExerciseData = async () => {
      try {
        const data = exerciseService.getExerciseById(exerciseId);
        if (data) {
          setExerciseData(data);
        } else {
          // No detailed exercise data found
          // Try with alternative IDs (handle underscore/hyphen variations)
          const alternativeId = exerciseId.includes('_') 
            ? exerciseId.replace(/_/g, '-') 
            : exerciseId.replace(/-/g, '_');
          const altData = exerciseService.getExerciseById(alternativeId);
          if (altData) {
            setExerciseData(altData);
          }
        }
      } catch (error) {
        console.error('💥 Error fetching exercise data:', error);
      }
    };

    fetchExerciseData();
  }, [exerciseId]);

  // Save sets whenever they change (but not on initial mount)
  const [isInitialMount, setIsInitialMount] = useState(true);
  
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }
    // Update workout context with current sets
    workout.updateExerciseSets(exerciseId, sets);
  }, [sets, exerciseId]);

  // Load exercise history
  useEffect(() => {
    const loadHistory = async () => {
      const history = await getExerciseHistory(exerciseId);
      setExerciseHistory(history);
      setHistoryPage(0);
    };
    loadHistory();
  }, [exerciseId]);

  // Handle navigation to next exercise (NOT completion)
  const handleNextExercise = () => {
    const nextIndex = currentExerciseIndex + 1;
    
    // Navigate to next exercise
    if (nextIndex < routineExercises.length) {
      const nextExercise = routineExercises[nextIndex];
      navigation.navigate('ExerciseTrack', {
        exerciseId: nextExercise.id,
        exerciseName: nextExercise.name,
        routineId: routineId,
      });
    } else {
      // Shouldn't happen since this button only shows for non-last exercises
      console.warn('handleNextExercise called on last exercise');
    }
  };

  // SEPARATE function to handle workout completion - EXACT SAME AS 운동 종료 BUTTON
  const handleCompleteWorkout = async () => {
    
    try {
      // Check if workout was already saved
      if (workout.state.savedWorkoutId) {
        console.log('Workout already saved with ID:', workout.state.savedWorkoutId);
        // Navigate to complete screen with existing ID
        navigation.navigate('WorkoutComplete', { workoutId: workout.state.savedWorkoutId });
        return;
      }
      
      // Save workout first
      const workoutData = await saveWorkoutToHistory(workout.state);
      
      if (workoutData && workoutData.id) {
        // Mark workout as saved
        workout.setSavedWorkoutId(workoutData.id);
        // Navigate to completion screen
        navigation.navigate('WorkoutComplete', { workoutId: workoutData.id });
      } else {
        // Save failed, still end workout
        workout.endWorkout();
        navigation.navigate('HomeScreen');
      }
    } catch (error) {
      console.error('Error ending workout:', error);
      // Even if save fails, still end and navigate
      workout.endWorkout();
      navigation.navigate('HomeScreen');
    }
  };

  // Handle navigation to previous exercise
  const handlePreviousExercise = () => {
    const prevIndex = currentExerciseIndex - 1;
    
    if (prevIndex >= 0) {
      // Navigate to previous exercise
      const prevExercise = routineExercises[prevIndex];
      navigation.navigate('ExerciseTrack', {
        exerciseId: prevExercise.id,
        exerciseName: prevExercise.name,
        routineId: routineId,
      });
    } else {
      // This is the first exercise, go back to routine
      navigation.goBack();
    }
  };

  const updateSet = useCallback((setId: string, field: 'weight' | 'reps' | 'rpe' | 'notes', value: string | number) => {
    setSets(prevSets => 
      prevSets.map(set => 
        set.id === setId ? { ...set, [field]: value } : set
      )
    );
  }, []);

  const toggleSetExpansion = useCallback((setId: string) => {
    setExpandedSets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(setId)) {
        newSet.delete(setId);
      } else {
        newSet.add(setId);
      }
      return newSet;
    });
  }, []);

  const toggleSetComplete = (setId: string) => {
    setSets(prevSets => 
      prevSets.map(set => {
        if (set.id === setId) {
          const isCompleting = !set.completed;
          if (isCompleting) {
            // Start rest timer when completing a set
            setRestTimer(120); // 2 minutes
            setIsResting(true);
            setShowRestComplete(false);
            setShowRestTimer(true); // Activate the RestTimer component
          }
          return { ...set, completed: isCompleting };
        }
        return set;
      })
    );
  };

  // Rest timer effect
  useEffect(() => {
    if (restTimer === null || !isResting) return;
    
    const interval = setInterval(() => {
      setRestTimer(prev => {
        if (prev === null || prev <= 1) {
          setIsResting(false);
          setShowRestComplete(true);
          setTimeout(() => setShowRestComplete(false), 3000);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [restTimer, isResting]);

  const addSet = () => {
    const newSetId = (sets.length + 1).toString();
    const lastSet = sets[sets.length - 1];
    setSets(prev => [...prev, {
      id: newSetId,
      weight: lastSet?.weight || '0',
      reps: lastSet?.reps || '0',
      completed: false,
      type: 'Normal',
    }]);
  };

  const removeSet = (setId: string) => {
    if (sets.length > 1) {
      setSets(prev => prev.filter(set => set.id !== setId));
    }
  };

  const adjustWeight = useCallback((setId: string, increment: number) => {
    setSets(prevSets => 
      prevSets.map(set => {
        if (set.id === setId) {
          const currentWeight = parseFloat(set.weight) || 0;
          const newWeight = Math.max(0, currentWeight + increment);
          return { ...set, weight: newWeight.toString() };
        }
        return set;
      })
    );
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSetTypeColor = (type: SetType) => {
    switch (type) {
      case 'Warmup': return Colors.warning;
      case 'Drop': return Colors.info;
      case 'Failure': return Colors.error;
      default: return Colors.primary;
    }
  };

  const getSetTypeLabel = (type: SetType) => {
    switch (type) {
      case 'Normal': return '일반';
      case 'Warmup': return '웜업';
      case 'Compound': return '컴파운드';
      case 'Super': return '슈퍼';
      case 'Tri': return '트라이';
      case 'Drop': return '드랍';
      case 'Failure': return '실패';
      case 'Assisted': return '보조';
      default: return '일반';
    }
  };
  
  const getSetTypeDisplay = (type: SetType, setNumber: number): string => {
    switch (type) {
      case 'Normal': return setNumber.toString();
      case 'Warmup': return 'W';
      case 'Compound': return 'C';
      case 'Super': return 'S';
      case 'Tri': return 'T';
      case 'Drop': return 'D';
      case 'Failure': return 'F';
      case 'Assisted': return 'A';
      default: return setNumber.toString();
    }
  };

  const updateSetType = (setId: string, newType: SetType) => {
    setSets(prevSets => 
      prevSets.map(set => 
        set.id === setId ? { ...set, type: newType } : set
      )
    );
  };

  // Get exercise data for volume calculation (use existing exerciseData from line 61)
  const equipment = exerciseData?.equipment || '기타';
  const englishName = exerciseData?.englishName || '';
  
  // Calculate enhanced workout statistics with adjusted volume
  const completedSets = sets.filter(set => set.completed);
  const totalVolume = completedSets.reduce((total, set) => {
    const weight = parseFloat(set.weight) || 0;
    const reps = parseInt(set.reps) || 0;
    // Use adjusted volume calculation for dumbbells and unilateral movements
    const adjustedVolume = calculateAdjustedVolume(
      weight,
      reps,
      exerciseName || '',
      equipment,
      englishName
    );
    return total + adjustedVolume;
  }, 0);
  
  // Get the adjustment reason if any
  const volumeAdjustmentReason = getVolumeAdjustmentReason(
    exerciseName || '',
    equipment,
    englishName
  );

  // Calculate 1RM using Brzycki formula: Weight × (36 / (37 - Reps))
  const estimatedOneRM = completedSets.length > 0 ? Math.max(...completedSets.map(set => {
    const weight = parseFloat(set.weight) || 0;
    const reps = parseInt(set.reps) || 0;
    if (reps === 1) return weight;
    if (reps >= 37) return weight; // Avoid division by zero/negative
    return weight * (36 / (37 - reps));
  })) : 0;

  // Calculate max weight lifted
  const maxWeight = completedSets.length > 0 ? Math.max(...completedSets.map(set => 
    parseFloat(set.weight) || 0
  )) : 0;

  // Calculate average RPE
  const setsWithRPE = completedSets.filter(set => set.rpe);
  const averageRPE = setsWithRPE.length > 0 ? 
    setsWithRPE.reduce((total, set) => total + (set.rpe || 0), 0) / setsWithRPE.length : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading Overlay */}
      <LoadingOverlay 
        visible={isInitialLoading} 
        message="운동 정보 불러오는 중..." 
        fullScreen={false}
      />
      
      {/* Network Status Indicator */}
      <NetworkStatusIndicator
        showWhenOnline={false}
        showQuality={true}
        position="top"
        compact={false}
        onRetry={() => {
          console.log('Retrying network requests from Exercise Track Screen');
        }}
      />

      {/* Rest Complete Message */}
      {showRestComplete && (
        <View style={styles.restCompleteBanner}>
          <Icon name="check-circle" size={24} color="#FFFFFF" />
          <Text style={styles.restCompleteText}>휴식 완료! 다음 세트를 시작하세요!</Text>
        </View>
      )}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{exerciseName}</Text>
          <Text style={styles.headerSubtitle}>
            {currentExerciseIndex + 1}/{routineExercises.length}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.explanationButton}
            onPress={async () => {
              alert('🏋️ MANUAL TEST BUTTON PRESSED - Starting weight prefill test');
              const lastWeight = await getLastExerciseWeight(exerciseId);
              alert(`🏋️ Got last weight: ${lastWeight}kg`);
              
              if (lastWeight > 0) {
                const prefilledSets = sets.map(set => ({
                  ...set,
                  weight: set.type === 'Warmup' 
                    ? Math.round(lastWeight * 0.5).toString()
                    : lastWeight.toString()
                }));
                setSets(prefilledSets);
                alert('🏋️ Weight prefill completed! Check the weight fields.');
              } else {
                alert('🏋️ No weight found to prefill with');
              }
            }}
          >
            <Icon name="build" size={20} color={Colors.error} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.explanationButton}
            onPress={() => setShowPlateCalculator(true)}
          >
            <Icon name="fitness-center" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.explanationButton}
            onPress={() => setShowAlternatives(true)}
            disabled={!exerciseData}
          >
            <Icon name="swap-horiz" size={20} color={exerciseData ? Colors.primary : Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.explanationButton}
            onPress={() => setShowExplanations(true)}
            disabled={!exerciseData}
          >
            <Icon name="info-outline" size={20} color={exerciseData ? Colors.primary : Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpButton}>
            <Icon name="help-outline" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Warm-up Suggestion */}
        {showWarmupSuggestion && !hasPerformedWarmup && (
          <View style={styles.warmupSuggestion}>
            <View style={styles.warmupHeader}>
              <Icon name="fitness-center" size={20} color={Colors.warning} />
              <Text style={styles.warmupTitle}>워밍업 권장</Text>
              <TouchableOpacity 
                onPress={() => setShowWarmupSuggestion(false)}
                style={styles.warmupDismiss}
              >
                <Icon name="close" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.warmupText}>
              {getWarmupRecommendation(exerciseName, maxWeight, currentExerciseIndex === 0)}
            </Text>
            <View style={styles.warmupActions}>
              <TouchableOpacity 
                style={styles.warmupButton}
                onPress={() => {
                  // Add warm-up sets
                  const protocol = getWarmupProtocol(getExerciseType(exerciseName), maxWeight);
                  protocol.sets.forEach((warmupSet, index) => {
                    const newSet: WorkoutSet = {
                      id: `warmup-${Date.now()}-${index}`,
                      type: 'Warmup',
                      weight: warmupSet.weight.toString(),
                      reps: warmupSet.reps.toString(),
                      completed: false,
                      rpe: undefined,
                      notes: '',
                    };
                    setSets(prev => [newSet, ...prev]);
                  });
                  setHasPerformedWarmup(true);
                  setShowWarmupSuggestion(false);
                }}
              >
                <Text style={styles.warmupButtonText}>워밍업 세트 추가</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.warmupButton, styles.warmupSkipButton]}
                onPress={() => {
                  setShowWarmupSuggestion(false);
                  setHasPerformedWarmup(true);
                }}
              >
                <Text style={styles.warmupSkipText}>건너뛰기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Enhanced Workout Statistics */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>
                총 볼륨 {volumeAdjustmentReason && '(2x)'}
              </Text>
              <Text style={styles.statValue}>{totalVolume.toFixed(0)}kg</Text>
              {volumeAdjustmentReason && (
                <Text style={styles.volumeAdjustmentNote}>
                  {volumeAdjustmentReason}
                </Text>
              )}
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>예상 1RM</Text>
              <Text style={styles.statValue}>{estimatedOneRM.toFixed(0)}kg</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>최대 중량</Text>
              <Text style={styles.statValue}>{maxWeight.toFixed(0)}kg</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>완료 세트</Text>
              <Text style={styles.statValue}>{completedSets.length}/{sets.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>평균 RPE</Text>
              <Text style={styles.statValue}>{averageRPE > 0 ? averageRPE.toFixed(1) : '-'}</Text>
            </View>
          </View>
        </View>

        {(() => {
          const exerciseData = workout.getExerciseData(exerciseId);
          // Debug logging removed for production
          
          if (!exerciseData || !exerciseData.progressionSuggestion) {
            return null;
          }
          const { originalWeight, suggestedWeight, reason, readiness } = exerciseData.progressionSuggestion;
          // Debug logging removed for production
          return (
            <ProgressionIndicator
              originalWeight={originalWeight}
              suggestedWeight={suggestedWeight}
              reason={reason}
              readiness={readiness}
            />
          );
        })()}

        {/* Sets Table */}
        <View style={styles.setsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>세트</Text>
            {isResting && restTimer && (
              <View style={styles.restTimer}>
                <Icon name="timer" size={16} color={Colors.warning} />
                <Text style={styles.restTimerText}>{formatTime(restTimer)}</Text>
              </View>
            )}
          </View>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>세트</Text>
            <Text style={styles.tableHeaderText}>이전</Text>
            <Text style={styles.tableHeaderText}>중량(kg)</Text>
            <Text style={styles.tableHeaderText}>횟수</Text>
            <Text style={styles.tableHeaderText}>완료</Text>
            <Text style={styles.tableHeaderText}>상세</Text>
          </View>

          {/* Sets */}
          {sets.map((set, index) => (
            <React.Fragment key={set.id}>
              <View style={styles.setRow}>
                {/* Clickable Set Number with Type Display */}
                <TouchableOpacity 
                  style={[styles.setNumberButton, { backgroundColor: getSetTypeColor(set.type) }]}
                  onPress={() => {
                    setSelectedSetId(set.id);
                    setShowSetTypeModal(true);
                  }}
                >
                  <Text style={styles.setNumberButtonText}>
                    {getSetTypeDisplay(set.type, index + 1)}
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.previousData}>
                  <Text style={styles.previousText}>
                    {exerciseHistory.length > 0 && exerciseHistory[0].sets[index] 
                      ? `${exerciseHistory[0].sets[index].weight}kg × ${exerciseHistory[0].sets[index].reps}회`
                      : '-'}
                  </Text>
                </View>

                {/* Enhanced Weight Input with Quick Adjustments */}
                <View style={styles.weightInputContainer}>
                  <TouchableOpacity 
                    style={[styles.quickAdjustButton, styles.quickAdjustButtonLeft]}
                    onPress={() => adjustWeight(set.id, -2.5)}
                    disabled={set.completed}
                  >
                    <Icon name="remove" size={12} color={set.completed ? Colors.textSecondary : Colors.primary} />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, styles.weightInput, styles.weightInputField, set.completed && styles.inputCompleted]}
                    value={set.weight}
                    onChangeText={(value) => updateSet(set.id, 'weight', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    editable={!set.completed}
                  />
                  <TouchableOpacity 
                    style={[styles.quickAdjustButton, styles.quickAdjustButtonRight]}
                    onPress={() => adjustWeight(set.id, 2.5)}
                    disabled={set.completed}
                  >
                    <Icon name="add" size={12} color={set.completed ? Colors.textSecondary : Colors.primary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.repsInputContainer}>
                  <TextInput
                    style={[styles.input, styles.repsInput, set.completed && styles.inputCompleted]}
                    value={set.reps}
                    onChangeText={(value) => updateSet(set.id, 'reps', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    editable={!set.completed}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.checkbox, set.completed && styles.checkboxCompleted]}
                  onPress={() => toggleSetComplete(set.id)}
                >
                  {set.completed && <Icon name="check" size={16} color="#FFFFFF" />}
                </TouchableOpacity>

                {/* Expand/Collapse Button */}
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => toggleSetExpansion(set.id)}
                >
                  <Icon 
                    name={expandedSets.has(set.id) ? "expand-less" : "expand-more"} 
                    size={20} 
                    color={Colors.textSecondary} 
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.removeSetButton}
                  onPress={() => removeSet(set.id)}
                >
                  <Icon name="remove" size={16} color={Colors.error} />
                </TouchableOpacity>
              </View>

              {/* Expandable Set Details */}
              {expandedSets.has(set.id) && (
                <View style={styles.expandedSetDetails}>
                  {/* Set Type Section */}
                  <View style={styles.setTypeSection}>
                    <Text style={styles.detailLabel}>세트 타입</Text>
                    <View style={styles.setTypeOptions}>
                      {(['Normal', 'Warmup', 'Compound', 'Super', 'Tri', 'Drop', 'Failure', 'Assisted'] as SetType[]).map(type => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.setTypeOptionButton,
                            { backgroundColor: set.type === type ? getSetTypeColor(type) : Colors.surface },
                            { borderColor: getSetTypeColor(type) }
                          ]}
                          onPress={() => updateSetType(set.id, type)}
                        >
                          <Text style={[
                            styles.setTypeOptionText,
                            { color: set.type === type ? '#FFFFFF' : getSetTypeColor(type) }
                          ]}>
                            {getSetTypeLabel(type)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* RPE Section */}
                  <View style={styles.rpeSection}>
                    <Text style={styles.detailLabel}>RPE (자각운동강도)</Text>
                    <View style={styles.rpeButtons}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rpe => (
                        <TouchableOpacity
                          key={rpe}
                          style={[
                            styles.rpeButton,
                            set.rpe === rpe && styles.rpeButtonActive
                          ]}
                          onPress={() => updateSet(set.id, 'rpe', rpe)}
                        >
                          <Text style={[
                            styles.rpeButtonText,
                            set.rpe === rpe && styles.rpeButtonTextActive
                          ]}>
                            {rpe}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Notes Section */}
                  <View style={styles.notesSection}>
                    <Text style={styles.detailLabel}>메모</Text>
                    <TextInput
                      style={styles.notesInput}
                      value={set.notes || ''}
                      onChangeText={(value) => updateSet(set.id, 'notes', value)}
                      placeholder="세트에 대한 메모를 입력하세요... (예: 폼 체크, 개인 기록, 느낌 등)"
                      multiline
                      numberOfLines={2}
                    />
                  </View>
                </View>
              )}
            </React.Fragment>
          ))}

          <View style={styles.setActionsContainer}>
            <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
              <Icon name="add" size={20} color={Colors.primary} />
              <Text style={styles.addSetText}>세트추가</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exercise GIF with Enhanced Network Handling */}
        <NetworkErrorBoundary
          showNetworkStatus={true}
          onRetry={() => {
            console.log('Retrying exercise GIF load from error boundary');
          }}
        >
          <View style={styles.mediaSection}>
            <Text style={styles.sectionTitle}>운동 동작</Text>
            <MemoizedGifDisplay 
              exerciseId={exerciseId} 
              exerciseName={exerciseName}
            />
          </View>
        </NetworkErrorBoundary>

        {/* Previous Records Section */}
        {exerciseHistory.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>이전 기록</Text>
              <View style={styles.historyPagination}>
                <TouchableOpacity
                  style={[styles.pageButton, historyPage === 0 && styles.pageButtonDisabled]}
                  onPress={() => setHistoryPage(Math.max(0, historyPage - 1))}
                  disabled={historyPage === 0}
                >
                  <Icon name="chevron-left" size={20} color={historyPage === 0 ? Colors.textSecondary : Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.pageText}>{historyPage + 1} / {exerciseHistory.length}</Text>
                <TouchableOpacity
                  style={[styles.pageButton, historyPage >= exerciseHistory.length - 1 && styles.pageButtonDisabled]}
                  onPress={() => setHistoryPage(Math.min(exerciseHistory.length - 1, historyPage + 1))}
                  disabled={historyPage >= exerciseHistory.length - 1}
                >
                  <Icon name="chevron-right" size={20} color={historyPage >= exerciseHistory.length - 1 ? Colors.textSecondary : Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {exerciseHistory[historyPage] && (
              <View style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>
                    {new Date(exerciseHistory[historyPage].date).toLocaleDateString('ko-KR', { 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'short'
                    })}
                  </Text>
                  <Text style={styles.historyWorkout}>{exerciseHistory[historyPage].workoutName}</Text>
                </View>
                
                <View style={styles.historyStats}>
                  <View style={styles.historyStatItem}>
                    <Text style={styles.historyStatLabel}>최대 중량</Text>
                    <Text style={styles.historyStatValue}>{exerciseHistory[historyPage].maxWeight}kg</Text>
                  </View>
                  <View style={styles.historyStatItem}>
                    <Text style={styles.historyStatLabel}>총 볼륨</Text>
                    <Text style={styles.historyStatValue}>{exerciseHistory[historyPage].totalVolume.toLocaleString()}kg</Text>
                  </View>
                </View>

                <View style={styles.historySets}>
                  {exerciseHistory[historyPage].sets.map((set, index) => (
                    <View key={index} style={styles.historySet}>
                      <Text style={styles.historySetNumber}>세트 {index + 1}</Text>
                      <Text style={styles.historySetData}>
                        {set.weight}kg × {set.reps}회
                        {set.type !== 'Normal' && ` (${getSetTypeLabel(set.type as SetType)})`}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={[styles.navButton, currentExerciseIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePreviousExercise}
          disabled={currentExerciseIndex === 0}
        >
          <Icon name="chevron-left" size={24} color={currentExerciseIndex === 0 ? Colors.textSecondary : Colors.text} />
          <Text style={[styles.navButtonText, currentExerciseIndex === 0 && styles.navButtonTextDisabled]}>이전 운동</Text>
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <Text style={styles.navCenterText}>
            {completedSets.length}/{sets.length} 세트 완료
          </Text>
          <Text style={styles.navCenterSubtext}>
            {currentExerciseIndex + 1}/{routineExercises.length} 운동
          </Text>
        </View>

        {currentExerciseIndex >= routineExercises.length - 1 && routineExercises.length > 0 ? (
          // SEPARATE 완료 BUTTON - Only appears on last exercise
          <TouchableOpacity 
            style={[styles.navButton, styles.completeButton]}
            onPress={handleCompleteWorkout}
            activeOpacity={0.7}
          >
            <Text style={[styles.navButtonText, styles.completeButtonText]}>완료</Text>
            <Icon name="check-circle" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          // REGULAR 다음 운동 BUTTON - For navigation between exercises
          <TouchableOpacity 
            style={styles.navButton}
            onPress={handleNextExercise}
            activeOpacity={0.7}
          >
            <Text style={styles.navButtonText}>다음 운동</Text>
            <Icon name="chevron-right" size={24} color={Colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Exercise Explanation Modal */}
      {exerciseData && (
        <Modal
          visible={showExplanations}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowExplanations(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setShowExplanations(false)} 
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>운동 설명</Text>
              <View style={styles.modalPlaceholder} />
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Exercise Title */}
              <View style={styles.modalTitleSection}>
                <Text style={styles.modalExerciseName}>{exerciseData.name.korean}</Text>
                <Text style={styles.modalExerciseEnglish}>{exerciseData.name.english}</Text>
              </View>

              {/* Exercise Info */}
              <View style={styles.modalInfoSection}>
                <View style={styles.modalInfoGrid}>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>분류</Text>
                    <Text style={styles.modalInfoValue}>
                      {exerciseData.category === 'compound' ? '복합운동' : '고립운동'}
                    </Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>난이도</Text>
                    <Text style={styles.modalInfoValue}>
                      {exerciseData.difficulty === 'beginner' ? '초급자' : 
                       exerciseData.difficulty === 'intermediate' ? '중급자' : '고급자'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>운동 설명</Text>
                <Text style={styles.modalDescription}>{exerciseData.description.korean}</Text>
              </View>

              {/* Target Muscles */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>타겟 근육</Text>
                <View style={styles.modalMuscleSection}>
                  <Text style={styles.modalMuscleLabel}>주동근:</Text>
                  <Text style={styles.modalMuscleValue}>
                    {exerciseData.targetMuscles.primary.join(', ')}
                  </Text>
                </View>
                {exerciseData.targetMuscles.secondary.length > 0 && (
                  <View style={styles.modalMuscleSection}>
                    <Text style={styles.modalMuscleLabel}>보조근:</Text>
                    <Text style={styles.modalMuscleValue}>
                      {exerciseData.targetMuscles.secondary.join(', ')}
                    </Text>
                  </View>
                )}
              </View>

              {/* Equipment */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>필요 장비</Text>
                <Text style={styles.modalEquipment}>{exerciseData.equipment.join(', ')}</Text>
              </View>

              {/* Instructions */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>운동 방법</Text>
                {exerciseData.instructions.korean.map((instruction, index) => (
                  <View key={index} style={styles.modalInstructionItem}>
                    <Text style={styles.modalInstructionNumber}>{`${index + 1}.`}</Text>
                    <Text style={styles.modalInstructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>

              {/* Tips */}
              {exerciseData.tips && exerciseData.tips.korean.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>운동 팁</Text>
                  {exerciseData.tips.korean.map((tip, index) => (
                    <View key={index} style={styles.modalTipItem}>
                      <Text style={styles.modalTipBullet}>💡</Text>
                      <Text style={styles.modalTipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Sets & Reps Recommendations */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>권장 세트 & 반복수</Text>
                <View style={styles.modalSetsRepsGrid}>
                  <View style={styles.modalSetsRepsItem}>
                    <Text style={styles.modalSetsRepsLabel}>초급자</Text>
                    <Text style={styles.modalSetsRepsValue}>
                      {exerciseData.sets.beginner} × {exerciseData.reps.beginner}
                    </Text>
                  </View>
                  <View style={styles.modalSetsRepsItem}>
                    <Text style={styles.modalSetsRepsLabel}>중급자</Text>
                    <Text style={styles.modalSetsRepsValue}>
                      {exerciseData.sets.intermediate} × {exerciseData.reps.intermediate}
                    </Text>
                  </View>
                  <View style={styles.modalSetsRepsItem}>
                    <Text style={styles.modalSetsRepsLabel}>고급자</Text>
                    <Text style={styles.modalSetsRepsValue}>
                      {exerciseData.sets.advanced} × {exerciseData.reps.advanced}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
      
      {/* Set Type Modal */}
      <Modal
        visible={showSetTypeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSetTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.setTypeModalContainer}>
            <View style={styles.modalHandleBar} />
            <View style={styles.setTypeModalHeader}>
              <Text style={styles.setTypeModalTitle}>세트 타입</Text>
              <TouchableOpacity 
                onPress={() => setShowSetTypeModal(false)}
                style={styles.setTypeModalCloseButton}
              >
                <Icon name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.setTypeModalScrollView}
              showsVerticalScrollIndicator={true}
              bounces={false}
            >
              <View style={styles.setTypeModalContent}>
                {[
                  { type: 'Normal' as SetType, label: '일반', description: '일반 세트' },
                  { type: 'Warmup' as SetType, label: '웜업', description: '근육을 준비하기 위한 웜업' },
                  { type: 'Compound' as SetType, label: '컴파운드', description: '연속으로 두 가지 운동, 같은 근육' },
                  { type: 'Super' as SetType, label: '슈퍼', description: '두 가지의 운동을 휴식 없이' },
                  { type: 'Tri' as SetType, label: '트라이', description: '세 가지의 운동을 휴식 없이' },
                  { type: 'Drop' as SetType, label: '드랍', description: '휴식시간 없이 무게를 내려서' },
                  { type: 'Failure' as SetType, label: '실패', description: '실패한 세트' },
                  { type: 'Assisted' as SetType, label: '보조', description: '보조 받아 세트를 완료' },
                ].map(({ type, label, description }) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.setTypeModalOption}
                    onPress={() => {
                      if (selectedSetId) {
                        updateSetType(selectedSetId, type);
                      }
                      setShowSetTypeModal(false);
                    }}
                  >
                    <View style={[styles.setTypeModalIndicator, { backgroundColor: getSetTypeColor(type) }]}>
                      <Text style={styles.setTypeModalIndicatorText}>
                        {type === 'Normal' ? '1' : getSetTypeDisplay(type, 1)}
                      </Text>
                    </View>
                    <View style={styles.setTypeModalTextContainer}>
                      <Text style={styles.setTypeModalLabel}>{label}</Text>
                      <Text style={styles.setTypeModalDescription}>{description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Rest Timer Component */}
      <RestTimer 
        isActive={showRestTimer}
        onComplete={() => {
          setShowRestTimer(false);
          setIsResting(false);
          setShowRestComplete(true);
        }}
        onDismiss={() => {
          setShowRestTimer(false);
          setIsResting(false);
        }}
      />
      
      {/* Plate Calculator Modal */}
      <PlateCalculator 
        visible={showPlateCalculator}
        onClose={() => setShowPlateCalculator(false)}
        targetWeight={sets[0]?.weight || 60}
      />
      
      {/* Exercise Alternatives Modal */}
      {exerciseData && (
        <ExerciseAlternatives
          visible={showAlternatives}
          onClose={() => setShowAlternatives(false)}
          currentExercise={exerciseData}
          onSelectAlternative={(alternative) => {
            setShowAlternatives(false);
          }}
        />
      )}
      
      {/* PR Celebration Modal */}
      {showPRCelebration && prData && (
        <PRCelebration
          visible={showPRCelebration}
          onClose={() => setShowPRCelebration(false)}
          exerciseName={exerciseName}
          newRecord={prData}
          previousRecord={prData.previousRecord}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  explanationButton: {
    padding: 8,
    marginRight: 8,
  },
  helpButton: {
    padding: 8,
    marginLeft: 8,
  },
  statsSection: {
    backgroundColor: Colors.surface,
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  volumeAdjustmentNote: {
    fontSize: 11,
    color: Colors.success,
    marginTop: 2,
    fontStyle: 'italic',
  },
  setsSection: {
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  restTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  restTimerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.warning,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    textAlign: 'center',
    flex: 1,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 48,
  },
  setNumber: {
    flex: 0.5,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  setNumberButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  setNumberButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  setTypeButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setTypeButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previousData: {
    flex: 1,
    alignItems: 'center',
  },
  previousText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  input: {
    height: 36,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 8, // Increased padding for better touch targets
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: Colors.background,
  },
  inputCompleted: {
    backgroundColor: Colors.success + '20',
    borderColor: Colors.success,
  },
  checkbox: {
    flex: 0.5,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  checkboxCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  removeSetButton: {
    padding: 8,
  },
  setActionsContainer: {
    marginTop: 16,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    gap: 4,
  },
  addSetText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  mediaSection: {
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  historySection: {
    backgroundColor: Colors.surface,
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  historyPagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pageButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  historyCard: {
    marginTop: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  historyWorkout: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  historyStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyStatItem: {
    flex: 1,
  },
  historyStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  historyStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  historySets: {
    gap: 8,
  },
  historySet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  historySetNumber: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  historySetData: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  gifContainer: {
    width: '100%',
    height: 200, // Fixed height instead of aspect ratio
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    position: 'relative',
  },
  exerciseGif: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface, // Add background color
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background + 'E6', // Semi-transparent
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  debugInfo: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1000,
  },
  debugText: {
    fontSize: 9,
    color: '#fff',
    lineHeight: 12,
  },
  expandButton: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  expandedSetDetails: {
    backgroundColor: Colors.background,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  setTypeSection: {
    marginBottom: 16,
  },
  setTypeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  setTypeOptionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setTypeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rpeSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  rpeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rpeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rpeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  rpeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  notesSection: {
    marginBottom: 0,
  },
  notesInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  weightInputContainer: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
    // Removed gap as it might not be supported
  },
  weightInput: {
    flex: 1,
    minWidth: 50,
  },
  weightInputField: {
    marginHorizontal: 8, // Add explicit margin to input field
  },
  repsInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  repsInput: {
    flex: 1,
    minWidth: 40,
  },
  quickAdjustButton: {
    width: 26, // Slightly larger button
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickAdjustButtonLeft: {
    marginRight: 0, // No margin, will be handled by input field margin
  },
  quickAdjustButtonRight: {
    marginLeft: 0, // No margin, will be handled by input field margin
  },

  bottomNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },
  navButtonText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonTextDisabled: {
    color: Colors.textSecondary,
    opacity: 0.5,
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navCenterText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  navCenterSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '400',
    marginTop: 2,
  },
  completeButton: {
    backgroundColor: Colors.success,
    elevation: 3,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  finishButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  finishButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.6,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  finishButtonTextDisabled: {
    color: '#CCCCCC',
  },
  restCompleteBanner: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: Colors.success,
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
  restCompleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCloseButton: {
    padding: 8,
    marginRight: 8,
  },
  modalHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  modalPlaceholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalTitleSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  modalExerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalExerciseEnglish: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modalInfoSection: {
    paddingVertical: 16,
  },
  modalInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  modalInfoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  modalSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  modalMuscleSection: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  modalMuscleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 60,
  },
  modalMuscleValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  modalEquipment: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  modalInstructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  modalInstructionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    width: 24,
  },
  modalInstructionText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
    lineHeight: 24,
  },
  modalTipItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  modalTipBullet: {
    fontSize: 16,
    marginRight: 8,
  },
  modalTipText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
    lineHeight: 24,
  },
  modalSetsRepsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalSetsRepsItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  modalSetsRepsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  modalSetsRepsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  
  // Set Type Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  setTypeModalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    maxHeight: '70%', // Increased to show more content
    minHeight: 400, // Add minimum height to ensure content is visible
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 8,
  },
  setTypeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  setTypeModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  setTypeModalCloseButton: {
    padding: 4,
  },
  setTypeModalScrollView: {
    flex: 1,
    minHeight: 300, // Ensure minimum height for scroll view
  },
  setTypeModalContent: {
    paddingTop: 8,
    paddingBottom: 30, // Increased bottom padding for better scroll
    minHeight: 350, // Ensure content has minimum height
  },
  setTypeModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 60, // Ensure each option has minimum height
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '20', // Add subtle separator
  },
  setTypeModalIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  setTypeModalIndicatorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  setTypeModalTextContainer: {
    flex: 1,
    justifyContent: 'center', // Center text vertically
  },
  setTypeModalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  setTypeModalDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18, // Add line height for better readability
  },
  // Warm-up styles
  warmupSuggestion: {
    backgroundColor: Colors.warning + '15',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  warmupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warmupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.warning,
    marginLeft: 8,
    flex: 1,
  },
  warmupDismiss: {
    padding: 4,
  },
  warmupText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  warmupActions: {
    flexDirection: 'row',
    gap: 12,
  },
  warmupButton: {
    flex: 1,
    backgroundColor: Colors.warning,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  warmupButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  warmupSkipButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  warmupSkipText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
});