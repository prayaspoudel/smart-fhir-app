/**
 * Consent Modal Screen
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'ConsentModal'>;

const ConsentModalScreen: React.FC<Props> = ({ navigation, route }) => {
  const { providerName } = route.params;

  const handleAccept = () => {
    navigation.goBack();
  };

  const handleDecline = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Data Sharing Consent</Text>
        <Text style={styles.provider}>{providerName}</Text>
        <Text style={styles.description}>
          This provider is requesting access to your health records. By accepting, you agree to
          share the following data:
        </Text>
        <View style={styles.permissions}>
          <Text style={styles.permissionItem}>• Medical History</Text>
          <Text style={styles.permissionItem}>• Lab Results</Text>
          <Text style={styles.permissionItem}>• Medications</Text>
          <Text style={styles.permissionItem}>• Vital Signs</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Accept" onPress={handleAccept} variant="primary" />
          <Button
            title="Decline"
            onPress={handleDecline}
            variant="outline"
            style={styles.declineButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  provider: { fontSize: 16, color: '#2563EB', marginBottom: 16 },
  description: { fontSize: 16, color: '#6B7280', lineHeight: 24, marginBottom: 16 },
  permissions: { backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, marginBottom: 24 },
  permissionItem: { fontSize: 14, color: '#374151', marginBottom: 8 },
  buttonContainer: { gap: 12 },
  declineButton: { marginTop: 12 },
});

export default ConsentModalScreen;
