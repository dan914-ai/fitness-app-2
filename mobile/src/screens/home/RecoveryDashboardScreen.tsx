import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import progressionService from '../../services/progression.service';
import { supabase } from '../../config/supabase';

interface RecoveryMetrics {
  sleep_quality: number;
  energy_level: number;
  overall_soreness: number;
  motivation: number;
  survey_date?: string;
}

const RecoveryDashboardScreen = ({ navigation }: any) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<RecoveryMetrics | null>(null);
  const [readinessScore, setReadinessScore] = useState<number>(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      loadRecoveryData();
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

  const loadRecoveryData = async () => {
    try {
      if (!userId) return;
      
      const recoveryData = await progressionService.getLatestRecovery(userId);
      if (recoveryData) {
        setMetrics(recoveryData);
        calculateReadinessScore(recoveryData);
      }
    } catch (error) {
      console.error('Error loading recovery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateReadinessScore = (data: RecoveryMetrics) => {
    const sleep = data.sleep_quality || 5;
    const energy = data.energy_level || 5;
    const soreness = data.overall_soreness || 5;
    const motivation = data.motivation || 5;
    
    // Calculate readiness (higher is better, soreness is inverted)
    const score = (sleep + energy + (10 - soreness) + motivation) / 4;
    setReadinessScore(score);
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

  const renderMetricCard = (title: string, value: number, icon: string, max: number = 10) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Icon name={icon} size={24} color={Colors.primary} />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <View style={styles.metricValue}>
        <Text style={styles.metricNumber}>{value}</Text>
        <Text style={styles.metricMax}>/ {max}</Text>
      </View>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${(value / max) * 100}%` }
          ]} 
        />
      </View>
    </View>
  );

  const handleSubmitSurvey = () => {
    navigation.navigate('DOMSSurvey');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>회복 대시보드</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>회복 데이터를 불러오는 중...</Text>
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
        <Text style={styles.headerTitle}>회복 대시보드</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Readiness Score */}
        <View style={styles.readinessCard}>
          <Text style={styles.readinessTitle}>오늘의 컨디션</Text>
          <View style={styles.readinessScore}>
            <Text style={[styles.readinessNumber, { color: getReadinessColor(readinessScore) }]}>
              {readinessScore.toFixed(1)}
            </Text>
            <Text style={styles.readinessLabel}>/ 10</Text>
          </View>
          <Text style={[styles.readinessStatus, { color: getReadinessColor(readinessScore) }]}>
            {getReadinessText(readinessScore)}
          </Text>
        </View>

        {/* Recovery Metrics */}
        {metrics ? (
          <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitle}>회복 지표</Text>
            
            <View style={styles.metricsGrid}>
              {renderMetricCard('수면의 질', metrics.sleep_quality, 'bedtime')}
              {renderMetricCard('에너지 수준', metrics.energy_level, 'battery-full')}
              {renderMetricCard('전반적 통증', metrics.overall_soreness, 'healing')}
              {renderMetricCard('동기부여', metrics.motivation, 'psychology')}
            </View>

            {metrics.survey_date && (
              <Text style={styles.lastUpdated}>
                마지막 업데이트: {new Date(metrics.survey_date).toLocaleDateString('ko-KR')}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="sentiment-neutral" size={60} color={Colors.textSecondary} />
            <Text style={styles.noDataTitle}>회복 데이터가 없습니다</Text>
            <Text style={styles.noDataSubtitle}>
              첫 번째 회복 설문조사를 완료하여 개인화된 운동 추천을 받아보세요
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleSubmitSurvey}
          >
            <Icon name="assignment" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>
              {metrics ? '새 설문조사 작성' : '첫 설문조사 시작'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('RecoveryHistory')}
          >
            <Icon name="history" size={20} color={Colors.primary} style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>회복 기록 보기</Text>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>회복 팁</Text>
          <View style={styles.tipCard}>
            <Icon name="lightbulb" size={20} color={Colors.warning} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>매일 설문조사 작성</Text>
              <Text style={styles.tipText}>
                일관된 데이터로 더 정확한 운동 강도 추천을 받을 수 있습니다
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <Icon name="schedule" size={20} color={Colors.info} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>규칙적인 수면</Text>
              <Text style={styles.tipText}>
                7-9시간의 충분한 수면은 근육 회복에 가장 중요한 요소입니다
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  readinessCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  readinessTitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  readinessScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  readinessNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  readinessLabel: {
    fontSize: 24,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  readinessStatus: {
    fontSize: 18,
    fontWeight: '600',
  },
  metricsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  metricMax: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  lastUpdated: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noDataSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  actionsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  tipsContainer: {
    marginBottom: 40,
  },
  tipCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});

export default RecoveryDashboardScreen;