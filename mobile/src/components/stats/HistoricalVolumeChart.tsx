import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Colors } from '../../constants/colors';
import { WeeklyData } from '../../utils/statsCalculations';

const { width: screenWidth } = Dimensions.get('window');

interface HistoricalVolumeChartProps {
  data: WeeklyData[];
  title?: string;
  period?: 'weekly' | 'monthly';
}

export default function HistoricalVolumeChart({ 
  data, 
  title,
  period = 'weekly'
}: HistoricalVolumeChartProps) {
  
  // Early return if no data or invalid data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No historical data available</Text>
      </View>
    );
  }
  
  // Validate data structure
  const hasValidDataStructure = data.every(item => 
    item && 
    typeof item.volume === 'number' && 
    typeof item.workouts === 'number' && 
    typeof item.week === 'string'
  );
  
  if (!hasValidDataStructure) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid data format</Text>
      </View>
    );
  }
  
  // Calculate average and trend
  const volumes = data.map(d => d.volume);
  const average = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
  const latestVolume = volumes[volumes.length - 1];
  const previousVolume = volumes[volumes.length - 2] || 0;
  const trend = latestVolume - previousVolume;
  const trendPercentage = previousVolume > 0 ? (trend / previousVolume) * 100 : 0;
  
  // Find peak week
  const peakWeek = data.reduce((max, curr) => 
    curr.volume > max.volume ? curr : max, 
    data[0]
  );
  
  // Transform data for bar chart
  const chartData = data.map((week, index) => {
    const isAboveAverage = week.volume > average;
    const isPeak = week.volume === peakWeek.volume;
    
    return {
      value: week.volume / 1000, // Convert to tons
      label: week.week,
      labelTextStyle: { 
        color: Colors.textLight, 
        fontSize: 9,
        transform: [{ rotate: '-45deg' }]
      },
      frontColor: isPeak 
        ? '#FFD700' // Gold for peak week
        : isAboveAverage 
          ? '#4CAF50' // Green for above average
          : '#808080', // Gray for below average
      topLabelComponent: () => (
        isPeak ? (
          <Text style={styles.peakLabel}>🏆</Text>
        ) : null
      ),
    };
  });
  
  const maxValue = Math.max(...volumes) / 1000 * 1.2;
  
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>최근 {period === 'weekly' ? '주' : '월'}</Text>
          <Text style={styles.statValue}>
            {(latestVolume / 1000).toFixed(1)}t
          </Text>
          <Text style={[styles.statChange, {
            color: trend >= 0 ? '#4CAF50' : '#F44336'
          }]}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trendPercentage).toFixed(1)}%
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>평균</Text>
          <Text style={styles.statValue}>
            {(average / 1000).toFixed(1)}t
          </Text>
          <Text style={styles.statSubtext}>
            {data.length}{period === 'weekly' ? '주' : '개월'} 평균
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>최고 기록</Text>
          <Text style={[styles.statValue, { color: '#FFD700' }]}>
            {(peakWeek.volume / 1000).toFixed(1)}t
          </Text>
          <Text style={styles.statSubtext}>
            {peakWeek.week}
          </Text>
        </View>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.chartScroll}
      >
        <View style={styles.chartContainer}>
          <BarChart
            data={chartData}
            width={Math.max(screenWidth - 60, data.length * 50)}
            height={200}
            barWidth={30}
            spacing={20}
            roundedTop
            xAxisThickness={1}
            yAxisThickness={1}
            xAxisColor={Colors.border}
            yAxisColor={Colors.border}
            yAxisTextStyle={{ color: Colors.textLight, fontSize: 10 }}
            noOfSections={4}
            maxValue={maxValue}
            hideRules
            backgroundColor="transparent"
            showGradient
            gradientColor={'rgba(76, 175, 80, 0.3)'}
            frontColor={'#4CAF50'}
            activeOpacity={0.7}
            renderTooltip={(item: any, index: number) => {
              const weekData = data[index];
              return (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipTitle}>{weekData.week}</Text>
                  <Text style={styles.tooltipValue}>
                    {weekData.volume.toLocaleString()}kg
                  </Text>
                  <Text style={styles.tooltipWorkouts}>
                    {weekData.workouts}회 운동
                  </Text>
                </View>
              );
            }}
          />
          
          {/* Average line */}
          <View style={[styles.averageLine, {
            bottom: 50 + (average / 1000 / maxValue) * 200,
            width: Math.max(screenWidth - 60, data.length * 50),
          }]}>
            <View style={styles.averageLineDashed} />
            <Text style={styles.averageLabel}>평균</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFD700' }]} />
          <Text style={styles.legendText}>최고 기록</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>평균 이상</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#808080' }]} />
          <Text style={styles.legendText}>평균 이하</Text>
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
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statChange: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  statSubtext: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chartScroll: {
    marginHorizontal: -16,
  },
  chartContainer: {
    paddingHorizontal: 16,
    position: 'relative',
  },
  averageLine: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageLineDashed: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.textLight,
    opacity: 0.5,
  },
  averageLabel: {
    fontSize: 10,
    color: Colors.textLight,
    backgroundColor: Colors.surface,
    paddingHorizontal: 4,
    marginLeft: 8,
  },
  peakLabel: {
    fontSize: 16,
    position: 'absolute',
    top: -25,
  },
  tooltip: {
    backgroundColor: Colors.surface,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'absolute',
    top: -60,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tooltipTitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  tooltipValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  tooltipWorkouts: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});