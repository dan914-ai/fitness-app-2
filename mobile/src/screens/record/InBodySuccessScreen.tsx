import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { RecordStackScreenProps } from '../../navigation/types';
import { CommonActions } from '@react-navigation/native';

type InBodySuccessScreenProps = RecordStackScreenProps<'InBodySuccess'>;

export default function InBodySuccessScreen({ navigation, route }: InBodySuccessScreenProps) {
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Animate success icon
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleViewHistory = () => {
    // Navigate back to InBodyScreen and reset the stack
    navigation.reset({
      index: 1,
      routes: [
        { name: 'RecordMain' },
        { name: 'InBodyScreen' }
      ],
    });
  };

  const handleAddAnother = () => {
    // Replace current screen with AddInBodyRecord
    navigation.replace('AddInBodyRecord');
  };

  const handleGoHome = () => {
    // Navigate back to RecordMain
    navigation.reset({
      index: 0,
      routes: [{ name: 'RecordMain' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.successIconContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Icon name="check-circle" size={100} color="#10B981" />
        </Animated.View>

        <Animated.View 
          style={[
            styles.textContainer,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.title}>저장 완료!</Text>
          <Text style={styles.subtitle}>인바디 기록이 성공적으로 저장되었습니다</Text>

          {route.params?.recordData && (
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>측정일</Text>
                <Text style={styles.summaryValue}>
                  {new Date(route.params.recordData.date).toLocaleDateString('ko-KR')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>체중</Text>
                <Text style={styles.summaryValue}>{route.params.recordData.weight}kg</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>골격근량</Text>
                <Text style={styles.summaryValue}>{route.params.recordData.skeletalMuscleMass}kg</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>체지방률</Text>
                <Text style={styles.summaryValue}>{route.params.recordData.bodyFatPercentage}%</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>BMI</Text>
                <Text style={styles.summaryValue}>{route.params.recordData.bmi}</Text>
              </View>
            </View>
          )}
        </Animated.View>

        <Animated.View 
          style={[
            styles.buttonContainer,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={handleViewHistory}
          >
            <Icon name="analytics" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>기록 보기</Text>
          </TouchableOpacity>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={handleAddAnother}
            >
              <Icon name="add" size={20} color={Colors.primary} />
              <Text style={styles.secondaryButtonText}>추가 기록</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={handleGoHome}
            >
              <Icon name="home" size={20} color={Colors.primary} />
              <Text style={styles.secondaryButtonText}>홈으로</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successIconContainer: {
    marginBottom: 32,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    width: '100%',
    maxWidth: 320,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});