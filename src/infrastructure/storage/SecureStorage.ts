/**
 * Secure Storage Module
 *
 * Provides encrypted storage for sensitive data using the device's
 * secure enclave (iOS Keychain / Android Keystore).
 *
 * SECURITY NOTES:
 * - All data is encrypted before storage
 * - Tokens are stored in hardware-backed keystore when available
 * - Data is wiped on uninstall (iOS) or can be configured for Android
 * - Biometric-protected items require user authentication to access
 *
 * DATA STORED:
 * - Auth tokens (access, refresh, ID tokens)
 * - Encryption keys (asymmetric and symmetric)
 * - Biometric credentials
 * - Provider tokens (per-provider FHIR access tokens)
 *
 * DATA NOT STORED:
 * - PHI (medical records) - only encrypted cache with TTL
 * - Passwords (only used transiently)
 */

import * as Keychain from 'react-native-keychain';

import { Logger } from '../../utils/logger';
import { AuthTokens, BiometricCredentials } from '../../domain/entities/AuthEntities';
import { ProviderTokens } from '../../domain/entities/Provider';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKENS: 'auth_tokens',
  REFRESH_TOKEN: 'refresh_token',
  ENCRYPTION_KEYPAIR: 'encryption_keypair',
  SYMMETRIC_KEY: 'symmetric_key',
  BIOMETRIC_CREDENTIALS: 'biometric_credentials',
  DEVICE_ID: 'device_id',
  PROVIDER_TOKENS_PREFIX: 'provider_tokens_',
} as const;

// Service name for Keychain
const SERVICE_NAME = 'com.smartfhir.app';

/**
 * Storage options
 */
interface StorageOptions {
  /** Require biometric authentication to access */
  requireBiometric?: boolean;
  /** Accessibility level (iOS only) */
  accessible?: Keychain.ACCESSIBLE;
}

/**
 * Secure Storage Service
 */
export class SecureStorage {
  /**
   * Store a value securely
   */
  async set(key: string, value: string, options?: StorageOptions): Promise<boolean> {
    try {
      const accessControl = options?.requireBiometric
        ? Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET
        : undefined;

      await Keychain.setGenericPassword(key, value, {
        service: `${SERVICE_NAME}.${key}`,
        accessible: options?.accessible ?? Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        accessControl,
      });

      Logger.debug('Secure storage: value stored', { key });
      return true;
    } catch (error) {
      Logger.error('Secure storage: failed to store value', { key, error: String(error) });
      return false;
    }
  }

  /**
   * Retrieve a value from secure storage
   */
  async get(key: string): Promise<string | null> {
    try {
      const result = await Keychain.getGenericPassword({
        service: `${SERVICE_NAME}.${key}`,
      });

      if (result && typeof result !== 'boolean') {
        return result.password;
      }

      return null;
    } catch (error) {
      Logger.error('Secure storage: failed to retrieve value', { key, error: String(error) });
      return null;
    }
  }

