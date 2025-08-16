// Debug version to trace the exact issue
import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { exerciseDatabaseService } from '../../services/exerciseDatabase.service';

export default function ExerciseSelectionDebug() {
  // Get a few exercises to test
  const exercises = exerciseDatabaseService.getAllExercises().slice(0, 5);
  
  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Debug: Exercise Thumbnails</Text>
      
      {exercises.map((exercise, index) => (
        <View key={index} style={{ marginBottom: 20, borderWidth: 1, padding: 10 }}>
          <Text>Name: {exercise.exerciseName}</Text>
          <Text>ID: {exercise.exerciseId}</Text>
          <Text>ImageURL: {exercise.imageUrl || 'NO URL'}</Text>
          
          {exercise.imageUrl ? (
            <View>
              <Text>Testing image load:</Text>
              <Image 
                source={{ uri: exercise.imageUrl }}
                style={{ width: 100, height: 100, backgroundColor: 'lightgray' }}
                onError={(e) => console.log(`ERROR loading ${exercise.exerciseName}:`, e.nativeEvent)}
                onLoad={() => console.log(`SUCCESS loading ${exercise.exerciseName}`)}
              />
            </View>
          ) : (
            <Text style={{ color: 'red' }}>No image URL!</Text>
          )}
        </View>
      ))}
      
      <Text style={{ marginTop: 20 }}>Total exercises in DB: {exerciseDatabaseService.getAllExercises().length}</Text>
    </ScrollView>
  );
}