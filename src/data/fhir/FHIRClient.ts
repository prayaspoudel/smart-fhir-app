/**
 * FHIR Client Service
 *
 * Handles all FHIR R4 server interactions including:
 * - Patient data fetching
 * - Observations (vital signs, labs)
 * - Diagnostic reports
 * - Encounters
 * - Medication requests
 * - Consent management
 *
 * Supports multiple providers with per-provider authentication.
 */

import axios, { AxiosInstance } from 'axios';

import { Logger } from '../../utils/logger';
import { validateResource } from '../../infrastructure/validators/FHIRValidators';
import { Patient } from '../../domain/entities/Patient';
import { Observation } from '../../domain/entities/Observation';
import { DiagnosticReport } from '../../domain/entities/DiagnosticReport';
import { Encounter } from '../../domain/entities/Encounter';
import { MedicationRequest } from '../../domain/entities/MedicationRequest';
import { Consent } from '../../domain/entities/Consent';
import {
  Bundle,
  FHIRResource,
  FHIRResourceWithSource,
  SourceMetadata,
} from '../../domain/entities/FHIRTypes';
import { Provider, ProviderTokens } from '../../domain/entities/Provider';

/**
 * FHIR search parameters
 */
export interface FHIRSearchParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * FHIR Client configuration
 */
export interface FHIRClientConfig {
  baseUrl: string;
  accessToken: string;
  provider: Provider;
}

/**
 * FHIR Client for a single provider
 */
export class FHIRClient {
  private readonly client: AxiosInstance;
  private readonly provider: Provider;
  private accessToken: string;

