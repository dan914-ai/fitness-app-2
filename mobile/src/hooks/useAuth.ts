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
  // TESTING MODE - Always authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Changed to true for testing
  const [isLoading, setIsLoading] = useState(false); // Changed to false for testing
  const [user, setUser] = useState<any | null>({ id: 'test-user', email: 'test@example.com' }); // Mock user for testing

  useEffect(() => {
    // DISABLED FOR TESTING - Skip auth checks
    return; // Early return to skip all auth logic
    
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
    // TESTING MODE - Always return authenticated
    return true;
    
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