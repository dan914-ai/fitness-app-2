import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { PieChart as RNPieChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/colors';

interface PieData {
  name: string;
  value: number;
  color: string;
  legendFontColor?: string;
  legendFontSize?: number;
}

interface PieChartProps {
  data: PieData[];
  title?: string;
  width?: number;
  height?: number;
  loading?: boolean;
  accessor?: string;
  backgroundColor?: string;
  paddingLeft?: string;
  center?: [number, number];
  absolute?: boolean;
  hasLegend?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  width = 350,
  height = 220,
  loading = false,
  accessor = 'value',
  backgroundColor = 'transparent',
  paddingLeft = '15',
  center = [10, 0],
  absolute = false,
  hasLegend = true,
}) => {
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading chart data...</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  // Add default colors if not provided
  const defaultColors = [
    Colors.primary,
    Colors.secondary,
    Colors.accent,
    Colors.warning,
    Colors.success,
    Colors.info,
    Colors.error,
  ];

  const processedData = data.map((item, index) => ({
    ...item,
    color: item.color || defaultColors[index % defaultColors.length],
    legendFontColor: item.legendFontColor || Colors.text,
    legendFontSize: item.legendFontSize || 14,
  }));

  const chartConfig = {
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => Colors.text,
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.chartWrapper}>
        <RNPieChart
          data={processedData}
          width={width}
          height={height}
          chartConfig={chartConfig}
          accessor={accessor}
          backgroundColor={backgroundColor}
          paddingLeft={paddingLeft}
          center={center}
          absolute={absolute}
          hasLegend={hasLegend}
        />
      </View>
      {hasLegend && (
        <View style={styles.legendContainer}>
          {processedData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: item.color },
                ]}
              />
              <Text style={styles.legendText}>
                {item.name}: {item.value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  legendContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: Colors.text,
  },
});