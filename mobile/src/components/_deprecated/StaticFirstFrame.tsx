import React, { memo, useState, useCallback } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Dimensions, 
  ActivityIndicator,
  Text,
  ImageSourcePropType
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface StaticFirstFrameProps {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  thumbnail: ImageSourcePropType; // Local require() asset for list
  gifUrl?: string; // Supabase URL for animated GIF in modal
  size?: number;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

/**
 * Optimized thumbnail component
 * - Shows static JPEG thumbnail instantly (no network call)
 * - Opens modal with full GIF animation on tap
 */
const StaticFirstFrame = memo(({
  exerciseId,
  exerciseName,
  muscleGroup,
  thumbnail,
  gifUrl,
  size = 60,
  style,
}: StaticFirstFrameProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [gifLoading, setGifLoading] = useState(true);
  
  const handlePress = useCallback(() => {
    if (gifUrl) {
      setModalVisible(true);
      setGifLoading(true);
    }
  }, [gifUrl]);
  
  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);
  
  const handleGifLoad = useCallback(() => {
    setGifLoading(false);
  }, []);

  // If no thumbnail provided, don't render anything
  if (!thumbnail) {
    return null;
  }

  return (
    <>
      {/* Static JPEG Thumbnail - Instant loading from local assets */}
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <View style={[styles.container, { width: size, height: size }, style]}>
          <Image
            source={thumbnail}
            style={styles.thumbnail}
            resizeMode="cover"
            fadeDuration={0} // No fade for instant display
          />
        </View>
      </TouchableOpacity>

      {/* Full Animated GIF Modal - Only loads when opened */}
      {gifUrl && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <TouchableOpacity style={styles.modalOverlay} onPress={closeModal} activeOpacity={1}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{exerciseName}</Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>
              
              {/* Animated GIF from Supabase */}
              <View style={styles.gifContainer}>
                {gifLoading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>운동 동작 로딩 중...</Text>
                  </View>
                )}
                
                <Image
                  source={{ uri: gifUrl }}
                  style={styles.fullGif}
                  resizeMode="contain"
                  onLoadEnd={handleGifLoad}
                />
              </View>
              
              {/* Muscle Group Tag */}
              <View style={styles.footer}>
                <View style={styles.muscleTag}>
                  <Text style={styles.muscleText}>{muscleGroup}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
}, (prevProps, nextProps) => {
  return prevProps.exerciseId === nextProps.exerciseId &&
         prevProps.gifUrl === nextProps.gifUrl &&
         prevProps.thumbnail === nextProps.thumbnail;
});

StaticFirstFrame.displayName = 'StaticFirstFrame';

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  footer: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  muscleTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
  },
  muscleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});

export default StaticFirstFrame;