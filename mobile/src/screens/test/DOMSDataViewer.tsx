import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import progressionService from '../../services/progression.service';
import { supabase } from '../../config/supabase';

const DOMSDataViewer = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [latestSurvey, setLatestSurvey] = useState<any>(null);
  const [surveyHistory, setSurveyHistory] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id || 'test-user-id';
      setUserId(currentUserId);
      
      // Get latest recovery data
      const latest = await progressionService.getLatestRecovery(currentUserId);
      setLatestSurvey(latest);
      
      // Get survey history
      const history = await progressionService.getDOMSSurveyHistory(currentUserId, 30);
      setSurveyHistory(history);
      
      console.log('Latest survey:', latest);
      console.log('Survey history:', history);
    } catch (error) {
      console.error('Error loading DOMS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const calculateReadiness = (survey: any) => {
    if (!survey) return 0;
    return (
      (survey.sleep_quality || 5) * 0.3 +
      (survey.energy_level || 5) * 0.3 +
      (10 - (survey.overall_soreness || 5)) * 0.2 +
      (survey.motivation || 5) * 0.2
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>DOMS 데이터 불러오는 중...</Text>
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
        <Text style={styles.headerTitle}>DOMS 데이터 뷰어</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Icon name="refresh" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>사용자 정보</Text>
          <Text style={styles.infoText}>User ID: {userId}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 설문</Text>
          {latestSurvey ? (
            <View style={styles.surveyCard}>
              <Text style={styles.surveyDate}>
                날짜: {latestSurvey.survey_date || new Date(latestSurvey.created_at).toLocaleDateString()}
              </Text>
              <View style={styles.surveyData}>
                <Text style={styles.dataItem}>수면: {latestSurvey.sleep_quality}/10</Text>
                <Text style={styles.dataItem}>에너지: {latestSurvey.energy_level}/10</Text>
                <Text style={styles.dataItem}>통증: {latestSurvey.overall_soreness}/10</Text>
                <Text style={styles.dataItem}>동기: {latestSurvey.motivation}/10</Text>
              </View>
              <Text style={styles.readinessScore}>
                준비도: {calculateReadiness(latestSurvey).toFixed(1)}/10
              </Text>
            </View>
          ) : (
            <Text style={styles.noDataText}>설문 데이터 없음</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>설문 기록 ({surveyHistory.length}개)</Text>
          {surveyHistory.length > 0 ? (
            surveyHistory.map((survey, index) => (
              <View key={index} style={styles.historyCard}>
                <Text style={styles.historyDate}>
                  {survey.survey_date || new Date(survey.created_at).toLocaleDateString()}
                </Text>
                <View style={styles.historyRow}>
                  <Text style={styles.historyItem}>수면: {survey.sleep_quality}</Text>
                  <Text style={styles.historyItem}>에너지: {survey.energy_level}</Text>
                  <Text style={styles.historyItem}>통증: {survey.overall_soreness}</Text>
                  <Text style={styles.historyItem}>동기: {survey.motivation}</Text>
                  <Text style={styles.historyReadiness}>
                    준비도: {calculateReadiness(survey).toFixed(1)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>기록 없음</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('DOMSSurvey')}
        >
          <Icon name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>새 설문 작성</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: Colors.textSecondary,
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
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  surveyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  surveyDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  surveyData: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  dataItem: {
    fontSize: 14,
    color: Colors.text,
    marginRight: 16,
    marginBottom: 4,
  },
  readinessScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
  },
  noDataText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  historyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  historyItem: {
    fontSize: 12,
    color: Colors.text,
    marginRight: 12,
  },
  historyReadiness: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default DOMSDataViewer;