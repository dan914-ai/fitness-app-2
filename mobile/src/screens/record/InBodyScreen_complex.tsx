import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Alert,
  Share,
  RefreshControl,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/colors';
import { RecordStackScreenProps } from '../../navigation/types';
import {
  getInBodyHistory,
  getLatestInBodyRecord,
  InBodyRecord,
  getInBodyStatus,
  getStatusText,
  calculateInBodyTrends,
} from '../../utils/inbodyHistory';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

type InBodyScreenProps = RecordStackScreenProps<'InBodyScreen'>;

interface MetricCardProps {
  title: string;
  value: string;
  statusType: 'weight' | 'bmi' | 'bodyFat' | 'muscleMass';
  statusValue: string;
  icon: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, statusType, statusValue, icon }) => {
  let statusInfo;
  
  switch (statusType) {
    case 'weight':
    case 'bmi':
      statusInfo = getStatusText(statusType, parseFloat(statusValue));
      break;
    case 'bodyFat':
      statusInfo = getStatusText(statusType, parseFloat(statusValue));
      break;
    case 'muscleMass':
      statusInfo = getStatusText(statusType, parseFloat(statusValue));
      break;
    default:
      statusInfo = { label: '정상', color: '#4CAF50', category: 'normal' };
  }
  
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Icon name={icon} size={24} color={Colors.primary} />
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
          <Text style={styles.statusText}>{statusInfo.label}</Text>
        </View>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
  );
};

function InBodyScreen({ navigation }: InBodyScreenProps) {
  const [inbodyData, setInbodyData] = useState<InBodyRecord[]>([]);
  const [latestData, setLatestData] = useState<InBodyRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load data when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [history, latest] = await Promise.all([
        getInBodyHistory(),
        getLatestInBodyRecord(),
      ]);
      
      setInbodyData(history);
      setLatestData(latest);
    } catch (error) {
      console.error('Error loading InBody data:', error);
      Alert.alert('오류', '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleShare = async () => {
    if (!latestData) return;

    const shareText = `📊 InBody 측정 결과 (${new Date(latestData.date).toLocaleDateString('ko-KR')})
    
🏋️ 체중: ${latestData.weight}kg
💪 골격근량: ${latestData.skeletalMuscleMass}kg  
📈 체지방률: ${latestData.bodyFatPercentage}%
📊 BMI: ${latestData.bmi}
    
#InBody #건강관리 #운동일기`;

    try {
      await Share.share({
        message: shareText,
        title: 'InBody 측정 결과',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAddRecord = () => {
    navigation.navigate('AddInBodyRecord');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Text style={styles.title}>인바디 기록</Text>
        {latestData && (
          <Text style={styles.lastMeasurement}>
            마지막 측정: {new Date(latestData.date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.settingsButton} onPress={handleShare}>
        <Icon name="share" size={24} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderMetricCards = () => {
    if (!latestData) return null;

    const status = getInBodyStatus(latestData);

    return (
      <View style={styles.section}>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="체중"
            value={`${latestData.weight}kg`}
            statusType="bmi"
            statusValue={latestData.bmi.toString()}
            icon="monitor-weight"
          />
          <MetricCard
            title="골격근량"
            value={`${latestData.skeletalMuscleMass}kg`}
            statusType="muscleMass"
            statusValue={latestData.skeletalMuscleMass.toString()}
            icon="fitness-center"
          />
          <MetricCard
            title="체지방률"
            value={`${latestData.bodyFatPercentage}%`}
            statusType="bodyFat"
            statusValue={latestData.bodyFatPercentage.toString()}
            icon="show-chart"
          />
          <MetricCard
            title="BMI"
            value={latestData.bmi.toString()}
            statusType="bmi"
            statusValue={latestData.bmi.toString()}
            icon="assessment"
          />
        </View>
      </View>
    );
  };

  const renderTrendChart = () => {
    if (inbodyData.length < 2) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>체중 변화 추이</Text>
          <View style={styles.emptyChart}>
            <Icon name="show-chart" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>충분한 데이터가 없습니다</Text>
            <Text style={styles.emptySubText}>최소 2회 이상의 측정이 필요합니다</Text>
          </View>
        </View>
      );
    }

    // Get recent 6 months data for chart
    const chartData = inbodyData.slice(0, 6).reverse();
    
    const data = {
      labels: chartData.map(item => {
        const date = new Date(item.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          data: chartData.map(item => item.weight),
          color: (opacity = 1) => `rgba(70, 130, 180, ${opacity})`, // Steel blue
          strokeWidth: 3,
        },
      ],
    };

    const chartConfig = {
      backgroundGradientFrom: Colors.surface,
      backgroundGradientTo: Colors.surface,
      backgroundGradientFromOpacity: 1,
      backgroundGradientToOpacity: 1,
      color: (opacity = 1) => `rgba(70, 130, 180, ${opacity})`,
      labelColor: (opacity = 1) => Colors.textSecondary,
      strokeWidth: 2,
      barPercentage: 0.5,
      useShadowColorFromDataset: false,
      decimalPlaces: 1,
      propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: '#4682B4',
        fill: Colors.surface,
      },
      propsForBackgroundLines: {
        strokeDasharray: '',
        stroke: Colors.border,
        strokeWidth: 1,
      },
    };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>체중 변화 추이</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={data}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            withDots={true}
            withShadow={false}
            yAxisSuffix="kg"
            segments={4}
          />
          
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4682B4' }]} />
              <Text style={styles.legendText}>체중 (kg)</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.section}>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Icon name="share" size={20} color={Colors.text} />
          <Text style={styles.shareButtonText}>공유하기</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.addButton} onPress={handleAddRecord}>
          <Icon name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>검사기록</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="assessment" size={64} color={Colors.textLight} />
      <Text style={styles.emptyTitle}>인바디 데이터가 없습니다</Text>
      <Text style={styles.emptySubtitle}>첫 번째 측정을 추가해보세요</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddRecord}>
        <Text style={styles.emptyButtonText}>검사기록 추가</Text>
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

  if (!latestData) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        {renderEmptyState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {renderHeader()}
        {renderMetricCards()}
        {renderTrendChart()}
        {renderActionButtons()}
        
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
  lastMeasurement: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  chartContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chart: {
    borderRadius: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyChart: {
    backgroundColor: Colors.surface,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InBodyScreen;