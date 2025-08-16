import AsyncStorage from '@react-native-async-storage/async-storage';
import errorService from '../services/error.service';
import { getOfflineMode } from './offlineMode';
import { safeJsonParse, safeJsonStringify } from '../utils/safeJsonParse';

// Enhanced wrapper for API calls with comprehensive error handling
export async function apiCall<T>(
  apiFunction: () => Promise<T>,
  offlineDefault: T,
  options?: {
    cacheKey?: string;
    showError?: boolean;
    operation?: string;
    screen?: string;
    retryOptions?: {
      maxRetries?: number;
      retryDelay?: number;
    };
  }
): Promise<T> {
  const {
    cacheKey,
    showError = false,
    operation = 'API Call',
    screen,
    retryOptions,
  } = options || {};

  try {
    // If we're offline, return cached data or offline default
    if (getOfflineMode()) {
      
      if (cacheKey) {
        try {
          const cached = await AsyncStorage.getItem(cacheKey);
          if (cached) {
            return JSON.parse(cached);
          }
        } catch (cacheError) {
          console.warn('Failed to get cached data in offline mode:', cacheError);
        }
      }
      
      return offlineDefault;
    }

    // Use retry wrapper if retry options provided
    const executeCall = retryOptions
      ? () => errorService.withRetry(
          apiFunction,
          { operation, screen, timestamp: new Date() },
          retryOptions
        )
      : apiFunction;

    const result = await executeCall();
    
    // Cache the result if a cache key is provided
    if (cacheKey) {
      try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
      } catch (cacheError) {
        console.warn('Failed to cache result:', cacheError);
      }
    }
    
    return result;
  } catch (error) {
    const apiError = error as Error;
    
    // Handle error using error service
    if (showError) {
      await errorService.handleError(apiError, {
        operation,
        screen,
        timestamp: new Date(),
        data: { cacheKey, hasOfflineDefault: !!offlineDefault },
      }, {
        showToUser: true,
        allowRetry: !!retryOptions,
        logToAnalytics: true,
      });
    } else {
      // Still log the error even if not showing to user
      await errorService.handleError(apiError, {
        operation,
        screen,
        timestamp: new Date(),
        data: { cacheKey, hasOfflineDefault: !!offlineDefault },
      }, {
        showToUser: false,
        logToAnalytics: true,
      });
    }
    
    // Try to get cached data if available
    if (cacheKey) {
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (cacheError) {
        console.warn('Failed to get cached data after API failure:', cacheError);
      }
    }
    
    // Return offline default as last resort
    return offlineDefault;
  }
}


// Enhanced API call wrapper specifically for critical operations
export async function criticalApiCall<T>(
  apiFunction: () => Promise<T>,
  context: { operation: string; screen?: string },
  options?: {
    maxRetries?: number;
    showUserError?: boolean;
    fallbackData?: T;
  }
): Promise<T> {
  const { operation, screen } = context;
  const { maxRetries = 3, showUserError = true, fallbackData } = options || {};

  try {
    return await errorService.withRetry(
      apiFunction,
      { operation, screen, timestamp: new Date() },
      {
        maxRetries,
        retryDelay: 1000,
        backoffMultiplier: 1.5,
      }
    );
  } catch (error) {
    const apiError = error as Error;
    
    await errorService.handleError(apiError, {
      operation,
      screen,
      timestamp: new Date(),
      data: { maxRetries, hasFallback: !!fallbackData },
    }, {
      showToUser: showUserError,
      allowRetry: true,
      logToAnalytics: true,
    });
    
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    
    throw apiError;
  }
}