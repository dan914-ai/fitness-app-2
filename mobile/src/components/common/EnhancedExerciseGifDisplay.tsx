import React, { memo, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { exerciseDatabaseService } from '../../services/exerciseDatabase.service';
import { getExerciseGifUrls, getPlaceholderUrl } from '../../utils/gifUrlHelper';
import NetworkErrorBoundary from './NetworkErrorBoundary';
import NetworkAwareImage from './NetworkAwareImage';

interface EnhancedExerciseGifDisplayProps {
  exerciseId: string;
  exerciseName?: string;
  showDebugInfo?: boolean;
  height?: number;
  onFallbackUsed?: (fallbackType: 'gif' | 'thumbnail' | 'placeholder') => void;
  onNetworkError?: (error: any) => void;
}

/**
 * Enhanced exercise GIF display with comprehensive network failure handling
 * 
 * Features:
 * - Network error boundary for graceful error handling
 * - Multiple fallback strategies: primary GIF → fallback GIFs → static thumbnail → placeholder
 * - Network status monitoring and automatic retry
 * - Debug information for development
 * - Performance optimized with memoization
 */
const EnhancedExerciseGifDisplay = memo(({
  exerciseId,
  exerciseName,
  showDebugInfo = false,
  height = 200,
  onFallbackUsed,
  onNetworkError,
}: EnhancedExerciseGifDisplayProps) => {
  const [debugInfo, setDebugInfo] = useState<{
    primaryUrl?: string;
    fallbackUrls: string[];
    currentSource?: string;
    fallbackType?: string;
  }>({ fallbackUrls: [] });

  // Get exercise data from database service
  const exerciseData = exerciseDatabaseService.getExerciseById(exerciseId);
  
  // Build comprehensive URL list with fallbacks
  const gifUrls = useMemo(() => {
    const urls: Array<{ uri: string }> = [];
    
    // First priority: Database gifUrl (not imageUrl!)
    if (exerciseData?.gifUrl) {
      urls.push({ uri: exerciseData.gifUrl });
    }
    
    // Second priority: Generated URLs from utility
    const generatedUrls = getExerciseGifUrls(exerciseId);
    generatedUrls.forEach(url => urls.push({ uri: url }));
    
    return urls;
  }, [exerciseId, exerciseData]);
  
  // Update debug info in a separate effect
  React.useEffect(() => {
    if (showDebugInfo && exerciseData) {
      const generatedUrls = getExerciseGifUrls(exerciseId);
      setDebugInfo({
        primaryUrl: exerciseData?.gifUrl,
        fallbackUrls: generatedUrls,
        currentSource: exerciseData?.gifUrl || generatedUrls[0],
        fallbackType: undefined,
      });
    }
  }, [exerciseId, exerciseData, showDebugInfo]);

  const handleFallbackUsed = useCallback((fallbackType: 'fallback' | 'thumbnail' | 'placeholder') => {
    console.log(`🎯 Fallback used for exercise ${exerciseId}: ${fallbackType}`);
    
    if (showDebugInfo) {
      setDebugInfo(prev => ({ ...prev, fallbackType }));
    }
    
    // Map NetworkAwareImage fallback types to our expected types
    const mappedType = fallbackType === 'fallback' ? 'gif' : fallbackType;
    onFallbackUsed?.(mappedType);
  }, [exerciseId, showDebugInfo, onFallbackUsed]);

  const handleNetworkError = useCallback((error: any) => {
    console.error(`Network error loading GIF for ${exerciseId}:`, error);
    onNetworkError?.(error);
  }, [exerciseId, onNetworkError]);

  const handleRetry = useCallback(() => {
    console.log(`🔄 Retrying GIF load for exercise ${exerciseId}`);
    // NetworkAwareImage handles the actual retry logic
  }, [exerciseId]);

  return (
    <NetworkErrorBoundary
      fallback={
        <View style={[styles.container, { height }]}>
          <View style={styles.errorFallback}>
            <MaterialIcons name="wifi-off" size={48} color={Colors.error} />
            <Text style={styles.errorText}>네트워크 오류</Text>
            <Text style={styles.errorSubtext}>
              인터넷 연결을 확인하고 다시 시도해주세요
            </Text>
          </View>
        </View>
      }
      onRetry={handleRetry}
      showNetworkStatus={true}
    >
      <View style={[styles.container, { height }]}>
        {/* Debug Information */}
        {showDebugInfo && (
          <View style={styles.debugOverlay}>
            <Text style={styles.debugText}>ID: {exerciseId}</Text>
            <Text style={styles.debugText}>
              Primary: {debugInfo.primaryUrl ? '✅' : '❌'}
            </Text>
            <Text style={styles.debugText}>
              Fallbacks: {debugInfo.fallbackUrls.length}
            </Text>
            {debugInfo.fallbackType && (
              <Text style={styles.debugText}>
                Using: {debugInfo.fallbackType}
              </Text>
            )}
          </View>
        )}

        <NetworkAwareImage
          source={gifUrls[0]} // Primary source
          fallbackSources={gifUrls.slice(1)} // Remaining as fallbacks
          exerciseId={exerciseId}
          exerciseName={exerciseName}
          style={styles.gifImage}
          containerStyle={styles.imageContainer}
          resizeMode="contain"
          showRetryButton={true}
          showNetworkStatus={false} // Handled by error boundary
          showLoadingIndicator={true}
          placeholderText={exerciseName}
          placeholderIcon="fitness-center"
          onError={handleNetworkError}
          onFallbackUsed={handleFallbackUsed}
          onRetry={handleRetry}
        />
      </View>
    </NetworkErrorBoundary>
  );
});

EnhancedExerciseGifDisplay.displayName = 'EnhancedExerciseGifDisplay';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    flex: 1,
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  errorFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
    marginTop: 12,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  debugOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1000,
  },
  debugText: {
    fontSize: 10,
    color: '#FFFFFF',
    lineHeight: 12,
  },
});

export default EnhancedExerciseGifDisplay;