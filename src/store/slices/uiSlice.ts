/**
 * UI Redux Slice
 *
 * Manages global UI state including:
 * - Theme (light/dark)
 * - Modal visibility
 * - Toast notifications
 * - Loading overlays
 * - Network connectivity
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface Modal {
  id: string;
  type: string;
  props?: Record<string, unknown>;
}

interface UISliceState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  isDarkMode: boolean;

  // Network
  isOnline: boolean;
  connectionType: string | null;

  // Global loading overlay
  isGlobalLoading: boolean;
  globalLoadingMessage: string | null;

  // Toasts
  toasts: Toast[];

  // Modals
  activeModals: Modal[];

  // Bottom sheet
  bottomSheetVisible: boolean;
  bottomSheetContent: string | null;
  bottomSheetProps?: Record<string, unknown>;

  // Keyboard
  keyboardVisible: boolean;
  keyboardHeight: number;

  // App state
  appState: 'active' | 'inactive' | 'background';

  // Onboarding
  hasCompletedOnboarding: boolean;

  // Accessibility
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;

  // Refresh control
  isRefreshing: boolean;
}

const initialState: UISliceState = {
  theme: 'system',
  isDarkMode: false,
  isOnline: true,
  connectionType: null,
  isGlobalLoading: false,
  globalLoadingMessage: null,
  toasts: [],
  activeModals: [],
  bottomSheetVisible: false,
  bottomSheetContent: null,
  bottomSheetProps: undefined,
  keyboardVisible: false,
  keyboardHeight: 0,
  appState: 'active',
  hasCompletedOnboarding: false,
  isScreenReaderEnabled: false,
  isReduceMotionEnabled: false,
  isRefreshing: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme
    setTheme: (state: UISliceState, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },

    setIsDarkMode: (state: UISliceState, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },

    toggleDarkMode: (state: UISliceState) => {
      state.isDarkMode = !state.isDarkMode;
      state.theme = state.isDarkMode ? 'dark' : 'light';
    },

    // Network
    setOnline: (state: UISliceState, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },

    setConnectionType: (state: UISliceState, action: PayloadAction<string | null>) => {
      state.connectionType = action.payload;
    },

    // Global loading
    showGlobalLoading: (state: UISliceState, action: PayloadAction<string | undefined>) => {
      state.isGlobalLoading = true;
      state.globalLoadingMessage = action.payload || null;
    },

    hideGlobalLoading: (state: UISliceState) => {
      state.isGlobalLoading = false;
      state.globalLoadingMessage = null;
    },

    // Toasts
    showToast: (state: UISliceState, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      state.toasts.push({ ...action.payload, id });
    },

    hideToast: (state: UISliceState, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },

    clearAllToasts: (state: UISliceState) => {
      state.toasts = [];
    },

    // Modals
    showModal: (state: UISliceState, action: PayloadAction<Omit<Modal, 'id'>>) => {
      const id = `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      state.activeModals.push({ ...action.payload, id });
    },

    hideModal: (state: UISliceState, action: PayloadAction<string>) => {
      state.activeModals = state.activeModals.filter(m => m.id !== action.payload);
    },

    hideTopModal: (state: UISliceState) => {
      state.activeModals.pop();
    },

    clearAllModals: (state: UISliceState) => {
      state.activeModals = [];
    },

    // Bottom sheet
    showBottomSheet: (
      state: UISliceState,
      action: PayloadAction<{ content: string; props?: Record<string, unknown> }>
    ) => {
      state.bottomSheetVisible = true;
      state.bottomSheetContent = action.payload.content;
      state.bottomSheetProps = action.payload.props;
    },

    hideBottomSheet: (state: UISliceState) => {
      state.bottomSheetVisible = false;
      state.bottomSheetContent = null;
      state.bottomSheetProps = undefined;
    },

    // Keyboard
    setKeyboardVisible: (
      state: UISliceState,
      action: PayloadAction<{ visible: boolean; height: number }>
    ) => {
      state.keyboardVisible = action.payload.visible;
      state.keyboardHeight = action.payload.height;
    },

    // App state
    setAppState: (
      state: UISliceState,
      action: PayloadAction<'active' | 'inactive' | 'background'>
    ) => {
      state.appState = action.payload;
    },

    // Onboarding
    setOnboardingCompleted: (state: UISliceState, action: PayloadAction<boolean>) => {
      state.hasCompletedOnboarding = action.payload;
    },

    // Accessibility
    setScreenReaderEnabled: (state: UISliceState, action: PayloadAction<boolean>) => {
      state.isScreenReaderEnabled = action.payload;
    },

    setReduceMotionEnabled: (state: UISliceState, action: PayloadAction<boolean>) => {
      state.isReduceMotionEnabled = action.payload;
    },

    // Refresh
    setRefreshing: (state: UISliceState, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },

    // Reset
    resetUI: () => initialState,
  },
});

export const {
  setTheme,
  setIsDarkMode,
  toggleDarkMode,
  setOnline,
  setConnectionType,
  showGlobalLoading,
  hideGlobalLoading,
  showToast,
  hideToast,
  clearAllToasts,
  showModal,
  hideModal,
  hideTopModal,
  clearAllModals,
  showBottomSheet,
  hideBottomSheet,
  setKeyboardVisible,
  setAppState,
  setOnboardingCompleted,
  setScreenReaderEnabled,
  setReduceMotionEnabled,
  setRefreshing,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectTheme = (state: { ui: UISliceState }) => state.ui.theme;

export const selectIsDarkMode = (state: { ui: UISliceState }) => state.ui.isDarkMode;

export const selectIsOnline = (state: { ui: UISliceState }) => state.ui.isOnline;

export const selectConnectionType = (state: { ui: UISliceState }) => state.ui.connectionType;

export const selectIsGlobalLoading = (state: { ui: UISliceState }) => state.ui.isGlobalLoading;

export const selectGlobalLoadingMessage = (state: { ui: UISliceState }) =>
  state.ui.globalLoadingMessage;

export const selectToasts = (state: { ui: UISliceState }) => state.ui.toasts;

export const selectActiveModals = (state: { ui: UISliceState }) => state.ui.activeModals;

export const selectBottomSheetVisible = (state: { ui: UISliceState }) =>
  state.ui.bottomSheetVisible;

export const selectBottomSheetContent = (state: { ui: UISliceState }) =>
  state.ui.bottomSheetContent;

export const selectKeyboardVisible = (state: { ui: UISliceState }) => state.ui.keyboardVisible;

export const selectKeyboardHeight = (state: { ui: UISliceState }) => state.ui.keyboardHeight;

export const selectAppState = (state: { ui: UISliceState }) => state.ui.appState;

export const selectHasCompletedOnboarding = (state: { ui: UISliceState }) =>
  state.ui.hasCompletedOnboarding;

export const selectIsScreenReaderEnabled = (state: { ui: UISliceState }) =>
  state.ui.isScreenReaderEnabled;

export const selectIsReduceMotionEnabled = (state: { ui: UISliceState }) =>
  state.ui.isReduceMotionEnabled;

export const selectIsRefreshing = (state: { ui: UISliceState }) => state.ui.isRefreshing;
