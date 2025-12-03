/**
 * SecureStorage Tests
 * @jest-environment node
 */

import { SecureStorage } from '../SecureStorage';

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn().mockResolvedValue(true),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
  getSupportedBiometryType: jest.fn().mockResolvedValue('FaceID'),
  ACCESSIBLE: {
    WHEN_UNLOCKED: 'WHEN_UNLOCKED',
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
    AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY',
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 'WHEN_PASSCODE_SET_THIS_DEVICE_ONLY',
    ALWAYS_THIS_DEVICE_ONLY: 'ALWAYS_THIS_DEVICE_ONLY',
  },
  ACCESS_CONTROL: {
    BIOMETRY_CURRENT_SET: 'BIOMETRY_CURRENT_SET',
  },
  SECURITY_LEVEL: {
    ANY: 'ANY',
    SECURE_SOFTWARE: 'SECURE_SOFTWARE',
    SECURE_HARDWARE: 'SECURE_HARDWARE',
  },
  BIOMETRY_TYPE: {
    FACE_ID: 'FaceID',
    TOUCH_ID: 'TouchID',
  },
}));

// Mock logger
jest.mock('../../../utils/logger', () => ({
  Logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('SecureStorage', () => {
  let storage: SecureStorage;

  beforeEach(() => {
    storage = new SecureStorage();
    jest.clearAllMocks();
  });

  describe('set', () => {
    it('should store string value securely', async () => {
      const Keychain = require('react-native-keychain');
      Keychain.setGenericPassword.mockResolvedValue(true);

      const result = await storage.set('test-key', 'test-value');

      expect(Keychain.setGenericPassword).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle storage with options', async () => {
      const Keychain = require('react-native-keychain');
      Keychain.setGenericPassword.mockResolvedValue(true);

      const result = await storage.set('test-key', 'test-value', {
        requireBiometric: true,
      });

      expect(Keychain.setGenericPassword).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false on failure', async () => {
      const Keychain = require('react-native-keychain');
      Keychain.setGenericPassword.mockRejectedValue(new Error('Keychain error'));

      const result = await storage.set('test-key', 'test-value');

      expect(result).toBe(false);
    });
  });

  describe('get', () => {
    it('should retrieve stored value', async () => {
      const Keychain = require('react-native-keychain');
      Keychain.getGenericPassword.mockResolvedValue({
        username: 'test-key',
        password: 'test-value',
      });

      const result = await storage.get('test-key');

      expect(result).toBe('test-value');
    });

    it('should return null for non-existent key', async () => {
      const Keychain = require('react-native-keychain');
      Keychain.getGenericPassword.mockResolvedValue(false);

      const result = await storage.get('non-existent');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const Keychain = require('react-native-keychain');
      Keychain.getGenericPassword.mockRejectedValue(new Error('Keychain error'));

      const result = await storage.get('test-key');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should remove value from storage', async () => {
      const Keychain = require('react-native-keychain');
      Keychain.resetGenericPassword.mockResolvedValue(true);

      const result = await storage.delete('test-key');

      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('setJSON and getJSON', () => {
    it('should store and retrieve JSON values', async () => {
      const Keychain = require('react-native-keychain');
      const testObject = { name: 'John', age: 30 };

      Keychain.setGenericPassword.mockResolvedValue(true);
      await storage.setJSON('test-key', testObject);

      const storedJson = JSON.stringify(testObject);
      Keychain.getGenericPassword.mockResolvedValue({
        username: 'test-key',
        password: storedJson,
      });

      const result = await storage.getJSON<typeof testObject>('test-key');
      expect(result).toEqual(testObject);
    });

    it('should return null for invalid JSON', async () => {
      const Keychain = require('react-native-keychain');
      Keychain.getGenericPassword.mockResolvedValue({
        username: 'test-key',
        password: 'invalid-json{{{',
      });

      const result = await storage.getJSON('test-key');
      expect(result).toBeNull();
    });
  });

  describe('Auth Tokens', () => {
    it('should store and retrieve auth tokens', async () => {
      const Keychain = require('react-native-keychain');
      const tokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-123',
        accessTokenExpiresAt: Date.now() + 3600000,
        refreshTokenExpiresAt: Date.now() + 86400000,
        tokenType: 'Bearer',
      };

      Keychain.setGenericPassword.mockResolvedValue(true);
      const stored = await storage.storeAuthTokens(tokens);
      expect(stored).toBe(true);
    });

    it('should clear auth tokens', async () => {
      const Keychain = require('react-native-keychain');
      Keychain.resetGenericPassword.mockResolvedValue(true);

      const result = await storage.clearAuthTokens();
      expect(result).toBe(true);
    });
  });

  describe('Provider Tokens', () => {
    it('should store provider-specific tokens', async () => {
      const Keychain = require('react-native-keychain');
      Keychain.setGenericPassword.mockResolvedValue(true);

      const tokens = {
        providerId: 'provider-123',
        accessToken: 'access-token',
        expiresAt: Date.now() + 3600000,
        tokenType: 'Bearer',
        grantedScopes: ['patient/*.read'],
      };

      const result = await storage.storeProviderTokens('provider-123', tokens);
      expect(result).toBe(true);
    });
  });

  describe('Biometric Support', () => {
    it('should check biometric support', async () => {
      const result = await storage.hasBiometricSupport();
      expect(result).toBe(true);
    });

    it('should get biometry type', async () => {
      const result = await storage.getBiometryType();
      expect(result).toBe('FaceID');
    });
  });

  describe('Device ID', () => {
    it('should create device ID if not exists', async () => {
      const Keychain = require('react-native-keychain');
      Keychain.getGenericPassword.mockResolvedValue(false);
      Keychain.setGenericPassword.mockResolvedValue(true);

      const deviceId = await storage.getOrCreateDeviceId();
      expect(deviceId).toContain('device_');
    });

    it('should return existing device ID', async () => {
      const Keychain = require('react-native-keychain');
      Keychain.getGenericPassword.mockResolvedValue({
        username: 'device_id',
        password: 'existing-device-id',
      });

      const deviceId = await storage.getOrCreateDeviceId();
      expect(deviceId).toBe('existing-device-id');
    });
  });
});
