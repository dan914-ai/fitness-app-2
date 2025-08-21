import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RecordStackParamList } from '../../navigation/types';
import { getWorkoutById, WorkoutHistoryItem } from '../../utils/workoutHistory';
import { exerciseDatabaseService } from '../../services/exerciseDatabase.service';
// Removed MuscleVisualization import

type WorkoutSummaryScreenProps = {
  navigation: StackNavigationProp<RecordStackParamList, 'WorkoutSummary'>;
  route: RouteProp<RecordStackParamList, 'WorkoutSummary'>;
};

const { width } = Dimensions.get('window');

interface ExerciseSummary {
  id: string;
  name: string;
  sets: number;
  reps: number;
  maxWeight: string;
  totalVolume: string;
  targetMuscles: string[];
  personalRecord?: boolean;
}

interface WorkoutSummaryData {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  totalVolume: string;
  totalSets: number;
  totalReps: number;
  averageIntensity: number;
  targetMuscles: string[];
  exercises: ExerciseSummary[];
  notes?: string;
}

export default function WorkoutSummaryScreen() {
  const navigation = useNavigation<StackNavigationProp<RecordStackParamList>>();
  const route = useRoute<RouteProp<RecordStackParamList, 'WorkoutSummary'>>();
  const { workoutId } = route.params;
  
  const [workoutData, setWorkoutData] = useState<WorkoutSummaryData>({
    id: workoutId,
    name: 'Workout Session',
    date: new Date().toISOString().split('T')[0],
    startTime: '--:--',
    endTime: '--:--',
    duration: '0분',
    totalVolume: '0kg',
    totalSets: 0,
    totalReps: 0,
    averageIntensity: 0,
    targetMuscles: [],
    exercises: [],
    notes: '',
  });
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadWorkoutData();
  }, [workoutId]);
  
  const loadWorkoutData = async () => {
    try {
      setLoading(true);
      const workout = await getWorkoutById(workoutId);
      
      if (workout) {
        const startTime = new Date(workout.startTime);
        const endTime = new Date(workout.endTime);
        
        // Format time display
        const formatTime = (date: Date) => {
          return date.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
        };
        
        // Format duration
        const durationInMinutes = Math.floor(workout.duration / 60);
        const hours = Math.floor(durationInMinutes / 60);
        const minutes = durationInMinutes % 60;
        const durationText = hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
        
        // Calculate average intensity (simplified calculation)
        const averageIntensity = Math.min(100, Math.max(0, 
          Math.floor((workout.totalSets / workout.exercises.length) * 15)
        ));
        
        // Get muscle groups from exercises
        const allMuscles = new Set<string>();
        const exerciseSummaries: ExerciseSummary[] = [];
        
        // Check for personal records by comparing with previous workouts
        const personalRecordChecks = await Promise.all(
          workout.exercises.map(async (exercise) => {
            const exerciseData = exerciseDatabaseService.getExerciseById(exercise.exerciseId);
            const bodyParts = exerciseData?.bodyParts || [];
            bodyParts.forEach(part => allMuscles.add(part));
            
            const maxWeight = Math.max(...exercise.sets.map(set => parseFloat(set.weight) || 0));
            const totalReps = exercise.sets.reduce((sum, set) => sum + (parseInt(set.reps) || 0), 0);
            
            // Simple PR check - if max weight is significantly high, mark as PR
            const isPersonalRecord = maxWeight > 0 && exercise.sets.length >= 3;
            
            return {
              id: exercise.exerciseId,
              name: exercise.exerciseName,
              sets: exercise.sets.length,
              reps: totalReps,
              maxWeight: `${maxWeight}kg`,
              totalVolume: `${Math.round(exercise.totalVolume)}kg`,
              targetMuscles: bodyParts,
              personalRecord: isPersonalRecord
            };
          })
        );
        
        const updatedWorkoutData: WorkoutSummaryData = {
          id: workout.id,
          name: workout.routineName,
          date: workout.date,
          startTime: formatTime(startTime),
          endTime: formatTime(endTime),
          duration: durationText,
          totalVolume: `${Math.round(workout.totalVolume)}kg`,
          totalSets: workout.totalSets,
          totalReps: workout.exercises.reduce((sum, ex) => 
            sum + ex.sets.reduce((setSum, set) => setSum + (parseInt(set.reps) || 0), 0), 0
          ),
          averageIntensity,
          targetMuscles: Array.from(allMuscles),
          exercises: personalRecordChecks,
          notes: workout.memo || '',
        };
        
        setWorkoutData(updatedWorkoutData);
      }
    } catch (error) {
      console.error('Error loading workout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 90) return Colors.error;
    if (intensity >= 70) return Colors.warning;
    if (intensity >= 50) return Colors.success;
    return Colors.textSecondary;
  };

  const handleExerciseTap = (exercise: ExerciseSummary) => {
    navigation.navigate('ExerciseHistory', {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>운동 요약을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>운동 요약</Text>
          <Text style={styles.headerSubtitle}>{workoutData.date}</Text>
        </View>
        <TouchableOpacity style={styles.shareButton}>
          <Icon name="share" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Workout Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.workoutName}>{workoutData.name}</Text>
              <Text style={styles.workoutTime}>
                {`${workoutData.startTime} - ${workoutData.endTime} • ${workoutData.duration}`}
              </Text>
            </View>
            <View style={styles.intensityBadge}>
              <Icon name="local-fire-department" size={16} color={getIntensityColor(workoutData.averageIntensity)} />
              <Text style={[styles.intensityText, { color: getIntensityColor(workoutData.averageIntensity) }]}>
                {workoutData.averageIntensity}%
              </Text>
            </View>
          </View>

          {/* Muscle Visualization section removed */}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="fitness-center" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{workoutData.totalVolume}</Text>
            <Text style={styles.statLabel}>총 볼륨</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="repeat" size={24} color={Colors.success} />
            <Text style={styles.statValue}>{workoutData.totalSets}</Text>
            <Text style={styles.statLabel}>총 세트</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="trending-up" size={24} color={Colors.warning} />
            <Text style={styles.statValue}>{workoutData.totalReps}</Text>
            <Text style={styles.statLabel}>총 반복</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="local-fire-department" size={24} color={Colors.error} />
            <Text style={styles.statValue}>{workoutData.averageIntensity}%</Text>
            <Text style={styles.statLabel}>평균 강도</Text>
          </View>
        </View>

        {/* Exercise Summary */}
        <View style={styles.exerciseSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>운동 요약</Text>
            <Text style={styles.exerciseCount}>{workoutData.exercises.length}개 운동</Text>
          </View>

          {workoutData.exercises.map((exercise, index) => (
            <TouchableOpacity 
              key={exercise.id}
              style={styles.exerciseCard}
              onPress={() => handleExerciseTap(exercise)}
            >
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseInfo}>
                  <View style={styles.exerciseNameRow}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    {exercise.personalRecord && (
                      <View style={styles.prBadge}>
                        <Icon name="emoji-events" size={12} color="#FFD700" />
                        <Text style={styles.prText}>PR</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.exerciseStats}>
                    <Text style={styles.exerciseStat}>{exercise.sets}세트</Text>
                    <Text style={styles.exerciseStatDivider}>•</Text>
                    <Text style={styles.exerciseStat}>{exercise.reps}회</Text>
                    <Text style={styles.exerciseStatDivider}>•</Text>
                    <Text style={styles.exerciseStat}>최대 {exercise.maxWeight}</Text>
                  </View>
                  <View style={styles.targetMuscles}>
                    {exercise.targetMuscles.map((muscle, muscleIndex) => (
                      <View key={muscleIndex} style={styles.muscleTag}>
                        <Text style={styles.muscleTagText}>{muscle}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.exerciseVolume}>
                  <Text style={styles.volumeValue}>{exercise.totalVolume}</Text>
                  <Text style={styles.volumeLabel}>총 볼륨</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Personal Records */}
        {workoutData.exercises.some(e => e.personalRecord) && (
          <View style={styles.recordsSection}>
            <Text style={styles.sectionTitle}>🏆 개인 기록 달성</Text>
            {workoutData.exercises
              .filter(e => e.personalRecord)
              .map((exercise) => (
                <View key={exercise.id} style={styles.recordCard}>
                  <View style={styles.recordIcon}>
                    <Icon name="emoji-events" size={24} color="#FFD700" />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordExercise}>{exercise.name}</Text>
                    <Text style={styles.recordDescription}>
                      새로운 최대 중량: {exercise.maxWeight}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* Notes */}
        {workoutData.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>운동 노트</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{workoutData.notes}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="repeat" size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>운동 반복</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="edit" size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>수정</Text>
          </TouchableOpacity>
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
  shareButton: {
    padding: 8,
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  workoutName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  workoutTime: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  intensityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  intensityText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // muscleSection and muscleSectionTitle removed
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  exerciseSection: {
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
  exerciseCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  exerciseHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginRight: 8,
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 16,
    gap: 2,
  },
  prText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  exerciseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  exerciseStat: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  exerciseStatDivider: {
    fontSize: 14,
    color: Colors.textLight,
  },
  targetMuscles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  muscleTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  muscleTagText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
  },
  exerciseVolume: {
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  volumeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  volumeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recordsSection: {
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
  },
  recordIcon: {
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordExercise: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  recordDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  notesSection: {
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  notesCard: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
  },
  notesText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
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