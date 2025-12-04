/**
 * Biometric Setup Screen
 *
 * Guides users through enabling Face ID/Touch ID for quick app access.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppSelector, useAppDispatch } from '../../store';
import { selectIsDarkMode } from '../../store/slices/uiSlice';
import { loginSuccess } from '../../store/slices/authSlice';
import { useBiometric } from '../../hooks';
import type { AuthStackParamList } from '../../navigation/types';

type BiometricSetupNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'BiometricSetup'>;

const BiometricSetupScreen: React.FC = () => {
  const _navigation = useNavigation<BiometricSetupNavigationProp>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const isDarkMode = useAppSelector(selectIsDarkMode);
  const { capabilities, authenticate, error: biometricError } = useBiometric();
  const { biometryType, isAvailable } = capabilities;

  const [isEnabling, setIsEnabling] = useState(false);

  const getBiometricName = useCallback((): string => {
    switch (biometryType) {
      case 'FaceID':
        return 'Face ID';
      case 'TouchID':
        return 'Touch ID';
      case 'Fingerprint':
        return 'Fingerprint';
      default:
        return 'Biometric';
    }
  }, [biometryType]);

  const getBiometricIcon = useCallback((): string => {
    switch (biometryType) {
      case 'FaceID':
        return 'face-recognition';
      case 'TouchID':
      case 'Fingerprint':
        return 'fingerprint';
      default:
        return 'lock';
    }
  }, [biometryType]);

  // Helper to complete authentication
  const completeAuthentication = useCallback(() => {
    dispatch(
      loginSuccess({
        patient: {
          resourceType: 'Patient',
          id: 'patient_123',
          name: [{ family: 'Doe', given: ['John'] }],
        },
        tokens: {
          accessToken: 'access_token_123',
          refreshToken: 'refresh_token_123',
          accessTokenExpiresAt: Date.now() + 3600000,
          refreshTokenExpiresAt: Date.now() + 86400000,
          tokenType: 'Bearer',
          idToken: undefined,
        },
        session: {
          id: 'session_123',
          userId: 'patient_123',
          createdAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          deviceInfo: {
            deviceId: 'device_123',
            deviceName: 'Mobile Device',
            platform: 'ios',
            osVersion: '17.0',
            appVersion: '1.0.0',
          },
          isActive: true,
          isCurrent: true,
        },
        providerId: 'default',
      })
    );
  }, [dispatch]);

  const handleEnableBiometric = useCallback(async () => {
    if (!isAvailable) {
      Alert.alert(
        'Not Available',
        `${getBiometricName()} is not available on this device. Please check your device settings.`
      );
      return;
    }

    setIsEnabling(true);

    try {
      // First authenticate to confirm identity
      const success = await authenticate(`Confirm your identity to enable ${getBiometricName()}`);

      if (!success) {
        Alert.alert('Authentication Failed', biometricError || 'Please try again.');
        return;
      }

      Alert.alert('Success', `${getBiometricName()} has been enabled for quick login.`, [
        {
          text: 'Continue',
          onPress: () => {
            // Complete authentication - RootNavigator will automatically show Main
            completeAuthentication();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsEnabling(false);
    }
  }, [isAvailable, authenticate, biometricError, getBiometricName, completeAuthentication]);

  const handleSkip = useCallback(() => {
    Alert.alert('Skip Biometric Setup?', 'You can enable biometric login later in Settings.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Skip',
        onPress: () => {
          // Complete authentication - RootNavigator will automatically show Main
          completeAuthentication();
        },
      },
    ]);
  }, [completeAuthentication]);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#F9FAFB' }]}>
      <View
        style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 }]}
      >
        {/* Icon */}
        <View
          style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
        >
          <Icon name={getBiometricIcon()} size={64} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
          Enable {getBiometricName()}
        </Text>

        <Text style={[styles.subtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
          Use {getBiometricName()} to quickly and securely access your health records without
          entering your password each time.
        </Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <View
              style={[styles.featureIcon, { backgroundColor: isDarkMode ? '#1F2937' : '#E0F2FE' }]}
            >
              <Icon name="lightning-bolt" size={20} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                Quick Access
              </Text>
              <Text
                style={[styles.featureDescription, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}
              >
                Log in instantly without typing your password
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View
              style={[styles.featureIcon, { backgroundColor: isDarkMode ? '#1F2937' : '#E0F2FE' }]}
            >
              <Icon name="shield-check" size={20} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                Secure Authentication
              </Text>
              <Text
                style={[styles.featureDescription, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}
              >
                Your biometric data never leaves your device
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View
              style={[styles.featureIcon, { backgroundColor: isDarkMode ? '#1F2937' : '#E0F2FE' }]}
            >
              <Icon name="lock" size={20} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                Privacy Protected
              </Text>
              <Text
                style={[styles.featureDescription, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}
              >
                HIPAA-compliant security for your health data
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.enableButton, isEnabling && styles.enableButtonDisabled]}
            onPress={handleEnableBiometric}
            disabled={isEnabling}
          >
            {isEnabling ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Icon name={getBiometricIcon()} size={20} color="#FFFFFF" />
                <Text style={styles.enableButtonText}>Enable {getBiometricName()}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={[styles.skipButtonText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>

        {/* Note */}
        <View style={styles.noteContainer}>
          <Icon name="information-outline" size={16} color={isDarkMode ? '#6B7280' : '#9CA3AF'} />
          <Text style={[styles.noteText, { color: isDarkMode ? '#6B7280' : '#9CA3AF' }]}>
            You can change this setting anytime in the Security section of Settings.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  featuresContainer: {
    width: '100%',
    gap: 20,
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  enableButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  enableButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipButtonText: {
    fontSize: 16,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 'auto',
    paddingHorizontal: 16,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default BiometricSetupScreen;
