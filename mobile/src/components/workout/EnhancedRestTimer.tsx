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
  { seconds: 30, label: '30초', description: '가벼운 운동' },
  { seconds: 60, label: '1분', description: '일반 세트' },
  { seconds: 90, label: '1분 30초', description: '중간 강도' },
  { seconds: 120, label: '2분', description: '고강도' },
  { seconds: 180, label: '3분', description: '최대 강도' },
  { seconds: 240, label: '4분', description: '파워리프팅' },
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
  const [visible, setVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(90);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive && !visible) {
      setVisible(true);
      startTimer();
    }
  }, [isActive]);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

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
    
    onComplete?.();
    closeModal();
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
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      stopTimer();
      onDismiss?.();
    });
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
      visible={visible}
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
            colors={[theme.colors.semantic.surface.main, theme.colors.semantic.surface.raised]}
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

            {!isRunning ? (
              <>
                <Text style={[styles.subtitle, { color: theme.colors.semantic.text.secondary }]}>
                  휴식 시간을 선택하세요
                </Text>
                
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.presetContainer}
                >
                  {PRESET_TIMES.map((preset) => (
                    <TouchableOpacity
                      key={preset.seconds}
                      style={[
                        styles.presetButton,
                        {
                          backgroundColor: selectedTime === preset.seconds
                            ? theme.colors.semantic.primary.main
                            : theme.colors.semantic.surface.raised,
                          borderColor: selectedTime === preset.seconds
                            ? theme.colors.semantic.primary.main
                            : theme.colors.semantic.border.light,
                        }
                      ]}
                      onPress={() => setSelectedTime(preset.seconds)}
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
                </ScrollView>

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
              </>
            ) : (
              <>
                <View style={styles.timerContainer}>
                  <View style={styles.progressRing}>
                    <View style={styles.progressBackground}>
                      <Animated.View
                        style={[
                          styles.progressFill,
                          {
                            backgroundColor: remainingTime <= 10 
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
                        color: remainingTime <= 10 
                          ? theme.colors.semantic.error.main
                          : theme.colors.semantic.text.primary,
                        transform: [{ scale: scaleAnim }]
                      }
                    ]}
                  >
                    {formatTime(remainingTime)}
                  </Animated.Text>

                  {remainingTime <= 10 && remainingTime > 0 && (
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

                <View style={styles.controls}>
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
                      stopTimer();
                      setIsRunning(false);
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
                </View>

                <TouchableOpacity
                  style={[
                    styles.skipButton,
                    { borderColor: theme.colors.semantic.border.light }
                  ]}
                  onPress={completeTimer}
                >
                  <Text style={[
                    styles.skipButtonText,
                    { color: theme.colors.semantic.text.secondary }
                  ]}>
                    휴식 건너뛰기
                  </Text>
                </TouchableOpacity>
              </>
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
    width: screenWidth * 0.9,
    maxWidth: 400,
  },
  content: {
    borderRadius: 24,
    padding: 24,
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
    paddingVertical: 8,
    gap: 12,
  },
  presetButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  presetTime: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  presetDescription: {
    fontSize: 11,
    marginTop: 4,
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
    marginVertical: 32,
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
    fontSize: 64,
    fontWeight: 'bold',
    letterSpacing: 2,
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
});