import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse, safeJsonStringify } from '../../utils/safeJsonParse';

const { width } = Dimensions.get('window');

// Standard plate weights (kg)
const PLATE_WEIGHTS_KG = [25, 20, 15, 10, 5, 2.5, 2, 1.25, 1, 0.5];
const PLATE_WEIGHTS_LBS = [45, 35, 25, 10, 5, 2.5];

// Standard bar weights
const BAR_WEIGHTS = {
  kg: [
    { name: '남성 올림픽 바', weight: 20 },
    { name: '여성 올림픽 바', weight: 15 },
    { name: 'EZ 바', weight: 10 },
    { name: '스미스 머신', weight: 0 },
    { name: '커스텀', weight: 0 },
  ],
  lbs: [
    { name: 'Olympic Bar', weight: 45 },
    { name: "Women's Bar", weight: 35 },
    { name: 'EZ Bar', weight: 25 },
    { name: 'Smith Machine', weight: 0 },
    { name: 'Custom', weight: 0 },
  ],
};

// Plate colors for visualization
const PLATE_COLORS: { [key: number]: string } = {
  25: '#FF0000',
  20: '#0000FF',
  15: '#FFFF00',
  10: '#00FF00',
  5: '#FFFFFF',
  2.5: '#FF0000',
  2: '#0000FF',
  1.25: '#FFFF00',
  1: '#00FF00',
  0.5: '#FFFFFF',
  // lbs
  45: '#FF0000',
  35: '#FFFF00',
};

interface PlateCalculatorProps {
  visible: boolean;
  initialWeight?: number;
  onClose: () => void;
  onCalculate?: (plates: PlateConfig) => void;
}

interface PlateConfig {
  targetWeight: number;
  barWeight: number;
  plates: { weight: number; count: number }[];
  totalWeight: number;
  eachSide: number;
}

