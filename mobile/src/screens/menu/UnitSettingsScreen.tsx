import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/colors';
import { MenuStackScreenProps } from '../../navigation/types';
import { safeJsonParse, safeJsonStringify } from '../../utils/safeJsonParse';

type Props = MenuStackScreenProps<'UnitSettings'>;

interface UnitSettings {
  weight: 'kg' | 'lbs';
  distance: 'km' | 'miles';
  height: 'cm' | 'ft';
  temperature: 'celsius' | 'fahrenheit';
}

interface UnitOption {
  key: keyof UnitSettings;
  title: string;
  icon: string;
  options: Array<{
    value: string;
    label: string;
    description: string;
  }>;
}

export default function UnitSettingsScreen({ navigation }: Props) {
  const [settings, setSettings] = useState<UnitSettings>({
    weight: 'kg',
    distance: 'km',
    height: 'cm',
    temperature: 'celsius',
  });

  const unitOptions: UnitOption[] = [
    {
      key: 'weight',
      title: '무게',
      icon: 'fitness-center',
      options: [
        { value: 'kg', label: '킬로그램 (kg)', description: '예: 70kg' },
        { value: 'lbs', label: '파운드 (lbs)', description: '예: 154lbs' },
      ],
    },
    {
      key: 'distance',
      title: '거리',
      icon: 'directions-run',
      options: [
        { value: 'km', label: '킬로미터 (km)', description: '예: 5km' },
        { value: 'miles', label: '마일 (miles)', description: '예: 3.1 miles' },
      ],
    },
    {
      key: 'height',
      title: '키',
      icon: 'height',
      options: [
        { value: 'cm', label: '센티미터 (cm)', description: '예: 175cm' },
        { value: 'ft', label: '피트 (ft)', description: '예: 5\'9"' },
      ],
    },
    {
      key: 'temperature',
      title: '온도',
      icon: 'thermostat',
      options: [
        { value: 'celsius', label: '섭씨 (°C)', description: '예: 25°C' },
        { value: 'fahrenheit', label: '화씨 (°F)', description: '예: 77°F' },
      ],
    },
  ];

  useEffect(() => {
    loadUnitSettings();
  }, []);

  const loadUnitSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('unitSettings');
      if (savedSettings) {
        setSettings(safeJsonParse(savedSettings, defaultSettings));
      }
    } catch (error) {
      console.error('단위 설정 로드 실패:', error);
    }
  };

  const saveUnitSettings = async (newSettings: UnitSettings) => {
    try {
      await AsyncStorage.setItem('unitSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('단위 설정 저장 실패:', error);
    }
  };

  const updateUnit = (key: keyof UnitSettings, value: string) => {
    const newSettings = { ...settings, [key]: value };
    saveUnitSettings(newSettings);
  };

  const renderUnitSection = (unitOption: UnitOption) => (
    <View key={unitOption.key} style={styles.unitSection}>
      <View style={styles.sectionHeader}>
        <Icon name={unitOption.icon} size={24} color={Colors.primary} />
        <Text style={styles.sectionTitle}>{unitOption.title}</Text>
      </View>
      <View style={styles.optionsContainer}>
        {unitOption.options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionItem,
              settings[unitOption.key] === option.value && styles.selectedOption,
            ]}
            onPress={() => updateUnit(unitOption.key, option.value)}
          >
            <View style={styles.optionContent}>
              <Text style={[
                styles.optionLabel,
                settings[unitOption.key] === option.value && styles.selectedOptionText,
              ]}>
                {option.label}
              </Text>
              <Text style={[
                styles.optionDescription,
                settings[unitOption.key] === option.value && styles.selectedOptionDescription,
              ]}>
                {option.description}
              </Text>
            </View>
            {settings[unitOption.key] === option.value && (
              <Icon name="check-circle" size={24} color={Colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const getConversionExamples = () => {
    const examples = [];
    
    if (settings.weight === 'kg') {
      examples.push('100kg = 220lbs');
    } else {
      examples.push('220lbs = 100kg');
    }
    
    if (settings.distance === 'km') {
      examples.push('10km = 6.2 miles');
    } else {
      examples.push('6.2 miles = 10km');
    }
    
    if (settings.height === 'cm') {
      examples.push('180cm = 5\'11"');
    } else {
      examples.push('5\'11" = 180cm');
    }

    return examples;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>단위 설정</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            앱에서 사용할 측정 단위를 선택하세요. 모든 데이터가 선택한 단위로 표시됩니다.
          </Text>
        </View>

        {unitOptions.map(renderUnitSection)}

        <View style={styles.conversionSection}>
          <Text style={styles.conversionTitle}>변환 예시</Text>
          <View style={styles.conversionCard}>
            {getConversionExamples().map((example, index) => (
              <Text key={index} style={styles.conversionExample}>
                • {example}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Icon name="info" size={24} color={Colors.accent} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>단위 변경 안내</Text>
              <Text style={styles.infoText}>
                • 기존 데이터는 자동으로 새로운 단위로 변환됩니다{'\n'}
                • 변환 과정에서 소수점 반올림이 발생할 수 있습니다{'\n'}
                • 서버와의 동기화 시 일시적으로 다른 단위가 표시될 수 있습니다
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
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
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  description: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  unitSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 12,
  },
  optionsContainer: {
    backgroundColor: Colors.surface,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  selectedOption: {
    backgroundColor: Colors.primary + '10',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  selectedOptionDescription: {
    color: Colors.primary,
  },
  conversionSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  conversionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  conversionCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
  },
  conversionExample: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});