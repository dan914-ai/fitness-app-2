import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';

interface TestModeBannerProps {
  onDisable?: () => void;
}

export default function TestModeBanner({ onDisable }: TestModeBannerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🚀 테스트 모드 - 로그인 건너뜀</Text>
      {onDisable && (
        <TouchableOpacity onPress={onDisable} style={styles.button}>
          <Text style={styles.buttonText}>로그인 화면으로</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFB800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5A000',
  },
  text: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  buttonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
});