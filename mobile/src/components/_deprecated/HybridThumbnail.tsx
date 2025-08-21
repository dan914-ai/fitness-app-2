import React, { memo, useState, useCallback } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Dimensions, 
  Text, 
  ActivityIndicator 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { getThumbnailAsset, hasThumbnail } from '../../constants/thumbnailMapping';

interface HybridThumbnailProps {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  imageUrl?: string; // Supabase GIF URL for modal
  size?: number;
  style?: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Hybrid Thumbnail Component
 * - Shows local static GIF (first frame) in list for instant loading
 * - Opens modal with Supabase GIF on tap for full animation
 * - Falls back to colored placeholder if no local asset
 */
const HybridThumbnail = memo(({
  exerciseId,
  exerciseName,
  muscleGroup,
  imageUrl,
  size = 60,
  style,
}: HybridThumbnailProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [gifLoading, setGifLoading] = useState(true);
  const [gifError, setGifError] = useState(false);
  
  // Get local thumbnail asset
  const localAsset = getThumbnailAsset(exerciseId);
  const hasLocalThumbnail = !!localAsset;
  
  // No placeholders - only real GIFs
  
  const handlePress = useCallback(() => {
    if (imageUrl || hasLocalThumbnail) {
      setModalVisible(true);
      setGifLoading(true);
      setGifError(false);
    }
  }, [imageUrl, hasLocalThumbnail]);
  
  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);
  
  const handleGifLoad = useCallback(() => {
    setGifLoading(false);
  }, []);
  
  const handleGifError = useCallback(() => {
    setGifLoading(false);
    setGifError(true);
  }, []);

  // Render thumbnail in list
  if (!hasLocalThumbnail) {
    // NO PLACEHOLDERS - if no local asset, try to load from Supabase URL directly
    if (!imageUrl) {
      return null; // Don't show anything if no GIF available
    }
    
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <View style={[styles.container, { width: size, height: size }, style]}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
            onError={handleGifError}
          />
          <View style={styles.playOverlay}>
            <MaterialIcons name="play-circle-outline" size={size * 0.35} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <View style={[styles.container, { width: size, height: size }, style]}>
          <Image
            source={localAsset}
            style={styles.thumbnail}
            resizeMode="cover"
            // Show only first frame as static image
            defaultSource={localAsset}
          />
          <View style={styles.playOverlay}>
            <MaterialIcons name="play-circle-outline" size={size * 0.35} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Full GIF Modal - Loads from Supabase or shows local */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={closeModal} activeOpacity={1}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{exerciseName}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.gifContainer}>
              {gifLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.loadingText}>운동 동작 로딩 중...</Text>
                </View>
              )}
              
              {gifError && !imageUrl ? (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error-outline" size={48} color={Colors.textSecondary} />
                  <Text style={styles.errorText}>동작을 불러올 수 없습니다</Text>
                  <Text style={styles.errorSubtext}>인터넷 연결을 확인해주세요</Text>
                </View>
              ) : (
                <Image
                  source={imageUrl ? { uri: imageUrl } : localAsset}
                  style={styles.fullGif}
                  resizeMode="contain"
                  onLoadEnd={handleGifLoad}
                  onError={handleGifError}
                />
              )}
            </View>
            
            <View style={styles.infoContainer}>
              <View style={styles.muscleTag}>
                <Text style={styles.muscleText}>{muscleGroup}</Text>
              </View>
              {!imageUrl && (
                <Text style={styles.offlineNote}>오프라인 모드</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}, (prevProps, nextProps) => {
  return prevProps.exerciseId === nextProps.exerciseId &&
         prevProps.exerciseName === nextProps.exerciseName &&
         prevProps.muscleGroup === nextProps.muscleGroup &&
         prevProps.imageUrl === nextProps.imageUrl &&
         prevProps.size === nextProps.size;
});

HybridThumbnail.displayName = 'HybridThumbnail';

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.border,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.9,
    maxWidth: 400,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  gifContainer: {
    width: '100%',
    height: screenWidth * 0.8,
    maxHeight: 400,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  fullGif: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  infoContainer: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  muscleTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
  },
  muscleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  offlineNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default HybridThumbnail;