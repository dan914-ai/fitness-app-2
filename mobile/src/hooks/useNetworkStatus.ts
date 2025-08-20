import { useState, useEffect, useCallback } from 'react';
import { networkService } from '../services/network.service';
import { gifService } from '../services/gif.service';

export interface NetworkStatus {
  isOnline: boolean;
  isInternetReachable: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  hasChanged: boolean;
}

export interface NetworkStatusHookReturn {
  networkStatus: NetworkStatus;
  retryFailedRequests: () => void;
  clearNetworkCache: () => void;
  refreshNetworkStatus: () => Promise<void>;
}

/**
 * Custom hook for comprehensive network status monitoring and management
 * 
 * Features:
 * - Real-time network status monitoring
 * - Connection quality assessment
 * - Automatic retry of failed requests when network is restored
 * - Network cache management
 * - Change detection for reactive UI updates
 */
export const useNetworkStatus = (): NetworkStatusHookReturn => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: true,
    isInternetReachable: true,
    connectionQuality: 'excellent',
    hasChanged: false,
  });

  const [previousStatus, setPreviousStatus] = useState<NetworkStatus | null>(null);

  const updateNetworkStatus = useCallback(async () => {
    const isOnline = networkService.isOnline();
    const connectionQuality = networkService.getConnectionQuality();
    
    // Get network state from service
    const networkState = {
      isInternetReachable: isOnline,
    };
    
    const newStatus: NetworkStatus = {
      isOnline,
      isInternetReachable: networkState.isInternetReachable,
      connectionQuality: !isOnline ? 'offline' : connectionQuality,
      hasChanged: false, // Will be set below
    };

    setNetworkStatus((currentStatus) => {
      setPreviousStatus(currentStatus);
      
      // Detect if status has meaningfully changed
      const statusChanged = (
        currentStatus.isOnline !== newStatus.isOnline ||
        currentStatus.isConnected !== newStatus.isConnected ||
        currentStatus.isInternetReachable !== newStatus.isInternetReachable ||
        currentStatus.connectionQuality !== newStatus.connectionQuality
      );
      
      newStatus.hasChanged = statusChanged;
      
      // Log significant network changes
      if (statusChanged) {
          from: {
            online: currentStatus.isOnline,
            quality: currentStatus.connectionQuality,
          },
          to: {
            online: newStatus.isOnline,
            quality: newStatus.connectionQuality,
          },
        });
        
        // Auto-retry failed requests when network is restored
        if (!currentStatus.isOnline && newStatus.isOnline) {
          // Note: We'll call retryFailedRequests outside the state update
          setTimeout(() => {
            gifService.clearFailedUrlsCache();
            gifService.initializeNetworkListeners();
          }, 0);
        }
      }
      
      return newStatus;
    });
  }, []);

  const retryFailedRequests = useCallback(() => {
    try {
      // Clear GIF service failed URLs cache to allow retries
      gifService.clearFailedUrlsCache();
      
      // Initialize network listeners if not already done
      gifService.initializeNetworkListeners();
      
    } catch (error) {
      console.error('❌ Error clearing failed request caches:', error);
    }
  }, []);

  const clearNetworkCache = useCallback(() => {
    try {
      // Clear all network-related caches
      gifService.clearFailedUrlsCache();
      
    } catch (error) {
      console.error('❌ Error clearing network caches:', error);
    }
  }, []);

  const refreshNetworkStatus = useCallback(async () => {
    await updateNetworkStatus();
  }, []);

  // Initialize network monitoring
  useEffect(() => {
    let networkListener: (() => void) | null = null;
    let statusInterval: NodeJS.Timeout | null = null;

    const initializeNetworkMonitoring = async () => {
      // Set initial network status
      await updateNetworkStatus();

      // Listen for network state changes
      networkListener = networkService.addNetworkListener(async (networkState) => {
        await updateNetworkStatus();
      });

      // Periodic status checks (every 30 seconds)
      statusInterval = setInterval(async () => {
        await updateNetworkStatus();
      }, 30000);

      // Initialize GIF service network listeners
      gifService.initializeNetworkListeners();
    };

    initializeNetworkMonitoring();

    // Cleanup
    return () => {
      if (networkListener) {
        networkListener();
      }
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, []);

  return {
    networkStatus,
    retryFailedRequests,
    clearNetworkCache,
    refreshNetworkStatus,
  };
};

/**
 * Hook for simplified network status checking
 */
export const useNetworkOnline = (): boolean => {
  const { networkStatus } = useNetworkStatus();
  return networkStatus.isOnline;
};

/**
 * Hook for network quality monitoring
 */
export const useNetworkQuality = (): 'excellent' | 'good' | 'poor' | 'offline' => {
  const { networkStatus } = useNetworkStatus();
  return networkStatus.connectionQuality;
};

export default useNetworkStatus;