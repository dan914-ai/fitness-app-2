import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { WellnessStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse, safeJsonStringify } from '../../utils/safeJsonParse';
// Removed LinearGradient to avoid dependency issue

const { width } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<WellnessStackParamList, 'WellnessMain'>;

interface WellnessData {
  waterIntake: number;
  waterGoal: number;
  calories: number;
  calorieGoal: number;
  weight?: number;
  steps?: number;
}

export default function WellnessScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [wellnessData, setWellnessData] = useState<WellnessData>({
    waterIntake: 0,
    waterGoal: 2000,
    calories: 0,
    calorieGoal: 2000,
  });
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    loadWellnessData();
    setGreetingMessage();
  }, []);

  const loadWellnessData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Load water intake
      const waterData = await AsyncStorage.getItem(`water_intake_${today}`);
      if (waterData) {
        const parsed = safeJsonParse(waterData, {});
        setWellnessData(prev => ({
          ...prev,
          waterIntake: parsed.currentIntake || 0,
          waterGoal: parsed.goal || 2000,
        }));
      }

      // Load nutrition data
      const nutritionData = await AsyncStorage.getItem(`nutrition_${today}`);
      if (nutritionData) {
        const parsed = safeJsonParse(nutritionData, {});
        setWellnessData(prev => ({
          ...prev,
          calories: parsed.calories || 0,
          calorieGoal: parsed.goal || 2000,
        }));
      }
    } catch (error) {
      console.error('Error loading wellness data:', error);
    }
  };

  const setGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('좋은 아침이에요! 🌅');
    } else if (hour < 18) {
      setGreeting('오늘도 건강한 하루 보내세요! ☀️');
    } else {
      setGreeting('오늘 하루도 수고하셨어요! 🌙');
    }
  };

  const wellnessFeatures = [
    {
      id: 'water',
      title: '수분 섭취',
      icon: 'local-drink',
      screen: 'WaterIntake',
      color: Colors.water,
      value: `${wellnessData.waterIntake}ml`,
      goal: `목표: ${wellnessData.waterGoal}ml`,
      progress: wellnessData.waterIntake / wellnessData.waterGoal,
    },
    {
      id: 'nutrition',
      title: '영양 & 칼로리',
      icon: 'restaurant',
      screen: 'NutritionTracking',
      color: Colors.nutrition,
      value: `${wellnessData.calories}kcal`,
      goal: `목표: ${wellnessData.calorieGoal}kcal`,
      progress: wellnessData.calories / wellnessData.calorieGoal,
    },
    {
      id: 'body',
      title: '신체 측정',
      icon: 'straighten',
      screen: 'BodyMeasurements',
      color: Colors.body,
      value: wellnessData.weight ? `${wellnessData.weight}kg` : '기록 없음',
      goal: '체중 관리',
      progress: 0,
    },
  ];

  const quickActions = [
    {
      id: 'water-quick',
      title: '물 250ml',
      icon: 'local-drink',
      action: async () => {
        const today = new Date().toISOString().split('T')[0];
        const waterData = await AsyncStorage.getItem(`water_intake_${today}`);
        const parsed = waterData ? safeJsonParse(waterData, {}) : { currentIntake: 0, goal: 2000, history: [] };
        
        const newData = {
          ...parsed,
          currentIntake: parsed.currentIntake + 250,
          history: [
            { time: new Date().toISOString(), amount: 250 },
            ...parsed.history,
          ],
        };
        
        await AsyncStorage.setItem(`water_intake_${today}`, safeJsonStringify(newData));
        loadWellnessData();
        Alert.alert('✅', '물 250ml가 기록되었습니다!');
      },
    },
    {
      id: 'meal-quick',
      title: '식사 기록',
      icon: 'restaurant',
      action: () => navigation.navigate('NutritionTracking'),
    },
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 0.8) return Colors.success;
    if (progress >= 0.5) return Colors.warning;
    return Colors.error;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: Colors.primary }]}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.headerTitle}>웰니스 대시보드</Text>
          
          {/* Daily Summary */}
          <View style={styles.dailySummary}>
            <View style={styles.summaryItem}>
              <Icon name="local-drink" size={20} color="#FFFFFF" />
              <Text style={styles.summaryValue}>
                {Math.round((wellnessData.waterIntake / wellnessData.waterGoal) * 100)}%
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Icon name="restaurant" size={20} color="#FFFFFF" />
              <Text style={styles.summaryValue}>{wellnessData.calories}kcal</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>빠른 기록</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickActionsScroll}
          >
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionButton}
                onPress={action.action}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: Colors.primary + '20' }]}>
                  <Icon name={action.icon} size={24} color={Colors.primary} />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Wellness Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>웰니스 관리</Text>
          <View style={styles.featuresGrid}>
            {wellnessFeatures.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={styles.featureCard}
                onPress={() => {
                  // Handle cross-tab navigation for BodyMeasurements
                  if (feature.screen === 'BodyMeasurements') {
                    // Navigate to Record tab first, then to BodyMeasurements
                    navigation.navigate('기록', {
                      screen: 'BodyMeasurements'
                    });
                  } else {
                    // Navigate within Wellness stack
                    navigation.navigate(feature.screen as any);
                  }
                }}
              >
                <View style={styles.featureHeader}>
                  <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                    <Icon name={feature.icon} size={28} color={feature.color} />
                  </View>
                  <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
                </View>
                
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureValue}>{feature.value}</Text>
                <Text style={styles.featureGoal}>{feature.goal}</Text>
                
                {feature.progress > 0 && (
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(feature.progress * 100, 100)}%`,
                          backgroundColor: getProgressColor(feature.progress),
                        },
                      ]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>


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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  dailySummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 16,
  },
  summaryItem: {
    alignItems: 'center',
    gap: 8,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quickActionsSection: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  quickActionsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  quickActionButton: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
  },
  featuresSection: {
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    width: (width - 56) / 2,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  featureValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  featureGoal: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  insightsCard: {
    marginTop: 32,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  insightsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  insightsContent: {
    flex: 1,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  insightsSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  goalsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  goalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  goalsTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  goalsSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});