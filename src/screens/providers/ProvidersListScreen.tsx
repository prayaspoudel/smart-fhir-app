/**
 * Providers List Screen
 *
 * Displays connected healthcare providers with options to
 * add new providers, sync data, and manage connections.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppSelector, useAppDispatch } from '../../store';
import { selectConnectedProviders } from '../../store/slices/providersSlice';
import { selectIsDarkMode } from '../../store/slices/uiSlice';
import { ProviderCard } from '../../components/health';
import { Provider } from '../../domain/entities/Provider';
import { secureStorage } from '../../infrastructure/storage/SecureStorage';

const ProvidersListScreen: React.FC = () => {
  const navigation = useNavigation();
  const _dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const providers = useAppSelector(selectConnectedProviders);
  const isDark = useAppSelector(selectIsDarkMode);

  const [syncingProviders, setSyncingProviders] = useState<Set<string>>(new Set());

  // Handle sync for a provider
  const handleSync = useCallback(async (provider: Provider) => {
    setSyncingProviders(prev => new Set(prev).add(provider.id));

    try {
      // In production, this would trigger a full data sync
      await new Promise<void>(resolve => setTimeout(() => resolve(), 2000)); // Simulate sync

      Alert.alert('Sync Complete', `Successfully synced data from ${provider.name}`, [
        { text: 'OK' },
      ]);
    } catch (error) {
      Alert.alert('Sync Failed', `Failed to sync data from ${provider.name}. Please try again.`, [
        { text: 'OK' },
      ]);
    } finally {
      setSyncingProviders(prev => {
        const next = new Set(prev);
        next.delete(provider.id);
        return next;
      });
    }
  }, []);

  // Handle disconnect
  const handleDisconnect = useCallback((provider: Provider) => {
    Alert.alert(
      'Disconnect Provider',
      `Are you sure you want to disconnect from ${provider.name}? This will remove all synced data from this provider.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear provider tokens
              await secureStorage.clearProviderTokens(provider.id);

              // In production, would dispatch action to remove from store
              Alert.alert('Disconnected', `Successfully disconnected from ${provider.name}`);
            } catch (error) {
              Alert.alert('Error', 'Failed to disconnect provider');
            }
          },
        },
      ]
    );
  }, []);

  // Handle provider press
  const handleProviderPress = useCallback(
    (provider: Provider) => {
      // @ts-expect-error - Navigation types are complex
      navigation.navigate('ProviderDetail', { providerId: provider.id });
    },
    [navigation]
  );

  const renderProvider = useCallback(
    ({ item }: { item: Provider }) => {
      const isSyncing = syncingProviders.has(item.id);
      return (
        <View style={styles.providerItem}>
          <ProviderCard
            name={item.name}
            type="Healthcare Provider"
            logoUrl={item.iconUrl}
            status={isSyncing ? 'syncing' : item.isConnected ? 'connected' : 'disconnected'}
            lastSynced={item.lastSyncedAt}
            onPress={() => handleProviderPress(item)}
            onSync={() => handleSync(item)}
          />
          <View style={styles.providerActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: isDark ? '#1E40AF' : '#2563EB' }]}
              onPress={() => handleSync(item)}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="sync" size={16} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Sync</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: isDark ? '#7F1D1D' : '#EF4444' }]}
              onPress={() => handleDisconnect(item)}
            >
              <Icon name="link-off" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [isDark, syncingProviders, handleSync, handleDisconnect, handleProviderPress]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[styles.emptyIconContainer, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}
      >
        <Icon name="hospital-building" size={64} color={isDark ? '#4B5563' : '#9CA3AF'} />
      </View>

      <Text style={[styles.emptyTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
        No Providers Connected
      </Text>

      <Text style={[styles.emptySubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        Connect to your healthcare providers to view and manage your medical records
      </Text>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: isDark ? '#2563EB' : '#2563EB' }]}
        onPress={() => navigation.navigate('AddProvider' as never)}
      >
        <Icon name="plus" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Provider</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.headerText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        {providers.length} {providers.length === 1 ? 'provider' : 'providers'} connected
      </Text>

      <TouchableOpacity
        style={[styles.addHeaderButton, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}
        onPress={() => navigation.navigate('AddProvider' as never)}
      >
        <Icon name="plus" size={18} color={isDark ? '#F9FAFB' : '#111827'} />
        <Text style={[styles.addHeaderButtonText, { color: isDark ? '#F9FAFB' : '#111827' }]}>
          Add
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
      {providers.length > 0 ? (
        <FlatList
          data={providers}
          keyExtractor={item => item.id}
          renderItem={renderProvider}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerText: {
    fontSize: 14,
  },
  addHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addHeaderButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  providerItem: {
    marginBottom: 16,
  },
  providerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    minWidth: 100,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProvidersListScreen;
