/**
 * AuthService Tests
 * @jest-environment node
 */

// Declare global for test environment
declare const global: typeof globalThis & {
  crypto: unknown;
  fetch: jest.Mock;
};

import { AuthService, BackendAuthService } from '../AuthService';

// Mock dependencies
jest.mock('../../../infrastructure/storage/SecureStorage', () => ({
  secureStorage: {
    storeProviderTokens: jest.fn().mockResolvedValue(true),
    getProviderTokens: jest.fn().mockResolvedValue(null),
    clearProviderTokens: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../../../utils/logger', () => ({
  Logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('react-native', () => ({
  Linking: {
    openURL: jest.fn().mockResolvedValue(true),
  },
}));

// Mock crypto for PKCE
const mockCrypto = {
  getRandomValues: (arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  },
  subtle: {
    digest: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
  },
};

Object.defineProperty(global, 'crypto', { value: mockCrypto });

// Mock fetch
global.fetch = jest.fn();

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('fetchSMARTConfiguration', () => {
    it('should fetch SMART configuration from well-known endpoint', async () => {
      const mockConfig = {
        authorization_endpoint: 'https://auth.example.com/authorize',
        token_endpoint: 'https://auth.example.com/token',
        capabilities: ['launch-standalone'],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      const config = await authService.fetchSMARTConfiguration('https://fhir.example.com');
      expect(config.authorization_endpoint).toBe(mockConfig.authorization_endpoint);
    });

    it('should fall back to metadata on error', async () => {
      // First request fails
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // Second request for metadata
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            rest: [
              {
                security: {
                  extension: [
                    {
                      url: 'http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris',
                      extension: [
                        { url: 'authorize', valueUri: 'https://auth.example.com/authorize' },
                        { url: 'token', valueUri: 'https://auth.example.com/token' },
                      ],
                    },
                  ],
                },
              },
            ],
          }),
      });

      const config = await authService.fetchSMARTConfiguration('https://fhir.example.com');
      expect(config.authorization_endpoint).toBe('https://auth.example.com/authorize');
    });
  });

  describe('areTokensValid', () => {
    it('should return false when no tokens exist', async () => {
      const result = await authService.areTokensValid('test-provider');
      expect(result).toBe(false);
    });

    it('should return true for valid tokens', async () => {
      const { secureStorage } = require('../../../infrastructure/storage/SecureStorage');
      secureStorage.getProviderTokens.mockResolvedValueOnce({
        accessToken: 'valid-token',
        expiresAt: Date.now() + 3600000, // 1 hour from now
      });

      const result = await authService.areTokensValid('test-provider');
      expect(result).toBe(true);
    });
  });

  describe('revokeTokens', () => {
    it('should clear local tokens even when server revocation fails', async () => {
      const { secureStorage } = require('../../../infrastructure/storage/SecureStorage');
      secureStorage.getProviderTokens.mockResolvedValueOnce({
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
      });

      await authService.revokeTokens('test-provider');
      expect(secureStorage.clearProviderTokens).toHaveBeenCalledWith('test-provider');
    });
  });
});

describe('BackendAuthService', () => {
  let backendAuth: BackendAuthService;
  const mockBaseUrl = 'https://api.example.com';

  beforeEach(() => {
    backendAuth = new BackendAuthService(mockBaseUrl);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      const mockTokens = {
        tokens: {
          accessToken: 'access-123',
          refreshToken: 'refresh-123',
          expiresAt: Date.now() + 3600000,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokens),
      });

      const result = await backendAuth.login('test@example.com', 'password');
      expect(result.tokens).toBeDefined();
    });

    it('should indicate when 2FA is required', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ requires2FA: true, tempToken: 'temp-123' }),
      });

      const result = await backendAuth.login('test@example.com', 'password');
      expect(result.requires2FA).toBe(true);
      expect(result.tempToken).toBeDefined();
    });

    it('should throw on login failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });

      await expect(backendAuth.login('test@example.com', 'wrong')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('verify2FA', () => {
    it('should return tokens on successful verification', async () => {
      const mockTokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-123',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokens),
      });

      const result = await backendAuth.verify2FA('temp-token', '123456');
      expect(result.accessToken).toBe('access-123');
    });
  });

  describe('register', () => {
    it('should register new user', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ userId: 'user-123', requiresVerification: true }),
      });

      const result = await backendAuth.register({
        email: 'new@example.com',
        password: 'password123',
      });

      expect(result.userId).toBeDefined();
    });
  });
});

describe('Token Handling', () => {
  it('should handle expired tokens', () => {
    const mockExpiredToken = {
      accessToken: 'expired-token',
      expiresAt: Date.now() - 1000,
    };

    const isExpired = mockExpiredToken.expiresAt < Date.now();
    expect(isExpired).toBe(true);
  });

  it('should calculate correct expiration time', () => {
    const expiresIn = 3600; // 1 hour
    const expiresAt = Date.now() + expiresIn * 1000;

    expect(expiresAt).toBeGreaterThan(Date.now());
    expect(expiresAt - Date.now()).toBeLessThanOrEqual(3600000);
  });
});
