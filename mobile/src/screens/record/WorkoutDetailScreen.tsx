import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RecordStackParamList } from '../../navigation/types';
import { getWorkoutById, WorkoutHistoryItem } from '../../utils/workoutHistory';
import { exerciseService } from '../../services/exercise.service';
import progressionService from '../../services/progression.service';
import { supabase } from '../../config/supabase';
import { getStaticThumbnail } from '../../constants/staticThumbnails';
import { exerciseDatabaseService } from '../../services/exerciseDatabase.service';

const { width } = Dimensions.get('window');

type WorkoutDetailScreenProps = {
  navigation: StackNavigationProp<RecordStackParamList, 'WorkoutDetail'>;
  route: RouteProp<RecordStackParamList, 'WorkoutDetail'>;
};

interface MuscleGroupData {
  primary: string[];
  secondary: string[];
  workoutType?: string;
}

export default function WorkoutDetailScreen() {
  const navigation = useNavigation<StackNavigationProp<RecordStackParamList>>();
  const route = useRoute<RouteProp<RecordStackParamList, 'WorkoutDetail'>>();
  const { workoutId } = route.params;
  
  const [workout, setWorkout] = useState<WorkoutHistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroupData>({
    primary: [],
    secondary: [],
  });
  const [sessionRPE, setSessionRPE] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadWorkoutData();
  }, [workoutId]);

  const loadWorkoutData = async () => {
    try {
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }

      const workoutData = await getWorkoutById(workoutId);
      setWorkout(workoutData);
      
      if (workoutData) {
        // Load RPE data for this workout date
        if (user) {
          try {
            const workoutDate = workoutData.date.split('T')[0]; // Get date without time
            
            // Try multiple query approaches to find RPE data
            const { data: rpeData, error } = await supabase
              .from('user_session_data')
              .select('session_rpe, created_at')
              .eq('user_id', user.id)
              .gte('created_at', workoutDate + ' 00:00:00')
              .lt('created_at', workoutDate + ' 23:59:59')
              .order('created_at', { ascending: false })
              .limit(1);
            
            
            if (!error && rpeData && rpeData.length > 0) {
              setSessionRPE(rpeData[0].session_rpe);
            } else {
              // Fallback: try to find RPE within the same day range
              const { data: fallbackData, error: fallbackError } = await supabase
                .from('user_session_data')
                .select('session_rpe, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);
              
              
              if (fallbackData && fallbackData.length > 0) {
                // Find RPE for the closest date
                const workoutDateTime = new Date(workoutDate);
                const matchingRPE = fallbackData.find(item => {
                  const rpeDate = new Date(item.created_at);
                  return rpeDate.toDateString() === workoutDateTime.toDateString();
                });
                
                if (matchingRPE) {
                  setSessionRPE(matchingRPE.session_rpe);
                }
              }
            }
          } catch (rpeError) {
            console.error('❌ RPE loading error:', rpeError);
          }
        }
        // Analyze muscle groups from exercises
        const primaryMuscles = new Set<string>();
        const secondaryMuscles = new Set<string>();
        
        workoutData.exercises.forEach(exercise => {
          const exerciseInfo = exerciseService.getExerciseById(exercise.exerciseId);
          if (exerciseInfo) {
            exerciseInfo.targetMuscles.primary.forEach(muscle => primaryMuscles.add(muscle));
            exerciseInfo.targetMuscles.secondary.forEach(muscle => secondaryMuscles.add(muscle));
          } else {
            // Fallback: analyze exercise name for muscle groups
            const exerciseName = exercise.exerciseName.toLowerCase();
            const muscleKeywords = {
              '가슴': ['벤치', '체스트', '푸시업', '플라이', 'bench', 'chest', 'push'],
              '등': ['로우', '풀업', '풀다운', '데드리프트', 'row', 'pull', 'back', 'lat'],
              '어깨': ['숄더', '프레스', '레이즈', 'shoulder', 'press', 'raise', 'delt'],
              '팔': ['컬', '트라이셉', '암', 'curl', 'tricep', 'bicep', 'arm'],
              '다리': ['스쿼트', '레그', '런지', '카프', 'squat', 'leg', 'lunge', 'calf'],
              '코어': ['크런치', '플랭크', '앱', 'crunch', 'plank', 'ab', 'core'],
            };
            
            for (const [muscle, keywords] of Object.entries(muscleKeywords)) {
              if (keywords.some(keyword => exerciseName.includes(keyword))) {
                primaryMuscles.add(muscle);
                break;
              }
            }
          }
        });
        
        // Determine workout type based on muscle groups
        let workoutType = '전신';
        const primaryMuscleArray = Array.from(primaryMuscles);
        
        if (primaryMuscleArray.length > 0) {
          const upperBodyMuscles = ['가슴', '등', '어깨', '팔'];
          const lowerBodyMuscles = ['다리'];
          
          const hasUpperBody = primaryMuscleArray.some(muscle => upperBodyMuscles.includes(muscle));
          const hasLowerBody = primaryMuscleArray.some(muscle => lowerBodyMuscles.includes(muscle));
          
          if (hasUpperBody && !hasLowerBody) {
            workoutType = '상체';
          } else if (!hasUpperBody && hasLowerBody) {
            workoutType = '하체';
          } else if (primaryMuscleArray.length === 1) {
            workoutType = primaryMuscleArray[0];
          } else {
            workoutType = primaryMuscleArray.join(', ');
          }
        }
        
        setMuscleGroups({
          primary: primaryMuscleArray,
          secondary: Array.from(secondaryMuscles),
          workoutType,
        });
      }
    } catch (error) {
      console.error('Error loading workout data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '.');
  };

  const calculateCalories = (volume: number, duration: number): number => {
    // Rough estimation: ~0.05 calories per kg lifted + 5 calories per minute
    return Math.round(volume * 0.05 + (duration / 60) * 5);
  };

  const calculateIntensity = (exercises: any[], duration: number): number => {
    // Calculate intensity as average weight per minute
    let totalWeight = 0;
    let setCount = 0;
    
    exercises.forEach(exercise => {
      exercise.sets.forEach((set: any) => {
        if (set.weight && set.reps) {
          totalWeight += parseFloat(set.weight || '0') * parseInt(set.reps || '0');
          setCount++;
        }
      });
    });
    
    const minutes = duration / 60;
    return minutes > 0 ? Math.round(totalWeight / minutes) : 0;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>운동 정보를 찾을 수 없습니다</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>뒤로 가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const calories = calculateCalories(workout.totalVolume, workout.duration);
  const totalReps = workout.exercises.reduce((sum, ex) => 
    sum + ex.sets.reduce((setSum, set) => 
      setSum + parseInt(set.reps || '0'), 0
    ), 0
  );
  const avgIntensity = calculateIntensity(workout.exercises, workout.duration);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerBackButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{workout.routineName}</Text>
            <Text style={styles.headerDate}>{formatDate(workout.date)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.headerMenuButton}
            onPress={() => {
              Alert.alert(
                '운동 기록',
                '선택하세요',
                [
                  {
                    text: '편집',
                    onPress: () => {
                      Alert.alert('알림', '운동 기록 편집 기능은 준비 중입니다.');
                    }
                  },
                  {
                    text: '삭제',
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert(
                        '운동 기록 삭제',
                        '이 운동 기록을 삭제하시겠습니까?',
                        [
                          { text: '취소', style: 'cancel' },
                          { 
                            text: '삭제', 
                            style: 'destructive',
                            onPress: async () => {
                              // TODO: Implement delete functionality
                              Alert.alert('알림', '운동 기록이 삭제되었습니다.');
                              navigation.goBack();
                            }
                          }
                        ]
                      );
                    }
                  },
                  { text: '취소', style: 'cancel' }
                ]
              );
            }}
          >
            <Icon name="more-vert" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Muscle diagram section removed */}

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDuration(workout.duration)}</Text>
              <Text style={styles.statLabel}>WORKOUT</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.calorieValue]}>{calories}<Text style={styles.statUnit}>KCAL</Text></Text>
              <Text style={styles.statLabel}>CALORIES🔥</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalReps}<Text style={styles.statUnit}>회</Text></Text>
              <Text style={styles.statLabel}>REPS</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workout.totalVolume.toLocaleString()}<Text style={styles.statUnit}>kg</Text></Text>
              <Text style={styles.statLabel}>VOLUME</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.rpeValue]}>
                {sessionRPE !== null ? sessionRPE : '?'}<Text style={styles.statUnit}>/10</Text>
              </Text>
              <Text style={styles.statLabel}>RPE (운동 강도)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.ratingValue]}>
                {workout.rating ? '⭐'.repeat(workout.rating) : '⭐⭐⭐'}
              </Text>
              <Text style={styles.statLabel}>운동 평가</Text>
            </View>
          </View>
        </View>

        {/* Secondary Stats */}
        <View style={styles.secondaryStats}>
          <View style={styles.secondaryStatItem}>
            <Text style={styles.secondaryStatValue}>{workout.exercises.length}</Text>
            <Text style={styles.secondaryStatLabel}>EXERCISES</Text>
          </View>
          <View style={styles.secondaryStatItem}>
            <Text style={styles.secondaryStatValue}>{workout.totalSets}</Text>
            <Text style={styles.secondaryStatLabel}>SETS</Text>
          </View>
          <View style={styles.secondaryStatItem}>
            <Text style={styles.secondaryStatValue}>{avgIntensity}<Text style={styles.secondaryStatUnit}>kg/분</Text></Text>
            <Text style={styles.secondaryStatLabel}>INTENSITY</Text>
          </View>
        </View>

        {/* Exercise List */}
        <View style={styles.exerciseSection}>
          {workout.exercises.map((exercise, index) => {
            const exerciseInfo = exerciseService.getExerciseById(exercise.exerciseId);
            const maxWeight = Math.max(...exercise.sets
              .filter(s => s.weight)
              .map(s => parseFloat(s.weight || '0'))
            ) || 0;
            const totalReps = exercise.sets
              .reduce((sum, set) => sum + parseInt(set.reps || '0'), 0);
            
            // Calculate 1RM
            const oneRM = exercise.sets
              .filter(s => s.weight && s.reps)
              .map(set => {
                const weight = parseFloat(set.weight || '0');
                const reps = parseInt(set.reps || '0');
                if (reps === 1) return weight;
                if (reps >= 37) return weight;
                return weight * (36 / (37 - reps));
              })
              .reduce((max, curr) => Math.max(max, curr), 0);

            return (
              <TouchableOpacity key={index} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                    <View style={styles.exerciseStats}>
                      <Text style={styles.exerciseStat}>최고 무게: {maxWeight}kg | 1RM: {Math.round(oneRM)}kg</Text>
                    </View>
                  </View>
                  {(() => {
                    // Try to find exercise data by ID first, then by name
                    let exerciseData = exerciseDatabaseService.getExerciseById(exercise.exerciseId);
                    if (!exerciseData) {
                      exerciseData = exerciseDatabaseService.getExerciseByName(exercise.exerciseName);
                    }
                    
                    const thumbnail = exerciseData?.thumbnail || null;
                    
                    return thumbnail ? (
                      <Image 
                        source={thumbnail}
                        style={styles.exerciseThumbnail}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.exerciseThumbnailPlaceholder}>
                        <Icon name="fitness-center" size={60} color={Colors.textSecondary} />
                      </View>
                    );
                  })()}
                </View>

                <View style={styles.setsContainer}>
                  {exercise.sets.map((set, setIndex) => (
                    <View key={setIndex} style={styles.setCircle}>
                      <Text style={styles.setWeight}>{set.weight || '0'}</Text>
                      <Text style={styles.setReps}>{set.reps}X</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton}>
          <Icon name="share" size={20} color={Colors.primary} />
          <Text style={styles.shareButtonText}>공유하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerBackButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerDate: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
  },
  headerMenuButton: {
    padding: 8,
  },
  // muscle diagram styles removed
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  calorieValue: {
    color: '#FF6B6B',
  },
  rpeValue: {
    color: '#4ECDC4',
  },
  ratingValue: {
    color: '#FFD700',
    fontSize: 28,
  },
  statUnit: {
    fontSize: 18,
    fontWeight: 'normal',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    letterSpacing: 1,
  },
  secondaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#222222',
    marginBottom: 20,
  },
  secondaryStatItem: {
    alignItems: 'center',
  },
  secondaryStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryStatUnit: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  secondaryStatLabel: {
    fontSize: 11,
    color: '#666666',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  exerciseSection: {
    paddingHorizontal: 20,
  },
  exerciseCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  exerciseThumbnail: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  exerciseThumbnailPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseStats: {
    marginBottom: 12,
  },
  exerciseStat: {
    fontSize: 14,
    color: '#999999',
  },
  setsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  setCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setWeight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  setReps: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
});