import api from './api';
import { AuthResponse, ApiResponse, User } from './types';

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        data: { token: '', user: { id: '', name: '', email: '', role: 'user' } },
        message: err.response?.data?.message || 'Invalid email or password',
      };
    }
  },

  async register(data: {
    username: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        data: { token: '', user: { id: '', name: '', email: '', role: 'user' } },
        message: err.response?.data?.message || 'Registration failed',
      };
    }
  },

  async logout(): Promise<ApiResponse<null>> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
    }
    return { success: true, data: null, message: 'Logged out successfully' };
  },

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    try {
      const response = await api.get<User>('/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, data: null, message: 'Failed to fetch user' };
    }
  },
};