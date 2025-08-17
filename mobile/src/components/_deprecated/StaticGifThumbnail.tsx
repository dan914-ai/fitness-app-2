import React, { memo, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Modal, Dimensions, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { getExerciseGifAsset } from '../../constants/exerciseAssets';

interface StaticGifThumbnailProps {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  size?: number;
  style?: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const StaticGifThumbnail = memo(({
  exerciseId,
  exerciseName,
  muscleGroup,
  size = 60,
  style,
}: StaticGifThumbnailProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Get local GIF asset
  const gifAsset = getExerciseGifAsset(exerciseId);
  
  // Muscle group colors for fallback
  const muscleColors: Record<string, string> = {
    '가슴': '#FF6B6B', '등': '#4ECDC4', '어깨': '#FFE66D', '이두근': '#95E1D3',
    '삼두근': '#F38181', '대퇴사두근': '#AA96DA', '햄스트링': '#FCBAD3', '둔근': '#A8E6CF',
    '복근': '#FFD93D', '종아리': '#6BCB77', '전완근': '#FF8B94', '승모근': '#C39BD3',
    '복합운동': '#F7DC6F', '유산소': '#85C1E9',
  };
  
  const backgroundColor = muscleColors[muscleGroup] || Colors.primary;
  
  const handlePress = () => {
    if (gifAsset) {
      setModalVisible(true);
      setImageLoading(true);
    }
  };
  
  const closeModal = () => {
    setModalVisible(false);
  };

  // Show static thumbnail in list
  if (!gifAsset) {
    // Fallback for exercises without GIFs
    return (
      <View style={[styles.container, { width: size, height: size, backgroundColor }, style]}>
        <Text style={[styles.fallbackText, { fontSize: size * 0.3 }]}>
          {exerciseName?.substring(0, 2) || '?'}
        </Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <View style={[styles.container, { width: size, height: size }, style]}>
          <Image
            source={gifAsset}
            style={styles.thumbnail}
            resizeMode="cover"
            // Key prop to show only first frame as static image
            defaultSource={gifAsset}
          />
          <View style={styles.playOverlay}>
            <MaterialIcons name="play-circle-outline" size={size * 0.4} color="rgba(255,255,255,0.8)" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Full GIF Modal */}
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
              {imageLoading && (
                <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
              )}
              <Image
                source={gifAsset}
                style={styles.fullGif}
                resizeMode="contain"
                onLoadEnd={() => setImageLoading(false)}
              />
            </View>
            
            <View style={styles.muscleTag}>
              <Text style={styles.muscleText}>{muscleGroup}</Text>
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
         prevProps.size === nextProps.size;
});

StaticGifThumbnail.displayName = 'StaticGifThumbnail';

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
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
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
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
    borderRadius: 12,
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
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
  muscleTag: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
  },
  muscleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});

export default StaticGifThumbnail;