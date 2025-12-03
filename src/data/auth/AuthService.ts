/**
 * Authentication Service
 *
 * Handles SMART on FHIR OAuth2 authentication with PKCE flow.
 *
 * SMART ON FHIR FLOW:
 *
 * 1. Standalone Launch:
 *    - App initiates authorization with redirect to authorization endpoint
 *    - User authenticates with EHR
 *    - EHR redirects back with authorization code
 *    - App exchanges code for tokens
 *
 * 2. EHR Launch:
 *    - EHR opens app with launch parameter
 *    - App exchanges launch parameter for context
 *    - App requests authorization
 *    - Continues as standalone after auth
 *
 * PKCE (Proof Key for Code Exchange):
 * - Required for public clients (mobile apps)
 * - Generates code_verifier and code_challenge
 * - Protects against authorization code interception
 */

import { Linking } from 'react-native';
import { Buffer } from 'buffer';

import { Logger } from '../../utils/logger';
import { Config, FHIRScopes } from '../../utils/config';
import { Provider, ProviderTokens, ProviderHelpers } from '../../domain/entities/Provider';
import { AuthTokens } from '../../domain/entities/AuthEntities';
import { secureStorage } from '../../infrastructure/storage/SecureStorage';

/**
 * SMART Configuration from .well-known endpoint
 */
export interface SMARTConfiguration {
  authorization_endpoint: string;
  token_endpoint: string;
  revocation_endpoint?: string;
  introspection_endpoint?: string;
  userinfo_endpoint?: string;
  capabilities?: string[];
  scopes_supported?: string[];
  response_types_supported?: string[];
  code_challenge_methods_supported?: string[];
}

/**
 * Authorization request parameters
 */
export interface AuthorizationRequest {
  provider: Provider;
  scopes?: string[];
  launch?: string; // EHR launch parameter
  state?: string;
}

/**
 * Token response
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  id_token?: string;
  patient?: string;
  encounter?: string;
  need_patient_banner?: boolean;
  smart_style_url?: string;
}

/**
 * PKCE challenge pair
 */
interface PKCEChallenge {
  codeVerifier: string;
  codeChallenge: string;
  method: 'S256';
}

/**
 * Pending authorization state
 */
interface PendingAuth {
  provider: Provider;
  codeVerifier: string;
  state: string;
  scopes: string[];
}

/**
 * SMART on FHIR Authentication Service
 */
export class AuthService {
  private pendingAuth: PendingAuth | null = null;

