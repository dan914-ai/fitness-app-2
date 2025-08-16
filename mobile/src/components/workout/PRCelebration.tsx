import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

// Temporary interface until service is restored
interface PRUpdate {
  exerciseName: string;
  newRecord: {
    weight: number;
    reps: number;
    oneRM: number;
  };
  previousRecord?: {
    weight: number;
    reps: number;
  };
  improvement?: {
    weight: number;
    percentage: number;
  };
}

interface PRCelebrationProps {
  visible: boolean;
  prUpdate: PRUpdate | null;
  onDismiss: () => void;
}

export default function PRCelebration({ visible, prUpdate, onDismiss }: PRCelebrationProps) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && prUpdate) {
      // Start animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: -1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [visible, prUpdate]);

  const handleDismiss = () => {
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

  if (!visible || !prUpdate) return null;

  const rotation = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            { backgroundColor: theme.surface },
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { rotate: rotation },
              ],
            },
          ]}
        >
          {/* Trophy Icon */}
          <View style={styles.trophyContainer}>
            <Icon name="emoji-events" size={80} color="#FFD700" />
            <View style={styles.sparkles}>
              <Icon name="auto-awesome" size={24} color="#FFD700" style={styles.sparkle1} />
              <Icon name="auto-awesome" size={20} color="#FFA500" style={styles.sparkle2} />
              <Icon name="auto-awesome" size={16} color="#FFD700" style={styles.sparkle3} />
            </View>
          </View>

          {/* PR Text */}
          <Text style={[styles.title, { color: theme.text }]}>🎉 새로운 기록! 🎉</Text>
          <Text style={[styles.exerciseName, { color: theme.primary }]}>{prUpdate.exerciseName}</Text>

          {/* New Record */}
          <View style={styles.recordContainer}>
            <View style={[styles.recordBox, { backgroundColor: theme.background }]}>
              <Text style={[styles.recordValue, { color: theme.text }]}>
                {prUpdate.newRecord.weight}kg × {prUpdate.newRecord.reps}회
              </Text>
              <Text style={[styles.recordLabel, { color: theme.textSecondary }]}>새 기록</Text>
            </View>

            {prUpdate.previousRecord && (
              <>
                <Icon name="arrow-forward" size={24} color={theme.primary} />
                <View style={[styles.recordBox, { backgroundColor: theme.background }]}>
                  <Text style={[styles.previousValue, { color: theme.textSecondary }]}>
                    {prUpdate.previousRecord.weight}kg × {prUpdate.previousRecord.reps}회
                  </Text>
                  <Text style={[styles.recordLabel, { color: theme.textSecondary }]}>이전 기록</Text>
                </View>
              </>
            )}
          </View>

          {/* Improvement Stats */}
          {prUpdate.improvement && prUpdate.improvement.weight > 0 && (
            <View style={styles.improvementContainer}>
              <View style={[styles.improvementBox, { backgroundColor: theme.success + '20' }]}>
                <Icon name="trending-up" size={20} color={theme.success} />
                <Text style={[styles.improvementText, { color: theme.success }]}>
                  +{prUpdate.improvement.weight.toFixed(1)}kg
                </Text>
              </View>
              <View style={[styles.improvementBox, { backgroundColor: theme.success + '20' }]}>
                <Icon name="percent" size={20} color={theme.success} />
                <Text style={[styles.improvementText, { color: theme.success }]}>
                  +{prUpdate.improvement.percentage.toFixed(1)}%
                </Text>
              </View>
            </View>
          )}

          {/* Estimated 1RM */}
          <View style={[styles.oneRMContainer, { backgroundColor: theme.primary + '10' }]}>
            <Text style={[styles.oneRMLabel, { color: theme.textSecondary }]}>예상 1RM</Text>
            <Text style={[styles.oneRMValue, { color: theme.primary }]}>{prUpdate.newRecord.oneRM.toFixed(1)}kg</Text>
          </View>

          {/* Motivational Message */}
          <Text style={[styles.motivationText, { color: theme.text }]}>
            {prUpdate.previousRecord 
              ? "축하합니다! 꾸준한 노력의 결과입니다! 💪"
              : "첫 기록을 세웠습니다! 앞으로의 발전이 기대됩니다! 🚀"}
          </Text>

          {/* Dismiss Button */}
          <TouchableOpacity
            style={[styles.dismissButton, { backgroundColor: theme.primary }]}
            onPress={handleDismiss}
            activeOpacity={0.8}
          >
            <Text style={styles.dismissButtonText}>계속하기</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Confetti Effect (simplified) */}
        <Animated.View
          style={[
            styles.confettiContainer,
            { opacity: fadeAnim, pointerEvents: 'none' }
          ]}
        >
          {[...Array(20)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.confetti,
                {
                  left: Math.random() * width,
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3'][i % 4],
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, height],
                      }),
                    },
                    {
                      rotate: `${Math.random() * 360}deg`,
                    },
                  ],
                },
              ]}
            />
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 24,
    padding: 32,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  trophyContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  sparkles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle1: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  sparkle2: {
    position: 'absolute',
    bottom: -5,
    left: -10,
  },
  sparkle3: {
    position: 'absolute',
    top: 10,
    left: -20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  recordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  recordBox: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  recordValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  previousValue: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  recordLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  improvementContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  improvementBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  improvementText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  oneRMContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  oneRMLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  oneRMValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  motivationText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  dismissButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  dismissButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});