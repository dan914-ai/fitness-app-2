import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TextInput,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RecordStackParamList } from '../../navigation/types';
import { getWorkoutHistory, getExerciseHistory, ExerciseHistoryRecord } from '../../utils/workoutHistory';
import storageService from '../../services/storage.service';

type ExerciseHistoryScreenProps = {
  navigation: StackNavigationProp<RecordStackParamList, 'ExerciseHistory'>;
  route: RouteProp<RecordStackParamList, 'ExerciseHistory'>;
};

const { width } = Dimensions.get('window');

interface SessionData {
  id: string;
  date: string;
  sets: { weight: string; reps: string }[];
  maxWeight: string;
  totalVolume: string;
  duration: string;
  notes?: string;
}

interface PersonalRecord {
  type: '1RM' | 'volume' | 'reps';
  value: string;
  date: string;
}

type TabType = '최고 기록' | '최근 기록' | '메모' | '차트';

export default function ExerciseHistoryScreen() {
  const navigation = useNavigation<StackNavigationProp<RecordStackParamList>>();
  const route = useRoute<RouteProp<RecordStackParamList, 'ExerciseHistory'>>();
  const { exerciseId, exerciseName } = route.params;

  const [activeTab, setActiveTab] = useState<TabType>('최근 기록');
  const [newNote, setNewNote] = useState('');
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [recentSessions, setRecentSessions] = useState<SessionData[]>([]);
  const [exerciseNotes, setExerciseNotes] = useState<Array<{id: string; date: string; note: string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExerciseData();
  }, [exerciseId]);

  const loadExerciseData = async () => {
    try {
      setLoading(true);
      
      // Fetch exercise history
      const exerciseHistory = await getExerciseHistory(exerciseId, 10);
      
      // Convert exercise history to session data format
      const sessions: SessionData[] = exerciseHistory.map((record, index) => ({
        id: `session_${index}`,
        date: new Date(record.date).toLocaleDateString('ko-KR'),
        sets: record.sets.map(set => ({
          weight: set.weight,
          reps: set.reps
        })),
        maxWeight: `${record.maxWeight}kg`,
        totalVolume: `${Math.round(record.totalVolume)}kg`,
        duration: '운동 기록',
        notes: undefined
      }));
      
      setRecentSessions(sessions);
      
      // Calculate personal records
      const records = await calculatePersonalRecords(exerciseId);
      setPersonalRecords(records);
      
      // Load exercise notes (for now, initialize empty)
      setExerciseNotes([]);
      
    } catch (error) {
      console.error('Error loading exercise data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePersonalRecords = async (exerciseId: string): Promise<PersonalRecord[]> => {
    try {
      const history = await getWorkoutHistory();
      let maxWeight = 0;
      let maxVolume = 0;
      let maxReps = 0;
      let maxWeightDate = '';
      let maxVolumeDate = '';
      let maxRepsDate = '';
      
      history.forEach(workout => {
        const exercise = workout.exercises.find(ex => ex.exerciseId === exerciseId);
        if (exercise) {
          // Check for max weight
          exercise.sets.forEach(set => {
            const weight = parseFloat(set.weight) || 0;
            const reps = parseInt(set.reps) || 0;
            const volume = weight * reps;
            
            if (weight > maxWeight) {
              maxWeight = weight;
              maxWeightDate = workout.date;
            }
            
            if (volume > maxVolume) {
              maxVolume = volume;
              maxVolumeDate = workout.date;
            }
            
            if (reps > maxReps) {
              maxReps = reps;
              maxRepsDate = workout.date;
            }
          });
        }
      });
      
      const records: PersonalRecord[] = [];
      
      if (maxWeight > 0) {
        records.push({
          type: '1RM',
          value: `${maxWeight}kg`,
          date: new Date(maxWeightDate).toLocaleDateString('ko-KR')
        });
      }
      
      if (maxVolume > 0) {
        records.push({
          type: 'volume',
          value: `${Math.round(maxVolume)}kg`,
          date: new Date(maxVolumeDate).toLocaleDateString('ko-KR')
        });
      }
      
      if (maxReps > 0) {
        records.push({
          type: 'reps',
          value: `${maxReps}회`,
          date: new Date(maxRepsDate).toLocaleDateString('ko-KR')
        });
      }
      
      return records;
    } catch (error) {
      console.error('Error calculating personal records:', error);
      return [];
    }
  };

  const tabs: TabType[] = ['최고 기록', '최근 기록', '메모', '차트'];

  const getRecordIcon = (type: string) => {
    switch (type) {
      case '1RM': return 'fitness-center';
      case 'volume': return 'assessment';
      case 'reps': return 'repeat';
      default: return 'trending-up';
    }
  };

  const getRecordColor = (type: string) => {
    switch (type) {
      case '1RM': return Colors.error;
      case 'volume': return Colors.primary;
      case 'reps': return Colors.success;
      default: return Colors.textSecondary;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case '최고 기록':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>개인 최고 기록</Text>
            {personalRecords.map((record, index) => (
              <View key={index} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.recordIconContainer}>
                    <Icon 
                      name={getRecordIcon(record.type)} 
                      size={24} 
                      color={getRecordColor(record.type)} 
                    />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordType}>
                      {record.type === '1RM' ? '최대 중량' : 
                       record.type === 'volume' ? '최대 볼륨' : '최대 반복'}
                    </Text>
                    <Text style={styles.recordValue}>{record.value}</Text>
                  </View>
                  <Text style={styles.recordDate}>{record.date}</Text>
                </View>
              </View>
            ))}

            <View style={styles.progressSection}>
              <Text style={styles.progressTitle}>진행 상황</Text>
              <View style={styles.progressCard}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>지난 달 대비</Text>
                  <View style={styles.progressValue}>
                    <Icon name="trending-up" size={16} color={Colors.success} />
                    <Text style={[styles.progressText, { color: Colors.success }]}>+12%</Text>
                  </View>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>평균 중량</Text>
                  <Text style={styles.progressText}>62.5kg</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>총 운동 횟수</Text>
                  <Text style={styles.progressText}>24회</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case '최근 기록':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>최근 운동 기록</Text>
            {recentSessions.map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionDate}>{session.date}</Text>
                    <Text style={styles.sessionStats}>
                      {`${session.sets.length}세트 • ${session.maxWeight} • ${session.totalVolume}`}
                    </Text>
                  </View>
                  <View style={styles.sessionDuration}>
                    <Icon name="schedule" size={16} color={Colors.textSecondary} />
                    <Text style={styles.durationText}>{session.duration}</Text>
                  </View>
                </View>

                <View style={styles.setsTable}>
                  <View style={styles.setsHeader}>
                    <Text style={styles.setsHeaderText}>세트</Text>
                    <Text style={styles.setsHeaderText}>중량</Text>
                    <Text style={styles.setsHeaderText}>횟수</Text>
                    <Text style={styles.setsHeaderText}>볼륨</Text>
                  </View>
                  {session.sets.map((set, setIndex) => (
                    <View key={setIndex} style={styles.setRow}>
                      <Text style={styles.setNumber}>{setIndex + 1}</Text>
                      <Text style={styles.setValue}>{set.weight}kg</Text>
                      <Text style={styles.setValue}>{set.reps}회</Text>
                      <Text style={styles.setValue}>
                        {(parseFloat(set.weight) * parseFloat(set.reps)).toFixed(0)}kg
                      </Text>
                    </View>
                  ))}
                </View>

                {session.notes && (
                  <View style={styles.sessionNotes}>
                    <Icon name="note" size={16} color={Colors.textSecondary} />
                    <Text style={styles.notesText}>{session.notes}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        );

      case '메모':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>운동 메모</Text>
            
            <View style={styles.addNoteSection}>
              <TextInput
                style={styles.noteInput}
                value={newNote}
                onChangeText={setNewNote}
                placeholder="새로운 메모를 입력하세요..."
                multiline
                maxLength={200}
              />
              <TouchableOpacity 
                style={styles.addNoteButton}
                onPress={() => {
                  if (newNote.trim()) {
                    const newNoteItem = {
                      id: `note_${Date.now()}`,
                      date: new Date().toLocaleDateString('ko-KR'),
                      note: newNote.trim()
                    };
                    setExerciseNotes([newNoteItem, ...exerciseNotes]);
                    setNewNote('');
                  }
                }}
              >
                <Text style={styles.addNoteButtonText}>메모 추가</Text>
              </TouchableOpacity>
            </View>

            {exerciseNotes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteDate}>{note.date}</Text>
                  <TouchableOpacity style={styles.noteMenuButton}>
                    <Icon name="more-vert" size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.noteContent}>{note.note}</Text>
              </View>
            ))}
          </View>
        );

      case '차트':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>진행 차트</Text>
            
            <View style={styles.chartSection}>
              <Text style={styles.chartSubtitle}>중량 진행 상황</Text>
              <View style={styles.chartPlaceholder}>
                <Icon name="insert-chart" size={48} color={Colors.textSecondary} />
                <Text style={styles.chartPlaceholderText}>
                  차트가 여기에 표시됩니다
                </Text>
              </View>
            </View>

            <View style={styles.chartSection}>
              <Text style={styles.chartSubtitle}>볼륨 진행 상황</Text>
              <View style={styles.chartPlaceholder}>
                <Icon name="bar-chart" size={48} color={Colors.textSecondary} />
                <Text style={styles.chartPlaceholderText}>
                  볼륨 차트가 여기에 표시됩니다
                </Text>
              </View>
            </View>

            <View style={styles.chartSection}>
              <Text style={styles.chartSubtitle}>반복 횟수 분포</Text>
              <View style={styles.chartPlaceholder}>
                <Icon name="pie-chart" size={48} color={Colors.textSecondary} />
                <Text style={styles.chartPlaceholderText}>
                  반복 횟수 분포가 여기에 표시됩니다
                </Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{exerciseName}</Text>
          <Text style={styles.headerSubtitle}>운동 기록</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
        <View style={{ height: 20 }} />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchButton: {
    padding: 8,
    marginLeft: 8,
  },
  tabBar: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  recordCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordType: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  recordValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  recordDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressSection: {
    marginTop: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  sessionCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  sessionStats: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sessionDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  setsTable: {
    marginBottom: 12,
  },
  setsHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
  },
  setsHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  setNumber: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  setValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  sessionNotes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  addNoteSection: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  addNoteButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addNoteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  noteMenuButton: {
    padding: 4,
  },
  noteContent: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  chartPlaceholder: {
    backgroundColor: Colors.surface,
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});