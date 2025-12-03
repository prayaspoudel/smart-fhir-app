/**
 * Navigation Types
 *
 * Type definitions for React Navigation including:
 * - Stack navigators
 * - Tab navigators
 * - Route params
 */

import { NavigatorScreenParams, CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ============================================================================
// Root Stack - Main app navigation
// ============================================================================

export type RootStackParamList = {
  // Auth flow
  Auth: NavigatorScreenParams<AuthStackParamList>;

  // Main app (after authentication)
  Main: NavigatorScreenParams<MainTabParamList>;

  // Modal screens
  ConsentModal: {
    consentId: string;
    providerId: string;
    providerName: string;
  };
  ProviderAuthModal: {
    providerId: string;
    iss: string;
    launch?: string;
  };
  RecordDetailModal: {
    resourceType: 'Observation' | 'DiagnosticReport' | 'Encounter' | 'MedicationRequest';
    resourceId: string;
    providerId: string;
  };
  PDFViewer: {
    url: string;
    title: string;
  };
  ImageViewer: {
    urls: string[];
    initialIndex?: number;
    title?: string;
  };

  // Settings stack
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

// ============================================================================
// Auth Stack - Authentication flow
// ============================================================================

export type AuthStackParamList = {
  Welcome: undefined;
  Login: {
    providerId?: string;
    returnScreen?: string;
  };
  ProviderSelect: undefined;
  SMARTLaunch: {
    iss: string;
    launch?: string;
  };
  TwoFactorAuth: {
    tempToken: string;
    patientId: string;
  };
  TwoFactorSetup: {
    patientId: string;
  };
  BiometricSetup: undefined;
  ForgotPassword: undefined;
  ResetPassword: {
    token: string;
    email: string;
  };
};

// ============================================================================
// Main Tab Navigator - Bottom tabs after login
// ============================================================================

export type MainTabParamList = {
  Dashboard: undefined;
  Records: NavigatorScreenParams<RecordsStackParamList>;
  Providers: NavigatorScreenParams<ProvidersStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// ============================================================================
// Records Stack - Medical records navigation
// ============================================================================

export type RecordsStackParamList = {
  RecordsList: {
    category?: string;
    providerId?: string;
  };
  Vitals: {
    providerId?: string;
  };
  LabResults: {
    providerId?: string;
  };
  DiagnosticReports: {
    providerId?: string;
  };
  Medications: {
    providerId?: string;
    showActive?: boolean;
  };
  Encounters: {
    providerId?: string;
  };

  // Detail screens
  VitalDetail: {
    observationId: string;
    providerId: string;
  };
  LabResultDetail: {
    observationId: string;
    providerId: string;
  };
  DiagnosticReportDetail: {
    reportId: string;
    providerId: string;
  };
  MedicationDetail: {
    medicationId: string;
    providerId: string;
  };
  EncounterDetail: {
    encounterId: string;
    providerId: string;
  };

  // Search
  RecordSearch: {
    initialQuery?: string;
  };
};

// ============================================================================
// Providers Stack - Healthcare provider management
// ============================================================================

export type ProvidersStackParamList = {
  ProvidersList: undefined;
  ProviderDetail: {
    providerId: string;
    providerName?: string;
  };
  AddProvider: undefined;
  ProviderAuth: {
    providerId: string;
    iss: string;
    launch?: string;
  };
  ProviderRecords: {
    providerId: string;
    providerName: string;
  };
  ManageConsents: {
    providerId: string;
  };
  ProviderSync: {
    providerId: string;
    providerName: string;
  };
};

// ============================================================================
// Profile Stack - User profile and settings
// ============================================================================

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileHome: undefined;
  EditProfile: undefined;
  HealthProfile: undefined;
  EmergencyContacts: undefined;
  SecuritySettings: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  ConsentManagement: undefined;
  DataExport: undefined;
  AppSettings: undefined;
  About: undefined;
  Help: undefined;
  // Health Information
  Allergies: undefined;
  Medications: undefined;
  Conditions: undefined;
  // Emergency & Legal
  Insurance: undefined;
  AdvanceDirectives: undefined;
  // Privacy & Data
  Privacy: undefined;
  ExportData: undefined;
};

// ============================================================================
// Settings Stack (modal navigation)
// ============================================================================

export type SettingsStackParamList = {
  SettingsMain: undefined;
  SettingsHome: undefined;
  Account: undefined;
  Security: undefined;
  SecuritySettings: undefined;
  Notifications: undefined;
  NotificationSettings: undefined;
  Privacy: undefined;
  PrivacySettings: undefined;
  Appearance: undefined;
  Language: undefined;
  DataManagement: undefined;
  Logs: undefined;
  About: undefined;
  Debug: undefined; // Only in __DEV__
};

// ============================================================================
// Screen Props Types - For typing screen components
// ============================================================================

// Root stack
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

// Auth stack
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<AuthStackParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

// Main tabs
export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

// Records stack
export type RecordsStackScreenProps<T extends keyof RecordsStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<RecordsStackParamList, T>,
  MainTabScreenProps<'Records'>
>;

// Providers stack
export type ProvidersStackScreenProps<T extends keyof ProvidersStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProvidersStackParamList, T>,
    MainTabScreenProps<'Providers'>
  >;

// Profile stack
export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, T>,
  MainTabScreenProps<'Profile'>
>;

// Settings stack
export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<SettingsStackParamList, T>,
  RootStackScreenProps<'Settings'>
>;

// ============================================================================
// Navigation Prop Types - For useNavigation hook
// ============================================================================

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// ============================================================================
// Deep Link Configuration
// ============================================================================

export const linking: {
  prefixes: string[];
  config: {
    screens: Record<string, unknown>;
  };
} = {
  prefixes: ['smartfhir://', 'https://smartfhir.app', 'https://*.smartfhir.app'],
  config: {
    screens: {
      Auth: {
        screens: {
          SMARTLaunch: 'launch',
          Login: 'login',
        },
      },
      Main: {
        screens: {
          Dashboard: 'dashboard',
          Records: {
            screens: {
              RecordsList: 'records',
              Vitals: 'vitals',
              LabResults: 'labs',
              Medications: 'medications',
              Encounters: 'encounters',
            },
          },
          Providers: {
            screens: {
              ProvidersList: 'providers',
              ProviderDetail: 'provider/:providerId',
            },
          },
        },
      },
      RecordDetailModal: 'record/:resourceType/:resourceId',
      ConsentModal: 'consent/:consentId',
    },
  },
};
