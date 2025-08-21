import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  Vibration,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { PRNotification } from '../../services/pr.service';
import Confetti from 'react-native-confetti';

const { width, height } = Dimensions.get('window');

interface EnhancedPRCelebrationProps {
  visible: boolean;
  prData: PRNotification | null;
  onDismiss: () => void;
  milestones?: string[];
}

export default function EnhancedPRCelebration({
  visible,
  prData,
  onDismiss,
  milestones = [],
}: EnhancedPRCelebrationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const confettiRef = useRef<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (visible && prData) {
      // Start animations
      Vibration.vibrate([0, 200, 100, 200, 100, 400]);
      
      // Confetti animation
      if (confettiRef.current) {
        confettiRef.current.startConfetti();
      }

      // Scale and fade in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Rotate trophy
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Show details after initial celebration
      setTimeout(() => setShowDetails(true), 1500);

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      rotateAnim.setValue(0);
      pulseAnim.setValue(1);
      setShowDetails(false);
    }
  }, [visible, prData]);

  const handleDismiss = () => {
    if (confettiRef.current) {
      confettiRef.current.stopConfetti();
    }
    
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!prData) return null;

  const getPRTypeIcon = () => {
    switch (prData.type) {
      case 'weight':
        return 'fitness-center';
      case 'reps':
        return 'repeat';
      case 'volume':
        return 'trending-up';
      default:
        return 'star';
    }
  };

  const getPRTypeLabel = () => {
    switch (prData.type) {
      case 'weight':
        return '최고 중량';
      case 'reps':
        return '최다 반복';
      case 'volume':
        return '최대 볼륨';
      default:
        return '개인 기록';
    }
  };

  const formatValue = (value: number) => {
    switch (prData.type) {
      case 'weight':
        return `${value}kg`;
      case 'reps':
        return `${value}회`;
      case 'volume':
        return `${value.toLocaleString()}kg`;
      default:
        return value.toString();
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg'],
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <BlurView intensity={80} style={styles.container}>
        <Confetti ref={confettiRef} duration={3000} />
        
        <Animated.View
          style={[
            styles.content,
            {
              transform: [
                { scale: scaleAnim },
                { rotate: spin },
              ],
              opacity: fadeAnim,
            },
          ]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Trophy Icon */}
            <Animated.View
              style={[
                styles.trophyContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Icon name="emoji-events" size={80} color="#FFD700" />
            </Animated.View>

            {/* PR Title */}
            <Text style={styles.title}>🎉 새로운 PR! 🎉</Text>
            <Text style={styles.exerciseName}>{prData.exerciseName}</Text>

            {/* PR Details */}
            {showDetails && (
              <Animated.View style={styles.detailsContainer}>
                <View style={styles.prTypeContainer}>
                  <Icon name={getPRTypeIcon()} size={24} color="#FFD700" />
                  <Text style={styles.prTypeLabel}>{getPRTypeLabel()}</Text>
                </View>

                <View style={styles.valuesContainer}>
                  <View style={styles.valueBox}>
                    <Text style={styles.valueLabel}>이전 기록</Text>
                    <Text style={styles.oldValue}>
                      {formatValue(prData.oldValue)}
                    </Text>
                  </View>
                  
                  <Icon name="arrow-forward" size={30} color="#FFD700" />
                  
                  <View style={styles.valueBox}>
                    <Text style={styles.valueLabel}>새 기록</Text>
                    <Text style={styles.newValue}>
                      {formatValue(prData.newValue)}
                    </Text>
                  </View>
                </View>

                {/* Improvement */}
                <View style={styles.improvementContainer}>
                  <Icon name="trending-up" size={20} color="#4CAF50" />
                  <Text style={styles.improvementText}>
                    {prData.improvement.toFixed(1)}% 향상!
                  </Text>
                </View>

                {/* Milestones */}
                {milestones.length > 0 && (
                  <View style={styles.milestonesContainer}>
                    <Text style={styles.milestonesTitle}>달성 마일스톤</Text>
                    {milestones.map((milestone, index) => (
                      <Text key={index} style={styles.milestone}>
                        {milestone}
                      </Text>
                    ))}
                  </View>
                )}
              </Animated.View>
            )}

            {/* Dismiss Button */}
            <Pressable
              style={({ pressed }) => [
                styles.dismissButton,
                pressed && styles.dismissButtonPressed,
              ]}
              onPress={handleDismiss}
            >
              <Text style={styles.dismissButtonText}>축하합니다! 👏</Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    padding: 24,
    alignItems: 'center',
  },
  trophyContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  exerciseName: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  prTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  prTypeLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  valuesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  valueBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  valueLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  oldValue: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  newValue: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  improvementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 16,
  },
  improvementText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  milestonesContainer: {
    width: '100%',
    marginBottom: 16,
  },
  milestonesTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    textAlign: 'center',
  },
  milestone: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 2,
  },
  dismissButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
  },
  dismissButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  dismissButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});