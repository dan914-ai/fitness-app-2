import { Platform } from 'react-native';
// import * as Haptics from 'expo-haptics';
// import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse, safeJsonStringify } from '../utils/safeJsonParse';

interface RestTimerSettings {
  presets: number[];
  defaultDuration: number;
  autoStartEnabled: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  customDuration: number;
  lastUsedDuration: number;
}

export interface RestTimerState {
  isActive: boolean;
  isPaused: boolean;
  timeLeft: number;
  originalDuration: number;
  duration: number; // Add duration field
  startTime: number | null;
  exerciseId?: string;
  setNumber?: number;
}

export interface RestTimerListener {
  onTick: (timeLeft: number) => void;
  onComplete: () => void;
  onStart: (duration: number) => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

class RestTimerService {
  private timerState: RestTimerState = {
    isActive: false,
    isPaused: false,
    timeLeft: 0,
    originalDuration: 0,
    duration: 0,
    startTime: null,
  };

  private listeners: RestTimerListener[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private settings: RestTimerSettings | null = null;
  private audioSound: any | null = null;

  constructor() {
    this.loadSettings();
    this.loadAudioAssets();
  }

  // Load settings from storage
  private async loadSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('@rest_timer_settings');
      if (stored) {
        this.settings = safeJsonParse(stored, {});
      } else {
        throw new Error('No settings found');
      }
    } catch (error) {
      console.error('Failed to load rest timer settings:', error);
      // Use default settings
      this.settings = {
        presets: [30, 60, 90, 120, 180, 300],
        defaultDuration: 120,
        autoStartEnabled: true,
        soundEnabled: true,
        hapticEnabled: true,
        customDuration: 60,
        lastUsedDuration: 120,
      };
      // Save defaults
      await AsyncStorage.setItem('@rest_timer_settings', safeJsonStringify(this.settings));
    }
  }

  // Load audio assets for rest completion sound
  private async loadAudioAssets(): Promise<void> {
    try {
      // Load a simple beep sound - you can add your own sound file
      // For now, we'll use the system notification sound
    } catch (error) {
      console.error('Failed to load audio assets:', error);
    }
  }

  // Get current settings
  async getSettings(): Promise<RestTimerSettings> {
    if (!this.settings) {
      await this.loadSettings();
    }
    return this.settings!;
  }

  // Update settings
  async updateSettings(newSettings: Partial<RestTimerSettings>): Promise<void> {
    const currentSettings = await this.getSettings();
    this.settings = { ...currentSettings, ...newSettings };
    await AsyncStorage.setItem('@rest_timer_settings', safeJsonStringify(this.settings));
  }

  // Start rest timer
  async startTimer(duration?: number, exerciseId?: string, setNumber?: number): Promise<void> {
    const settings = await this.getSettings();
    const timerDuration = duration || settings.lastUsedDuration || settings.defaultDuration;

    // Stop any existing timer
    this.stopTimer();

    // Update last used duration
    if (duration && duration !== settings.lastUsedDuration) {
      settings.lastUsedDuration = duration;
      await this.updateSettings({ lastUsedDuration: duration });
    }

    // Initialize timer state
    this.timerState = {
      isActive: true,
      isPaused: false,
      timeLeft: timerDuration,
      originalDuration: timerDuration,
      duration: timerDuration,
      startTime: Date.now(),
      exerciseId,
      setNumber,
    };

    // Notify listeners
    this.listeners.forEach(listener => listener.onStart(timerDuration));

    // Haptic feedback on start (disabled for now)
    // if (settings.hapticEnabled && Platform.OS !== 'web') {
    //   try {
    //     await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    //   } catch (error) {
    //     console.error('Haptics not supported:', error);
    //   }
    // }

    // Start countdown
    this.startCountdown();
  }

  // Start the countdown interval
  private startCountdown(): void {
    this.intervalId = setInterval(() => {
      if (!this.timerState.isActive || this.timerState.isPaused) {
        return;
      }

      this.timerState.timeLeft -= 1;

      // Notify listeners of tick
      this.listeners.forEach(listener => listener.onTick(this.timerState.timeLeft));

      // Check if timer completed
      if (this.timerState.timeLeft <= 0) {
        this.completeTimer();
      }
    }, 1000);
  }

  // Complete the timer
  private async completeTimer(): Promise<void> {
    const settings = await this.getSettings();

    // Stop the interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Update state
    this.timerState.isActive = false;
    this.timerState.timeLeft = 0;

    // Play completion sound
    if (settings.soundEnabled) {
      await this.playCompletionSound();
    }

    // Haptic feedback (disabled for now)
    // if (settings.hapticEnabled && Platform.OS !== 'web') {
    //   try {
    //     await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    //   } catch (error) {
    //     console.error('Haptics not supported:', error);
    //   }
    // }

    // Send notification
    await this.sendCompletionNotification();

    // Notify listeners
    this.listeners.forEach(listener => listener.onComplete());
  }

