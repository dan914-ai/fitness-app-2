import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
// import {
//   getExerciseAlternatives,
//   getAlternativesByDifficulty,
//   ExerciseAlternative,
// } from '../../data/exerciseAlternatives';
// import { exerciseDatabaseService } from '../../services/exerciseDatabase.service';

// Temporary interface definitions until services are restored
interface ExerciseAlternative {
  id: string;
  name: string;
  difficulty: 'easier' | 'similar' | 'harder';
  reason: string;
  equipment: string[];
}

interface ExerciseAlternativesProps {
  visible: boolean;
  exerciseId: string;
  exerciseName: string;
  onClose: () => void;
  onSelectAlternative: (alternativeId: string, alternativeName: string) => void;
}

// Temporary mock function until service is restored
const getExerciseAlternatives = (exerciseId: string): ExerciseAlternative[] => {
  // Mock alternatives for demonstration
  return [
    {
      id: 'alt-1',
      name: '푸쉬업',
      difficulty: 'easier',
      reason: '체중을 이용한 대체 운동',
      equipment: [],
    },
    {
      id: 'alt-2',
      name: '덤벨 프레스',
      difficulty: 'similar',
      reason: '비슷한 근육을 사용하는 운동',
      equipment: ['덤벨'],
    },
  ];
};

const getAlternativesByDifficulty = (exerciseId: string, difficulty: string): ExerciseAlternative[] => {
  const alternatives = getExerciseAlternatives(exerciseId);
  return alternatives.filter(alt => alt.difficulty === difficulty);
};

