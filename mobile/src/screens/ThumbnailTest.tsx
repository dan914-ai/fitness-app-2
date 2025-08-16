import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { exerciseDatabaseService } from '../services/exerciseDatabase.service';
import { useNavigation } from '@react-navigation/native';

export default function ThumbnailTest() {
  const navigation = useNavigation();
  
  // Get first 5 exercises to test
  const exercises = exerciseDatabaseService.getAllExercises().slice(0, 5);
  
  console.log('🧪 ThumbnailTest: Got', exercises.length, 'exercises');
  console.log('🧪 First exercise:', exercises[0]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thumbnail Test</Text>
      <Text style={styles.subtitle}>Total exercises: {exerciseDatabaseService.getAllExercises().length}</Text>
      
      <TouchableOpacity 
        style={styles.testButton}
        onPress={() => navigation.navigate('기록' as any, { screen: 'ExerciseSelection' })}
      >
        <Text style={styles.testButtonText}>Test ExerciseSelectionScreen</Text>
      </TouchableOpacity>
      
      {exercises.map((exercise, index) => (
        <View key={exercise.exerciseId} style={styles.exerciseItem}>
          <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
          <Text style={styles.imageUrl}>URL: {exercise.imageUrl}</Text>
          
          {exercise.imageUrl ? (
            <Image 
              source={{ uri: exercise.imageUrl }}
              style={styles.image}
              onError={(e) => console.log('❌ Image error:', exercise.exerciseName, e.nativeEvent)}
              onLoad={() => console.log('✅ Image loaded:', exercise.exerciseName)}
            />
          ) : (
            <Text style={styles.noImage}>No Image URL</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  exerciseItem: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  imageUrl: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
  },
  noImage: {
    color: 'red',
    fontStyle: 'italic',
  },
  testButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});