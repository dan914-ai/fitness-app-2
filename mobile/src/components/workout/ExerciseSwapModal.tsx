import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface Exercise {
  id: string;
  name: string;
  targetMuscles: string[];
  category: string;
}

interface ExerciseSwapModalProps {
  visible: boolean;
  currentExercise: { id: string; name: string; targetMuscles?: string[] };
  onClose: () => void;
  onSwap: (exercise: Exercise) => void;
}

// Mock exercise database - replace with actual API
const exerciseDatabase: Exercise[] = [
  // Chest exercises
  { id: 'ex1', name: '벤치프레스', targetMuscles: ['가슴', '어깨', '삼두'], category: '가슴' },
  { id: 'ex2', name: '인클라인 벤치프레스', targetMuscles: ['가슴', '어깨'], category: '가슴' },
  { id: 'ex3', name: '덤벨 플라이', targetMuscles: ['가슴'], category: '가슴' },
  { id: 'ex4', name: '케이블 크로스오버', targetMuscles: ['가슴'], category: '가슴' },
  { id: 'ex5', name: '푸시업', targetMuscles: ['가슴', '삼두'], category: '가슴' },
  
  // Back exercises
  { id: 'ex6', name: '풀업', targetMuscles: ['등', '이두'], category: '등' },
  { id: 'ex7', name: '랫 풀다운', targetMuscles: ['등', '이두'], category: '등' },
  { id: 'ex8', name: '바벨 로우', targetMuscles: ['등'], category: '등' },
  { id: 'ex9', name: '시티드 로우', targetMuscles: ['등'], category: '등' },
  { id: 'ex10', name: '데드리프트', targetMuscles: ['등', '다리'], category: '등' },
  
  // Shoulder exercises
  { id: 'ex11', name: '숄더프레스', targetMuscles: ['어깨'], category: '어깨' },
  { id: 'ex12', name: '사이드 레터럴 레이즈', targetMuscles: ['어깨'], category: '어깨' },
  { id: 'ex13', name: '프론트 레이즈', targetMuscles: ['어깨'], category: '어깨' },
  { id: 'ex14', name: '리어 델토이드 플라이', targetMuscles: ['어깨'], category: '어깨' },
  
  // Leg exercises
  { id: 'ex15', name: '스쿼트', targetMuscles: ['다리', '둔근'], category: '다리' },
  { id: 'ex16', name: '레그프레스', targetMuscles: ['다리'], category: '다리' },
  { id: 'ex17', name: '레그컬', targetMuscles: ['다리'], category: '다리' },
  { id: 'ex18', name: '레그 익스텐션', targetMuscles: ['다리'], category: '다리' },
];

export default function ExerciseSwapModal({
  visible,
  currentExercise,
  onClose,
  onSwap,
}: ExerciseSwapModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = Array.from(new Set(exerciseDatabase.map(ex => ex.category)));

  // Filter exercises
  const filteredExercises = exerciseDatabase.filter(exercise => {
    // Don't show current exercise
    if (exercise.id === currentExercise.id) return false;
    
    // Filter by search query
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const exerciseName = (exercise.name || '').toLowerCase();
      if (!exerciseName.includes(query)) {
        return false;
      }
    }
    
    // Filter by category
    if (selectedCategory && exercise.category !== selectedCategory) {
      return false;
    }
    
    return true;
  });

  // Get similar exercises (same target muscles)
  const similarExercises = filteredExercises.filter(exercise => {
    if (!currentExercise.targetMuscles) return false;
    return exercise.targetMuscles.some(muscle => 
      currentExercise.targetMuscles?.includes(muscle)
    );
  });

  const handleExerciseSelect = (exercise: Exercise) => {
    onSwap(exercise);
    onClose();
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>운동 변경</Text>
              <Text style={styles.currentExercise}>{currentExercise.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="운동 검색..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          {/* Categories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategory && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[
                styles.categoryText,
                !selectedCategory && styles.categoryTextActive,
              ]}>전체</Text>
            </TouchableOpacity>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Exercise List */}
          <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
            {similarExercises.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>비슷한 운동</Text>
                {similarExercises.map(exercise => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.exerciseItem}
                    onPress={() => handleExerciseSelect(exercise)}
                  >
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <View style={styles.muscleTagsContainer}>
                        {exercise.targetMuscles.map((muscle, index) => (
                          <View key={index} style={styles.muscleTag}>
                            <Text style={styles.muscleTagText}>{muscle}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <Icon name="swap-horiz" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                ))}
              </>
            )}

            <Text style={styles.sectionTitle}>모든 운동</Text>
            {filteredExercises.map(exercise => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseItem}
                onPress={() => handleExerciseSelect(exercise)}
              >
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <View style={styles.muscleTagsContainer}>
                    {exercise.targetMuscles.map((muscle, index) => (
                      <View key={index} style={styles.muscleTag}>
                        <Text style={styles.muscleTagText}>{muscle}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Icon name="swap-horiz" size={20} color={Colors.primary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: Colors.background,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  currentExercise: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  exerciseList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
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
  muscleTagsContainer: {
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
});