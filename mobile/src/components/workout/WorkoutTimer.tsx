import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
// import workoutTimerService from '../../services/workoutTimer.service';

interface WorkoutTimerProps {
  onPress?: () => void;
  compact?: boolean;
}

// Temporary mock service until real service is restored
const mockWorkoutTimerService = {
  isActive: () => false,
  isRunning: () => false,
  isPaused: () => false,
  subscribe: (callback: (elapsed: number) => void) => {
    // Mock subscription - return cleanup function
    return () => {};
  },
  start: async () => {
  },
  pause: async () => {
  },
  resume: async () => {
  },
  stop: async () => {
  },
};

export default function WorkoutTimer({ onPress, compact = false }: WorkoutTimerProps) {
  const { theme } = useTheme();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Subscribe to timer updates
    const unsubscribe = mockWorkoutTimerService.subscribe((elapsed) => {
      setElapsedTime(elapsed);
      setIsRunning(mockWorkoutTimerService.isRunning());
      setIsPaused(mockWorkoutTimerService.isPaused());
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Pulse animation when running
    if (isRunning) {
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
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (compact && hours === 0) {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async (e: any) => {
    e.stopPropagation();
    
    if (!mockWorkoutTimerService.isActive()) {
      await mockWorkoutTimerService.start();
    } else if (isRunning) {
      await mockWorkoutTimerService.pause();
    } else {
      await mockWorkoutTimerService.resume();
    }
  };

  const handleStop = async (e: any) => {
    e.stopPropagation();
    await mockWorkoutTimerService.stop();
  };

  if (!mockWorkoutTimerService.isActive() && compact) {
    // Don't show timer in compact mode if not active
    return null;
  }

  if (compact) {
    return (
      <TouchableOpacity 
        style={[styles.compactContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Animated.View 
          style={[
            styles.compactContent,
            isRunning && { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Icon 
            name="timer" 
            size={16} 
            color={isRunning ? theme.primary : theme.textSecondary} 
          />
          <Text style={[
            styles.compactTime,
            { color: theme.textSecondary },
            isRunning && { color: theme.primary }
          ]}>
            {formatTime(elapsedTime)}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Animated.View 
        style={[
          styles.timerDisplay,
          isRunning && { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <View style={styles.timerHeader}>
          <Icon 
            name="timer" 
            size={24} 
            color={isRunning ? theme.primary : isPaused ? theme.warning : theme.textSecondary} 
          />
          <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>
            {isRunning ? '운동 중' : isPaused ? '일시정지' : '운동 시간'}
          </Text>
        </View>
        
        <Text style={[
          styles.timerValue,
          { color: theme.text },
          isRunning && { color: theme.primary },
          isPaused && { color: theme.warning }
        ]}>
          {formatTime(elapsedTime)}
        </Text>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, styles.playPauseButton, { backgroundColor: theme.primary }]}
            onPress={handlePlayPause}
          >
            <Icon 
              name={isRunning ? "pause" : "play-arrow"} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>

          {mockWorkoutTimerService.isActive() && (
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton, { backgroundColor: theme.error }]}
              onPress={handleStop}
            >
              <Icon name="stop" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Timer Statistics */}
      {mockWorkoutTimerService.isActive() && elapsedTime > 60 && (
        <View style={[styles.stats, { borderTopColor: theme.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>평균 페이스</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {Math.floor(elapsedTime / 60)}분/운동
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>칼로리</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              ~{Math.floor(elapsedTime * 0.1)}kcal
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  timerDisplay: {
    alignItems: 'center',
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  timerValue: {
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseButton: {
    // backgroundColor applied dynamically
  },
  stopButton: {
    // backgroundColor applied dynamically
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});