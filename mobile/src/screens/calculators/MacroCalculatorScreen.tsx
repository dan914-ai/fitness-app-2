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
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

type DietType = 'balanced' | 'lowCarb' | 'lowFat' | 'highProtein' | 'keto' | 'custom';

interface MacroResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
}

interface DietPreset {
  name: string;
  description: string;
  protein: number;
  carbs: number;
  fat: number;
}

const DIET_PRESETS: Record<DietType, DietPreset> = {
  balanced: {
    name: '균형잡힌 식단',
    description: '일반적인 건강 식단',
    protein: 30,
    carbs: 40,
    fat: 30,
  },
  lowCarb: {
    name: '저탄수화물',
    description: '탄수화물 제한 식단',
    protein: 40,
    carbs: 20,
    fat: 40,
  },
  lowFat: {
    name: '저지방',
    description: '지방 제한 식단',
    protein: 30,
    carbs: 50,
    fat: 20,
  },
  highProtein: {
    name: '고단백',
    description: '근육 증가 최적화',
    protein: 40,
    carbs: 35,
    fat: 25,
  },
  keto: {
    name: '키토제닉',
    description: '초저탄수화물 고지방',
    protein: 20,
    carbs: 5,
    fat: 75,
  },
  custom: {
    name: '사용자 설정',
    description: '직접 비율 설정',
    protein: 0,
    carbs: 0,
    fat: 0,
  },
};

const screenWidth = Dimensions.get('window').width;

