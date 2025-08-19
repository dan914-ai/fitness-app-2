import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import notificationService from './notification.service';
import sessionService from './session.service';
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
    supabase.auth.onAuthStateChange(async (event, session) => {
      const isAuthenticated = !!session;
      
      // Handle session changes
      if (event === 'SIGNED_IN' && session) {
        await sessionService.initializeSession();
      } else if (event === 'SIGNED_OUT') {
        await sessionService.clearSession();
        sessionService.destroy();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        await sessionService.validateSession();
      }
      
      this.notifyAuthStateChange(isAuthenticated);
    });
    
    // Initialize session on startup
    this.restoreSession();
  }

  private async restoreSession(): Promise<void> {
    try {
      const isValid = await sessionService.validateSession();
      if (isValid) {
        this.notifyAuthStateChange(true);
      }
    } catch (error) {
      console.error('Session restoration error:', error);
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase login error:', error);
      // Check if email is not confirmed
      if (error.message.includes('Email not confirmed')) {
        throw new Error('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
      }
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('로그인에 실패했습니다.');
    }

    // Check if email is verified
    if (data.user.email && !data.user.email_confirmed_at) {
      throw new Error('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      username: data.user.user_metadata?.username || data.user.email!.split('@')[0],
    };

    await AsyncStorage.setItem('authToken', data.session.access_token);
    await AsyncStorage.setItem('user', safeJsonStringify(user));
    
    // Initialize session management
    await sessionService.initializeSession();
    
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
        emailRedirectTo: `${window.location.origin}/auth/confirm`, // Enable email verification
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('회원가입에 실패했습니다.');
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      // Email confirmation is required
      throw new Error('확인 이메일을 전송했습니다. 이메일을 확인한 후 로그인해주세요.');
    }

    // If session exists, user can login immediately (email verification disabled in Supabase)
    if (data.session) {
      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        username: data.user.user_metadata?.username || data.user.email!.split('@')[0],
      };

      await AsyncStorage.setItem('authToken', data.session.access_token);
      await AsyncStorage.setItem('user', safeJsonStringify(user));
      
      // Initialize session management
      await sessionService.initializeSession();
      
      // Initialize notifications after registration
      await notificationService.initialize();
      
      // Notify listeners
      this.notifyAuthStateChange(true);
      
      return {
        user,
        token: data.session.access_token,
      };
    }

    // Fallback (shouldn't reach here if email verification is properly configured)
    return this.login(email, password);
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
    }

    // Clear session
    await sessionService.clearSession();
    sessionService.destroy();
    
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

  async resendVerificationEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async verifyOtp(email: string, token: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('인증에 실패했습니다.');
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      username: data.user.user_metadata?.username || data.user.email!.split('@')[0],
    };

    await AsyncStorage.setItem('authToken', data.session.access_token);
    await AsyncStorage.setItem('user', safeJsonStringify(user));
    
    // Initialize notifications after verification
    await notificationService.initialize();
    
    // Notify listeners
    this.notifyAuthStateChange(true);
    
    return {
      user,
      token: data.session.access_token,
    };
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

// Use production auth service instead
import { productionAuthService } from './auth.service.production';
export const authService = productionAuthService;
export default authService;

// Keep old service as backup
export const authServiceOld = new AuthServiceSupabase();