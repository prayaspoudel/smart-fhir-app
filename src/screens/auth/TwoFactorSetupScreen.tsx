/**
 * Two Factor Setup Screen
 *
 * Allows users to set up two-factor authentication.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Button, Input } from '../../components/ui';

type Props = NativeStackScreenProps<AuthStackParamList, 'TwoFactorSetup'>;

const TwoFactorSetupScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState<'intro' | 'qr' | 'verify'>('intro');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock QR code data - in production, this would come from the backend
  const qrCodeSecret = 'JBSWY3DPEHPK3PXP';

  const handleContinue = () => {
    if (step === 'intro') {
      setStep('qr');
    } else if (step === 'qr') {
      setStep('verify');
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate verification
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));

      // In production, verify the code with the backend
      if (verificationCode === '123456') {
        navigation.navigate('BiometricSetup');
      } else {
        setError('Invalid verification code. Try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('BiometricSetup');
  };

  const renderIntro = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>🔐</Text>
      </View>
      <Text style={styles.title}>Secure Your Account</Text>
      <Text style={styles.description}>
        Two-factor authentication adds an extra layer of security to your account by requiring a
        verification code in addition to your password.
      </Text>
      <View style={styles.benefitsList}>
        <Text style={styles.benefitItem}>✓ Protect against unauthorized access</Text>
        <Text style={styles.benefitItem}>✓ Secure your health data</Text>
        <Text style={styles.benefitItem}>✓ Get alerts for login attempts</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Set Up 2FA" onPress={handleContinue} variant="primary" />
        <Button
          title="Skip for Now"
          onPress={handleSkip}
          variant="ghost"
          style={styles.skipButton}
        />
      </View>
    </View>
  );

  const renderQRCode = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Scan QR Code</Text>
      <Text style={styles.description}>
        Open your authenticator app (like Google Authenticator or Authy) and scan this QR code.
      </Text>
      <View style={styles.qrContainer}>
        {/* In production, this would be an actual QR code */}
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrPlaceholderText}>QR Code</Text>
        </View>
      </View>
      <View style={styles.secretContainer}>
        <Text style={styles.secretLabel}>Or enter this code manually:</Text>
        <Text style={styles.secretCode}>{qrCodeSecret}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Continue" onPress={handleContinue} variant="primary" />
      </View>
    </View>
  );

  const renderVerify = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Verify Setup</Text>
      <Text style={styles.description}>
        Enter the 6-digit code from your authenticator app to verify the setup.
      </Text>
      <Input
        label="Verification Code"
        value={verificationCode}
        onChangeText={setVerificationCode}
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        error={error ?? undefined}
        autoFocus
      />
      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? 'Verifying...' : 'Verify'}
          onPress={handleVerify}
          disabled={isLoading || verificationCode.length !== 6}
          variant="primary"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 'intro' && renderIntro()}
        {step === 'qr' && renderQRCode()}
        {step === 'verify' && renderVerify()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconText: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  benefitsList: {
    alignSelf: 'stretch',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  benefitItem: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },
  qrContainer: {
    marginBottom: 24,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  qrPlaceholderText: {
    fontSize: 18,
    color: '#6B7280',
  },
  secretContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  secretLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  secretCode: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: '600',
    color: '#1F2937',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
  buttonContainer: {
    width: '100%',
    paddingTop: 16,
  },
  skipButton: {
    marginTop: 12,
  },
});

export default TwoFactorSetupScreen;
