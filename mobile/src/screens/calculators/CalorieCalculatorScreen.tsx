import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/colors';

type Gender = '남성' | '여성';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
type Goal = 'lose' | 'maintain' | 'gain';

interface CalorieResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
}

const ACTIVITY_LEVELS = {
  sedentary: { label: '좌식 생활', description: '운동 거의 안함', multiplier: 1.2 },
  light: { label: '가벼운 활동', description: '주 1-3회 운동', multiplier: 1.375 },
  moderate: { label: '보통 활동', description: '주 3-5회 운동', multiplier: 1.55 },
  active: { label: '활발한 활동', description: '주 6-7회 운동', multiplier: 1.725 },
  veryActive: { label: '매우 활발', description: '하루 2회 이상 운동', multiplier: 1.9 },
};

const GOALS = {
  lose: { label: '체중 감량', calorieAdjustment: -500 },
  maintain: { label: '체중 유지', calorieAdjustment: 0 },
  gain: { label: '체중 증량', calorieAdjustment: 500 },
};

export default function CalorieCalculatorScreen() {
  const [gender, setGender] = useState<Gender>('남성');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [result, setResult] = useState<CalorieResult | null>(null);

  const calculate = () => {
    const ageNum = parseInt(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (!ageNum || !heightNum || !weightNum) {
      return;
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === '남성') {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
    }

    // Calculate TDEE
    const tdee = bmr * ACTIVITY_LEVELS[activityLevel].multiplier;

    // Calculate target calories based on goal
    const targetCalories = tdee + GOALS[goal].calorieAdjustment;

    setResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
    });
  };

  const reset = () => {
    setAge('');
    setHeight('');
    setWeight('');
    setGender('남성');
    setActivityLevel('moderate');
    setGoal('maintain');
    setResult(null);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>칼로리 계산기</Text>
          <Text style={styles.subtitle}>
            일일 칼로리 필요량과 목표 칼로리를 계산하세요
          </Text>
        </View>

        <View style={styles.inputCard}>
          <View style={styles.genderSelection}>
            <Text style={styles.label}>성별</Text>
            <View style={styles.genderButtons}>
              {(['남성', '여성'] as Gender[]).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderButton, gender === g && styles.genderButtonActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.genderButtonText, gender === g && styles.genderButtonTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>나이</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <Text style={styles.unit}>세</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>키</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="decimal-pad"
                  maxLength={5}
                />
                <Text style={styles.unit}>cm</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>체중</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  maxLength={5}
                />
                <Text style={styles.unit}>kg</Text>
              </View>
            </View>
          </View>

          <View style={styles.selectionGroup}>
            <Text style={styles.label}>활동 수준</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(Object.entries(ACTIVITY_LEVELS) as [ActivityLevel, typeof ACTIVITY_LEVELS[ActivityLevel]][]).map(([key, level]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.levelButton, activityLevel === key && styles.levelButtonActive]}
                  onPress={() => setActivityLevel(key)}
                >
                  <Text style={[styles.levelButtonTitle, activityLevel === key && styles.levelButtonTitleActive]}>
                    {level.label}
                  </Text>
                  <Text style={[styles.levelButtonDesc, activityLevel === key && styles.levelButtonDescActive]}>
                    {level.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.selectionGroup}>
            <Text style={styles.label}>목표</Text>
            <View style={styles.goalButtons}>
              {(Object.entries(GOALS) as [Goal, typeof GOALS[Goal]][]).map(([key, goalInfo]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.goalButton, goal === key && styles.goalButtonActive]}
                  onPress={() => setGoal(key)}
                >
                  <Text style={[styles.goalButtonText, goal === key && styles.goalButtonTextActive]}>
                    {goalInfo.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.resetButton} onPress={reset}>
              <Text style={styles.resetButtonText}>초기화</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.calculateButton, (!age || !height || !weight) && styles.calculateButtonDisabled]} 
              onPress={calculate}
              disabled={!age || !height || !weight}
            >
              <Text style={styles.calculateButtonText}>계산</Text>
            </TouchableOpacity>
          </View>
        </View>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>계산 결과</Text>
            
            <View style={styles.calorieResults}>
              <View style={styles.calorieItem}>
                <Text style={styles.calorieLabel}>기초대사율 (BMR)</Text>
                <Text style={styles.calorieValue}>{result.bmr.toLocaleString()}</Text>
                <Text style={styles.calorieUnit}>kcal/일</Text>
              </View>
              
              <View style={styles.calorieItem}>
                <Text style={styles.calorieLabel}>일일 소비량 (TDEE)</Text>
                <Text style={styles.calorieValue}>{result.tdee.toLocaleString()}</Text>
                <Text style={styles.calorieUnit}>kcal/일</Text>
              </View>
              
              <View style={[styles.calorieItem, styles.targetCalorieItem]}>
                <Text style={styles.targetCalorieLabel}>목표 칼로리</Text>
                <Text style={styles.targetCalorieValue}>{result.targetCalories.toLocaleString()}</Text>
                <Text style={styles.targetCalorieUnit}>kcal/일</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>용어 설명</Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>BMR (기초대사율)</Text>: 생명 유지에 필요한 최소 칼로리{'\n'}
            <Text style={styles.infoBold}>TDEE (일일 총 에너지 소비량)</Text>: 활동량을 포함한 총 칼로리 소비량{'\n'}
            <Text style={styles.infoBold}>목표 칼로리</Text>: 목표 달성을 위한 권장 섭취 칼로리
          </Text>
          
          <Text style={styles.infoTitle}>주의사항</Text>
          <Text style={styles.infoText}>
            • 이 계산은 평균적인 추정치입니다{'\n'}
            • 개인차가 있을 수 있으므로 조정이 필요할 수 있습니다{'\n'}
            • 급격한 칼로리 제한은 건강에 해로울 수 있습니다
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  inputCard: {
    backgroundColor: Colors.surface,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  genderSelection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  genderButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderButtonText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputGroup: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  unit: {
    paddingRight: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  selectionGroup: {
    marginBottom: 20,
  },
  levelButton: {
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  levelButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  levelButtonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  levelButtonTitleActive: {
    color: '#FFFFFF',
  },
  levelButtonDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  levelButtonDescActive: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  goalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  goalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goalButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  goalButtonTextActive: {
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  calculateButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  calculateButtonDisabled: {
    opacity: 0.5,
  },
  calculateButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  calorieResults: {
    marginBottom: 20,
  },
  calorieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  targetCalorieItem: {
    borderBottomWidth: 0,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  calorieLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  targetCalorieLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  calorieValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginRight: 8,
  },
  targetCalorieValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: 8,
  },
  calorieUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  targetCalorieUnit: {
    fontSize: 14,
    color: Colors.primary,
  },
  macrosSection: {
    marginTop: 20,
  },
  macrosTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  macroLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  macroCalories: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  infoCard: {
    backgroundColor: Colors.primary + '10',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '600',
  },
});