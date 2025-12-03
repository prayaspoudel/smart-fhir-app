/**
 * Two Factor Authentication Screen
 *
 * Handles TOTP verification during login flow.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppSelector, useAppDispatch } from '../../store';
import { selectIsDarkMode } from '../../store/slices/uiSlice';
import type { AuthStackParamList } from '../../navigation/types';

type TwoFactorNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'TwoFactorAuth'>;
type TwoFactorRouteProp = RouteProp<AuthStackParamList, 'TwoFactorAuth'>;

const CODE_LENGTH = 6;

const TwoFactorAuthScreen: React.FC = () => {
  const navigation = useNavigation<TwoFactorNavigationProp>();
  const _route = useRoute<TwoFactorRouteProp>();
  const insets = useSafeAreaInsets();
  const _dispatch = useAppDispatch();

  const isDarkMode = useAppSelector(selectIsDarkMode);

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [resendTimer]);

  const handleCodeChange = useCallback(
    (index: number, value: string) => {
      if (value.length > 1) {
        // Handle paste
        const pastedCode = value.slice(0, CODE_LENGTH).split('');
        const newCode = [...code];
        pastedCode.forEach((digit, i) => {
          if (index + i < CODE_LENGTH) {
            newCode[index + i] = digit;
          }
        });
        setCode(newCode);
        const lastIndex = Math.min(index + pastedCode.length, CODE_LENGTH - 1);
        inputRefs.current[lastIndex]?.focus();
      } else {
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < CODE_LENGTH - 1) {
          inputRefs.current[index + 1]?.focus();
        }
      }
      setError(null);
    },
    [code]
  );

  const handleKeyPress = useCallback(
    (index: number, key: string) => {
      if (key === 'Backspace' && !code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [code]
  );

  const handleVerify = useCallback(async () => {
    const fullCode = code.join('');
    if (fullCode.length !== CODE_LENGTH) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Simulate verification
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));

      // Check if code is correct (mock: any code works for demo)
      if (fullCode === '000000') {
        setError('Invalid verification code. Please try again.');
        setIsVerifying(false);
        return;
      }

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      });
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  }, [code, navigation]);

  const handleResendCode = useCallback(() => {
    if (resendTimer > 0) return;

    Alert.alert('Code Sent', 'A new verification code has been sent to your authenticator app.');
    setResendTimer(30);
    setCode(Array(CODE_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  }, [resendTimer]);

  const handleUseBackupCode = useCallback(() => {
    Alert.prompt(
      'Enter Backup Code',
      'Enter one of your backup codes to verify your identity.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: (backupCode?: string) => {
            if (backupCode) {
              // Handle backup code verification
              console.log('Verifying backup code:', backupCode);
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  }, []);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#F9FAFB' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}
      >
        {/* Icon */}
        <View
          style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
        >
          <Icon name="shield-lock" size={48} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
          Two-Factor Authentication
        </Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
          Enter the 6-digit code from your authenticator app
        </Text>

        {/* Code Input */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={[
                styles.codeInput,
                {
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  borderColor: error
                    ? '#EF4444'
                    : digit
                      ? isDarkMode
                        ? '#60A5FA'
                        : '#3B82F6'
                      : isDarkMode
                        ? '#4B5563'
                        : '#E5E7EB',
                  color: isDarkMode ? '#F9FAFB' : '#111827',
                },
              ]}
              value={digit}
              onChangeText={value => handleCodeChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={6}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify</Text>
          )}
        </TouchableOpacity>

        {/* Resend Code */}
        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendCode}
          disabled={resendTimer > 0}
        >
          <Text
            style={[
              styles.resendText,
              {
                color: resendTimer > 0 ? (isDarkMode ? '#6B7280' : '#9CA3AF') : '#3B82F6',
              },
            ]}
          >
            {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive the code? Resend"}
          </Text>
        </TouchableOpacity>

        {/* Use Backup Code */}
        <TouchableOpacity style={styles.backupButton} onPress={handleUseBackupCode}>
          <Icon name="key" size={16} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
          <Text style={[styles.backupText, { color: isDarkMode ? '#60A5FA' : '#3B82F6' }]}>
            Use a backup code instead
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  codeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
  verifyButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    padding: 12,
    marginBottom: 16,
  },
  resendText: {
    fontSize: 14,
  },
  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  backupText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TwoFactorAuthScreen;
