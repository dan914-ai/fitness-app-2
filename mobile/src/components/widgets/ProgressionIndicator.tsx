import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface ProgressionIndicatorProps {
  originalWeight: number;
  suggestedWeight: number;
  reason: string;
  readiness: number;
}

export default function ProgressionIndicator({ 
  originalWeight, 
  suggestedWeight, 
  reason, 
  readiness 
}: ProgressionIndicatorProps) {
  // Validate props
  if (typeof originalWeight !== 'number' || typeof suggestedWeight !== 'number') {
    console.error('[ProgressionIndicator] Invalid weight props:', { originalWeight, suggestedWeight });
    return null;
  }
  
  const difference = suggestedWeight - originalWeight;
  const percentChange = originalWeight > 0 ? (difference / originalWeight) * 100 : 0;
  
  const getIndicatorColor = () => {
    if (difference > 0) return '#4CAF50'; // Green for increase
    if (difference < 0) return '#FF5252'; // Red for decrease
    return '#FFC107'; // Yellow for maintain
  };
  
  const getIcon = () => {
    if (difference > 0) return 'trending-up';
    if (difference < 0) return 'trending-down';
    return 'trending-flat';
  };
  
  const getReadinessColor = () => {
    if (readiness >= 0.8) return '#4CAF50';
    if (readiness >= 0.6) return '#FFC107';
    return '#FF5252';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: getIndicatorColor() + '20' }]}>
        <Icon name={getIcon()} size={20} color={getIndicatorColor()} />
        <Text style={[styles.changeText, { color: getIndicatorColor() }]}>{difference > 0 ? '+' : ''}{difference.toFixed(1)}kg ({percentChange > 0 ? '+' : ''}{percentChange.toFixed(0)}%)</Text>
      </View>
      
      <Text style={styles.reason}>{reason || '중량 유지'}</Text>
      
      <View style={styles.readinessContainer}>
        <Text style={styles.readinessLabel}>회복 점수:</Text>
        <View style={styles.readinessBar}>
          <View 
            style={[
              styles.readinessFill, 
              { 
                width: `${readiness * 100}%`,
                backgroundColor: getReadinessColor()
              }
            ]} 
          />
        </View>
        <Text style={[styles.readinessValue, { color: getReadinessColor() }]}>{`${(readiness * 10).toFixed(1)}/10`}</Text>
      </View>
      
      <View style={styles.weights}>
        <View style={styles.weightItem}>
          <Text style={styles.weightLabel}>이전</Text>
          <Text style={styles.weightValue}>{originalWeight}kg</Text>
        </View>
        <Icon name="arrow-forward" size={20} color="#666" />
        <View style={styles.weightItem}>
          <Text style={styles.weightLabel}>제안</Text>
          <Text style={[styles.weightValue, { color: getIndicatorColor(), fontWeight: 'bold' }]}>{suggestedWeight}kg</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    marginBottom: 8,
  },
  changeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  reason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  readinessContainer: {
    marginBottom: 16,
  },
  readinessLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  readinessBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  readinessFill: {
    height: '100%',
    borderRadius: 4,
  },
  readinessValue: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  weights: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  weightItem: {
    alignItems: 'center',
  },
  weightLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  weightValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});