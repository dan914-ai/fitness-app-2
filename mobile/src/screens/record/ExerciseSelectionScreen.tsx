import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { RecordStackScreenProps } from '../../navigation/types';
import { Exercise } from '../../types';
import { workoutService } from '../../services/workout.service';
import { exerciseDatabaseService } from '../../services/exerciseDatabase.service';
import { getStaticThumbnail } from '../../constants/staticThumbnails';
import ExerciseThumbnail from '../../components/ExerciseThumbnail';

type ExerciseSelectionScreenProps = RecordStackScreenProps<'ExerciseSelection'>;

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: '가슴', label: '가슴' },
  { key: '등', label: '등' },
  { key: '어깨', label: '어깨' },
  { key: '이두근', label: '이두근' },
  { key: '삼두근', label: '삼두근' },
  { key: '대퇴사두근', label: '대퇴사두근' },
  { key: '햄스트링', label: '햄스트링' },
  { key: '둔근', label: '둔근' },
  { key: '복근', label: '복근' },
  { key: '종아리', label: '종아리' },
];

const getMuscleGroupColor = (muscleGroup: string): string => {
  const colorMap: Record<string, string> = {
    '가슴': '#1976d2',     // Blue
    '등': '#7b1fa2',      // Purple
    '어깨': '#f57c00',    // Orange
    '이두근': '#388e3c',  // Green
    '삼두근': '#c2185b',  // Pink
    '대퇴사두근': '#00695c', // Teal
    '햄스트링': '#fbc02d', // Yellow
    '둔근': '#689f38',    // Light Green
    '복근': '#d32f2f',    // Red
    '종아리': '#512da8',  // Deep Purple
    '팔뚝': '#795548',    // Brown
  };
  return colorMap[muscleGroup] || '#757575'; // Default gray
};

