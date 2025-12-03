/**
 * SMART on FHIR Mobile App
 *
 * Main application entry point.
 *
 * Features:
 * - HL7 FHIR R4 compliant
 * - OAuth2 SMART on FHIR authentication
 * - Multi-provider EMR integration
 * - End-to-end encryption
 * - Biometric authentication
 * - Real-time updates via WebSocket
 * - Push notifications (APNS/FCM)
 */

import React, { useEffect } from 'react';
import { LogBox, AppState, AppStateStatus } from 'react-native';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { store } from './store';
import { queryClient } from './query/queryClient';
import RootNavigator from './navigation/RootNavigator';
import { setAppState } from './store/slices/uiSlice';
import { Logger } from './utils/logger';

// Ignore certain warnings in development
if (__DEV__) {
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'VirtualizedLists should never be nested',
  ]);
}

const App: React.FC = () => {
  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      Logger.debug('App state changed', { state: nextState });
      // Only dispatch valid states
      if (nextState === 'active' || nextState === 'inactive' || nextState === 'background') {
        store.dispatch(setAppState(nextState));
      }

      // Invalidate queries when app comes to foreground
      if (nextState === 'active') {
        // Could trigger a background sync here
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
        </QueryClientProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
