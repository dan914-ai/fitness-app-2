import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { RecordStackScreenProps } from '../../navigation/types';
import { getInBodyHistory, InBodyRecord } from '../../utils/inbodyHistory';

type InBodyScreenProps = RecordStackScreenProps<'InBodyScreen'>;

export default function InBodyScreen({ navigation }: InBodyScreenProps) {
  const [records, setRecords] = useState<InBodyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const history = await getInBodyHistory();
      setRecords(history);
    } catch (error) {
      console.error('Error loading InBody data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: '저체중', color: '#3B82F6' };
    if (bmi < 25) return { label: '정상', color: '#10B981' };
    if (bmi < 30) return { label: '과체중', color: '#F59E0B' };
    return { label: '비만', color: '#EF4444' };
  };

  const renderMetricCard = (title: string, value: string, status?: { label: string; color: string }) => (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {status && (
        <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
          <Text style={styles.statusText}>{status.label}</Text>
        </View>
      )}
    </View>
  );

  const renderTrendsChart = () => {
    if (records.length < 2) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>변화 추이</Text>
          <View style={styles.emptyChart}>
            <Icon name="show-chart" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>충분한 데이터가 없습니다</Text>
            <Text style={styles.emptySubText}>최소 2회 이상의 측정이 필요합니다</Text>
          </View>
        </View>
      );
    }

    // Get recent data for chart (max 7 points)
    const chartData = records.slice(0, 7).reverse();
    
    // Normalize data for display
    const normalizeValue = (value: number, min: number, max: number) => {
      return ((value - min) / (max - min)) * 100;
    };

    // Calculate ranges for each metric
    const weights = chartData.map(d => d.weight);
    const muscles = chartData.map(d => d.skeletalMuscleMass);
    const fats = chartData.map(d => d.bodyFatPercentage);
    
    const minWeight = Math.min(...weights) - 2;
    const maxWeight = Math.max(...weights) + 2;
    const minMuscle = Math.min(...muscles) - 2;
    const maxMuscle = Math.max(...muscles) + 2;
    const minFat = Math.min(...fats) - 2;
    const maxFat = Math.max(...fats) + 2;

    // Create SVG path data for smooth lines
    const createPath = (data: number[], min: number, max: number) => {
      return data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - normalizeValue(value, min, max);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>변화 추이</Text>
        
        {/* Individual metric charts */}
        <View style={styles.chartsWrapper}>
          {/* Weight Chart */}
          <View style={styles.metricChartContainer}>
            <Text style={styles.metricChartTitle}>체중 (kg)</Text>
            <View style={styles.miniChart}>
              <View style={styles.yAxisMini}>
                <Text style={styles.yAxisTextMini}>{maxWeight.toFixed(0)}</Text>
                <Text style={styles.yAxisTextMini}>{((maxWeight + minWeight) / 2).toFixed(0)}</Text>
                <Text style={styles.yAxisTextMini}>{minWeight.toFixed(0)}</Text>
              </View>
              <View style={styles.simpleChartArea}>
                {/* Background grid */}
                <View style={styles.gridBackground}>
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                </View>
                
                {/* Data points and values */}
                <View style={styles.dataPointsContainer}>
                  {chartData.map((data, index) => {
                    const x = (index / (chartData.length - 1)) * 280; // Assuming 280px width
                    const y = 80 - (normalizeValue(data.weight, minWeight, maxWeight) * 0.8); // 80% of 100px height
                    
                    return (
                      <View key={index}>
                        <View 
                          style={[
                            styles.simpleDataPoint,
                            { 
                              left: x - 4,
                              top: y - 4,
                              backgroundColor: '#FF6B6B',
                            }
                          ]} 
                        />
                        <Text style={[
                          styles.simpleDataLabel, 
                          { 
                            left: x - 15,
                            top: y - 20,
                          }
                        ]}>
                          {data.weight.toFixed(1)}
                        </Text>
                      </View>
                    );
                  })}
                  
                  {/* Connect points with lines */}
                  {chartData.map((data, index) => {
                    if (index === 0) return null;
                    
                    const x1 = ((index - 1) / (chartData.length - 1)) * 280;
                    const y1 = 80 - (normalizeValue(chartData[index - 1].weight, minWeight, maxWeight) * 0.8);
                    const x2 = (index / (chartData.length - 1)) * 280;
                    const y2 = 80 - (normalizeValue(data.weight, minWeight, maxWeight) * 0.8);
                    
                    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                    
                    return (
                      <View
                        key={`line-${index}`}
                        style={[
                          styles.simpleLine,
                          {
                            left: x1,
                            top: y1,
                            width: length,
                            transform: [{ rotate: `${angle}deg` }],
                            backgroundColor: '#FF6B6B',
                          }
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* Muscle Chart */}
          <View style={styles.metricChartContainer}>
            <Text style={styles.metricChartTitle}>골격근량 (kg)</Text>
            <View style={styles.miniChart}>
              <View style={styles.yAxisMini}>
                <Text style={styles.yAxisTextMini}>{maxMuscle.toFixed(0)}</Text>
                <Text style={styles.yAxisTextMini}>{((maxMuscle + minMuscle) / 2).toFixed(0)}</Text>
                <Text style={styles.yAxisTextMini}>{minMuscle.toFixed(0)}</Text>
              </View>
              <View style={styles.simpleChartArea}>
                {/* Background grid */}
                <View style={styles.gridBackground}>
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                </View>
                
                {/* Data points and values */}
                <View style={styles.dataPointsContainer}>
                  {chartData.map((data, index) => {
                    const x = (index / (chartData.length - 1)) * 280;
                    const y = 80 - (normalizeValue(data.skeletalMuscleMass, minMuscle, maxMuscle) * 0.8);
                    
                    return (
                      <View key={index}>
                        <View 
                          style={[
                            styles.simpleDataPoint,
                            { 
                              left: x - 4,
                              top: y - 4,
                              backgroundColor: '#4682B4',
                            }
                          ]} 
                        />
                        <Text style={[
                          styles.simpleDataLabel, 
                          { 
                            left: x - 15,
                            top: y - 20,
                          }
                        ]}>
                          {data.skeletalMuscleMass.toFixed(1)}
                        </Text>
                      </View>
                    );
                  })}
                  
                  {/* Connect points with lines */}
                  {chartData.map((data, index) => {
                    if (index === 0) return null;
                    
                    const x1 = ((index - 1) / (chartData.length - 1)) * 280;
                    const y1 = 80 - (normalizeValue(chartData[index - 1].skeletalMuscleMass, minMuscle, maxMuscle) * 0.8);
                    const x2 = (index / (chartData.length - 1)) * 280;
                    const y2 = 80 - (normalizeValue(data.skeletalMuscleMass, minMuscle, maxMuscle) * 0.8);
                    
                    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                    
                    return (
                      <View
                        key={`line-${index}`}
                        style={[
                          styles.simpleLine,
                          {
                            left: x1,
                            top: y1,
                            width: length,
                            transform: [{ rotate: `${angle}deg` }],
                            backgroundColor: '#4682B4',
                          }
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* Body Fat Chart */}
          <View style={styles.metricChartContainer}>
            <Text style={styles.metricChartTitle}>체지방률 (%)</Text>
            <View style={styles.miniChart}>
              <View style={styles.yAxisMini}>
                <Text style={styles.yAxisTextMini}>{maxFat.toFixed(0)}</Text>
                <Text style={styles.yAxisTextMini}>{((maxFat + minFat) / 2).toFixed(0)}</Text>
                <Text style={styles.yAxisTextMini}>{minFat.toFixed(0)}</Text>
              </View>
              <View style={styles.simpleChartArea}>
                {/* Background grid */}
                <View style={styles.gridBackground}>
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                </View>
                
                {/* Data points and values */}
                <View style={styles.dataPointsContainer}>
                  {chartData.map((data, index) => {
                    const x = (index / (chartData.length - 1)) * 280;
                    const y = 80 - (normalizeValue(data.bodyFatPercentage, minFat, maxFat) * 0.8);
                    
                    return (
                      <View key={index}>
                        <View 
                          style={[
                            styles.simpleDataPoint,
                            { 
                              left: x - 4,
                              top: y - 4,
                              backgroundColor: '#FFD93D',
                            }
                          ]} 
                        />
                        <Text style={[
                          styles.simpleDataLabel, 
                          { 
                            left: x - 15,
                            top: y - 20,
                          }
                        ]}>
                          {data.bodyFatPercentage.toFixed(1)}
                        </Text>
                      </View>
                    );
                  })}
                  
                  {/* Connect points with lines */}
                  {chartData.map((data, index) => {
                    if (index === 0) return null;
                    
                    const x1 = ((index - 1) / (chartData.length - 1)) * 280;
                    const y1 = 80 - (normalizeValue(chartData[index - 1].bodyFatPercentage, minFat, maxFat) * 0.8);
                    const x2 = (index / (chartData.length - 1)) * 280;
                    const y2 = 80 - (normalizeValue(data.bodyFatPercentage, minFat, maxFat) * 0.8);
                    
                    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                    
                    return (
                      <View
                        key={`line-${index}`}
                        style={[
                          styles.simpleLine,
                          {
                            left: x1,
                            top: y1,
                            width: length,
                            transform: [{ rotate: `${angle}deg` }],
                            backgroundColor: '#FFD93D',
                          }
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Date labels */}
        <View style={styles.dateLabelsContainer}>
          {chartData.map((data, index) => (
            <Text key={index} style={styles.dateLabel}>
              {new Date(data.date).toLocaleDateString('ko-KR', { 
                month: 'numeric', 
                day: 'numeric' 
              })}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderLatestRecord = () => {
    if (records.length === 0) return null;
    const latest = records[0];
    const bmiStatus = getBMIStatus(latest.bmi);

    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 측정 결과</Text>
          <Text style={styles.recordDate}>
            {new Date(latest.date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          
          <View style={styles.metricsGrid}>
            {renderMetricCard('체중', `${latest.weight}kg`)}
            {renderMetricCard('BMI', latest.bmi.toFixed(1), bmiStatus)}
            {renderMetricCard('골격근량', `${latest.skeletalMuscleMass}kg`)}
            {renderMetricCard('체지방률', `${latest.bodyFatPercentage}%`)}
          </View>
        </View>
      </>
    );
  };

  const renderSimpleTrend = () => {
    if (records.length < 2) return null;
    
    const latest = records[0];
    const previous = records[1];
    const weightChange = latest.weight - previous.weight;
    const bmiChange = latest.bmi - previous.bmi;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>변화 추이</Text>
        <View style={styles.trendContainer}>
          <View style={styles.trendItem}>
            <Text style={styles.trendLabel}>체중 변화</Text>
            <Text style={[styles.trendValue, { color: weightChange >= 0 ? '#EF4444' : '#10B981' }]}>
              {weightChange >= 0 ? '+' : ''}{weightChange.toFixed(1)}kg
            </Text>
          </View>
          <View style={styles.trendItem}>
            <Text style={styles.trendLabel}>BMI 변화</Text>
            <Text style={[styles.trendValue, { color: bmiChange >= 0 ? '#EF4444' : '#10B981' }]}>
              {bmiChange >= 0 ? '+' : ''}{bmiChange.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRecordsList = () => {
    if (records.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>기록 내역</Text>
          <Text style={styles.recordCount}>{records.length}개 기록</Text>
        </View>
        
        {records.slice(0, 5).map((record) => (
          <View key={record.id} style={styles.recordItem}>
            <View style={styles.recordInfo}>
              <Text style={styles.recordItemDate}>
                {new Date(record.date).toLocaleDateString('ko-KR')}
              </Text>
              <Text style={styles.recordStats}>
                {`체중 ${record.weight}kg • BMI ${record.bmi.toFixed(1)} • 체지방 ${record.bodyFatPercentage}%`}
              </Text>
            </View>
            <Icon name="arrow-forward-ios" size={16} color={Colors.textLight} />
          </View>
        ))}
        
        {records.length > 5 && (
          <TouchableOpacity style={styles.showMoreButton}>
            <Text style={styles.showMoreText}>더 보기 ({records.length - 5}개)</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="assessment" size={64} color={Colors.textLight} />
      <Text style={styles.emptyTitle}>인바디 데이터가 없습니다</Text>
      <Text style={styles.emptySubtitle}>첫 번째 측정을 추가해보세요</Text>
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate('AddInBodyRecord')}
      >
        <Icon name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>측정 기록 추가</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>인바디 기록</Text>
          {records.length > 0 && (
            <Text style={styles.subtitle}>
              총 {records.length}회 측정
            </Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.addHeaderButton}
          onPress={() => navigation.navigate('AddInBodyRecord')}
        >
          <Icon name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {records.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {renderLatestRecord()}
            <View style={styles.section}>
              {renderTrendsChart()}
            </View>
            {renderSimpleTrend()}
            {renderRecordsList()}
          </>
        )}
        
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  addHeaderButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  recordCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  recordDate: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  metricTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  trendContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  trendItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  trendValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  recordInfo: {
    flex: 1,
  },
  recordItemDate: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  recordStats: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  showMoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 32,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  chartContainer: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  barContainer: {
    marginBottom: 16,
  },
  barWrapper: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  barSegment: {
    height: '100%',
  },
  muscleBar: {
    backgroundColor: '#4682B4', // Steel blue for muscle
  },
  fatBar: {
    backgroundColor: '#FF6B6B', // Coral red for fat
  },
  otherBar: {
    backgroundColor: '#FFD93D', // Gold for other
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  barLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  legendContainer: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: Colors.text,
  },
  emptyChart: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  chartArea: {
    flexDirection: 'row',
    height: 200,
    marginTop: 16,
  },
  yAxisLabels: {
    width: 50,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lineChartContainer: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 30,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: Colors.border,
  },
  dataLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 30,
  },
  lineWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  dataPointWrapper: {
    flex: 1,
    position: 'relative',
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    left: '50%',
    marginLeft: -4,
  },
  line: {
    position: 'absolute',
    width: 2,
    backgroundColor: Colors.border,
    left: '50%',
    marginLeft: -1,
    transformOrigin: 'bottom',
  },
  weightPoint: {
    backgroundColor: '#FF6B6B',
    zIndex: 3,
  },
  weightLine: {
    backgroundColor: '#FF6B6B',
  },
  musclePoint: {
    backgroundColor: '#4682B4',
    zIndex: 2,
  },
  muscleLine: {
    backgroundColor: '#4682B4',
  },
  fatPoint: {
    backgroundColor: '#FFD93D',
    zIndex: 1,
  },
  fatLine: {
    backgroundColor: '#FFD93D',
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  weightColor: {
    backgroundColor: '#FF6B6B',
  },
  muscleColor: {
    backgroundColor: '#4682B4',
  },
  fatColor: {
    backgroundColor: '#FFD93D',
  },
  chartsWrapper: {
    marginTop: 16,
  },
  metricChartContainer: {
    marginBottom: 24,
  },
  metricChartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  miniChart: {
    flexDirection: 'row',
    height: 100,
  },
  yAxisMini: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  yAxisTextMini: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  chartCanvas: {
    flex: 1,
    position: 'relative',
    marginLeft: 8,
  },
  horizontalGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  gridLineThin: {
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.3,
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dataPointLarge: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: -4,
    marginBottom: -4,
    zIndex: 2,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    marginBottom: -1,
    zIndex: 1,
  },
  dataLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: -10,
    minWidth: 20,
    textAlign: 'center',
  },
  dateLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 48,
  },
  dateLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  simpleChartArea: {
    flex: 1,
    height: 100,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 10,
    marginLeft: 8,
    position: 'relative',
  },
  gridBackground: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.2,
  },
  dataPointsContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
  },
  simpleDataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  simpleLine: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  simpleDataLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text,
    width: 30,
    textAlign: 'center',
  },
});