export default function ExerciseSelectionScreen({ navigation, route }: ExerciseSelectionScreenProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(
    new Set(route.params?.selectedExercises || [])
  );
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, selectedCategory, searchQuery]);

  const loadExercises = async (page = 1, append = false) => {
    try {
      console.log('🚀🚀🚀 Loading exercises v3 - FORCED REFRESH, category:', selectedCategory);
      
      if (!append) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      // Always use database directly for consistent data
      const exercisesData = exerciseDatabaseService.getExercisesPaginated({
        page,
        limit: 20,
        muscleGroup: selectedCategory !== 'all' ? selectedCategory : undefined,
      });
      
      console.log('📦 Got exercises data:', exercisesData.exercises.length, 'exercises');

      // Exercises from database already have imageUrl (local thumbnails for lists)
      const exercisesWithThumbnails = exercisesData.exercises;

      if (append) {
        setExercises(prev => [...prev, ...exercisesWithThumbnails]);
        setFilteredExercises(prev => [...prev, ...exercisesWithThumbnails]);
      } else {
        setExercises(exercisesWithThumbnails);
        setFilteredExercises(exercisesWithThumbnails);
      }

      setHasMore(page < exercisesData.pagination.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('❌ Error loading exercises:', error);
      console.error('Stack trace:', error.stack);
      
      // Use exercises from the database as fallback with proper muscle group filtering
      const muscleGroup = selectedCategory !== 'all' ? selectedCategory : undefined;
      const dbResponse = exerciseDatabaseService.getExercisesPaginated({
        page: 1,
        limit: 20,
        muscleGroup
      });
      const fallbackExercises = dbResponse.exercises;
      
      if (!append) {
        setExercises(fallbackExercises);
        setFilteredExercises(fallbackExercises);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadExercises(currentPage + 1, true);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (searchQuery) {
      filtered = exercises.filter(exercise => 
        exercise.exerciseName.includes(searchQuery) ||
        exercise.muscleGroup.includes(searchQuery)
      );
    }

    if (filtered.length > 0) {
      const firstAbdominal = filtered.find(e => e.exerciseId >= '348' && e.exerciseId <= '367');
      if (firstAbdominal) {
      }
    }
    setFilteredExercises(filtered);
  };

  const handleCategoryChange = (category: string) => {
    if (category === '복근') {
      alert('DEBUG: Loading abdominal exercises - check console for logs!');
    }
    setSelectedCategory(category);
    setCurrentPage(1);
    setHasMore(true);
    setExercises([]); // Clear exercises immediately for better UX
    loadExercises(1, false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      // Use database search directly
      const searchResults = exerciseDatabaseService.searchExercises(query);
      setFilteredExercises(searchResults);
    } else {
      // Show all exercises when search is cleared
      setFilteredExercises(exercises);
    }
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    const newSelected = new Set(selectedExercises);
    if (newSelected.has(exerciseId)) {
      newSelected.delete(exerciseId);
    } else {
      newSelected.add(exerciseId);
    }
    setSelectedExercises(newSelected);
  };

  const handleConfirmSelection = () => {
    const selectedExerciseList = filteredExercises.filter(exercise => 
      selectedExercises.has(exercise.exerciseId)
    );
    
    // Navigate back with the selected exercises
    navigation.navigate('CreateWorkout', { 
      selectedExercises: selectedExerciseList 
    });
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => {
    const isSelected = selectedExercises.has(item.exerciseId);

    return (
      <TouchableOpacity
        style={[styles.exerciseItem, isSelected && styles.exerciseItemSelected]}
        onPress={() => toggleExerciseSelection(item.exerciseId)}
      >
        <View style={styles.exerciseContent}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{item.exerciseName}</Text>
            <Text style={styles.exerciseDetails}>
              {`${item.muscleGroup} • ${item.difficulty}`}
            </Text>
            {item.equipment && (
              <Text style={styles.exerciseEquipment}>{item.equipment}</Text>
            )}
          </View>
          
          {/* Use simplified ExerciseThumbnail component */}
          <ExerciseThumbnail
            source={item.thumbnail}
            exerciseName={item.exerciseName}
            muscleGroup={item.muscleGroup}
            style={styles.exerciseImage}
          />
        </View>
        
        <View style={[styles.selectionIndicator, isSelected && styles.selectionIndicatorSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryTab = ({ item }: { item: typeof CATEGORIES[0] }) => {
    const isSelected = selectedCategory === item.key;
    
    return (
      <TouchableOpacity
        style={[styles.categoryTab, isSelected && styles.categoryTabSelected]}
        onPress={() => handleCategoryChange(item.key)}
      >
        <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextSelected]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>운동을 불러오는 중...</Text>
      </View>
    );
  }
  
  // Debug: Show total exercises count

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>운동 선택</Text>
        <Text style={styles.subtitle}>
          {selectedExercises.size}개 선택됨
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="운동 검색..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderCategoryTab}
        keyExtractor={(item) => item.key}
        style={styles.categoryList}
        contentContainerStyle={styles.categoryListContent}
      />

      <FlatList
        data={filteredExercises}
        renderItem={(props) => {
          if (filteredExercises.length > 0 && filteredExercises.indexOf(props.item) === 0) {
          }
          return renderExerciseItem(props);
        }}
        keyExtractor={(item) => item.exerciseId}
        style={styles.exerciseList}
        contentContainerStyle={styles.exerciseListContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : null
        }
      />

      {selectedExercises.size > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmSelection}>
            <Text style={styles.confirmButtonText}>
              {selectedExercises.size}개 운동 선택 완료
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryList: {
    maxHeight: 50,
  },
  categoryListContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryTabSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryTabText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  categoryTabTextSelected: {
    color: '#FFFFFF',
  },
  exerciseList: {
    flex: 1,
    marginTop: 15,
  },
  exerciseListContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  exerciseItem: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseItemSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  exerciseContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 15,
    backgroundColor: Colors.background,
    ...Platform.select({
      web: {
        objectFit: 'cover' as any,
      },
    }),
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  exerciseSubname: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  exerciseEquipment: {
    fontSize: 12,
    color: Colors.textLight,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicatorSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingMore: {
    padding: 20,
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Debug: App reload check
