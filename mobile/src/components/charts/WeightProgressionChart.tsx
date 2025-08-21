import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Colors } from '../../constants/colors';
import prTrackingService, { PRRecord } from '../../services/prTracking.service';

const { width } = Dimensions.get('window');

interface WeightProgressionChartProps {
  exerciseId: string;
  exerciseName: string;
  height?: number;
}

type TimePeriod = 30 | 90 | 365 | 'all';

export default function WeightProgressionChart({
  exerciseId,
  exerciseName,
  height = 250,
}: WeightProgressionChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(30);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxWeight, setMaxWeight] = useState(0);
  const [minWeight, setMinWeight] = useState(0);

  const timePeriods: { label: string; value: TimePeriod }[] = [
    { label: '30일', value: 30 },
    { label: '90일', value: 90 },
    { label: '1년', value: 365 },
    { label: '전체기간', value: 'all' },
  ];

  useEffect(() => {
    loadChartData();
  }, [exerciseId, selectedPeriod]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      
      const records = await prTrackingService.getPRRecordsForPeriod(
        exerciseId,
        selectedPeriod
      );

      if (records.length === 0) {
        // Generate mock data if no records exist
        await prTrackingService.generateMockPRData(exerciseId, exerciseName);
        const newRecords = await prTrackingService.getPRRecordsForPeriod(
          exerciseId,
          selectedPeriod
        );
        processRecords(newRecords);
      } else {
        processRecords(records);
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processRecords = (records: PRRecord[]) => {
    if (records.length === 0) {
      setChartData([]);
      return;
    }

    // Group records by date and get max weight for each date
    const groupedByDate = records.reduce((acc, record) => {
      const dateKey = new Date(record.date).toLocaleDateString('ko-KR');
      if (!acc[dateKey] || acc[dateKey].weight < record.weight) {
        acc[dateKey] = record;
      }
      return acc;
    }, {} as { [key: string]: PRRecord });

    // Convert to chart data format
    const data = Object.values(groupedByDate).map((record, index) => ({
      value: record.weight,
      label: formatDateLabel(record.date, selectedPeriod),
      dataPointText: `${record.weight}`,
      textShiftY: -10,
      textShiftX: -5,
      textColor: Colors.text,
      dataPointLabelShiftY: -20,
      dataPointLabelShiftX: -10,
    }));

    // Calculate min and max for Y-axis scaling
    const weights = data.map(d => d.value);
    const max = Math.max(...weights);
    const min = Math.min(...weights);
    
    setMaxWeight(Math.ceil(max / 10) * 10 + 10);
    setMinWeight(Math.floor(min / 10) * 10 - 10);
    setChartData(data);
  };

  const formatDateLabel = (date: string, period: TimePeriod): string => {
    const d = new Date(date);
    if (period === 30) {
      return `${d.getMonth() + 1}.${d.getDate()}`;
    } else if (period === 90) {
      return `${d.getMonth() + 1}.${d.getDate()}`;
    } else {
      return `${d.getMonth() + 1}월`;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { height }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (chartData.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, { height }]}>
        <Text style={styles.emptyText}>기록된 데이터가 없습니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.chartTitle}>중량 진행 상황</Text>
        <View style={styles.periodSelector}>
          {timePeriods.map((period) => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.periodButton,
                selectedPeriod === period.value && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.value)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.value && styles.periodButtonTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={width - 60}
          height={height - 60}
          color={Colors.primary}
          thickness={3}
          dataPointsColor={Colors.primary}
          dataPointsRadius={6}
          textColor={Colors.textSecondary}
          textFontSize={11}
          areaChart
          startFillColor={`${Colors.primary}40`}
          endFillColor={`${Colors.primary}10`}
          startOpacity={0.4}
          endOpacity={0.1}
          spacing={chartData.length > 10 ? 30 : 50}
          maxValue={maxWeight}
          noOfSections={5}
          yAxisColor="transparent"
          xAxisColor="transparent"
          hideYAxisText
          xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 10 }}
          showVerticalLines={false}
          hideRules
          showYAxisIndices={false}
          curved
          curvature={0.2}
          initialSpacing={10}
          endSpacing={10}
          scrollToEnd={true}
          isAnimated
          animationDuration={1000}
          pointerConfig={{
            pointerStripColor: Colors.primary,
            pointerStripWidth: 2,
            pointerColor: Colors.primary,
            radius: 6,
            pointerLabelWidth: 100,
            pointerLabelHeight: 90,
            pointerLabelComponent: (items: any) => {
              return (
                <View style={styles.pointerLabel}>
                  <Text style={styles.pointerLabelText}>
                    {items[0]?.value} kg
                  </Text>
                </View>
              );
            },
          }}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>최고 기록</Text>
          <Text style={styles.statValue}>
            {Math.max(...chartData.map(d => d.value))} kg
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>평균</Text>
          <Text style={styles.statValue}>
            {Math.round(
              chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length
            )} kg
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>향상률</Text>
          <Text style={styles.statValue}>
            {chartData.length > 1
              ? `+${Math.round(
                  ((chartData[chartData.length - 1].value - chartData[0].value) /
                    chartData[0].value) *
                    100
                )}%`
              : '0%'}
          </Text>
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
    marginVertical: 8,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  periodButtonTextActive: {
    color: Colors.surface,
    fontWeight: '600',
  },
  chartContainer: {
    marginHorizontal: -8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pointerLabel: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pointerLabelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
});