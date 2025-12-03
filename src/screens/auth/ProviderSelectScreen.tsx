/**
 * Provider Select Screen
 *
 * Allows users to select their healthcare provider for SMART on FHIR authentication.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProviderSelect'>;

interface HealthcareProvider {
  id: string;
  name: string;
  fhirServerUrl: string;
  logoUrl?: string;
}

// Sample providers - in production, this would come from an API
const SAMPLE_PROVIDERS: HealthcareProvider[] = [
  {
    id: '1',
    name: 'SMART Health IT',
    fhirServerUrl: 'https://launch.smarthealthit.org/v/r4/fhir',
  },
  {
    id: '2',
    name: 'Epic MyChart',
    fhirServerUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
  },
  {
    id: '3',
    name: 'Cerner Health',
    fhirServerUrl: 'https://fhir-myrecord.cerner.com/r4',
  },
];

const ProviderSelectScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [providers] = useState<HealthcareProvider[]>(SAMPLE_PROVIDERS);

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProviderSelect = (provider: HealthcareProvider) => {
    navigation.navigate('SMARTLaunch', {
      iss: provider.fhirServerUrl,
    });
  };

  const renderProvider = ({ item }: { item: HealthcareProvider }) => (
    <TouchableOpacity style={styles.providerCard} onPress={() => handleProviderSelect(item)}>
      <View style={styles.providerIcon}>
        <Text style={styles.providerIconText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.providerInfo}>
        <Text style={styles.providerName}>{item.name}</Text>
        <Text style={styles.providerUrl} numberOfLines={1}>
          {item.fhirServerUrl}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search healthcare providers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={filteredProviders}
        renderItem={renderProvider}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No providers found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  providerIconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  providerUrl: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ProviderSelectScreen;
