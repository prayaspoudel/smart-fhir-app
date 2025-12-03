/**
 * React Query Client Configuration
 *
 * Configures TanStack Query (React Query) with:
 * - Default query options
 * - Error handling
 * - Cache configuration
 * - Offline support
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { logger } from '../utils/logger';

// Create query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Cache time - how long inactive data stays in cache
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)

      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status === 401 || status === 403 || status === 404) {
            return false;
          }
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },

      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch options
      refetchOnWindowFocus: false, // Mobile apps don't have window focus
      refetchOnReconnect: true,
      refetchOnMount: true,

      // Network mode for offline support
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry mutations once
      retry: 1,

      // Network mode
      networkMode: 'offlineFirst',

      // Error handling
      onError: error => {
        logger.error('Mutation error', { error });
      },
    },
  },
});

// Query keys factory for type-safe query keys
export const queryKeys = {
  // Patient
  patient: {
    all: ['patient'] as const,
    detail: (patientId: string) => ['patient', patientId] as const,
    byProvider: (providerId: string) => ['patient', 'provider', providerId] as const,
  },

  // Observations
  observations: {
    all: ['observations'] as const,
    list: (filters?: Record<string, unknown>) => ['observations', 'list', filters] as const,
    byPatient: (patientId: string) => ['observations', 'patient', patientId] as const,
    byProvider: (providerId: string) => ['observations', 'provider', providerId] as const,
    byCategory: (category: string) => ['observations', 'category', category] as const,
    vitals: (patientId: string) => ['observations', 'vitals', patientId] as const,
    labs: (patientId: string) => ['observations', 'labs', patientId] as const,
    detail: (observationId: string) => ['observations', observationId] as const,
  },

  // Diagnostic Reports
  diagnosticReports: {
    all: ['diagnosticReports'] as const,
    list: (filters?: Record<string, unknown>) => ['diagnosticReports', 'list', filters] as const,
    byPatient: (patientId: string) => ['diagnosticReports', 'patient', patientId] as const,
    byProvider: (providerId: string) => ['diagnosticReports', 'provider', providerId] as const,
    detail: (reportId: string) => ['diagnosticReports', reportId] as const,
  },

  // Encounters
  encounters: {
    all: ['encounters'] as const,
    list: (filters?: Record<string, unknown>) => ['encounters', 'list', filters] as const,
    byPatient: (patientId: string) => ['encounters', 'patient', patientId] as const,
    byProvider: (providerId: string) => ['encounters', 'provider', providerId] as const,
    detail: (encounterId: string) => ['encounters', encounterId] as const,
  },

  // Medications
  medications: {
    all: ['medications'] as const,
    list: (filters?: Record<string, unknown>) => ['medications', 'list', filters] as const,
    byPatient: (patientId: string) => ['medications', 'patient', patientId] as const,
    byProvider: (providerId: string) => ['medications', 'provider', providerId] as const,
    active: (patientId: string) => ['medications', 'active', patientId] as const,
    detail: (medicationId: string) => ['medications', medicationId] as const,
  },

  // Consents
  consents: {
    all: ['consents'] as const,
    byPatient: (patientId: string) => ['consents', 'patient', patientId] as const,
    byProvider: (providerId: string) => ['consents', 'provider', providerId] as const,
    detail: (consentId: string) => ['consents', consentId] as const,
  },

  // Providers
  providers: {
    all: ['providers'] as const,
    detail: (providerId: string) => ['providers', providerId] as const,
    metadata: (providerId: string) => ['providers', 'metadata', providerId] as const,
    connection: (providerId: string) => ['providers', 'connection', providerId] as const,
  },

  // Auth
  auth: {
    session: ['auth', 'session'] as const,
    profile: ['auth', 'profile'] as const,
  },
};

// Invalidation helpers
export const invalidateQueries = {
  allPatientData: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.patient.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.observations.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.diagnosticReports.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.encounters.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.medications.all });
  },

  providerData: (providerId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.patient.byProvider(providerId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.observations.byProvider(providerId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.diagnosticReports.byProvider(providerId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.encounters.byProvider(providerId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.medications.byProvider(providerId) });
  },

  patientRecords: (patientId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.observations.byPatient(patientId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.diagnosticReports.byPatient(patientId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.encounters.byPatient(patientId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.medications.byPatient(patientId) });
  },
};

// Prefetch helpers
export const prefetchQueries = {
  patientDashboard: async (patientId: string, _providerId?: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.observations.vitals(patientId),
        staleTime: 60000,
        queryFn: () => Promise.resolve([]), // Will be overridden by actual hook
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.medications.active(patientId),
        staleTime: 60000,
        queryFn: () => Promise.resolve([]),
      }),
    ]);
  },
};

export { QueryClientProvider };
