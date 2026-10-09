import axios, { type AxiosError } from 'axios';
import type { ApiError } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8055';

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — attach JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hams_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('hams_refresh_token');

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
          localStorage.setItem('hams_access_token', data.accessToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          }
          return apiClient(originalRequest);
        } catch {
          // Refresh failed — clear auth
          localStorage.removeItem('hams_access_token');
          localStorage.removeItem('hams_refresh_token');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // 1. Connection / Network failure
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return 'The request to hospital services timed out. Please check your connection and try again.';
      }
      return 'Unable to connect to HAMS hospital services. Please check your connection and try again.';
    }

    const status = error.response.status;
    const data = error.response.data as ApiError | undefined;

    // 2. If backend supplied a clean detail message without raw tech traces
    if (data?.detail && typeof data.detail === 'string') {
      const d = data.detail.trim();
      const isTechnicalTrace =
        d.includes('org.hibernate') ||
        d.includes('PSQLException') ||
        d.includes('NullPointerException') ||
        d.includes('SQLException') ||
        d.includes('JDBC') ||
        d.includes('Stack trace') ||
        d.includes('Syntax error') ||
        d.includes('could not execute statement');

      if (!isTechnicalTrace) {
        return d;
      }
    }

    // 3. Status-based clinical error fallbacks
    switch (status) {
      case 400:
        return 'Invalid request details submitted. Please check the information and try again.';
      case 401:
        return 'Your clinical session has expired. Please sign in again to continue.';
      case 403:
        return 'You do not have authorization to access this clinical record or action.';
      case 404:
        return 'The requested hospital record could not be found.';
      case 409:
        return 'A scheduling conflict occurred (e.g. slot already booked). Please select an alternate slot.';
      case 422:
        return 'Validation error. Please verify the submitted form values.';
      case 429:
        return 'Too many requests. Please wait a moment before trying again.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'The hospital service encountered a temporary error. Please try again shortly.';
      default:
        return 'An unexpected error occurred while communicating with hospital services.';
    }
  }

  if (error instanceof Error) {
    if (error.message && !error.message.includes('object Object')) {
      return error.message;
    }
  }

  return 'An unexpected error occurred. Please try again.';
}
