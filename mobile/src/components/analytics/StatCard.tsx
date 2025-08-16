import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  style?: ViewStyle;
  titleStyle?: TextStyle;
  valueStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = Colors.primary,
  trend,
  style,
  titleStyle,
  valueStyle,
  subtitleStyle,
  loading = false,
}) => {
  const trendColor = trend?.isPositive ? Colors.success : Colors.error;
  const trendIcon = trend?.isPositive ? 'trending-up' : 'trending-down';

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingTitle} />
          <View style={styles.loadingValue} />
          {subtitle && <View style={styles.loadingSubtitle} />}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {icon && (
          <Icon name={icon} size={24} color={iconColor} style={styles.icon} />
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.value, valueStyle]}>{value}</Text>
        {trend && (
          <View style={styles.trendContainer}>
            <Icon name={trendIcon} size={16} color={trendColor} />
            <Text style={[styles.trendText, { color: trendColor }]}>
              {Math.abs(trend.value)}%
            </Text>
          </View>
        )}
      </View>

      {subtitle && (
        <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 150,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    flex: 1,
  },
  icon: {
    marginLeft: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 2,
  },
  loadingContainer: {
    height: 80,
  },
  loadingTitle: {
    width: '60%',
    height: 14,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 12,
  },
  loadingValue: {
    width: '80%',
    height: 28,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 8,
  },
  loadingSubtitle: {
    width: '40%',
    height: 12,
    backgroundColor: Colors.border,
    borderRadius: 4,
  },
});