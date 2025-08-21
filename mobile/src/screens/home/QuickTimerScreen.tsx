import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Vibration,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { HomeStackScreenProps } from '../../navigation/types';
// import { Audio } from 'expo-av';

type Props = HomeStackScreenProps<'QuickTimer'>;

interface PresetTimer {
  id: string;
  name: string;
  duration: number; // in seconds
  icon: string;
  color: string;
}

export default function QuickTimerScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [selectedPreset, setSelectedPreset] = useState<PresetTimer | null>(null);
  const [customTime, setCustomTime] = useState(60);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // const soundRef = useRef<Audio.Sound | null>(null);

  const presetTimers: PresetTimer[] = [
    { id: '30s', name: '30초', duration: 30, icon: 'timer', color: theme.info },
    { id: '45s', name: '45초', duration: 45, icon: 'timer', color: theme.success },
    { id: '60s', name: '1분', duration: 60, icon: 'timer', color: theme.warning },
    { id: '90s', name: '1분 30초', duration: 90, icon: 'timer', color: theme.error },
    { id: '120s', name: '2분', duration: 120, icon: 'timer', color: theme.primary },
    { id: '180s', name: '3분', duration: 180, icon: 'timer', color: theme.secondary },
    { id: '300s', name: '5분', duration: 300, icon: 'timer', color: theme.primary },
    { id: 'custom', name: '사용자 설정', duration: customTime, icon: 'tune', color: theme.textSecondary },
  ];

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // if (soundRef.current) {
      //   soundRef.current.unloadAsync();
      // }
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
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
  }, [isRunning, timeRemaining]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    Vibration.vibrate([0, 500, 200, 500]);
    
    // Play sound - commented out until sound file is available
    // try {
    //   const { sound } = await Audio.Sound.createAsync(
    //     require('../../assets/sounds/timer-complete.mp3'),
    //     { shouldPlay: true }
    //   );
    //   soundRef.current = sound;
    // } catch (error) {
    // }
  };

  const startTimer = (preset: PresetTimer) => {
    setSelectedPreset(preset);
    setTimeRemaining(preset.duration);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resumeTimer = () => {
    setIsRunning(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(0);
    setSelectedPreset(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (!selectedPreset || timeRemaining === 0) return 0;
    return ((selectedPreset.duration - timeRemaining) / selectedPreset.duration) * 100;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>빠른 타이머</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Timer Display */}
        <View style={[styles.timerDisplay, { backgroundColor: theme.surface }]}>
          <View style={styles.timerCircle}>
            <View 
              style={[
                styles.progressCircle,
                { 
                  backgroundColor: selectedPreset?.color || theme.primary,
                  opacity: 0.1 
                }
              ]} 
            />
            <View 
              style={[
                styles.progressFill,
                { 
                  backgroundColor: selectedPreset?.color || theme.primary,
                  height: `${getProgress()}%`
                }
              ]} 
            />
            <Text style={[styles.timerText, { color: theme.text }]}>
              {formatTime(timeRemaining)}
            </Text>
            {selectedPreset && (
              <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>
                {selectedPreset.name}
              </Text>
            )}
          </View>

          {/* Timer Controls */}
          <View style={styles.controls}>
            {!isRunning && timeRemaining === 0 && (
              <Text style={[styles.selectPrompt, { color: theme.textSecondary }]}>
                타이머를 선택하세요
              </Text>
            )}
            
            {timeRemaining > 0 && (
              <View style={styles.controlButtons}>
                {!isRunning ? (
                  <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: theme.success }]}
                    onPress={resumeTimer}
                  >
                    <Icon name="play-arrow" size={32} color="#FFFFFF" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: theme.warning }]}
                    onPress={pauseTimer}
                  >
                    <Icon name="pause" size={32} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: theme.error }]}
                  onPress={resetTimer}
                >
                  <Icon name="stop" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Preset Timers */}
        <View style={[styles.presetsSection, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>프리셋 타이머</Text>
          <View style={styles.presetGrid}>
            {presetTimers.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetCard,
                  { 
                    backgroundColor: theme.background,
                    borderColor: selectedPreset?.id === preset.id ? preset.color : theme.border,
                    borderWidth: selectedPreset?.id === preset.id ? 2 : 1,
                  }
                ]}
                onPress={() => startTimer(preset)}
                disabled={isRunning}
              >
                <Icon name={preset.icon} size={24} color={preset.color} />
                <Text style={[styles.presetName, { color: theme.text }]}>
                  {preset.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Timer Input */}
        {selectedPreset?.id === 'custom' && (
          <View style={[styles.customSection, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              사용자 설정 시간
            </Text>
            <View style={styles.customControls}>
              <TouchableOpacity
                style={[styles.customButton, { backgroundColor: theme.primary }]}
                onPress={() => setCustomTime(Math.max(10, customTime - 10))}
              >
                <Icon name="remove" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              
              <Text style={[styles.customTime, { color: theme.text }]}>
                {formatTime(customTime)}
              </Text>
              
              <TouchableOpacity
                style={[styles.customButton, { backgroundColor: theme.primary }]}
                onPress={() => setCustomTime(Math.min(600, customTime + 10))}
              >
                <Icon name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Timer History */}
        <View style={[styles.historySection, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>최근 사용</Text>
          <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
            사용 기록이 없습니다
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  content: {
    paddingBottom: 20,
  },
  timerDisplay: {
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  progressCircle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: 100,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    zIndex: 1,
  },
  timerLabel: {
    fontSize: 16,
    marginTop: 8,
    zIndex: 1,
  },
  controls: {
    marginTop: 24,
    alignItems: 'center',
  },
  selectPrompt: {
    fontSize: 16,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetsSection: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetCard: {
    width: '30%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  presetName: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  customSection: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  customControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  customButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customTime: {
    fontSize: 24,
    fontWeight: 'bold',
    minWidth: 80,
    textAlign: 'center',
  },
  historySection: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  placeholderText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});