export default function PlateCalculator({
  visible,
  initialWeight = 60,
  onClose,
  onCalculate,
}: PlateCalculatorProps) {
  const { theme } = useTheme();
  const [targetWeight, setTargetWeight] = useState(initialWeight.toString());
  const [barWeight, setBarWeight] = useState(20);
  const [customBarWeight, setCustomBarWeight] = useState('20');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [plateConfig, setPlateConfig] = useState<PlateConfig | null>(null);
  const [showCustomBar, setShowCustomBar] = useState(false);
  const [availablePlates, setAvailablePlates] = useState<{ [key: number]: number }>({});

  // Load preferences
  useEffect(() => {
    loadPreferences();
  }, []);

  // Update target weight when prop changes
  useEffect(() => {
    if (initialWeight) {
      setTargetWeight(initialWeight.toString());
      calculatePlates(initialWeight);
    }
  }, [initialWeight]);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('@plate_calculator_prefs');
      if (stored) {
        const prefs = safeJsonParse(stored, {});
        setUnit(prefs.unit || 'kg');
        setBarWeight(prefs.barWeight || 20);
        setAvailablePlates(prefs.availablePlates || {});
      }
    } catch (error) {
      console.error('Error loading plate calculator preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      await AsyncStorage.setItem(
        '@plate_calculator_prefs',
        JSON.stringify({
          unit,
          barWeight,
          availablePlates,
        })
      );
    } catch (error) {
      console.error('Error saving plate calculator preferences:', error);
    }
  };

  const calculatePlates = (weight: number) => {
    if (weight <= barWeight) {
      setPlateConfig(null);
      return;
    }

    const weightToAdd = weight - barWeight;
    const weightPerSide = weightToAdd / 2;

    const plateWeights = unit === 'kg' ? PLATE_WEIGHTS_KG : PLATE_WEIGHTS_LBS;
    const plates: { weight: number; count: number }[] = [];
    let remainingWeight = weightPerSide;

    // Greedy algorithm to find minimum plates
    for (const plateWeight of plateWeights) {
      if (remainingWeight >= plateWeight) {
        const count = Math.floor(remainingWeight / plateWeight);
        
        // Check if we have enough plates available
        const available = availablePlates[plateWeight];
        const actualCount = available !== undefined ? Math.min(count, available) : count;
        
        if (actualCount > 0) {
          plates.push({ weight: plateWeight, count: actualCount });
          remainingWeight -= plateWeight * actualCount;
        }
      }
    }

    const totalPlateWeight = plates.reduce((sum, p) => sum + p.weight * p.count * 2, 0);
    const actualTotal = barWeight + totalPlateWeight;

    setPlateConfig({
      targetWeight: weight,
      barWeight,
      plates,
      totalWeight: actualTotal,
      eachSide: totalPlateWeight / 2,
    });

    if (onCalculate) {
      onCalculate({
        targetWeight: weight,
        barWeight,
        plates,
        totalWeight: actualTotal,
        eachSide: totalPlateWeight / 2,
      });
    }
  };

  const handleCalculate = () => {
    const weight = parseFloat(targetWeight);
    if (!isNaN(weight) && weight > 0) {
      calculatePlates(weight);
    }
  };

  const handleBarSelect = (weight: number) => {
    if (weight === 0) {
      setShowCustomBar(true);
    } else {
      setBarWeight(weight);
      setShowCustomBar(false);
      const targetW = parseFloat(targetWeight);
      if (!isNaN(targetW)) {
        calculatePlates(targetW);
      }
    }
  };

  const handleCustomBarSubmit = () => {
    const weight = parseFloat(customBarWeight);
    if (!isNaN(weight) && weight >= 0) {
      setBarWeight(weight);
      setShowCustomBar(false);
      const targetW = parseFloat(targetWeight);
      if (!isNaN(targetW)) {
        calculatePlates(targetW);
      }
    }
  };

  const toggleUnit = () => {
    const newUnit = unit === 'kg' ? 'lbs' : 'kg';
    setUnit(newUnit);
    // Convert weights
    const conversionFactor = newUnit === 'kg' ? 0.453592 : 2.20462;
    const convertedTarget = parseFloat(targetWeight) * conversionFactor;
    const convertedBar = barWeight * conversionFactor;
    setTargetWeight(convertedTarget.toFixed(1));
    setBarWeight(Math.round(convertedBar));
  };

  const renderPlateVisualization = () => {
    if (!plateConfig || plateConfig.plates.length === 0) return null;

    return (
      <View style={[styles.plateVisualization, { backgroundColor: theme.background }]}>
        {/* Bar */}
        <View style={styles.barContainer}>
          <View style={[styles.bar, { backgroundColor: theme.textSecondary }]} />
          <Text style={[styles.barLabel, { color: theme.textSecondary }]}>{barWeight}{unit}</Text>
        </View>

        {/* Plates on each side */}
        <View style={styles.platesContainer}>
          <Text style={[styles.sideLabel, { color: theme.textSecondary }]}>각 사이드</Text>
          <View style={styles.plateStack}>
            {plateConfig.plates.map((plate, index) => (
              <View key={index} style={styles.plateGroup}>
                {[...Array(plate.count)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.plate,
                      { borderColor: theme.border },
                      {
                        backgroundColor: PLATE_COLORS[plate.weight] || theme.primary,
                        width: Math.max(60, 120 - index * 10),
                        height: Math.max(8, 20 - index * 2),
                        marginLeft: i * 4,
                      },
                    ]}
                  >
                    <Text style={styles.plateText}>
                      {plate.weight}{unit}
                    </Text>
                  </View>
                ))}
                {plate.count > 1 && (
                  <Text style={[styles.plateCount, { color: theme.textSecondary }]}>×{plate.count}</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>원판 계산기</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Unit Toggle */}
            <View style={[styles.unitToggle, { backgroundColor: theme.background }]}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  unit === 'kg' && { backgroundColor: theme.primary }
                ]}
                onPress={() => unit !== 'kg' && toggleUnit()}
              >
                <Text style={[
                  styles.unitText,
                  { color: theme.textSecondary },
                  unit === 'kg' && { color: '#FFFFFF' }
                ]}>
                  KG
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  unit === 'lbs' && { backgroundColor: theme.primary }
                ]}
                onPress={() => unit !== 'lbs' && toggleUnit()}
              >
                <Text style={[
                  styles.unitText,
                  { color: theme.textSecondary },
                  unit === 'lbs' && { color: '#FFFFFF' }
                ]}>
                  LBS
                </Text>
              </TouchableOpacity>
            </View>

            {/* Target Weight Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>목표 중량</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={targetWeight}
                  onChangeText={setTargetWeight}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                />
                <Text style={[styles.inputUnit, { color: theme.textSecondary }]}>{unit}</Text>
              </View>
            </View>

            {/* Bar Weight Selection */}
            <View style={styles.barSection}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>바벨 무게</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.barOptions}>
                  {BAR_WEIGHTS[unit].map((bar) => (
                    <TouchableOpacity
                      key={bar.name}
                      style={[
                        styles.barOption,
                        { backgroundColor: theme.background },
                        barWeight === bar.weight && !showCustomBar && {
                          borderColor: theme.primary,
                          backgroundColor: theme.primary + '10'
                        },
                      ]}
                      onPress={() => handleBarSelect(bar.weight)}
                    >
                      <Text style={[
                        styles.barOptionText,
                        { color: theme.text },
                        barWeight === bar.weight && !showCustomBar && { color: theme.primary, fontWeight: '600' },
                      ]}>
                        {bar.name}
                      </Text>
                      {bar.weight > 0 && (
                        <Text style={[
                          styles.barWeightText,
                          { color: theme.textSecondary },
                          barWeight === bar.weight && !showCustomBar && { color: theme.primary },
                        ]}>
                          {bar.weight}{unit}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {showCustomBar && (
                <View style={styles.customBarInput}>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={customBarWeight}
                    onChangeText={setCustomBarWeight}
                    keyboardType="numeric"
                    placeholder="바벨 무게 입력"
                    placeholderTextColor={theme.textSecondary}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={[styles.customBarButton, { backgroundColor: theme.primary }]}
                    onPress={handleCustomBarSubmit}
                  >
                    <Text style={styles.customBarButtonText}>확인</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Calculate Button */}
            <TouchableOpacity
              style={[styles.calculateButton, { backgroundColor: theme.primary }]}
              onPress={handleCalculate}
            >
              <Icon name="calculate" size={24} color="#FFFFFF" />
              <Text style={styles.calculateButtonText}>계산하기</Text>
            </TouchableOpacity>

            {/* Results */}
            {plateConfig && (
              <View style={styles.results}>
                <View style={styles.resultHeader}>
                  <Text style={[styles.resultTitle, { color: theme.text }]}>계산 결과</Text>
                  <View style={styles.resultSummary}>
                    <Text style={[styles.resultTarget, { color: theme.textSecondary }]}>
                      목표: {plateConfig.targetWeight}{unit}
                    </Text>
                    <Text style={[styles.resultActual, { color: theme.success }]}>
                      실제: {plateConfig.totalWeight.toFixed(1)}{unit}
                    </Text>
                    {Math.abs(plateConfig.totalWeight - plateConfig.targetWeight) > 0.1 && (
                      <Text style={[styles.resultDiff, { color: theme.warning }]}>
                        차이: {(plateConfig.totalWeight - plateConfig.targetWeight).toFixed(1)}{unit}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Plate Visualization */}
                {renderPlateVisualization()}

                {/* Plate List */}
                <View style={[styles.plateList, { backgroundColor: theme.background }]}>
                  <Text style={[styles.plateListTitle, { color: theme.text }]}>필요한 원판 (각 사이드)</Text>
                  {plateConfig.plates.map((plate, index) => (
                    <View key={index} style={styles.plateListItem}>
                      <View style={styles.plateListLeft}>
                        <View
                          style={[
                            styles.plateIndicator,
                            { backgroundColor: PLATE_COLORS[plate.weight] || theme.primary, borderColor: theme.border },
                          ]}
                        />
                        <Text style={[styles.plateListWeight, { color: theme.text }]}>
                          {plate.weight}{unit}
                        </Text>
                      </View>
                      <Text style={[styles.plateListCount, { color: theme.text }]}>
                        {plate.count}개
                      </Text>
                    </View>
                  ))}
                  <View style={[styles.plateListTotal, { borderTopColor: theme.border }]}>
                    <Text style={[styles.plateListTotalLabel, { color: theme.textSecondary }]}>각 사이드 총</Text>
                    <Text style={[styles.plateListTotalValue, { color: theme.primary }]}>
                      {plateConfig.eachSide.toFixed(1)}{unit}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  unitToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 18,
  },
  inputUnit: {
    fontSize: 16,
    marginLeft: 8,
  },
  barSection: {
    marginBottom: 20,
  },
  barOptions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  barOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  barOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  barWeightText: {
    fontSize: 10,
    marginTop: 2,
  },
  customBarInput: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 12,
    gap: 12,
  },
  customBarButton: {
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  customBarButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  results: {
    paddingHorizontal: 20,
  },
  resultHeader: {
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultSummary: {
    flexDirection: 'row',
    gap: 16,
  },
  resultTarget: {
    fontSize: 14,
  },
  resultActual: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultDiff: {
    fontSize: 14,
  },
  plateVisualization: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  barContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bar: {
    width: '80%',
    height: 12,
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  platesContainer: {
    alignItems: 'center',
  },
  sideLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  plateStack: {
    alignItems: 'center',
    gap: 8,
  },
  plateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plate: {
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  plateText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  plateCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  plateList: {
    borderRadius: 12,
    padding: 16,
  },
  plateListTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  plateListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  plateListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  plateIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  plateListWeight: {
    fontSize: 16,
    fontWeight: '500',
  },
  plateListCount: {
    fontSize: 16,
  },
  plateListTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
  plateListTotalLabel: {
    fontSize: 14,
  },
  plateListTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});