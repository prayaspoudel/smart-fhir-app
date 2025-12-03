/**
 * Global type declarations for React Native
 */

declare const __DEV__: boolean;

declare namespace NodeJS {
  interface ProcessEnv {
    SMART_CLIENT_ID?: string;
    SMART_REDIRECT_URI?: string;
    DEFAULT_FHIR_SERVER_URL?: string;
    BACKEND_BASE_URL?: string;
    WEBSOCKET_URL?: string;
    SESSION_TIMEOUT_MINUTES?: string;
    IDLE_WARNING_MINUTES?: string;
    BIOMETRIC_AUTH_ENABLED?: string;
    MAX_LOGIN_ATTEMPTS?: string;
    LOCKOUT_DURATION_MINUTES?: string;
    KEY_DERIVATION_ITERATIONS?: string;
    ENCRYPTED_DATA_TTL_HOURS?: string;
    FCM_SENDER_ID?: string;
    ANALYTICS_DISABLED?: string;
    LOG_LEVEL?: string;
    PHI_REDACTION_ENABLED?: string;
    DEBUG_MODE?: string;
    MOCK_FHIR_ENABLED?: string;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
