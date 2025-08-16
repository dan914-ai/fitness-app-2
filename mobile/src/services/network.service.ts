import NetInfo from '@react-native-community/netinfo';
import { setOfflineMode } from '../utils/offlineMode';
import { checkBackendConnection } from '../utils/backendConnection';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  details: any;
}

export interface BackendConnectionState {
  isBackendAvailable: boolean;
  lastChecked: Date;
  retryCount: number;
}

class NetworkService {
  private networkState: NetworkState | null = null;
  private backendState: BackendConnectionState = {
    isBackendAvailable: false,
    lastChecked: new Date(),
    retryCount: 0,
  };
  private listeners: ((state: NetworkState) => void)[] = [];
  private backendListeners: ((state: BackendConnectionState) => void)[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Get initial network state
      const state = await NetInfo.fetch();
      this.networkState = this.transformNetInfoState(state);
      
      // Subscribe to network state changes
      NetInfo.addEventListener(state => {
        const transformedState = this.transformNetInfoState(state);
        this.networkState = transformedState;
        this.notifyNetworkListeners(transformedState);
        
        // If we get back online, check backend availability
        if (transformedState.isConnected && transformedState.isInternetReachable) {
          this.checkBackendAvailability();
        } else {
          // If we're offline, update offline mode
          setOfflineMode(true);
          this.updateBackendState({
            isBackendAvailable: false,
            lastChecked: new Date(),
            retryCount: 0,
          });
        }
      });

      // Initial backend check
      await this.checkBackendAvailability();

      // Start periodic backend checks (every 30 seconds when online)
      this.startPeriodicBackendCheck();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize network service:', error);
      // Fallback to offline mode
      setOfflineMode(true);
    }
  }

  private transformNetInfoState(state: any): NetworkState {
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type || 'unknown',
      details: state.details || {},
    };
  }

  private async checkBackendAvailability(): Promise<void> {
    try {
      if (!this.networkState?.isConnected || !this.networkState?.isInternetReachable) {
        return;
      }

      const isAvailable = await checkBackendConnection();
      
      this.updateBackendState({
        isBackendAvailable: isAvailable,
        lastChecked: new Date(),
        retryCount: isAvailable ? 0 : this.backendState.retryCount + 1,
      });

      setOfflineMode(!isAvailable);
    } catch (error) {
      console.error('Backend availability check failed:', error);
      this.updateBackendState({
        isBackendAvailable: false,
        lastChecked: new Date(),
        retryCount: this.backendState.retryCount + 1,
      });
      setOfflineMode(true);
    }
  }

  private updateBackendState(newState: BackendConnectionState): void {
    this.backendState = newState;
    this.notifyBackendListeners(newState);
  }

  private startPeriodicBackendCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      if (this.networkState?.isConnected && this.networkState?.isInternetReachable) {
        this.checkBackendAvailability();
      }
    }, 30000); // Check every 30 seconds
  }

  private notifyNetworkListeners(state: NetworkState): void {
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Network listener error:', error);
      }
    });
  }

  private notifyBackendListeners(state: BackendConnectionState): void {
    this.backendListeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Backend listener error:', error);
      }
    });
  }

  // Public methods
  getCurrentNetworkState(): NetworkState | null {
    return this.networkState;
  }

  getCurrentBackendState(): BackendConnectionState {
    return this.backendState;
  }

  isOnline(): boolean {
    return this.networkState?.isConnected === true && 
           this.networkState?.isInternetReachable === true;
  }

  isBackendAvailable(): boolean {
    return this.backendState.isBackendAvailable;
  }

  isOfflineMode(): boolean {
    return !this.isOnline() || !this.isBackendAvailable();
  }

  addNetworkListener(listener: (state: NetworkState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  addBackendListener(listener: (state: BackendConnectionState) => void): () => void {
    this.backendListeners.push(listener);
    return () => {
      this.backendListeners = this.backendListeners.filter(l => l !== listener);
    };
  }

  async forceBackendCheck(): Promise<boolean> {
    await this.checkBackendAvailability();
    return this.isBackendAvailable();
  }

  getConnectionQuality(): 'excellent' | 'good' | 'poor' | 'offline' {
    if (!this.isOnline()) return 'offline';
    
    const details = this.networkState?.details;
    const type = this.networkState?.type;
    
    if (type === 'wifi') {
      // WiFi is generally good
      return 'excellent';
    } else if (type === 'cellular') {
      // Check cellular generation
      const effectiveType = details?.effectiveType;
      if (effectiveType === '4g' || effectiveType === '5g') {
        return 'excellent';
      } else if (effectiveType === '3g') {
        return 'good';
      } else {
        return 'poor';
      }
    }
    
    return 'good'; // Default fallback
  }

  getRetryDelay(): number {
    const retryCount = this.backendState.retryCount;
    // Exponential backoff: 2^retryCount * 1000ms, max 30 seconds
    return Math.min(Math.pow(2, retryCount) * 1000, 30000);
  }

  cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.listeners = [];
    this.backendListeners = [];
    this.isInitialized = false;
  }
}

export const networkService = new NetworkService();
export default networkService;