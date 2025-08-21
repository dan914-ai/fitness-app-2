import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse, safeJsonStringify } from '../../utils/safeJsonParse';

const { width } = Dimensions.get('window');

interface WaterIntakeData {
  date: string;
  currentIntake: number;
  goal: number;
  history: {
    time: string;
    amount: number;
  }[];
}

const WATER_INTAKE_PRESETS = [250, 500, 750, 1000]; // ml
const DEFAULT_DAILY_GOAL = 2000; // ml

export default function WaterIntakeScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [waterData, setWaterData] = useState<WaterIntakeData>({
    date: new Date().toISOString().split('T')[0],
    currentIntake: 0,
    goal: DEFAULT_DAILY_GOAL,
    history: [],
  });
  const [customAmount, setCustomAmount] = useState(250);
  const [weeklyData, setWeeklyData] = useState<{[key: string]: number}>({});
  const fillAnimation = new Animated.Value(0);

  useEffect(() => {
    loadWaterData();
  }, []);

  useEffect(() => {
    // Animate water fill level
    Animated.timing(fillAnimation, {
      toValue: Math.min(waterData.currentIntake / waterData.goal, 1),
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [waterData.currentIntake, waterData.goal]);

  const loadWaterData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const savedData = await AsyncStorage.getItem(`water_intake_${today}`);
      
      if (savedData) {
        setWaterData(safeJsonParse(savedData, {}));
      } else {
        // Load goal from settings
        const savedGoal = await AsyncStorage.getItem('water_intake_goal');
        if (savedGoal) {
          setWaterData(prev => ({ ...prev, goal: parseInt(savedGoal) }));
        }
      }
      
      // Load weekly data
      const weekData: {[key: string]: number} = {};
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = await AsyncStorage.getItem(`water_intake_${dateStr}`);
        if (dayData) {
          const parsed = safeJsonParse(dayData, { currentIntake: 0, goal: DEFAULT_DAILY_GOAL });
          weekData[dateStr] = (parsed.currentIntake / parsed.goal) * 100;
        } else {
          weekData[dateStr] = 0;
        }
      }
      setWeeklyData(weekData);
    } catch (error) {
      console.error('Error loading water data:', error);
    }
  };

  const saveWaterData = async (data: WaterIntakeData) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(`water_intake_${today}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving water data:', error);
    }
  };

  const addWater = async (amount: number) => {
    const newData = {
      ...waterData,
      currentIntake: waterData.currentIntake + amount,
      history: [
        {
          time: new Date().toISOString(),
          amount,
        },
        ...waterData.history,
      ],
    };
    setWaterData(newData);
    await saveWaterData(newData);
  };

  const undoLastEntry = async () => {
    if (waterData.history.length === 0) return;

    const lastEntry = waterData.history[0];
    const newData = {
      ...waterData,
      currentIntake: Math.max(0, waterData.currentIntake - lastEntry.amount),
      history: waterData.history.slice(1),
    };
    setWaterData(newData);
    await saveWaterData(newData);
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMotivationalMessage = () => {
    const percentage = (waterData.currentIntake / waterData.goal) * 100;
    if (percentage >= 100) return '목표 달성! 훌륭해요! 💪';
    if (percentage >= 75) return '거의 다 왔어요! 조금만 더!';
    if (percentage >= 50) return '절반 이상 달성! 계속 가세요!';
    if (percentage >= 25) return '좋은 시작이에요!';
    return '오늘도 수분 섭취를 시작해보세요!';
  };

  const percentage = Math.round((waterData.currentIntake / waterData.goal) * 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>수분 섭취</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Icon name="settings" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Water Glass Visual */}
        <View style={styles.glassSection}>
          <View style={[styles.glassContainer, { backgroundColor: theme.surface }]}>
            <View style={[styles.glass, { borderColor: theme.border }]}>
              <Animated.View
                style={[
                  styles.waterFill,
                  {
                    backgroundColor: theme.primary + '60',
                    height: fillAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
              <View style={styles.glassContent}>
                <Text style={[styles.currentIntake, { color: theme.text }]}>
                  {waterData.currentIntake}ml
                </Text>
                <Text style={[styles.goalText, { color: theme.textSecondary }]}>
                  / {waterData.goal}ml
                </Text>
                <Text style={[styles.percentageText, { color: theme.primary }]}>
                  {percentage}%
                </Text>
              </View>
            </View>
          </View>
          
          <Text style={[styles.motivationalMessage, { color: theme.textSecondary }]}>
            {getMotivationalMessage()}
          </Text>
        </View>

        {/* Quick Add Buttons */}
        <View style={styles.quickAddSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>빠른 추가</Text>
          <View style={styles.presetButtons}>
            {WATER_INTAKE_PRESETS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[styles.presetButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => addWater(amount)}
              >
                <Icon name="local-drink" size={24} color={theme.primary} />
                <Text style={[styles.presetButtonText, { color: theme.text }]}>
                  {amount >= 1000 ? `${amount / 1000}L` : `${amount}ml`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Amount */}
        <View style={[styles.customSection, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>사용자 지정 양</Text>
          <View style={styles.customControls}>
            <TouchableOpacity
              style={[styles.customButton, { backgroundColor: theme.primary }]}
              onPress={() => setCustomAmount(Math.max(50, customAmount - 50))}
            >
              <Icon name="remove" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.customAmountDisplay}>
              <Text style={[styles.customAmountText, { color: theme.text }]}>
                {customAmount}ml
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.customButton, { backgroundColor: theme.primary }]}
              onPress={() => setCustomAmount(customAmount + 50)}
            >
              <Icon name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.addCustomButton, { backgroundColor: theme.primary }]}
            onPress={() => addWater(customAmount)}
          >
            <Text style={styles.addCustomButtonText}>추가하기</Text>
          </TouchableOpacity>
        </View>

        {/* Today's History */}
        <View style={[styles.historySection, { backgroundColor: theme.surface }]}>
          <View style={styles.historyHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>오늘의 기록</Text>
            {waterData.history.length > 0 && (
              <TouchableOpacity onPress={undoLastEntry}>
                <Text style={[styles.undoText, { color: theme.primary }]}>실행 취소</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {waterData.history.length > 0 ? (
            <View style={styles.historyList}>
              {waterData.history.slice(0, 10).map((entry, index) => (
                <View 
                  key={index} 
                  style={[styles.historyItem, { borderBottomColor: theme.border }]}
                >
                  <View style={styles.historyItemLeft}>
                    <Icon name="access-time" size={16} color={theme.textSecondary} />
                    <Text style={[styles.historyTime, { color: theme.textSecondary }]}>
                      {formatTime(entry.time)}
                    </Text>
                  </View>
                  <Text style={[styles.historyAmount, { color: theme.text }]}>
                    +{entry.amount}ml
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyHistory}>
              <Icon name="history" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyHistoryText, { color: theme.textSecondary }]}>
                아직 기록이 없습니다
              </Text>
            </View>
          )}
        </View>

        {/* Weekly Stats */}
        <View style={[styles.statsSection, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>주간 통계</Text>
          <View style={styles.weekDays}>
            {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => {
              const todayIndex = new Date().getDay();
              const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1; // Sunday is 0, adjust to match our array
              const isToday = index === adjustedTodayIndex;
              
              // Calculate date for this day
              const daysFromToday = index - adjustedTodayIndex;
              const date = new Date();
              date.setDate(date.getDate() + daysFromToday);
              const dateStr = date.toISOString().split('T')[0];
              
              const dayPercentage = isToday ? percentage : (weeklyData[dateStr] || 0);
              
              return (
                <View key={day} style={styles.dayColumn}>
                  <View style={[styles.dayBar, { backgroundColor: theme.border }]}>
                    <View
                      style={[
                        styles.dayBarFill,
                        {
                          backgroundColor: isToday ? theme.primary : theme.textSecondary,
                          height: `${dayPercentage}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[
                    styles.dayLabel, 
                    { color: isToday ? theme.primary : theme.textSecondary }
                  ]}>
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 4,
  },
  glassSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  glassContainer: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  glass: {
    width: 180,
    height: 240,
    borderWidth: 3,
    borderRadius: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  waterFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  glassContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  currentIntake: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  goalText: {
    fontSize: 16,
    marginTop: 4,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 8,
  },
  motivationalMessage: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  quickAddSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  presetButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  customSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  customControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  customButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customAmountDisplay: {
    minWidth: 100,
    alignItems: 'center',
  },
  customAmountText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addCustomButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  addCustomButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  historySection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  undoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyTime: {
    fontSize: 14,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyHistoryText: {
    fontSize: 14,
    marginTop: 12,
  },
  statsSection: {
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 16,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dayBar: {
    width: 30,
    height: 80,
    borderRadius: 15,
    marginBottom: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  dayBarFill: {
    width: '100%',
    borderRadius: 15,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});