export default function MacroCalculatorScreen() {
  const [calories, setCalories] = useState('');
  const [dietType, setDietType] = useState<DietType>('balanced');
  const [customProtein, setCustomProtein] = useState('30');
  const [customCarbs, setCustomCarbs] = useState('40');
  const [customFat, setCustomFat] = useState('30');
  const [result, setResult] = useState<MacroResult | null>(null);

  const calculate = () => {
    const caloriesNum = parseInt(calories);
    if (!caloriesNum) return;

    let proteinPercent: number;
    let carbsPercent: number;
    let fatPercent: number;

    if (dietType === 'custom') {
      proteinPercent = parseInt(customProtein) || 0;
      carbsPercent = parseInt(customCarbs) || 0;
      fatPercent = parseInt(customFat) || 0;

      const total = proteinPercent + carbsPercent + fatPercent;
      if (total !== 100) {
        alert('영양소 비율의 합이 100%가 되어야 합니다.');
        return;
      }
    } else {
      const preset = DIET_PRESETS[dietType];
      proteinPercent = preset.protein;
      carbsPercent = preset.carbs;
      fatPercent = preset.fat;
    }

    // Calculate grams from percentages
    const proteinCalories = (caloriesNum * proteinPercent) / 100;
    const carbsCalories = (caloriesNum * carbsPercent) / 100;
    const fatCalories = (caloriesNum * fatPercent) / 100;

    const protein = Math.round(proteinCalories / 4); // 4 cal/g
    const carbs = Math.round(carbsCalories / 4); // 4 cal/g
    const fat = Math.round(fatCalories / 9); // 9 cal/g

    setResult({
      calories: caloriesNum,
      protein,
      carbs,
      fat,
      proteinPercent,
      carbsPercent,
      fatPercent,
    });
  };

  const reset = () => {
    setCalories('');
    setDietType('balanced');
    setCustomProtein('30');
    setCustomCarbs('40');
    setCustomFat('30');
    setResult(null);
  };

  const getMealDistribution = (dailyMacros: MacroResult) => {
    return {
      breakfast: {
        protein: Math.round(dailyMacros.protein * 0.25),
        carbs: Math.round(dailyMacros.carbs * 0.25),
        fat: Math.round(dailyMacros.fat * 0.25),
      },
      lunch: {
        protein: Math.round(dailyMacros.protein * 0.35),
        carbs: Math.round(dailyMacros.carbs * 0.35),
        fat: Math.round(dailyMacros.fat * 0.35),
      },
      dinner: {
        protein: Math.round(dailyMacros.protein * 0.30),
        carbs: Math.round(dailyMacros.carbs * 0.30),
        fat: Math.round(dailyMacros.fat * 0.30),
      },
      snack: {
        protein: Math.round(dailyMacros.protein * 0.10),
        carbs: Math.round(dailyMacros.carbs * 0.10),
        fat: Math.round(dailyMacros.fat * 0.10),
      },
    };
  };

  const pieChartData = result ? [
    {
      name: '단백질',
      population: result.proteinPercent,
      color: Colors.error,
      legendFontColor: Colors.text,
      legendFontSize: 14,
    },
    {
      name: '탄수화물',
      population: result.carbsPercent,
      color: Colors.success,
      legendFontColor: Colors.text,
      legendFontSize: 14,
    },
    {
      name: '지방',
      population: result.fatPercent,
      color: Colors.warning,
      legendFontColor: Colors.text,
      legendFontSize: 14,
    },
  ] : [];

  const mealDistribution = result ? getMealDistribution(result) : null;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>매크로 계산기</Text>
          <Text style={styles.subtitle}>
            목표 칼로리에 맞는 영양소 배분을 계산하세요
          </Text>
        </View>

        <View style={styles.inputCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>목표 칼로리</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={calories}
                onChangeText={setCalories}
                keyboardType="number-pad"
                maxLength={5}
              />
              <Text style={styles.unit}>kcal</Text>
            </View>
          </View>

          <View style={styles.dietTypeSection}>
            <Text style={styles.label}>식단 유형</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.dietTypeScroll}>
              {(Object.entries(DIET_PRESETS) as [DietType, DietPreset][]).map(([key, preset]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.dietTypeButton, dietType === key && styles.dietTypeButtonActive]}
                  onPress={() => setDietType(key)}
                >
                  <View style={styles.dietTypeContent}>
                    <Text style={[styles.dietTypeName, dietType === key && styles.dietTypeNameActive]}>
                      {preset.name}
                    </Text>
                    <Text style={[styles.dietTypeDesc, dietType === key && styles.dietTypeDescActive]}>
                      {preset.description}
                    </Text>
                  </View>
                  {key !== 'custom' && (
                    <View style={styles.dietTypeRatios}>
                      <Text style={[styles.dietTypeRatio, dietType === key && styles.dietTypeRatioActive]}>
                        P: {preset.protein}%
                      </Text>
                      <Text style={[styles.dietTypeRatio, dietType === key && styles.dietTypeRatioActive]}>
                        C: {preset.carbs}%
                      </Text>
                      <Text style={[styles.dietTypeRatio, dietType === key && styles.dietTypeRatioActive]}>
                        F: {preset.fat}%
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {dietType === 'custom' && (
            <View style={styles.customRatios}>
              <Text style={styles.customRatiosTitle}>영양소 비율 설정 (%)</Text>
              <View style={styles.customRatiosRow}>
                <View style={styles.customRatioItem}>
                  <Text style={styles.customRatioLabel}>단백질</Text>
                  <TextInput
                    style={styles.customRatioInput}
                    value={customProtein}
                    onChangeText={setCustomProtein}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
                <View style={styles.customRatioItem}>
                  <Text style={styles.customRatioLabel}>탄수화물</Text>
                  <TextInput
                    style={styles.customRatioInput}
                    value={customCarbs}
                    onChangeText={setCustomCarbs}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
                <View style={styles.customRatioItem}>
                  <Text style={styles.customRatioLabel}>지방</Text>
                  <TextInput
                    style={styles.customRatioInput}
                    value={customFat}
                    onChangeText={setCustomFat}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
              </View>
              <Text style={styles.customRatioSum}>
                합계: {(parseInt(customProtein) || 0) + (parseInt(customCarbs) || 0) + (parseInt(customFat) || 0)}%
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.resetButton} onPress={reset}>
              <Text style={styles.resetButtonText}>초기화</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.calculateButton, !calories && styles.calculateButtonDisabled]} 
              onPress={calculate}
              disabled={!calories}
            >
              <Text style={styles.calculateButtonText}>계산</Text>
            </TouchableOpacity>
          </View>
        </View>

        {result && (
          <>
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>영양소 배분</Text>
              
              <View style={styles.macroResults}>
                <View style={styles.macroItem}>
                  <View style={[styles.macroIcon, { backgroundColor: Colors.error + '20' }]}>
                    <Text style={styles.macroIconText}>P</Text>
                  </View>
                  <Text style={styles.macroLabel}>단백질</Text>
                  <Text style={styles.macroValue}>{result.protein}g</Text>
                  <Text style={styles.macroCalories}>{result.protein * 4} kcal</Text>
                  <Text style={styles.macroPercent}>{result.proteinPercent}%</Text>
                </View>
                
                <View style={styles.macroItem}>
                  <View style={[styles.macroIcon, { backgroundColor: Colors.success + '20' }]}>
                    <Text style={styles.macroIconText}>C</Text>
                  </View>
                  <Text style={styles.macroLabel}>탄수화물</Text>
                  <Text style={styles.macroValue}>{result.carbs}g</Text>
                  <Text style={styles.macroCalories}>{result.carbs * 4} kcal</Text>
                  <Text style={styles.macroPercent}>{result.carbsPercent}%</Text>
                </View>
                
                <View style={styles.macroItem}>
                  <View style={[styles.macroIcon, { backgroundColor: Colors.warning + '20' }]}>
                    <Text style={styles.macroIconText}>F</Text>
                  </View>
                  <Text style={styles.macroLabel}>지방</Text>
                  <Text style={styles.macroValue}>{result.fat}g</Text>
                  <Text style={styles.macroCalories}>{result.fat * 9} kcal</Text>
                  <Text style={styles.macroPercent}>{result.fatPercent}%</Text>
                </View>
              </View>

              <View style={styles.chartContainer}>
                <PieChart
                  data={pieChartData}
                  width={screenWidth - 80}
                  height={200}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            </View>

            {mealDistribution && (
              <View style={styles.mealCard}>
                <Text style={styles.mealTitle}>끼니별 배분 예시</Text>
                
                <View style={styles.mealGrid}>
                  <View style={styles.mealItem}>
                    <Text style={styles.mealName}>아침 (25%)</Text>
                    <Text style={styles.mealMacro}>P: {mealDistribution.breakfast.protein}g</Text>
                    <Text style={styles.mealMacro}>C: {mealDistribution.breakfast.carbs}g</Text>
                    <Text style={styles.mealMacro}>F: {mealDistribution.breakfast.fat}g</Text>
                  </View>
                  
                  <View style={styles.mealItem}>
                    <Text style={styles.mealName}>점심 (35%)</Text>
                    <Text style={styles.mealMacro}>P: {mealDistribution.lunch.protein}g</Text>
                    <Text style={styles.mealMacro}>C: {mealDistribution.lunch.carbs}g</Text>
                    <Text style={styles.mealMacro}>F: {mealDistribution.lunch.fat}g</Text>
                  </View>
                  
                  <View style={styles.mealItem}>
                    <Text style={styles.mealName}>저녁 (30%)</Text>
                    <Text style={styles.mealMacro}>P: {mealDistribution.dinner.protein}g</Text>
                    <Text style={styles.mealMacro}>C: {mealDistribution.dinner.carbs}g</Text>
                    <Text style={styles.mealMacro}>F: {mealDistribution.dinner.fat}g</Text>
                  </View>
                  
                  <View style={styles.mealItem}>
                    <Text style={styles.mealName}>간식 (10%)</Text>
                    <Text style={styles.mealMacro}>P: {mealDistribution.snack.protein}g</Text>
                    <Text style={styles.mealMacro}>C: {mealDistribution.snack.carbs}g</Text>
                    <Text style={styles.mealMacro}>F: {mealDistribution.snack.fat}g</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>영양소 역할</Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>단백질</Text>: 근육 성장과 회복, 포만감 유지{'\n'}
            <Text style={styles.infoBold}>탄수화물</Text>: 주요 에너지원, 운동 성능 향상{'\n'}
            <Text style={styles.infoBold}>지방</Text>: 호르몬 생산, 비타민 흡수, 장기 보호
          </Text>
          
          <Text style={styles.infoTitle}>참고사항</Text>
          <Text style={styles.infoText}>
            • 개인의 목표와 활동량에 따라 조정이 필요합니다{'\n'}
            • 운동 전후 영양소 타이밍도 중요합니다{'\n'}
            • 충분한 수분 섭취를 잊지 마세요
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  unit: {
    paddingRight: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  dietTypeSection: {
    marginBottom: 20,
  },
  dietTypeScroll: {
    maxHeight: 300,
  },
  dietTypeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dietTypeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dietTypeContent: {
    flex: 1,
  },
  dietTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  dietTypeNameActive: {
    color: '#FFFFFF',
  },
  dietTypeDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dietTypeDescActive: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  dietTypeRatios: {
    flexDirection: 'row',
    gap: 8,
  },
  dietTypeRatio: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  dietTypeRatioActive: {
    color: Colors.primary,
    backgroundColor: '#FFFFFF',
  },
  customRatios: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 16,
  },
  customRatiosTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  customRatiosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  customRatioItem: {
    flex: 1,
    alignItems: 'center',
  },
  customRatioLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  customRatioInput: {
    width: '100%',
    padding: 8,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  customRatioSum: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
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
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  macroResults: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  macroCalories: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  macroPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  mealCard: {
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
  mealTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  mealName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  mealMacro: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
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