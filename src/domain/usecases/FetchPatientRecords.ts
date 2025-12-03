/**
 * FetchPatientRecords Use Case
 *
 * Orchestrates fetching medical records from FHIR servers with proper
 * consent checking, encryption, and multi-provider support.
 */

import { Patient } from '../entities/Patient';
import { Observation } from '../entities/Observation';
import { DiagnosticReport } from '../entities/DiagnosticReport';
import { Encounter } from '../entities/Encounter';
import { MedicationRequest } from '../entities/MedicationRequest';
import { FHIRResourceWithSource, SourceMetadata } from '../entities/FHIRTypes';

/**
 * Repository interface for FHIR data access
 * This follows the Repository pattern - the use case depends on an abstraction
 */
export interface FHIRRepository {
  /** Fetch patient by ID */
  getPatient(patientId: string, providerId: string): Promise<FHIRResourceWithSource<Patient>>;

  /** Search for patients */
  searchPatients(query: string, providerId: string): Promise<FHIRResourceWithSource<Patient>[]>;

  /** Fetch observations for a patient */
  getObservations(
    patientId: string,
    providerId: string,
    category?: string
  ): Promise<FHIRResourceWithSource<Observation>[]>;

  /** Fetch diagnostic reports for a patient */
  getDiagnosticReports(
    patientId: string,
    providerId: string
  ): Promise<FHIRResourceWithSource<DiagnosticReport>[]>;

  /** Fetch encounters for a patient */
  getEncounters(
    patientId: string,
    providerId: string
  ): Promise<FHIRResourceWithSource<Encounter>[]>;

  /** Fetch medication requests for a patient */
  getMedicationRequests(
    patientId: string,
    providerId: string
  ): Promise<FHIRResourceWithSource<MedicationRequest>[]>;
}

/**
 * Consent repository interface
 */
export interface ConsentRepository {
  /** Check if consent exists for a provider */
  hasConsent(providerId: string, patientId: string): Promise<boolean>;

  /** Get pending consent requests */
  getPendingConsents(): Promise<PendingConsent[]>;
}

export interface PendingConsent {
  providerId: string;
  providerName: string;
  requestedScopes: string[];
  requestedAt: string;
}

/**
 * Provider repository interface
 */
export interface ProviderRepository {
  /** Get all connected providers */
  getConnectedProviders(): Promise<ConnectedProvider[]>;

  /** Get provider by ID */
  getProvider(providerId: string): Promise<ConnectedProvider | null>;
}

export interface ConnectedProvider {
  id: string;
  name: string;
  iconUrl?: string;
  patientId: string;
  isConnected: boolean;
}

/**
 * Input for fetching patient records
 */
export interface FetchPatientRecordsInput {
  /** Specific provider ID (if null, fetch from all connected providers) */
  providerId?: string;

  /** Categories to fetch */
  categories: RecordCategory[];

  /** Date range filter */
  dateRange?: {
    start: Date;
    end: Date;
  };

  /** Force refresh (bypass cache) */
  forceRefresh?: boolean;
}

export type RecordCategory = 'vitals' | 'labs' | 'medications' | 'encounters' | 'all';

/**
 * Output of fetching patient records
 */
export interface FetchPatientRecordsOutput {
  /** Patient information from each provider */
  patients: FHIRResourceWithSource<Patient>[];

  /** Vital signs observations */
  vitals: FHIRResourceWithSource<Observation>[];

  /** Lab results */
  labs: FHIRResourceWithSource<DiagnosticReport>[];

  /** Medications */
  medications: FHIRResourceWithSource<MedicationRequest>[];

  /** Encounters */
  encounters: FHIRResourceWithSource<Encounter>[];

  /** Providers that require consent before fetching */
  requiresConsent: string[];

  /** Errors encountered per provider */
  errors: ProviderError[];

  /** Fetch metadata */
  metadata: {
    fetchedAt: string;
    totalRecords: number;
    providerCount: number;
  };
}

export interface ProviderError {
  providerId: string;
  providerName: string;
  error: string;
  code: string;
}

