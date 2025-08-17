import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Pressable,
  SectionList,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { exerciseDatabaseService } from '../../services/exerciseDatabase.service';
import { Exercise as ExerciseType } from '../../types';
// MIGRATION: Replacing ExerciseThumbnail with UnifiedExerciseThumbnail
// import ExerciseThumbnail from '../common/ExerciseThumbnail';
import UnifiedExerciseThumbnail from '../common/UnifiedExerciseThumbnail';

interface Exercise {
  id: string;
  name: string;
  targetMuscles: string[];
  category: string;
  gifUrl?: string;
}

interface ExercisePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercises: (exercises: Exercise[]) => void;
  selectedExercises?: string[];
}

// Get color for muscle group
const getMuscleGroupColor = (muscleGroup: string): string => {
  const colorMap: Record<string, string> = {
    '가슴': '#FF6B6B',      // Red
    '등': '#4ECDC4',        // Teal
    '어깨': '#FFE66D',      // Yellow
    '이두근': '#95E1D3',    // Mint
    '삼두근': '#F38181',    // Pink
    '대퇴사두근': '#AA96DA', // Purple
    '햄스트링': '#FCBAD3',  // Light Pink
    '둔근': '#A8E6CF',      // Light Green
    '복근': '#FFD93D',      // Gold
    '종아리': '#6BCB77',    // Green
    '팔뚝': '#FF8B94',      // Coral
  };
  
  return colorMap[muscleGroup] || '#E0E0E0';
};

