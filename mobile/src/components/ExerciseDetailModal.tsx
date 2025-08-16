import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ExerciseData } from '../data/exerciseDatabase';
import { gifService } from '../services/gif.service';

interface ExerciseDetailModalProps {
  exercise: ExerciseData | null;
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  visible,
  onClose,
}) => {
  const [gifLoading, setGifLoading] = useState(true);
  const [gifError, setGifError] = useState(false);
  const [currentGifUrlIndex, setCurrentGifUrlIndex] = useState(0);

  if (!exercise) return null;

  // Get both possible Supabase URLs (with hyphens and underscores)
  const supabaseGifUrls = gifService.getGifUrlWithFallback(exercise.id);
  
  // Build array of all possible GIF URLs to try
  const gifUrls = [
    ...supabaseGifUrls,
    exercise.media?.gifUrl
  ].filter(Boolean);
  
  const gifUrl = gifUrls[currentGifUrlIndex];

  const handleGifLoad = () => {
    setGifLoading(false);
    setGifError(false);
  };

  const handleGifError = () => {
    // Try next URL if available
    if (currentGifUrlIndex < gifUrls.length - 1) {
      setCurrentGifUrlIndex(currentGifUrlIndex + 1);
      setGifLoading(true);
    } else {
      setGifLoading(false);
      setGifError(true);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>운동 상세</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Exercise Title */}
          <View style={styles.titleSection}>
            <Text style={styles.exerciseName}>{exercise.name.korean}</Text>
          </View>

          {/* Exercise GIF */}
          <View style={styles.gifContainer}>
            {gifUrl ? (
              <>
                {gifLoading && (
                  <View style={styles.gifPlaceholder}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>GIF 로딩 중...</Text>
                  </View>
                )}
                {gifError && (
                  <View style={styles.gifPlaceholder}>
                    <Text style={styles.errorText}>🎬</Text>
                    <Text style={styles.errorText}>GIF를 불러올 수 없습니다</Text>
                  </View>
                )}
                <Image
                  source={{ uri: gifUrl }}
                  style={[styles.exerciseGif, { opacity: gifLoading ? 0 : 1 }]}
                  onLoad={handleGifLoad}
                  onError={handleGifError}
                  resizeMode="contain"
                />
              </>
            ) : (
              <View style={styles.gifPlaceholder}>
                <Text style={styles.errorText}>🏋️‍♂️</Text>
                <Text style={styles.errorText}>GIF 준비 중</Text>
              </View>
            )}
          </View>

          {/* Exercise Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>운동 정보</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>분류</Text>
                <Text style={styles.infoValue}>
                  {exercise.category === 'compound' ? '복합운동' : '고립운동'}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>난이도</Text>
                <Text style={styles.infoValue}>
                  {exercise.difficulty === 'beginner' ? '초급자' : 
                   exercise.difficulty === 'intermediate' ? '중급자' : '고급자'}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>운동 설명</Text>
            <Text style={styles.description}>{exercise.description.korean}</Text>
          </View>

          {/* Target Muscles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>타겟 근육</Text>
            <View style={styles.muscleSection}>
              <Text style={styles.muscleLabel}>주동근:</Text>
              <Text style={styles.muscleValue}>
                {exercise.targetMuscles.primary.join(', ')}
              </Text>
            </View>
            {exercise.targetMuscles.secondary.length > 0 && (
              <View style={styles.muscleSection}>
                <Text style={styles.muscleLabel}>보조근:</Text>
                <Text style={styles.muscleValue}>
                  {exercise.targetMuscles.secondary.join(', ')}
                </Text>
              </View>
            )}
            {exercise.targetMuscles.stabilizers && exercise.targetMuscles.stabilizers.length > 0 && (
              <View style={styles.muscleSection}>
                <Text style={styles.muscleLabel}>안정근:</Text>
                <Text style={styles.muscleValue}>
                  {exercise.targetMuscles.stabilizers.join(', ')}
                </Text>
              </View>
            )}
          </View>

          {/* Equipment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>필요 장비</Text>
            <Text style={styles.equipment}>{exercise.equipment.join(', ')}</Text>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>운동 방법</Text>
            {exercise.instructions.korean.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>{`${index + 1}.`}</Text>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>

          {/* Sets & Reps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>세트 & 반복수</Text>
            <View style={styles.setsRepsGrid}>
              <View style={styles.setsRepsItem}>
                <Text style={styles.setsRepsLabel}>권장</Text>
                <Text style={styles.setsRepsValue}>
                  {exercise.sets.recommended} × {exercise.reps.recommended}
                </Text>
              </View>
              <View style={styles.setsRepsItem}>
                <Text style={styles.setsRepsLabel}>초급자</Text>
                <Text style={styles.setsRepsValue}>
                  {exercise.sets.beginner} × {exercise.reps.beginner}
                </Text>
              </View>
              <View style={styles.setsRepsItem}>
                <Text style={styles.setsRepsLabel}>중급자</Text>
                <Text style={styles.setsRepsValue}>
                  {exercise.sets.intermediate} × {exercise.reps.intermediate}
                </Text>
              </View>
              <View style={styles.setsRepsItem}>
                <Text style={styles.setsRepsLabel}>고급자</Text>
                <Text style={styles.setsRepsValue}>
                  {exercise.sets.advanced} × {exercise.reps.advanced}
                </Text>
              </View>
            </View>
          </View>

          {/* Tips */}
          {exercise.tips && exercise.tips.korean.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>운동 팁</Text>
              {exercise.tips.korean.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={styles.tipBullet}>💡</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Common Mistakes */}
          {exercise.commonMistakes && exercise.commonMistakes.korean.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>주의사항</Text>
              {exercise.commonMistakes.korean.map((mistake, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={styles.tipBullet}>⚠️</Text>
                  <Text style={styles.tipText}>{mistake}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  exerciseRomanization: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  exerciseEnglish: {
    fontSize: 14,
    color: '#888',
  },
  gifContainer: {
    height: 200,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
    position: 'relative',
  },
  exerciseGif: {
    width: '100%',
    height: '100%',
  },
  gifPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoSection: {
    marginBottom: 25,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  muscleSection: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  muscleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 60,
  },
  muscleValue: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  equipment: {
    fontSize: 16,
    color: '#555',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    width: 25,
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    flex: 1,
  },
  setsRepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  setsRepsItem: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  setsRepsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  setsRepsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipBullet: {
    fontSize: 16,
    marginRight: 10,
    width: 25,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    flex: 1,
  },
  bottomSpacing: {
    height: 40,
  },
});