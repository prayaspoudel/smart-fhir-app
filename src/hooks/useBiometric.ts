/**
 * useBiometric Hook
 *
 * Custom hook for biometric authentication.
 */

import { useState, useCallback, useEffect } from 'react';
import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';
import { logger } from '../utils/logger';

interface BiometricCapabilities {
  isAvailable: boolean;
  biometryType: 'TouchID' | 'FaceID' | 'Fingerprint' | null;
  isEnrolled: boolean;
}

interface UseBiometricReturn {
  capabilities: BiometricCapabilities;
  isAuthenticating: boolean;
  error: string | null;
  authenticate: (reason?: string) => Promise<boolean>;
  checkCapabilities: () => Promise<BiometricCapabilities>;
}

export const useBiometric = (): UseBiometricReturn => {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities>({
    isAvailable: false,
    biometryType: null,
    isEnrolled: false,
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCapabilities = useCallback(async (): Promise<BiometricCapabilities> => {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();

      let type: BiometricCapabilities['biometryType'] = null;

      if (biometryType === Keychain.BIOMETRY_TYPE.TOUCH_ID) {
        type = 'TouchID';
      } else if (biometryType === Keychain.BIOMETRY_TYPE.FACE_ID) {
        type = 'FaceID';
      } else if (biometryType === Keychain.BIOMETRY_TYPE.FINGERPRINT) {
        type = 'Fingerprint';
      }

      const caps: BiometricCapabilities = {
        isAvailable: !!biometryType,
        biometryType: type,
        isEnrolled: !!biometryType,
      };

      setCapabilities(caps);
      return caps;
    } catch (err) {
      logger.error('Failed to check biometric capabilities', { error: err });
      return {
        isAvailable: false,
        biometryType: null,
        isEnrolled: false,
      };
    }
  }, []);

  const authenticate = useCallback(async (reason?: string): Promise<boolean> => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const defaultReason = Platform.select({
        ios: 'Authenticate to access your health records',
        android: 'Authenticate to access your health records',
        default: 'Authentication required',
      });

      // Try to get credentials with biometric protection
      const credentials = await Keychain.getGenericPassword({
        authenticationPrompt: {
          title: 'Authentication Required',
          subtitle: reason || defaultReason,
          cancel: 'Cancel',
        },
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
      });

      if (credentials) {
        logger.info('Biometric authentication successful');
        return true;
      }

      // If no credentials stored, try to authenticate without retrieving
      // This happens on first-time setup
      const hasBiometricSupport = await Keychain.getSupportedBiometryType();

      if (hasBiometricSupport) {
        // Store a dummy credential to enable biometric auth for next time
        await Keychain.setGenericPassword('biometric_user', 'biometric_enabled', {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
          accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
        });

        logger.info('Biometric authentication set up');
        return true;
      }

      setError('Biometric authentication not available');
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Biometric authentication failed';
      setError(message);
      logger.error('Biometric authentication failed', { error: err });
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  useEffect(() => {
    checkCapabilities();
  }, [checkCapabilities]);

  return {
    capabilities,
    isAuthenticating,
    error,
    authenticate,
    checkCapabilities,
  };
};

export default useBiometric;
