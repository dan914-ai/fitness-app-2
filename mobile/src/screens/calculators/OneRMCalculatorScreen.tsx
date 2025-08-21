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

interface CalculationResult {
  oneRM: number;
  percentages: {
    percent: number;
    weight: number;
    reps: string;
  }[];
}

const FORMULAS = {
  epley: {
    name: 'Epley',
    calculate: (weight: number, reps: number) => weight * (1 + reps / 30),
  },
  brzycki: {
    name: 'Brzycki',
    calculate: (weight: number, reps: number) => weight / (1.0278 - 0.0278 * reps),
  },
  lander: {
    name: 'Lander',
    calculate: (weight: number, reps: number) => (100 * weight) / (101.3 - 2.67123 * reps),
  },
  lombardi: {
    name: 'Lombardi',
    calculate: (weight: number, reps: number) => weight * Math.pow(reps, 0.1),
  },
  oconner: {
    name: "O'Conner",
    calculate: (weight: number, reps: number) => weight * (1 + reps / 40),
  },
};

const PERCENTAGE_TABLE = [
  { percent: 100, reps: '1' },
  { percent: 95, reps: '2' },
  { percent: 93, reps: '3' },
  { percent: 90, reps: '4' },
  { percent: 87, reps: '5' },
  { percent: 85, reps: '6' },
  { percent: 83, reps: '7' },
  { percent: 80, reps: '8' },
  { percent: 77, reps: '9' },
  { percent: 75, reps: '10' },
  { percent: 70, reps: '11-12' },
  { percent: 65, reps: '13-15' },
  { percent: 60, reps: '16-20' },
];

export default function OneRMCalculatorScreen() {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [selectedFormula, setSelectedFormula] = useState<keyof typeof FORMULAS>('epley');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculate = () => {
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps);

    if (!weightNum || !repsNum || repsNum < 1 || repsNum > 20) {
      return;
    }

    const formula = FORMULAS[selectedFormula];
    const oneRM = Math.round(formula.calculate(weightNum, repsNum));
    
    const percentages = PERCENTAGE_TABLE.map(({ percent, reps }) => ({
      percent,
      weight: Math.round((oneRM * percent) / 100),
      reps,
    }));

    setResult({ oneRM, percentages });
  };

  const reset = () => {
    setWeight('');
    setReps('');
    setResult(null);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>1RM 계산기</Text>
          <Text style={styles.subtitle}>
            최대 반복 가능 무게(1RM)를 계산하고 훈련 강도를 설정하세요
          </Text>
        </View>

        <View style={styles.inputCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>무게 (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              maxLength={6}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>반복 횟수</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={reps}
              onChangeText={setReps}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          <View style={styles.formulaGroup}>
            <Text style={styles.label}>계산 공식</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Object.entries(FORMULAS).map(([key, formula]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.formulaButton,
                    selectedFormula === key && styles.formulaButtonActive,
                  ]}
                  onPress={() => setSelectedFormula(key as keyof typeof FORMULAS)}
                >
                  <Text
                    style={[
                      styles.formulaButtonText,
                      selectedFormula === key && styles.formulaButtonTextActive,
                    ]}
                  >
                    {formula.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.resetButton} onPress={reset}>
              <Text style={styles.resetButtonText}>초기화</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.calculateButton, (!weight || !reps) && styles.calculateButtonDisabled]} 
              onPress={calculate}
              disabled={!weight || !reps}
            >
              <Text style={styles.calculateButtonText}>계산</Text>
            </TouchableOpacity>
          </View>
        </View>

        {result && (
          <View style={styles.resultCard}>
            <View style={styles.oneRMResult}>
              <Text style={styles.oneRMLabel}>예상 1RM</Text>
              <Text style={styles.oneRMValue}>{result.oneRM} kg</Text>
              <Text style={styles.oneRMFormula}>
                {FORMULAS[selectedFormula].name} 공식 사용
              </Text>
            </View>

            <View style={styles.percentageTable}>
              <Text style={styles.tableTitle}>훈련 강도별 무게</Text>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>강도</Text>
                <Text style={styles.tableHeaderText}>무게</Text>
                <Text style={styles.tableHeaderText}>반복</Text>
              </View>
              {result.percentages.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.percent}%</Text>
                  <Text style={styles.tableCell}>{item.weight} kg</Text>
                  <Text style={styles.tableCell}>{item.reps}회</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>1RM이란?</Text>
          <Text style={styles.infoText}>
            1RM(One-Rep Max)은 정확한 자세로 1회만 들어올릴 수 있는 최대 무게를 의미합니다.
            실제로 1RM을 측정하는 것은 위험할 수 있으므로, 낮은 무게로 여러 번 수행한 결과를 
            바탕으로 계산합니다.
          </Text>
          
          <Text style={styles.infoTitle}>사용 방법</Text>
          <Text style={styles.infoText}>
            • 최근 운동에서 수행한 무게와 반복 횟수를 입력하세요{'\n'}
            • 반복 횟수는 1-20회 사이여야 정확합니다{'\n'}
            • 계산된 1RM을 기준으로 훈련 강도를 설정하세요
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
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formulaGroup: {
    marginBottom: 20,
  },
  formulaButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formulaButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  formulaButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  formulaButtonTextActive: {
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
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
    borderRadius: 16,
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
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  oneRMResult: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 20,
  },
  oneRMLabel: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  oneRMValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  oneRMFormula: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  percentageTable: {
    marginTop: 10,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    marginBottom: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
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
});