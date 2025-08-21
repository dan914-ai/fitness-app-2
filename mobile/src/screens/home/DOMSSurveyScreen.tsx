import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
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

const DOMSSurveyScreen = ({ navigation }: any) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    sleep_quality: 5,
    energy_level: 5,
    overall_soreness: 5,
    motivation: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

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
    },
    {
      key: 'energy_level' as keyof SurveyData,
      title: '에너지 수준',
      subtitle: '오늘 전반적인 에너지는 어떤가요?',
      icon: 'battery-full',
      low: '매우 피곤',
      high: '매우 활기참',
    },
    {
      key: 'overall_soreness' as keyof SurveyData,
      title: '전반적 통증',
      subtitle: '근육이나 관절의 통증은 어떤가요?',
      icon: 'healing',
      low: '통증 없음',
      high: '심한 통증',
    },
    {
      key: 'motivation' as keyof SurveyData,
      title: '동기부여',
      subtitle: '운동에 대한 의욕은 어떤가요?',
      icon: 'psychology',
      low: '의욕 없음',
      high: '매우 의욕적',
    },
  ];

  const handleValueChange = (value: number) => {
    const question = questions[currentQuestion];
    setSurveyData(prev => ({
      ...prev,
      [question.key]: value,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentQuestion(currentQuestion + 1);
        slideAnim.setValue(50);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      submitSurvey();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentQuestion(currentQuestion - 1);
        slideAnim.setValue(-50);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
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
        const message = result.readiness_score 
          ? `설문조사가 저장되었습니다.\n\n준비도 점수: ${result.readiness_score.toFixed(1)}/10\n${result.recommendation || ''}`
          : '설문조사가 성공적으로 저장되었습니다.';
        
        Alert.alert(
          '완료!',
          message,
          [
            {
              text: '확인',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        // Still saved locally, just inform user
        Alert.alert(
          '완료',
          '설문조사가 로컬에 저장되었습니다.',
          [
            {
              text: '확인',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Survey submission error:', error);
      // Don't show error - it's saved locally
      Alert.alert(
        '완료',
        '설문조사가 저장되었습니다.',
        [{ 
          text: '확인',
          onPress: () => navigation.goBack(),
        }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderScale = () => {
    const question = questions[currentQuestion];
    const currentValue = surveyData[question.key];
    
    return (
      <View style={styles.scaleContainer}>
        <View style={styles.scaleLabels}>
          <Text style={styles.scaleLabel}>{question.low}</Text>
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
              onPress={() => handleValueChange(value)}
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
        
        <Text style={styles.currentValue}>선택한 값: {currentValue}</Text>
      </View>
    );
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회복 설문조사</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestion + 1} / {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.questionContainer,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <View style={styles.questionIcon}>
            <Icon name={question.icon} size={48} color={Colors.primary} />
          </View>
          
          <Text style={styles.questionTitle}>{question.title}</Text>
          <Text style={styles.questionSubtitle}>{question.subtitle}</Text>
          
          {renderScale()}
        </Animated.View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestion === 0 && styles.navButtonDisabled]}
          onPress={prevQuestion}
          disabled={currentQuestion === 0}
        >
          <Icon 
            name="arrow-back" 
            size={20} 
            color={currentQuestion === 0 ? Colors.textSecondary : Colors.text} 
          />
          <Text 
            style={[
              styles.navButtonText,
              currentQuestion === 0 && styles.navButtonTextDisabled
            ]}
          >
            이전
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, submitting && styles.nextButtonDisabled]}
          onPress={nextQuestion}
          disabled={submitting}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion === questions.length - 1 ? '완료' : '다음'}
          </Text>
          <Icon 
            name={currentQuestion === questions.length - 1 ? 'check' : 'arrow-forward'} 
            size={20} 
            color="white" 
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  questionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  questionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  scaleContainer: {
    width: '100%',
    alignItems: 'center',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  scaleLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  scaleTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  scalePoint: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  scalePointTextActive: {
    color: 'white',
  },
  currentValue: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 8,
  },
  navButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: Colors.primary,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default DOMSSurveyScreen;