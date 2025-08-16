import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { RecordStackScreenProps } from '../../navigation/types';
import { 
  saveInBodyRecord, 
  calculateBMI, 
  getInBodyStatus, 
  getStatusText,
  InBodyRecord 
} from '../../utils/inbodyHistory';
import { useFocusEffect } from '@react-navigation/native';

type AddInBodyRecordScreenProps = RecordStackScreenProps<'AddInBodyRecord'>;

interface FormData {
  weight: string;
  skeletalMuscleMass: string;
  bodyFatPercentage: string;
  height: string;
}

interface FormErrors {
  weight?: string;
  skeletalMuscleMass?: string;
  bodyFatPercentage?: string;
  height?: string;
}

export default function AddInBodyRecordScreen({ navigation }: AddInBodyRecordScreenProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    weight: '',
    skeletalMuscleMass: '',
    bodyFatPercentage: '',
    height: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedBMI, setCalculatedBMI] = useState<number | null>(null);
  // Calculate BMI when weight or height changes
  useFocusEffect(
    useCallback(() => {
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      
      if (weight > 0 && height > 0) {
        const bmi = calculateBMI(weight, height);
        setCalculatedBMI(bmi);
      } else {
        setCalculatedBMI(null);
      }
    }, [formData.weight, formData.height])
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Weight validation
    const weight = parseFloat(formData.weight);
    if (!formData.weight.trim()) {
      newErrors.weight = '체중을 입력해주세요';
    } else if (isNaN(weight) || weight <= 0) {
      newErrors.weight = '올바른 체중을 입력해주세요';
    } else if (weight > 300) {
      newErrors.weight = '체중은 300kg 이하로 입력해주세요';
    }
    
    // Height validation
    const height = parseFloat(formData.height);
    if (!formData.height.trim()) {
      newErrors.height = '신장을 입력해주세요';
    } else if (isNaN(height) || height <= 0) {
      newErrors.height = '올바른 신장을 입력해주세요';
    } else if (height < 100 || height > 250) {
      newErrors.height = '신장은 100-250cm 사이로 입력해주세요';
    }
    
    // Skeletal muscle mass validation
    const muscleMass = parseFloat(formData.skeletalMuscleMass);
    if (!formData.skeletalMuscleMass.trim()) {
      newErrors.skeletalMuscleMass = '골격근량을 입력해주세요';
    } else if (isNaN(muscleMass) || muscleMass <= 0) {
      newErrors.skeletalMuscleMass = '올바른 골격근량을 입력해주세요';
    } else if (muscleMass > weight) {
      newErrors.skeletalMuscleMass = '골격근량은 체중보다 작아야 합니다';
    }
    
    // Body fat percentage validation
    const bodyFat = parseFloat(formData.bodyFatPercentage);
    if (!formData.bodyFatPercentage.trim()) {
      newErrors.bodyFatPercentage = '체지방률을 입력해주세요';
    } else if (isNaN(bodyFat) || bodyFat < 0) {
      newErrors.bodyFatPercentage = '올바른 체지방률을 입력해주세요';
    } else if (bodyFat > 60) {
      newErrors.bodyFatPercentage = '체지방률은 60% 이하로 입력해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const recordData = {
        date: selectedDate.toISOString().split('T')[0],
        weight: parseFloat(formData.weight),
        skeletalMuscleMass: parseFloat(formData.skeletalMuscleMass),
        bodyFatPercentage: parseFloat(formData.bodyFatPercentage),
        height: parseFloat(formData.height),
      };
      
      await saveInBodyRecord(recordData);
      
      Alert.alert(
        '저장 완료',
        '인바디 기록이 성공적으로 저장되었습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving InBody record:', error);
      Alert.alert(
        '저장 실패',
        '인바디 기록 저장 중 오류가 발생했습니다. 다시 시도해주세요.',
        [{ text: '확인' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const finalValue = numericValue.split('.').slice(0, 2).join('.');
    
    setFormData(prev => ({
      ...prev,
      [field]: finalValue,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const renderFormField = (
    field: keyof FormData,
    label: string,
    placeholder: string,
    unit: string,
    maxLength?: number,
    keyboardType: 'default' | 'numeric' | 'decimal-pad' = 'decimal-pad'
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors[field] && styles.inputError]}
          value={formData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          keyboardType={keyboardType}
          maxLength={maxLength || 6}
          editable={!isLoading}
        />
        <Text style={styles.inputUnit}>{unit}</Text>
      </View>
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  const renderStatusPreview = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const bodyFat = parseFloat(formData.bodyFatPercentage);
    const muscleMass = parseFloat(formData.skeletalMuscleMass);
    
    // Only show preview if we have BMI
    if (!calculatedBMI) return null;

    return (
      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>예상 결과</Text>
        <View style={styles.previewGrid}>
          <View style={styles.previewItem}>
            <Text style={styles.previewLabel}>BMI</Text>
            <Text style={styles.previewValue}>{calculatedBMI.toFixed(1)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusText('bmi', calculatedBMI).color }]}>
              <Text style={styles.statusText}>{getStatusText('bmi', calculatedBMI).label}</Text>
            </View>
          </View>
          
          {bodyFat > 0 && (
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>체지방률</Text>
              <Text style={styles.previewValue}>{bodyFat}%</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusText('bodyFat', bodyFat).color }]}>
                <Text style={styles.statusText}>{getStatusText('bodyFat', bodyFat).label}</Text>
              </View>
            </View>
          )}
          
          {muscleMass > 0 && (
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>근육량</Text>
              <Text style={styles.previewValue}>{muscleMass}kg</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusText('muscleMass', muscleMass).color }]}>
                <Text style={styles.statusText}>{getStatusText('muscleMass', muscleMass).label}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>인바디 기록 추가</Text>
          <Text style={styles.subtitle}>정확한 수치를 입력해주세요</Text>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>측정 날짜</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            disabled={isLoading}
          >
            <Icon name="event" size={24} color={Colors.primary} />
            <Text style={styles.dateText}>
              {selectedDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Icon name="arrow-drop-down" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>측정 항목</Text>
          
          {renderFormField('weight', '체중', '70.5', 'kg')}
          {renderFormField('height', '신장', '175', 'cm')}
          {renderFormField('skeletalMuscleMass', '골격근량', '30.2', 'kg')}
          {renderFormField('bodyFatPercentage', '체지방률', '15.5', '%')}
        </View>

        {/* Status Preview */}
        {renderStatusPreview()}

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="save" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>저장</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    padding: 16,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputUnit: {
    fontSize: 16,
    color: Colors.textSecondary,
    paddingRight: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  previewContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  previewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  previewLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});