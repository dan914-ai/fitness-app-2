import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDesignSystem } from '../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

interface EnhancedWorkoutTimerProps {
  onTimeUpdate?: (seconds: number) => void;
  style?: any;
  compact?: boolean;
  showFloating?: boolean;
}

export default function EnhancedWorkoutTimer({ 
  onTimeUpdate, 
  style,
  compact = false,
  showFloating = true
}: EnhancedWorkoutTimerProps) {
  const theme = useDesignSystem();
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          const newTime = s + 1;
          onTimeUpdate?.(newTime);
          
          // Vibrate every 10 minutes as a milestone
          if (newTime % 600 === 0) {
            Vibration.vibrate(200);
          }
          
          return newTime;
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
  }, [isRunning, isPaused, onTimeUpdate]);

  useEffect(() => {
    // Pulse animation when running
    if (isRunning && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
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
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning, isPaused, pulseAnim]);

  useEffect(() => {
    // Slide in/out animation for floating timer
    if (showFloating && isRunning) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: -100,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }).start();
    }
  }, [showFloating, isRunning, slideAnim]);

  const formatTime = (totalSeconds: number): { hours: string; minutes: string; seconds: string; display: string } => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const hoursStr = hours.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = secs.toString().padStart(2, '0');

    let display = '';
    if (hours > 0) {
      display = `${hoursStr}:${minutesStr}:${secondsStr}`;
    } else {
      display = `${minutesStr}:${secondsStr}`;
    }

    return { hours: hoursStr, minutes: minutesStr, seconds: secondsStr, display };
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    Vibration.vibrate(100);
  };

  const handlePause = () => {
    setIsPaused(true);
    Vibration.vibrate([0, 100, 100, 100]);
  };

  const handleResume = () => {
    setIsPaused(false);
    Vibration.vibrate(100);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    Vibration.vibrate([0, 100, 100, 100, 100, 100]);
  };

  const time = formatTime(seconds);
  const calories = Math.floor(seconds * 0.1);
  const pace = seconds > 0 ? Math.floor(seconds / 60) : 0;

  // Floating timer for when user scrolls away
  const FloatingTimer = () => (
    <Animated.View 
      style={[
        styles.floatingTimer,
        {
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <LinearGradient
        colors={[theme.colors.semantic.primary.main, theme.colors.semantic.primary.dark]}
        style={styles.floatingGradient}
      >
        <TouchableOpacity
          style={styles.floatingContent}
          onPress={() => {
            // Scroll to main timer or expand
          }}
        >
          <Icon name="timer" size={20} color="#FFFFFF" />
          <Text style={styles.floatingTime}>{time.display}</Text>
          <TouchableOpacity
            style={styles.floatingControl}
            onPress={isPaused ? handleResume : handlePause}
          >
            <Icon 
              name={isPaused ? "play-arrow" : "pause"} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );

  if (compact) {
    return (
      <TouchableOpacity 
        style={[
          styles.compactContainer,
          { 
            backgroundColor: theme.colors.semantic.surface.raised,
            borderColor: isRunning ? theme.colors.semantic.primary.main : theme.colors.semantic.border.light,
          },
          style
        ]}
      >
        <Animated.View 
          style={[
            styles.compactContent,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Icon 
            name="timer" 
            size={18} 
            color={isRunning ? theme.colors.semantic.primary.main : theme.colors.semantic.text.secondary} 
          />
          <Text style={[
            styles.compactTime,
            { 
              color: isRunning ? theme.colors.semantic.primary.main : theme.colors.semantic.text.primary 
            }
          ]}>
            {time.display}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <View style={[styles.container, style]}>
        <LinearGradient
          colors={
            isRunning 
              ? [theme.colors.semantic.primary.light + '20', theme.colors.semantic.primary.main + '10']
              : ['transparent', 'transparent']
          }
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.statusBadge}>
              <View style={[
                styles.statusDot,
                { 
                  backgroundColor: isRunning 
                    ? (isPaused ? theme.colors.semantic.warning.main : theme.colors.semantic.success.main)
                    : theme.colors.semantic.text.disabled 
                }
              ]} />
              <Text style={[
                styles.statusText,
                { color: theme.colors.semantic.text.secondary }
              ]}>
                {isRunning ? (isPaused ? '일시정지' : '운동 중') : '준비'}
              </Text>
            </View>
          </View>

          <Animated.View 
            style={[
              styles.mainTimer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={styles.timeDisplay}>
              <View style={styles.timeUnit}>
                <Text style={[
                  styles.timeValue,
                  { color: theme.colors.semantic.text.primary }
                ]}>
                  {time.hours}
                </Text>
                <Text style={[
                  styles.timeLabel,
                  { color: theme.colors.semantic.text.secondary }
                ]}>
                  시간
                </Text>
              </View>
              
              <Text style={[
                styles.timeSeparator,
                { color: theme.colors.semantic.text.secondary }
              ]}>
                :
              </Text>
              
              <View style={styles.timeUnit}>
                <Text style={[
                  styles.timeValue,
                  { color: theme.colors.semantic.text.primary }
                ]}>
                  {time.minutes}
                </Text>
                <Text style={[
                  styles.timeLabel,
                  { color: theme.colors.semantic.text.secondary }
                ]}>
                  분
                </Text>
              </View>
              
              <Text style={[
                styles.timeSeparator,
                { color: theme.colors.semantic.text.secondary }
              ]}>
                :
              </Text>
              
              <View style={styles.timeUnit}>
                <Text style={[
                  styles.timeValue,
                  { color: theme.colors.semantic.primary.main }
                ]}>
                  {time.seconds}
                </Text>
                <Text style={[
                  styles.timeLabel,
                  { color: theme.colors.semantic.text.secondary }
                ]}>
                  초
                </Text>
              </View>
            </View>
          </Animated.View>

          <View style={styles.controls}>
            {!isRunning ? (
              <TouchableOpacity
                style={[
                  styles.mainButton,
                  { backgroundColor: theme.colors.semantic.primary.main }
                ]}
                onPress={handleStart}
              >
                <Icon name="play-arrow" size={32} color="#FFFFFF" />
                <Text style={styles.mainButtonText}>운동 시작</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.runningControls}>
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    { backgroundColor: isPaused ? theme.colors.semantic.success.main : theme.colors.semantic.warning.main }
                  ]}
                  onPress={isPaused ? handleResume : handlePause}
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
                    styles.stopButton,
                    { backgroundColor: theme.colors.semantic.error.main }
                  ]}
                  onPress={handleStop}
                >
                  <Icon name="stop" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isRunning && seconds > 0 && (
            <View style={[
              styles.stats,
              { borderTopColor: theme.colors.semantic.border.light }
            ]}>
              <View style={styles.statItem}>
                <Icon name="local-fire-department" size={16} color={theme.colors.semantic.error.main} />
                <Text style={[styles.statValue, { color: theme.colors.semantic.text.primary }]}>
                  {calories}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.semantic.text.secondary }]}>
                  칼로리
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Icon name="speed" size={16} color={theme.colors.semantic.primary.main} />
                <Text style={[styles.statValue, { color: theme.colors.semantic.text.primary }]}>
                  {pace}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.semantic.text.secondary }]}>
                  분/세트
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Icon name="fitness-center" size={16} color={theme.colors.semantic.success.main} />
                <Text style={[styles.statValue, { color: theme.colors.semantic.text.primary }]}>
                  {Math.floor(seconds / 60)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.semantic.text.secondary }]}>
                  총 시간(분)
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </View>
      
      {showFloating && <FloatingTimer />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  gradient: {
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mainTimer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeUnit: {
    alignItems: 'center',
    minWidth: 60,
  },
  timeValue: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 48,
  },
  timeLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  timeSeparator: {
    fontSize: 36,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  controls: {
    alignItems: 'center',
    marginTop: 24,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    gap: 12,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  runningControls: {
    flexDirection: 'row',
    gap: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  stopButton: {
    // Additional stop button styles
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
  },
  compactContainer: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactTime: {
    fontSize: 16,
    fontWeight: '700',
  },
  floatingTimer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  floatingGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  floatingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  floatingTime: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  floatingControl: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});