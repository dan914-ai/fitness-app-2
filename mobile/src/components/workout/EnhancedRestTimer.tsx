import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Vibration,
  Animated,
  Dimensions,
  ScrollView,
  TextInput,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDesignSystem } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { BlurView } from 'expo-blur';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface EnhancedRestTimerProps {
  isActive: boolean;
  onComplete?: () => void;
  onDismiss?: () => void;
  exerciseName?: string;
  setNumber?: number;
}

const PRESET_TIMES = [
  { seconds: 60, label: '1분', description: '가벼운 세트' },
  { seconds: 120, label: '2분', description: '일반 세트' },
  { seconds: 180, label: '3분', description: '고강도 세트' },
];

const MOTIVATIONAL_MESSAGES = [
  "💪 거의 다 됐어요!",
  "🔥 다음 세트 준비!",
  "⚡ 힘을 모으세요!",
  "🎯 집중하세요!",
  "💯 최고의 세트를 위해!",
];

export default function EnhancedRestTimer({ 
  isActive, 
  onComplete, 
  onDismiss,
  exerciseName = "운동",
  setNumber = 1
}: EnhancedRestTimerProps) {
  const theme = useDesignSystem();
  // Fixed: Modal now fully controlled by parent's isActive prop
  const [selectedTime, setSelectedTime] = useState(90);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Reset states when modal is opened/closed
  useEffect(() => {
    if (isActive) {
      // Reset to selection screen when opening
      setIsRunning(false);
      setIsPaused(false);
      setRemainingTime(0);
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, fadeAnim]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            completeTimer();
            return 0;
          }
          
          // Pulse animation at 10, 5, 3, 2, 1
          if (prev <= 10) {
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 1.1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();
            
            // Vibrate on last 3 seconds
            if (prev <= 3) {
              Vibration.vibrate(100);
            }
          }
          
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  useEffect(() => {
    // Update progress animation
    if (selectedTime > 0) {
      const progress = 1 - (remainingTime / selectedTime);
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [remainingTime, selectedTime, progressAnim]);

  const startTimer = (time?: number) => {
    const duration = time || selectedTime;
    setRemainingTime(duration);
    setIsRunning(true);
    setIsPaused(false);
    Vibration.vibrate(100);
    
    // Schedule notification
    scheduleRestNotification(duration);
  };

  const pauseTimer = () => {
    setIsPaused(true);
    Vibration.vibrate([0, 100, 100, 100]);
  };

  const resumeTimer = () => {
    setIsPaused(false);
    Vibration.vibrate(100);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setRemainingTime(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const completeTimer = async () => {
    stopTimer();
    Vibration.vibrate([0, 200, 100, 200, 100, 200]);
    
    // Show completion notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "휴식 시간 종료! 💪",
        body: `${exerciseName} ${setNumber}세트 시작하세요!`,
        sound: true,
      },
      trigger: null,
    });
    
    // Reset states
    setIsRunning(false);
    setIsPaused(false);
    setRemainingTime(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Call onComplete to notify parent
    onComplete?.();
  };

  const scheduleRestNotification = async (seconds: number) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "휴식 중... ⏱️",
        body: `${Math.floor(seconds / 60)}분 ${seconds % 60}초 휴식`,
      },
      trigger: {
        seconds: Math.max(seconds - 10, 1),
      },
    });
  };

  const closeModal = () => {
    // Reset everything when closing
    setIsRunning(false);
    setIsPaused(false);
    setRemainingTime(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Tell parent to close the modal
    onDismiss?.();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMotivationalMessage = (): string => {
    if (remainingTime <= 10 && remainingTime > 0) {
      return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
    }
    return `${exerciseName} - ${setNumber}세트 휴식`;
  };

  const progress = selectedTime > 0 ? (1 - (remainingTime / selectedTime)) : 0;

  return (
    <Modal
      visible={isActive}
      transparent
      animationType="none"
      onRequestClose={closeModal}
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <BlurView intensity={80} style={StyleSheet.absoluteFillObject}>
          <TouchableOpacity 
            style={styles.overlayTouch}
            activeOpacity={1}
            onPress={closeModal}
          />
        </BlurView>
        
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [
                { scale: fadeAnim },
                { translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })}
              ]
            }
          ]}
        >
          <LinearGradient
            colors={[theme.colors.semantic.surface.paper, theme.colors.semantic.surface.elevated]}
            style={styles.content}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeModal}
            >
              <Icon name="close" size={24} color={theme.colors.semantic.text.secondary} />
            </TouchableOpacity>

            <Text style={[styles.title, { color: theme.colors.semantic.text.primary }]}>
              {getMotivationalMessage()}
            </Text>

            {/* Unified interface - both timer selection and countdown visible */}
            <Text style={[styles.subtitle, { color: theme.colors.semantic.text.secondary }]}>
              휴식 시간을 선택하세요
            </Text>
            
            {/* Timer preset selection - vertical layout */}
            <View style={styles.presetContainer}>
              {PRESET_TIMES.map((preset) => (
                <TouchableOpacity
                  key={preset.seconds}
                  style={[
                    styles.presetButton,
                    {
                      backgroundColor: selectedTime === preset.seconds
                        ? theme.colors.semantic.primary.main
                        : theme.colors.semantic.surface.elevated,
                      borderColor: selectedTime === preset.seconds
                        ? theme.colors.semantic.primary.main
                        : theme.colors.semantic.divider,
                    }
                  ]}
                  onPress={() => {
                    setSelectedTime(preset.seconds);
                    // If timer is running, update the remaining time
                    if (isRunning) {
                      setRemainingTime(preset.seconds);
                      setIsPaused(false);
                    }
                  }}
                >
                  <Text style={[
                    styles.presetTime,
                    { 
                      color: selectedTime === preset.seconds
                        ? '#FFFFFF'
                        : theme.colors.semantic.text.primary
                    }
                  ]}>
                    {preset.label}
                  </Text>
                  <Text style={[
                    styles.presetDescription,
                    { 
                      color: selectedTime === preset.seconds
                        ? '#FFFFFF'
                        : theme.colors.semantic.text.secondary
                    }
                  ]}>
                    {preset.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom time button */}
            <TouchableOpacity
              style={[
                styles.presetButton,
                {
                  backgroundColor: showCustomInput
                    ? theme.colors.semantic.primary.main
                    : theme.colors.semantic.surface.elevated,
                  borderColor: showCustomInput
                    ? theme.colors.semantic.primary.main
                    : theme.colors.semantic.divider,
                }
              ]}
              onPress={() => setShowCustomInput(!showCustomInput)}
            >
              <Icon name="edit" size={20} color={showCustomInput ? '#FFFFFF' : theme.colors.semantic.text.primary} />
              <Text style={[
                styles.presetTime,
                { color: showCustomInput ? '#FFFFFF' : theme.colors.semantic.text.primary }
              ]}>
                사용자 설정
              </Text>
              <Text style={[
                styles.presetDescription,
                { color: showCustomInput ? '#FFFFFF' : theme.colors.semantic.text.secondary }
              ]}>
                원하는 시간 입력
              </Text>
            </TouchableOpacity>
            
            {showCustomInput && (
              <View style={styles.customInputContainer}>
                <TextInput
                  style={[
                    styles.customInput,
                    { 
                      backgroundColor: theme.colors.semantic.surface.elevated,
                      color: theme.colors.semantic.text.primary,
                      borderColor: theme.colors.semantic.divider,
                    }
                  ]}
                  placeholder="초 단위 입력 (예: 90)"
                  placeholderTextColor={theme.colors.semantic.text.secondary}
                  value={customTime}
                  onChangeText={setCustomTime}
                  keyboardType="numeric"
                  maxLength={4}
                />
                <TouchableOpacity
                  style={[
                    styles.customSetButton,
                    { backgroundColor: theme.colors.semantic.primary.main }
                  ]}
                  onPress={() => {
                    const seconds = parseInt(customTime);
                    if (seconds > 0 && seconds <= 9999) {
                      setSelectedTime(seconds);
                      setShowCustomInput(false);
                      setCustomTime('');
                      if (isRunning) {
                        setRemainingTime(seconds);
                        setIsPaused(false);
                      }
                    }
                  }}
                >
                  <Text style={styles.customSetButtonText}>설정</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Timer display - always visible */}
            <View style={styles.timerContainer}>
              <View style={styles.progressRing}>
                <View style={styles.progressBackground}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: remainingTime <= 10 && isRunning
                          ? theme.colors.semantic.error.main
                          : theme.colors.semantic.primary.main,
                        width: `${progress * 100}%`,
                      }
                    ]}
                  />
                </View>
              </View>

              <Animated.Text 
                style={[
                  styles.timerText,
                  { 
                    color: remainingTime <= 10 && isRunning
                      ? theme.colors.semantic.error.main
                      : theme.colors.semantic.text.primary,
                    transform: [{ scale: scaleAnim }]
                  }
                ]}
              >
                {isRunning ? formatTime(remainingTime) : formatTime(selectedTime)}
              </Animated.Text>

              {remainingTime <= 10 && remainingTime > 0 && isRunning && (
                <Animated.Text style={[
                  styles.countdownText,
                  { 
                    color: theme.colors.semantic.error.main,
                    opacity: scaleAnim.interpolate({
                      inputRange: [1, 1.1],
                      outputRange: [0.7, 1]
                    })
                  }
                ]}>
                  준비하세요!
                </Animated.Text>
              )}
            </View>

            {/* Control buttons - change based on timer state */}
            <View style={styles.controls}>
              {!isRunning ? (
                // Start button when timer is not running
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    { backgroundColor: theme.colors.semantic.primary.main }
                  ]}
                  onPress={() => startTimer()}
                >
                  <Icon name="play-arrow" size={28} color="#FFFFFF" />
                  <Text style={styles.startButtonText}>휴식 시작</Text>
                </TouchableOpacity>
              ) : (
                // Control buttons when timer is running
                <>
                  <TouchableOpacity
                    style={[
                      styles.controlButton,
                      { 
                        backgroundColor: isPaused 
                          ? theme.colors.semantic.success.main
                          : theme.colors.semantic.warning.main
                      }
                    ]}
                    onPress={isPaused ? resumeTimer : pauseTimer}
                  >
                    <Icon 
                      name={isPaused ? "play-arrow" : "pause"} 
                      size={24} 
                      color="#FFFFFF" 
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.controlButton,
                      { backgroundColor: theme.colors.semantic.text.disabled }
                    ]}
                    onPress={() => {
                      // Reset the timer to the selected time
                      setRemainingTime(selectedTime);
                      setIsPaused(false);
                    }}
                  >
                    <Icon name="refresh" size={24} color="#FFFFFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.controlButton,
                      { backgroundColor: theme.colors.semantic.success.main }
                    ]}
                    onPress={completeTimer}
                  >
                    <Icon name="check" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </>
              )}
            </View>

            {isRunning && (
              <TouchableOpacity
                style={[
                  styles.skipButton,
                  { borderColor: theme.colors.semantic.divider }
                ]}
                onPress={() => {
                  // Stop timer and close modal immediately
                  stopTimer();
                  onDismiss?.();
                }}
              >
                <Text style={[
                  styles.skipButtonText,
                  { color: theme.colors.semantic.text.secondary }
                ]}>
                  휴식 건너뛰기
                </Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    width: screenWidth * 0.95,
    maxWidth: 500,
    maxHeight: screenHeight * 0.85,
  },
  content: {
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  presetContainer: {
    width: '100%',
    marginBottom: 16,
    gap: 12,
  },
  presetButton: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  presetTime: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  presetDescription: {
    fontSize: 12,
    opacity: 0.8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginTop: 24,
    gap: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  progressRing: {
    width: screenWidth * 0.6,
    maxWidth: 240,
    marginBottom: 24,
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  countdownText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 16,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  customInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  customInput: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    fontSize: 18,
  },
  customSetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  customSetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});