import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RecordStackParamList } from '../../navigation/types';
import { getWorkoutHistory, WorkoutHistoryItem, deleteWorkout } from '../../utils/workoutHistory';
import { Calendar } from 'react-native-calendars';
// MIGRATION: Removed unused getStaticThumbnail import
import { exerciseDatabaseService } from '../../services/exerciseDatabase.service';
import { calculateAdjustedVolume } from '../../utils/workoutCalculations';

type WorkoutHistoryScreenProps = {
  navigation: StackNavigationProp<RecordStackParamList, 'WorkoutHistory'>;
  route: RouteProp<RecordStackParamList, 'WorkoutHistory'>;
};

export default function WorkoutHistoryScreen() {
  const navigation = useNavigation<StackNavigationProp<RecordStackParamList>>();
  const route = useRoute<RouteProp<RecordStackParamList, 'WorkoutHistory'>>();
  
  const [workouts, setWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(true);

  // Reload workouts when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadWorkouts();
    }, [])
  );

  useEffect(() => {
    filterWorkouts();
  }, [selectedDate, workouts]);

  const loadWorkouts = async () => {
    try {
      // Debug storage first
      await debugStorage();
      
      const history = await getWorkoutHistory();
      if (history.length > 0 && history[0].exercises.length > 0) {
      }
      // Debug: Log all workouts to check if memo exists
      setWorkouts(history);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterWorkouts = () => {
    if (selectedDate) {
      const filtered = workouts.filter(workout => workout.date === selectedDate);
      setFilteredWorkouts(filtered);
    } else {
      setFilteredWorkouts(workouts);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadWorkouts();
  };

  const handleDeleteWorkout = async (workoutId: string, workoutName: string) => {
    const handleDelete = async () => {
      const success = await deleteWorkout(workoutId);
      if (success) {
        loadWorkouts();
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`"${workoutName}" 운동 기록을 삭제하시겠습니까?`);
      if (confirmed) {
        handleDelete();
      }
    } else {
      Alert.alert(
        '운동 기록 삭제',
        `"${workoutName}" 운동 기록을 삭제하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          { text: '삭제', style: 'destructive', onPress: handleDelete },
        ]
      );
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  // Recalculate volume with adjustments for dumbbells and unilateral movements
  const getAdjustedVolume = (workout: WorkoutHistoryItem): number => {
    let totalVolume = 0;
    
    workout.exercises.forEach(exercise => {
      // Get exercise data to check equipment type
      const exerciseData = exerciseDatabaseService.getExerciseById(exercise.exerciseId) || 
                          exerciseDatabaseService.getExerciseByName(exercise.exerciseName);
      const equipment = exerciseData?.equipment || '기타';
      const englishName = exerciseData?.englishName || '';
      
      // Calculate adjusted volume for each set
      exercise.sets.forEach(set => {
        const weight = parseFloat(set.weight) || 0;
        const reps = parseInt(set.reps) || 0;
        const adjustedVolume = calculateAdjustedVolume(
          weight,
          reps,
          exercise.exerciseName,
          equipment,
          englishName
        );
        totalVolume += adjustedVolume;
      });
    });
    
    return totalVolume;
  };

  // Get marked dates for calendar
  const getMarkedDates = () => {
    const marked: any = {};
    
    workouts.forEach(workout => {
      marked[workout.date] = {
        marked: true,
        dotColor: Colors.primary,
        selected: workout.date === selectedDate,
        selectedColor: Colors.primary,
      };
    });

    // If a date is selected but has no workout, still show it as selected
    if (selectedDate && !marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: Colors.primary,
      };
    }

    return marked;
  };

  // Group workouts by month
  const groupWorkoutsByMonth = () => {
    const grouped: { [key: string]: WorkoutHistoryItem[] } = {};
    
    filteredWorkouts.forEach(workout => {
      const date = new Date(workout.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(workout);
    });
    
    // Sort each month's workouts by date (newest first)
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => b.date.localeCompare(a.date));
    });
    
    return grouped;
  };

  const renderWorkoutCard = (workout: WorkoutHistoryItem) => {
    if (workout.exercises.length > 0) {
    }
    
    return (
    <TouchableOpacity
      key={workout.id}
      style={styles.workoutCard}
      onPress={() => navigation.navigate('WorkoutDetail', { workoutId: workout.id })}
    >
      <View style={styles.workoutHeader}>
        <View>
          <Text style={styles.workoutTitle}>{workout.routineName}</Text>
          <Text style={styles.workoutDate}>
            {new Date(workout.startTime).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
              weekday: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteWorkout(workout.id, workout.routineName)}
        >
          <Icon name="delete-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.workoutStats}>
        <View style={styles.statItem}>
          <Icon name="timer" size={16} color={Colors.textSecondary} />
          <Text style={styles.statText}>{formatDuration(workout.duration)}</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="fitness-center" size={16} color={Colors.textSecondary} />
          <Text style={styles.statText}>{getAdjustedVolume(workout).toLocaleString()}kg</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="format-list-numbered" size={16} color={Colors.textSecondary} />
          <Text style={styles.statText}>{workout.totalSets} 세트</Text>
        </View>
      </View>

      <View style={styles.exercisesList}>
        <View style={[styles.exerciseThumbnails, { backgroundColor: '#f0f0f0', padding: 8 }]}>
          {workout.exercises.slice(0, 4).map((exercise, index) => {
            // Safely try to find exercise data
            let exerciseData = null;
            try {
              if (exercise.exerciseId) {
                exerciseData = exerciseDatabaseService.getExerciseById(exercise.exerciseId);
              }
              if (!exerciseData && exercise.exerciseName) {
                exerciseData = exerciseDatabaseService.getExerciseByName(exercise.exerciseName);
              }
            } catch (error) {
            }
            
            const thumbnail = exerciseData?.thumbnail || null;
            
            return (
              <View key={index} style={styles.thumbnailContainer}>
                {thumbnail ? (
                  <Image 
                    source={thumbnail}
                    style={styles.exerciseThumbnail}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.exerciseThumbnail, styles.thumbnailPlaceholder]}>
                    <Icon name="fitness-center" size={20} color={Colors.textLight} />
                    <Text style={{ fontSize: 10, color: Colors.textLight, marginTop: 2 }}>No img</Text>
                  </View>
                )}
              </View>
            );
          })}
          {workout.exercises.length > 4 && (
            <View style={[styles.thumbnailContainer, styles.moreThumbnail]}>
              <Text style={styles.moreText}>+{workout.exercises.length - 4}</Text>
            </View>
          )}
        </View>
        <View style={styles.exerciseNames}>
          {workout.exercises.slice(0, 3).map((exercise, index) => (
            <Text key={index} style={styles.exerciseItem} numberOfLines={1}>
              • {exercise.exerciseName}
            </Text>
          ))}
          {workout.exercises.length > 3 && (
            <Text style={styles.moreExercises}>+{workout.exercises.length - 3}개 더</Text>
          )}
        </View>
      </View>
      
      {workout.memo && (
        <View style={styles.memoSection}>
          <Icon name="note" size={16} color={Colors.primary} />
          <Text style={styles.memoText} numberOfLines={3}>
            {workout.memo}
          </Text>
        </View>
      )}
      
      {workout.rating && (
        <View style={styles.ratingSection}>
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map(star => (
              <Icon 
                key={star} 
                name="star" 
                size={14} 
                color={star <= workout.rating ? Colors.warning : Colors.border} 
              />
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>운동 기록을 불러오는 중...</Text>
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
        <Text style={styles.headerTitle}>운동 기록</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {__DEV__ && (
            <>
              <TouchableOpacity 
                style={styles.calendarToggle}
                onPress={async () => {
                  await testStoragePersistence();
                  loadWorkouts();
                }}
              >
                <Icon name="bug-report" size={24} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.calendarToggle}
                onPress={async () => {
                  await diagnoseStorageIssue();
                  loadWorkouts();
                }}
              >
                <Icon name="healing" size={24} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.calendarToggle}
                onPress={async () => {
                  await addMultipleTestWorkouts(3);
                  loadWorkouts();
                }}
              >
                <Icon name="add" size={24} color={Colors.text} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity 
            style={styles.calendarToggle}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Icon 
              name={showCalendar ? "calendar-today" : "calendar-view-month"} 
              size={24} 
              color={Colors.text} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar */}
      {showCalendar && (
        <View style={styles.calendarContainer}>
          <Calendar
            markedDates={getMarkedDates()}
            onDayPress={(day) => {
              setSelectedDate(day.dateString === selectedDate ? null : day.dateString);
            }}
            theme={{
              backgroundColor: Colors.surface,
              calendarBackground: Colors.surface,
              textSectionTitleColor: Colors.textSecondary,
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: Colors.primary,
              todayBackgroundColor: Colors.primaryLight,
              dayTextColor: Colors.text,
              textDisabledColor: Colors.textLight,
              dotColor: Colors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: Colors.primary,
              monthTextColor: Colors.text,
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
            monthFormat={'yyyy년 MM월'}
            firstDay={1}
          />
        </View>
      )}

      {/* Filter Info */}
      {selectedDate && (
        <View style={styles.filterInfo}>
          <Text style={styles.filterText}>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </Text>
          <TouchableOpacity onPress={() => setSelectedDate(null)}>
            <Icon name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Summary Stats */}
      {workouts.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{filteredWorkouts.length}</Text>
            <Text style={styles.summaryLabel}>운동 횟수</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {filteredWorkouts.reduce((sum, w) => sum + getAdjustedVolume(w), 0).toLocaleString()}
            </Text>
            <Text style={styles.summaryLabel}>총 볼륨(kg)</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {Math.floor(filteredWorkouts.reduce((sum, w) => sum + w.duration, 0) / 60)}
            </Text>
            <Text style={styles.summaryLabel}>총 시간(분)</Text>
          </View>
        </View>
      )}

      {/* Workout List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {filteredWorkouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="fitness-center" size={64} color={Colors.textLight} />
            <Text style={styles.emptyStateText}>
              {selectedDate 
                ? '선택한 날짜에 운동 기록이 없습니다' 
                : '아직 운동 기록이 없습니다'}
            </Text>
            <Text style={styles.emptyStateSubtext}>운동을 시작하고 기록을 남겨보세요!</Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => navigation.navigate('RecordMain')}
            >
              <Text style={styles.startButtonText}>운동 시작하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          Object.entries(groupWorkoutsByMonth()).map(([monthKey, monthWorkouts]) => (
            <View key={monthKey} style={styles.monthSection}>
              <Text style={styles.monthTitle}>
                {new Date(monthKey + '-01').toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                })}
              </Text>
              {monthWorkouts.map(renderWorkoutCard)}
            </View>
          ))
        )}
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
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  calendarToggle: {
    padding: 8,
  },
  calendarContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 10,
  },
  filterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primaryLight,
  },
  filterText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  monthSection: {
    marginTop: 20,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  workoutCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  workoutDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  exercisesList: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  exerciseThumbnails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  thumbnailContainer: {
    marginRight: 8,
  },
  exerciseThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 16,
  },
  thumbnailPlaceholder: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  exerciseNames: {
    gap: 2,
  },
  exerciseItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  moreExercises: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyStateText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  startButton: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
    paddingHorizontal: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  memoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  ratingSection: {
    marginTop: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
});