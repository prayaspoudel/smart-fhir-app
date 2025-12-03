/**
 * Providers Navigator
 *
 * Stack navigator for healthcare provider management screens.
 * Handles provider connections, authentication, and sync status.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ProvidersStackParamList } from './types';

// Import screens
import {
  ProvidersListScreen,
  ProviderDetailScreen,
  AddProviderScreen,
  ProviderSyncScreen,
} from '../screens';

const Stack = createNativeStackNavigator<ProvidersStackParamList>();

export const ProvidersNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProvidersList"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#1E88E5',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        contentStyle: {
          backgroundColor: '#F5F7FA',
        },
      }}
    >
      <Stack.Screen
        name="ProvidersList"
        component={ProvidersListScreen}
        options={({ navigation }) => ({
          title: 'Healthcare Providers',
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('AddProvider')}
              accessibilityLabel="Add Provider"
              accessibilityHint="Navigate to add a new healthcare provider"
            >
              <Text style={styles.headerButtonText}>+ Add</Text>
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="ProviderDetail"
        component={ProviderDetailScreen}
        options={({ route }) => ({
          title: route.params.providerName || 'Provider Details',
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton} accessibilityLabel="Provider settings">
              <Text style={styles.headerButtonText}>⚙️</Text>
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="AddProvider"
        component={AddProviderScreen}
        options={{
          title: 'Connect Provider',
          presentation: 'modal',
          headerLeft: () => null,
        }}
      />

      <Stack.Screen
        name="ProviderSync"
        component={ProviderSyncScreen}
        options={{
          title: 'Sync Records',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerButtonText: {
    color: '#1E88E5',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProvidersNavigator;
