import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useForm, Controller } from 'react-hook-form';
import { AuthStackScreenProps } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import authService from '../../services/auth.service';
import { supabase } from '../../config/supabase';
import { CommonActions } from '@react-navigation/native';

type FormData = {
  email: string;
  password: string;
};

export default function LoginScreen({ navigation }: AuthStackScreenProps<'Login'>) {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors }, setValue } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      // Try Supabase login
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (supabaseError) {
        // Handle different error types
        let errorMessage = '로그인에 실패했습니다.';
        
        // Check for specific error types
        if (supabaseError.message?.toLowerCase().includes('invalid login credentials') || 
            supabaseError.message?.toLowerCase().includes('invalid password') ||
            supabaseError.message?.toLowerCase().includes('incorrect') ||
            supabaseError.message?.toLowerCase().includes('wrong')) {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else if (supabaseError.message?.toLowerCase().includes('user not found')) {
          errorMessage = '존재하지 않는 계정입니다.';
        } else if (supabaseError.message?.includes('Email not confirmed')) {
          errorMessage = '이메일 인증이 필요합니다.';
        } else if (supabaseError.message) {
          errorMessage = supabaseError.message;
        }
        
        
        // Always show an error alert - ensure it works on web
        
        // For web platform, use a timeout to ensure the alert shows
        if (Platform.OS === 'web') {
          setTimeout(() => {
            if (showTestAccountHint) {
              Alert.alert(
                '로그인 실패',
                `${errorMessage}\n\n테스트 계정을 사용하려면 아래 "테스트 계정 자동 생성" 버튼을 눌러주세요.`
              );
            } else {
              Alert.alert(
                '로그인 실패',
                errorMessage
              );
            }
          }, 100);
        } else {
          if (showTestAccountHint) {
            Alert.alert(
              '로그인 실패',
              `${errorMessage}\n\n테스트 계정을 사용하려면 아래 "테스트 계정 자동 생성" 버튼을 눌러주세요.`
            );
          } else {
            Alert.alert(
              '로그인 실패',
              errorMessage
            );
          }
        }
        return;
      }
      
      // Successful login - try through auth service
      await authService.login(data.email, data.password);
      // Navigate to main app - handled by auth state change
    } catch (error: any) {
      console.error('Login error:', error);
      // Always show error alert for any unexpected errors
      Alert.alert(
        '로그인 실패',
        error.message || '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>운동 기록 시작하기</Text>
        <Text style={styles.subtitle}>로그인하여 운동을 기록하세요</Text>

        <Controller
          control={control}
          rules={{
            required: '이메일을 입력해주세요',
            pattern: {
              value: /^\S+@\S+$/i,
              message: '올바른 이메일 형식이 아닙니다',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="이메일"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
          name="email"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

        <Controller
          control={control}
          rules={{
            required: '비밀번호를 입력해주세요',
            minLength: {
              value: 6,
              message: '비밀번호는 6자 이상이어야 합니다',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="비밀번호"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
            />
          )}
          name="password"
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>로그인</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>
            계정이 없으신가요? <Text style={styles.linkTextBold}>회원가입</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
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
    marginBottom: 32,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: -12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  linkTextBold: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});