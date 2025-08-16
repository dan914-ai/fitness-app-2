import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse, safeJsonStringify } from '../utils/safeJsonParse';

interface WorkoutTimerState {
  startTime: number | null;
  pausedTime: number | null;
  isPaused: boolean;
  totalPausedDuration: number;
}

class WorkoutTimerService {
  private readonly STORAGE_KEY = '@workout_timer_state';
  private state: WorkoutTimerState = {
    startTime: null,
    pausedTime: null,
    isPaused: false,
    totalPausedDuration: 0,
  };
  private listeners: Set<(elapsed: number) => void> = new Set();
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.loadState();
  }

  // Load timer state from storage
  private async loadState() {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const storedState = safeJsonParse(stored, {});
        this.state = storedState;
        
        // Resume timer if it was running
        if (this.state.startTime && !this.state.isPaused) {
          this.startInterval();
        }
      }
    } catch (error) {
      console.error('Error loading workout timer state:', error);
    }
  }

  // Save timer state to storage
  private async saveState() {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('Error saving workout timer state:', error);
    }
  }

  // Start the workout timer
  async start() {
    if (!this.state.startTime) {
      this.state = {
        startTime: Date.now(),
        pausedTime: null,
        isPaused: false,
        totalPausedDuration: 0,
      };
      await this.saveState();
      this.startInterval();
    }
  }

  // Pause the workout timer
  async pause() {
    if (this.state.startTime && !this.state.isPaused) {
      this.state.isPaused = true;
      this.state.pausedTime = Date.now();
      await this.saveState();
      this.stopInterval();
    }
  }

  // Resume the workout timer
  async resume() {
    if (this.state.startTime && this.state.isPaused && this.state.pausedTime) {
      const pausedDuration = Date.now() - this.state.pausedTime;
      this.state.totalPausedDuration += pausedDuration;
      this.state.isPaused = false;
      this.state.pausedTime = null;
      await this.saveState();
      this.startInterval();
    }
  }

  // Stop and reset the timer
  async stop() {
    this.state = {
      startTime: null,
      pausedTime: null,
      isPaused: false,
      totalPausedDuration: 0,
    };
    await this.saveState();
    this.stopInterval();
    this.notifyListeners(0);
  }

  // Get elapsed time in seconds
  getElapsedTime(): number {
    if (!this.state.startTime) return 0;

    let elapsed: number;
    if (this.state.isPaused && this.state.pausedTime) {
      // If paused, calculate up to pause time
      elapsed = this.state.pausedTime - this.state.startTime - this.state.totalPausedDuration;
    } else {
      // If running, calculate current elapsed
      elapsed = Date.now() - this.state.startTime - this.state.totalPausedDuration;
    }

    return Math.floor(elapsed / 1000);
  }

  // Get formatted time string
  getFormattedTime(): string {
    const totalSeconds = this.getElapsedTime();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Check if timer is running
  isRunning(): boolean {
    return this.state.startTime !== null && !this.state.isPaused;
  }

  // Check if timer is paused
  isPaused(): boolean {
    return this.state.isPaused;
  }

  // Check if timer is active (running or paused)
  isActive(): boolean {
    return this.state.startTime !== null;
  }

  // Subscribe to timer updates
  subscribe(listener: (elapsed: number) => void): () => void {
    this.listeners.add(listener);
    
    // Send current time immediately
    listener(this.getElapsedTime());
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners
  private notifyListeners(elapsed: number) {
    this.listeners.forEach(listener => listener(elapsed));
  }

  // Start the interval timer
  private startInterval() {
    if (this.intervalId) return;
    
    this.intervalId = setInterval(() => {
      const elapsed = this.getElapsedTime();
      this.notifyListeners(elapsed);
    }, 1000);
  }

  // Stop the interval timer
  private stopInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Get workout statistics
  async getWorkoutStats() {
    const elapsed = this.getElapsedTime();
    const activeTime = elapsed; // Total active time
    const restTime = Math.floor(this.state.totalPausedDuration / 1000); // Total rest time
    
    return {
      totalTime: elapsed,
      activeTime,
      restTime,
      averagePace: activeTime > 0 ? Math.floor(elapsed / 60) : 0, // Minutes per exercise
      startTime: this.state.startTime ? new Date(this.state.startTime).toISOString() : null,
    };
  }

  // Clear all timer data
  async clear() {
    await this.stop();
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }
}

// Export singleton instance
export default new WorkoutTimerService();