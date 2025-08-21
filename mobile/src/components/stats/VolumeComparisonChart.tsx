import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Colors } from '../../constants/colors';
import { DailyVolume } from '../../utils/statsCalculations';

const { width: screenWidth } = Dimensions.get('window');

interface VolumeComparisonChartProps {
  data: DailyVolume[];
  title?: string;
}

export default function VolumeComparisonChart({ data, title }: VolumeComparisonChartProps) {
  // Early return if no data or invalid data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No comparison data available</Text>
      </View>
    );
  }
  
  // Validate data structure
  const hasValidData = data.every(item => 
    item && 
    typeof item.currentVolume === 'number' && 
    typeof item.previousVolume === 'number' && 
    typeof item.dayName === 'string'
  );
  
  if (!hasValidData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid data format</Text>
      </View>
    );
  }
  
  // Transform data for the stacked bar chart
  const chartData = data.map(day => {
    const baseVolume = Math.min(day.currentVolume, day.previousVolume);
    const difference = day.currentVolume - day.previousVolume;
    
    return {
      stacks: [
        {
          value: baseVolume / 1000, // Convert to thousands for better display
          color: Colors.primary, // Blue for base volume
        },
        {
          value: Math.abs(difference) / 1000,
          color: difference >= 0 ? Colors.primary : Colors.textSecondary, // Blue for gain, gray for loss
        },
      ],
      label: day.dayName,
      labelTextStyle: { color: Colors.textLight, fontSize: 10 },
      spacing: 2,
      borderRadius: 4,
    };
  });

  // Validate that all chart data has proper stacks structure
  const hasValidStacks = chartData.every(item => 
    item.stacks && Array.isArray(item.stacks) && item.stacks.length > 0
  );

  // Calculate summary stats
  const totalCurrent = data.reduce((sum, d) => sum + d.currentVolume, 0);
  const totalPrevious = data.reduce((sum, d) => sum + d.previousVolume, 0);
  const totalDifference = totalCurrent - totalPrevious;
  const percentageChange = totalPrevious > 0 ? (totalDifference / totalPrevious) * 100 : 0;

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>이번 주</Text>
          <Text style={styles.summaryValue}>{(totalCurrent / 1000).toFixed(1)}t</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>변화</Text>
          <Text style={[
            styles.summaryValue,
            { color: totalDifference >= 0 ? Colors.primary : Colors.textSecondary }
          ]}>
            {totalDifference >= 0 ? '+' : ''}{(totalDifference / 1000).toFixed(1)}t
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>변화율</Text>
          <Text style={[
            styles.summaryValue,
            { color: percentageChange >= 0 ? Colors.primary : Colors.textSecondary }
          ]}>
            {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        {hasValidStacks && chartData.length > 0 ? (
          <BarChart
            data={chartData}
            width={screenWidth - 60}
            height={200}
            barWidth={35}
            spacing={15}
            roundedTop
            xAxisThickness={0}
            yAxisThickness={0}
            hideYAxisText
            noOfSections={4}
            maxValue={Math.max(...data.map(d => Math.max(d.currentVolume, d.previousVolume))) / 1000 * 1.2}
            labelWidth={30}
            hideRules
            showVerticalLines={false}
            backgroundColor="transparent"
            activeOpacity={0.7}
            renderTooltip={(item: any, index: number) => {
              if (!data[index]) return null;
              const dayData = data[index];
              return (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>
                    {dayData.currentVolume.toLocaleString()}kg
                  </Text>
                  <Text style={[styles.tooltipDiff, {
                    color: dayData.difference >= 0 ? Colors.primary : Colors.textSecondary
                  }]}>
                    {dayData.difference >= 0 ? '+' : ''}{dayData.difference.toLocaleString()}kg
                  </Text>
                </View>
              );
            }}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unable to display chart data</Text>
          </View>
        )}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>이번 주</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.textSecondary }]} />
          <Text style={styles.legendText}>지난 주</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tooltip: {
    backgroundColor: Colors.surface,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'absolute',
    top: -50,
  },
  tooltipText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  tooltipDiff: {
    fontSize: 10,
    marginTop: 2,
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  noDataText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 16,
    marginVertical: 20,
  },
});