/**
 * Provider Entity
 *
 * Represents a FHIR/EMR provider that the app can connect to for fetching medical records.
 * Supports multi-provider architecture with authentication state tracking.
 */

export interface Provider {
  /** Unique identifier for the provider (UUID) */
  id: string;

  /** Display name of the provider/organization */
  name: string;

  /** FHIR server base URL */
  fhirServerUrl: string;

  /** OAuth2 authorization endpoint */
  authorizationEndpoint: string;

  /** OAuth2 token endpoint */
  tokenEndpoint: string;

  /** OAuth2 client ID registered with the provider */
  clientId: string;

  /** Redirect URI for OAuth callbacks */
  redirectUri: string;

  /** SMART on FHIR scopes requested */
  scopes: string[];

  /** Provider logo/icon URL */
  iconUrl?: string;

  /** Whether this provider is currently connected/authenticated */
  isConnected: boolean;

  /** Patient ID for this provider (from SMART launch context or selection) */
  patientId?: string;

  /** Timestamp of last successful sync */
  lastSyncedAt?: string;

  /** Whether this is the primary/default provider */
  isPrimary: boolean;

  /** Provider-specific metadata */
  metadata?: ProviderMetadata;

  /** Encryption public key for E2EE (if provider supports) */
  publicKey?: string;

  /** Connection status */
  connectionStatus: ProviderConnectionStatus;
}

export type ProviderConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'token_expired';

export interface ProviderMetadata {
  /** Organization name */
  organization?: string;

  /** Organization type (hospital, clinic, lab, etc.) */
  organizationType?: string;

  /** FHIR capability statement version */
  fhirVersion?: string;

  /** Supported FHIR resources */
  supportedResources?: string[];

  /** Supported SMART on FHIR capabilities */
  smartCapabilities?: string[];

  /** Provider's HIPAA compliance level */
  complianceLevel?: 'full' | 'partial' | 'none';

  /** Provider description */
  description?: string;

  /** Contact information */
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface ProviderTokens {
  /** Provider ID */
  providerId: string;

  /** OAuth2 access token */
  accessToken: string;

  /** OAuth2 refresh token (if available) */
  refreshToken?: string;

  /** Token expiration timestamp */
  expiresAt: number;

  /** Token type (usually "Bearer") */
  tokenType: string;

  /** Scopes that were granted */
  grantedScopes: string[];

  /** ID token (if OpenID Connect) */
  idToken?: string;

  /** Patient ID from token response */
  patientId?: string;
}

export interface ProviderRegistration {
  /** Provider name */
  name: string;

  /** FHIR server URL */
  fhirServerUrl: string;

  /** Client ID */
  clientId: string;

  /** Optional custom authorization endpoint (otherwise from well-known) */
  authorizationEndpoint?: string;

  /** Optional custom token endpoint */
  tokenEndpoint?: string;

  /** Custom scopes (defaults used if not provided) */
  scopes?: string[];

  /** Icon URL */
  iconUrl?: string;
}

/**
 * Default SMART on FHIR scopes
 */
export const DEFAULT_SMART_SCOPES = [
  'openid',
  'fhirUser',
  'launch/patient',
  'patient/Patient.read',
  'patient/Observation.read',
  'patient/DiagnosticReport.read',
  'patient/MedicationRequest.read',
  'patient/Encounter.read',
  'patient/Consent.read',
  'patient/Consent.write',
  'offline_access',
] as const;

/**
 * Well-known FHIR sandboxes for testing
 */
export const SANDBOX_PROVIDERS: ProviderRegistration[] = [
  {
    name: 'SMART Health IT Sandbox',
    fhirServerUrl: 'https://launch.smarthealthit.org/v/r4/fhir',
    clientId: 'smart_fhir_app_demo',
    iconUrl: 'https://smarthealthit.org/images/smart-logo.png',
  },
  {
    name: 'HAPI FHIR Public',
    fhirServerUrl: 'https://hapi.fhir.org/baseR4',
    clientId: 'hapi_fhir_demo',
    iconUrl: 'https://hapifhir.io/hapi-fhir/images/flame.png',
  },
];

/**
 * Helper functions for Provider entity
 */
export const ProviderHelpers = {
  /**
   * Create a new provider from registration data
   */
  createFromRegistration(registration: ProviderRegistration, id: string): Provider {
    return {
      id,
      name: registration.name,
      fhirServerUrl: registration.fhirServerUrl,
      authorizationEndpoint: registration.authorizationEndpoint || '',
      tokenEndpoint: registration.tokenEndpoint || '',
      clientId: registration.clientId,
      redirectUri: 'smartfhirapp://callback',
      scopes: registration.scopes || [...DEFAULT_SMART_SCOPES],
      iconUrl: registration.iconUrl,
      isConnected: false,
      isPrimary: false,
      connectionStatus: 'disconnected',
    };
  },

  /**
   * Check if tokens are expired
   */
  areTokensExpired(tokens: ProviderTokens): boolean {
    // Add 60 second buffer
    return Date.now() >= tokens.expiresAt - 60000;
  },

  /**
   * Get the .well-known/smart-configuration URL
   */
  getSmartConfigUrl(provider: Provider): string {
    const baseUrl = provider.fhirServerUrl.replace(/\/$/, '');
    return `${baseUrl}/.well-known/smart-configuration`;
  },

  /**
   * Get the CapabilityStatement URL
   */
  getCapabilityStatementUrl(provider: Provider): string {
    const baseUrl = provider.fhirServerUrl.replace(/\/$/, '');
    return `${baseUrl}/metadata`;
  },

  /**
   * Build the scopes string for authorization
   */
  buildScopesString(provider: Provider): string {
    return provider.scopes.join(' ');
  },

  /**
   * Get display status text
   */
  getStatusText(provider: Provider): string {
    const statusMap: Record<ProviderConnectionStatus, string> = {
      disconnected: 'Not connected',
      connecting: 'Connecting...',
      connected: 'Connected',
      error: 'Connection error',
      token_expired: 'Session expired',
    };
    return statusMap[provider.connectionStatus];
  },
};

export default Provider;
