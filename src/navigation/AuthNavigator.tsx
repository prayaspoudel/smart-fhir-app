/**
 * Auth Navigator
 *
 * Authentication flow navigation including:
 * - Welcome/landing screen
 * - Provider selection
 * - SMART on FHIR launch
 * - Login
 * - 2FA verification
 * - Biometric setup
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';

// Screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ProviderSelectScreen from '../screens/auth/ProviderSelectScreen';
import SMARTLaunchScreen from '../screens/auth/SMARTLaunchScreen';
import TwoFactorAuthScreen from '../screens/auth/TwoFactorAuthScreen';
import TwoFactorSetupScreen from '../screens/auth/TwoFactorSetupScreen';
import BiometricSetupScreen from '../screens/auth/BiometricSetupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: '#2563EB',
        headerStyle: {
          backgroundColor: '#F9FAFB',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: '#F9FAFB',
        },
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="ProviderSelect"
        component={ProviderSelectScreen}
        options={{
          title: 'Select Provider',
          headerLargeTitle: true,
        }}
      />

      <Stack.Screen
        name="SMARTLaunch"
        component={SMARTLaunchScreen}
        options={{
          title: 'Connecting...',
          headerBackVisible: true,
        }}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Sign In',
        }}
      />

      <Stack.Screen
        name="TwoFactorAuth"
        component={TwoFactorAuthScreen}
        options={{
          title: 'Two-Factor Authentication',
          headerBackVisible: false, // Can't go back from 2FA
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="TwoFactorSetup"
        component={TwoFactorSetupScreen}
        options={{
          title: 'Set Up 2FA',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="BiometricSetup"
        component={BiometricSetupScreen}
        options={{
          title: 'Biometric Setup',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'Reset Password',
        }}
      />

      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          title: 'New Password',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
