import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/types';
import { getWorkoutById, WorkoutHistoryItem } from '../../utils/workoutHistory';
import storageService from '../../services/storage.service';
import { supabase } from '../../config/supabase';
import RPEModal from '../../components/RPEModal';

type WorkoutCompleteScreenProps = {
  navigation: StackNavigationProp<HomeStackParamList, 'WorkoutComplete'>;
  route: RouteProp<HomeStackParamList, 'WorkoutComplete'>;
};

export default function WorkoutCompleteScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, 'WorkoutComplete'>>();
  const { workoutId } = route.params;
  
  const [workout, setWorkout] = useState<WorkoutHistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(true);
  const [showRPEModal, setShowRPEModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadWorkoutData();
    getUserId();
  }, [workoutId]);

  useEffect(() => {
    // Show RPE modal after workout data is loaded
    if (workout && userId && !showRating) {
      setShowRPEModal(true);
    }
  }, [workout, userId, showRating]);

  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  };

  const loadWorkoutData = async () => {
    try {
      const workoutData = await getWorkoutById(workoutId);
      setWorkout(workoutData);
    } catch (error) {
      console.error('Error loading workout data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}분`;
  };

  const formatDate = (date: string): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}. ${month}. ${day}.`;
  };

  const formatTime = (date: string): string => {
    const d = new Date(date);
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleRating = (stars: number) => {
    setRating(stars);
    setShowRating(false); // This will trigger the useEffect to show RPE modal
  };

  const handleShare = async () => {
    if (!workout) return;
    
    // Save rating
    try {
      await storageService.saveWorkoutRating(workoutId, rating);
    } catch (error) {
      console.error('Error saving rating:', error);
    }
    
    // Navigate to home - use reset to clear navigation stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeScreen' }],
    });
  };

  const handleSkip = () => {
    // Use reset to clear navigation stack and prevent getting stuck
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeScreen' }],
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>운동 정보를 찾을 수 없습니다</Text>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>홈으로</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.congratsText}>축하합니다!</Text>
          <View style={styles.routineInfo}>
            <Text style={styles.routineName}>{workout.routineName}</Text>
            <Icon name="edit" size={20} color={Colors.textSecondary} style={styles.editIcon} />
          </View>
        </View>

        {/* Workout Info */}
        <View style={styles.workoutInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>시작</Text>
            <View style={styles.infoValue}>
              <Icon name="calendar-today" size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{formatDate(workout.startTime)}</Text>
              <Icon name="schedule" size={16} color={Colors.textSecondary} style={styles.timeIcon} />
              <Text style={styles.infoText}>{formatTime(workout.startTime)}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, {alignItems: 'flex-end'}]}>
            <Text style={styles.infoText}>{formatDuration(workout.duration)}</Text>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <View style={styles.ratingHeader}>
            <Icon name="star" size={24} color={Colors.warning} />
            <Icon name="sentiment-satisfied-alt" size={24} color={Colors.textSecondary} />
          </View>
          
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleRating(star)}
                style={styles.starButton}
              >
                <Icon
                  name="star"
                  size={48}
                  color={star <= rating ? Colors.warning : Colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.ratingText}>운동을 마치며 느낀 점을 메모해보세요.</Text>
        </View>

        {/* Test Button for RPE Modal */}
        {userId && (
          <TouchableOpacity 
            style={[styles.shareButton, { marginBottom: 10 }]} 
            onPress={() => setShowRPEModal(true)}
          >
            <Text style={styles.shareButtonText}>Test RPE Modal</Text>
          </TouchableOpacity>
        )}

        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Icon name="share" size={20} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>공유</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.homeButton} onPress={handleSkip}>
            <Icon name="arrow-forward" size={20} color={Colors.primary} />
            <Text style={styles.homeButtonText}>홈으로</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* RPE Modal */}
      {userId && workout && (
        <RPEModal 
          visible={showRPEModal}
          onClose={() => {
            setShowRPEModal(false);
            // Navigate home after closing RPE modal
            navigation.reset({
              index: 0,
              routes: [{ name: 'HomeScreen' }],
            });
          }}
          workoutData={{
            ...workout,
            exercises: workout.exercises || []
          }}
          userId={userId}
        />
      )}
      
      {/* Simple completion modal - if this is what's showing */}
      <Modal
        visible={false} // Disable any stuck modal
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="check-circle" size={60} color={Colors.success} />
            <Text style={styles.modalTitle}>휴식 완료!</Text>
            <Text style={styles.modalSubtitle}>다음 세트를 시작하세요</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'HomeScreen' }],
                });
              }}
            >
              <Text style={styles.modalButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  congratsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  routineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineName: {
    fontSize: 24,
    color: '#FFFFFF',
    marginRight: 10,
  },
  editIcon: {
    opacity: 0.6,
  },
  workoutInfo: {
    marginBottom: 40,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginRight: 20,
  },
  infoValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  timeIcon: {
    marginLeft: 20,
  },
  ratingSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 30,
  },
  stars: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 40,
  },
  starButton: {
    padding: 5,
  },
  ratingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    paddingVertical: 18,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  homeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 8,
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  skipButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});