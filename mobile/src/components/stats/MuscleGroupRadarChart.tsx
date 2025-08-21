import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { MuscleGroupDistribution } from '../../utils/statsCalculations';

const { width: screenWidth } = Dimensions.get('window');

interface MuscleGroupRadarChartProps {
  data: MuscleGroupDistribution[];
  comparisonData?: MuscleGroupDistribution[];
  title?: string;
}

export default function MuscleGroupRadarChart({ 
  data, 
  comparisonData,
  title 
}: MuscleGroupRadarChartProps) {
  const size = Math.min(screenWidth - 80, 280);
  const center = size / 2;
  const radius = size * 0.35;
  const angleStep = (2 * Math.PI) / 6; // 6 muscle groups

  // Muscle groups in order
  const muscleGroups = ['등', '어깨', '팔', '가슴', '하체', '코어'];
  
  // Normalize data to 0-100 scale
  const maxValue = Math.max(...data.map(d => d.percentage), 30); // At least 30% scale
  
  // Helper function to calculate point position
  const getPoint = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const normalizedValue = Math.min(value / maxValue, 1);
    const r = radius * normalizedValue;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Create polygon points for main data
  const polygonPoints = muscleGroups
    .map((muscle, index) => {
      const muscleData = data.find(d => d.muscleGroup === muscle) || { percentage: 0 };
      const point = getPoint(muscleData.percentage, index);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  // Create polygon points for comparison data if provided
  const comparisonPoints = comparisonData
    ? muscleGroups
        .map((muscle, index) => {
          const muscleData = comparisonData.find(d => d.muscleGroup === muscle) || { percentage: 0 };
          const point = getPoint(muscleData.percentage, index);
          return `${point.x},${point.y}`;
        })
        .join(' ')
    : null;

  // Create grid lines
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={styles.chartContainer}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background grid */}
          <G>
            {/* Circular grid lines */}
            {gridLevels.map((level, index) => {
              const points = Array.from({ length: 6 }, (_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const r = radius * level;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
              }).join(' ');
              
              return (
                <Polygon
                  key={`grid-${index}`}
                  points={points}
                  fill="none"
                  stroke={Colors.border}
                  strokeWidth="1"
                  strokeOpacity="0.3"
                />
              );
            })}

            {/* Radial lines */}
            {muscleGroups.map((_, index) => {
              const angle = index * angleStep - Math.PI / 2;
              const endX = center + radius * Math.cos(angle);
              const endY = center + radius * Math.sin(angle);
              
              return (
                <Line
                  key={`line-${index}`}
                  x1={center}
                  y1={center}
                  x2={endX}
                  y2={endY}
                  stroke={Colors.border}
                  strokeWidth="1"
                  strokeOpacity="0.3"
                />
              );
            })}
          </G>

          {/* Comparison data polygon (if provided) */}
          {comparisonPoints && (
            <Polygon
              points={comparisonPoints}
              fill={Colors.textSecondary}
              fillOpacity="0.2"
              stroke={Colors.textSecondary}
              strokeWidth="2"
              strokeOpacity="0.6"
            />
          )}

          {/* Main data polygon */}
          <Polygon
            points={polygonPoints}
            fill={Colors.primary}
            fillOpacity="0.3"
            stroke={Colors.primary}
            strokeWidth="2.5"
          />

          {/* Data points */}
          {muscleGroups.map((muscle, index) => {
            const muscleData = data.find(d => d.muscleGroup === muscle) || { percentage: 0 };
            const point = getPoint(muscleData.percentage, index);
            
            return (
              <Circle
                key={`point-${index}`}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={Colors.primary}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            );
          })}

          {/* Labels */}
          {muscleGroups.map((muscle, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const labelRadius = radius + 25;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);
            
            return (
              <SvgText
                key={`label-${index}`}
                x={x}
                y={y}
                fill={Colors.text}
                fontSize="14"
                fontWeight="600"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {muscle}
              </SvgText>
            );
          })}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {data
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 3)
          .map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendRank, {
                backgroundColor: index === 0 ? Colors.primary : index === 1 ? Colors.textSecondary : Colors.textLight
              }]}>
                <Text style={styles.legendRankText}>{index + 1}</Text>
              </View>
              <View style={styles.legendInfo}>
                <Text style={styles.legendMuscle}>{item.muscleGroup}</Text>
                <Text style={styles.legendValue}>
                  {item.percentage.toFixed(1)}% • {(item.volume / 1000).toFixed(1)}t
                </Text>
              </View>
            </View>
          ))}
      </View>

      {comparisonData && (
        <View style={styles.comparisonLegend}>
          <View style={styles.comparisonItem}>
            <View style={[styles.comparisonDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.comparisonText}>현재</Text>
          </View>
          <View style={styles.comparisonItem}>
            <View style={[styles.comparisonDot, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.comparisonText}>이전</Text>
          </View>
        </View>
      )}
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
  chartContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  svg: {
    backgroundColor: 'transparent',
  },
  legend: {
    marginTop: 20,
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  legendInfo: {
    flex: 1,
  },
  legendMuscle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  legendValue: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  comparisonLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  comparisonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  comparisonText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});