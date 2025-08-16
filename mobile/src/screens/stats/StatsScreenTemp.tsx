import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export default function StatsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>통계</Text>
      <Text style={styles.subtitle}>Stats page is being fixed...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
});