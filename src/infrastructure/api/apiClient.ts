/**
 * API Client Configuration
 *
 * Axios instance with interceptors for authentication, error handling,
 * and PHI redaction in logs.
 *
 * SECURITY NOTES:
 * - All requests use HTTPS (TLS 1.2+)
 * - Access tokens are attached via Authorization header
 * - Sensitive data is redacted from logs
 * - Request/response interceptors handle token refresh
 *
 * TLS PINNING:
 * For production, consider implementing certificate pinning using
 * react-native-ssl-pinning or similar. This adds defense against MITM
 * attacks but requires certificate management overhead.
 *
 * Trade-offs:
 * - Pros: Prevents MITM attacks even with compromised CA
 * - Cons: Requires app update when certificates rotate
 * - Recommendation: Use public key pinning with backup keys
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

import { Logger } from '../../utils/logger';
import { Config } from '../../utils/config';

// Create axios instance with base configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: Config.BACKEND_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Log request (with PHI redaction)
      Logger.debug('API Request', {
        method: config.method?.toUpperCase(),
        url: config.url,
        // Don't log request body as it may contain PHI
      });

      // Add auth token if available
      const token = await getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request ID for tracing
      config.headers['X-Request-ID'] = generateRequestId();

      return config;
    },
    (error: AxiosError) => {
      Logger.error('API Request Error', { message: error.message });
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response (without body to avoid PHI exposure)
      Logger.debug('API Response', {
        status: response.status,
        url: response.config.url,
      });

      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Handle 401 Unauthorized - attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await refreshAccessToken();
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          // Token refresh failed - force logout
          await handleAuthFailure();
          return Promise.reject(refreshError);
        }
      }

      // Log error (without sensitive details)
      Logger.error('API Response Error', {
        status: error.response?.status,
        url: error.config?.url,
        message: getErrorMessage(error),
      });

      return Promise.reject(error);
    }
  );

  return client;
};

/**
 * Get access token from secure storage
 * This is a placeholder - actual implementation in SecureStore
 */
let tokenGetter: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (getter: () => Promise<string | null>): void => {
  tokenGetter = getter;
};

const getAccessToken = async (): Promise<string | null> => {
  if (tokenGetter) {
    return tokenGetter();
  }
  return null;
};

/**
 * Refresh access token
 * This is a placeholder - actual implementation in AuthService
 */
let tokenRefresher: (() => Promise<string | null>) | null = null;

export const setTokenRefresher = (refresher: () => Promise<string | null>): void => {
  tokenRefresher = refresher;
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (tokenRefresher) {
    return tokenRefresher();
  }
  return null;
};

/**
 * Handle authentication failure
 */
let authFailureHandler: (() => Promise<void>) | null = null;

export const setAuthFailureHandler = (handler: () => Promise<void>): void => {
  authFailureHandler = handler;
};

const handleAuthFailure = async (): Promise<void> => {
  if (authFailureHandler) {
    await authFailureHandler();
  }
};

/**
 * Generate unique request ID for tracing
 */
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Extract error message safely (without PHI)
 */
const getErrorMessage = (error: AxiosError): string => {
  if (error.response?.data) {
    const data = error.response.data as { message?: string; error?: string };
    // Only return generic error messages, not detailed ones that might contain PHI
    if (data.message && !containsPHI(data.message)) {
      return data.message;
    }
    if (data.error && !containsPHI(data.error)) {
      return data.error;
    }
  }
  return error.message || 'Unknown error';
};

/**
 * Basic PHI detection (should be more comprehensive in production)
 */
const containsPHI = (text: string): boolean => {
  // Check for common PHI patterns
  const phiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b\d{9}\b/, // MRN-like numbers
    /\b[A-Za-z]+\s+[A-Za-z]+\b.*\b(patient|record|medical)\b/i, // Names with medical context
  ];

  return phiPatterns.some(pattern => pattern.test(text));
};

// Export configured client
export const apiClient = createApiClient();

// Export typed request methods
export const api = {
  get: <T>(url: string, config?: object) => apiClient.get<T>(url, config).then(res => res.data),

  post: <T>(url: string, data?: object, config?: object) =>
    apiClient.post<T>(url, data, config).then(res => res.data),

  put: <T>(url: string, data?: object, config?: object) =>
    apiClient.put<T>(url, data, config).then(res => res.data),

  patch: <T>(url: string, data?: object, config?: object) =>
    apiClient.patch<T>(url, data, config).then(res => res.data),

  delete: <T>(url: string, config?: object) =>
    apiClient.delete<T>(url, config).then(res => res.data),
};

export default apiClient;
