// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../lib/api';

const AUTH_TOKEN_KEY = 'dh_token';
const USER_DATA_KEY = 'dh_user';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  department?: string;
  avatar?: string;
  lastLogin?: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user: User }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_DATA_KEY);
      
      if (token && storedUser) {
        try {
          // Verify token with backend
          const response = await api.auth.verifyToken(token);
          if (response.valid) {
            setUser(JSON.parse(storedUser));
          } else {
            // Clear invalid session
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(USER_DATA_KEY);
          }
        } catch (error) {
          console.error('Session verification failed:', error);
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(USER_DATA_KEY);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password);
      
      if (response.success && response.user) {
        // Store auth data
        localStorage.setItem(AUTH_TOKEN_KEY, response.token);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
        
        // Update last login
        await api.auth.updateLastLogin(response.user.id);
        
        setUser(response.user);
        return { success: true, user: response.user };
      }
      throw new Error('Login failed');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        await api.auth.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === 'SUPER_ADMIN') return true;
    
    // Check user's permissions
    return user.permissions?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};