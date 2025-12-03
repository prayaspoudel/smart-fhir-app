/**
 * Authentication Use Cases
 *
 * Domain logic for authentication, 2FA, and session management.
 * Following Clean Architecture, these use cases depend on abstract repositories.
 */

import {
  User,
  AuthTokens,
  LoginCredentials,
  RegistrationData,
  TOTPSetup,
  OTPVerification,
  BiometricCredentials,
  Session,
  TwoFactorMethod,
  AuthError,
} from '../entities/AuthEntities';

/**
 * Authentication Repository Interface
 */
export interface AuthRepository {
  /** Login with credentials */
  login(credentials: LoginCredentials): Promise<LoginResult>;

  /** Register a new user */
  register(data: RegistrationData): Promise<RegistrationResult>;

  /** Logout and invalidate tokens */
  logout(): Promise<void>;

  /** Refresh access token */
  refreshTokens(refreshToken: string): Promise<AuthTokens>;

  /** Get current user */
  getCurrentUser(): Promise<User | null>;

  /** Verify email OTP */
  verifyEmailOTP(verification: OTPVerification): Promise<boolean>;

  /** Verify phone OTP */
  verifyPhoneOTP(verification: OTPVerification): Promise<boolean>;

  /** Send phone OTP */
  sendPhoneOTP(phoneNumber: string, type: OTPVerification['type']): Promise<void>;

  /** Send email OTP */
  sendEmailOTP(email: string, type: OTPVerification['type']): Promise<void>;

  /** Request password reset */
  requestPasswordReset(email: string): Promise<void>;

  /** Reset password */
  resetPassword(token: string, newPassword: string): Promise<void>;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  tokens?: AuthTokens;
  requires2FA?: boolean;
  twoFactorMethod?: TwoFactorMethod;
  error?: AuthError;
}

export interface RegistrationResult {
  success: boolean;
  user?: User;
  requiresVerification?: boolean;
  verificationMethod?: 'email' | 'phone';
  error?: AuthError;
}

/**
 * Two-Factor Authentication Repository Interface
 */
export interface TwoFactorRepository {
  /** Setup TOTP 2FA */
  setupTOTP(): Promise<TOTPSetup>;

  /** Verify and enable TOTP */
  verifyAndEnableTOTP(code: string): Promise<boolean>;

  /** Verify TOTP during login */
  verifyTOTP(code: string): Promise<AuthTokens>;

  /** Verify SMS OTP during login */
  verifySMS2FA(code: string): Promise<AuthTokens>;

  /** Disable 2FA */
  disable2FA(password: string): Promise<boolean>;

  /** Generate new backup codes */
  generateBackupCodes(): Promise<string[]>;

  /** Use a backup code */
  useBackupCode(code: string): Promise<AuthTokens>;

  /** Get remaining backup codes count */
  getBackupCodesCount(): Promise<number>;
}

/**
 * Biometric Repository Interface
 */
export interface BiometricRepository {
  /** Check if biometrics are available on device */
  isAvailable(): Promise<BiometricAvailability>;

  /** Setup biometric authentication */
  setup(refreshToken: string): Promise<void>;

  /** Authenticate with biometrics */
  authenticate(): Promise<string>; // Returns decrypted refresh token

  /** Disable biometric auth */
  disable(): Promise<void>;

  /** Check if biometrics are set up */
  isSetup(): Promise<boolean>;
}

export interface BiometricAvailability {
  available: boolean;
  biometryType?: 'FaceID' | 'TouchID' | 'Fingerprint' | 'Iris';
  reason?: string;
}

/**
 * Session Repository Interface
 */
export interface SessionRepository {
  /** Get current session */
  getCurrentSession(): Promise<Session | null>;

  /** Get all active sessions */
  getAllSessions(): Promise<Session[]>;

  /** Terminate a session */
  terminateSession(sessionId: string): Promise<void>;

  /** Terminate all other sessions */
  terminateOtherSessions(): Promise<void>;

  /** Update session activity */
  updateActivity(): Promise<void>;

  /** Check session validity */
  isSessionValid(): Promise<boolean>;
}

/**
 * Secure Storage Repository Interface
 */
export interface SecureStorageRepository {
  /** Store tokens securely */
  storeTokens(tokens: AuthTokens): Promise<void>;

  /** Retrieve tokens */
  getTokens(): Promise<AuthTokens | null>;

  /** Clear tokens */
  clearTokens(): Promise<void>;

  /** Store biometric credentials */
  storeBiometricCredentials(credentials: BiometricCredentials): Promise<void>;

  /** Get biometric credentials */
  getBiometricCredentials(): Promise<BiometricCredentials | null>;

  /** Clear all secure data */
  clearAll(): Promise<void>;
}

// =============================================================================
// USE CASES
// =============================================================================

/**
 * Login Use Case
 */
export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly storageRepository: SecureStorageRepository
  ) {}

  async execute(credentials: LoginCredentials): Promise<LoginResult> {
    const result = await this.authRepository.login(credentials);

    if (result.success && result.tokens) {
      // Store tokens securely
      await this.storageRepository.storeTokens(result.tokens);
    }

    return result;
  }
}

/**
 * Register Use Case
 */
export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(data: RegistrationData): Promise<RegistrationResult> {
    // Validate input
    if (!data.email && !data.phoneNumber) {
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email or phone number is required',
        },
      };
    }

    if (!data.acceptsTerms || !data.acceptsPrivacy) {
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'You must accept the terms and privacy policy',
        },
      };
    }

    if (data.password.length < 8) {
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Password must be at least 8 characters',
        },
      };
    }

    return this.authRepository.register(data);
  }
}

