import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import { safeJsonParse, safeJsonStringify } from '../utils/safeJsonParse';

interface SessionData {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

class SessionService {
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private readonly SESSION_KEY = 'session_data';
  private readonly SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // Refresh 5 minutes before expiry

  async initializeSession(): Promise<void> {
    // Start session monitoring
    this.startSessionMonitoring();
    
    // Check current session validity
    await this.validateSession();
  }

  private startSessionMonitoring(): void {
    // Clear any existing interval
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    // Set up periodic session validation
    this.sessionCheckInterval = setInterval(async () => {
      await this.validateSession();
    }, this.SESSION_CHECK_INTERVAL);
  }

  async validateSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        await this.clearSession();
        return false;
      }

      // Check if token needs refresh
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const now = Date.now();
      
      if (expiresAt - now < this.TOKEN_EXPIRY_BUFFER) {
        // Token is about to expire, refresh it
        const refreshed = await this.refreshSession();
        if (!refreshed) {
          await this.clearSession();
          return false;
        }
      }

      // Store session data locally
      await this.storeSession({
        userId: session.user.id,
        email: session.user.email!,
        accessToken: session.access_token,
        refreshToken: session.refresh_token!,
        expiresAt,
      });

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        console.error('Failed to refresh session:', error);
        return false;
      }

      // Store refreshed session
      await this.storeSession({
        userId: data.session.user.id,
        email: data.session.user.email!,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token!,
        expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : 0,
      });

      return true;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  }

  private async storeSession(sessionData: SessionData): Promise<void> {
    await AsyncStorage.setItem(this.SESSION_KEY, safeJsonStringify(sessionData));
  }

  async getSession(): Promise<SessionData | null> {
    try {
      const sessionStr = await AsyncStorage.getItem(this.SESSION_KEY);
      if (!sessionStr) return null;
      
      const session = safeJsonParse(sessionStr, null);
      if (!session) return null;

      // Validate session is not expired
      if (session.expiresAt && session.expiresAt < Date.now()) {
        // Session expired, try to refresh
        const refreshed = await this.refreshSession();
        if (!refreshed) {
          await this.clearSession();
          return null;
        }
        // Get the new session data
        const newSessionStr = await AsyncStorage.getItem(this.SESSION_KEY);
        return newSessionStr ? safeJsonParse(newSessionStr, null) : null;
      }

      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  async clearSession(): Promise<void> {
    await AsyncStorage.removeItem(this.SESSION_KEY);
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  }

  async handleUnauthorized(): Promise<void> {
    // Clear local session
    await this.clearSession();
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Navigate to login (handled by auth state change listener)
  }

  destroy(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }
}

export const sessionService = new SessionService();
export default sessionService;