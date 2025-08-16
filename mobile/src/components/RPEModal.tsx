import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import progressionService from '../services/progression.service';
import { Colors } from '../constants/colors';

interface RPEModalProps {
  visible: boolean;
  onClose: () => void;
  workoutData: any;
  userId: string;
}

export default function RPEModal({ visible, onClose, workoutData, userId }: RPEModalProps) {
  const [rpe, setRPE] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Format exercises for the API
      const exercises = workoutData.exercises?.map((ex: any) => ({
        sets: ex.completedSets || ex.sets || 3,
        reps: ex.reps || 10,
        weight: ex.weight || 0,
      })) || [];

      const duration = Math.floor((workoutData.duration || 3600) / 60); // Convert to minutes

      await progressionService.logSessionRPE(
        userId,
        rpe,
        exercises,
        duration
      );
      
      onClose();
    } catch (error) {
      console.error('Failed to log RPE:', error);
      alert('운동 평가 저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRPEDescription = (value: number) => {
    const descriptions = [
      '휴식 - 전혀 힘들지 않음',
      '매우 가벼움 - 거의 느끼지 못함',
      '가벼움 - 편안한 속도',
      '가벼움 - 편안함',
      '보통 - 약간의 노력',
      '보통 - 명확한 노력',
      '힘듦 - 어려움',
      '힘듦 - 매우 어려움',
      '매우 힘듦 - 거의 지속 불가',
      '매우 힘듦 - 거의 최대',
      '최대 - 지속 불가능'
    ];
    return descriptions[Math.round(value)];
  };

  const getRPEColor = (value: number) => {
    if (value <= 3) return '#4CAF50'; // Green
    if (value <= 5) return '#2196F3'; // Blue
    if (value <= 7) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
            disabled={isSubmitting}
          >
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>

          <Text style={styles.title}>운동 강도 평가</Text>
          <Text style={styles.subtitle}>오늘 운동은 얼마나 힘드셨나요?</Text>
          
          <View style={[styles.rpeContainer, { backgroundColor: getRPEColor(rpe) + '20' }]}>
            <Text style={[styles.rpeValue, { color: getRPEColor(rpe) }]}>
              {Math.round(rpe)}
            </Text>
            <Text style={[styles.rpeDescription, { color: getRPEColor(rpe) }]}>
              {getRPEDescription(rpe)}
            </Text>
          </View>

          <View style={styles.selectorHeader}>
            <Text style={styles.selectorLabel}>RPE 선택 (0-10)</Text>
            <Text style={styles.scrollHint}>← 좌우로 스크롤 →</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true} 
            style={styles.rpeSelector}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.rpeButtonContainer}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.rpeButton,
                    { backgroundColor: value === rpe ? getRPEColor(value) : '#F0F0F0' }
                  ]}
                  onPress={() => setRPE(value)}
                >
                  <Text style={[
                    styles.rpeButtonText,
                    { color: value === rpe ? 'white' : '#666' }
                  ]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.scaleGuide}>
            <View style={styles.scaleItem}>
              <View style={[styles.scaleDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.scaleText}>0-3: 쉬움</Text>
            </View>
            <View style={styles.scaleItem}>
              <View style={[styles.scaleDot, { backgroundColor: '#2196F3' }]} />
              <Text style={styles.scaleText}>4-5: 보통</Text>
            </View>
            <View style={styles.scaleItem}>
              <View style={[styles.scaleDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.scaleText}>6-7: 힘듦</Text>
            </View>
            <View style={styles.scaleItem}>
              <View style={[styles.scaleDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.scaleText}>8-10: 매우 힘듦</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: getRPEColor(rpe) }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>저장하기</Text>
            )}
          </TouchableOpacity>
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
    width: '90%',
    maxWidth: 400,
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
  rpeContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    borderRadius: 16,
  },
  rpeValue: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  rpeDescription: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: '500',
  },
  selectorHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  selectorLabel: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  scrollHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  rpeSelector: {
    marginVertical: 20,
    maxHeight: 60,
  },
  rpeButtonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    minWidth: 650, // Ensure enough width for all 11 buttons (0-10)
  },
  rpeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  rpeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scaleGuide: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  scaleItem: {
    alignItems: 'center',
  },
  scaleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  scaleText: {
    fontSize: 11,
    color: '#666',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});