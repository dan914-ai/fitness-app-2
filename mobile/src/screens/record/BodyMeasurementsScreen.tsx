import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { RecordStackScreenProps } from '../../navigation/types';

type BodyMeasurementsScreenProps = RecordStackScreenProps<'BodyMeasurements'>;

export default function BodyMeasurementsScreen({ navigation }: BodyMeasurementsScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>신체 측정</Text>
          <Text style={styles.subtitle}>체성분 분석을 통해 신체 변화를 추적하세요</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('InBodyScreen')}
          >
            <View style={styles.optionIcon}>
              <Icon name="assessment" size={32} color={Colors.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>인바디 검사</Text>
              <Text style={styles.optionDescription}>체중, 골격근량, 체지방률 기록</Text>
            </View>
            <Icon name="arrow-forward-ios" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionCard, styles.disabledCard]}>
            <View style={styles.optionIcon}>
              <Icon name="straighten" size={32} color={Colors.textLight} />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, styles.disabledText]}>신체 사이즈</Text>
              <Text style={[styles.optionDescription, styles.disabledText]}>가슴, 허리, 팔뚝 등 부위별 측정</Text>
              <Text style={styles.comingSoon}>곧 출시 예정</Text>
            </View>
          </TouchableOpacity>
        </View>
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
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  disabledCard: {
    opacity: 0.6,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  disabledText: {
    color: Colors.textLight,
  },
  comingSoon: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '500',
    marginTop: 4,
  },
});