/**
 * SMART on FHIR Launch Screen
 *
 * Handles the SMART on FHIR OAuth2 launch sequence.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components/ui';

type Props = NativeStackScreenProps<AuthStackParamList, 'SMARTLaunch'>;

const SMARTLaunchScreen: React.FC<Props> = ({ navigation, route }) => {
  const { iss, launch } = route.params;
  const [status, setStatus] = useState<'connecting' | 'error'>('connecting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initiateSMARTLaunch();
  }, []);

  const initiateSMARTLaunch = async () => {
    try {
      setStatus('connecting');

      // In a real implementation, this would:
      // 1. Fetch the FHIR server's .well-known/smart-configuration
      // 2. Build the OAuth2 authorization URL
      // 3. Open the authorization URL in a web browser
      // 4. Handle the callback with the authorization code
      // 5. Exchange the code for tokens

      // For now, simulate a connection
      await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));

      // Simulate success - navigate to main app
      // In reality, this would be handled by deep link callback
      setError('SMART on FHIR authentication not yet implemented. Please use demo login.');
      setStatus('error');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setStatus('error');
    }
  };

  const handleRetry = () => {
    initiateSMARTLaunch();
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {status === 'connecting' && (
          <>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.statusText}>Connecting to FHIR Server...</Text>
            <Text style={styles.urlText}>{iss}</Text>
            {launch && <Text style={styles.launchText}>Launch context: {launch}</Text>}
          </>
        )}

        {status === 'error' && (
          <>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>!</Text>
            </View>
            <Text style={styles.errorTitle}>Connection Failed</Text>
            <Text style={styles.errorText}>{error}</Text>
            <View style={styles.buttonContainer}>
              <Button title="Try Again" onPress={handleRetry} variant="primary" />
              <Button
                title="Go Back"
                onPress={handleGoBack}
                variant="secondary"
                style={styles.secondaryButton}
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 24,
    textAlign: 'center',
  },
  urlText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  launchText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#DC2626',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  secondaryButton: {
    marginTop: 12,
  },
});

export default SMARTLaunchScreen;
