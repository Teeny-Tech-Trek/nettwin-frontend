// src/axios.config.ts
import axios from 'axios';

// Base URL for all API calls.
// Set VITE_API_BASE_URL in production, otherwise the local backend is used.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  // Required so the backend's httpOnly `refreshToken` cookie is sent on
  // /auth/google, /auth/refresh, /auth/logout and any future cookie-bound route.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds auth token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle protected-route 401s without interrupting login/signup form errors.
    const requestUrl = error.config?.url || '';
    const isAuthRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/signup') ||
      requestUrl.includes('/auth/google');

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

// Export base URL for non-axios usage (like fetch or image URLs)
export const API_BASE_URL = BASE_URL;
export const IMAGE_BASE_URL =
  import.meta.env.VITE_IMAGE_BASE_URL || BASE_URL.replace(/\/api\/?$/, '');

// Log the current configuration (only in development)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseURL: BASE_URL,
    imageBaseURL: IMAGE_BASE_URL,
  });
}
