import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Button,
  Platform,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MenuStackScreenProps } from '../../navigation/types';
import workoutProgramsService, { WorkoutProgram } from '../../services/workoutPrograms.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = MenuStackScreenProps<'WorkoutPrograms'>

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: number; // seconds
  notes?: string;
}

export default function WorkoutProgramsScreen({ navigation }: Props) {
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramDescription, setNewProgramDescription] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setIsLoading(true);
      const loadedPrograms = await workoutProgramsService.getAllPrograms();
      setPrograms(loadedPrograms);
    } catch (error) {
      console.error('Error loading programs:', error);
      Alert.alert('오류', '프로그램을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add cache clearing function
  const clearProgramRoutines = async () => {
    try {
      // Get all routines
      const routinesJson = await AsyncStorage.getItem('@user_routines');
      if (!routinesJson) {
        console.log('No routines found');
        return;
      }
      
      const routines = JSON.parse(routinesJson);
      
      // Filter out routines that have a programId (created from programs)
      const nonProgramRoutines = routines.filter((r: any) => !r.programId);
      
      console.log(`Found ${routines.length} total routines`);
      console.log(`Keeping ${nonProgramRoutines.length} non-program routines`);
      console.log(`Removing ${routines.length - nonProgramRoutines.length} program routines`);
      
      // Save back only non-program routines
      await AsyncStorage.setItem('@user_routines', JSON.stringify(nonProgramRoutines));
      
      console.log('✅ Program routines cleared successfully');
      window.alert('프로그램 루틴이 삭제되었습니다. 프로그램을 다시 활성화하면 한글 이름으로 생성됩니다.');
    } catch (error) {
      console.error('Error clearing program routines:', error);
      window.alert('오류가 발생했습니다.');
    }
  };

  const clearProgramCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear cached program data and reload fresh programs. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all program-related cache
              await AsyncStorage.multiRemove([
                '@workout_programs',
                '@active_program',
                '@custom_programs',
                '@program_state'
              ]);
              
              // Force reload programs
              await loadPrograms();
              
              Alert.alert(
                'Success', 
                'Cache cleared! All 12 professional programs should now be visible.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cache. Please try restarting the app.');
            }
          }
        }
      ]
    );
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '초급';
      case 'intermediate':
        return '중급';
      case 'advanced':
        return '고급';
      default:
        return '초급';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return Colors.success;
      case 'intermediate':
        return Colors.warning;
      case 'advanced':
        return Colors.error;
      default:
        return Colors.success;
    }
  };

  const handleDeactivateProgram = async (programId: string) => {
    console.log('🔴 handleDeactivateProgram called with ID:', programId);
    
    // For web, use window.confirm instead of Alert.alert
    const isWeb = Platform.OS === 'web';
    
    if (isWeb) {
      const confirmed = window.confirm('이 프로그램을 비활성화하시겠습니까?\n\n프로그램에서 생성된 루틴은 유지됩니다.');
      if (confirmed) {
        console.log('📌 User confirmed deactivation (web)');
        try {
          console.log('🔄 Calling deactivateProgram service...');
          await workoutProgramsService.deactivateProgram();
          await loadPrograms(); // Reload to show updated state
          window.alert('프로그램이 비활성화되었습니다.');
        } catch (error) {
          console.error('❌ Error deactivating program:', error);
          window.alert('프로그램 비활성화 중 오류가 발생했습니다.');
        }
      }
    } else {
      // Original Alert.alert for mobile
      Alert.alert(
        '프로그램 비활성화',
        '이 프로그램을 비활성화하시겠습니까?\n\n프로그램에서 생성된 루틴은 유지됩니다.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '비활성화',
            style: 'destructive',
            onPress: async () => {
              console.log('📌 User confirmed deactivation');
              try {
                console.log('🔄 Calling deactivateProgram service...');
                await workoutProgramsService.deactivateProgram();
                await loadPrograms(); // Reload to show updated state
                Alert.alert('완료', '프로그램이 비활성화되었습니다.');
              } catch (error) {
                console.error('❌ Error deactivating program:', error);
                Alert.alert('오류', '프로그램 비활성화 중 오류가 발생했습니다.');
              }
            },
          },
        ]
      );
    }
  };

  const handleActivateProgram = async (programId: string) => {
    console.log('🎯 handleActivateProgram called with ID:', programId);
    
    // For web, use window.confirm instead of Alert.alert
    const isWeb = Platform.OS === 'web';
    
    if (isWeb) {
      const confirmed = window.confirm('이 프로그램을 현재 활성 프로그램으로 설정하시겠습니까?\n\n프로그램의 운동이 루틴으로 생성됩니다.');
      if (confirmed) {
        console.log('📌 User confirmed activation (web)');
        try {
          console.log('🔄 Calling activateProgram service...');
          const success = await workoutProgramsService.activateProgram(programId);
          console.log('📊 Activation result:', success);
          if (success) {
            await loadPrograms(); // Reload to show updated state
            window.alert('프로그램이 활성화되었습니다.\n\n홈 화면의 루틴에서 운동을 시작하세요!');
            navigation.goBack(); // Go back to menu/home to see the new routines
          } else {
            window.alert('프로그램 활성화에 실패했습니다.');
          }
        } catch (error) {
          console.error('❌ Error activating program:', error);
          window.alert('프로그램 활성화 중 오류가 발생했습니다.');
        }
      }
    } else {
      // Original Alert.alert for mobile
      Alert.alert(
        '프로그램 활성화',
        '이 프로그램을 현재 활성 프로그램으로 설정하시겠습니까?\n\n프로그램의 운동이 루틴으로 생성됩니다.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '활성화',
            onPress: async () => {
              console.log('📌 User confirmed activation');
              try {
                console.log('🔄 Calling activateProgram service...');
                const success = await workoutProgramsService.activateProgram(programId);
                console.log('📊 Activation result:', success);
                if (success) {
                  await loadPrograms(); // Reload to show updated state
                  Alert.alert('성공', '프로그램이 활성화되었습니다.\n\n홈 화면의 루틴에서 운동을 시작하세요!');
                  navigation.goBack(); // Go back to menu/home to see the new routines
                } else {
                  Alert.alert('오류', '프로그램 활성화에 실패했습니다.');
                }
              } catch (error) {
                console.error('❌ Error activating program:', error);
                Alert.alert('오류', '프로그램 활성화 중 오류가 발생했습니다.');
              }
            },
          },
        ]
      );
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    const program = programs.find(p => p.id === programId);
    if (!program?.isCustom) {
      Alert.alert('알림', '기본 프로그램은 삭제할 수 없습니다.');
      return;
    }

    Alert.alert(
      '프로그램 삭제',
      '정말로 이 프로그램을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await workoutProgramsService.deleteProgram(programId);
              if (success) {
                await loadPrograms();
                Alert.alert('성공', '프로그램이 삭제되었습니다.');
              } else {
                Alert.alert('오류', '프로그램 삭제에 실패했습니다.');
              }
            } catch (error) {
              console.error('Error deleting program:', error);
              Alert.alert('오류', '프로그램 삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleCreateProgram = async () => {
    if (!newProgramName.trim()) {
      Alert.alert('오류', '프로그램 이름을 입력해주세요.');
      return;
    }

    try {
      const newProgram = await workoutProgramsService.createProgram({
        name: newProgramName.trim(),
        description: newProgramDescription.trim() || '사용자 정의 프로그램',
        duration: 4,
        difficulty: selectedDifficulty,
        category: '사용자 정의',
        workoutDays: [], // Empty for now, user can add workouts later
        isCustom: true,
        isActive: false,
      });

      await loadPrograms();
      setShowCreateModal(false);
      setNewProgramName('');
      setNewProgramDescription('');
      setSelectedDifficulty('beginner');
      Alert.alert('성공', '새로운 프로그램이 생성되었습니다.\n\n프로그램을 활성화하면 운동을 시작할 수 있습니다.');
    } catch (error) {
      console.error('Error creating program:', error);
      Alert.alert('오류', '프로그램 생성 중 오류가 발생했습니다.');
    }
  };

  const getTotalExercises = (program: WorkoutProgram): number => {
    if (!program.workoutDays) return 0;
    return program.workoutDays.reduce((total, day) => total + day.exercises.length, 0);
  };

  const renderProgramCard = (program: WorkoutProgram) => (
    <View key={program.id} style={styles.programCard}>
      <View style={styles.programHeader}>
        <View style={styles.programTitleSection}>
          <Text style={styles.programName}>{program.name}</Text>
          {program.isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>활성</Text>
            </View>
          )}
          {program.isCustom && (
            <View style={styles.customBadge}>
              <Text style={styles.customBadgeText}>사용자 정의</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            Alert.alert(
              '프로그램 메뉴',
              program.name,
              [
                {
                  text: '활성화',
                  onPress: () => handleActivateProgram(program.id),
                },
                {
                  text: '편집',
                  onPress: () => Alert.alert('알림', '편집 기능은 준비 중입니다.'),
                },
                ...(program.isCustom ? [{
                  text: '삭제',
                  style: 'destructive' as const,
                  onPress: () => handleDeleteProgram(program.id),
                }] : []),
                {
                  text: '취소',
                  style: 'cancel' as const,
                },
              ]
            );
          }}
        >
          <Icon name="more-vert" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.programDescription}>{program.description}</Text>

      <View style={styles.programStats}>
        <View style={styles.statItem}>
          <Icon name="schedule" size={16} color={Colors.textSecondary} />
          <Text style={styles.statText}>{program.duration}주</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="fitness-center" size={16} color={Colors.textSecondary} />
          <Text style={styles.statText}>{getTotalExercises(program)}개 운동</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="local-offer" size={16} color={Colors.textSecondary} />
          <Text style={styles.statText}>{program.category}</Text>
        </View>
      </View>

      <View style={styles.programFooter}>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(program.difficulty) + '20' }]}>
          <Text style={[styles.difficultyText, { color: getDifficultyColor(program.difficulty) }]}>
            {getDifficultyText(program.difficulty)}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.actionButton,
            program.isActive ? styles.activeButton : styles.inactiveButton,
          ]}
          onPress={() => {
            if (program.isActive) {
              handleDeactivateProgram(program.id);
            } else {
              handleActivateProgram(program.id);
            }
          }}
        >
          <Text style={[
            styles.actionButtonText,
            program.isActive ? styles.activeButtonText : styles.inactiveButtonText,
          ]}>
            {program.isActive ? '비활성화' : '시작하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>새 프로그램 만들기</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Icon name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>프로그램 이름</Text>
            <TextInput
              style={styles.input}
              value={newProgramName}
              onChangeText={setNewProgramName}
              placeholder="프로그램 이름을 입력하세요"
              placeholderTextColor={Colors.textLight}
            />

            <Text style={styles.inputLabel}>설명</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newProgramDescription}
              onChangeText={setNewProgramDescription}
              placeholder="프로그램 설명을 입력하세요"
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>난이도</Text>
            <View style={styles.difficultySelector}>
              {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.difficultyOption,
                    selectedDifficulty === difficulty && styles.selectedDifficultyOption,
                  ]}
                  onPress={() => setSelectedDifficulty(difficulty as any)}
                >
                  <Text
                    style={[
                      styles.difficultyOptionText,
                      selectedDifficulty === difficulty && styles.selectedDifficultyOptionText,
                    ]}
                  >
                    {getDifficultyText(difficulty)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateProgram}
            >
              <Text style={styles.createButtonText}>생성</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>운동 프로그램</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.cacheButton}
            onPress={clearProgramRoutines}
            onLongPress={clearProgramCache}
          >
            <Icon name="delete-sweep" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Icon name="add" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            체계적인 운동 프로그램으로 목표를 달성하세요. 
            기본 제공 프로그램을 사용하거나 나만의 프로그램을 만들 수 있습니다.
          </Text>
          {programs.length < 12 && (
            <TouchableOpacity 
              style={styles.cacheHint}
              onPress={clearProgramCache}
            >
              <Icon name="info-outline" size={16} color={Colors.warning} />
              <Text style={styles.cacheHintText}>
                Not seeing all programs? Tap the refresh icon to clear cache.
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.programsList}>
          {programs.map(renderProgramCard)}
        </View>
      </ScrollView>

      {renderCreateModal()}
    </View>
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
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cacheButton: {
    padding: 8,
    marginRight: 4,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  description: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.surface,
  },
  descriptionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  cacheHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: Colors.warning + '10',
    borderRadius: 8,
  },
  cacheHintText: {
    fontSize: 14,
    color: Colors.warning,
    marginLeft: 8,
  },
  programsList: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  programCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  programTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  programName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  activeBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.success,
  },
  customBadge: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  customBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  menuButton: {
    padding: 4,
  },
  programDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  programStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  programFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeButton: {
    backgroundColor: Colors.success + '20',
    borderColor: Colors.success,
  },
  inactiveButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeButtonText: {
    color: Colors.success,
  },
  inactiveButtonText: {
    color: Colors.surface,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  difficultySelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  difficultyOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginRight: 8,
  },
  selectedDifficultyOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  difficultyOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  selectedDifficultyOptionText: {
    color: Colors.surface,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.surface,
  },
});