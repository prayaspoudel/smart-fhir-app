/**
 * Settings Screen
 *
 * App settings including appearance, security, notifications,
 * privacy, and about information.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppSelector, useAppDispatch } from '../../store';
import { selectIsDarkMode, toggleDarkMode } from '../../store/slices/uiSlice';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children, isDark }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{title}</Text>
    <View style={[styles.sectionContent, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      {children}
    </View>
  </View>
);

interface SettingsRowProps {
  icon: string;
  iconColor?: string;
  label: string;
  value?: string;
  showChevron?: boolean;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isDark: boolean;
  isLast?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  iconColor,
  label,
  value,
  showChevron = true,
  onPress,
  rightElement,
  isDark,
  isLast = false,
}) => (
  <TouchableOpacity
    style={[
      styles.row,
      !isLast && {
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#374151' : '#E5E7EB',
      },
    ]}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.rowLeft}>
      <View style={[styles.iconContainer, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
        <Icon name={icon} size={20} color={iconColor || (isDark ? '#60A5FA' : '#2563EB')} />
      </View>
      <Text style={[styles.rowLabel, { color: isDark ? '#F9FAFB' : '#111827' }]}>{label}</Text>
    </View>

    <View style={styles.rowRight}>
      {value && (
        <Text style={[styles.rowValue, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{value}</Text>
      )}
      {rightElement}
      {showChevron && onPress && (
        <Icon name="chevron-right" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
      )}
    </View>
  </TouchableOpacity>
);

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const isDark = useAppSelector(selectIsDarkMode);

  // Handle dark mode toggle
  const handleDarkModeToggle = useCallback(() => {
    dispatch(toggleDarkMode());
  }, [dispatch]);

  // Handle biometric toggle
  const handleBiometricSettings = useCallback(() => {
    navigation.navigate('BiometricSettings' as never);
  }, [navigation]);

  // Handle notifications settings
  const handleNotificationSettings = useCallback(() => {
    navigation.navigate('NotificationSettings' as never);
  }, [navigation]);

  // Handle privacy settings
  const handlePrivacySettings = useCallback(() => {
    navigation.navigate('PrivacySettings' as never);
  }, [navigation]);

  // Handle data export
  const handleExportData = useCallback(() => {
    Alert.alert('Export Data', 'Export all your health data in FHIR JSON format?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Export',
        onPress: () => {
          // In production, this would export data
          Alert.alert('Export Started', 'Your data export is being prepared.');
        },
      },
    ]);
  }, []);

  // Handle clear cache
  const handleClearCache = useCallback(() => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. You will need to sync again with your providers.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            // In production, this would clear the cache
            Alert.alert('Cache Cleared', 'All cached data has been cleared.');
          },
        },
      ]
    );
  }, []);

  // Handle delete account
  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Confirm Delete', 'Type DELETE to confirm account deletion', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'OK', onPress: () => {} },
            ]);
          },
        },
      ]
    );
  }, []);

  // Handle support
  const handleSupport = useCallback(() => {
    Linking.openURL('mailto:support@smartfhirapp.com');
  }, []);

  // Handle privacy policy
  const handlePrivacyPolicy = useCallback(() => {
    Linking.openURL('https://smartfhirapp.com/privacy');
  }, []);

  // Handle terms of service
  const handleTermsOfService = useCallback(() => {
    Linking.openURL('https://smartfhirapp.com/terms');
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Appearance */}
      <SettingsSection title="APPEARANCE" isDark={isDark}>
        <SettingsRow
          icon="theme-light-dark"
          label="Dark Mode"
          showChevron={false}
          rightElement={
            <Switch
              value={isDark}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          }
          isDark={isDark}
          isLast={true}
        />
      </SettingsSection>

      {/* Security */}
      <SettingsSection title="SECURITY" isDark={isDark}>
        <SettingsRow
          icon="fingerprint"
          label="Biometric Authentication"
          onPress={handleBiometricSettings}
          isDark={isDark}
        />
        <SettingsRow
          icon="lock-outline"
          label="Change Password"
          onPress={() => navigation.navigate('ChangePassword' as never)}
          isDark={isDark}
        />
        <SettingsRow
          icon="two-factor-authentication"
          label="Two-Factor Authentication"
          onPress={() => navigation.navigate('TwoFactorSettings' as never)}
          isDark={isDark}
          isLast={true}
        />
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="NOTIFICATIONS" isDark={isDark}>
        <SettingsRow
          icon="bell-outline"
          label="Push Notifications"
          onPress={handleNotificationSettings}
          isDark={isDark}
        />
        <SettingsRow
          icon="email-outline"
          label="Email Notifications"
          onPress={() => navigation.navigate('EmailSettings' as never)}
          isDark={isDark}
          isLast={true}
        />
      </SettingsSection>

      {/* Data & Privacy */}
      <SettingsSection title="DATA & PRIVACY" isDark={isDark}>
        <SettingsRow
          icon="shield-lock-outline"
          label="Privacy Settings"
          onPress={handlePrivacySettings}
          isDark={isDark}
        />
        <SettingsRow
          icon="download-outline"
          label="Export My Data"
          onPress={handleExportData}
          isDark={isDark}
        />
        <SettingsRow
          icon="cached"
          label="Clear Cache"
          onPress={handleClearCache}
          isDark={isDark}
          isLast={true}
        />
      </SettingsSection>

      {/* About */}
      <SettingsSection title="ABOUT" isDark={isDark}>
        <SettingsRow
          icon="information-outline"
          label="App Version"
          value="1.0.0"
          showChevron={false}
          isDark={isDark}
        />
        <SettingsRow
          icon="help-circle-outline"
          label="Help & Support"
          onPress={handleSupport}
          isDark={isDark}
        />
        <SettingsRow
          icon="file-document-outline"
          label="Privacy Policy"
          onPress={handlePrivacyPolicy}
          isDark={isDark}
        />
        <SettingsRow
          icon="file-certificate-outline"
          label="Terms of Service"
          onPress={handleTermsOfService}
          isDark={isDark}
          isLast={true}
        />
      </SettingsSection>

      {/* Danger Zone */}
      <SettingsSection title="DANGER ZONE" isDark={isDark}>
        <SettingsRow
          icon="delete-outline"
          iconColor="#EF4444"
          label="Delete Account"
          onPress={handleDeleteAccount}
          isDark={isDark}
          isLast={true}
        />
      </SettingsSection>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    fontSize: 14,
  },
});

export default SettingsScreen;
