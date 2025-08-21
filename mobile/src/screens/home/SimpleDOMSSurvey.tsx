import React, { useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SurveyData {
  sleep_quality: number;
  energy_level: number;
  overall_soreness: number;
  motivation: number;
  date: string;
}

const SimpleDOMSSurvey = ({ navigation }: any) => {
  const [surveyData, setSurveyData] = useState<SurveyData>({
    sleep_quality: 5,
    energy_level: 5,
    overall_soreness: 5,
    motivation: 5,
    date: new Date().toISOString().split('T')[0],
  });

  const questions = [
    {
      key: 'sleep_quality' as keyof Omit<SurveyData, 'date'>,
      title: '수면의 질',
      subtitle: '어젯밤 잠은 어떠셨나요?',
      icon: 'bedtime',
      low: '매우 나쁨',
      high: '매우 좋음',
    },
    {
      key: 'energy_level' as keyof Omit<SurveyData, 'date'>,
      title: '에너지 수준',
      subtitle: '오늘 전반적인 에너지는 어떤가요?',
      icon: 'battery-full',
      low: '매우 피곤',
      high: '매우 활기참',
    },
    {
      key: 'overall_soreness' as keyof Omit<SurveyData, 'date'>,
      title: '전반적 통증',
      subtitle: '근육이나 관절의 통증은 어떤가요?',
      icon: 'healing',
      low: '통증 없음',
      high: '심한 통증',
    },
    {
      key: 'motivation' as keyof Omit<SurveyData, 'date'>,
      title: '동기부여',
      subtitle: '운동에 대한 의욕은 어떤가요?',
      icon: 'psychology',
      low: '의욕 없음',
      high: '매우 의욕적',
    },
  ];

  const handleValueChange = (key: keyof Omit<SurveyData, 'date'>, value: number) => {
    setSurveyData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const submitSurvey = async () => {
    try {
      // Save to local storage
      const existingSurveys = await AsyncStorage.getItem('@doms_surveys');
      const surveys = existingSurveys ? JSON.parse(existingSurveys) : [];
      
      // Add new survey
      surveys.push(surveyData);
      
      // Keep only last 30 days of surveys
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSurveys = surveys.filter((s: SurveyData) => 
        new Date(s.date) > thirtyDaysAgo
      );
      
      await AsyncStorage.setItem('@doms_surveys', JSON.stringify(recentSurveys));
      await AsyncStorage.setItem('@last_doms_survey', surveyData.date);
      
      // Calculate readiness score
      const readinessScore = (
        surveyData.sleep_quality * 0.3 +
        surveyData.energy_level * 0.3 +
        (10 - surveyData.overall_soreness) * 0.2 +
        surveyData.motivation * 0.2
      );
      
      Alert.alert(
        '완료!',
        `회복 설문이 저장되었습니다.\n\n준비도 점수: ${readinessScore.toFixed(1)}/10\n${
          readinessScore >= 7 ? '오늘은 강한 운동을 해도 좋습니다!' :
          readinessScore >= 5 ? '적당한 강도로 운동하세요.' :
          '가벼운 운동이나 휴식을 추천합니다.'
        }`,
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Survey save error:', error);
      Alert.alert('오류', '설문 저장 중 오류가 발생했습니다.');
    }
  };

  const renderScale = (question: typeof questions[0]) => {
    const currentValue = surveyData[question.key];
    
    return (
      <View style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <Icon name={question.icon} size={32} color={Colors.primary} />
          <View style={styles.questionText}>
            <Text style={styles.questionTitle}>{question.title}</Text>
            <Text style={styles.questionSubtitle}>{question.subtitle}</Text>
          </View>
        </View>
        
        <View style={styles.scaleContainer}>
          <View style={styles.scaleLabels}>
            <Text style={styles.scaleLabel}>{question.low}</Text>
            <Text style={styles.currentValueText}>{currentValue}</Text>
            <Text style={styles.scaleLabel}>{question.high}</Text>
          </View>
          
          <View style={styles.scaleTrack}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.scalePoint,
                  currentValue === value && styles.scalePointActive,
                ]}
                onPress={() => handleValueChange(question.key, value)}
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회복 설문조사</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.instructions}>
          오늘의 컨디션을 1-10점으로 평가해주세요
        </Text>
        
        {questions.map((question) => (
          <View key={question.key}>
            {renderScale(question)}
          </View>
        ))}
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={submitSurvey}
        >
          <Text style={styles.submitButtonText}>완료</Text>
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
  instructions: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
  },
  questionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionText: {
    marginLeft: 15,
    flex: 1,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  questionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scaleContainer: {
    width: '100%',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  scaleLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  currentValueText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  scaleTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scalePoint: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scalePointActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  scalePointText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  scalePointTextActive: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 30,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SimpleDOMSSurvey;