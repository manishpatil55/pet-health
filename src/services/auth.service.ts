import api from './api';
import type { User } from '@/types';

interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface SignupResponse {
  success: boolean;
  message: string;
  email: string;
  otpExpiresAt: number;
}

interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  email: string;
  expiresIn: number;
}

export const authService = {
  signup: async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<SignupResponse> => {
    const res = await api.post('/auth/signup', data);
    return res.data;
  },

  verifyEmail: async (data: {
    email: string;
    otp: string;
  }): Promise<VerifyEmailResponse> => {
    const res = await api.post('/auth/verify-email', data);
    return res.data;
  },

  resendOtp: async (
    email: string,
  ): Promise<{ success: boolean; email: string; otpExpiresAt: number }> => {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  googleLogin: async (data: { idToken: string }): Promise<AuthResponse> => {
    const res = await api.post('/auth/google', data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  logoutAll: async (): Promise<void> => {
    await api.post('/auth/logout-all');
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await api.post('/auth/change-password', data);
  },

  forgotPassword: async (
    email: string,
  ): Promise<ForgotPasswordResponse> => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (data: {
    email: string;
    token: string;
    newPassword: string;
  }): Promise<void> => {
    await api.post('/auth/reset-password', data);
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete('/auth/delete-account');
  },
};