export default function ExerciseAlternatives({
  visible,
  exerciseId,
  exerciseName,
  onClose,
  onSelectAlternative,
}: ExerciseAlternativesProps) {
  const { theme } = useTheme();
  const [alternatives, setAlternatives] = useState<ExerciseAlternative[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'easier' | 'similar' | 'harder'>('all');
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadAlternatives();
    }
  }, [visible, exerciseId]);

  const loadAlternatives = () => {
    const allAlternatives = getExerciseAlternatives(exerciseId);
    setAlternatives(allAlternatives);
  };

  const getFilteredAlternatives = () => {
    if (selectedFilter === 'all') {
      return alternatives;
    }
    return alternatives.filter(alt => alt.difficulty === selectedFilter);
  };

  const handleSelectAlternative = (alternative: ExerciseAlternative) => {
    Alert.alert(
      '운동 변경',
      `"${exerciseName}"을(를) "${alternative.name}"(으)로 변경하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '변경',
          onPress: () => {
            onSelectAlternative(alternative.id, alternative.name);
            onClose();
          },
        },
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easier':
        return theme.success;
      case 'similar':
        return theme.warning;
      case 'harder':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easier':
        return '쉬움';
      case 'similar':
        return '비슷함';
      case 'harder':
        return '어려움';
      default:
        return difficulty;
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easier':
        return 'trending-down';
      case 'similar':
        return 'trending-flat';
      case 'harder':
        return 'trending-up';
      default:
        return 'help-outline';
    }
  };

  const filteredAlternatives = getFilteredAlternatives();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>대체 운동</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{exerciseName}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Info Banner */}
          <View style={[styles.infoBanner, { backgroundColor: theme.primary + '10' }]}>
            <Icon name="info-outline" size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.primary }]}>
              장비가 없거나 다른 운동을 원하실 때 선택하세요
            </Text>
          </View>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            <View style={styles.filterTabs}>
              {(['all', 'easier', 'similar', 'harder'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterTab,
                    { backgroundColor: theme.background, borderColor: theme.border },
                    selectedFilter === filter && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      { color: theme.text },
                      selectedFilter === filter && { color: '#FFFFFF' },
                    ]}
                  >
                    {filter === 'all' ? '전체' : getDifficultyLabel(filter)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Alternatives List */}
          <ScrollView style={styles.alternativesList} showsVerticalScrollIndicator={false}>
            {filteredAlternatives.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="search-off" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.text }]}>대체 운동이 없습니다</Text>
                <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                  이 운동에 대한 대체 운동 정보가 아직 등록되지 않았습니다
                </Text>
              </View>
            ) : (
              filteredAlternatives.map((alternative, index) => {
                // const exerciseData = exerciseDatabaseService.getExerciseById(alternative.id);
                
                return (
                  <TouchableOpacity
                    key={alternative.id}
                    style={[
                      styles.alternativeCard,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      selectedAlternative === alternative.id && { borderColor: theme.primary, backgroundColor: theme.primary + '10' },
                    ]}
                    onPress={() => handleSelectAlternative(alternative)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.alternativeHeader}>
                      <View style={styles.alternativeInfo}>
                        <Text style={[styles.alternativeName, { color: theme.text }]}>{alternative.name}</Text>
                        <View style={styles.difficultyBadge}>
                          <Icon
                            name={getDifficultyIcon(alternative.difficulty)}
                            size={16}
                            color={getDifficultyColor(alternative.difficulty)}
                          />
                          <Text
                            style={[
                              styles.difficultyText,
                              { color: getDifficultyColor(alternative.difficulty) },
                            ]}
                          >
                            {getDifficultyLabel(alternative.difficulty)}
                          </Text>
                        </View>
                      </View>
                      <Icon name="chevron-right" size={24} color={theme.textSecondary} />
                    </View>

                    <Text style={[styles.alternativeReason, { color: theme.textSecondary }]}>{alternative.reason}</Text>

                    {/* Equipment Tags */}
                    {alternative.equipment.length > 0 && (
                      <View style={styles.equipmentTags}>
                        <Icon name="fitness-center" size={14} color={theme.textSecondary} />
                        {alternative.equipment.map((equip, idx) => (
                          <View key={idx} style={[styles.equipmentTag, { backgroundColor: theme.surface }]}>
                            <Text style={[styles.equipmentTagText, { color: theme.text }]}>{equip}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Exercise Details if available */}
                    {/* {exerciseData && (
                      <View style={[styles.exerciseDetails, { borderTopColor: theme.border }]}>
                        <View style={styles.muscleGroups}>
                          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>타겟 근육:</Text>
                          <Text style={[styles.detailValue, { color: theme.text }]}>
                            {exerciseData.targetMuscles?.primary?.join(', ') || '정보 없음'}
                          </Text>
                        </View>
                      </View>
                    )} */}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Quick Actions */}
          {alternatives.length > 0 && (
            <View style={[styles.quickActions, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => {
                  const easier = getAlternativesByDifficulty(exerciseId, 'easier')[0];
                  if (easier) {
                    handleSelectAlternative(easier);
                  } else {
                    Alert.alert('알림', '더 쉬운 대체 운동이 없습니다');
                  }
                }}
              >
                <Icon name="trending-down" size={20} color={theme.success} />
                <Text style={[styles.quickActionText, { color: theme.text }]}>쉬운 운동</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => {
                  const noEquip = alternatives.filter(alt => alt.equipment.length === 0)[0];
                  if (noEquip) {
                    handleSelectAlternative(noEquip);
                  } else {
                    Alert.alert('알림', '장비가 필요 없는 운동이 없습니다');
                  }
                }}
              >
                <Icon name="home" size={20} color={theme.primary} />
                <Text style={[styles.quickActionText, { color: theme.text }]}>홈트레이닝</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => {
                  const harder = getAlternativesByDifficulty(exerciseId, 'harder')[0];
                  if (harder) {
                    handleSelectAlternative(harder);
                  } else {
                    Alert.alert('알림', '더 어려운 대체 운동이 없습니다');
                  }
                }}
              >
                <Icon name="trending-up" size={20} color={theme.error} />
                <Text style={[styles.quickActionText, { color: theme.text }]}>도전 운동</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  filterContainer: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTabActive: {
    // Styles applied dynamically with theme
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTabTextActive: {
    // Styles applied dynamically with theme
  },
  alternativesList: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  alternativeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  alternativeCardSelected: {
    // Styles applied dynamically with theme
  },
  alternativeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alternativeInfo: {
    flex: 1,
    gap: 6,
  },
  alternativeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  alternativeReason: {
    fontSize: 14,
    marginBottom: 12,
  },
  equipmentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  equipmentTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  equipmentTagText: {
    fontSize: 12,
  },
  exerciseDetails: {
    paddingTop: 8,
    borderTopWidth: 1,
  },
  muscleGroups: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 12,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  quickActionButton: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});