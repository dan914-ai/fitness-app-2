import React, { useState } from 'react';
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
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { RecordStackScreenProps } from '../../navigation/types';
import { saveInBodyRecord } from '../../utils/inbodyHistory';

type AddInBodyRecordScreenProps = RecordStackScreenProps<'AddInBodyRecord'>;

interface FormData {
  weight: string;
  skeletalMuscleMass: string;
  bodyFatMass: string;
  bodyFatPercentage: string;
  height: string;
  bmi: string;
}

export default function AddInBodyRecordScreen({ navigation }: AddInBodyRecordScreenProps) {
  const [formData, setFormData] = useState<FormData>({
    weight: '',
    skeletalMuscleMass: '',
    bodyFatMass: '',
    bodyFatPercentage: '',
    height: '',
    bmi: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    console.log('Save button pressed');
    console.log('Form data:', formData);
    
    // Basic validation
    if (!formData.weight || !formData.height || !formData.skeletalMuscleMass || !formData.bodyFatMass || !formData.bodyFatPercentage || !formData.bmi) {
      Alert.alert('오류', '모든 항목을 입력해주세요.');
      return;
    }
    
    // Validate numeric values
    const numericFields = ['weight', 'height', 'skeletalMuscleMass', 'bodyFatMass', 'bodyFatPercentage', 'bmi'];
    for (const field of numericFields) {
      const value = parseFloat(formData[field as keyof FormData]);
      if (isNaN(value) || value <= 0) {
        Alert.alert('오류', `${field} 값이 올바르지 않습니다.`);
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      const recordData = {
        date: new Date().toISOString().split('T')[0],
        weight: parseFloat(formData.weight),
        skeletalMuscleMass: parseFloat(formData.skeletalMuscleMass),
        bodyFatMass: parseFloat(formData.bodyFatMass),
        bodyFatPercentage: parseFloat(formData.bodyFatPercentage),
        height: parseFloat(formData.height),
        bmi: parseFloat(formData.bmi),
      };
      
      console.log('Saving record data:', recordData);
      await saveInBodyRecord(recordData);
      console.log('Record saved successfully');
      
      // Navigate to success screen
      navigation.replace('InBodySuccess', { recordData });
    } catch (error) {
      console.error('Error saving InBody record:', error);
      Alert.alert('저장 실패', `오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setFormData(prev => ({ ...prev, [field]: numericValue }));
  };


  const renderFormField = (field: keyof FormData, label: string, placeholder: string, unit: string) => {
    const isEmpty = !formData[field];
    
    return (
      <View style={styles.fieldContainer}>
        <View style={styles.fieldLabelContainer}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.requiredMark}>*</Text>
        </View>
        <View style={[styles.inputContainer, isEmpty && styles.inputContainerEmpty]}>
          <TextInput
            style={styles.input}
            value={formData[field]}
            onChangeText={(value) => handleInputChange(field, value)}
            placeholder={placeholder}
            placeholderTextColor={Colors.textLight}
            keyboardType="decimal-pad"
            editable={!isLoading}
          />
          <Text style={styles.inputUnit}>{unit}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>인바디 기록 추가</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>측정 항목</Text>
          <Text style={styles.helperText}>모든 항목은 필수 입력사항입니다</Text>
          
          {renderFormField('weight', '체중', '70.5', 'kg')}
          {renderFormField('height', '신장', '175', 'cm')}
          {renderFormField('skeletalMuscleMass', '골격근량', '30.2', 'kg')}
          {renderFormField('bodyFatMass', '체지방량', '10.9', 'kg')}
          {renderFormField('bodyFatPercentage', '체지방률', '15.5', '%')}
          {renderFormField('bmi', 'BMI', '22.5', '')}
        </View>
      </ScrollView>

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
          onPress={() => {
            console.log('TouchableOpacity onPress triggered');
            handleSave();
          }}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  requiredMark: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 4,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputContainerEmpty: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    padding: 16,
  },
  inputUnit: {
    fontSize: 16,
    color: Colors.textSecondary,
    paddingRight: 16,
    fontWeight: '500',
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