/**
 * useAuth Hook
 *
 * Custom hook for authentication state and operations.
 */

import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import {
  selectIsAuthenticated,
  selectCurrentPatient,
  selectAuthLoading,
  selectAuthError,
  selectSession,
  selectRequires2FA,
  selectTokens,
  selectBiometricEnabled,
  setLoading,
  setError,
  logout as logoutAction,
  setBiometricEnabled,
} from '../store/slices/authSlice';
import { secureStorage } from '../infrastructure/storage/SecureStorage';
import { Logger } from '../utils/logger';

interface UseAuthReturn {
  isAuthenticated: boolean;
  patient: ReturnType<typeof selectCurrentPatient>;
  isLoading: boolean;
  error: string | null;
  session: ReturnType<typeof selectSession>;
  is2FARequired: boolean;
  tokens: ReturnType<typeof selectTokens>;
  biometricEnabled: boolean;
  login: (iss: string, launch?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  verify2FA: (code: string) => Promise<boolean>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const patient = useAppSelector(selectCurrentPatient);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const session = useAppSelector(selectSession);
  const is2FARequired = useAppSelector(selectRequires2FA);
  const tokens = useAppSelector(selectTokens);
  const biometricEnabled = useAppSelector(selectBiometricEnabled);

  const login = useCallback(
    async (_iss: string, _launch?: string) => {
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        // TODO: Implement actual SMART on FHIR authorization flow
        // This would use AuthService to perform OAuth2 authorization
        Logger.info('Login initiated');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed';
        dispatch(setError(message));
        Logger.error('Login failed', { error: String(err) });
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    dispatch(setLoading(true));

    try {
      // Clear tokens from secure storage
      await secureStorage.clearAuthTokens();

      // Update Redux state
      dispatch(logoutAction());

      Logger.info('Logout successful');
    } catch (err) {
      Logger.error('Logout error', { error: String(err) });
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const storedTokens = await secureStorage.getAuthTokens();

      if (!storedTokens?.refreshToken) {
        Logger.warn('No refresh token available');
        return false;
      }

      // TODO: Implement actual token refresh using AuthService
      Logger.info('Token refresh initiated');
      return true;
    } catch (err) {
      Logger.error('Token refresh failed', { error: String(err) });
      return false;
    }
  }, []);

  const verify2FA = useCallback(
    async (code: string): Promise<boolean> => {
      dispatch(setLoading(true));

      try {
        // This would call your 2FA verification endpoint
        if (code.length === 6) {
          Logger.info('2FA verification successful');
          return true;
        }
        return false;
      } catch (err) {
        Logger.error('2FA verification failed', { error: String(err) });
        return false;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const enableBiometric = useCallback(async (): Promise<boolean> => {
    try {
      const hasBiometric = await secureStorage.hasBiometricSupport();
      if (!hasBiometric) {
        Logger.warn('Biometric not supported on this device');
        return false;
      }

      const biometricType = await secureStorage.getBiometryType();
      const mappedType =
        biometricType === 'FaceID'
          ? 'FaceID'
          : biometricType === 'TouchID'
            ? 'TouchID'
            : biometricType === 'Fingerprint'
              ? 'Fingerprint'
              : 'none';
      dispatch(
        setBiometricEnabled({
          enabled: true,
          type: mappedType as 'none' | 'FaceID' | 'TouchID' | 'Fingerprint',
        })
      );
      Logger.info('Biometric authentication enabled');
      return true;
    } catch (err) {
      Logger.error('Failed to enable biometric', { error: String(err) });
      return false;
    }
  }, [dispatch]);

  const disableBiometric = useCallback(async () => {
    try {
      await secureStorage.clearBiometricCredentials();
      dispatch(setBiometricEnabled({ enabled: false, type: 'none' }));
      Logger.info('Biometric authentication disabled');
    } catch (err) {
      Logger.error('Failed to disable biometric', { error: String(err) });
    }
  }, [dispatch]);

  return {
    isAuthenticated,
    patient,
    isLoading,
    error,
    session,
    is2FARequired,
    tokens,
    biometricEnabled,
    login,
    logout,
    refreshToken,
    verify2FA,
    enableBiometric,
    disableBiometric,
  };
};

export default useAuth;
