/**
 * FHIR Data Hooks
 *
 * React Query hooks for fetching FHIR resources with:
 * - Automatic caching
 * - Background refetching
 * - Optimistic updates
 * - Error handling
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryClient';
import { Patient } from '../domain/entities/Patient';
import { Observation } from '../domain/entities/Observation';
import { DiagnosticReport } from '../domain/entities/DiagnosticReport';
import { Encounter } from '../domain/entities/Encounter';
import { MedicationRequest } from '../domain/entities/MedicationRequest';
import { useAppSelector } from '../store';
import { selectTokens } from '../store/slices/authSlice';

// Helper to make authenticated FHIR requests
const fhirFetch = async <T>(url: string, accessToken: string): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/fhir+json',
    },
  });

  if (!response.ok) {
    throw new Error(`FHIR request failed: ${response.status}`);
  }

  return response.json();
};

// Helper to extract resources from Bundle
const extractFromBundle = <T>(bundle: { entry?: Array<{ resource: T }> }): T[] => {
  return bundle.entry?.map(e => e.resource) || [];
};

// ============================================================================
// Patient Hooks
// ============================================================================

interface UsePatientOptions {
  patientId: string;
  providerBaseUrl: string;
  enabled?: boolean;
}

export const usePatient = ({ patientId, providerBaseUrl, enabled = true }: UsePatientOptions) => {
  const tokens = useAppSelector(selectTokens);

  return useQuery({
    queryKey: queryKeys.patient.detail(patientId),
    queryFn: async (): Promise<Patient> => {
      if (!tokens?.accessToken) {
        throw new Error('No access token available');
      }
      return fhirFetch<Patient>(`${providerBaseUrl}/Patient/${patientId}`, tokens.accessToken);
    },
    enabled: enabled && !!tokens?.accessToken && !!patientId,
    staleTime: 10 * 60 * 1000, // 10 minutes - patient data doesn't change often
  });
};

// ============================================================================
// Observation Hooks
// ============================================================================

interface UseObservationsOptions {
  patientId: string;
  providerBaseUrl: string;
  category?: string;
  code?: string;
  dateFrom?: string;
  dateTo?: string;
  count?: number;
  enabled?: boolean;
}

export const useObservations = ({
  patientId,
  providerBaseUrl,
  category,
  code,
  dateFrom,
  dateTo,
  count = 20,
  enabled = true,
}: UseObservationsOptions) => {
  const tokens = useAppSelector(selectTokens);

  return useQuery({
    queryKey: queryKeys.observations.list({ patientId, category, code, dateFrom, dateTo }),
    queryFn: async (): Promise<Observation[]> => {
      if (!tokens?.accessToken) {
        throw new Error('No access token available');
      }

      const params = new URLSearchParams();
      params.set('patient', patientId);
      if (category) params.set('category', category);
      if (code) params.set('code', code);
      if (dateFrom) params.set('date', `ge${dateFrom}`);
      if (dateTo) params.set('date', `le${dateTo}`);
      params.set('_count', String(count));
      params.set('_sort', '-date');

      const bundle = await fhirFetch<{ entry?: Array<{ resource: Observation }> }>(
        `${providerBaseUrl}/Observation?${params.toString()}`,
        tokens.accessToken
      );

      return extractFromBundle(bundle);
    },
    enabled: enabled && !!tokens?.accessToken && !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useVitals = (patientId: string, providerBaseUrl: string, enabled = true) => {
  return useObservations({
    patientId,
    providerBaseUrl,
    category: 'vital-signs',
    enabled,
  });
};

export const useLabResults = (patientId: string, providerBaseUrl: string, enabled = true) => {
  return useObservations({
    patientId,
    providerBaseUrl,
    category: 'laboratory',
    enabled,
  });
};

export const useObservation = (observationId: string, providerBaseUrl: string, enabled = true) => {
  const tokens = useAppSelector(selectTokens);

  return useQuery({
    queryKey: queryKeys.observations.detail(observationId),
    queryFn: async (): Promise<Observation> => {
      if (!tokens?.accessToken) {
        throw new Error('No access token available');
      }
      return fhirFetch<Observation>(
        `${providerBaseUrl}/Observation/${observationId}`,
        tokens.accessToken
      );
    },
    enabled: enabled && !!tokens?.accessToken && !!observationId,
  });
};

// ============================================================================
// Diagnostic Report Hooks
// ============================================================================

interface UseDiagnosticReportsOptions {
  patientId: string;
  providerBaseUrl: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  count?: number;
  enabled?: boolean;
}

export const useDiagnosticReports = ({
  patientId,
  providerBaseUrl,
  category,
  status,
  dateFrom,
  dateTo,
  count = 20,
  enabled = true,
}: UseDiagnosticReportsOptions) => {
  const tokens = useAppSelector(selectTokens);

  return useQuery({
    queryKey: queryKeys.diagnosticReports.list({ patientId, category, status, dateFrom, dateTo }),
    queryFn: async (): Promise<DiagnosticReport[]> => {
      if (!tokens?.accessToken) {
        throw new Error('No access token available');
      }

      const params = new URLSearchParams();
      params.set('patient', patientId);
      if (category) params.set('category', category);
      if (status) params.set('status', status);
      if (dateFrom) params.set('date', `ge${dateFrom}`);
      if (dateTo) params.set('date', `le${dateTo}`);
      params.set('_count', String(count));
      params.set('_sort', '-date');

      const bundle = await fhirFetch<{ entry?: Array<{ resource: DiagnosticReport }> }>(
        `${providerBaseUrl}/DiagnosticReport?${params.toString()}`,
        tokens.accessToken
      );

      return extractFromBundle(bundle);
    },
    enabled: enabled && !!tokens?.accessToken && !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDiagnosticReport = (reportId: string, providerBaseUrl: string, enabled = true) => {
  const tokens = useAppSelector(selectTokens);

  return useQuery({
    queryKey: queryKeys.diagnosticReports.detail(reportId),
    queryFn: async (): Promise<DiagnosticReport> => {
      if (!tokens?.accessToken) {
        throw new Error('No access token available');
      }
      return fhirFetch<DiagnosticReport>(
        `${providerBaseUrl}/DiagnosticReport/${reportId}`,
        tokens.accessToken
      );
    },
    enabled: enabled && !!tokens?.accessToken && !!reportId,
  });
};

// ============================================================================
// Encounter Hooks
// ============================================================================

interface UseEncountersOptions {
  patientId: string;
  providerBaseUrl: string;
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  count?: number;
  enabled?: boolean;
}

export const useEncounters = ({
  patientId,
  providerBaseUrl,
  status,
  type,
  dateFrom,
  dateTo,
  count = 20,
  enabled = true,
}: UseEncountersOptions) => {
  const tokens = useAppSelector(selectTokens);

  return useQuery({
    queryKey: queryKeys.encounters.list({ patientId, status, type, dateFrom, dateTo }),
    queryFn: async (): Promise<Encounter[]> => {
      if (!tokens?.accessToken) {
        throw new Error('No access token available');
      }

      const params = new URLSearchParams();
      params.set('patient', patientId);
      if (status) params.set('status', status);
      if (type) params.set('type', type);
      if (dateFrom) params.set('date', `ge${dateFrom}`);
      if (dateTo) params.set('date', `le${dateTo}`);
      params.set('_count', String(count));
      params.set('_sort', '-date');

      const bundle = await fhirFetch<{ entry?: Array<{ resource: Encounter }> }>(
        `${providerBaseUrl}/Encounter?${params.toString()}`,
        tokens.accessToken
      );

      return extractFromBundle(bundle);
    },
    enabled: enabled && !!tokens?.accessToken && !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEncounter = (encounterId: string, providerBaseUrl: string, enabled = true) => {
  const tokens = useAppSelector(selectTokens);

  return useQuery({
    queryKey: queryKeys.encounters.detail(encounterId),
    queryFn: async (): Promise<Encounter> => {
      if (!tokens?.accessToken) {
        throw new Error('No access token available');
      }
      return fhirFetch<Encounter>(
        `${providerBaseUrl}/Encounter/${encounterId}`,
        tokens.accessToken
      );
    },
    enabled: enabled && !!tokens?.accessToken && !!encounterId,
  });
};

// ============================================================================
// Medication Hooks
// ============================================================================

interface UseMedicationsOptions {
  patientId: string;
  providerBaseUrl: string;
  status?: string;
  count?: number;
  enabled?: boolean;
}

export const useMedications = ({
  patientId,
  providerBaseUrl,
  status,
  count = 20,
  enabled = true,
}: UseMedicationsOptions) => {
  const tokens = useAppSelector(selectTokens);

  return useQuery({
    queryKey: queryKeys.medications.list({ patientId, status }),
    queryFn: async (): Promise<MedicationRequest[]> => {
      if (!tokens?.accessToken) {
        throw new Error('No access token available');
      }

      const params = new URLSearchParams();
      params.set('patient', patientId);
      if (status) params.set('status', status);
      params.set('_count', String(count));
      params.set('_sort', '-authoredon');

      const bundle = await fhirFetch<{ entry?: Array<{ resource: MedicationRequest }> }>(
        `${providerBaseUrl}/MedicationRequest?${params.toString()}`,
        tokens.accessToken
      );

      return extractFromBundle(bundle);
    },
    enabled: enabled && !!tokens?.accessToken && !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useActiveMedications = (
  patientId: string,
  providerBaseUrl: string,
  enabled = true
) => {
  return useMedications({
    patientId,
    providerBaseUrl,
    status: 'active',
    enabled,
  });
};

export const useMedication = (medicationId: string, providerBaseUrl: string, enabled = true) => {
  const tokens = useAppSelector(selectTokens);

  return useQuery({
    queryKey: queryKeys.medications.detail(medicationId),
    queryFn: async (): Promise<MedicationRequest> => {
      if (!tokens?.accessToken) {
        throw new Error('No access token available');
      }
      return fhirFetch<MedicationRequest>(
        `${providerBaseUrl}/MedicationRequest/${medicationId}`,
        tokens.accessToken
      );
    },
    enabled: enabled && !!tokens?.accessToken && !!medicationId,
  });
};

// ============================================================================
// Combined Dashboard Hook
// ============================================================================

interface UseDashboardDataOptions {
  patientId: string;
  providerBaseUrl: string;
  enabled?: boolean;
}

export const useDashboardData = ({
  patientId,
  providerBaseUrl,
  enabled = true,
}: UseDashboardDataOptions) => {
  const patient = usePatient({ patientId, providerBaseUrl, enabled });
  const vitals = useVitals(patientId, providerBaseUrl, enabled);
  const medications = useActiveMedications(patientId, providerBaseUrl, enabled);
  const encounters = useEncounters({
    patientId,
    providerBaseUrl,
    count: 5,
    enabled,
  });
  const reports = useDiagnosticReports({
    patientId,
    providerBaseUrl,
    count: 5,
    enabled,
  });

  const isLoading =
    patient.isLoading ||
    vitals.isLoading ||
    medications.isLoading ||
    encounters.isLoading ||
    reports.isLoading;

  const isError =
    patient.isError ||
    vitals.isError ||
    medications.isError ||
    encounters.isError ||
    reports.isError;

  const error =
    patient.error || vitals.error || medications.error || encounters.error || reports.error;

  const refetchAll = async () => {
    await Promise.all([
      patient.refetch(),
      vitals.refetch(),
      medications.refetch(),
      encounters.refetch(),
      reports.refetch(),
    ]);
  };

  return {
    patient: patient.data,
    vitals: vitals.data || [],
    medications: medications.data || [],
    encounters: encounters.data || [],
    reports: reports.data || [],
    isLoading,
    isError,
    error,
    refetchAll,
  };
};
