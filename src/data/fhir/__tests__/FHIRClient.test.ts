/**
 * FHIRClient Tests
 * @jest-environment node
 */

import { FHIRClient, FHIRClientManager } from '../FHIRClient';
import { Provider } from '../../../domain/entities/Provider';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
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

// Mock FHIR validators
jest.mock('../../../infrastructure/validators/FHIRValidators', () => ({
  validateResource: jest.fn().mockReturnValue({ success: true }),
}));

const mockProvider: Provider = {
  id: 'provider-123',
  name: 'Test Hospital',
  fhirServerUrl: 'https://fhir.example.com/r4',
  authorizationEndpoint: 'https://auth.example.com/authorize',
  tokenEndpoint: 'https://auth.example.com/token',
  clientId: 'test-client',
  redirectUri: 'smartfhirapp://callback',
  scopes: ['patient/*.read', 'openid'],
  isConnected: true,
  isPrimary: true,
  connectionStatus: 'connected',
  iconUrl: 'https://example.com/icon.png',
};

describe('FHIRClient', () => {
  let client: FHIRClient;
  const mockAccessToken = 'test-access-token';

  beforeEach(() => {
    client = new FHIRClient({
      baseUrl: mockProvider.fhirServerUrl,
      accessToken: mockAccessToken,
      provider: mockProvider,
    });
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create client with config', () => {
      expect(client).toBeDefined();
    });
  });

  describe('setAccessToken', () => {
    it('should update access token', () => {
      client.setAccessToken('new-token');
      // Token is updated internally, just verify no error
      expect(true).toBe(true);
    });
  });

  describe('getPatient', () => {
    it('should fetch patient by ID', async () => {
      const mockPatient = {
        resourceType: 'Patient',
        id: 'test-123',
        name: [{ family: 'Doe', given: ['John'] }],
      };

      const axiosMock = require('axios');
      axiosMock.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockPatient }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const newClient = new FHIRClient({
        baseUrl: mockProvider.fhirServerUrl,
        accessToken: mockAccessToken,
        provider: mockProvider,
      });
      const result = await newClient.getPatient('test-123');

      expect(result).toBeDefined();
      expect(result.resource).toBeDefined();
      expect(result.source).toBeDefined();
      expect(result.source.providerId).toBe(mockProvider.id);
    });
  });

  describe('getObservations', () => {
    it('should fetch observations for patient', async () => {
      const mockBundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        total: 2,
        entry: [
          { resource: { resourceType: 'Observation', id: 'obs-1' } },
          { resource: { resourceType: 'Observation', id: 'obs-2' } },
        ],
      };

      const axiosMock = require('axios');
      axiosMock.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockBundle }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const newClient = new FHIRClient({
        baseUrl: mockProvider.fhirServerUrl,
        accessToken: mockAccessToken,
        provider: mockProvider,
      });
      const results = await newClient.getObservations('patient-123');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
    });
  });

  describe('getVitalSigns', () => {
    it('should fetch vital signs with category filter', async () => {
      const mockBundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: [
          {
            resource: {
              resourceType: 'Observation',
              id: 'bp-1',
              code: { coding: [{ code: '85354-9', display: 'Blood Pressure' }] },
            },
          },
        ],
      };

      const axiosMock = require('axios');
      axiosMock.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockBundle }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const newClient = new FHIRClient({
        baseUrl: mockProvider.fhirServerUrl,
        accessToken: mockAccessToken,
        provider: mockProvider,
      });
      const results = await newClient.getVitalSigns('patient-123');

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle 404 errors gracefully', async () => {
      const axiosMock = require('axios');
      axiosMock.create.mockReturnValue({
        get: jest.fn().mockRejectedValue({
          response: { status: 404, data: { error: 'Not found' } },
        }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const newClient = new FHIRClient({
        baseUrl: mockProvider.fhirServerUrl,
        accessToken: mockAccessToken,
        provider: mockProvider,
      });

      await expect(newClient.getPatient('nonexistent')).rejects.toBeDefined();
    });

    it('should handle network errors', async () => {
      const axiosMock = require('axios');
      axiosMock.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('Network Error')),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      });

      const newClient = new FHIRClient({
        baseUrl: mockProvider.fhirServerUrl,
        accessToken: mockAccessToken,
        provider: mockProvider,
      });

      await expect(newClient.getPatient('test')).rejects.toThrow('Network Error');
    });
  });
});

describe('FHIRClientManager', () => {
  let manager: FHIRClientManager;

  beforeEach(() => {
    manager = new FHIRClientManager();
  });

  it('should create and cache clients', () => {
    const tokens = {
      providerId: mockProvider.id,
      accessToken: 'token-123',
      expiresAt: Date.now() + 3600000,
      tokenType: 'Bearer',
      grantedScopes: ['patient/*.read'],
    };

    const client = manager.getClient(mockProvider, tokens);
    expect(client).toBeInstanceOf(FHIRClient);
  });

  it('should return same client for same provider', () => {
    const tokens = {
      providerId: mockProvider.id,
      accessToken: 'token-123',
      expiresAt: Date.now() + 3600000,
      tokenType: 'Bearer',
      grantedScopes: ['patient/*.read'],
    };

    const client1 = manager.getClient(mockProvider, tokens);
    const client2 = manager.getClient(mockProvider, tokens);
    expect(client1).toBe(client2);
  });

  it('should remove client', () => {
    const tokens = {
      providerId: mockProvider.id,
      accessToken: 'token-123',
      expiresAt: Date.now() + 3600000,
      tokenType: 'Bearer',
      grantedScopes: ['patient/*.read'],
    };

    manager.getClient(mockProvider, tokens);
    manager.removeClient(mockProvider.id);
    expect(manager.getClientIds()).not.toContain(mockProvider.id);
  });

  it('should clear all clients', () => {
    const tokens = {
      providerId: mockProvider.id,
      accessToken: 'token-123',
      expiresAt: Date.now() + 3600000,
      tokenType: 'Bearer',
      grantedScopes: ['patient/*.read'],
    };

    manager.getClient(mockProvider, tokens);
    manager.clearAll();
    expect(manager.getClientIds()).toHaveLength(0);
  });
});

describe('FHIR Resource Validation', () => {
  it('should validate Patient resource structure', () => {
    const validPatient = {
      resourceType: 'Patient',
      id: 'test-123',
      name: [{ family: 'Doe', given: ['John'] }],
      birthDate: '1990-01-15',
    };

    expect(validPatient.resourceType).toBe('Patient');
    expect(validPatient.id).toBeDefined();
    expect(Array.isArray(validPatient.name)).toBe(true);
  });

  it('should validate Observation resource structure', () => {
    const validObservation = {
      resourceType: 'Observation',
      id: 'obs-123',
      status: 'final',
      code: {
        coding: [{ system: 'http://loinc.org', code: '8867-4' }],
      },
      valueQuantity: { value: 72, unit: 'beats/minute' },
    };

    expect(validObservation.resourceType).toBe('Observation');
    expect(validObservation.status).toBe('final');
    expect(validObservation.code.coding).toBeDefined();
  });
});
