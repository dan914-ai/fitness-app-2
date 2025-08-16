import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { RecordStackScreenProps } from '../../navigation/types';

type ProgressPhotosScreenProps = RecordStackScreenProps<'ProgressPhotos'>;

export default function ProgressPhotosScreen({ navigation }: ProgressPhotosScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>진행 사진</Text>
      <Text style={styles.subtitle}>진행 사진 기능은 곧 출시됩니다</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});