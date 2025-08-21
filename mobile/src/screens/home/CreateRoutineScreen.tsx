import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/types';
import { Routine, routinesService } from '../../services/routines.service';
import ExercisePickerSheet from '../../components/workout/ExercisePickerSheet';
import storageService from '../../services/storage.service';
import { useLoading } from '../../components/common/LoadingIndicator';
import { LOADING_IDS } from '../../services/loading.service';

type CreateRoutineScreenProps = {
  navigation: StackNavigationProp<HomeStackParamList, 'CreateRoutine'>;
};

interface Exercise {
  id: string;
  name: string;
  targetMuscles: string[];
  sets: number;
  reps: string;
  weight?: string;
  restTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  gifUrl?: string;
}

export default function CreateRoutineScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const [routineName, setRoutineName] = useState('');
  const [routineDescription, setRoutineDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { withLoading } = useLoading();

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

  const handleSelectExercises = (exercises: any[]) => {
    // Map the selected exercises to include all required fields
    const mappedExercises: Exercise[] = exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      targetMuscles: ex.targetMuscles,
      sets: 3,
      reps: '8-12',
      weight: '',
      restTime: '90초',
      difficulty: 'intermediate',
      category: ex.category,
      gifUrl: ex.gifUrl,
    }));
    setSelectedExercises(mappedExercises);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter(e => e.id !== exerciseId));
  };

  const handleSaveRoutine = async () => {
    if (isSaving) {
      return; // Prevent multiple saves
    }

    if (!routineName.trim()) {
      setErrorMessage('루틴 이름을 입력해주세요.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (selectedExercises.length === 0) {
      setErrorMessage('최소 1개의 운동을 선택해주세요.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    try {
      // Create new routine object
      const newRoutine: Routine = {
        id: `routine-${Date.now()}`,
        name: routineName,
        description: routineDescription || '사용자 정의 루틴',
        targetMuscles: Array.from(new Set(selectedExercises.flatMap(ex => ex.targetMuscles))),
        duration: '30-45분',
        difficulty: 'intermediate',
        exercises: selectedExercises.map(ex => ({
          ...ex,
          gifUrl: ex.gifUrl || undefined,
        })),
      };

      // Save routine using routines service
      await routinesService.saveRoutine(newRoutine);
      
      // Clear the form immediately
      setRoutineName('');
      setRoutineDescription('');
      setSelectedExercises([]);
      
      // Show success indicator
      setShowSuccess(true);
      
      // Navigate back after showing success for 1.5 seconds
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Error saving routine:', error);
      // Show error visually since Alert doesn't work
      setShowSuccess(false);
      // You could add a setShowError(true) here with error banner
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Success Message */}
      {showSuccess && (
        <View style={styles.successBanner}>
          <Icon name="check-circle" size={24} color="#FFFFFF" />
          <Text style={styles.successText}>루틴이 저장되었습니다!</Text>
        </View>
      )}
      
      {/* Error Message */}
      {errorMessage ? (
        <View style={[styles.successBanner, { backgroundColor: Colors.error }]}>
          <Icon name="error" size={24} color="#FFFFFF" />
          <Text style={styles.successText}>{errorMessage}</Text>
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
        <Text style={styles.headerTitle}>새 루틴 만들기</Text>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSaveRoutine}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>{isSaving ? '저장 중...' : '저장'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Routine Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기본 정보</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>루틴 이름 *</Text>
            <TextInput
              style={styles.textInput}
              value={routineName}
              onChangeText={setRoutineName}
              placeholder="예: 상체 루틴, 하체 집중 운동"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>설명</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={routineDescription}
              onChangeText={setRoutineDescription}
              placeholder="루틴에 대한 설명을 입력하세요 (선택사항)"
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Selected Exercises */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>운동 목록 ({selectedExercises.length})</Text>
            <TouchableOpacity 
              style={styles.addExerciseButton}
              onPress={() => setShowExerciseList(true)}
            >
              <Icon name="add" size={20} color={Colors.primary} />
              <Text style={styles.addExerciseText}>운동 추가</Text>
            </TouchableOpacity>
          </View>

          {selectedExercises.length === 0 ? (
            <View style={styles.emptyExerciseList}>
              <Icon name="fitness-center" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyExerciseText}>선택된 운동이 없습니다</Text>
              <Text style={styles.emptyExerciseSubtext}>운동 추가 버튼을 눌러 운동을 선택하세요</Text>
            </View>
          ) : (
            selectedExercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                
                <View style={styles.exerciseInfo}>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) + '20' }]}>
                      <Text style={[styles.difficultyText, { color: getDifficultyColor(exercise.difficulty) }]}>
                        {getDifficultyText(exercise.difficulty)}
                      </Text>
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

                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveExercise(exercise.id)}
                >
                  <Icon name="close" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Exercise Selection Modal */}
        <ExercisePickerSheet
          visible={showExerciseList}
          onClose={() => setShowExerciseList(false)}
          selectedExercises={selectedExercises.map(ex => ex.id)}
          onSelectExercises={handleSelectExercises}
        />

        <View style={{ height: 100 }} />{/* Spacer */}
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
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  successBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: Colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    backgroundColor: Colors.surface,
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
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
  emptyExerciseList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyExerciseText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptyExerciseSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
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
    borderRadius: 16,
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
    borderRadius: 16,
  },
  muscleTagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
});