import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useWorkout } from '../contexts/WorkoutContext';
import { Colors } from '../constants/colors';
import { MaterialIcons as Icon } from '@expo/vector-icons';

export default function TestWorkoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const workout = useWorkout();
  
  console.log('🎯 TestWorkoutScreen loaded successfully');
  console.log('Route params:', route.params);
  console.log('Workout context:', workout);
  
  const exercises = workout?.exercises || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>테스트 운동 화면</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.statusSection}>
          <Icon name="fitness-center" size={48} color={Colors.primary} />
          <Text style={styles.title}>운동 세션</Text>
          <Text style={styles.subtitle}>운동이 성공적으로 시작되었습니다!</Text>
        </View>
        
        <View style={styles.infoSection}>
          <View style={styles.info}>
            <Text style={styles.infoLabel}>루틴 ID:</Text>
            <Text style={styles.infoValue}>{route.params?.routineId || 'N/A'}</Text>
          </View>
          
          <View style={styles.info}>
            <Text style={styles.infoLabel}>루틴 이름:</Text>
            <Text style={styles.infoValue}>{workout?.routineName || 'N/A'}</Text>
          </View>
          
          <View style={styles.info}>
            <Text style={styles.infoLabel}>운동 개수:</Text>
            <Text style={styles.infoValue}>{exercises.length}개</Text>
          </View>
        </View>
        
        {exercises.length > 0 && (
          <View style={styles.exercisesSection}>
            <Text style={styles.sectionTitle}>운동 목록</Text>
            {exercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <Text style={styles.exerciseName}>{index + 1}. {exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.sets?.length || 0}세트 준비됨
                </Text>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.buttonsSection}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => {
              console.log('✅ 운동 세션이 정상적으로 시작되었습니다!');
              Alert.alert('성공!', '운동 시작 기능이 정상적으로 작동합니다.\n\n실제 운동 화면을 구현하려면 WorkoutSessionScreen을 수정하세요.');
            }}
          >
            <Icon name="play-arrow" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>운동 시작 (시뮬레이션)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={Colors.primary} />
            <Text style={[styles.buttonText, { color: Colors.primary }]}>돌아가기</Text>
          </TouchableOpacity>
        </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  infoSection: {
    marginVertical: 16,
  },
  info: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  exercisesSection: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  exerciseDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  buttonsSection: {
    marginVertical: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});