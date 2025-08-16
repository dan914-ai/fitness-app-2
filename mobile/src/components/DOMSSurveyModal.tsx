import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import progressionService from '../services/progression.service';
import storageService from '../services/storage.service';
import { Colors } from '../constants/colors';
import { supabase } from '../config/supabase';

interface DOMSSurveyModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

interface MuscleGroup {
  key: string;
  name: string;
  icon: string;
}

const muscleGroups: MuscleGroup[] = [
  { key: 'chest_soreness', name: '가슴', icon: 'fitness-center' },
  { key: 'back_soreness', name: '등', icon: 'accessibility-new' },
  { key: 'legs_soreness', name: '다리', icon: 'directions-run' },
  { key: 'arms_soreness', name: '팔', icon: 'sports-martial-arts' },
  { key: 'shoulders_soreness', name: '어깨', icon: 'sports-gymnastics' },
  { key: 'core_soreness', name: '복근', icon: 'center-focus-strong' },
];

export default function DOMSSurveyModal({ visible, onClose, userId }: DOMSSurveyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyData, setSurveyData] = useState({
    chest_soreness: 0,
    back_soreness: 0,
    legs_soreness: 0,
    arms_soreness: 0,
    shoulders_soreness: 0,
    core_soreness: 0,
    overall_soreness: 0,
    sleep_quality: 7,
    energy_level: 7,
    motivation: 7,
  });

  // Log when modal opens
  React.useEffect(() => {
    if (visible) {
      console.log('DOMS Modal opened with initial state:', surveyData);
    }
  }, [visible]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log('Current surveyData before submit:', surveyData);
    try {
      const result = await progressionService.submitDOMSSurvey(userId, surveyData);
      console.log('DOMS submission result:', result);
      
      // Save today's date to prevent showing again
      const today = new Date().toISOString().split('T')[0];
      await storageService.setGenericItem('lastDOMSSurvey', today);
      
      console.log('Saved last survey date:', today);
      alert('Recovery assessment saved successfully!');
      
      // Reset form data after successful save
      setSurveyData({
        chest_soreness: 0,
        back_soreness: 0,
        legs_soreness: 0,
        arms_soreness: 0,
        shoulders_soreness: 0,
        core_soreness: 0,
        overall_soreness: 0,
        sleep_quality: 7,
        energy_level: 7,
        motivation: 7,
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to submit DOMS survey - Full error:', error);
      // Only show error if it's a real error, not an empty object
      if (error && Object.keys(error).length > 0) {
        alert('Failed to save recovery assessment. Error: ' + ((error as any)?.message || JSON.stringify(error)));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateValue = (key: string, value: number) => {
    console.log(`Updating ${key} to ${value}`);
    setSurveyData(prev => {
      const newData = { ...prev, [key]: Math.round(value) };
      console.log('New survey data:', newData);
      return newData;
    });
  };

  const getSorenessColor = (value: number) => {
    if (value <= 2) return '#4CAF50'; // Green
    if (value <= 4) return '#FFC107'; // Yellow
    if (value <= 6) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getWellnessColor = (value: number) => {
    if (value >= 8) return '#4CAF50'; // Green
    if (value >= 6) return '#FFC107'; // Yellow
    if (value >= 4) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>

            <Text style={styles.title}>회복 상태 체크</Text>
            <Text style={styles.subtitle}>오늘 아침 몸 상태는 어떠신가요?</Text>

            {/* Muscle Soreness Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>근육 통증 (0: 없음 - 10: 매우 심함)</Text>
              
              {muscleGroups.map((muscle) => (
                <View key={muscle.key} style={styles.muscleItem}>
                  <View style={styles.muscleHeader}>
                    <Icon name={muscle.icon as any} size={24} color="#666" />
                    <Text style={styles.muscleName}>{muscle.name}</Text>
                    <View style={[styles.valueBox, { backgroundColor: getSorenessColor(surveyData[muscle.key as keyof typeof surveyData]) + '20' }]}>
                      <Text style={[styles.valueText, { color: getSorenessColor(surveyData[muscle.key as keyof typeof surveyData]) }]}>
                        {surveyData[muscle.key as keyof typeof surveyData]}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.numberSelector}>
                    <TouchableOpacity
                      style={styles.numberButton}
                      onPress={() => updateValue(muscle.key, Math.max(0, surveyData[muscle.key as keyof typeof surveyData] - 1))}
                    >
                      <Icon name="remove" size={24} color="#666" />
                    </TouchableOpacity>
                    <View style={styles.numberRange}>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <TouchableOpacity
                          key={num}
                          style={[
                            styles.numberOption,
                            surveyData[muscle.key as keyof typeof surveyData] === num && { backgroundColor: getSorenessColor(num) + '40' }
                          ]}
                          onPress={() => updateValue(muscle.key, num)}
                        >
                          <Text style={[
                            styles.numberText,
                            surveyData[muscle.key as keyof typeof surveyData] === num && { color: getSorenessColor(num), fontWeight: 'bold' }
                          ]}>
                            {num}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity
                      style={styles.numberButton}
                      onPress={() => updateValue(muscle.key, Math.min(10, surveyData[muscle.key as keyof typeof surveyData] + 1))}
                    >
                      <Icon name="add" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Overall Soreness */}
              <View style={[styles.muscleItem, styles.overallItem]}>
                <View style={styles.muscleHeader}>
                  <Icon name="person" size={24} color="#666" />
                  <Text style={styles.muscleName}>전체적인 통증</Text>
                  <View style={[styles.valueBox, { backgroundColor: getSorenessColor(surveyData.overall_soreness) + '20' }]}>
                    <Text style={[styles.valueText, { color: getSorenessColor(surveyData.overall_soreness) }]}>
                      {surveyData.overall_soreness}
                    </Text>
                  </View>
                </View>
                <View style={styles.numberSelector}>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => updateValue('overall_soreness', Math.max(0, surveyData.overall_soreness - 1))}
                  >
                    <Icon name="remove" size={24} color="#666" />
                  </TouchableOpacity>
                  <View style={styles.numberRange}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <TouchableOpacity
                        key={num}
                        style={[
                          styles.numberOption,
                          surveyData.overall_soreness === num && { backgroundColor: getSorenessColor(num) + '40' }
                        ]}
                        onPress={() => updateValue('overall_soreness', num)}
                      >
                        <Text style={[
                          styles.numberText,
                          surveyData.overall_soreness === num && { color: getSorenessColor(num), fontWeight: 'bold' }
                        ]}>
                          {num}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => updateValue('overall_soreness', Math.min(10, surveyData.overall_soreness + 1))}
                  >
                    <Icon name="add" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Wellness Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>전반적인 컨디션 (1: 매우 나쁨 - 10: 매우 좋음)</Text>
              
              {/* Sleep Quality */}
              <View style={styles.wellnessItem}>
                <View style={styles.muscleHeader}>
                  <Icon name="bedtime" size={24} color="#666" />
                  <Text style={styles.muscleName}>수면 질</Text>
                  <View style={[styles.valueBox, { backgroundColor: getWellnessColor(surveyData.sleep_quality) + '20' }]}>
                    <Text style={[styles.valueText, { color: getWellnessColor(surveyData.sleep_quality) }]}>
                      {surveyData.sleep_quality}
                    </Text>
                  </View>
                </View>
                <View style={styles.numberSelector}>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => updateValue('sleep_quality', Math.max(1, surveyData.sleep_quality - 1))}
                  >
                    <Icon name="remove" size={24} color="#666" />
                  </TouchableOpacity>
                  <View style={styles.numberRange}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <TouchableOpacity
                        key={num}
                        style={[
                          styles.numberOption,
                          surveyData.sleep_quality === num && { backgroundColor: getWellnessColor(num) + '40' }
                        ]}
                        onPress={() => updateValue('sleep_quality', num)}
                      >
                        <Text style={[
                          styles.numberText,
                          surveyData.sleep_quality === num && { color: getWellnessColor(num), fontWeight: 'bold' }
                        ]}>
                          {num}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => updateValue('sleep_quality', Math.min(10, surveyData.sleep_quality + 1))}
                  >
                    <Icon name="add" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Energy Level */}
              <View style={styles.wellnessItem}>
                <View style={styles.muscleHeader}>
                  <Icon name="battery-charging-full" size={24} color="#666" />
                  <Text style={styles.muscleName}>에너지 레벨</Text>
                  <View style={[styles.valueBox, { backgroundColor: getWellnessColor(surveyData.energy_level) + '20' }]}>
                    <Text style={[styles.valueText, { color: getWellnessColor(surveyData.energy_level) }]}>
                      {surveyData.energy_level}
                    </Text>
                  </View>
                </View>
                <View style={styles.numberSelector}>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => updateValue('energy_level', Math.max(1, surveyData.energy_level - 1))}
                  >
                    <Icon name="remove" size={24} color="#666" />
                  </TouchableOpacity>
                  <View style={styles.numberRange}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <TouchableOpacity
                        key={num}
                        style={[
                          styles.numberOption,
                          surveyData.energy_level === num && { backgroundColor: getWellnessColor(num) + '40' }
                        ]}
                        onPress={() => updateValue('energy_level', num)}
                      >
                        <Text style={[
                          styles.numberText,
                          surveyData.energy_level === num && { color: getWellnessColor(num), fontWeight: 'bold' }
                        ]}>
                          {num}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => updateValue('energy_level', Math.min(10, surveyData.energy_level + 1))}
                  >
                    <Icon name="add" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Motivation */}
              <View style={styles.wellnessItem}>
                <View style={styles.muscleHeader}>
                  <Icon name="trending-up" size={24} color="#666" />
                  <Text style={styles.muscleName}>운동 의욕</Text>
                  <View style={[styles.valueBox, { backgroundColor: getWellnessColor(surveyData.motivation) + '20' }]}>
                    <Text style={[styles.valueText, { color: getWellnessColor(surveyData.motivation) }]}>
                      {surveyData.motivation}
                    </Text>
                  </View>
                </View>
                <View style={styles.numberSelector}>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => updateValue('motivation', Math.max(1, surveyData.motivation - 1))}
                  >
                    <Icon name="remove" size={24} color="#666" />
                  </TouchableOpacity>
                  <View style={styles.numberRange}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <TouchableOpacity
                        key={num}
                        style={[
                          styles.numberOption,
                          surveyData.motivation === num && { backgroundColor: getWellnessColor(num) + '40' }
                        ]}
                        onPress={() => updateValue('motivation', num)}
                      >
                        <Text style={[
                          styles.numberText,
                          surveyData.motivation === num && { color: getWellnessColor(num), fontWeight: 'bold' }
                        ]}>
                          {num}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => updateValue('motivation', Math.min(10, surveyData.motivation + 1))}
                  >
                    <Icon name="add" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>


            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: Colors.primary }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>저장하기</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '95%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  muscleItem: {
    marginBottom: 16,
  },
  overallItem: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  muscleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  muscleName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
  valueBox: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  numberSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  numberButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberRange: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  numberOption: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 12,
    color: '#666',
  },
  wellnessItem: {
    marginBottom: 16,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});