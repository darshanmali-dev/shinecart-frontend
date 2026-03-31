import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/services/types';
import { authService } from '@/services/authService';

/* eslint-disable react-refresh/only-export-components */
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: { username: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; message?: string }>;  // ADD THIS
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const initAuth = async () => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        const response = await authService.getCurrentUser();

        if (response.success) {
          setUser(response.data);
        } else {
          logout(); 
        }
      } catch (error) {
        console.error("Auto-login failed:", error);
        logout();
      }
    }
    
    setIsLoading(false);
  };

  initAuth();
}, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    if (response.success) {
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
      return { success: true };
    }
    return { success: false, message: response.message };
  };

  const register = async (data: {
  username: string;
  email: string;
  phone: string;
  password: string;
}) => {
  const response = await authService.register(data);
  if (response.success) {
    setUser(response.data.user);
    setToken(response.data.token);
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    return { success: true };
  }
  return { success: false, message: response.message };
};

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return (
  <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, isAuthenticated: !!user }}>
    {children}
  </AuthContext.Provider>
);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