  constructor(config: FHIRClientConfig) {
    this.provider = config.provider;
    this.accessToken = config.accessToken;

    this.client = axios.create({
      baseURL: config.baseUrl.replace(/\/$/, ''),
      headers: {
        Accept: 'application/fhir+json',
        'Content-Type': 'application/fhir+json',
      },
      timeout: 30000,
    });

    // Add auth interceptor
    this.client.interceptors.request.use(reqConfig => {
      reqConfig.headers.Authorization = `Bearer ${this.accessToken}`;
      return reqConfig;
    });

    // Add response logging
    this.client.interceptors.response.use(
      response => {
        Logger.debug('FHIR Response', {
          url: response.config.url,
          status: response.status,
        });
        return response;
      },
      error => {
        Logger.error('FHIR Error', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
        });
        throw error;
      }
    );
  }

  /**
   * Update access token (e.g., after refresh)
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Create source metadata for this provider
   */
  private createSourceMetadata(): SourceMetadata {
    return {
      providerId: this.provider.id,
      providerName: this.provider.name,
      providerIconUrl: this.provider.iconUrl,
      serverUrl: this.provider.fhirServerUrl,
      fetchedAt: new Date().toISOString(),
    };
  }

  /**
   * Wrap resource with source metadata
   */
  private wrapWithSource<T extends FHIRResource>(resource: T): FHIRResourceWithSource<T> {
    return {
      resource,
      source: this.createSourceMetadata(),
    };
  }

  /**
   * Generic search operation
   */
  async search<T extends FHIRResource>(
    resourceType: string,
    params?: FHIRSearchParams
  ): Promise<FHIRResourceWithSource<T>[]> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `/${resourceType}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await this.client.get<Bundle<T>>(url);
    const bundle = response.data;

    // Validate bundle
    const validation = validateResource(bundle);
    if (!validation.success) {
      Logger.warn('Bundle validation failed', { errors: validation.errors });
    }

    // Extract and wrap resources
    const resources: FHIRResourceWithSource<T>[] = [];

    if (bundle.entry) {
      for (const entry of bundle.entry) {
        if (entry.resource) {
          // Validate each resource
          const resourceValidation = validateResource(entry.resource);
          if (!resourceValidation.success) {
            Logger.warn('Resource validation failed', {
              resourceType: entry.resource.resourceType,
              id: entry.resource.id,
              errors: resourceValidation.errors,
            });
          }

          resources.push(this.wrapWithSource(entry.resource));
        }
      }
    }

    return resources;
  }

  /**
   * Read a single resource by ID
   */
  async read<T extends FHIRResource>(
    resourceType: string,
    id: string
  ): Promise<FHIRResourceWithSource<T>> {
    const response = await this.client.get<T>(`/${resourceType}/${id}`);

    // Validate resource
    const validation = validateResource(response.data);
    if (!validation.success) {
      Logger.warn('Resource validation failed', {
        resourceType,
        id,
        errors: validation.errors,
      });
    }

    return this.wrapWithSource(response.data);
  }

  /**
   * Create a new resource
   */
  async create<T extends FHIRResource>(
    resourceType: string,
    resource: T
  ): Promise<FHIRResourceWithSource<T>> {
    const response = await this.client.post<T>(`/${resourceType}`, resource);
    return this.wrapWithSource(response.data);
  }

  /**
   * Update an existing resource
   */
  async update<T extends FHIRResource>(
    resourceType: string,
    id: string,
    resource: T
  ): Promise<FHIRResourceWithSource<T>> {
    const response = await this.client.put<T>(`/${resourceType}/${id}`, resource);
    return this.wrapWithSource(response.data);
  }

  // ==========================================================================
  // PATIENT OPERATIONS
  // ==========================================================================

  /**
   * Get patient by ID
   */
  async getPatient(patientId: string): Promise<FHIRResourceWithSource<Patient>> {
    return this.read<Patient>('Patient', patientId);
  }

  /**
   * Search patients
   */
  async searchPatients(params?: {
    name?: string;
    identifier?: string;
    birthdate?: string;
  }): Promise<FHIRResourceWithSource<Patient>[]> {
    return this.search<Patient>('Patient', params);
  }

  // ==========================================================================
  // OBSERVATION OPERATIONS
  // ==========================================================================

  /**
   * Get observations for a patient
   */
  async getObservations(
    patientId: string,
    params?: {
      category?: string;
      code?: string;
      date?: string;
      _sort?: string;
      _count?: number;
    }
  ): Promise<FHIRResourceWithSource<Observation>[]> {
    return this.search<Observation>('Observation', {
      patient: patientId,
      ...params,
      _sort: params?._sort ?? '-date',
      _count: params?._count ?? 100,
    });
  }

  /**
   * Get vital signs for a patient
   */
  async getVitalSigns(patientId: string): Promise<FHIRResourceWithSource<Observation>[]> {
    return this.getObservations(patientId, {
      category: 'vital-signs',
    });
  }

  /**
   * Get lab results for a patient
   */
  async getLabResults(patientId: string): Promise<FHIRResourceWithSource<Observation>[]> {
    return this.getObservations(patientId, {
      category: 'laboratory',
    });
  }

  // ==========================================================================
  // DIAGNOSTIC REPORT OPERATIONS
  // ==========================================================================

  /**
   * Get diagnostic reports for a patient
   */
  async getDiagnosticReports(
    patientId: string,
    params?: {
      category?: string;
      code?: string;
      date?: string;
      status?: string;
      _sort?: string;
      _count?: number;
    }
  ): Promise<FHIRResourceWithSource<DiagnosticReport>[]> {
    return this.search<DiagnosticReport>('DiagnosticReport', {
      patient: patientId,
      ...params,
      _sort: params?._sort ?? '-date',
      _count: params?._count ?? 50,
    });
  }

  // ==========================================================================
  // ENCOUNTER OPERATIONS
  // ==========================================================================

  /**
   * Get encounters for a patient
   */
  async getEncounters(
    patientId: string,
    params?: {
      class?: string;
      status?: string;
      date?: string;
      type?: string;
      _sort?: string;
      _count?: number;
    }
  ): Promise<FHIRResourceWithSource<Encounter>[]> {
    return this.search<Encounter>('Encounter', {
      patient: patientId,
      ...params,
      _sort: params?._sort ?? '-date',
      _count: params?._count ?? 50,
    });
  }

  // ==========================================================================
  // MEDICATION REQUEST OPERATIONS
  // ==========================================================================

  /**
   * Get medication requests for a patient
   */
  async getMedicationRequests(
    patientId: string,
    params?: {
      status?: string;
      intent?: string;
      authoredon?: string;
      _sort?: string;
      _count?: number;
    }
  ): Promise<FHIRResourceWithSource<MedicationRequest>[]> {
    return this.search<MedicationRequest>('MedicationRequest', {
      patient: patientId,
      ...params,
      _sort: params?._sort ?? '-authoredon',
      _count: params?._count ?? 100,
    });
  }

  /**
   * Get active medications for a patient
   */
  async getActiveMedications(
    patientId: string
  ): Promise<FHIRResourceWithSource<MedicationRequest>[]> {
    return this.getMedicationRequests(patientId, {
      status: 'active',
    });
  }

  // ==========================================================================
  // CONSENT OPERATIONS
  // ==========================================================================

  /**
   * Get consents for a patient
   */
  async getConsents(
    patientId: string,
    params?: {
      status?: string;
      category?: string;
    }
  ): Promise<FHIRResourceWithSource<Consent>[]> {
    return this.search<Consent>('Consent', {
      patient: patientId,
      ...params,
    });
  }

  /**
   * Create a new consent
   */
  async createConsent(consent: Consent): Promise<FHIRResourceWithSource<Consent>> {
    return this.create<Consent>('Consent', consent);
  }

  /**
   * Update consent status
   */
  async updateConsentStatus(
    consentId: string,
    status: Consent['status']
  ): Promise<FHIRResourceWithSource<Consent>> {
    // First fetch the current consent
    const current = await this.read<Consent>('Consent', consentId);

    // Update status
    const updated: Consent = {
      ...current.resource,
      status,
    };

    return this.update<Consent>('Consent', consentId, updated);
  }

  // ==========================================================================
  // CAPABILITY STATEMENT
  // ==========================================================================

  /**
   * Get server capability statement (metadata)
   */
  async getCapabilityStatement(): Promise<FHIRResource> {
    const response = await this.client.get('/metadata');
    return response.data;
  }
}

/**
 * FHIR Client Manager
 *
 * Manages multiple FHIR clients for multi-provider support
 */
export class FHIRClientManager {
  private clients: Map<string, FHIRClient> = new Map();

  /**
   * Get or create a FHIR client for a provider
   */
  getClient(provider: Provider, tokens: ProviderTokens): FHIRClient {
    let client = this.clients.get(provider.id);

    if (!client) {
      client = new FHIRClient({
        baseUrl: provider.fhirServerUrl,
        accessToken: tokens.accessToken,
        provider,
      });
      this.clients.set(provider.id, client);
    } else {
      // Update token in case it changed
      client.setAccessToken(tokens.accessToken);
    }

    return client;
  }

  /**
   * Remove a client (e.g., on disconnect)
   */
  removeClient(providerId: string): void {
    this.clients.delete(providerId);
  }

  /**
   * Clear all clients
   */
  clearAll(): void {
    this.clients.clear();
  }

  /**
   * Get all client IDs
   */
  getClientIds(): string[] {
    return Array.from(this.clients.keys());
  }
}

// Singleton instance
export const fhirClientManager = new FHIRClientManager();

export default FHIRClient;
