import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storageService from '../../services/storage.service';
import { routinesService, Routine as ServiceRoutine } from '../../services/routines.service';
import { nukeAllRoutines } from '../../utils/nukeRoutines';

type RoutineManagementScreenProps = {
  navigation: StackNavigationProp<HomeStackParamList, 'RoutineManagement'>;
};

interface Routine {
  id: string;
  name: string;
  description: string;
  exerciseCount: number;
  lastUsed: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  isFavorite: boolean;
}


export default function RoutineManagementScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'lastUsed' | 'difficulty'>('lastUsed');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Load routines when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRoutines();
    }, [])
  );
  
  const loadRoutines = async () => {
    try {
      setIsLoading(true);
      
      // NUCLEAR REMOVAL OF ALL ROUTINES
      console.error('☢️ ROUTINE MANAGEMENT: NUKING ALL ROUTINES');
      await nukeAllRoutines();
      
      // FORCE EMPTY - Don't load anything
      const serviceRoutines = [];
      
      // Convert to display format
      const allRoutines: Routine[] = serviceRoutines.map(routine => ({
        id: routine.id,
        name: routine.name,
        description: routine.description,
        exerciseCount: routine.exercises.length,
        lastUsed: routine.lastUsed ? 
          getRelativeTimeString(new Date(routine.lastUsed)) : '없음',
        difficulty: routine.difficulty,
        duration: routine.duration,
        isFavorite: false, // This could be stored separately if needed
      }));
      
      // FORCE EMPTY ROUTINES
      setRoutines([]);
      console.error('🚫 NO ROUTINES ALLOWED - FORCED EMPTY');
    } catch (error) {
      console.error('Error loading routines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRelativeTimeString = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return '오늘';
    if (diffInDays === 1) return '어제';
    if (diffInDays < 7) return `${diffInDays}일 전`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}주일 전`;
    return `${Math.floor(diffInDays / 30)}달 전`;
  };

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

  const handleToggleFavorite = (routineId: string) => {
    setRoutines(routines.map(routine => 
      routine.id === routineId 
        ? { ...routine, isFavorite: !routine.isFavorite }
        : routine
    ));
  };

  const handleDeleteRoutine = async (routineId: string, routineName: string) => {
    try {
      // FORCE ALLOW DELETION OF ALL ROUTINES
      // Removed isCustom check - all routines can be deleted
      
      
      // Remove from state
      setRoutines(prevRoutines => prevRoutines.filter(routine => routine.id !== routineId));
      
      // Remove from routines service
      await routinesService.deleteRoutine(routineId);
      
    } catch (error) {
      console.error('Error deleting routine:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('오류', '루틴 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEditRoutine = (routineId: string) => {
    // Navigate to edit screen (would be implemented similar to CreateRoutine)
    Alert.alert('알림', '루틴 편집 기능은 곧 추가됩니다.');
  };

  const handleDuplicateRoutine = (routine: Routine) => {
    const newRoutine: Routine = {
      ...routine,
      id: `routine-${Date.now()}`,
      name: `${routine.name} (복사본)`,
      lastUsed: '방금',
      isFavorite: false,
    };
    setRoutines([newRoutine, ...routines]);
    Alert.alert('성공', '루틴이 복사되었습니다.');
  };

  const sortedRoutines = [...routines].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'difficulty':
        const difficultyOrder = { 'beginner': 0, 'intermediate': 1, 'advanced': 2 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      case 'lastUsed':
      default:
        // For simplicity, just sort favorites first, then by name
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
    }
  });

  const showRoutineOptions = (routine: Routine) => {
    setSelectedRoutine(routine);
    setShowOptionsModal(true);
  };

  const handleOptionSelect = (action: string) => {
    if (!selectedRoutine) return;
    
    setShowOptionsModal(false);
    
    switch (action) {
      case 'detail':
        navigation.navigate('RoutineDetail', { 
          routineId: selectedRoutine.id, 
          routineName: selectedRoutine.name 
        });
        break;
      case 'edit':
        handleEditRoutine(selectedRoutine.id);
        break;
      case 'copy':
        handleDuplicateRoutine(selectedRoutine);
        break;
      case 'delete':
        setShowDeleteConfirm(true);
        break;
    }
  };

  const confirmDelete = async () => {
    if (selectedRoutine) {
      setShowDeleteConfirm(false);
      await handleDeleteRoutine(selectedRoutine.id, selectedRoutine.name);
      setSelectedRoutine(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>루틴 관리</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateRoutine')}
        >
          <Icon name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>정렬:</Text>
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'lastUsed' && styles.sortButtonActive]}
          onPress={() => setSortBy('lastUsed')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'lastUsed' && styles.sortButtonTextActive]}>
            최근 사용순
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
          onPress={() => setSortBy('name')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>
            이름순
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'difficulty' && styles.sortButtonActive]}
          onPress={() => setSortBy('difficulty')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'difficulty' && styles.sortButtonTextActive]}>
            난이도순
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>루틴을 불러오는 중...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Statistics */}
          <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{routines.length}</Text>
            <Text style={styles.statLabel}>총 루틴</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{routines.filter(r => r.isFavorite).length}</Text>
            <Text style={styles.statLabel}>즐겨찾기</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.round(routines.reduce((sum, r) => sum + r.exerciseCount, 0) / routines.length)}
            </Text>
            <Text style={styles.statLabel}>평균 운동수</Text>
          </View>
        </View>

        {/* Routine List */}
        <View style={styles.routineList}>
          {sortedRoutines.map((routine) => (
            <TouchableOpacity 
              key={routine.id} 
              style={styles.routineCard}
              onPress={() => navigation.navigate('RoutineDetail', { 
                routineId: routine.id, 
                routineName: routine.name 
              })}
            >
              <View style={styles.routineCardHeader}>
                <View style={styles.routineInfo}>
                  <View style={styles.routineNameRow}>
                    <Text style={styles.routineName}>{routine.name}</Text>
                    {routine.isFavorite && (
                      <Icon name="star" size={20} color={Colors.warning} />
                    )}
                  </View>
                  <Text style={styles.routineDescription} numberOfLines={2}>
                    {routine.description}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.menuButton}
                  onPress={() => showRoutineOptions(routine)}
                >
                  <Icon name="more-vert" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.routineStats}>
                <View style={styles.routineStatItem}>
                  <Icon name="fitness-center" size={16} color={Colors.textSecondary} />
                  <Text style={styles.routineStatText}>{routine.exerciseCount}개 운동</Text>
                </View>
                <View style={styles.routineStatItem}>
                  <Icon name="schedule" size={16} color={Colors.textSecondary} />
                  <Text style={styles.routineStatText}>{routine.duration}</Text>
                </View>
                <View style={styles.routineStatItem}>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(routine.difficulty) + '20' }]}>
                    <Text style={[styles.difficultyText, { color: getDifficultyColor(routine.difficulty) }]}>
                      {getDifficultyText(routine.difficulty)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.routineActions}>
                <Text style={styles.lastUsedText}>마지막 사용: {routine.lastUsed}</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.favoriteButton}
                    onPress={() => handleToggleFavorite(routine.id)}
                  >
                    <Icon 
                      name={routine.isFavorite ? "star" : "star-border"} 
                      size={20} 
                      color={routine.isFavorite ? Colors.warning : Colors.textSecondary} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.startButton}
                    onPress={() => navigation.navigate('RoutineDetail', { 
                      routineId: routine.id, 
                      routineName: routine.name 
                    })}
                  >
                    <Icon name="play-arrow" size={16} color="#FFFFFF" />
                    <Text style={styles.startButtonText}>시작</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 20 }} />{/* Spacer */}
      </ScrollView>
      )}

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowOptionsModal(false)}
        >
          <Pressable style={styles.optionsSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            
            <Text style={styles.optionsTitle}>{selectedRoutine?.name}</Text>
            <Text style={styles.optionsSubtitle}>어떤 작업을 하시겠습니까?</Text>
            
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => handleOptionSelect('detail')}
            >
              <Icon name="visibility" size={24} color={Colors.text} />
              <Text style={styles.optionText}>상세보기</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => handleOptionSelect('edit')}
            >
              <Icon name="edit" size={24} color={Colors.text} />
              <Text style={styles.optionText}>편집</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => handleOptionSelect('copy')}
            >
              <Icon name="content-copy" size={24} color={Colors.text} />
              <Text style={styles.optionText}>복사</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionItem, styles.deleteOption]}
              onPress={() => handleOptionSelect('delete')}
            >
              <Icon name="delete" size={24} color={Colors.error} />
              <Text style={[styles.optionText, styles.deleteText]}>삭제</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowOptionsModal(false)}
            >
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowDeleteConfirm(false)}
        >
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>루틴 삭제</Text>
            <Text style={styles.confirmMessage}>
              "{selectedRoutine?.name}" 루틴을 삭제하시겠습니까?
            </Text>
            <Text style={styles.confirmWarning}>
              이 작업은 취소할 수 없습니다.
            </Text>
            
            <View style={styles.confirmActions}>
              <TouchableOpacity 
                style={styles.confirmCancelButton}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.confirmCancelText}>취소</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmDeleteButton}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmDeleteText}>삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
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
  addButton: {
    padding: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sortLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 12,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: Colors.background,
  },
  sortButtonActive: {
    backgroundColor: Colors.primary,
  },
  sortButtonText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  routineList: {
    paddingHorizontal: 20,
  },
  routineCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  routineCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routineInfo: {
    flex: 1,
  },
  routineNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  routineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  routineDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  menuButton: {
    padding: 4,
  },
  routineStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  routineStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routineStatText: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  routineActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUsedText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  optionsSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  optionsSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 16,
  },
  deleteOption: {
    borderBottomWidth: 0,
  },
  deleteText: {
    color: Colors.error,
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  confirmDialog: {
    backgroundColor: Colors.surface,
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 400,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmWarning: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: Colors.error,
    alignItems: 'center',
  },
  confirmDeleteText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});