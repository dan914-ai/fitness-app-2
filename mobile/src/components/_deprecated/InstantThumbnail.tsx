import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors } from '../../constants/colors';

interface InstantThumbnailProps {
  exerciseName: string;
  muscleGroup: string;
  style?: any;
  size?: number;
}

// Simple color mapping for instant thumbnails
const MUSCLE_COLORS: Record<string, string> = {
  '가슴': '#FF6B6B',     // Red
  '등': '#4ECDC4',       // Teal  
  '어깨': '#FFE66D',     // Yellow
  '이두근': '#95E1D3',   // Mint
  '삼두근': '#F38181',   // Pink
  '대퇴사두근': '#AA96DA', // Purple
  '햄스트링': '#FCBAD3', // Light Pink
  '둔근': '#A8E6CF',     // Light Green
  '복근': '#FFD93D',     // Gold
  '종아리': '#6BCB77',   // Green
  '전완근': '#FF8B94',   // Coral
  '승모근': '#C39BD3',   // Light Purple
  '복합운동': '#F7DC6F', // Light Gold
  '유산소': '#85C1E9',   // Light Blue
};

/**
 * InstantThumbnail - Uses simple colored view for immediate loading
 * No network requests, no loading states, completely synchronous
 */
export default function InstantThumbnail({
  exerciseName,
  muscleGroup,
  style,
  size = 60,
}: InstantThumbnailProps) {
  // Get color and text for thumbnail
  const thumbnailData = useMemo(() => {
    const backgroundColor = MUSCLE_COLORS[muscleGroup] || Colors.primary;
    
    // Get display text - first character of exercise name or muscle group
    let displayText = muscleGroup?.charAt(0) || '?';
    if (exerciseName) {
      displayText = exerciseName.charAt(0);
    }
    displayText = displayText.toUpperCase();
    
    return { backgroundColor, displayText };
  }, [muscleGroup, exerciseName]);

  return (
    <View style={[
      styles.container, 
      { 
        width: size, 
        height: size, 
        backgroundColor: thumbnailData.backgroundColor 
      }, 
      style
    ]}>
      <Text style={[
        styles.displayText,
        { fontSize: size * 0.4 }
      ]}>
        {thumbnailData.displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  displayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});