export default function ExercisePickerSheet({
  visible,
  onClose,
  onSelectExercises,
  selectedExercises = [],
}: ExercisePickerSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedExercises);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Safe setter for selectedCategory
  const handleSetSelectedCategory = (category: string | null) => {
    if (category === null || (category && typeof category === 'string')) {
      setSelectedCategory(category);
    } else {
      console.warn('Invalid category attempted to be set:', category);
      setSelectedCategory(null);
    }
  };

  // Load exercises when component mounts or becomes visible
  useEffect(() => {
    if (visible) {
      loadExercises();
    }
  }, [visible]);

  const loadExercises = () => {
    setIsLoading(true);
    try {
      // Use getAllExercises instead of getAllExercisesWithDetails to avoid thumbnail issues
      const allExercises = exerciseDatabaseService.getAllExercises();
      if (Array.isArray(allExercises)) {
        // Filter out any invalid exercises
        const validExercises = allExercises.filter(ex => 
          ex && typeof ex === 'object' && ex.exerciseId
        );
        setExercises(validExercises);
      } else {
        console.error('Invalid exercises data:', allExercises);
        setExercises([]);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  };


  // Memoized filtered exercises for better performance
  const filteredExercises = useMemo(() => {
    const filtered = exercises.filter(exercise => {
      try {
        // Ensure exercise exists and has required properties
        if (!exercise || !exercise.exerciseId) return false;
        
        // Filter by search query
        if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim()) {
          const query = (searchQuery || '').toLowerCase();
          const exerciseName = (exercise.exerciseName || '').toLowerCase();
          
          // Check if exercise name matches
          const nameMatches = exerciseName.includes(query);
          
          // Check if any target muscle matches
          let muscleMatches = false;
          // Check muscle group instead
          if (exercise.muscleGroup && typeof exercise.muscleGroup === 'string') {
            muscleMatches = exercise.muscleGroup.toLowerCase().includes(query);
          }
          
          if (!nameMatches && !muscleMatches) return false;
        }
        
        // Filter by selected category
        if (selectedCategory && selectedCategory !== null) {
          if (!exercise.muscleGroup || exercise.muscleGroup !== selectedCategory) {
            return false;
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error filtering exercise:', exercise?.exerciseId, error);
        return false;
      }
    });
    
    return filtered;
  }, [exercises, searchQuery, selectedCategory]);

  // For better performance, use a flat list instead of sections
  // We'll add category headers as items in the flat list
  const flatListData = useMemo(() => {
    const groupedExercises = filteredExercises.reduce((acc, exercise) => {
      try {
        const category = exercise?.muscleGroup || '기타';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(exercise);
      } catch (error) {
        console.error('Error grouping exercise:', exercise?.exerciseId, error);
      }
      return acc;
    }, {} as Record<string, ExerciseType[]>);

    // Flatten data with headers
    const flatData: Array<{ type: 'header' | 'exercise'; data: string | ExerciseType; key: string }> = [];
    
    Object.entries(groupedExercises)
      .filter(([_, exercises]) => exercises.length > 0)
      .forEach(([category, exercises]) => {
        // Add header
        flatData.push({
          type: 'header',
          data: category,
          key: `header-${category}`
        });
        
        // Add exercises
        exercises.forEach(exercise => {
          flatData.push({
            type: 'exercise',
            data: exercise,
            key: `exercise-${exercise.exerciseId}`
          });
        });
      });
    
    return flatData;
  }, [filteredExercises]);

  // Get unique muscle groups for category filter
  const rawCategories = exerciseDatabaseService.getMuscleGroups() || [];
  
  // Filter and validate categories
  const categories = rawCategories.filter(cat => {
    if (!cat || typeof cat !== 'string') {
      console.warn('⚠️ Invalid category filtered out:', cat);
      return false;
    }
    return true;
  });

  const toggleExercise = (exerciseId: string) => {
    if (!exerciseId || typeof exerciseId !== 'string') {
      console.warn('toggleExercise called with invalid exerciseId:', exerciseId);
      return;
    }
    
    setSelectedIds(prev => 
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleConfirm = () => {
    const selectedExerciseObjects = exercises
      .filter(ex => ex && selectedIds.includes(ex.exerciseId))
      .map(ex => ({
        id: ex.exerciseId || '',
        exerciseId: ex.exerciseId || '',  // Include both formats for compatibility
        name: ex.exerciseName || '운동',
        exerciseName: ex.exerciseName || '운동',  // Include both formats for compatibility
        targetMuscles: [ex.muscleGroup] || [],
        category: ex.muscleGroup || '기타',
        muscleGroup: ex.muscleGroup || '기타',  // Include original format
        gifUrl: ex.gifUrl || '',
      }));
    onSelectExercises(selectedExerciseObjects);
    onClose();
  };

  // Static thumbnail in list, animated GIF on tap
  const ThumbnailDisplay = useCallback(({ exercise }: { exercise: ExerciseType }) => {
    return (
      <UnifiedExerciseThumbnail
        exerciseId={exercise.exerciseId}
        exerciseName={exercise.exerciseName}
        muscleGroup={exercise.muscleGroup}
        gifUrl={exercise.gifUrl}
        size={60}
        style={styles.exerciseThumbnail}
        showModal={true}
      />
    );
  }, []);

  const renderFlatListItem = ({ item }: { item: { type: 'header' | 'exercise'; data: string | ExerciseType; key: string } }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{item.data as string}</Text>
        </View>
      );
    }
    
    const exercise = item.data as ExerciseType;
    
    // Comprehensive validation
    if (!exercise || typeof exercise !== 'object') {
      console.warn('Invalid exercise item:', exercise);
      return null;
    }
    
    if (!exercise.exerciseId) {
      console.warn('Exercise missing exerciseId:', exercise);
      return null;
    }
    
    const isSelected = selectedIds.includes(exercise.exerciseId);
    const primaryMuscles = exercise.muscleGroup ? [exercise.muscleGroup] : [];
    
    return (
      <TouchableOpacity
        style={[styles.exerciseItem, isSelected && styles.exerciseItemSelected]}
        onPress={() => toggleExercise(exercise.exerciseId)}
      >
        <View style={styles.thumbnailContainer}>
          <ThumbnailDisplay 
            exercise={exercise}
          />
        </View>
        
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.exerciseName || '운동'}</Text>
          <View style={styles.muscleTagsContainer}>
            {primaryMuscles.filter(Boolean).map((muscle, index) => (
              <View key={`${muscle}-${index}`} style={styles.muscleTag}>
                <Text style={styles.muscleTagText}>{muscle || ''}</Text>
              </View>
            ))}
          </View>
          <View style={styles.equipmentContainer}>
            <Icon name="fitness-center" size={12} color={Colors.textSecondary} />
            <Text style={styles.equipmentText}>{exercise.equipment}</Text>
          </View>
        </View>
        
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Icon name="check" size={16} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>운동 추가</Text>
          <TouchableOpacity 
            onPress={handleConfirm}
            style={[styles.confirmButton, selectedIds.length === 0 && styles.confirmButtonDisabled]}
            disabled={selectedIds.length === 0}
          >
            <Text style={[styles.confirmButtonText, selectedIds.length === 0 && styles.confirmButtonTextDisabled]}>
              완료 ({selectedIds.length})
            </Text>
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
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !selectedCategory && styles.categoryChipActive,
            ]}
            onPress={() => handleSetSelectedCategory(null)}
          >
            <Text style={[
              styles.categoryText,
              !selectedCategory && styles.categoryTextActive,
            ]}>전체</Text>
          </TouchableOpacity>
          {categories.filter(Boolean).map(category => {
            if (!category || typeof category !== 'string') return null;
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => handleSetSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}>{category}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Exercise List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>운동 목록 불러오는 중...</Text>
          </View>
        ) : (
          <FlatList
            data={flatListData}
            keyExtractor={(item) => item.key}
            renderItem={renderFlatListItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? '검색 결과가 없습니다' : '운동이 없습니다'}
                </Text>
              </View>
            }
            // Ultra-optimized performance settings
            initialNumToRender={8}
            maxToRenderPerBatch={3}
            windowSize={3}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={10}
            // Simplified fixed height for all items
            getItemLayout={(data, index) => ({
              length: 80,
              offset: 80 * index,
              index,
            })}
            // Fast scrolling
            decelerationRate="fast"
            scrollEventThrottle={16}
          />
        )}
      </SafeAreaView>
    </Modal>
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
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.border,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  categoriesContainer: {
    height: 60,  // Fixed height instead of maxHeight to prevent clipping
    marginBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,  // Add vertical padding
    alignItems: 'center',  // Center items vertically
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,  // Increased padding for better touch targets
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginRight: 8,
    minHeight: 40,  // Ensure minimum height
    justifyContent: 'center',  // Center text vertically
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
    textAlign: 'center',  // Center text horizontally
    lineHeight: 20,  // Ensure consistent line height
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  exerciseItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  thumbnailContainer: {
    marginRight: 12,
  },
  exerciseThumbnail: {
    // LocalThumbnail handles its own sizing and styling
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
    marginTop: 4,
  },
  muscleTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  muscleTagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  exerciseSubname: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  equipmentText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});