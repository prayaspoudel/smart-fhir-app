/**
 * Authentication Entities
 *
 * Domain entities for authentication, session management, and 2FA
 */

export interface User {
  /** Unique user ID */
  id: string;

  /** User's email address */
  email?: string;

  /** User's phone number (E.164 format) */
  phoneNumber?: string;

  /** Display name */
  displayName?: string;

  /** Profile picture URL */
  avatarUrl?: string;

  /** Whether email is verified */
  emailVerified: boolean;

  /** Whether phone is verified */
  phoneVerified: boolean;

  /** Whether 2FA is enabled */
  twoFactorEnabled: boolean;

  /** 2FA method preference */
  twoFactorMethod?: TwoFactorMethod;

  /** Whether biometric login is enabled */
  biometricEnabled: boolean;

  /** Account creation timestamp */
  createdAt: string;

  /** Last login timestamp */
  lastLoginAt?: string;
}

export type TwoFactorMethod = 'totp' | 'sms' | 'email';

export interface AuthTokens {
  /** JWT access token for API calls */
  accessToken: string;

  /** Refresh token for obtaining new access tokens */
  refreshToken: string;

  /** Access token expiration timestamp (milliseconds) */
  accessTokenExpiresAt: number;

  /** Refresh token expiration timestamp (milliseconds) */
  refreshTokenExpiresAt: number;

  /** Token type (usually "Bearer") */
  tokenType: string;

  /** ID token from OpenID Connect */
  idToken?: string;
}

export interface Session {
  /** Session ID */
  id: string;

  /** User ID */
  userId: string;

  /** Session creation timestamp */
  createdAt: string;

  /** Last activity timestamp */
  lastActivityAt: string;

  /** Session expiration timestamp */
  expiresAt: string;

  /** Device information */
  deviceInfo: DeviceInfo;

  /** Whether session is currently active */
  isActive: boolean;

  /** Whether this is the current session */
  isCurrent: boolean;
}

export interface DeviceInfo {
  /** Device unique identifier */
  deviceId: string;

  /** Device name */
  deviceName: string;

  /** Device platform (iOS, Android) */
  platform: 'ios' | 'android';

  /** OS version */
  osVersion: string;

  /** App version */
  appVersion: string;

  /** IP address (masked) */
  ipAddress?: string;

  /** Approximate location */
  location?: string;
}

export interface TOTPSetup {
  /** TOTP secret key (base32 encoded) */
  secret: string;

  /** QR code data URL for authenticator apps */
  qrCodeUrl: string;

  /** Backup codes for account recovery */
  backupCodes: string[];

  /** TOTP algorithm */
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';

  /** TOTP digits */
  digits: 6 | 8;

  /** TOTP period in seconds */
  period: number;
}

export interface LoginCredentials {
  /** Email or phone number */
  identifier: string;

  /** Password */
  password: string;

  /** 2FA code (if required) */
  twoFactorCode?: string;

  /** Remember device for 2FA */
  rememberDevice?: boolean;
}

export interface RegistrationData {
  /** Email address */
  email?: string;

  /** Phone number */
  phoneNumber?: string;

  /** Password */
  password: string;

  /** Display name */
  displayName?: string;

  /** Whether user accepts terms */
  acceptsTerms: boolean;

  /** Whether user accepts privacy policy */
  acceptsPrivacy: boolean;
}

export interface OTPVerification {
  /** Phone number or email the OTP was sent to */
  destination: string;

  /** OTP code */
  code: string;

  /** Verification type */
  type: 'registration' | 'login' | 'password_reset' | '2fa_setup';
}

export interface BiometricCredentials {
  /** Encrypted refresh token */
  encryptedRefreshToken: string;

  /** Biometric key reference */
  biometricKeyRef: string;

  /** When biometrics were set up */
  setupAt: string;

  /** User ID associated with biometrics */
  userId: string;
}

/**
 * Authentication state for the app
 */
export interface AuthState {
  /** Whether user is authenticated */
  isAuthenticated: boolean;

  /** Current user */
  user: User | null;

  /** Current tokens */
  tokens: AuthTokens | null;

  /** Whether authentication is loading */
  isLoading: boolean;

  /** Authentication error */
  error: AuthError | null;

  /** Whether 2FA verification is required */
  requires2FA: boolean;

  /** Whether biometric login is available */
  biometricAvailable: boolean;

  /** Session timeout timestamp */
  sessionExpiresAt: number | null;

  /** Whether session is about to expire (warning state) */
  sessionWarning: boolean;
}

export interface AuthError {
  /** Error code */
  code: AuthErrorCode;

  /** Human-readable error message */
  message: string;

  /** Additional error details */
  details?: Record<string, unknown>;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'EMAIL_NOT_VERIFIED'
  | 'PHONE_NOT_VERIFIED'
  | '2FA_REQUIRED'
  | '2FA_INVALID'
  | 'BIOMETRIC_FAILED'
  | 'BIOMETRIC_NOT_ENROLLED'
  | 'BIOMETRIC_NOT_AVAILABLE'
  | 'SESSION_EXPIRED'
  | 'TOKEN_REFRESH_FAILED'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'ACCOUNT_LOCKED'
  | 'RATE_LIMITED'
  | 'UNKNOWN';

/**
 * Session configuration
 */
export interface SessionConfig {
  /** Session timeout in milliseconds */
  sessionTimeoutMs: number;

  /** Warning time before session expires (in milliseconds) */
  warningBeforeTimeoutMs: number;

  /** Whether to allow biometric quick login */
  allowBiometricLogin: boolean;

  /** Require full re-auth after certain events */
  requireFullReauthOnSensitiveOps: boolean;

  /** Maximum concurrent sessions */
  maxConcurrentSessions: number;
}

/**
 * Default session configuration
 */
export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  sessionTimeoutMs: 15 * 60 * 1000, // 15 minutes
  warningBeforeTimeoutMs: 2 * 60 * 1000, // 2 minutes
  allowBiometricLogin: true,
  requireFullReauthOnSensitiveOps: true,
  maxConcurrentSessions: 5,
};

/**
 * Helper functions for auth entities
 */
export const AuthHelpers = {
  /**
   * Check if tokens are expired
   */
  areTokensExpired(tokens: AuthTokens): boolean {
    return Date.now() >= tokens.accessTokenExpiresAt - 30000; // 30 second buffer
  },

  /**
   * Check if refresh token is valid
   */
  canRefreshTokens(tokens: AuthTokens): boolean {
    return Date.now() < tokens.refreshTokenExpiresAt - 60000; // 1 minute buffer
  },

  /**
   * Mask email for display
   */
  maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (local.length <= 2) {
      return `${local[0]}*@${domain}`;
    }
    return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
  },

  /**
   * Mask phone number for display
   */
  maskPhoneNumber(phone: string): string {
    if (phone.length <= 4) {
      return phone;
    }
    return `${'*'.repeat(phone.length - 4)}${phone.slice(-4)}`;
  },

  /**
   * Format session last activity
   */
  formatLastActivity(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'Just now';
    }
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    return date.toLocaleDateString();
  },
};

export default User;
