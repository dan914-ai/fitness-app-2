import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  fullScreen?: boolean;
  transparent?: boolean;
}

const { width, height } = Dimensions.get('window');

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = '로딩 중...',
  fullScreen = false,
  transparent = true,
}) => {
  if (!visible) return null;

  const content = (
    <View style={[styles.container, transparent && styles.transparent]}>
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={Colors.primary} />
        {message && <Text style={styles.loadingText}>{message}</Text>}
      </View>
    </View>
  );

  if (fullScreen) {
    return (
      <Modal
        visible={visible}
        transparent={transparent}
        animationType="fade"
        statusBarTranslucent
      >
        {content}
      </Modal>
    );
  }

  return content;
};

export const LoadingSpinner: React.FC<{ size?: 'small' | 'large'; color?: string }> = ({
  size = 'large',
  color = Colors.primary,
}) => {
  return <ActivityIndicator size={size} color={color} />;
};

export const LoadingContainer: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      {message && <Text style={styles.loadingText}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
  },
  transparent: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

export default LoadingOverlay;