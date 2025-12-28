import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Create axios instance
const API: AxiosInstance = axios.create({
  // Use environment variable, fallback to localhost for dev
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://dept-exec-backend.onrender.com/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Important for cross-domain cookies
  withCredentials: false, // Set to true if using cookies
});

// Define response type
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
}

// Request interceptor
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('dept_exec_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
// Fix in api.ts:
API.interceptors.response.use(
  (response) => {
    // Check if response.data already has the structure we expect
    if (response.data && typeof response.data === 'object') {
      return response.data;
    }
    // If not, return the full response
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('dept_exec_token');
      localStorage.removeItem('dept_exec_user');
      window.location.href = '/login';
    }
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'An error occurred';
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default API;