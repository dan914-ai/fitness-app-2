import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { safeJsonParse, safeJsonStringify } from '../utils/safeJsonParse';

// Mock authentication for testing when Supabase auth isn't working
export const MOCK_TEST_USER = {
  id: 'test-user-123',
  email: 'test@example.com',
  username: 'testuser',
  created_at: new Date().toISOString(),
};

export async function loginWithMockAuth(email: string, password: string) {
  
  // Accept test credentials and the working email format
  const validTestAccounts = [
    { email: 'test@example.com', password: 'test123456' },
    { email: 'testuser@testmail.com', password: 'test123456' },
  ];
  
  const isValid = validTestAccounts.some(
    acc => acc.email === email && acc.password === password
  );
  
  if (isValid) {
    // Store mock session
    const mockUser = {
      ...MOCK_TEST_USER,
      email: email,
    };
    
    await AsyncStorage.setItem('mock_auth_session', safeJsonStringify({
      user: mockUser,
      access_token: 'mock-token-123',
      refresh_token: 'mock-refresh-123',
      expires_at: Date.now() + 3600000, // 1 hour from now
    }));
    
    // Also store in regular auth storage to trigger auth state change
    await AsyncStorage.setItem('authToken', 'mock-token-123');
    await AsyncStorage.setItem('user', safeJsonStringify(mockUser));
    
    // Set a flag that we're using mock auth
    await AsyncStorage.setItem('using_mock_auth', 'true');
    
    return {
      success: true,
      user: mockUser,
      session: {
        access_token: 'mock-token-123',
        refresh_token: 'mock-refresh-123',
        user: mockUser,
      }
    };
  }
  
  return {
    success: false,
    error: 'Invalid credentials for mock auth',
  };
}

export async function getMockSession() {
  try {
    const sessionStr = await AsyncStorage.getItem('mock_auth_session');
    if (!sessionStr) return null;
    
    const session = safeJsonParse(sessionStr, {});
    
    // Check if session is expired
    if (session.expires_at < Date.now()) {
      await AsyncStorage.removeItem('mock_auth_session');
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error getting mock session:', error);
    return null;
  }
}

export async function signOutMockAuth() {
  await AsyncStorage.removeItem('mock_auth_session');
}

// Try different email formats that might work with Supabase
export async function tryAlternativeEmails() {
  const emailVariations = [
    'test@test.com',
    'user@user.com', 
    'demo@demo.com',
    'test123@test.com',
    'testuser@testmail.com',
  ];
  
  for (const email of emailVariations) {
    try {
      
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'test123456',
        options: {
          data: {
            username: 'testuser',
          },
          emailRedirectTo: undefined, // Don't require email confirmation for test accounts
        },
      });
      
      if (data?.user) {
        
        // Save successful format for future use
        await AsyncStorage.setItem('working_email_format', email);
        
        // Sign out so user can sign in manually
        await supabase.auth.signOut();
        return { success: true, email, password: 'test123456' };
      }
      
      if (error) {
      }
    } catch (err: any) {
    }
  }
  
  // Check if we have a previously working email format
  try {
    const savedEmail = await AsyncStorage.getItem('working_email_format');
    if (savedEmail) {
      return { success: true, email: savedEmail, password: 'test123456' };
    }
  } catch (err) {
  }
  
  return { success: false };
}