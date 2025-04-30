'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData: { userId: number; username: string; email: string; role?: string }) => Promise<void>;
  logout: () => void;
  checkRole: (allowedRoles: string[]) => boolean;
  isLoading: boolean; // Added loading state
}

// Helper to get cookie value
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const router = useRouter();

  // Improved login with proper error handling and setting both storage options
  const login = useCallback(async (
    token: string, 
    userData: { userId: number; username: string; email: string; role?: string }
  ) => {
    try {
      // Ensure role is provided, default to 'user' if missing
      const userObj: User = {
        id: userData.userId,
        username: userData.username,
        email: userData.email,
        role: userData.role || 'user'
      };

      console.log('Setting auth data for user:', userObj.email, 'with role:', userObj.role);

      // Set cookie first for immediate availability to middleware
      document.cookie = `token=${token}; path=/; max-age=86400; secure; samesite=strict`;
      
      // Wait briefly to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Then set localStorage as a backup
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userObj));

      // Update state after successful storage
      setUser(userObj);
      setIsAuthenticated(true);
      
      // Verify cookie was set properly
      const cookieCheck = getCookie('token');
      console.log('Cookie verification:', cookieCheck ? 'token cookie set' : 'token cookie NOT set');
      
      if (!cookieCheck) {
        console.warn('Cookie was not set properly. This may cause authentication issues.');
      }
    } catch (error) {
      console.error('Login storage error:', error);
      // Attempt cleanup on error
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      throw error;
    }
  }, []);

  // Improved logout with error handling and full cleanup
  const logout = useCallback(() => {
    try {
      console.log('Logging out user');
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear cookie with multiple safety patterns
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=strict';
      document.cookie = 'token=; path=/; max-age=0; secure; samesite=strict';
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Attempt to force navigate even if other parts fail
      router.push('/login');
    }
  }, [router]);

  // Improved role checking with more robust validation
  const checkRole = useCallback((allowedRoles: string[]): boolean => {
    if (!user || !user.role) return false;
    
    // Support for superadmin role or matching specific allowed roles
    if (user.role === 'superadmin') return true;
    
    return allowedRoles.some(role => 
      role === user.role || 
      // Optional: Add support for role hierarchy or patterns
      (role === '*') // Wildcard for any authenticated user
    );
  }, [user]);

  // Enhanced init auth check
  useEffect(() => {
    try {
      setIsLoading(true);
      
      // First try to get auth from cookie (primary source for SSR compatibility)
      const tokenFromCookie = getCookie('token');
      
      // Fallback to localStorage
      const tokenFromStorage = localStorage.getItem('token');
      const userDataString = localStorage.getItem('user');
      
      if (tokenFromCookie && userDataString) {
        // Cookie exists and user data available
        const userData = JSON.parse(userDataString);
        
        if (!userData.role) {
          console.warn('User data missing role, defaulting to "user"');
          userData.role = 'user';
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        console.log('Auth restored from cookie for', userData.email, 'with role:', userData.role);
        setUser(userData);
        setIsAuthenticated(true);
      } else if (tokenFromStorage && userDataString) {
        // Cookie missing but localStorage available - restore cookie
        const userData = JSON.parse(userDataString);
        
        if (!userData.role) {
          console.warn('User data missing role, defaulting to "user"');
          userData.role = 'user';
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        // Restore cookie from localStorage
        document.cookie = `token=${tokenFromStorage}; path=/; max-age=86400; secure; samesite=strict`;
        
        console.log('Auth restored from localStorage for', userData.email, 'with role:', userData.role);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // No valid auth data found
        console.log('No auth data found');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // On any error, clear auth state for safety
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear any potentially corrupted storage
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      } catch (cleanupError) {
        console.error('Auth cleanup error:', cleanupError);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = {
    isAuthenticated,
    user,
    login,
    logout,
    checkRole,
    isLoading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
