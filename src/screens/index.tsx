/**
 * Screens Index
 *
 * Re-exports all screen components for convenient importing.
 * Full implementations are in their respective directories.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Generic placeholder screen component
const createPlaceholderScreen = (name: string) => {
  const PlaceholderScreen: React.FC = () => (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
    </View>
  );
  PlaceholderScreen.displayName = name;
  return PlaceholderScreen;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
});

// =========================================
// FULL IMPLEMENTATIONS
// =========================================

// Auth Screens
export { default as WelcomeScreen } from './auth/WelcomeScreen';
export { default as LoginScreen } from './auth/LoginScreen';

// Main Screens
export { default as DashboardScreen } from './main/DashboardScreen';

// Records Screens
export { default as VitalsScreen } from './records/VitalsScreen';
export { default as MedicationsScreen } from './records/MedicationsScreen';
export { default as LabResultsScreen } from './records/LabResultsScreen';
export { default as EncountersScreen } from './records/EncountersScreen';

// Provider Screens
export { default as ProvidersListScreen } from './providers/ProvidersListScreen';
export { default as AddProviderScreen } from './providers/AddProviderScreen';

// Settings Screens
export { default as SettingsScreen } from './settings/SettingsScreen';

// =========================================
// PLACEHOLDER SCREENS
// =========================================

// Auth Screens (placeholders)
export const ProviderSelectScreen = createPlaceholderScreen('ProviderSelectScreen');
export const SMARTLaunchScreen = createPlaceholderScreen('SMARTLaunchScreen');
export { default as TwoFactorAuthScreen } from './auth/TwoFactorAuthScreen';
export const TwoFactorSetupScreen = createPlaceholderScreen('TwoFactorSetupScreen');
export { default as BiometricSetupScreen } from './auth/BiometricSetupScreen';
export const ForgotPasswordScreen = createPlaceholderScreen('ForgotPasswordScreen');
export const ResetPasswordScreen = createPlaceholderScreen('ResetPasswordScreen');

// Records Screens (placeholders)
export const RecordsListScreen = createPlaceholderScreen('RecordsListScreen');
export const DiagnosticReportsScreen = createPlaceholderScreen('DiagnosticReportsScreen');
export const VitalDetailScreen = createPlaceholderScreen('VitalDetailScreen');
export const LabResultDetailScreen = createPlaceholderScreen('LabResultDetailScreen');
export const DiagnosticReportDetailScreen = createPlaceholderScreen('DiagnosticReportDetailScreen');
export const MedicationDetailScreen = createPlaceholderScreen('MedicationDetailScreen');
export const EncounterDetailScreen = createPlaceholderScreen('EncounterDetailScreen');
export const RecordSearchScreen = createPlaceholderScreen('RecordSearchScreen');

// Provider Screens (placeholders)
export const ProviderDetailScreen = createPlaceholderScreen('ProviderDetailScreen');
export const ProviderAuthScreen = createPlaceholderScreen('ProviderAuthScreen');
export const ProviderRecordsScreen = createPlaceholderScreen('ProviderRecordsScreen');
export const ManageConsentsScreen = createPlaceholderScreen('ManageConsentsScreen');
export const ProviderSyncScreen = createPlaceholderScreen('ProviderSyncScreen');

// Profile Screens (implementations)
import ProfileHomeScreenImpl from './profile/ProfileHomeScreen';
export { default as ProfileHomeScreen } from './profile/ProfileHomeScreen';
export { default as EditProfileScreen } from './profile/EditProfileScreen';
export { default as HealthProfileScreen } from './profile/HealthProfileScreen';
export { default as EmergencyContactsScreen } from './profile/EmergencyContactsScreen';
export const ProfileScreen = ProfileHomeScreenImpl;
export const SecuritySettingsScreen = createPlaceholderScreen('SecuritySettingsScreen');
export const NotificationSettingsScreen = createPlaceholderScreen('NotificationSettingsScreen');
export const PrivacySettingsScreen = createPlaceholderScreen('PrivacySettingsScreen');
export const ConsentManagementScreen = createPlaceholderScreen('ConsentManagementScreen');
export const DataExportScreen = createPlaceholderScreen('DataExportScreen');
export const AppSettingsScreen = createPlaceholderScreen('AppSettingsScreen');
export const AboutScreen = createPlaceholderScreen('AboutScreen');
export const HelpScreen = createPlaceholderScreen('HelpScreen');

// Modal Screens (placeholders)
export const ConsentModalScreen = createPlaceholderScreen('ConsentModalScreen');
export const ProviderAuthModalScreen = createPlaceholderScreen('ProviderAuthModalScreen');
export const RecordDetailModalScreen = createPlaceholderScreen('RecordDetailModalScreen');
export const PDFViewerScreen = createPlaceholderScreen('PDFViewerScreen');
export const ImageViewerScreen = createPlaceholderScreen('ImageViewerScreen');

// Settings Screens (placeholders)
export const SettingsHomeScreen = createPlaceholderScreen('SettingsHomeScreen');
export const AccountScreen = createPlaceholderScreen('AccountScreen');
export const SecurityScreen = createPlaceholderScreen('SecurityScreen');
export const NotificationsScreen = createPlaceholderScreen('NotificationsScreen');
export const PrivacyScreen = createPlaceholderScreen('PrivacyScreen');
export const AppearanceScreen = createPlaceholderScreen('AppearanceScreen');
export const LanguageScreen = createPlaceholderScreen('LanguageScreen');
export const DataManagementScreen = createPlaceholderScreen('DataManagementScreen');
export const LogsScreen = createPlaceholderScreen('LogsScreen');
export const DebugScreen = createPlaceholderScreen('DebugScreen');
