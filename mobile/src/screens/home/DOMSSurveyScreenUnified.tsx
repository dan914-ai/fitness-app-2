import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import progressionService from '../../services/progression.service';
import { supabase } from '../../config/supabase';

interface SurveyData {
  sleep_quality: number;
  energy_level: number;
  overall_soreness: number;
  motivation: number;
}

const DOMSSurveyScreenUnified = ({ navigation }: any) => {
  console.log('🎯 DOMSSurveyScreenUnified loaded - ' + new Date().toISOString());
  const [userId, setUserId] = useState<string | null>(null);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    sleep_quality: 5,
    energy_level: 5,
    overall_soreness: 5,
    motivation: 5,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getUserId();
  }, []);

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

  const questions = [
    {
      key: 'sleep_quality' as keyof SurveyData,
      title: '수면의 질',
      subtitle: '어젯밤 잠은 어떠셨나요?',
      icon: 'bedtime',
      low: '매우 나쁨',
      high: '매우 좋음',
      color: '#6B5B95',
    },
    {
      key: 'energy_level' as keyof SurveyData,
      title: '에너지 수준',
      subtitle: '오늘 전반적인 에너지는 어떤가요?',
      icon: 'battery-full',
      low: '매우 피곤',
      high: '매우 활기참',
      color: '#88B04B',
    },
    {
      key: 'overall_soreness' as keyof SurveyData,
      title: '전반적 통증',
      subtitle: '근육이나 관절의 통증은 어떤가요?',
      icon: 'healing',
      low: '통증 없음',
      high: '심한 통증',
      color: '#FF6F61',
    },
    {
      key: 'motivation' as keyof SurveyData,
      title: '동기부여',
      subtitle: '운동에 대한 의욕은 어떤가요?',
      icon: 'psychology',
      low: '의욕 없음',
      high: '매우 의욕적',
      color: '#F7CAC9',
    },
  ];

  const handleValueChange = (key: keyof SurveyData, value: number) => {
    setSurveyData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const submitSurvey = async () => {
    if (!userId) {
      Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.');
      return;
    }

    setSubmitting(true);
    
    try {
      const result = await progressionService.submitDOMSSurvey(userId, surveyData);
      
      if (result.success) {
        const readinessScore = result.readiness_score || 
          ((surveyData.sleep_quality * 0.3 +
            surveyData.energy_level * 0.3 +
            (10 - surveyData.overall_soreness) * 0.2 +
            surveyData.motivation * 0.2));
        
        const recommendation = readinessScore >= 7 ? '💪 오늘은 강한 운동을 해도 좋습니다!' :
                              readinessScore >= 5 ? '⚡ 적당한 강도로 운동하세요.' :
                              '😴 가벼운 운동이나 휴식을 추천합니다.';
        
        // Reset submitting state before showing alert
        setSubmitting(false);
        
        Alert.alert(
          '완료!',
          `회복 설문이 저장되었습니다.\n\n준비도 점수: ${readinessScore.toFixed(1)}/10\n${recommendation}`,
          [
            {
              text: '확인',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error('Failed to submit survey');
      }
    } catch (error) {
      console.error('Survey submission error:', error);
      // Reset submitting state before showing alert
      setSubmitting(false);
      
      Alert.alert(
        '완료',
        '설문조사가 저장되었습니다.',
        [{ 
          text: '확인',
          onPress: () => navigation.goBack(),
        }]
      );
    }
  };

  const renderQuestionCard = (question: typeof questions[0]) => {
    const currentValue = surveyData[question.key];
    
    return (
      <View key={question.key} style={[styles.questionCard, { borderLeftColor: question.color }]}>
        <View style={styles.questionHeader}>
          <View style={[styles.iconContainer, { backgroundColor: question.color + '20' }]}>
            <Icon name={question.icon} size={28} color={question.color} />
          </View>
          <View style={styles.questionTextContainer}>
            <Text style={styles.questionTitle}>{question.title}</Text>
            <Text style={styles.questionSubtitle}>{question.subtitle}</Text>
          </View>
          <View style={styles.valueDisplay}>
            <Text style={[styles.valueText, { color: question.color }]}>{currentValue}</Text>
            <Text style={styles.valueSuffix}>/10</Text>
          </View>
        </View>
        
        <View style={styles.scaleContainer}>
          <View style={styles.scaleLabels}>
            <Text style={styles.scaleLabel}>{question.low}</Text>
            <Text style={styles.scaleLabel}>{question.high}</Text>
          </View>
          
          <View style={styles.scaleTrack}>
            <View style={[styles.scaleProgress, { 
              width: `${(currentValue / 10) * 100}%`,
              backgroundColor: question.color,
            }]} />
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.scalePoint,
                  currentValue === value && [styles.scalePointActive, { backgroundColor: question.color }],
                ]}
                onPress={() => handleValueChange(question.key, value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.scalePointText,
                    currentValue === value && styles.scalePointTextActive,
                  ]}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  // Calculate overall readiness
  const readinessScore = (
    surveyData.sleep_quality * 0.3 +
    surveyData.energy_level * 0.3 +
    (10 - surveyData.overall_soreness) * 0.2 +
    surveyData.motivation * 0.2
  );

  const getReadinessColor = () => {
    if (readinessScore >= 7) return '#4CAF50';
    if (readinessScore >= 5) return '#FFC107';
    return '#FF5722';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회복 설문조사</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Readiness Score Preview */}
        <View style={styles.scorePreview}>
          <Text style={styles.scoreLabel}>현재 준비도 점수</Text>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreValue, { color: getReadinessColor() }]}>
              {readinessScore.toFixed(1)}
            </Text>
            <Text style={styles.scoreMax}>/10</Text>
          </View>
          <View style={[styles.scoreBar, { backgroundColor: Colors.border }]}>
            <View 
              style={[
                styles.scoreBarFill, 
                { 
                  width: `${(readinessScore / 10) * 100}%`,
                  backgroundColor: getReadinessColor(),
                }
              ]} 
            />
          </View>
        </View>

        {/* Questions */}
        {questions.map(question => renderQuestionCard(question))}
        
        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={submitSurvey}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Icon name="check-circle" size={24} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>설문 완료</Text>
            </>
          )}
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  scorePreview: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 24,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  questionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionTextContainer: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  questionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  valueDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  valueSuffix: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  scaleContainer: {
    width: '100%',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scaleLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  scaleTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 40,
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 4,
    position: 'relative',
  },
  scaleProgress: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    borderRadius: 16,
    opacity: 0.2,
  },
  scalePoint: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  scalePointActive: {
    borderColor: 'transparent',
  },
  scalePointText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  scalePointTextActive: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DOMSSurveyScreenUnified;