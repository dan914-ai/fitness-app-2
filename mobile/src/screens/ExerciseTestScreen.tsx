import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { ExerciseDetailModal } from '../components/ExerciseDetailModal';
import EXERCISE_DATABASE, { ExerciseData } from '../data/exerciseDatabase';

export const ExerciseTestScreen: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Show all exercises from the database
  const exercisesWithGifs = EXERCISE_DATABASE;

  // Apply search filter
  const filteredExercises = exercisesWithGifs.filter(exercise =>
    exercise.name.korean.includes(searchQuery)
  );

  const openExerciseModal = (exercise: ExerciseData) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedExercise(null);
  };

  const renderExerciseItem = ({ item }: { item: ExerciseData }) => {
    const hasGif = item.media?.supabaseGifUrl || (item.media?.gifUrl && !item.media?.gifUnavailable);
    
    return (
      <TouchableOpacity
        style={[
          styles.exerciseItem,
          hasGif ? styles.exerciseWithGif : styles.exerciseWithoutGif
        ]}
        onPress={() => openExerciseModal(item)}
      >
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseKorean}>{item.name.korean}</Text>
          <Text style={styles.gifStatus}>
            {hasGif ? '🎬' : '📷'}
          </Text>
        </View>
        
        
        <View style={styles.exerciseDetails}>
          <Text style={styles.category}>
            {item.category === 'compound' ? '복합운동' : '고립운동'}
          </Text>
          <Text style={styles.difficulty}>
            {item.difficulty === 'beginner' ? '초급자' : 
             item.difficulty === 'intermediate' ? '중급자' : '고급자'}
          </Text>
        </View>
        
        <Text style={styles.bodyParts}>
          {item.bodyParts.join(', ')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>운동 GIF 테스트</Text>
        <Text style={styles.subtitle}>
          {`총 ${EXERCISE_DATABASE.length}개 운동 (GIF 있음: ${EXERCISE_DATABASE.filter(e => e.media?.gifUrl && !e.media?.gifUnavailable).length}개)`}
        </Text>
        <Text style={styles.info}>
          Supabase GIF 사용 중 (fallback: InspireUSA)
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="운동 검색 (한국어, 영어, 로마자)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
      </View>

      <FlatList
        data={filteredExercises}
        renderItem={renderExerciseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <ExerciseDetailModal
        exercise={selectedExercise}
        visible={modalVisible}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  info: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  listContent: {
    padding: 15,
  },
  exerciseItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  exerciseWithGif: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  exerciseWithoutGif: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  exerciseKorean: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  gifStatus: {
    fontSize: 20,
  },
  exerciseRomanization: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  exerciseEnglish: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  exerciseDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  difficulty: {
    fontSize: 12,
    backgroundColor: '#FFF3E0',
    color: '#F57C00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bodyParts: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});