import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ImageSourcePropType,
  ImageStyle,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { gifService, NetworkAwareImageState } from '../../services/gif.service';
import { networkService } from '../../services/network.service';
import { staticThumbnails } from '../../constants/staticThumbnails';

interface NetworkAwareImageProps {
  // Primary image source
  source?: { uri: string } | ImageSourcePropType;
  
  // Fallback sources (tried in order)
  fallbackSources?: Array<{ uri: string } | ImageSourcePropType>;
  
  // Exercise-specific fallback (uses static thumbnails)
  exerciseId?: string;
  exerciseName?: string;
  
  // Style props
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  
  // Display options
  showRetryButton?: boolean;
  showNetworkStatus?: boolean;
  showLoadingIndicator?: boolean;
  retryButtonText?: string;
  
  // Placeholder options
  placeholderText?: string;
  placeholderIcon?: string;
  placeholderColor?: string;
  
  // Callbacks
  onLoad?: () => void;
  onError?: (error: any) => void;
  onRetry?: () => void;
  onFallbackUsed?: (fallbackType: 'fallback' | 'thumbnail' | 'placeholder') => void;
  
  // Image props passthrough
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  fadeDuration?: number;
}

/**
 * NetworkAwareImage - Comprehensive image loading with network failure handling
 * 
 * Features:
 * - Multiple fallback sources with automatic retry
 * - Exercise-specific static thumbnail fallbacks
 * - Network status monitoring and automatic retry when connection restored
 * - Exponential backoff retry logic
 * - User-friendly error states with manual retry
 * - Loading indicators and network status display
 * - Graceful degradation to placeholders
 */
