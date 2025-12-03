/**
 * Providers Redux Slice
 *
 * Manages healthcare provider state including:
 * - List of registered providers
 * - Provider connections status
 * - Active provider selection
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Provider } from '../../domain/entities/Provider';

// Provider with extra UI status
interface ProviderWithStatus extends Provider {
  lastSync: string | null;
  errorMessage?: string;
}

interface ProvidersSliceState {
  // List of all registered providers
  providers: ProviderWithStatus[];

  // Currently selected provider for viewing
  activeProviderId: string | null;

  // Loading states
  isLoading: boolean;
  isSyncing: boolean;

  // Errors
  error: string | null;

  // Search/filter
  searchQuery: string;
}

const initialState: ProvidersSliceState = {
  providers: [],
  activeProviderId: null,
  isLoading: false,
  isSyncing: false,
  error: null,
  searchQuery: '',
};

const providersSlice = createSlice({
  name: 'providers',
  initialState,
  reducers: {
    // Loading
    setLoading: (state: ProvidersSliceState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setSyncing: (state: ProvidersSliceState, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },

    setError: (state: ProvidersSliceState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Providers CRUD
    setProviders: (state: ProvidersSliceState, action: PayloadAction<Provider[]>) => {
      state.providers = action.payload.map(p => ({
        ...p,
        lastSync: null,
      }));
      state.isLoading = false;
    },

    addProvider: (state: ProvidersSliceState, action: PayloadAction<Provider>) => {
      const exists = state.providers.some(p => p.id === action.payload.id);
      if (!exists) {
        state.providers.push({
          ...action.payload,
          lastSync: null,
        });
      }
    },

    updateProvider: (state: ProvidersSliceState, action: PayloadAction<Provider>) => {
      const index = state.providers.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.providers[index] = {
          ...state.providers[index],
          ...action.payload,
        };
      }
    },

    removeProvider: (state: ProvidersSliceState, action: PayloadAction<string>) => {
      state.providers = state.providers.filter(p => p.id !== action.payload);
      if (state.activeProviderId === action.payload) {
        state.activeProviderId = null;
      }
    },

    // Connection status
    setProviderConnecting: (state: ProvidersSliceState, action: PayloadAction<string>) => {
      const provider = state.providers.find(p => p.id === action.payload);
      if (provider) {
        provider.connectionStatus = 'connecting';
        provider.errorMessage = undefined;
      }
    },

    setProviderConnected: (
      state: ProvidersSliceState,
      action: PayloadAction<{ providerId: string; lastSync: string }>
    ) => {
      const provider = state.providers.find(p => p.id === action.payload.providerId);
      if (provider) {
        provider.connectionStatus = 'connected';
        provider.lastSync = action.payload.lastSync;
        provider.errorMessage = undefined;
      }
    },

    setProviderDisconnected: (state: ProvidersSliceState, action: PayloadAction<string>) => {
      const provider = state.providers.find(p => p.id === action.payload);
      if (provider) {
        provider.connectionStatus = 'disconnected';
      }
    },

    setProviderError: (
      state: ProvidersSliceState,
      action: PayloadAction<{ providerId: string; error: string }>
    ) => {
      const provider = state.providers.find(p => p.id === action.payload.providerId);
      if (provider) {
        provider.connectionStatus = 'error';
        provider.errorMessage = action.payload.error;
      }
    },

    // Active provider
    setActiveProvider: (state: ProvidersSliceState, action: PayloadAction<string | null>) => {
      state.activeProviderId = action.payload;
    },

    // Search/filter
    setSearchQuery: (state: ProvidersSliceState, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    // Reset
    resetProviders: () => initialState,
  },
});

export const {
  setLoading,
  setSyncing,
  setError,
  setProviders,
  addProvider,
  updateProvider,
  removeProvider,
  setProviderConnecting,
  setProviderConnected,
  setProviderDisconnected,
  setProviderError,
  setActiveProvider,
  setSearchQuery,
  resetProviders,
} = providersSlice.actions;

export default providersSlice.reducer;

// Selectors
export const selectAllProviders = (state: { providers: ProvidersSliceState }) =>
  state.providers.providers;

export const selectConnectedProviders = (state: { providers: ProvidersSliceState }) =>
  state.providers.providers.filter(p => p.connectionStatus === 'connected');

export const selectActiveProvider = (state: { providers: ProvidersSliceState }) =>
  state.providers.providers.find(p => p.id === state.providers.activeProviderId);

export const selectProvidersLoading = (state: { providers: ProvidersSliceState }) =>
  state.providers.isLoading;

export const selectProvidersSyncing = (state: { providers: ProvidersSliceState }) =>
  state.providers.isSyncing;

export const selectProvidersError = (state: { providers: ProvidersSliceState }) =>
  state.providers.error;

export const selectFilteredProviders = (state: { providers: ProvidersSliceState }) => {
  let filtered = state.providers.providers;

  // Apply search filter
  if (state.providers.searchQuery) {
    const query = state.providers.searchQuery.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
  }

  return filtered;
};
