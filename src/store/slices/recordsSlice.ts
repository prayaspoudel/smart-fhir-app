/**
 * Medical Records Redux Slice
 *
 * Manages patient medical records including:
 * - Patient demographics
 * - Observations (vitals, lab results)
 * - Diagnostic reports
 * - Encounters
 * - Medications
 * - Record sync status by provider
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Patient } from '../../domain/entities/Patient';
import { Observation } from '../../domain/entities/Observation';
import { DiagnosticReport } from '../../domain/entities/DiagnosticReport';
import { Encounter } from '../../domain/entities/Encounter';
import { MedicationRequest } from '../../domain/entities/MedicationRequest';

// Records organized by provider
interface ProviderRecords {
  providerId: string;
  providerName: string;
  lastSync: string | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;

  patient: Patient | null;
  observations: Observation[];
  diagnosticReports: DiagnosticReport[];
  encounters: Encounter[];
  medications: MedicationRequest[];
}

interface RecordsSliceState {
  // Records by provider
  recordsByProvider: Record<string, ProviderRecords>;

  // Active filters
  dateRange: {
    start: string | null;
    end: string | null;
  };
  categoryFilter: string | null;
  statusFilter: string | null;

  // Loading states
  isLoading: boolean;
  isSyncing: boolean;

  // Errors
  error: string | null;

  // Selected records for detail view
  selectedObservationId: string | null;
  selectedReportId: string | null;
  selectedEncounterId: string | null;
  selectedMedicationId: string | null;

  // View preferences
  viewMode: 'timeline' | 'category' | 'provider';
}

const initialState: RecordsSliceState = {
  recordsByProvider: {},
  dateRange: { start: null, end: null },
  categoryFilter: null,
  statusFilter: null,
  isLoading: false,
  isSyncing: false,
  error: null,
  selectedObservationId: null,
  selectedReportId: null,
  selectedEncounterId: null,
  selectedMedicationId: null,
  viewMode: 'timeline',
};

const recordsSlice = createSlice({
  name: 'records',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state: RecordsSliceState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setSyncing: (state: RecordsSliceState, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },

    setError: (state: RecordsSliceState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Initialize provider records
    initializeProvider: (
      state: RecordsSliceState,
      action: PayloadAction<{ providerId: string; providerName: string }>
    ) => {
      if (!state.recordsByProvider[action.payload.providerId]) {
        state.recordsByProvider[action.payload.providerId] = {
          providerId: action.payload.providerId,
          providerName: action.payload.providerName,
          lastSync: null,
          syncStatus: 'idle',
          patient: null,
          observations: [],
          diagnosticReports: [],
          encounters: [],
          medications: [],
        };
      }
    },

    // Provider sync status
    setProviderSyncing: (state: RecordsSliceState, action: PayloadAction<string>) => {
      const records = state.recordsByProvider[action.payload];
      if (records) {
        records.syncStatus = 'syncing';
        records.errorMessage = undefined;
      }
    },

    setProviderSyncSuccess: (
      state: RecordsSliceState,
      action: PayloadAction<{ providerId: string; lastSync: string }>
    ) => {
      const records = state.recordsByProvider[action.payload.providerId];
      if (records) {
        records.syncStatus = 'success';
        records.lastSync = action.payload.lastSync;
      }
    },

    setProviderSyncError: (
      state: RecordsSliceState,
      action: PayloadAction<{ providerId: string; error: string }>
    ) => {
      const records = state.recordsByProvider[action.payload.providerId];
      if (records) {
        records.syncStatus = 'error';
        records.errorMessage = action.payload.error;
      }
    },

    // Patient
    setPatient: (
      state: RecordsSliceState,
      action: PayloadAction<{ providerId: string; patient: Patient }>
    ) => {
      const records = state.recordsByProvider[action.payload.providerId];
      if (records) {
        records.patient = action.payload.patient;
      }
    },

    // Observations
    setObservations: (
      state: RecordsSliceState,
      action: PayloadAction<{ providerId: string; observations: Observation[] }>
    ) => {
      const records = state.recordsByProvider[action.payload.providerId];
      if (records) {
        records.observations = action.payload.observations;
      }
    },

    addObservation: (
      state: RecordsSliceState,
      action: PayloadAction<{ providerId: string; observation: Observation }>
    ) => {
      const records = state.recordsByProvider[action.payload.providerId];
      if (records) {
        const exists = records.observations.some(o => o.id === action.payload.observation.id);
        if (!exists) {
          records.observations.push(action.payload.observation);
        }
      }
    },

    // Diagnostic Reports
    setDiagnosticReports: (
      state: RecordsSliceState,
      action: PayloadAction<{ providerId: string; reports: DiagnosticReport[] }>
    ) => {
      const records = state.recordsByProvider[action.payload.providerId];
      if (records) {
        records.diagnosticReports = action.payload.reports;
      }
    },

    addDiagnosticReport: (
      state: RecordsSliceState,
      action: PayloadAction<{ providerId: string; report: DiagnosticReport }>
    ) => {
      const records = state.recordsByProvider[action.payload.providerId];
      if (records) {
        const exists = records.diagnosticReports.some(r => r.id === action.payload.report.id);
        if (!exists) {
          records.diagnosticReports.push(action.payload.report);
        }
      }
    },

    // Encounters
    setEncounters: (
      state: RecordsSliceState,
      action: PayloadAction<{ providerId: string; encounters: Encounter[] }>
    ) => {
      const records = state.recordsByProvider[action.payload.providerId];
      if (records) {
        records.encounters = action.payload.encounters;
      }
    },

    addEncounter: (
      state: RecordsSliceState,
      action: PayloadAction<{ providerId: string; encounter: Encounter }>
    ) => {
      const records = state.recordsByProvider[action.payload.providerId];
      if (records) {
        const exists = records.encounters.some(e => e.id === action.payload.encounter.id);
        if (!exists) {
          records.encounters.push(action.payload.encounter);
        }
      }
    },

    // Medications
    setMedications: (
      state: RecordsSliceState,
      action: PayloadAction<{ providerId: string; medications: MedicationRequest[] }>
    ) => {
      const records = state.recordsByProvider[action.payload.providerId];
      if (records) {
        records.medications = action.payload.medications;
      }
    },

    addMedication: (
      state: RecordsSliceState,
      action: PayloadAction<{ providerId: string; medication: MedicationRequest }>
    ) => {
      const records = state.recordsByProvider[action.payload.providerId];
      if (records) {
        const exists = records.medications.some(m => m.id === action.payload.medication.id);
        if (!exists) {
          records.medications.push(action.payload.medication);
        }
      }
    },

    // Filters
    setDateRange: (
      state: RecordsSliceState,
      action: PayloadAction<{ start: string | null; end: string | null }>
    ) => {
      state.dateRange = action.payload;
    },

    setCategoryFilter: (state: RecordsSliceState, action: PayloadAction<string | null>) => {
      state.categoryFilter = action.payload;
    },

    setStatusFilter: (state: RecordsSliceState, action: PayloadAction<string | null>) => {
      state.statusFilter = action.payload;
    },

    clearFilters: (state: RecordsSliceState) => {
      state.dateRange = { start: null, end: null };
      state.categoryFilter = null;
      state.statusFilter = null;
    },

    // Selection
    setSelectedObservation: (state: RecordsSliceState, action: PayloadAction<string | null>) => {
      state.selectedObservationId = action.payload;
    },

    setSelectedReport: (state: RecordsSliceState, action: PayloadAction<string | null>) => {
      state.selectedReportId = action.payload;
    },

    setSelectedEncounter: (state: RecordsSliceState, action: PayloadAction<string | null>) => {
      state.selectedEncounterId = action.payload;
    },

    setSelectedMedication: (state: RecordsSliceState, action: PayloadAction<string | null>) => {
      state.selectedMedicationId = action.payload;
    },

    clearSelection: (state: RecordsSliceState) => {
      state.selectedObservationId = null;
      state.selectedReportId = null;
      state.selectedEncounterId = null;
      state.selectedMedicationId = null;
    },

    // View mode
    setViewMode: (
      state: RecordsSliceState,
      action: PayloadAction<'timeline' | 'category' | 'provider'>
    ) => {
      state.viewMode = action.payload;
    },

    // Remove provider records
    removeProviderRecords: (state: RecordsSliceState, action: PayloadAction<string>) => {
      delete state.recordsByProvider[action.payload];
    },

    // Reset
    resetRecords: () => initialState,
  },
});

export const {
  setLoading,
  setSyncing,
  setError,
  initializeProvider,
  setProviderSyncing,
  setProviderSyncSuccess,
  setProviderSyncError,
  setPatient,
  setObservations,
  addObservation,
  setDiagnosticReports,
  addDiagnosticReport,
  setEncounters,
  addEncounter,
  setMedications,
  addMedication,
  setDateRange,
  setCategoryFilter,
  setStatusFilter,
  clearFilters,
  setSelectedObservation,
  setSelectedReport,
  setSelectedEncounter,
  setSelectedMedication,
  clearSelection,
  setViewMode,
  removeProviderRecords,
  resetRecords,
} = recordsSlice.actions;

export default recordsSlice.reducer;

// Selectors
export const selectRecordsByProvider = (state: { records: RecordsSliceState }) =>
  state.records.recordsByProvider;

export const selectProviderRecords = (state: { records: RecordsSliceState }, providerId: string) =>
  state.records.recordsByProvider[providerId];

export const selectAllObservations = (state: { records: RecordsSliceState }) =>
  Object.values(state.records.recordsByProvider).flatMap(r => r.observations);

export const selectAllDiagnosticReports = (state: { records: RecordsSliceState }) =>
  Object.values(state.records.recordsByProvider).flatMap(r => r.diagnosticReports);

export const selectAllEncounters = (state: { records: RecordsSliceState }) =>
  Object.values(state.records.recordsByProvider).flatMap(r => r.encounters);

export const selectAllMedications = (state: { records: RecordsSliceState }) =>
  Object.values(state.records.recordsByProvider).flatMap(r => r.medications);

export const selectRecordsLoading = (state: { records: RecordsSliceState }) =>
  state.records.isLoading;

export const selectRecordsSyncing = (state: { records: RecordsSliceState }) =>
  state.records.isSyncing;

export const selectRecordsError = (state: { records: RecordsSliceState }) => state.records.error;

export const selectViewMode = (state: { records: RecordsSliceState }) => state.records.viewMode;

export const selectDateRange = (state: { records: RecordsSliceState }) => state.records.dateRange;

export const selectCategoryFilter = (state: { records: RecordsSliceState }) =>
  state.records.categoryFilter;

// Get timeline of all records sorted by date
export const selectTimelineRecords = (state: { records: RecordsSliceState }) => {
  interface TimelineItem {
    type: 'observation' | 'report' | 'encounter' | 'medication';
    date: string;
    providerId: string;
    providerName: string;
    data: Observation | DiagnosticReport | Encounter | MedicationRequest;
  }

  const timeline: TimelineItem[] = [];

  Object.values(state.records.recordsByProvider).forEach(providerRecords => {
    // Add observations
    providerRecords.observations.forEach(obs => {
      timeline.push({
        type: 'observation',
        date: obs.effectiveDateTime || obs.issued || '',
        providerId: providerRecords.providerId,
        providerName: providerRecords.providerName,
        data: obs,
      });
    });

    // Add diagnostic reports
    providerRecords.diagnosticReports.forEach(report => {
      timeline.push({
        type: 'report',
        date: report.effectiveDateTime || report.issued || '',
        providerId: providerRecords.providerId,
        providerName: providerRecords.providerName,
        data: report,
      });
    });

    // Add encounters
    providerRecords.encounters.forEach(enc => {
      timeline.push({
        type: 'encounter',
        date: enc.period?.start || '',
        providerId: providerRecords.providerId,
        providerName: providerRecords.providerName,
        data: enc,
      });
    });

    // Add medications
    providerRecords.medications.forEach(med => {
      timeline.push({
        type: 'medication',
        date: med.authoredOn || '',
        providerId: providerRecords.providerId,
        providerName: providerRecords.providerName,
        data: med,
      });
    });
  });

  // Sort by date descending
  return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
