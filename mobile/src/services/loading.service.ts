export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number; // 0-100 for progress bars
  type?: 'spinner' | 'progress' | 'skeleton' | 'shimmer';
  overlay?: boolean; // Show overlay behind loading
}

export interface LoadingOperation {
  id: string;
  message: string;
  type?: LoadingState['type'];
  progress?: number;
  overlay?: boolean;
}

class LoadingService {
  private activeOperations = new Map<string, LoadingOperation>();
  private listeners: ((operations: Map<string, LoadingOperation>) => void)[] = [];

  // Start a loading operation
  startLoading(operation: LoadingOperation): void {
    this.activeOperations.set(operation.id, operation);
    this.notifyListeners();
  }

  // Update progress for an operation
  updateProgress(id: string, progress: number, message?: string): void {
    const operation = this.activeOperations.get(id);
    if (operation) {
      operation.progress = progress;
      if (message) operation.message = message;
      this.activeOperations.set(id, operation);
      this.notifyListeners();
    }
  }

  // Update message for an operation
  updateMessage(id: string, message: string): void {
    const operation = this.activeOperations.get(id);
    if (operation) {
      operation.message = message;
      this.activeOperations.set(id, operation);
      this.notifyListeners();
    }
  }

  // Stop a loading operation
  stopLoading(id: string): void {
    this.activeOperations.delete(id);
    this.notifyListeners();
  }

  // Stop all loading operations
  stopAllLoading(): void {
    this.activeOperations.clear();
    this.notifyListeners();
  }

  // Check if any operation is loading
  isAnyLoading(): boolean {
    return this.activeOperations.size > 0;
  }

  // Check if specific operation is loading
  isLoading(id: string): boolean {
    return this.activeOperations.has(id);
  }

  // Get specific operation
  getOperation(id: string): LoadingOperation | undefined {
    return this.activeOperations.get(id);
  }

  // Get all active operations
  getAllOperations(): LoadingOperation[] {
    return Array.from(this.activeOperations.values());
  }

  // Get the most important operation (overlay first, then latest)
  getPrimaryOperation(): LoadingOperation | undefined {
    const operations = this.getAllOperations();
    
    // First, check for overlay operations
    const overlayOperation = operations.find(op => op.overlay);
    if (overlayOperation) return overlayOperation;
    
    // Return the most recent operation
    return operations[operations.length - 1];
  }

  // Subscribe to loading state changes
  addListener(listener: (operations: Map<string, LoadingOperation>) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(new Map(this.activeOperations));
      } catch (error) {
        console.error('Loading listener error:', error);
      }
    });
  }

  // Utility methods for common operations
  withLoading<T>(
    operation: () => Promise<T>,
    config: {
      id: string;
      message: string;
      type?: LoadingState['type'];
      overlay?: boolean;
    }
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        this.startLoading({
          id: config.id,
          message: config.message,
          type: config.type || 'spinner',
          overlay: config.overlay || false,
        });

        const result = await operation();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        this.stopLoading(config.id);
      }
    });
  }

  // Simulate progress for operations that don't have real progress
  simulateProgress(
    id: string,
    duration: number = 3000,
    onComplete?: () => void
  ): void {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      
      this.updateProgress(id, progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 100);
  }
}

export const loadingService = new LoadingService();
export default loadingService;

// Pre-defined loading operation IDs
export const LOADING_IDS = {
  // App initialization
  APP_INIT: 'app_init',
  
  // Data loading
  LOAD_ROUTINES: 'load_routines',
  LOAD_WORKOUT_HISTORY: 'load_workout_history',
  LOAD_ANALYTICS: 'load_analytics',
  LOAD_USER_PROFILE: 'load_user_profile',
  
  // CRUD operations
  CREATE_ROUTINE: 'create_routine',
  UPDATE_ROUTINE: 'update_routine',
  DELETE_ROUTINE: 'delete_routine',
  SAVE_WORKOUT: 'save_workout',
  DELETE_WORKOUT: 'delete_workout',
  
  // File operations
  UPLOAD_PHOTO: 'upload_photo',
  EXPORT_DATA: 'export_data',
  IMPORT_DATA: 'import_data',
  
  // Sync operations
  SYNC_DATA: 'sync_data',
  BACKUP_DATA: 'backup_data',
  
  // Social features
  LOAD_SOCIAL_FEED: 'load_social_feed',
  LOAD_CHALLENGES: 'load_challenges',
  SEND_CHALLENGE: 'send_challenge',
  
  // Auth operations
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
} as const;