const NetworkAwareImage: React.FC<NetworkAwareImageProps> = ({
  source,
  fallbackSources = [],
  exerciseId,
  exerciseName,
  style,
  containerStyle,
  showRetryButton = true,
  showNetworkStatus = false,
  showLoadingIndicator = true,
  retryButtonText = '다시 시도',
  placeholderText,
  placeholderIcon = 'image-not-supported',
  placeholderColor,
  onLoad,
  onError,
  onRetry,
  onFallbackUsed,
  resizeMode = 'cover',
  fadeDuration = 300,
}) => {
  const [imageState, setImageState] = useState<NetworkAwareImageState>({
    isLoading: true,
    hasError: false,
    retryCount: 0,
    isFromFallback: false,
    networkStatus: 'online',
  });
  
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [currentSource, setCurrentSource] = useState<{ uri: string } | ImageSourcePropType | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const networkListenerRef = useRef<(() => void) | null>(null);

  // Build complete source list with fallbacks
  const allSources = React.useMemo(() => {
    const sources: Array<{ uri: string } | ImageSourcePropType> = [];
    
    // Add primary source
    if (source) {
      sources.push(source);
    }
    
    // Add fallback sources
    sources.push(...fallbackSources);
    
    // Add exercise-specific thumbnail fallback
    if (exerciseId && staticThumbnails[exerciseId]) {
      sources.push(staticThumbnails[exerciseId]);
    }
    
    return sources;
  }, [source, fallbackSources, exerciseId]);

  // Initialize network monitoring
  useEffect(() => {
    const updateNetworkStatus = () => {
      const isOnline = networkService.isOnline();
      const quality = networkService.getConnectionQuality();
      const status = !isOnline ? 'offline' : quality === 'poor' ? 'poor' : 'online';
      
      setImageState(prev => ({ ...prev, networkStatus: status }));
    };

    // Set initial network status
    updateNetworkStatus();

    // Listen for network changes
    networkListenerRef.current = networkService.addNetworkListener((networkState) => {
      updateNetworkStatus();
      
      // Auto-retry when network is restored and we have an error
      if (networkState.isConnected && imageState.hasError) {
        scheduleRetry(1000); // Retry after 1 second
      }
    });

    return () => {
      if (networkListenerRef.current) {
        networkListenerRef.current();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Set current source when sources or index changes
  useEffect(() => {
    if (currentSourceIndex < allSources.length) {
      setCurrentSource(allSources[currentSourceIndex]);
    } else {
      setCurrentSource(null); // No more sources to try
    }
  }, [allSources, currentSourceIndex]);

  // Reset when primary source changes
  useEffect(() => {
    setCurrentSourceIndex(0);
    setImageState({
      isLoading: true,
      hasError: false,
      retryCount: 0,
      isFromFallback: false,
      networkStatus: networkService.isOnline() ? 'online' : 'offline',
    });
  }, [source]);

  const scheduleRetry = useCallback((delay: number) => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    retryTimeoutRef.current = setTimeout(() => {
      handleRetry();
    }, delay);
  }, []);

  const calculateRetryDelay = useCallback((retryCount: number): number => {
    // Exponential backoff: 2^retryCount * 1000ms, max 30 seconds
    return Math.min(Math.pow(2, retryCount) * 1000, 30000);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false,
    }));
    
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback((error: any) => {
    
    // Try next source if available
    if (currentSourceIndex < allSources.length - 1) {
      const nextIndex = currentSourceIndex + 1;
      setCurrentSourceIndex(nextIndex);
      
      // Notify about fallback usage
      if (nextIndex > 0 && onFallbackUsed) {
        const fallbackType = nextIndex === allSources.length - 1 && exerciseId ? 'thumbnail' : 'fallback';
        onFallbackUsed(fallbackType);
      }
      
      setImageState(prev => ({
        ...prev,
        isLoading: true,
        hasError: false,
        isFromFallback: nextIndex > 0,
      }));
    } else {
      // All sources failed
      setImageState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        errorMessage: error?.message || 'Failed to load image',
      }));
      
      onError?.(error);
      onFallbackUsed?.('placeholder');
      
      // Auto-retry for network errors
      if (imageState.retryCount < 3 && networkService.isOnline()) {
        const delay = calculateRetryDelay(imageState.retryCount);
        scheduleRetry(delay);
      }
    }
  }, [currentSourceIndex, allSources.length, exerciseId, onFallbackUsed, onError, imageState.retryCount, calculateRetryDelay, scheduleRetry]);

  const handleRetry = useCallback(() => {
    // Reset to first source and retry
    setCurrentSourceIndex(0);
    setImageState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
      retryCount: prev.retryCount + 1,
      isFromFallback: false,
    }));
    
    onRetry?.();
  }, [onRetry]);

  const renderPlaceholder = () => {
    const backgroundColor = placeholderColor || Colors.surface;
    const displayText = placeholderText || exerciseName || '이미지 없음';
    
    return (
      <View style={[styles.placeholder, { backgroundColor }, style]}>
        <MaterialIcons 
          name={placeholderIcon as any} 
          size={48} 
          color={Colors.textSecondary} 
        />
        {displayText && (
          <Text style={styles.placeholderText} numberOfLines={2}>
            {displayText}
          </Text>
        )}
      </View>
    );
  };

  const renderError = () => {
    return (
      <View style={[styles.errorContainer, style]}>
        <MaterialIcons 
          name={imageState.networkStatus === 'offline' ? 'wifi-off' : 'error-outline'} 
          size={48} 
          color={Colors.error} 
        />
        <Text style={styles.errorText}>
          {imageState.networkStatus === 'offline' 
            ? '인터넷 연결을 확인해주세요' 
            : '이미지를 불러올 수 없습니다'}
        </Text>
        
        {showNetworkStatus && (
          <View style={styles.networkStatusContainer}>
            <View style={[
              styles.networkIndicator,
              { backgroundColor: imageState.networkStatus === 'online' ? Colors.success : Colors.error }
            ]} />
            <Text style={styles.networkStatusText}>
              {imageState.networkStatus === 'online' ? '온라인' : 
               imageState.networkStatus === 'poor' ? '연결 불안정' : '오프라인'}
            </Text>
          </View>
        )}
        
        {showRetryButton && (
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={handleRetry}
            activeOpacity={0.7}
          >
            <MaterialIcons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>
              {retryButtonText} {imageState.retryCount > 0 && `(${imageState.retryCount + 1}회)`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderLoading = () => {
    if (!showLoadingIndicator) return null;
    
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>로딩중...</Text>
      </View>
    );
  };

  // If no current source available, show placeholder
  if (!currentSource) {
    return (
      <View style={containerStyle}>
        {renderPlaceholder()}
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {imageState.hasError ? (
        renderError()
      ) : (
        <>
          <Image
            source={currentSource}
            style={style}
            resizeMode={resizeMode}
            fadeDuration={fadeDuration}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {imageState.isLoading && renderLoading()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    minHeight: 100,
  },
  placeholderText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    minHeight: 100,
  },
  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  networkStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.background,
    borderRadius: 16,
  },
  networkIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  networkStatusText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});

export default NetworkAwareImage;