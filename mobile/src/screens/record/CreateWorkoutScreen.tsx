import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { RecordStackScreenProps } from '../../navigation/types';
import { Exercise } from '../../types';
import { workoutService } from '../../services/workout.service';
import { getStaticThumbnail } from '../../constants/staticThumbnails';

type CreateWorkoutScreenProps = RecordStackScreenProps<'CreateWorkout'>;

interface SelectedExercise extends Exercise {
  targetSets?: number;
  targetReps?: number;
  targetWeight?: number;
  targetDuration?: number;
  notes?: string;
}

export default function CreateWorkoutScreen({ navigation, route }: CreateWorkoutScreenProps) {
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle exercises from ExerciseSelection screen
  useEffect(() => {
    if (route.params?.selectedExercises) {
      
      const newExercises = route.params.selectedExercises.map(exercise => ({
        ...exercise,
        targetSets: 3,
        targetReps: 10,
        targetWeight: undefined,
        targetDuration: undefined,
        notes: undefined,
      }));
      setSelectedExercises(prev => {
        // Merge with existing exercises, avoiding duplicates
        const existingIds = prev.map(e => e.exerciseId);
        const filteredNew = newExercises.filter(e => !existingIds.includes(e.exerciseId));
        return [...prev, ...filteredNew];
      });
    }
  }, [route.params?.selectedExercises]);

  const handleAddExercises = () => {
    navigation.navigate('ExerciseSelection', {
      selectedExercises: selectedExercises.map(e => e.exerciseId)
    });
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(e => e.exerciseId !== exerciseId));
  };

  const updateExerciseTarget = (exerciseId: string, field: string, value: string) => {
    setSelectedExercises(prev =>
      prev.map(exercise =>
        exercise.exerciseId === exerciseId
          ? { ...exercise, [field]: value ? parseFloat(value) : undefined }
          : exercise
      )
    );
  };

  const updateExerciseNotes = (exerciseId: string, notes: string) => {
    setSelectedExercises(prev =>
      prev.map(exercise =>
        exercise.exerciseId === exerciseId
          ? { ...exercise, notes }
          : exercise
      )
    );
  };

  const handleStartWorkout = async () => {
    if (selectedExercises.length === 0) {
      Alert.alert('알림', '운동을 추가해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const workout = await workoutService.createWorkout({
        exercises: selectedExercises.map(exercise => ({
          exerciseId: exercise.exerciseId,
          targetSets: exercise.targetSets,
          targetReps: exercise.targetReps,
          targetWeight: exercise.targetWeight,
          targetDuration: exercise.targetDuration,
          notes: exercise.notes,
        })),
        notes: workoutNotes || undefined,
      });

      navigation.replace('ActiveWorkout', { workoutId: workout.workoutId });
    } catch (error) {
      console.error('Error creating workout:', error);
      Alert.alert('오류', '운동을 시작할 수 없습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>새 운동 만들기</Text>
          <Text style={styles.subtitle}>운동을 선택하고 목표를 설정하세요</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>운동 선택</Text>
          
          <TouchableOpacity style={styles.addButton} onPress={handleAddExercises}>
            <Text style={styles.addButtonText}>+ 운동 추가</Text>
          </TouchableOpacity>

          {selectedExercises.map((exercise) => {
            // Get thumbnail from local assets
            const thumbnailAsset = getStaticThumbnail(exercise.exerciseId);
            
            return (
              <View key={exercise.exerciseId} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                    <Text style={styles.exerciseDetails}>
                      {`${exercise.muscleGroup} • ${exercise.difficulty}`}
                    </Text>
                  </View>
                  
                  {/* Thumbnail on the right */}
                  {thumbnailAsset ? (
                    <Image
                      source={thumbnailAsset}
                      style={styles.exerciseThumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.exerciseThumbnail, styles.thumbnailPlaceholder]}>
                      <Text style={styles.thumbnailPlaceholderText}>No Image</Text>
                    </View>
                  )}
                  
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveExercise(exercise.exerciseId)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

              <View style={styles.targetInputs}>
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>세트</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      keyboardType="numeric"
                      value={exercise.targetSets?.toString() || ''}
                      onChangeText={(value) => updateExerciseTarget(exercise.exerciseId, 'targetSets', value)}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>횟수</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      keyboardType="numeric"
                      value={exercise.targetReps?.toString() || ''}
                      onChangeText={(value) => updateExerciseTarget(exercise.exerciseId, 'targetReps', value)}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>무게(kg)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      value={exercise.targetWeight?.toString() || ''}
                      onChangeText={(value) => updateExerciseTarget(exercise.exerciseId, 'targetWeight', value)}
                    />
                  </View>
                </View>

                <TextInput
                  style={styles.notesInput}
                  placeholder="운동 메모 (선택사항)"
                  multiline
                  numberOfLines={2}
                  value={exercise.notes || ''}
                  onChangeText={(value) => updateExerciseNotes(exercise.exerciseId, value)}
                />
              </View>
            </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>운동 메모</Text>
          <TextInput
            style={styles.workoutNotesInput}
            placeholder="오늘의 운동에 대한 메모를 작성하세요..."
            multiline
            numberOfLines={4}
            value={workoutNotes}
            onChangeText={setWorkoutNotes}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startButton, selectedExercises.length === 0 && styles.startButtonDisabled]}
          onPress={handleStartWorkout}
          disabled={selectedExercises.length === 0 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.startButtonText}>운동 시작</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseCard: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
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
  exerciseDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exerciseThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 12,
    marginRight: 8,
  },
  thumbnailPlaceholder: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholderText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  targetInputs: {
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    textAlign: 'center',
  },
  notesInput: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  workoutNotesInput: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  startButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});