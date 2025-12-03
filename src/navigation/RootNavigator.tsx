/**
 * Root Navigator
 *
 * Main navigation container with:
 * - Auth stack (unauthenticated users)
 * - Main tab navigator (authenticated users)
 * - Modal screens
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootStackParamList, linking } from './types';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import SettingsNavigator from './SettingsNavigator';

// Modal screens
import ConsentModalScreen from '../screens/modals/ConsentModalScreen';
import ProviderAuthModalScreen from '../screens/modals/ProviderAuthModalScreen';
import RecordDetailModalScreen from '../screens/modals/RecordDetailModalScreen';
import PDFViewerScreen from '../screens/modals/PDFViewerScreen';
import ImageViewerScreen from '../screens/modals/ImageViewerScreen';

import { useAppSelector } from '../store';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { selectIsDarkMode } from '../store/slices/uiSlice';
import { getWebSocketService } from '../data/websocket/WebSocketService';
import { getPushNotificationService } from '../data/notifications/PushNotificationService';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Custom navigation theme
const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2563EB', // Blue-600
    background: '#F9FAFB', // Gray-50
    card: '#FFFFFF',
    text: '#111827', // Gray-900
    border: '#E5E7EB', // Gray-200
    notification: '#EF4444', // Red-500
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#3B82F6', // Blue-500
    background: '#111827', // Gray-900
    card: '#1F2937', // Gray-800
    text: '#F9FAFB', // Gray-50
    border: '#374151', // Gray-700
    notification: '#EF4444', // Red-500
  },
};

const RootNavigator: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isDarkMode = useAppSelector(selectIsDarkMode);

  const [isReady, setIsReady] = useState(false);

  // Initialize services on mount
  useEffect(() => {
    const initServices = async () => {
      // Initialize push notifications
      const notificationService = getPushNotificationService();
      await notificationService.initialize();

      setIsReady(true);
    };

    initServices();

    return () => {
      // Cleanup on unmount
      getWebSocketService().disconnect();
    };
  }, []);

  // Determine which theme to use
  const navigationTheme = isDarkMode ? CustomDarkTheme : LightTheme;

  if (!isReady) {
    // Could show a splash screen here
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#111827' : '#F9FAFB'}
      />
      <NavigationContainer
        theme={navigationTheme}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        linking={linking as any}
        onStateChange={state => {
          // Could track screen views for analytics
          if (__DEV__) {
            const currentRoute = state?.routes[state.index];
            console.log('Navigation state:', currentRoute?.name);
          }
        }}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: Platform.OS === 'ios' ? 'default' : 'fade',
          }}
        >
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Main" component={MainTabNavigator} />
              <Stack.Screen
                name="Settings"
                component={SettingsNavigator}
                options={{
                  presentation: 'modal',
                }}
              />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          )}

          {/* Modal screens - available in both authenticated and unauthenticated states */}
          <Stack.Group
            screenOptions={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          >
            <Stack.Screen
              name="ConsentModal"
              component={ConsentModalScreen}
              options={{
                title: 'Consent Request',
              }}
            />
            <Stack.Screen
              name="ProviderAuthModal"
              component={ProviderAuthModalScreen}
              options={{
                title: 'Connect Provider',
              }}
            />
            <Stack.Screen
              name="RecordDetailModal"
              component={RecordDetailModalScreen}
              options={{
                title: 'Record Details',
              }}
            />
            <Stack.Screen
              name="PDFViewer"
              component={PDFViewerScreen}
              options={{
                presentation: 'fullScreenModal',
              }}
            />
            <Stack.Screen
              name="ImageViewer"
              component={ImageViewerScreen}
              options={{
                presentation: 'fullScreenModal',
                animation: 'fade',
              }}
            />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default RootNavigator;
