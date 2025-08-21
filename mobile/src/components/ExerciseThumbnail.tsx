import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface ExerciseThumbnailProps {
  source: any; // Can be a URL string, local asset, or null
  exerciseName: string;
  muscleGroup?: string;
  style?: any;
}

const ExerciseThumbnail: React.FC<ExerciseThumbnailProps> = ({ 
  source, 
  exerciseName, 
  muscleGroup,
  style 
}) => {
  // DEPRECATION WARNING
  React.useEffect(() => {
    console.warn(
      '⚠️ ExerciseThumbnail in components/ is DEPRECATED. Please use UnifiedExerciseThumbnail instead.\n' +
      `Usage: import UnifiedExerciseThumbnail from './common/UnifiedExerciseThumbnail'\n` +
      `Found in component using exerciseName: ${exerciseName}`
    );
  }, []);

  // If no source available, show placeholder
  if (!source) {
    return (
      <View style={[styles.placeholder, style]}>
        <Icon name="fitness-center" size={24} color={Colors.textSecondary} />
        <Text style={styles.placeholderText}>{muscleGroup || '운동'}</Text>
      </View>
    );
  }
  
  // Determine image source type
  const imageSource = typeof source === 'string' 
    ? { uri: source }  // URL string
    : source;          // Local asset (from require())
  
  return (
    <Image
      source={imageSource}
      style={[styles.image, style]}
      resizeMode="cover"
      defaultSource={undefined}
      fadeDuration={0}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 60,
    height: 60,
    borderRadius: 16,
  },
  placeholder: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholderText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});

export default ExerciseThumbnail;