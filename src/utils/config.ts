/**
 * Application Configuration
 *
 * Centralized configuration management with environment variables.
 * All sensitive values should come from environment variables.
 */

// Environment variable types
interface EnvironmentConfig {
  // SMART on FHIR
  SMART_CLIENT_ID: string;
  SMART_REDIRECT_URI: string;
  DEFAULT_FHIR_SERVER_URL: string;

  // Backend
  BACKEND_BASE_URL: string;
  WEBSOCKET_URL: string;

  // Security
  SESSION_TIMEOUT_MINUTES: number;
  IDLE_WARNING_MINUTES: number;
  BIOMETRIC_AUTH_ENABLED: boolean;
  MAX_LOGIN_ATTEMPTS: number;
  LOCKOUT_DURATION_MINUTES: number;

  // Encryption
  KEY_DERIVATION_ITERATIONS: number;
  ENCRYPTED_DATA_TTL_HOURS: number;

  // Push Notifications
  FCM_SENDER_ID: string;

  // Logging
  ANALYTICS_DISABLED: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  PHI_REDACTION_ENABLED: boolean;

  // Development
  DEBUG_MODE: boolean;
  MOCK_FHIR_ENABLED: boolean;
}

/**
 * Get environment variable with fallback
 */
const getEnvVar = (key: string, fallback: string): string => {
  // In React Native, environment variables are typically injected at build time
  // Using a simple object lookup pattern that can be replaced by build tools
  const envVars: Record<string, string | undefined> = {
    SMART_CLIENT_ID: process.env.SMART_CLIENT_ID,
    SMART_REDIRECT_URI: process.env.SMART_REDIRECT_URI,
    DEFAULT_FHIR_SERVER_URL: process.env.DEFAULT_FHIR_SERVER_URL,
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
    WEBSOCKET_URL: process.env.WEBSOCKET_URL,
    SESSION_TIMEOUT_MINUTES: process.env.SESSION_TIMEOUT_MINUTES,
    IDLE_WARNING_MINUTES: process.env.IDLE_WARNING_MINUTES,
    BIOMETRIC_AUTH_ENABLED: process.env.BIOMETRIC_AUTH_ENABLED,
    MAX_LOGIN_ATTEMPTS: process.env.MAX_LOGIN_ATTEMPTS,
    LOCKOUT_DURATION_MINUTES: process.env.LOCKOUT_DURATION_MINUTES,
    KEY_DERIVATION_ITERATIONS: process.env.KEY_DERIVATION_ITERATIONS,
    ENCRYPTED_DATA_TTL_HOURS: process.env.ENCRYPTED_DATA_TTL_HOURS,
    FCM_SENDER_ID: process.env.FCM_SENDER_ID,
    ANALYTICS_DISABLED: process.env.ANALYTICS_DISABLED,
    LOG_LEVEL: process.env.LOG_LEVEL,
    PHI_REDACTION_ENABLED: process.env.PHI_REDACTION_ENABLED,
    DEBUG_MODE: process.env.DEBUG_MODE,
    MOCK_FHIR_ENABLED: process.env.MOCK_FHIR_ENABLED,
  };

  return envVars[key] ?? fallback;
};

const getEnvBool = (key: string, fallback: boolean): boolean => {
  const value = getEnvVar(key, String(fallback));
  return value.toLowerCase() === 'true';
};

const getEnvNumber = (key: string, fallback: number): number => {
  const value = getEnvVar(key, String(fallback));
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Application configuration
 */
export const Config: EnvironmentConfig = {
  // SMART on FHIR
  SMART_CLIENT_ID: getEnvVar('SMART_CLIENT_ID', 'smart_fhir_app'),
  SMART_REDIRECT_URI: getEnvVar('SMART_REDIRECT_URI', 'smartfhirapp://callback'),
  DEFAULT_FHIR_SERVER_URL: getEnvVar(
    'DEFAULT_FHIR_SERVER_URL',
    'https://launch.smarthealthit.org/v/r4/fhir'
  ),

  // Backend
  BACKEND_BASE_URL: getEnvVar('BACKEND_BASE_URL', 'http://localhost:3001/api'),
  WEBSOCKET_URL: getEnvVar('WEBSOCKET_URL', 'ws://localhost:3001'),

  // Security
  SESSION_TIMEOUT_MINUTES: getEnvNumber('SESSION_TIMEOUT_MINUTES', 15),
  IDLE_WARNING_MINUTES: getEnvNumber('IDLE_WARNING_MINUTES', 2),
  BIOMETRIC_AUTH_ENABLED: getEnvBool('BIOMETRIC_AUTH_ENABLED', true),
  MAX_LOGIN_ATTEMPTS: getEnvNumber('MAX_LOGIN_ATTEMPTS', 5),
  LOCKOUT_DURATION_MINUTES: getEnvNumber('LOCKOUT_DURATION_MINUTES', 15),

  // Encryption
  KEY_DERIVATION_ITERATIONS: getEnvNumber('KEY_DERIVATION_ITERATIONS', 100000),
  ENCRYPTED_DATA_TTL_HOURS: getEnvNumber('ENCRYPTED_DATA_TTL_HOURS', 24),

  // Push Notifications
  FCM_SENDER_ID: getEnvVar('FCM_SENDER_ID', ''),

  // Logging
  ANALYTICS_DISABLED: getEnvBool('ANALYTICS_DISABLED', true),
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'info') as EnvironmentConfig['LOG_LEVEL'],
  PHI_REDACTION_ENABLED: getEnvBool('PHI_REDACTION_ENABLED', true),

  // Development
  DEBUG_MODE: getEnvBool('DEBUG_MODE', __DEV__ ?? false),
  MOCK_FHIR_ENABLED: getEnvBool('MOCK_FHIR_ENABLED', false),
};

/**
 * Derived configuration values
 */
export const DerivedConfig = {
  /** Session timeout in milliseconds */
  SESSION_TIMEOUT_MS: Config.SESSION_TIMEOUT_MINUTES * 60 * 1000,

  /** Warning before session timeout in milliseconds */
  WARNING_BEFORE_TIMEOUT_MS: Config.IDLE_WARNING_MINUTES * 60 * 1000,

  /** Lockout duration in milliseconds */
  LOCKOUT_DURATION_MS: Config.LOCKOUT_DURATION_MINUTES * 60 * 1000,

  /** Encrypted data TTL in milliseconds */
  ENCRYPTED_DATA_TTL_MS: Config.ENCRYPTED_DATA_TTL_HOURS * 60 * 60 * 1000,
};

/**
 * FHIR Scopes configuration
 */
export const FHIRScopes = {
  /** Standard patient access scopes */
  PATIENT_READ: [
    'patient/Patient.read',
    'patient/Observation.read',
    'patient/DiagnosticReport.read',
    'patient/MedicationRequest.read',
    'patient/Encounter.read',
    'patient/Consent.read',
  ],

  /** Write scopes */
  PATIENT_WRITE: ['patient/Consent.write'],

  /** OpenID Connect scopes */
  OPENID: ['openid', 'fhirUser'],

  /** Launch scopes */
  LAUNCH: ['launch/patient'],

  /** Offline access */
  OFFLINE: ['offline_access'],

  /** Get all scopes combined */
  all(): string[] {
    return [
      ...this.OPENID,
      ...this.LAUNCH,
      ...this.PATIENT_READ,
      ...this.PATIENT_WRITE,
      ...this.OFFLINE,
    ];
  },

  /** Get as space-separated string */
  toString(): string {
    return this.all().join(' ');
  },
};

export default Config;
