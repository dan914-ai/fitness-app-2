import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Vibration,
  Platform,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import restTimerService from '../../services/restTimer.service';
import { safeJsonParse, safeJsonStringify } from '../../utils/safeJsonParse';
// import { Audio } from 'expo-av'; // Uncomment when expo-av is installed

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface RestTimerProps {
  isActive: boolean;
  onComplete?: () => void;
  onDismiss?: () => void;
}

const PRESET_TIMES = [30, 60, 90, 120, 180]; // seconds
const STORAGE_KEY = '@rest_timer_preference';

export default function RestTimer({ isActive, onComplete, onDismiss }: RestTimerProps) {
  const [timerState, setTimerState] = useState(restTimerService.getState());
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(90);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // const soundRef = useRef<Audio.Sound | null>(null); // Uncomment when expo-av is installed

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
    setupNotifications();
    
    // Listen to service updates
    const unsubscribe = restTimerService.addListener({
      onTick: (timeLeft) => {
        setTimerState(prev => ({ ...prev, timeLeft }));
      },
      onComplete: () => {
        setTimerState(restTimerService.getState());
        if (onComplete) onComplete();
      },
      onStart: (duration) => {
        setTimerState(restTimerService.getState());
      },
      onPause: () => {
        setTimerState(prev => ({ ...prev, isPaused: true }));
      },
      onResume: () => {
        setTimerState(prev => ({ ...prev, isPaused: false }));
      },
      onReset: () => {
        setTimerState(restTimerService.getState());
        if (onDismiss) onDismiss();
      },
    });

    return () => {
      unsubscribe();
      // Cleanup for sound when expo-av is installed
      // if (soundRef.current) {
      //   soundRef.current.unloadAsync();
      // }
    };
  }, []);

  // Load user preferences
  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const prefs = safeJsonParse(stored, {});
        setSelectedPreset(prefs.preset || 90);
        setSoundEnabled(prefs.soundEnabled ?? true);
        setVibrationEnabled(prefs.vibrationEnabled ?? true);
      }
    } catch (error) {
      console.error('Error loading timer preferences:', error);
    }
  };

  // Save preferences
  const savePreferences = async (preset: number, sound: boolean, vibration: boolean) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          preset,
          soundEnabled: sound,
          vibrationEnabled: vibration,
        })
      );
    } catch (error) {
      console.error('Error saving timer preferences:', error);
    }
  };

  // Setup notifications permissions
  const setupNotifications = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    }
  };

  // Start timer when activated
  useEffect(() => {
    if (isActive && !timerState.isActive) {
      startTimer(selectedPreset);
    }
  }, [isActive]);

  // Timer countdown effect
  useEffect(() => {
    if (!timerState.isActive || timerState.timeLeft <= 0 || timerState.isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimerState(prev => {
        if (!prev.isActive || prev.timeLeft <= 0) return prev;
        
        const newTime = prev.timeLeft - 1;
        
        // Check for warning times (10 seconds)
        if (newTime === 10) {
          playWarningSound();
        }
        
        // Timer complete
        if (newTime <= 0) {
          handleTimerComplete();
          return { ...prev, timeLeft: 0, isActive: false };
        }
        
        return { ...prev, timeLeft: newTime };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.timeLeft, timerState.isPaused]);

  const startTimer = (seconds: number) => {
    restTimerService.startTimer(seconds);
  };

  const handleTimerComplete = async () => {
    // Play completion sound
    if (soundEnabled) {
      await playCompletionSound();
    }

    // Trigger vibration
    if (vibrationEnabled && Platform.OS !== 'web') {
      Vibration.vibrate([0, 500, 200, 500]);
    }

    // Show notification
    if (Platform.OS !== 'web') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '휴식 완료! 💪',
          body: '다음 세트를 시작하세요!',
          sound: true,
        },
        trigger: null, // Show immediately
      });
    }

    // Call completion callback
    if (onComplete) {
      onComplete();
    }

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      restTimerService.resetTimer();
    }, 3000);
  };

  const playCompletionSound = async () => {
    // Sound will be implemented when expo-av is installed
    // For now, use vibration as feedback
    if (Platform.OS !== 'web') {
      Vibration.vibrate(200);
    }
  };

  const playWarningSound = async () => {
    try {
      if (Platform.OS !== 'web') {
        Vibration.vibrate(50);
      }
    } catch (error) {
      console.log('Error playing warning:', error);
    }
  };

  const togglePause = () => {
    if (timerState.isPaused) {
      restTimerService.resumeTimer();
    } else {
      restTimerService.pauseTimer();
    }
  };

  const stopTimer = () => {
    restTimerService.stopTimer();
    if (onDismiss) {
      onDismiss();
    }
  };

  const addTime = (seconds: number) => {
    restTimerService.addTime(seconds);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectPreset = async (seconds: number) => {
    setSelectedPreset(seconds);
    savePreferences(seconds, soundEnabled, vibrationEnabled);
    // Start timer with the selected duration
    await restTimerService.startTimer(seconds);
  };

  // Floating timer widget
  if (timerState.isActive && timerState.timeLeft > 0) {
    return (
      <>
        <TouchableOpacity
          style={styles.floatingTimer}
          onPress={() => setShowSettings(true)}
          activeOpacity={0.9}
        >
          <View style={styles.floatingContent}>
            <Icon 
              name={timerState.isPaused ? "play-arrow" : "timer"} 
              size={20} 
              color="#FFFFFF" 
            />
            <Text style={styles.floatingTime}>
              {formatTime(timerState.timeLeft)}
            </Text>
            {timerState.isPaused && (
              <Text style={styles.pausedText}>일시정지</Text>
            )}
          </View>
          <View style={styles.floatingActions}>
            <TouchableOpacity 
              style={styles.floatingButton}
              onPress={togglePause}
            >
              <Icon 
                name={timerState.isPaused ? "play-arrow" : "pause"} 
                size={16} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.floatingButton}
              onPress={() => addTime(30)}
            >
              <Text style={styles.addTimeText}>+30</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.floatingButton}
              onPress={stopTimer}
            >
              <Icon name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Settings Modal */}
        <Modal
          visible={showSettings}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSettings(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>휴식 타이머 설정</Text>
                <TouchableOpacity onPress={() => setShowSettings(false)}>
                  <Icon name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.currentTimer}>
                <Text style={styles.currentTimeLabel}>남은 시간</Text>
                <Text style={styles.currentTime}>{formatTime(timerState.timeLeft)}</Text>
              </View>

              <View style={styles.presetSection}>
                <Text style={styles.sectionTitle}>빠른 설정</Text>
                <View style={styles.presetButtons}>
                  {PRESET_TIMES.map(time => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.presetButton,
                        selectedPreset === time && styles.presetButtonActive
                      ]}
                      onPress={() => selectPreset(time)}
                    >
                      <Text style={[
                        styles.presetButtonText,
                        selectedPreset === time && styles.presetButtonTextActive
                      ]}>
                        {time < 60 ? `${time}초` : `${time / 60}분`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.settingsSection}>
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => {
                    const newValue = !soundEnabled;
                    setSoundEnabled(newValue);
                    savePreferences(selectedPreset, newValue, vibrationEnabled);
                  }}
                >
                  <Text style={styles.settingLabel}>소리 알림</Text>
                  <Icon 
                    name={soundEnabled ? "check-box" : "check-box-outline-blank"} 
                    size={24} 
                    color={Colors.primary} 
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => {
                    const newValue = !vibrationEnabled;
                    setVibrationEnabled(newValue);
                    savePreferences(selectedPreset, soundEnabled, newValue);
                  }}
                >
                  <Text style={styles.settingLabel}>진동 알림</Text>
                  <Icon 
                    name={vibrationEnabled ? "check-box" : "check-box-outline-blank"} 
                    size={24} 
                    color={Colors.primary} 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={stopTimer}
                >
                  <Text style={styles.modalButtonText}>타이머 종료</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  // Timer complete state - only show if timer was actually running
  if (timerState.timeLeft === 0 && !timerState.isActive && timerState.duration > 0) {
    return (
      <View style={styles.completeContainer}>
        <View style={styles.completeContent}>
          <Icon name="check-circle" size={48} color={Colors.success} />
          <Text style={styles.completeText}>휴식 완료!</Text>
          <Text style={styles.completeSubtext}>다음 세트를 시작하세요</Text>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => {
              stopTimer();
              if (onDismiss) onDismiss();
            }}
          >
            <Text style={styles.dismissButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  floatingTimer: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 9999,
  },
  floatingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floatingTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pausedText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  floatingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  floatingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTimeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  completeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  completeContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  completeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  completeSubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  dismissButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  dismissButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  currentTimer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  currentTimeLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  currentTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  presetSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  presetButtonTextActive: {
    color: '#FFFFFF',
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  modalActions: {
    gap: 12,
  },
  modalButton: {
    backgroundColor: Colors.error,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});