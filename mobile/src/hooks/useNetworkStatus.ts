import { useState, useEffect, useCallback } from 'react';
import { networkService } from '../services/network.service';
import { gifService } from '../services/gif.service';

export interface NetworkStatus {
  isOnline: boolean;
  isConnected: boolean;
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
    isConnected: true,
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
      isConnected: isOnline,
      isInternetReachable: isOnline,
    };
    
    const newStatus: NetworkStatus = {
      isOnline,
      isConnected: networkState.isConnected,
      isInternetReachable: networkState.isInternetReachable,
      connectionQuality: !isOnline ? 'offline' : connectionQuality,
      hasChanged: false, // Will be set below
    };

    // Detect if status has meaningfully changed
    if (previousStatus) {
      const statusChanged = (
        previousStatus.isOnline !== newStatus.isOnline ||
        previousStatus.isConnected !== newStatus.isConnected ||
        previousStatus.isInternetReachable !== newStatus.isInternetReachable ||
        previousStatus.connectionQuality !== newStatus.connectionQuality
      );
      
      newStatus.hasChanged = statusChanged;
      
      // Log significant network changes
      if (statusChanged) {
        console.log('🌐 Network status changed:', {
          from: {
            online: previousStatus.isOnline,
            quality: previousStatus.connectionQuality,
          },
          to: {
            online: newStatus.isOnline,
            quality: newStatus.connectionQuality,
          },
        });
        
        // Auto-retry failed requests when network is restored
        if (!previousStatus.isOnline && newStatus.isOnline) {
          console.log('🔄 Network restored - clearing failed request cache');
          retryFailedRequests();
        }
      }
    }

    setPreviousStatus(networkStatus);
    setNetworkStatus(newStatus);
  }, [networkStatus, previousStatus]);

  const retryFailedRequests = useCallback(() => {
    try {
      // Clear GIF service failed URLs cache to allow retries
      gifService.clearFailedUrlsCache();
      
      // Initialize network listeners if not already done
      gifService.initializeNetworkListeners();
      
      console.log('✅ Failed request caches cleared - retries enabled');
    } catch (error) {
      console.error('❌ Error clearing failed request caches:', error);
    }
  }, []);

  const clearNetworkCache = useCallback(() => {
    try {
      // Clear all network-related caches
      gifService.clearFailedUrlsCache();
      
      console.log('🗑️ Network caches cleared');
    } catch (error) {
      console.error('❌ Error clearing network caches:', error);
    }
  }, []);

  const refreshNetworkStatus = useCallback(async () => {
    console.log('🔄 Refreshing network status...');
    await updateNetworkStatus();
  }, [updateNetworkStatus]);

  // Initialize network monitoring
  useEffect(() => {
    let networkListener: (() => void) | null = null;
    let statusInterval: NodeJS.Timeout | null = null;

    const initializeNetworkMonitoring = async () => {
      // Set initial network status
      await updateNetworkStatus();

      // Listen for network state changes
      networkListener = networkService.addNetworkListener(async (networkState) => {
        console.log('📡 Network state changed:', networkState);
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
  }, [updateNetworkStatus]);

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