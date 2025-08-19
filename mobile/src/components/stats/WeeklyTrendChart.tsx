import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Colors } from '../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');

interface WeeklyTrendChartProps {
  currentWeek: number[];
  previousWeek: number[];
  labels: string[];
  title?: string;
}

export default function WeeklyTrendChart({ 
  currentWeek, 
  previousWeek, 
  labels,
  title 
}: WeeklyTrendChartProps) {
  
  // Transform data for the line chart
  const currentData = currentWeek.map((value, index) => ({
    value: value / 1000, // Convert to thousands
    label: labels[index],
    labelTextStyle: { color: Colors.textLight, fontSize: 10 },
    dataPointLabelComponent: () => (
      <Text style={styles.dataPointLabel}>
        {value > 0 ? `${(value / 1000).toFixed(1)}t` : ''}
      </Text>
    ),
  }));

  const previousData = previousWeek.map((value) => ({
    value: value / 1000,
  }));

  // Calculate summary stats
  const currentTotal = currentWeek.reduce((sum, v) => sum + v, 0);
  const previousTotal = previousWeek.reduce((sum, v) => sum + v, 0);
  const difference = currentTotal - previousTotal;
  const percentageChange = previousTotal > 0 ? (difference / previousTotal) * 100 : 0;

  const maxValue = Math.max(...currentWeek, ...previousWeek) / 1000 * 1.2;

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={styles.periodSelector}>
        <View style={styles.periodItem}>
          <View style={[styles.periodDot, { backgroundColor: '#F44336' }]} />
          <Text style={styles.periodText}>이번 주</Text>
          <Text style={styles.periodValue}>{(currentTotal / 1000).toFixed(1)}t</Text>
        </View>
        <View style={styles.periodItem}>
          <View style={[styles.periodDot, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.periodText}>지난 주</Text>
          <Text style={styles.periodValue}>{(previousTotal / 1000).toFixed(1)}t</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={currentData}
          data2={previousData}
          width={screenWidth - 80}
          height={220}
          color1="#F44336"
          color2="#FF9800"
          thickness1={3}
          thickness2={2}
          dataPointsColor1="#F44336"
          dataPointsColor2="#FF9800"
          dataPointsRadius={4}
          curved
          curvature={0.2}
          startFillColor1="rgba(244, 67, 54, 0.2)"
          startFillColor2="rgba(255, 152, 0, 0.1)"
          endFillColor1="rgba(244, 67, 54, 0)"
          endFillColor2="rgba(255, 152, 0, 0)"
          startOpacity={0.3}
          endOpacity={0}
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: Colors.textLight, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: Colors.textLight, fontSize: 10 }}
          noOfSections={5}
          maxValue={maxValue}
          hideRules
          backgroundColor="transparent"
          spacing={35}
          initialSpacing={10}
          pointerConfig={{
            pointerStripHeight: 160,
            pointerStripColor: Colors.textLight,
            pointerStripWidth: 1,
            pointerColor: Colors.primary,
            radius: 6,
            pointerLabelComponent: (items: any) => {
              const currentValue = items[0]?.value || 0;
              const previousValue = items[1]?.value || 0;
              const dayIndex = Math.round(items[0]?.index || 0);
              
              return (
                <View style={styles.pointerLabel}>
                  <Text style={styles.pointerLabelTitle}>{labels[dayIndex]}</Text>
                  <View style={styles.pointerLabelRow}>
                    <View style={[styles.pointerDot, { backgroundColor: '#F44336' }]} />
                    <Text style={styles.pointerLabelText}>
                      이번: {(currentValue * 1000).toLocaleString()}kg
                    </Text>
                  </View>
                  <View style={styles.pointerLabelRow}>
                    <View style={[styles.pointerDot, { backgroundColor: '#FF9800' }]} />
                    <Text style={styles.pointerLabelText}>
                      지난: {(previousValue * 1000).toLocaleString()}kg
                    </Text>
                  </View>
                </View>
              );
            },
          }}
        />
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={[styles.changeValue, {
            color: difference >= 0 ? '#4CAF50' : '#F44336'
          }]}>
            {difference >= 0 ? '▲' : '▼'} {Math.abs(difference / 1000).toFixed(1)}t
          </Text>
          <Text style={styles.changeLabel}>주간 변화</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.changeValue, {
            color: percentageChange >= 0 ? '#4CAF50' : '#F44336'
          }]}>
            {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
          </Text>
          <Text style={styles.changeLabel}>변화율</Text>
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
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  periodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  periodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  periodText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  periodValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  dataPointLabel: {
    fontSize: 10,
    color: Colors.text,
    position: 'absolute',
    top: -20,
  },
  pointerLabel: {
    backgroundColor: Colors.surface,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pointerLabelTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  pointerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  pointerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pointerLabelText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  summaryItem: {
    alignItems: 'center',
  },
  changeValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  changeLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
});