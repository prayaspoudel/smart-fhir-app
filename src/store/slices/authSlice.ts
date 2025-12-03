/**
 * Authentication Redux Slice
 *
 * Manages authentication state including:
 * - Authentication status
 * - User/patient information
 * - Session management
 * - 2FA state
 * - Biometric enrollment
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthTokens, Session, TOTPSetup } from '../../domain/entities/AuthEntities';
import { Patient } from '../../domain/entities/Patient';

// Biometric type
type BiometricType = 'none' | 'FaceID' | 'TouchID' | 'Fingerprint';

// Extended auth state for Redux
interface AuthSliceState {
  // Authentication
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // User info
  currentPatient: Patient | null;
  tokens: AuthTokens | null;

  // Session
  session: Session | null;
  sessionTimeout: number | null;
  sessionWarningShown: boolean;

  // 2FA
  requires2FA: boolean;
  twoFactorSetup: TOTPSetup | null;
  pendingAuthState: string | null; // Temporary state during 2FA flow

  // Biometric
  biometricEnabled: boolean;
  biometricType: BiometricType;

  // SMART on FHIR
  currentProviderId: string | null;
  pendingLaunchContext: {
    iss: string;
    launch?: string;
  } | null;
}

const initialState: AuthSliceState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,

  currentPatient: null,
  tokens: null,

  session: null,
  sessionTimeout: null,
  sessionWarningShown: false,

  requires2FA: false,
  twoFactorSetup: null,
  pendingAuthState: null,

  biometricEnabled: false,
  biometricType: 'none',

  currentProviderId: null,
  pendingLaunchContext: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearError: state => {
      state.error = null;
    },

    // Authentication
    loginStart: state => {
      state.isLoading = true;
      state.error = null;
    },

    loginSuccess: (
      state,
      action: PayloadAction<{
        patient: Patient;
        tokens: AuthTokens;
        session: Session;
        providerId: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.currentPatient = action.payload.patient;
      state.tokens = action.payload.tokens;
      state.session = action.payload.session;
      state.currentProviderId = action.payload.providerId;
      state.requires2FA = false;
      state.pendingAuthState = null;
    },

    loginRequires2FA: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.requires2FA = true;
      state.pendingAuthState = action.payload;
    },

    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = action.payload;
      state.tokens = null;
      state.session = null;
    },

    logout: state => {
      return {
        ...initialState,
        biometricEnabled: state.biometricEnabled,
        biometricType: state.biometricType,
      };
    },

    // 2FA
    set2FASetup: (state, action: PayloadAction<TOTPSetup | null>) => {
      state.twoFactorSetup = action.payload;
    },

    verify2FASuccess: state => {
      state.requires2FA = false;
      state.pendingAuthState = null;
    },

    // Session management
    updateSession: (state, action: PayloadAction<Session>) => {
      state.session = action.payload;
    },

    setSessionTimeout: (state, action: PayloadAction<number | null>) => {
      state.sessionTimeout = action.payload;
    },

    showSessionWarning: state => {
      state.sessionWarningShown = true;
    },

    hideSessionWarning: state => {
      state.sessionWarningShown = false;
    },

    sessionExpired: state => {
      state.isAuthenticated = false;
      state.session = null;
      state.tokens = null;
      state.error = 'Session expired. Please login again.';
    },

    // Token refresh
    updateTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
    },

    // Biometric
    setBiometricEnabled: (
      state,
      action: PayloadAction<{ enabled: boolean; type: BiometricType }>
    ) => {
      state.biometricEnabled = action.payload.enabled;
      state.biometricType = action.payload.type;
    },

    // SMART on FHIR launch
    setLaunchContext: (state, action: PayloadAction<{ iss: string; launch?: string } | null>) => {
      state.pendingLaunchContext = action.payload;
    },

    setCurrentProvider: (state, action: PayloadAction<string | null>) => {
      state.currentProviderId = action.payload;
    },

    // Patient update
    updatePatient: (state, action: PayloadAction<Patient>) => {
      state.currentPatient = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  loginStart,
  loginSuccess,
  loginRequires2FA,
  loginFailure,
  logout,
  set2FASetup,
  verify2FASuccess,
  updateSession,
  setSessionTimeout,
  showSessionWarning,
  hideSessionWarning,
  sessionExpired,
  updateTokens,
  setBiometricEnabled,
  setLaunchContext,
  setCurrentProvider,
  updatePatient,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectIsAuthenticated = (state: { auth: AuthSliceState }) =>
  state.auth.isAuthenticated;

export const selectCurrentPatient = (state: { auth: AuthSliceState }) => state.auth.currentPatient;

export const selectTokens = (state: { auth: AuthSliceState }) => state.auth.tokens;

export const selectSession = (state: { auth: AuthSliceState }) => state.auth.session;

export const selectRequires2FA = (state: { auth: AuthSliceState }) => state.auth.requires2FA;

export const selectBiometricEnabled = (state: { auth: AuthSliceState }) =>
  state.auth.biometricEnabled;

export const selectBiometricType = (state: { auth: AuthSliceState }) => state.auth.biometricType;

export const selectAuthLoading = (state: { auth: AuthSliceState }) => state.auth.isLoading;

export const selectAuthError = (state: { auth: AuthSliceState }) => state.auth.error;

export const selectCurrentProviderId = (state: { auth: AuthSliceState }) =>
  state.auth.currentProviderId;

export const selectSessionWarningShown = (state: { auth: AuthSliceState }) =>
  state.auth.sessionWarningShown;
