import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../../constants/colors';

export default function TestEndButton() {
  const handleEnd = () => {
    Alert.alert('Success!', 'End button works!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Button Test Screen</Text>
      
      <TouchableOpacity 
        style={styles.endButton}
        onPress={handleEnd}
      >
        <Text style={styles.endButtonText}>종료 TEST</Text>
      </TouchableOpacity>
    </SafeAreaView>
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
    fontSize: 20,
    marginBottom: 40,
  },
  endButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 10,
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});