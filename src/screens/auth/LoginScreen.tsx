/**
 * Login Screen
 *
 * Authentication screen with:
 * - Email/password login (if using direct auth)
 * - SMART on FHIR OAuth2 (primary method)
 * - Biometric authentication option
 * - Remember me toggle
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { AuthStackScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  loginRequires2FA,
  selectAuthLoading,
  selectAuthError,
  selectBiometricEnabled,
} from '../../store/slices/authSlice';
import { selectIsDarkMode } from '../../store/slices/uiSlice';
import { useSnackbar } from '../../context/SnackbarContext';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<AuthStackScreenProps<'Login'>['navigation']>();
  const route = useRoute<AuthStackScreenProps<'Login'>['route']>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { showError, showInfo } = useSnackbar();

  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);
  const biometricEnabled = useAppSelector(selectBiometricEnabled);
  const isDark = useAppSelector(selectIsDarkMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      showError('Please enter your email and password');
      return;
    }

    dispatch(loginStart());

    try {
      // In production, this would call the auth service
      // For now, simulate authentication
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));

      // Simulated response - in real app, this comes from the server
      // Always require 2FA for security (in production, this would be based on user settings)
      const response = {
        requires2FA: true,
        tempToken: 'temp_token_123',
        patientId: 'patient_123',
      };

      if (response.requires2FA) {
        dispatch(loginRequires2FA(response.tempToken));
        navigation.navigate('TwoFactorAuth', {
          tempToken: response.tempToken,
          patientId: response.patientId,
        });
      } else {
        // Full login success
        dispatch(
          loginSuccess({
            patient: {
              resourceType: 'Patient',
              id: response.patientId,
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
              userId: response.patientId,
              createdAt: new Date().toISOString(),
              lastActivityAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 3600000).toISOString(),
              deviceInfo: {
                deviceId: 'device_123',
                deviceName: 'iPhone 15',
                platform: 'ios',
                osVersion: '17.0',
                appVersion: '1.0.0',
              },
              isActive: true,
              isCurrent: true,
            },
            providerId: route.params?.providerId || 'default',
          })
        );
      }
    } catch (error) {
      dispatch(loginFailure('Authentication failed. Please try again.'));
    }
  }, [email, password, dispatch, navigation, route.params]);

  const handleBiometricLogin = useCallback(async () => {
    // In production, use react-native-biometrics
    showInfo('Biometric authentication would be triggered here');
  }, [showInfo]);

  const handleSMARTLogin = useCallback(() => {
    navigation.navigate('ProviderSelect');
  }, [navigation]);

  const handleForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: isDark ? '#1F2937' : '#EFF6FF' }]}>
            <Icon name="heart-pulse" size={40} color="#2563EB" />
          </View>
          <Text style={[styles.title, { color: isDark ? '#F9FAFB' : '#111827' }]}>Sign In</Text>
          <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Access your medical records securely
          </Text>
        </View>

        {/* SMART on FHIR Login Button */}
        <TouchableOpacity style={styles.smartButton} onPress={handleSMARTLogin} activeOpacity={0.8}>
          <Icon name="hospital-building" size={20} color="#FFFFFF" />
          <Text style={styles.smartButtonText}>Sign in with Healthcare Provider</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
          <Text style={[styles.dividerText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            or sign in with email
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
        </View>

        {/* Error Message */}
        {authError && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        )}

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: isDark ? '#D1D5DB' : '#374151' }]}>Email</Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                borderColor: isDark ? '#374151' : '#D1D5DB',
              },
            ]}
          >
            <Icon name="email-outline" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <TextInput
              style={[styles.input, { color: isDark ? '#F9FAFB' : '#111827' }]}
              placeholder="Enter your email"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: isDark ? '#D1D5DB' : '#374151' }]}>
            Password
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                borderColor: isDark ? '#374151' : '#D1D5DB',
              },
            ]}
          >
            <Icon name="lock-outline" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <TextInput
              style={[styles.input, { color: isDark ? '#F9FAFB' : '#111827' }]}
              placeholder="Enter your password"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              textContentType="password"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={isDark ? '#6B7280' : '#9CA3AF'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Remember Me & Forgot Password */}
        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.rememberMe} onPress={() => setRememberMe(!rememberMe)}>
            <Icon
              name={rememberMe ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={20}
              color={rememberMe ? '#2563EB' : isDark ? '#6B7280' : '#9CA3AF'}
            />
            <Text style={[styles.rememberMeText, { color: isDark ? '#D1D5DB' : '#374151' }]}>
              Remember me
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[
            styles.loginButton,
            (isLoading || !email || !password) && styles.loginButtonDisabled,
          ]}
          onPress={handleLogin}
          disabled={isLoading || !email || !password}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Biometric Login */}
        {biometricEnabled && (
          <TouchableOpacity
            style={[
              styles.biometricButton,
              {
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                borderColor: isDark ? '#374151' : '#E5E7EB',
              },
            ]}
            onPress={handleBiometricLogin}
          >
            <Icon name="fingerprint" size={24} color={isDark ? '#60A5FA' : '#2563EB'} />
            <Text style={[styles.biometricButtonText, { color: isDark ? '#F9FAFB' : '#111827' }]}>
              Use Biometrics
            </Text>
          </TouchableOpacity>
        )}

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Icon name="shield-check" size={16} color="#22C55E" />
          <Text style={[styles.securityNoteText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            Your data is encrypted and secure
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  smartButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  smartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    fontSize: 14,
    marginLeft: 8,
  },
  forgotPasswordText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityNoteText: {
    fontSize: 12,
    marginLeft: 6,
  },
});

export default LoginScreen;
