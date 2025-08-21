import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ViewStyle, TextStyle } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors } from '../../constants/colors';

interface ProgressCircleProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  title?: string;
  subtitle?: string;
  text?: string;
  subText?: string;
  animate?: boolean;
  animationDuration?: number;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  percentageStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = Colors.primary,
  backgroundColor = Colors.border,
  showPercentage = true,
  title,
  subtitle,
  text,
  subText,
  animate = true,
  animationDuration = 1000,
  style,
  titleStyle,
  percentageStyle,
  subtitleStyle,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const circleRef = useRef<any>(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressValue = Math.min(100, Math.max(0, progress));

  useEffect(() => {
    if (animate) {
      Animated.timing(animatedValue, {
        toValue: progressValue,
        duration: animationDuration,
        useNativeDriver: true,
      }).start();
    } else {
      animatedValue.setValue(progressValue);
    }
  }, [progressValue, animate, animationDuration]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const animatedPercentage = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]}>
      {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
      
      <View style={styles.circleContainer}>
        <Svg width={size} height={size} style={styles.svg}>
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            {/* Background Circle */}
            <Circle
              stroke={backgroundColor}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            {/* Progress Circle */}
            <AnimatedCircle
              ref={circleRef}
              stroke={color}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        
        {(showPercentage || text) && (
          <View style={[styles.percentageContainer, { width: size, height: size }]}>
            {text ? (
              <>
                <Text style={[styles.percentage, percentageStyle]}>{text}</Text>
                {subText && <Text style={[styles.subTextInCircle, subtitleStyle]}>{subText}</Text>}
              </>
            ) : animate ? (
              <Animated.Text style={[styles.percentage, percentageStyle]}>
                {animatedValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                })}
              </Animated.Text>
            ) : (
              <Text style={[styles.percentage, percentageStyle]}>
                {`${Math.round(progressValue)}%`}
              </Text>
            )}
          </View>
        )}
      </View>

      {subtitle && <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    transform: [{ rotateZ: '90deg' }],
  },
  percentageContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  subTextInCircle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});