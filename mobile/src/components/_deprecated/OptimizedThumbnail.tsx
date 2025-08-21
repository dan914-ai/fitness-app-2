import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Text,
  Dimensions,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { imageCacheService } from '../../services/imageCache.service';

interface OptimizedThumbnailProps {
  url: string | null;
  fallbackText?: string;
  fallbackColor?: string;
  style?: any;
  onLoad?: () => void;
  onError?: () => void;
  priority?: 'high' | 'low';
  preloadUrls?: string[]; // Additional URLs to preload
}

const { width: screenWidth } = Dimensions.get('window');
const THUMBNAIL_SIZE = 60;

export default function OptimizedThumbnail({
  url,
  fallbackText = '?',
  fallbackColor = Colors.primaryLight,
  style,
  onLoad,
  onError,
  priority = 'low',
  preloadUrls = [],
}: OptimizedThumbnailProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [shouldLoad, setShouldLoad] = useState(priority === 'high');
  const isMounted = useRef(true);
  const loadTimeoutRef = useRef<NodeJS.Timeout>();

  // Memoize the thumbnail URL to prevent unnecessary re-renders
  const thumbnailUrl = useMemo(() => {
    if (!url) return null;
    
    // For GIFs, we could potentially create a smaller thumbnail version
    // For now, just return the URL
    return url;
  }, [url]);

  useEffect(() => {
    isMounted.current = true;
    
    // High priority images load immediately
    // Low priority images load after a short delay
    if (priority === 'low') {
      loadTimeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          setShouldLoad(true);
        }
      }, 100);
    }

    // Preload additional URLs in background
    if (preloadUrls.length > 0) {
      imageCacheService.batchPreload(preloadUrls);
    }

    return () => {
      isMounted.current = false;
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [priority, preloadUrls]);

  const handleImageLoad = () => {
    if (isMounted.current) {
      setImageState('loaded');
      onLoad?.();
    }
  };

  const handleImageError = () => {
    if (isMounted.current) {
      setImageState('error');
      onError?.();
    }
  };

  // Show placeholder if no URL or error
  if (!thumbnailUrl || imageState === 'error') {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.placeholder, { backgroundColor: fallbackColor }]}>
          <Text style={styles.placeholderText}>
            {fallbackText.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>
    );
  }

  // Don't load image until shouldLoad is true (for lazy loading)
  if (!shouldLoad) {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.placeholder, { backgroundColor: Colors.border }]}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: thumbnailUrl }}
        style={styles.image}
        resizeMode="cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
        // Performance optimizations
        fadeDuration={0} // Disable fade animation for faster rendering
        progressiveRenderingEnabled={true} // Enable progressive loading
        // Cache control
        cache="force-cache"
      />
      {imageState === 'loading' && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});