  // Play completion sound
  private async playCompletionSound(): Promise<void> {
    try {
      // For now, we'll just log - you can implement actual sound playback
      
      // Could add actual sound implementation here later
    } catch (error) {
      console.error('Failed to play completion sound:', error);
    }
  }

  // Send completion notification
  private async sendCompletionNotification(): Promise<void> {
    try {
      const exerciseInfo = this.timerState.exerciseId 
        ? ` 다음 세트를 준비하세요!`
        : ' 휴식이 완료되었습니다!';

      // This would ideally be a local notification
      
      // For now, we rely on the UI to show completion feedback
    } catch (error) {
      console.error('Failed to send completion notification:', error);
    }
  }

  // Pause timer
  pauseTimer(): void {
    if (this.timerState.isActive && !this.timerState.isPaused) {
      this.timerState.isPaused = true;
      this.listeners.forEach(listener => listener.onPause());
    }
  }

  // Resume timer
  resumeTimer(): void {
    if (this.timerState.isActive && this.timerState.isPaused) {
      this.timerState.isPaused = false;
      this.listeners.forEach(listener => listener.onResume());
    }
  }

  // Stop timer
  stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.timerState = {
      isActive: false,
      isPaused: false,
      timeLeft: 0,
      originalDuration: 0,
      duration: 0,
      startTime: null,
    };

    this.listeners.forEach(listener => listener.onReset());
  }

  // Reset timer to original duration
  resetTimer(): void {
    if (this.timerState.originalDuration > 0) {
      this.timerState.timeLeft = this.timerState.originalDuration;
      this.timerState.isPaused = false;
      this.timerState.startTime = Date.now();
      this.listeners.forEach(listener => listener.onReset());
    }
  }

  // Add 30 seconds to timer
  async addTime(seconds: number = 30): Promise<void> {
    if (this.timerState.isActive) {
      this.timerState.timeLeft += seconds;
      this.listeners.forEach(listener => listener.onTick(this.timerState.timeLeft));
      
      const settings = await this.getSettings();
      if (settings.hapticEnabled && Platform.OS !== 'web') {
        // try {
        //   await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // } catch (error) {
        //   console.error('Haptics not supported:', error);
        // }
      }
    }
  }

  // Subtract time from timer
  async subtractTime(seconds: number = 30): Promise<void> {
    if (this.timerState.isActive && this.timerState.timeLeft > seconds) {
      this.timerState.timeLeft -= seconds;
      this.listeners.forEach(listener => listener.onTick(this.timerState.timeLeft));
      
      const settings = await this.getSettings();
      if (settings.hapticEnabled && Platform.OS !== 'web') {
        // try {
        //   await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // } catch (error) {
        //   console.error('Haptics not supported:', error);
        // }
      }
    } else if (this.timerState.isActive) {
      // If subtracting would make timer negative, complete it
      this.completeTimer();
    }
  }

  // Get current timer state
  getState(): RestTimerState {
    return { ...this.timerState };
  }

  // Check if timer is active
  isTimerActive(): boolean {
    return this.timerState.isActive;
  }

  // Check if timer is paused
  isTimerPaused(): boolean {
    return this.timerState.isPaused;
  }

  // Get time remaining
  getTimeLeft(): number {
    return this.timerState.timeLeft;
  }

  // Format time for display
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Add listener
  addListener(listener: Partial<RestTimerListener>): () => void {
    const fullListener: RestTimerListener = {
      onTick: listener.onTick || (() => {}),
      onComplete: listener.onComplete || (() => {}),
      onStart: listener.onStart || (() => {}),
      onPause: listener.onPause || (() => {}),
      onResume: listener.onResume || (() => {}),
      onReset: listener.onReset || (() => {}),
    };

    this.listeners.push(fullListener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(fullListener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Remove all listeners
  removeAllListeners(): void {
    this.listeners = [];
  }

  // Get preset durations
  async getPresets(): Promise<number[]> {
    const settings = await this.getSettings();
    return settings.presets;
  }

  // Add custom preset
  async addPreset(duration: number): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.presets.includes(duration)) {
      settings.presets.push(duration);
      settings.presets.sort((a, b) => a - b);
      await this.updateSettings({ presets: settings.presets });
    }
  }

  // Remove preset
  async removePreset(duration: number): Promise<void> {
    const settings = await this.getSettings();
    const index = settings.presets.indexOf(duration);
    if (index > -1) {
      settings.presets.splice(index, 1);
      await this.updateSettings({ presets: settings.presets });
    }
  }

  // Cleanup method
  cleanup(): void {
    this.stopTimer();
    this.removeAllListeners();
    if (this.audioSound) {
      this.audioSound.unloadAsync();
      this.audioSound = null;
    }
  }
}

// Export singleton instance
export const restTimerService = new RestTimerService();
export default restTimerService;