/**
 * Logout Use Case
 */
export class LogoutUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly storageRepository: SecureStorageRepository,
    private readonly biometricRepository: BiometricRepository
  ) {}

  async execute(_revokeAllSessions = false): Promise<void> {
    // Logout from server
    await this.authRepository.logout();

    // Clear local secure storage
    await this.storageRepository.clearAll();

    // Disable biometrics if set
    const isSetup = await this.biometricRepository.isSetup();
    if (isSetup) {
      await this.biometricRepository.disable();
    }
  }
}

/**
 * Setup 2FA Use Case
 */
export class Setup2FAUseCase {
  constructor(private readonly twoFactorRepository: TwoFactorRepository) {}

  async execute(): Promise<TOTPSetup> {
    return this.twoFactorRepository.setupTOTP();
  }

  async verify(code: string): Promise<boolean> {
    return this.twoFactorRepository.verifyAndEnableTOTP(code);
  }

  async disable(password: string): Promise<boolean> {
    return this.twoFactorRepository.disable2FA(password);
  }
}

/**
 * Verify 2FA Use Case
 */
export class Verify2FAUseCase {
  constructor(
    private readonly twoFactorRepository: TwoFactorRepository,
    private readonly storageRepository: SecureStorageRepository
  ) {}

  async verifyTOTP(code: string): Promise<AuthTokens> {
    const tokens = await this.twoFactorRepository.verifyTOTP(code);
    await this.storageRepository.storeTokens(tokens);
    return tokens;
  }

  async verifySMS(code: string): Promise<AuthTokens> {
    const tokens = await this.twoFactorRepository.verifySMS2FA(code);
    await this.storageRepository.storeTokens(tokens);
    return tokens;
  }

  async useBackupCode(code: string): Promise<AuthTokens> {
    const tokens = await this.twoFactorRepository.useBackupCode(code);
    await this.storageRepository.storeTokens(tokens);
    return tokens;
  }
}

/**
 * Biometric Login Use Case
 */
export class BiometricLoginUseCase {
  constructor(
    private readonly biometricRepository: BiometricRepository,
    private readonly authRepository: AuthRepository,
    private readonly storageRepository: SecureStorageRepository
  ) {}

  async checkAvailability(): Promise<BiometricAvailability> {
    return this.biometricRepository.isAvailable();
  }

  async isSetup(): Promise<boolean> {
    return this.biometricRepository.isSetup();
  }

  async setup(): Promise<void> {
    const tokens = await this.storageRepository.getTokens();
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available for biometric setup');
    }

    await this.biometricRepository.setup(tokens.refreshToken);
  }

  async authenticate(): Promise<AuthTokens> {
    // Get refresh token via biometric authentication
    const refreshToken = await this.biometricRepository.authenticate();

    // Exchange for new tokens
    const tokens = await this.authRepository.refreshTokens(refreshToken);
    await this.storageRepository.storeTokens(tokens);

    return tokens;
  }

  async disable(): Promise<void> {
    await this.biometricRepository.disable();
  }
}

/**
 * Session Management Use Case
 */
export class SessionManagementUseCase {
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private warningTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly onSessionWarning: () => void,
    private readonly onSessionExpired: () => void,
    private readonly sessionTimeoutMs: number = 15 * 60 * 1000,
    private readonly warningBeforeMs: number = 2 * 60 * 1000
  ) {}

  /**
   * Start session monitoring
   */
  startMonitoring(): void {
    this.resetTimers();
  }

  /**
   * Stop session monitoring
   */
  stopMonitoring(): void {
    this.clearTimers();
  }

  /**
   * Record user activity
   */
  async recordActivity(): Promise<void> {
    await this.sessionRepository.updateActivity();
    this.resetTimers();
  }

  /**
   * Extend session
   */
  async extendSession(): Promise<void> {
    await this.sessionRepository.updateActivity();
    this.resetTimers();
  }

  /**
   * Get all sessions
   */
  async getSessions(): Promise<Session[]> {
    return this.sessionRepository.getAllSessions();
  }

  /**
   * Terminate a specific session
   */
  async terminateSession(sessionId: string): Promise<void> {
    await this.sessionRepository.terminateSession(sessionId);
  }

  /**
   * Terminate all other sessions
   */
  async terminateOtherSessions(): Promise<void> {
    await this.sessionRepository.terminateOtherSessions();
  }

  private resetTimers(): void {
    this.clearTimers();

    // Set warning timer
    this.warningTimer = setTimeout(() => {
      this.onSessionWarning();
    }, this.sessionTimeoutMs - this.warningBeforeMs);

    // Set expiry timer
    this.idleTimer = setTimeout(() => {
      this.onSessionExpired();
    }, this.sessionTimeoutMs);
  }

  private clearTimers(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }
}

/**
 * Token Refresh Use Case
 */
export class TokenRefreshUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly storageRepository: SecureStorageRepository
  ) {}

  async execute(): Promise<AuthTokens> {
    const currentTokens = await this.storageRepository.getTokens();

    if (!currentTokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const newTokens = await this.authRepository.refreshTokens(currentTokens.refreshToken);

    await this.storageRepository.storeTokens(newTokens);

    return newTokens;
  }
}

export {
  LoginUseCase as Login,
  RegisterUseCase as Register,
  LogoutUseCase as Logout,
  Setup2FAUseCase as Setup2FA,
  Verify2FAUseCase as Verify2FA,
  BiometricLoginUseCase as BiometricLogin,
  SessionManagementUseCase as SessionManagement,
  TokenRefreshUseCase as TokenRefresh,
};
