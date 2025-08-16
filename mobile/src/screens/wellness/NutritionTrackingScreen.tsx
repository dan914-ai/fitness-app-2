import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse, safeJsonStringify } from '../../utils/safeJsonParse';

interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

interface NutritionData {
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterIntake: number;
}

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

export default function NutritionTrackingScreen() {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeTab, setActiveTab] = useState<'tracker' | 'calculator'>('tracker');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [nutritionGoals, setNutritionGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  });
  
  // Calculator states
  const [gender, setGender] = useState<Gender>('남성');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [calculatorResult, setCalculatorResult] = useState<CalorieResult | null>(null);

  useEffect(() => {
    loadTodaysMeals();
    loadNutritionGoals();
  }, []);

  const loadTodaysMeals = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await AsyncStorage.getItem(`nutrition_${today}`);
      if (data) {
        const nutritionData: NutritionData = JSON.parse(data);
        setMeals(nutritionData.meals);
      }
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  const loadNutritionGoals = async () => {
    try {
      const goals = await AsyncStorage.getItem('nutrition_goals');
      if (goals) {
        setNutritionGoals(JSON.parse(goals));
      }
    } catch (error) {
      console.error('Error loading nutrition goals:', error);
    }
  };

  const addMeal = async () => {
    if (!mealName || !calories) {
      Alert.alert('오류', '음식 이름과 칼로리를 입력해주세요.');
      return;
    }

    const newMeal: Meal = {
      id: Date.now().toString(),
      type: mealType,
      name: mealName,
      calories: parseInt(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      time: new Date().toISOString(),
    };

    const updatedMeals = [...meals, newMeal];
    setMeals(updatedMeals);

    // Save to AsyncStorage
    const today = new Date().toISOString().split('T')[0];
    const nutritionData: NutritionData = {
      date: today,
      meals: updatedMeals,
      totalCalories: updatedMeals.reduce((sum, meal) => sum + meal.calories, 0),
      totalProtein: updatedMeals.reduce((sum, meal) => sum + meal.protein, 0),
      totalCarbs: updatedMeals.reduce((sum, meal) => sum + meal.carbs, 0),
      totalFat: updatedMeals.reduce((sum, meal) => sum + meal.fat, 0),
      waterIntake: 0,
    };

    try {
      await AsyncStorage.setItem(`nutrition_${today}`, JSON.stringify(nutritionData));
      Alert.alert('성공', '식사가 기록되었습니다!');
      
      // Reset form
      setMealName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('오류', '식사 저장에 실패했습니다.');
    }
  };

  const deleteMeal = async (mealId: string) => {
    const updatedMeals = meals.filter(meal => meal.id !== mealId);
    setMeals(updatedMeals);

    const today = new Date().toISOString().split('T')[0];
    const nutritionData: NutritionData = {
      date: today,
      meals: updatedMeals,
      totalCalories: updatedMeals.reduce((sum, meal) => sum + meal.calories, 0),
      totalProtein: updatedMeals.reduce((sum, meal) => sum + meal.protein, 0),
      totalCarbs: updatedMeals.reduce((sum, meal) => sum + meal.carbs, 0),
      totalFat: updatedMeals.reduce((sum, meal) => sum + meal.fat, 0),
      waterIntake: 0,
    };

    try {
      await AsyncStorage.setItem(`nutrition_${today}`, JSON.stringify(nutritionData));
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return 'free-breakfast';
      case 'lunch': return 'lunch-dining';
      case 'dinner': return 'dinner-dining';
      case 'snack': return 'cookie';
      default: return 'restaurant';
    }
  };

  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case 'breakfast': return '아침';
      case 'lunch': return '점심';
      case 'dinner': return '저녁';
      case 'snack': return '간식';
      default: return type;
    }
  };

  const totals = {
    calories: meals.reduce((sum, meal) => sum + meal.calories, 0),
    protein: meals.reduce((sum, meal) => sum + meal.protein, 0),
    carbs: meals.reduce((sum, meal) => sum + meal.carbs, 0),
    fat: meals.reduce((sum, meal) => sum + meal.fat, 0),
  };

  const calculateCalories = () => {
    const ageNum = parseInt(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (!ageNum || !heightNum || !weightNum) {
      Alert.alert('오류', '모든 정보를 입력해주세요.');
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

    setCalculatorResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
    });
    
    // Update nutrition goals based on calculation
    const newGoals = {
      calories: Math.round(targetCalories),
      protein: Math.round(targetCalories * 0.3 / 4), // 30% from protein, 4 cal/g
      carbs: Math.round(targetCalories * 0.4 / 4), // 40% from carbs, 4 cal/g
      fat: Math.round(targetCalories * 0.3 / 9), // 30% from fat, 9 cal/g
    };
    setNutritionGoals(newGoals);
    
    // Save goals
    AsyncStorage.setItem('nutrition_goals', safeJsonStringify(newGoals));
    
    // Scroll to results
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>영양 & 칼로리</Text>
        <TouchableOpacity>
          <Icon name="settings" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'tracker' && styles.tabButtonActive]}
          onPress={() => setActiveTab('tracker')}
        >
          <Icon name="restaurant" size={20} color={activeTab === 'tracker' ? '#FFFFFF' : Colors.text} />
          <Text style={[styles.tabButtonText, activeTab === 'tracker' && styles.tabButtonTextActive]}>
            식사 기록
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'calculator' && styles.tabButtonActive]}
          onPress={() => setActiveTab('calculator')}
        >
          <Icon name="calculate" size={20} color={activeTab === 'calculator' ? '#FFFFFF' : Colors.text} />
          <Text style={[styles.tabButtonText, activeTab === 'calculator' && styles.tabButtonTextActive]}>
            칼로리 계산
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {activeTab === 'tracker' ? (
        <>
        {/* Daily Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>오늘의 영양 섭취</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totals.calories}</Text>
              <Text style={styles.summaryLabel}>칼로리</Text>
              <Text style={styles.summaryGoal}>/ {nutritionGoals.calories}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totals.protein.toFixed(1)}g</Text>
              <Text style={styles.summaryLabel}>단백질</Text>
              <Text style={styles.summaryGoal}>/ {nutritionGoals.protein}g</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totals.carbs.toFixed(1)}g</Text>
              <Text style={styles.summaryLabel}>탄수화물</Text>
              <Text style={styles.summaryGoal}>/ {nutritionGoals.carbs}g</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totals.fat.toFixed(1)}g</Text>
              <Text style={styles.summaryLabel}>지방</Text>
              <Text style={styles.summaryGoal}>/ {nutritionGoals.fat}g</Text>
            </View>
          </View>
        </View>

        {/* Add Meal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>식사 추가</Text>
          
          {/* Meal Type Selection */}
          <View style={styles.mealTypeContainer}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeButton,
                  mealType === type && styles.mealTypeButtonActive,
                ]}
                onPress={() => setMealType(type)}
              >
                <Icon 
                  name={getMealTypeIcon(type)} 
                  size={24} 
                  color={mealType === type ? '#FFFFFF' : Colors.text} 
                />
                <Text style={[
                  styles.mealTypeText,
                  mealType === type && styles.mealTypeTextActive,
                ]}>
                  {getMealTypeLabel(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Food Input */}
          <TextInput
            style={styles.input}
            placeholder="음식 이름"
            placeholderTextColor={Colors.textSecondary}
            value={mealName}
            onChangeText={setMealName}
          />

          {/* Nutrition Input */}
          <View style={styles.nutritionInputContainer}>
            <View style={styles.nutritionInputItem}>
              <Text style={styles.inputLabel}>칼로리</Text>
              <TextInput
                style={styles.nutritionInput}
                placeholder="0"
                placeholderTextColor={Colors.textSecondary}
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.nutritionInputItem}>
              <Text style={styles.inputLabel}>단백질(g)</Text>
              <TextInput
                style={styles.nutritionInput}
                placeholder="0"
                placeholderTextColor={Colors.textSecondary}
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.nutritionInputItem}>
              <Text style={styles.inputLabel}>탄수화물(g)</Text>
              <TextInput
                style={styles.nutritionInput}
                placeholder="0"
                placeholderTextColor={Colors.textSecondary}
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.nutritionInputItem}>
              <Text style={styles.inputLabel}>지방(g)</Text>
              <TextInput
                style={styles.nutritionInput}
                placeholder="0"
                placeholderTextColor={Colors.textSecondary}
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={addMeal}>
            <Icon name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>식사 추가</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Meals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘의 식사</Text>
          {meals.length > 0 ? (
            <View style={styles.mealsList}>
              {meals.map((meal) => (
                <View key={meal.id} style={styles.mealItem}>
                  <View style={styles.mealIcon}>
                    <Icon name={getMealTypeIcon(meal.type)} size={24} color={Colors.nutrition} />
                  </View>
                  <View style={styles.mealContent}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.mealInfo}>
                      {meal.calories}kcal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteMeal(meal.id)}>
                    <Icon name="delete" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>아직 기록된 식사가 없습니다</Text>
          )}
        </View>
        </>
        ) : (
        /* Calorie Calculator Tab */
        <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기본 정보</Text>
          
          {/* Gender Selection */}
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderButton, gender === '남성' && styles.genderButtonActive]}
              onPress={() => setGender('남성')}
            >
              <Icon name="male" size={24} color={gender === '남성' ? '#FFFFFF' : Colors.text} />
              <Text style={[styles.genderText, gender === '남성' && styles.genderTextActive]}>남성</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, gender === '여성' && styles.genderButtonActive]}
              onPress={() => setGender('여성')}
            >
              <Icon name="female" size={24} color={gender === '여성' ? '#FFFFFF' : Colors.text} />
              <Text style={[styles.genderText, gender === '여성' && styles.genderTextActive]}>여성</Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>나이</Text>
              <TextInput
                style={styles.calculatorInput}
                placeholder="25"
                placeholderTextColor={Colors.textSecondary}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>키 (cm)</Text>
              <TextInput
                style={styles.calculatorInput}
                placeholder="175"
                placeholderTextColor={Colors.textSecondary}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>체중 (kg)</Text>
              <TextInput
                style={styles.calculatorInput}
                placeholder="70"
                placeholderTextColor={Colors.textSecondary}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Activity Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>활동 수준</Text>
          {Object.entries(ACTIVITY_LEVELS).map(([key, level]) => (
            <TouchableOpacity
              key={key}
              style={[styles.activityOption, activityLevel === key && styles.activityOptionActive]}
              onPress={() => setActivityLevel(key as ActivityLevel)}
            >
              <View>
                <Text style={[styles.activityLabel, activityLevel === key && styles.activityLabelActive]}>
                  {level.label}
                </Text>
                <Text style={styles.activityDescription}>{level.description}</Text>
              </View>
              {activityLevel === key && <Icon name="check-circle" size={24} color={Colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Goal Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>목표</Text>
          <View style={styles.goalContainer}>
            {Object.entries(GOALS).map(([key, goalInfo]) => (
              <TouchableOpacity
                key={key}
                style={[styles.goalButton, goal === key && styles.goalButtonActive]}
                onPress={() => setGoal(key as Goal)}
              >
                <Text style={[styles.goalText, goal === key && styles.goalTextActive]}>
                  {goalInfo.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Calculate Button */}
        <TouchableOpacity style={styles.calculateButton} onPress={calculateCalories}>
          <Icon name="calculate" size={24} color="#FFFFFF" />
          <Text style={styles.calculateButtonText}>칼로리 계산하기</Text>
        </TouchableOpacity>

        {/* Results */}
        {calculatorResult && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>계산 결과</Text>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>기초대사량 (BMR)</Text>
              <Text style={styles.resultValue}>{calculatorResult.bmr} kcal</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>일일 칼로리 소비량 (TDEE)</Text>
              <Text style={styles.resultValue}>{calculatorResult.tdee} kcal</Text>
            </View>
            <View style={[styles.resultItem, styles.resultHighlight]}>
              <Text style={styles.resultLabelHighlight}>목표 칼로리</Text>
              <Text style={styles.resultValueHighlight}>{calculatorResult.targetCalories} kcal</Text>
            </View>
            <Text style={styles.resultNote}>
              이 값을 기준으로 영양 목표가 자동으로 설정됩니다.
            </Text>
          </View>
        )}
        </>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  summaryGoal: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mealTypeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealTypeButtonActive: {
    backgroundColor: Colors.nutrition,
    borderColor: Colors.nutrition,
  },
  mealTypeText: {
    fontSize: 12,
    color: Colors.text,
    marginTop: 4,
  },
  mealTypeTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
  },
  nutritionInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nutritionInputItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  nutritionInput: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.nutrition,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealsList: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.nutrition + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mealContent: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  mealInfo: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Colors.background,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 8,
  },
  genderButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  genderTextActive: {
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  calculatorInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  activityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  activityOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  activityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  activityLabelActive: {
    color: Colors.primary,
  },
  activityDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  goalContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  goalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  goalButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  goalTextActive: {
    color: '#FFFFFF',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 16,
    margin: 20,
    gap: 8,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  resultHighlight: {
    backgroundColor: Colors.primaryLight,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderBottomWidth: 0,
    marginTop: 12,
  },
  resultLabelHighlight: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  resultValueHighlight: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  resultNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});