/**
 * FetchPatientRecords Use Case
 *
 * This use case handles the business logic for fetching patient records
 * from one or more FHIR providers, including consent checking and
 * merging results from multiple sources.
 */
export class FetchPatientRecordsUseCase {
  constructor(
    private readonly fhirRepository: FHIRRepository,
    private readonly consentRepository: ConsentRepository,
    private readonly providerRepository: ProviderRepository
  ) {}

  /**
   * Execute the use case
   */
  async execute(input: FetchPatientRecordsInput): Promise<FetchPatientRecordsOutput> {
    const output: FetchPatientRecordsOutput = {
      patients: [],
      vitals: [],
      labs: [],
      medications: [],
      encounters: [],
      requiresConsent: [],
      errors: [],
      metadata: {
        fetchedAt: new Date().toISOString(),
        totalRecords: 0,
        providerCount: 0,
      },
    };

    // Get providers to fetch from
    const providers = input.providerId
      ? [await this.providerRepository.getProvider(input.providerId)].filter(Boolean)
      : await this.providerRepository.getConnectedProviders();

    if (providers.length === 0) {
      return output;
    }

    output.metadata.providerCount = providers.length;

    // Fetch from each provider
    const fetchPromises = providers.map(async provider => {
      if (!provider) {
        return;
      }

      try {
        // Check consent
        const hasConsent = await this.consentRepository.hasConsent(provider.id, provider.patientId);

        if (!hasConsent) {
          output.requiresConsent.push(provider.id);
          return;
        }

        // Fetch data based on requested categories
        await this.fetchFromProvider(provider, input.categories, output);
      } catch (error) {
        output.errors.push({
          providerId: provider.id,
          providerName: provider.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          code: 'FETCH_ERROR',
        });
      }
    });

    await Promise.all(fetchPromises);

    // Calculate total records
    output.metadata.totalRecords =
      output.vitals.length +
      output.labs.length +
      output.medications.length +
      output.encounters.length;

    // Sort results by date (most recent first)
    this.sortResults(output);

    return output;
  }

  /**
   * Fetch data from a single provider
   */
  private async fetchFromProvider(
    provider: ConnectedProvider,
    categories: RecordCategory[],
    output: FetchPatientRecordsOutput
  ): Promise<void> {
    const shouldFetch = (cat: RecordCategory) =>
      categories.includes('all') || categories.includes(cat);

    // Fetch patient first
    const patient = await this.fhirRepository.getPatient(provider.patientId, provider.id);
    output.patients.push(patient);

    // Fetch requested categories in parallel
    const promises: Promise<void>[] = [];

    if (shouldFetch('vitals')) {
      promises.push(
        this.fhirRepository
          .getObservations(provider.patientId, provider.id, 'vital-signs')
          .then(results => {
            output.vitals.push(...results);
          })
      );
    }

    if (shouldFetch('labs')) {
      promises.push(
        this.fhirRepository.getDiagnosticReports(provider.patientId, provider.id).then(results => {
          output.labs.push(...results);
        })
      );
    }

    if (shouldFetch('medications')) {
      promises.push(
        this.fhirRepository.getMedicationRequests(provider.patientId, provider.id).then(results => {
          output.medications.push(...results);
        })
      );
    }

    if (shouldFetch('encounters')) {
      promises.push(
        this.fhirRepository.getEncounters(provider.patientId, provider.id).then(results => {
          output.encounters.push(...results);
        })
      );
    }

    await Promise.all(promises);
  }

  /**
   * Sort results by date (most recent first)
   */
  private sortResults(output: FetchPatientRecordsOutput): void {
    const getDate = (source: SourceMetadata): number => {
      return new Date(source.fetchedAt).getTime();
    };

    output.vitals.sort((a, b) => getDate(b.source) - getDate(a.source));
    output.labs.sort((a, b) => getDate(b.source) - getDate(a.source));
    output.medications.sort((a, b) => getDate(b.source) - getDate(a.source));
    output.encounters.sort((a, b) => getDate(b.source) - getDate(a.source));
  }
}

export default FetchPatientRecordsUseCase;
