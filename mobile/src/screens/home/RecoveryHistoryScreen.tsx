import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { supabase } from '../../config/supabase';

interface RecoveryRecord {
  id: string;
  survey_date: string;
  sleep_quality: number;
  energy_level: number;
  overall_soreness: number;
  motivation: number;
  created_at: string;
}

const RecoveryHistoryScreen = ({ navigation }: any) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [records, setRecords] = useState<RecoveryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      loadRecoveryHistory();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const getUserId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        setUserId('test-user-id');
      }
    } catch (error) {
      console.error('Error getting user:', error);
      setUserId('test-user-id');
    }
  };

  const loadRecoveryHistory = async () => {
    try {
      if (!userId) return;

      const { data, error } = await supabase
        .from('user_doms_data')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error loading recovery history:', error);
        return;
      }

      setRecords(data || []);
    } catch (error) {
      console.error('Error loading recovery history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateReadinessScore = (record: RecoveryRecord) => {
    const sleep = record.sleep_quality || 5;
    const energy = record.energy_level || 5;
    const soreness = record.overall_soreness || 5;
    const motivation = record.motivation || 5;
    
    return (sleep + energy + (10 - soreness) + motivation) / 4;
  };

  const getReadinessColor = (score: number) => {
    if (score >= 8) return Colors.success;
    if (score >= 6) return Colors.warning;
    return Colors.error;
  };

  const getReadinessText = (score: number) => {
    if (score >= 8) return '뛰어남';
    if (score >= 6) return '보통';
    return '낮음';
  };

  const renderMetricBadge = (value: number, max: number = 10) => {
    const percentage = (value / max) * 100;
    let color = Colors.error;
    if (percentage >= 80) color = Colors.success;
    else if (percentage >= 60) color = Colors.warning;

    return (
      <View style={[styles.metricBadge, { backgroundColor: color + '20' }]}>
        <Text style={[styles.metricBadgeText, { color }]}>{value}</Text>
      </View>
    );
  };

  const renderRecordItem = ({ item }: { item: RecoveryRecord }) => {
    const readinessScore = calculateReadinessScore(item);
    const date = new Date(item.survey_date || item.created_at);
    
    return (
      <View style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.dateContainer}>
            <Text style={styles.recordDate}>
              {date.toLocaleDateString('ko-KR', { 
                month: '2-digit', 
                day: '2-digit' 
              })}
            </Text>
            <Text style={styles.recordDay}>
              {date.toLocaleDateString('ko-KR', { weekday: 'short' })}
            </Text>
          </View>
          
          <View style={styles.readinessContainer}>
            <Text style={styles.readinessLabel}>컨디션</Text>
            <View style={[styles.readinessBadge, { backgroundColor: getReadinessColor(readinessScore) + '20' }]}>
              <Text style={[styles.readinessValue, { color: getReadinessColor(readinessScore) }]}>
                {readinessScore.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Icon name="bedtime" size={16} color={Colors.textSecondary} />
            <Text style={styles.metricLabel}>수면</Text>
            {renderMetricBadge(item.sleep_quality)}
          </View>
          
          <View style={styles.metricItem}>
            <Icon name="battery-full" size={16} color={Colors.textSecondary} />
            <Text style={styles.metricLabel}>에너지</Text>
            {renderMetricBadge(item.energy_level)}
          </View>
          
          <View style={styles.metricItem}>
            <Icon name="healing" size={16} color={Colors.textSecondary} />
            <Text style={styles.metricLabel}>통증</Text>
            {renderMetricBadge(10 - item.overall_soreness)} {/* Inverted for display */}
          </View>
          
          <View style={styles.metricItem}>
            <Icon name="psychology" size={16} color={Colors.textSecondary} />
            <Text style={styles.metricLabel}>동기</Text>
            {renderMetricBadge(item.motivation)}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>회복 기록</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>회복 기록을 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회복 기록</Text>
        <TouchableOpacity onPress={() => navigation.navigate('DOMSSurvey')}>
          <Icon name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {records.length > 0 ? (
        <FlatList
          data={records}
          renderItem={renderRecordItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="sentiment-neutral" size={60} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>회복 기록이 없습니다</Text>
          <Text style={styles.emptySubtitle}>
            첫 번째 설문조사를 작성하여 회복 추이를 확인해보세요
          </Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => navigation.navigate('DOMSSurvey')}
          >
            <Icon name="add" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.addButtonText}>설문조사 작성</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

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
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  listContainer: {
    padding: 20,
  },
  recordCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateContainer: {
    alignItems: 'flex-start',
  },
  recordDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  recordDay: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  readinessContainer: {
    alignItems: 'flex-end',
  },
  readinessLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  readinessBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  readinessValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 6,
  },
  metricBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  metricBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RecoveryHistoryScreen;