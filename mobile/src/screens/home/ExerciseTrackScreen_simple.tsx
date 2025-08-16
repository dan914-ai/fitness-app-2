import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/types';
import { useWorkout, WorkoutSet, SetType } from '../../contexts/WorkoutContext';
import { mockRoutines } from '../../data/mockRoutines';
import { getStaticThumbnail } from '../../constants/staticThumbnails';

const { width } = Dimensions.get('window');

// Simple thumbnail display component using our static thumbnails
const ExerciseThumbnailDisplay = ({ exerciseId }: { exerciseId: string }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Get static thumbnail from local assets
  const thumbnailAsset = getStaticThumbnail(exerciseId);
  
  if (!thumbnailAsset) {
    // Show placeholder icon if no static thumbnail available
    return (
      <View style={styles.thumbnailContainer}>
        <View style={[styles.placeholderIcon, { backgroundColor: Colors.primary + '20' }]}>
          <Icon name="fitness-center" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.placeholderText}>운동 이미지</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.thumbnailContainer}>
      <Image
        source={thumbnailAsset}
        style={styles.exerciseThumbnail}
        resizeMode="cover"
        onLoadStart={() => setImageLoaded(false)}
        onLoadEnd={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
      {!imageLoaded && !imageError && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}
    </View>
  );
};

export default function ExerciseTrackScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, 'ExerciseTrack'>>();
  const { exerciseId, exerciseName, routineId } = route.params;
  const workout = useWorkout();
  
  // Simple default sets
  const getDefaultSets = (): WorkoutSet[] => {
    return [
      { id: '1', weight: '', reps: '12', completed: false, type: 'Warmup' },
      { id: '2', weight: '', reps: '10', completed: false, type: 'Normal' },
      { id: '3', weight: '', reps: '8', completed: false, type: 'Normal' },
    ];
  };
  
  const [sets, setSets] = useState<WorkoutSet[]>(getDefaultSets());
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [isResting, setIsResting] = useState(false);
  const [showRestComplete, setShowRestComplete] = useState(false);

  // Initialize exercise in workout context
  useEffect(() => {
    workout.setCurrentExercise(exerciseId);
    
    const savedExerciseData = workout.getExerciseData(exerciseId);
    if (savedExerciseData) {
      setSets(savedExerciseData.sets);
    } else {
      const defaultSets = getDefaultSets();
      workout.initializeExercise(exerciseId, exerciseName, defaultSets);
      setSets(defaultSets);
    }
  }, [exerciseId, exerciseName]);

  // Save sets whenever they change
  useEffect(() => {
    workout.updateExerciseSets(exerciseId, sets);
  }, [sets, exerciseId]);

  const updateSet = (setId: string, field: 'weight' | 'reps', value: string) => {
    setSets(prevSets => 
      prevSets.map(set => 
        set.id === setId ? { ...set, [field]: value } : set
      )
    );
  };

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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate simple stats
  const completedSets = sets.filter(set => set.completed);
  const totalVolume = completedSets.reduce((total, set) => {
    const weight = parseFloat(set.weight) || 0;
    const reps = parseInt(set.reps) || 0;
    return total + (weight * reps);
  }, 0);

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.headerSubtitle}>1/5</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.helpButton}>
            <Icon name="help-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Workout Statistics */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>총 볼륨</Text>
              <Text style={styles.statValue}>{totalVolume.toFixed(0)}kg</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>완료 세트</Text>
              <Text style={styles.statValue}>{completedSets.length}/{sets.length}</Text>
            </View>
          </View>
        </View>

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
            <Text style={styles.tableHeaderText}>타입</Text>
            <Text style={styles.tableHeaderText}>이전</Text>
            <Text style={styles.tableHeaderText}>중량(kg)</Text>
            <Text style={styles.tableHeaderText}>횟수</Text>
            <Text style={styles.tableHeaderText}>완료</Text>
          </View>

          {/* Sets */}
          {sets.map((set, index) => (
            <View key={set.id} style={styles.setRow}>
              <Text style={styles.setNumber}>{index + 1}</Text>
              
              <View style={styles.setTypeContainer}>
                <Text style={styles.setTypeText}>{set.type === 'Warmup' ? '웜업' : '일반'}</Text>
              </View>
              
              <View style={styles.previousData}>
                <Text style={styles.previousText}>-</Text>
              </View>

              <TextInput
                style={[styles.input, set.completed && styles.inputCompleted]}
                value={set.weight}
                onChangeText={(value) => updateSet(set.id, 'weight', value)}
                keyboardType="numeric"
                placeholder="0"
                editable={!set.completed}
              />

              <TextInput
                style={[styles.input, set.completed && styles.inputCompleted]}
                value={set.reps}
                onChangeText={(value) => updateSet(set.id, 'reps', value)}
                keyboardType="numeric"
                placeholder="0"
                editable={!set.completed}
              />

              <TouchableOpacity
                style={[styles.checkbox, set.completed && styles.checkboxCompleted]}
                onPress={() => toggleSetComplete(set.id)}
              >
                {set.completed && <Icon name="check" size={16} color="#FFFFFF" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeSetButton}
                onPress={() => removeSet(set.id)}
              >
                <Icon name="remove" size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.setActionsContainer}>
            <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
              <Icon name="add" size={20} color={Colors.primary} />
              <Text style={styles.addSetText}>세트추가</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exercise Thumbnail */}
        <View style={styles.mediaSection}>
          <Text style={styles.sectionTitle}>운동 동작</Text>
          <ExerciseThumbnailDisplay exerciseId={exerciseId} />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={24} color={Colors.text} />
          <Text style={styles.navButtonText}>이전 운동</Text>
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <Text style={styles.navCenterText}>
            {completedSets.length}/{sets.length} 세트 완료
          </Text>
          <TouchableOpacity 
            style={styles.finishButton}
            onPress={() => {
              workout.completeExercise(exerciseId);
              navigation.goBack();
            }}
          >
            <Text style={styles.finishButtonText}>운동 완료</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.navButtonText}>다음 운동</Text>
          <Icon name="chevron-right" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
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
    fontSize: 14,
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
  setTypeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  setTypeText: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    flex: 0.8,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: Colors.background,
    marginHorizontal: 4,
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
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseThumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
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
  navCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navCenterText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  finishButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
});