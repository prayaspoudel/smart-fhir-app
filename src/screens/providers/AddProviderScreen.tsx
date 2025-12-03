/**
 * Add Provider Screen
 *
 * Allows users to search and connect to new healthcare providers
 * using SMART on FHIR authorization.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppSelector, useAppDispatch } from '../../store';
import { selectIsDarkMode } from '../../store/slices/uiSlice';
import { authService } from '../../data/auth/AuthService';
import { ProviderRegistration, ProviderHelpers } from '../../domain/entities/Provider';

interface AvailableProvider {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  fhirServerUrl: string;
  clientId: string;
}

// Sample provider registry (in production, this would come from an API)
const AVAILABLE_PROVIDERS: AvailableProvider[] = [
  {
    id: 'epic-sandbox',
    name: 'Epic MyChart',
    description: 'Epic Systems FHIR Sandbox',
    fhirServerUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
    clientId: 'demo-client-id',
  },
  {
    id: 'cerner-sandbox',
    name: 'Cerner PowerChart',
    description: 'Cerner FHIR Sandbox',
    fhirServerUrl: 'https://fhir-ehr-code.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d',
    clientId: 'demo-client-id',
  },
  {
    id: 'smart-sandbox',
    name: 'SMART Health IT',
    description: 'SMART on FHIR Sandbox for Testing',
    fhirServerUrl: 'https://launch.smarthealthit.org/v/r4/fhir',
    clientId: 'smart_fhir_app',
  },
  {
    id: 'meditech-sandbox',
    name: 'MEDITECH Expanse',
    description: 'MEDITECH FHIR Sandbox',
    fhirServerUrl: 'https://fhir.meditech.com/r4',
    clientId: 'demo-client-id',
  },
  {
    id: 'allscripts-sandbox',
    name: 'Allscripts',
    description: 'Allscripts FHIR Sandbox',
    fhirServerUrl: 'https://fhir.allscripts.com/fhir/r4',
    clientId: 'demo-client-id',
  },
];

const AddProviderScreen: React.FC = () => {
  const _navigation = useNavigation();
  const _dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const isDark = useAppSelector(selectIsDarkMode);

  const [searchQuery, setSearchQuery] = useState('');
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customClientId, setCustomClientId] = useState('');

  // Filter providers based on search
  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) {
      return AVAILABLE_PROVIDERS;
    }
    const query = searchQuery.toLowerCase();
    return AVAILABLE_PROVIDERS.filter(
      p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Handle connecting to a provider
  const handleConnect = useCallback(async (provider: AvailableProvider) => {
    setIsConnecting(provider.id);

    try {
      // Create provider registration
      const registration: ProviderRegistration = {
        name: provider.name,
        fhirServerUrl: provider.fhirServerUrl,
        clientId: provider.clientId,
        iconUrl: provider.iconUrl,
      };

      // Create provider entity
      const newProvider = ProviderHelpers.createFromRegistration(registration, provider.id);

      // Initiate SMART authorization
      await authService.authorize({
        provider: newProvider,
      });

      // Navigation back happens after callback handling
    } catch (error) {
      Alert.alert('Connection Failed', `Unable to connect to ${provider.name}. Please try again.`, [
        { text: 'OK' },
      ]);
    } finally {
      setIsConnecting(null);
    }
  }, []);

  // Handle custom provider connection
  const handleConnectCustom = useCallback(async () => {
    if (!customUrl.trim()) {
      Alert.alert('Error', 'Please enter a FHIR server URL');
      return;
    }

    setIsConnecting('custom');

    try {
      const registration: ProviderRegistration = {
        name: 'Custom Provider',
        fhirServerUrl: customUrl.trim(),
        clientId: customClientId.trim() || 'smart_fhir_app',
      };

      const newProvider = ProviderHelpers.createFromRegistration(
        registration,
        `custom-${Date.now()}`
      );

      await authService.authorize({
        provider: newProvider,
      });
    } catch (error) {
      Alert.alert(
        'Connection Failed',
        'Unable to connect to the custom provider. Please check the URL and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsConnecting(null);
    }
  }, [customUrl, customClientId]);

  const renderProvider = useCallback(
    ({ item }: { item: AvailableProvider }) => (
      <TouchableOpacity
        style={[styles.providerCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
        onPress={() => handleConnect(item)}
        disabled={isConnecting !== null}
      >
        <View style={[styles.providerIcon, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
          <Icon name="hospital-building" size={28} color={isDark ? '#60A5FA' : '#2563EB'} />
        </View>

        <View style={styles.providerInfo}>
          <Text style={[styles.providerName, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            {item.name}
          </Text>
          <Text style={[styles.providerDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {item.description}
          </Text>
        </View>

        {isConnecting === item.id ? (
          <ActivityIndicator size="small" color={isDark ? '#60A5FA' : '#2563EB'} />
        ) : (
          <Icon name="chevron-right" size={24} color={isDark ? '#6B7280' : '#9CA3AF'} />
        )}
      </TouchableOpacity>
    ),
    [isDark, isConnecting, handleConnect]
  );

  const renderCustomProvider = () => (
    <View style={[styles.customContainer, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <TouchableOpacity style={styles.customHeader} onPress={() => setShowCustom(!showCustom)}>
        <View style={styles.customHeaderLeft}>
          <Icon name="link-plus" size={20} color={isDark ? '#60A5FA' : '#2563EB'} />
          <Text style={[styles.customTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            Connect Custom Provider
          </Text>
        </View>
        <Icon
          name={showCustom ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={isDark ? '#6B7280' : '#9CA3AF'}
        />
      </TouchableOpacity>

      {showCustom && (
        <View style={styles.customForm}>
          <Text style={[styles.inputLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            FHIR Server URL
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                color: isDark ? '#F9FAFB' : '#111827',
              },
            ]}
            placeholder="https://fhir.example.com/r4"
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={customUrl}
            onChangeText={setCustomUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <Text style={[styles.inputLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Client ID (Optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                color: isDark ? '#F9FAFB' : '#111827',
              },
            ]}
            placeholder="your-client-id"
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={customClientId}
            onChangeText={setCustomClientId}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.connectButton, { backgroundColor: isDark ? '#2563EB' : '#2563EB' }]}
            onPress={handleConnectCustom}
            disabled={isConnecting === 'custom'}
          >
            {isConnecting === 'custom' ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="link" size={18} color="#FFFFFF" />
                <Text style={styles.connectButtonText}>Connect</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <Icon name="magnify" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#F9FAFB' : '#111827' }]}
            placeholder="Search providers..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color={isDark ? '#6B7280' : '#9CA3AF'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Providers List */}
      <FlatList
        data={filteredProviders}
        keyExtractor={item => item.id}
        renderItem={renderProvider}
        ListHeaderComponent={() => (
          <Text style={[styles.sectionTitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Available Providers
          </Text>
        )}
        ListFooterComponent={renderCustomProvider}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="hospital-building" size={48} color={isDark ? '#4B5563' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No providers found
            </Text>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  providerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  providerDescription: {
    fontSize: 13,
  },
  customContainer: {
    borderRadius: 12,
    marginTop: 16,
    padding: 16,
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  customForm: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});

export default AddProviderScreen;
