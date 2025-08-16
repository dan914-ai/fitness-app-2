import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Button, Alert } from 'react-native';
import { supabase } from '../config/supabase';
import { Colors } from '../constants/colors';

interface DiagnosticInfo {
  envVars: {
    supabaseUrl: string;
    supabaseKey: string;
    apiUrl: string;
  };
  supabaseStatus: {
    connected: boolean;
    error?: string;
    session?: boolean;
  };
  networkStatus: {
    isConnected: boolean;
    type?: string;
  };
  testResults: string[];
}

export default function DiagnosticScreen() {
  const [info, setInfo] = useState<DiagnosticInfo>({
    envVars: {
      supabaseUrl: '',
      supabaseKey: '',
      apiUrl: '',
    },
    supabaseStatus: {
      connected: false,
    },
    networkStatus: {
      isConnected: false,
    },
    testResults: [],
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results: string[] = [];
    
    // 1. Check environment variables
    const envVars = {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'NOT SET',
      supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'NOT SET',
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'NOT SET',
    };
    
    results.push(`✓ Environment variables loaded`);
    results.push(`  - Supabase URL: ${envVars.supabaseUrl.substring(0, 30)}...`);
    results.push(`  - Has Supabase Key: ${envVars.supabaseKey !== 'NOT SET' ? 'YES' : 'NO'}`);
    
    // 2. Test Supabase connection
    let supabaseStatus: any = { connected: false };
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        supabaseStatus.error = error.message;
        results.push(`✗ Supabase auth error: ${error.message}`);
      } else {
        supabaseStatus.connected = true;
        supabaseStatus.session = !!session;
        results.push(`✓ Supabase connected (Session: ${session ? 'Active' : 'None'})`);
      }
    } catch (e: any) {
      supabaseStatus.error = e.message;
      results.push(`✗ Supabase connection failed: ${e.message}`);
    }
    
    // 3. Test Supabase storage
    try {
      const { data, error } = await supabase.storage
        .from('exercise-gifs')
        .list('', { limit: 1 });
      
      if (error) {
        results.push(`✗ Storage access error: ${error.message}`);
      } else {
        results.push(`✓ Storage accessible (${data?.length || 0} items found)`);
      }
    } catch (e: any) {
      results.push(`✗ Storage test failed: ${e.message}`);
    }
    
    // 4. Test creating a test user
    try {
      const testEmail = `diag_${Date.now()}@test.com`;
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'test123456',
      });
      
      if (error) {
        results.push(`✗ Test signup error: ${error.message}`);
      } else {
        results.push(`✓ Test signup worked (User: ${data.user?.id?.substring(0, 8)}...)`);
        results.push(`  - Email confirmation required: ${!data.session ? 'YES' : 'NO'}`);
      }
    } catch (e: any) {
      results.push(`✗ Signup test failed: ${e.message}`);
    }
    
    setInfo({
      envVars,
      supabaseStatus,
      networkStatus: { isConnected: true }, // Simplified for now
      testResults: results,
    });
  };

  const testDirectConnection = async () => {
    try {
      const response = await fetch('https://ayttqsgttuvdhvbvbnsk.supabase.co/auth/v1/health');
      const text = await response.text();
      Alert.alert('Direct Connection Test', `Status: ${response.status}\nResponse: ${text}`);
    } catch (error: any) {
      Alert.alert('Direct Connection Failed', error.message);
    }
  };

  const testSupabaseClient = async () => {
    try {
      // Test 1: Check if client is initialized
      Alert.alert('Testing', 'Checking Supabase client...');
      
      const url = (supabase as any).supabaseUrl || 'NOT FOUND';
      const hasKey = !!(supabase as any).supabaseKey;
      
      // Test 2: Try a simple auth call
      const { error } = await supabase.auth.getUser();
      
      Alert.alert(
        'Supabase Client Test',
        `URL: ${url}\nHas Key: ${hasKey}\nAuth Test: ${error ? `Failed - ${error.message}` : 'Success'}`
      );
    } catch (error: any) {
      Alert.alert('Client Test Failed', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Connection Diagnostics</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Environment Variables</Text>
        <Text style={styles.mono}>URL: {info.envVars.supabaseUrl}</Text>
        <Text style={styles.mono}>Key: {info.envVars.supabaseKey.substring(0, 20)}...</Text>
        <Text style={styles.mono}>API: {info.envVars.apiUrl}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Results</Text>
        {info.testResults.map((result, index) => (
          <Text key={index} style={[styles.result, result.startsWith('✓') ? styles.success : result.startsWith('✗') ? styles.error : styles.info]}>
            {result}
          </Text>
        ))}
      </View>
      
      <View style={styles.section}>
        <Button title="Run Diagnostics Again" onPress={runDiagnostics} />
        <View style={{ height: 10 }} />
        <Button title="Test Direct Connection" onPress={testDirectConnection} />
        <View style={{ height: 10 }} />
        <Button title="Test Supabase Client" onPress={testSupabaseClient} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginVertical: 2,
  },
  result: {
    fontSize: 14,
    marginVertical: 2,
  },
  success: {
    color: 'green',
  },
  error: {
    color: 'red',
  },
  info: {
    color: Colors.textSecondary,
  },
});