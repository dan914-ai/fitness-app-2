import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service.supabase';
import { sessionService } from '../services/session.service';

interface UseAuthResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  checkAuth: () => Promise<boolean>;
}

export function useAuth(): UseAuthResult {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Initial auth check
    checkAuth();

    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange(async (authenticated) => {
      setIsAuthenticated(authenticated);
      if (authenticated) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check session validity
      const session = await sessionService.getSession();
      const isValid = !!session;
      
      setIsAuthenticated(isValid);
      
      if (isValid) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
      
      return isValid;
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    checkAuth,
  };
}

export default useAuth;