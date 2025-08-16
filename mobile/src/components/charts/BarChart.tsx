import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/colors';

interface BarData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarData[];
  title?: string;
  yAxisSuffix?: string;
  yAxisLabel?: string;
  width?: number;
  height?: number;
  loading?: boolean;
  formatYLabel?: (value: string) => string;
  showValuesOnTopOfBars?: boolean;
  fromZero?: boolean;
  horizontal?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  yAxisSuffix = '',
  yAxisLabel = '',
  width = 350,
  height = 220,
  loading = false,
  formatYLabel,
  showValuesOnTopOfBars = true,
  fromZero = true,
  horizontal = false,
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
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.value),
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => Colors.primary,
    labelColor: (opacity = 1) => Colors.text,
    barPercentage: 0.7,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: Colors.border,
      strokeWidth: 1,
    },
    fillShadowGradient: Colors.primary,
    fillShadowGradientOpacity: 1,
  };

  const chartComponent = horizontal ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <RNBarChart
        data={chartData}
        width={Math.max(width, data.length * 80)}
        height={height}
        yAxisLabel={yAxisLabel}
        yAxisSuffix={yAxisSuffix}
        chartConfig={chartConfig}
        style={styles.chart}
        formatYLabel={formatYLabel}
        fromZero={fromZero}
        showValuesOnTopOfBars={showValuesOnTopOfBars}
        withInnerLines={true}
        withCustomBarColorFromData={false}
        flatColor={true}
        withHorizontalLabels={true}
        showBarTops={false}
      />
    </ScrollView>
  ) : (
    <RNBarChart
      data={chartData}
      width={width}
      height={height}
      yAxisLabel={yAxisLabel}
      yAxisSuffix={yAxisSuffix}
      chartConfig={chartConfig}
      style={styles.chart}
      formatYLabel={formatYLabel}
      fromZero={fromZero}
      showValuesOnTopOfBars={showValuesOnTopOfBars}
      withInnerLines={true}
      withCustomBarColorFromData={false}
      flatColor={true}
      withHorizontalLabels={true}
      showBarTops={false}
    />
  );

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {chartComponent}
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});