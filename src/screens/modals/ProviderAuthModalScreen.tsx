/**
 * Provider Auth Modal Screen
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'ProviderAuthModal'>;

const ProviderAuthModalScreen: React.FC<Props> = ({ navigation, route }) => {
  const { iss } = route.params;

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.title}>Connecting to Provider</Text>
        <Text style={styles.url}>{iss}</Text>
        <Button title="Cancel" onPress={handleCancel} variant="ghost" style={styles.cancelButton} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginTop: 24, marginBottom: 8 },
  url: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  cancelButton: { marginTop: 32 },
});

export default ProviderAuthModalScreen;