  /**
   * Delete a value from secure storage
   */
  async delete(key: string): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({
        service: `${SERVICE_NAME}.${key}`,
      });
      Logger.debug('Secure storage: value deleted', { key });
      return true;
    } catch (error) {
      Logger.error('Secure storage: failed to delete value', { key, error: String(error) });
      return false;
    }
  }

  /**
   * Store JSON value
   */
  async setJSON<T>(key: string, value: T, options?: StorageOptions): Promise<boolean> {
    try {
      const json = JSON.stringify(value);
      return this.set(key, json, options);
    } catch (error) {
      Logger.error('Secure storage: failed to serialize JSON', { key });
      return false;
    }
  }

  /**
   * Retrieve JSON value
   */
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const json = await this.get(key);
      if (!json) {
        return null;
      }
      return JSON.parse(json) as T;
    } catch (error) {
      Logger.error('Secure storage: failed to parse JSON', { key });
      return null;
    }
  }

  // ==========================================================================
  // AUTH TOKENS
  // ==========================================================================

  /**
   * Store authentication tokens
   */
  async storeAuthTokens(tokens: AuthTokens): Promise<boolean> {
    return this.setJSON(STORAGE_KEYS.AUTH_TOKENS, tokens);
  }

  /**
   * Get authentication tokens
   */
  async getAuthTokens(): Promise<AuthTokens | null> {
    return this.getJSON<AuthTokens>(STORAGE_KEYS.AUTH_TOKENS);
  }

  /**
   * Clear authentication tokens
   */
  async clearAuthTokens(): Promise<boolean> {
    return this.delete(STORAGE_KEYS.AUTH_TOKENS);
  }

  // ==========================================================================
  // ENCRYPTION KEYS
  // ==========================================================================

  /**
   * Store encryption key pair
   */
  async storeEncryptionKeyPair(publicKey: string, secretKey: string): Promise<boolean> {
    return this.setJSON(STORAGE_KEYS.ENCRYPTION_KEYPAIR, { publicKey, secretKey });
  }

  /**
   * Get encryption key pair
   */
  async getEncryptionKeyPair(): Promise<{ publicKey: string; secretKey: string } | null> {
    return this.getJSON(STORAGE_KEYS.ENCRYPTION_KEYPAIR);
  }

  /**
   * Store symmetric key
   */
  async storeSymmetricKey(key: string): Promise<boolean> {
    return this.set(STORAGE_KEYS.SYMMETRIC_KEY, key);
  }

  /**
   * Get symmetric key
   */
  async getSymmetricKey(): Promise<string | null> {
    return this.get(STORAGE_KEYS.SYMMETRIC_KEY);
  }

  // ==========================================================================
  // BIOMETRIC CREDENTIALS
  // ==========================================================================

  /**
   * Store biometric credentials (requires biometric to access)
   */
  async storeBiometricCredentials(credentials: BiometricCredentials): Promise<boolean> {
    return this.setJSON(STORAGE_KEYS.BIOMETRIC_CREDENTIALS, credentials, {
      requireBiometric: true,
    });
  }

  /**
   * Get biometric credentials (triggers biometric prompt)
   */
  async getBiometricCredentials(): Promise<BiometricCredentials | null> {
    return this.getJSON<BiometricCredentials>(STORAGE_KEYS.BIOMETRIC_CREDENTIALS);
  }

  /**
   * Clear biometric credentials
   */
  async clearBiometricCredentials(): Promise<boolean> {
    return this.delete(STORAGE_KEYS.BIOMETRIC_CREDENTIALS);
  }

  // ==========================================================================
  // PROVIDER TOKENS
  // ==========================================================================

  /**
   * Store provider-specific tokens
   */
  async storeProviderTokens(providerId: string, tokens: ProviderTokens): Promise<boolean> {
    const key = `${STORAGE_KEYS.PROVIDER_TOKENS_PREFIX}${providerId}`;
    return this.setJSON(key, tokens);
  }

  /**
   * Get provider-specific tokens
   */
  async getProviderTokens(providerId: string): Promise<ProviderTokens | null> {
    const key = `${STORAGE_KEYS.PROVIDER_TOKENS_PREFIX}${providerId}`;
    return this.getJSON<ProviderTokens>(key);
  }

  /**
   * Clear provider-specific tokens
   */
  async clearProviderTokens(providerId: string): Promise<boolean> {
    const key = `${STORAGE_KEYS.PROVIDER_TOKENS_PREFIX}${providerId}`;
    return this.delete(key);
  }

  // ==========================================================================
  // DEVICE ID
  // ==========================================================================

  /**
   * Get or create device ID
   */
  async getOrCreateDeviceId(): Promise<string> {
    let deviceId = await this.get(STORAGE_KEYS.DEVICE_ID);

    if (!deviceId) {
      // Generate a new device ID
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await this.set(STORAGE_KEYS.DEVICE_ID, deviceId, {
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    }

    return deviceId;
  }

  // ==========================================================================
  // CLEAR ALL
  // ==========================================================================

  /**
   * Clear all secure storage data
   *
   * Call this on logout or security events
   */
  async clearAll(): Promise<void> {
    const keys = [
      STORAGE_KEYS.AUTH_TOKENS,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.ENCRYPTION_KEYPAIR,
      STORAGE_KEYS.SYMMETRIC_KEY,
      STORAGE_KEYS.BIOMETRIC_CREDENTIALS,
      // Note: DEVICE_ID is intentionally NOT cleared
    ];

    await Promise.all(keys.map(key => this.delete(key)));
    Logger.info('Secure storage cleared');
  }

  // ==========================================================================
  // BIOMETRIC SUPPORT CHECK
  // ==========================================================================

  /**
   * Check biometric support
   */
  async getBiometryType(): Promise<Keychain.BIOMETRY_TYPE | null> {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      return biometryType;
    } catch (error) {
      Logger.error('Failed to get biometry type', { error: String(error) });
      return null;
    }
  }

  /**
   * Check if device has biometric capabilities
   */
  async hasBiometricSupport(): Promise<boolean> {
    const biometryType = await this.getBiometryType();
    return biometryType !== null;
  }
}

// Singleton instance
export const secureStorage = new SecureStorage();

export default SecureStorage;
