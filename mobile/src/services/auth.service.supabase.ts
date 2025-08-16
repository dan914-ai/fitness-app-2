import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import notificationService from './notification.service';
import { safeJsonParse, safeJsonStringify } from '../utils/safeJsonParse';

interface User {
  id: string;
  email: string;
  username?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

class AuthServiceSupabase {
  private authStateChangeListeners: Array<(isAuthenticated: boolean) => void> = [];

  constructor() {
    // Listen to Supabase auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      const isAuthenticated = !!session;
      this.notifyAuthStateChange(isAuthenticated);
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    console.log('Attempting login with email:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase login error:', error);
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('로그인에 실패했습니다.');
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      username: data.user.user_metadata?.username || data.user.email!.split('@')[0],
    };

    await AsyncStorage.setItem('authToken', data.session.access_token);
    await AsyncStorage.setItem('user', safeJsonStringify(user));
    
    // Initialize notifications after login
    await notificationService.initialize();
    
    // Notify listeners
    this.notifyAuthStateChange(true);
    
    return {
      user,
      token: data.session.access_token,
    };
  }

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('회원가입에 실패했습니다.');
    }

    // For Supabase, after signup, we need to sign in
    return this.login(email, password);
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
    }

    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    
    // Notify listeners
    this.notifyAuthStateChange(false);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const userStr = await AsyncStorage.getItem('user');
        return userStr ? safeJsonParse(userStr, {}) : null;
      }

      return {
        id: user.id,
        email: user.email!,
        username: user.user_metadata?.username || user.email!.split('@')[0],
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      return session.access_token;
    }

    return AsyncStorage.getItem('authToken');
  }

  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  async refreshToken(): Promise<string | null> {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error || !data.session) {
      return null;
    }

    await AsyncStorage.setItem('authToken', data.session.access_token);
    return data.session.access_token;
  }

  onAuthStateChange(listener: (isAuthenticated: boolean) => void): () => void {
    this.authStateChangeListeners.push(listener);
    return () => {
      this.authStateChangeListeners = this.authStateChangeListeners.filter(l => l !== listener);
    };
  }

  private notifyAuthStateChange(isAuthenticated: boolean): void {
    this.authStateChangeListeners.forEach(listener => {
      try {
        listener(isAuthenticated);
      } catch (error) {
        console.error('Auth state change listener error:', error);
      }
    });
  }
}

export const authService = new AuthServiceSupabase();
export default authService;