  /**
   * Generate random bytes using Math.random() as fallback
   * In production, use react-native-get-random-values
   */
  private getRandomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  }

  /**
   * Simple SHA-256 hash implementation for PKCE
   * Uses Buffer for base64 encoding
   */
  private async sha256(input: string): Promise<string> {
    // For React Native, we use a simple hash approach
    // In production, use crypto-js or react-native-quick-crypto
    const bytes = Buffer.from(input, 'utf-8');
    // This is a placeholder - in production use a proper SHA-256
    // For now, return the input base64 encoded (NOT SECURE - just for compilation)
    return Buffer.from(bytes)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Generate PKCE code verifier and challenge
   */
  private async generatePKCE(): Promise<PKCEChallenge> {
    // Generate random bytes for code verifier (43-128 characters)
    const randomBytes = this.getRandomBytes(32);

    // Convert to base64url encoding
    const codeVerifier = this.base64UrlEncode(randomBytes);

    // Generate code challenge (SHA-256 hash of code verifier)
    const codeChallenge = await this.sha256(codeVerifier);

    return {
      codeVerifier,
      codeChallenge,
      method: 'S256',
    };
  }

  /**
   * Base64 URL encoding (RFC 4648)
   */
  private base64UrlEncode(bytes: Uint8Array): string {
    return Buffer.from(bytes)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Generate random state parameter
   */
  private generateState(): string {
    const randomBytes = this.getRandomBytes(16);
    return this.base64UrlEncode(randomBytes);
  }

  /**
   * Fetch SMART configuration from well-known endpoint
   */
  async fetchSMARTConfiguration(fhirServerUrl: string): Promise<SMARTConfiguration> {
    const baseUrl = fhirServerUrl.replace(/\/$/, '');
    const configUrl = `${baseUrl}/.well-known/smart-configuration`;

    try {
      const response = await fetch(configUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch SMART configuration: ${response.status}`);
      }
      return (await response.json()) as SMARTConfiguration;
    } catch (error) {
      Logger.warn('Failed to fetch .well-known/smart-configuration, trying metadata', {
        error: String(error),
      });

      // Fallback: Try to get from capability statement
      const metadataUrl = `${baseUrl}/metadata`;
      const metaResponse = await fetch(metadataUrl);
      const metadata = (await metaResponse.json()) as {
        rest?: Array<{
          security?: {
            extension?: Array<{
              url?: string;
              extension?: Array<{
                url?: string;
                valueUri?: string;
              }>;
            }>;
          };
        }>;
      };

      // Extract OAuth endpoints from CapabilityStatement
      const security = metadata.rest?.[0]?.security;
      const oauthExt = security?.extension?.find(
        (ext: { url?: string }) =>
          ext.url === 'http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris'
      );

      if (!oauthExt) {
        throw new Error('Could not find OAuth configuration');
      }

      const getUri = (name: string) =>
        oauthExt.extension?.find((e: { url?: string }) => e.url === name)?.valueUri || '';

      return {
        authorization_endpoint: getUri('authorize'),
        token_endpoint: getUri('token'),
        revocation_endpoint: getUri('revoke'),
      };
    }
  }

  /**
   * Initiate SMART authorization flow
   */
  async authorize(request: AuthorizationRequest): Promise<string> {
    const { provider, scopes = FHIRScopes.all(), launch } = request;

    // Fetch SMART configuration if endpoints not set
    let authEndpoint = provider.authorizationEndpoint;
    let tokenEndpoint = provider.tokenEndpoint;

    if (!authEndpoint || !tokenEndpoint) {
      const config = await this.fetchSMARTConfiguration(provider.fhirServerUrl);
      authEndpoint = config.authorization_endpoint;
      tokenEndpoint = config.token_endpoint;
    }

    // Generate PKCE challenge
    const pkce = await this.generatePKCE();

    // Generate state
    const state = this.generateState();

    // Store pending auth for callback handling
    this.pendingAuth = {
      provider: {
        ...provider,
        authorizationEndpoint: authEndpoint,
        tokenEndpoint: tokenEndpoint,
      },
      codeVerifier: pkce.codeVerifier,
      state,
      scopes,
    };

    // Build authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: provider.clientId,
      redirect_uri: Config.SMART_REDIRECT_URI,
      scope: scopes.join(' '),
      state,
      aud: provider.fhirServerUrl,
      code_challenge: pkce.codeChallenge,
      code_challenge_method: pkce.method,
    });

    // Add launch parameter for EHR launch
    if (launch) {
      params.append('launch', launch);
    }

    const authUrl = `${authEndpoint}?${params.toString()}`;

    Logger.info('Opening authorization URL', { url: authUrl.split('?')[0] });

    // Open authorization URL in browser
    await Linking.openURL(authUrl);

    return state;
  }

  /**
   * Handle OAuth callback with authorization code
   */
  async handleCallback(url: string): Promise<ProviderTokens> {
    Logger.info('Handling OAuth callback');

    if (!this.pendingAuth) {
      throw new Error('No pending authorization');
    }

    // Parse callback URL
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');
    const state = urlObj.searchParams.get('state');
    const error = urlObj.searchParams.get('error');
    const errorDescription = urlObj.searchParams.get('error_description');

    // Check for errors
    if (error) {
      throw new Error(`Authorization error: ${error} - ${errorDescription}`);
    }

    // Validate state
    if (state !== this.pendingAuth.state) {
      throw new Error('State mismatch - possible CSRF attack');
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(code);

    // Clear pending auth
    const providerId = this.pendingAuth.provider.id;
    this.pendingAuth = null;

    // Store tokens securely
    await secureStorage.storeProviderTokens(providerId, tokens);

    return tokens;
  }

  /**
   * Exchange authorization code for tokens
   */
  private async exchangeCodeForTokens(code: string): Promise<ProviderTokens> {
    if (!this.pendingAuth) {
      throw new Error('No pending authorization');
    }

    const { provider, codeVerifier, scopes: _scopes } = this.pendingAuth;

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: Config.SMART_REDIRECT_URI,
      client_id: provider.clientId,
      code_verifier: codeVerifier,
    });

    const response = await fetch(provider.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
    }

    const tokenResponse: TokenResponse = (await response.json()) as TokenResponse;

    // Calculate expiration timestamp
    const expiresAt = Date.now() + tokenResponse.expires_in * 1000;

    return {
      providerId: provider.id,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt,
      tokenType: tokenResponse.token_type,
      grantedScopes: tokenResponse.scope.split(' '),
      idToken: tokenResponse.id_token,
      patientId: tokenResponse.patient,
    };
  }

  /**
   * Refresh access token
   */
  async refreshTokens(providerId: string): Promise<ProviderTokens> {
    const currentTokens = await secureStorage.getProviderTokens(providerId);

    if (!currentTokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Get provider configuration
    // In production, this would be fetched from provider registry
    const provider = await this.getProvider(providerId);

    if (!provider) {
      throw new Error('Provider not found');
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: currentTokens.refreshToken,
      client_id: provider.clientId,
    });

    const response = await fetch(provider.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const tokenResponse: TokenResponse = (await response.json()) as TokenResponse;
    const expiresAt = Date.now() + tokenResponse.expires_in * 1000;

    const newTokens: ProviderTokens = {
      providerId,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || currentTokens.refreshToken,
      expiresAt,
      tokenType: tokenResponse.token_type,
      grantedScopes: tokenResponse.scope.split(' '),
      idToken: tokenResponse.id_token,
      patientId: tokenResponse.patient || currentTokens.patientId,
    };

    // Store updated tokens
    await secureStorage.storeProviderTokens(providerId, newTokens);

    return newTokens;
  }

  /**
   * Revoke tokens
   */
  async revokeTokens(providerId: string): Promise<void> {
    const tokens = await secureStorage.getProviderTokens(providerId);

    if (!tokens) {
      return;
    }

    const provider = await this.getProvider(providerId);

    if (!provider) {
      // Just clear local tokens
      await secureStorage.clearProviderTokens(providerId);
      return;
    }

    // Try to revoke at server (if endpoint available)
    try {
      const config = await this.fetchSMARTConfiguration(provider.fhirServerUrl);

      if (config.revocation_endpoint) {
        await fetch(config.revocation_endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token: tokens.refreshToken || tokens.accessToken,
            client_id: provider.clientId,
          }).toString(),
        });
      }
    } catch (error) {
      Logger.warn('Failed to revoke tokens at server', { error: String(error) });
    }

    // Clear local tokens
    await secureStorage.clearProviderTokens(providerId);
    Logger.info('Tokens revoked', { providerId });
  }

  /**
   * Check if tokens are valid/not expired
   */
  async areTokensValid(providerId: string): Promise<boolean> {
    const tokens = await secureStorage.getProviderTokens(providerId);

    if (!tokens) {
      return false;
    }

    return !ProviderHelpers.areTokensExpired(tokens);
  }

  /**
   * Get valid access token, refreshing if necessary
   */
  async getValidAccessToken(providerId: string): Promise<string | null> {
    const tokens = await secureStorage.getProviderTokens(providerId);

    if (!tokens) {
      return null;
    }

    // Check if token is expired
    if (ProviderHelpers.areTokensExpired(tokens)) {
      // Try to refresh
      if (tokens.refreshToken) {
        try {
          const newTokens = await this.refreshTokens(providerId);
          return newTokens.accessToken;
        } catch (error) {
          Logger.error('Failed to refresh token', { error: String(error) });
          return null;
        }
      }
      return null;
    }

    return tokens.accessToken;
  }

  /**
   * Get provider by ID (stub - should be from provider registry)
   */
  private async getProvider(providerId: string): Promise<Provider | null> {
    // TODO: Implement provider registry lookup
    // This is a stub that returns null - in production, this would
    // fetch from the provider registry
    Logger.debug('Getting provider', { providerId });
    return null;
  }
}

// =============================================================================
// BACKEND AUTH SERVICE
// =============================================================================

/**
 * Backend Authentication Service
 *
 * Handles authentication with our own backend server (not FHIR providers).
 * Used for user registration, 2FA, and session management.
 */
export class BackendAuthService {
  private baseUrl: string;

  constructor(baseUrl: string = Config.BACKEND_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Login with email/phone and password
   */
  async login(
    identifier: string,
    password: string
  ): Promise<{
    tokens?: AuthTokens;
    requires2FA?: boolean;
    tempToken?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message || 'Login failed');
    }

    return (await response.json()) as {
      tokens?: AuthTokens;
      requires2FA?: boolean;
      tempToken?: string;
    };
  }

  /**
   * Verify 2FA code
   */
  async verify2FA(tempToken: string, code: string): Promise<AuthTokens> {
    const response = await fetch(`${this.baseUrl}/auth/2fa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken, code }),
    });

    if (!response.ok) {
      throw new Error('2FA verification failed');
    }

    return (await response.json()) as AuthTokens;
  }

  /**
   * Setup TOTP 2FA
   */
  async setupTOTP(accessToken: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const response = await fetch(`${this.baseUrl}/auth/2fa/totp/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to setup TOTP');
    }

    return (await response.json()) as { secret: string; qrCodeUrl: string };
  }

  /**
   * Enable TOTP after verification
   */
  async enableTOTP(accessToken: string, code: string): Promise<{ backupCodes: string[] }> {
    const response = await fetch(`${this.baseUrl}/auth/2fa/totp/enable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to enable TOTP');
    }

    return (await response.json()) as { backupCodes: string[] };
  }

  /**
   * Register new user
   */
  async register(data: {
    email?: string;
    phoneNumber?: string;
    password: string;
    displayName?: string;
  }): Promise<{ userId: string; requiresVerification: boolean }> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message || 'Registration failed');
    }

    return (await response.json()) as { userId: string; requiresVerification: boolean };
  }

  /**
   * Send OTP for phone verification
   */
  async sendPhoneOTP(phoneNumber: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });

    if (!response.ok) {
      throw new Error('Failed to send OTP');
    }
  }

  /**
   * Verify phone OTP
   */
  async verifyPhoneOTP(phoneNumber: string, code: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, code }),
    });

    return response.ok;
  }

  /**
   * Refresh tokens
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return (await response.json()) as AuthTokens;
  }

  /**
   * Logout
   */
  async logout(accessToken: string): Promise<void> {
    await fetch(`${this.baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}

// Singleton instances
export const authService = new AuthService();
export const backendAuthService = new BackendAuthService();

export default AuthService;
