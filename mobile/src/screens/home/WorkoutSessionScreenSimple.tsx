import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/types';
import { useWorkout } from '../../contexts/WorkoutContext';

type WorkoutSessionScreenProps = {
  navigation: StackNavigationProp<HomeStackParamList, 'WorkoutSession'>;
  route: RouteProp<HomeStackParamList, 'WorkoutSession'>;
};

export default function WorkoutSessionScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, 'WorkoutSession'>>();
  const workout = useWorkout();
  const { routineId, fallbackExercises } = route.params;
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  
  console.log('🔍 WorkoutSessionScreen DEBUG:');
  console.log('  - routineId:', routineId);
  console.log('  - fallbackExercises provided:', !!fallbackExercises, 'length:', fallbackExercises?.length || 0);
  console.log('  - workout context exists:', !!workout);
  console.log('  - workout state:', workout?.state);
  console.log('  - workout.state.exercises (raw object):', workout?.state?.exercises);
  console.log('  - workout.state.exerciseOrder:', workout?.state?.exerciseOrder);
  console.log('  - getOrderedExercises result:', workout?.getOrderedExercises());
  console.log('  - getOrderedExercises length:', workout?.getOrderedExercises()?.length || 0);
  
  // Use context exercises if available, fallback to passed exercises if context is empty
  const contextExercises = workout?.getOrderedExercises() || [];
  const exercises = contextExercises.length > 0 ? contextExercises : (fallbackExercises || []);
  const currentExercise = exercises[currentExerciseIndex];
  
  console.log('🎯 Final exercise data:');
  console.log('  - exercises array:', exercises);
  console.log('  - exercises length:', exercises.length);
  console.log('  - currentExerciseIndex:', currentExerciseIndex);
  console.log('  - currentExercise:', currentExercise);
  
  useEffect(() => {
    // Add delay to allow context to update on mobile
    const checkExercises = setTimeout(() => {
      console.log('🔍 Delayed exercise check - exercises.length:', exercises.length);
      if (exercises.length === 0) {
        console.log('⚠️ No exercises found after delay - showing alert');
        Alert.alert('오류', '운동이 없습니다.', [
          { text: '확인', onPress: () => navigation.goBack() }
        ]);
      } else {
        console.log('✅ Found exercises after delay:', exercises.length);
      }
    }, 2000); // Give 2000ms for context to update (debugging)

    return () => clearTimeout(checkExercises);
  }, [exercises.length, navigation]);
  
  const handleSetComplete = (setIndex: number) => {
    if (currentExercise) {
      // Mark set as complete in workout context
      console.log('Completing set:', setIndex, 'for exercise:', currentExercise.exerciseId);
      // workout.completeSet would be called here
    }
  };
  
  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // Workout complete
      Alert.alert(
        '운동 완료',
        '모든 운동을 완료했습니다!',
        [
          { 
            text: '완료', 
            onPress: () => {
              workout?.endWorkout();
              navigation.navigate('HomeScreen');
            }
          }
        ]
      );
    }
  };
  
  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };
  
  const handleEndWorkout = () => {
    Alert.alert(
      '운동 종료',
      '정말 운동을 종료하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '종료', 
          style: 'destructive',
          onPress: () => {
            workout?.endWorkout();
            navigation.navigate('HomeScreen');
          }
        }
      ]
    );
  };
  
  if (!currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>운동 세션</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="fitness-center" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>운동을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleEndWorkout}>
          <Icon name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>운동 세션</Text>
        <Text style={styles.progressText}>
          {currentExerciseIndex + 1}/{exercises.length}
        </Text>
      </View>
      
      {/* Current Exercise */}
      <ScrollView style={styles.content}>
        <View style={styles.exerciseSection}>
          <Text style={styles.exerciseName}>{currentExercise.exerciseName}</Text>
          <Text style={styles.exerciseInfo}>
            운동 {currentExerciseIndex + 1} / {exercises.length}
          </Text>
        </View>
        
        {/* Sets */}
        <View style={styles.setsSection}>
          <Text style={styles.sectionTitle}>세트</Text>
          {currentExercise.sets?.map((set: any, index: number) => (
            <View key={index} style={styles.setRow}>
              <Text style={styles.setNumber}>{index + 1}</Text>
              <View style={styles.setInputs}>
                <Text style={styles.setInput}>{set.weight || '0'}kg</Text>
                <Text style={styles.setInput}>{set.reps || '0'}회</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.setButton,
                  set.completed && styles.setButtonCompleted
                ]}
                onPress={() => handleSetComplete(index)}
              >
                <Icon 
                  name={set.completed ? "check" : "circle"} 
                  size={20} 
                  color={set.completed ? "#FFFFFF" : Colors.primary} 
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      
      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handlePreviousExercise}
          disabled={currentExerciseIndex === 0}
        >
          <Icon name="skip-previous" size={24} color={
            currentExerciseIndex === 0 ? Colors.textSecondary : Colors.primary
          } />
          <Text style={[
            styles.actionButtonText,
            { color: currentExerciseIndex === 0 ? Colors.textSecondary : Colors.primary }
          ]}>이전</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleNextExercise}
        >
          <Icon name="skip-next" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonTextPrimary}>
            {currentExerciseIndex < exercises.length - 1 ? '다음' : '완료'}
          </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  progressText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  exerciseSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  exerciseInfo: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  setsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginBottom: 8,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    width: 30,
  },
  setInputs: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  setInput: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  setButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  setButtonCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  actionButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});