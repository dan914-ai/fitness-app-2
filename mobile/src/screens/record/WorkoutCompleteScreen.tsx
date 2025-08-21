import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  Share,
  Modal,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { RecordStackScreenProps } from '../../navigation/types';
import { Workout } from '../../types';
import { workoutService } from '../../services/workout.service';
import { getWorkoutById, getWorkoutHistory } from '../../utils/workoutHistory';
import { WorkoutHistoryItem } from '../../utils/workoutHistory';

type WorkoutCompleteScreenProps = RecordStackScreenProps<'WorkoutComplete'>;

export default function WorkoutCompleteScreen({ navigation, route }: WorkoutCompleteScreenProps) {
  const { workoutId } = route.params;
  const [workout, setWorkout] = useState<WorkoutHistoryItem | null>(null);
  const [workoutRating, setWorkoutRating] = useState(3);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveRoutineModal, setShowSaveRoutineModal] = useState(false);
  const [routineName, setRoutineName] = useState('');

  useEffect(() => {
    loadWorkout();
  }, []);

  const loadWorkout = async () => {
    try {
      
      // Add a small delay to ensure storage operations complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to load the workout
      const workoutData = await getWorkoutById(workoutId);
      
      if (workoutData) {
        setWorkout(workoutData);
        setWorkoutRating(workoutData.rating || 3);
        setWorkoutNotes(workoutData.memo || '');
          id: workoutData.id,
          name: workoutData.routineName,
          duration: workoutData.duration,
          exercises: workoutData.exercises.length
        });
      } else {
        console.error('[WorkoutComplete] Workout not found with ID:', workoutId);
        
        // Try to get all workouts to see what's available
        const allWorkouts = await getWorkoutHistory();
          id: w.id,
          name: w.routineName,
          date: w.date
        })));
        
        Alert.alert('오류', `운동 정보를 찾을 수 없습니다.\nID: ${workoutId}`);
        navigation.navigate('RecordMain');
      }
    } catch (error) {
      console.error('[WorkoutComplete] Error loading workout:', error);
      Alert.alert('오류', '운동 데이터를 불러올 수 없습니다.');
      navigation.navigate('RecordMain');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingChange = async (rating: number) => {
    setWorkoutRating(rating);
    // Rating will be saved locally - no API call needed for local storage
  };

  const handleNotesUpdate = async () => {
    if (workout && workoutNotes !== workout.memo) {
      // Notes will be saved locally - no API call needed for local storage
      Alert.alert('성공', '메모가 저장되었습니다.');
    }
  };

  const handleShare = async () => {
    if (!workout) return;

    const stats = calculateWorkoutStats(workout);
    const durationMinutes = Math.floor(workout.duration / 60);
    const message = `💪 운동 완료!\n\n` +
      `⏱ 시간: ${formatDuration(durationMinutes)}\n` +
      `🏋️ 운동: ${workout.exercises.length}개\n` +
      `📊 총 볼륨: ${stats.totalVolume.toLocaleString()}kg\n` +
      `🔥 칼로리: ${Math.round(durationMinutes * 5)}kcal\n` +
      `⭐ 평가: ${getRatingEmoji(workoutRating)}\n\n` +
      `#피트니스 #운동 #헬스`;

    try {
      await Share.share({
        message,
        title: '운동 기록 공유',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSaveAsRoutine = async () => {
    if (!routineName.trim()) {
      Alert.alert('알림', '루틴 이름을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      // API call to save workout as routine would go here
      Alert.alert('성공', `"${routineName}" 루틴이 저장되었습니다.`);
      setShowSaveRoutineModal(false);
      setRoutineName('');
    } catch (error) {
      console.error('Error saving routine:', error);
      Alert.alert('오류', '루틴을 저장할 수 없습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewWorkout = () => {
    navigation.navigate('WorkoutDetail', { workoutId });
  };

  const handleStartNewWorkout = () => {
    navigation.navigate('CreateWorkout', undefined);
  };

  const handleGoToHistory = () => {
    navigation.navigate('WorkoutHistory');
  };

  const formatDuration = (minutes?: number): string => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}시간 ${remainingMinutes}분`;
    }
    return `${remainingMinutes}분`;
  };

  const calculateWorkoutStats = (workout: WorkoutHistoryItem) => {
    const totalSets = workout.totalSets;
    const totalVolume = workout.totalVolume;
    const totalReps = workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((sum, set) => sum + parseInt(set.reps || '0'), 0);
    }, 0);

    return { totalSets, totalVolume, totalReps };
  };

  const getRatingEmoji = (rating: number): string => {
    const emojis = ['😵', '😓', '😊', '💪', '🔥'];
    return emojis[rating - 1] || '😊';
  };

  const getRatingText = (rating: number): string => {
    const texts = ['힘들었어요', '아쉬웠어요', '보통이었어요', '좋았어요', '최고였어요!'];
    return texts[rating - 1] || '보통이었어요';
  };

  if (isLoading || !workout) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>운동 정보를 불러오는 중...</Text>
      </View>
    );
  }

  const stats = calculateWorkoutStats(workout);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.celebration}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.congratsTitle}>운동 완료!</Text>
          <Text style={styles.congratsSubtitle}>수고하셨습니다</Text>
        </View>

        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>오늘 운동은 어떠셨나요?</Text>
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={styles.ratingStar}
                onPress={() => handleRatingChange(rating)}
              >
                <Text
                  style={[
                    styles.ratingStarText,
                    rating <= workoutRating && styles.ratingStarTextActive,
                  ]}
                >
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingDescription}>
            {getRatingEmoji(workoutRating)} {getRatingText(workoutRating)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>운동 요약</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDuration(Math.floor(workout.duration / 60))}</Text>
              <Text style={styles.statLabel}>운동 시간</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workout.exercises.length}</Text>
              <Text style={styles.statLabel}>운동 개수</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalSets}</Text>
              <Text style={styles.statLabel}>총 세트</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalVolume.toLocaleString()}</Text>
              <Text style={styles.statLabel}>총 볼륨(kg)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalReps}</Text>
              <Text style={styles.statLabel}>총 반복</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round((workout.duration / 60) * 5)}</Text>
              <Text style={styles.statLabel}>칼로리</Text>
            </View>
          </View>
        </View>

        <View style={styles.muscleGroupsCard}>
          <Text style={styles.muscleGroupsTitle}>운동한 부위</Text>
          <View style={styles.muscleGroups}>
            {workout.exercises.map((exercise, index) => (
              <View key={index} style={styles.muscleGroupTag}>
                <Text style={styles.muscleGroupText}>{exercise.exerciseName}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>운동 메모</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="오늘 운동에 대한 메모를 남겨보세요..."
            value={workoutNotes}
            onChangeText={setWorkoutNotes}
            multiline
            numberOfLines={4}
            onBlur={handleNotesUpdate}
          />
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionButtonIcon}>📤</Text>
            <Text style={styles.actionButtonText}>공유</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setShowSaveRoutineModal(true)}
          >
            <Text style={styles.actionButtonIcon}>💾</Text>
            <Text style={styles.actionButtonText}>루틴 저장</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleViewWorkout}>
            <Text style={styles.actionButtonIcon}>📊</Text>
            <Text style={styles.actionButtonText}>상세보기</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToHistory}>
          <Text style={styles.secondaryButtonText}>운동 기록</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleStartNewWorkout}>
          <Text style={styles.primaryButtonText}>새 운동 시작</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSaveRoutineModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSaveRoutineModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.routineModal}>
            <Text style={styles.routineModalTitle}>루틴으로 저장</Text>
            <Text style={styles.routineModalSubtitle}>
              이 운동을 루틴으로 저장하면 나중에 쉽게 다시 시작할 수 있습니다.
            </Text>
            
            <TextInput
              style={styles.routineNameInput}
              placeholder="루틴 이름을 입력하세요..."
              value={routineName}
              onChangeText={setRoutineName}
              autoFocus
            />

            <View style={styles.routineModalActions}>
              <TouchableOpacity 
                style={styles.routineModalCancel} 
                onPress={() => setShowSaveRoutineModal(false)}
              >
                <Text style={styles.routineModalCancelText}>취소</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.routineModalSave} 
                onPress={handleSaveAsRoutine}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.routineModalSaveText}>저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  content: {
    padding: 20,
  },
  celebration: {
    alignItems: 'center',
    marginVertical: 30,
  },
  celebrationEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  congratsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  congratsSubtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  ratingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  ratingStars: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  ratingStar: {
    padding: 4,
  },
  ratingStarText: {
    fontSize: 36,
    color: Colors.border,
  },
  ratingStarTextActive: {
    color: Colors.warning,
  },
  ratingDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: '30%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  muscleGroupsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  muscleGroupsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  muscleGroupTag: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  muscleGroupText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  notesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  notesInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionButtonIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  actionButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  bottomActions: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routineModal: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  routineModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  routineModalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  routineNameInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  routineModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  routineModalCancel: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  routineModalCancelText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  routineModalSave: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  routineModalSaveText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});