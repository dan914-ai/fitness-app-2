import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LineChart as RNLineChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/colors';

interface DataPoint {
  x: string;
  y: number;
}

interface LineChartProps {
  data: DataPoint[];
  title?: string;
  yAxisSuffix?: string;
  yAxisLabel?: string;
  width?: number;
  height?: number;
  loading?: boolean;
  formatYLabel?: (value: string) => string;
  showDots?: boolean;
  bezier?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  yAxisSuffix = '',
  yAxisLabel = '',
  width = 350,
  height = 220,
  loading = false,
  formatYLabel,
  showDots = true,
  bezier = true,
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

  const chartData = {
    labels: data.map(point => point.x),
    datasets: [
      {
        data: data.map(point => point.y),
        color: (opacity = 1) => Colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => Colors.primary,
    labelColor: (opacity = 1) => Colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: showDots ? '4' : '0',
      strokeWidth: '2',
      stroke: Colors.primary,
      fill: Colors.surface,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: Colors.border,
      strokeWidth: 1,
    },
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <RNLineChart
        data={chartData}
        width={width}
        height={height}
        yAxisLabel={yAxisLabel}
        yAxisSuffix={yAxisSuffix}
        chartConfig={chartConfig}
        bezier={bezier}
        style={styles.chart}
        formatYLabel={formatYLabel}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        withShadow={false}
        segments={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
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
  },
  emptyContainer: {
    height: 250,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});