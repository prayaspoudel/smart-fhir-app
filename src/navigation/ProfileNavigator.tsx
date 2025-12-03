/**
 * Profile Navigator
 *
 * Stack navigator for user profile and account management screens.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ProfileStackParamList } from './types';

// Import screens
import {
  ProfileScreen,
  EditProfileScreen,
  HealthProfileScreen,
  EmergencyContactsScreen,
  DataExportScreen,
} from '../screens';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
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
        name="ProfileMain"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: 'Profile',
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('EditProfile')}
              accessibilityLabel="Edit profile"
            >
              <Text style={styles.headerButtonText}>Edit</Text>
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="HealthProfile"
        component={HealthProfileScreen}
        options={{
          title: 'Health Profile',
        }}
      />

      <Stack.Screen
        name="EmergencyContacts"
        component={EmergencyContactsScreen}
        options={{
          title: 'Emergency Contacts',
        }}
      />

      <Stack.Screen
        name="DataExport"
        component={DataExportScreen}
        options={{
          title: 'Export My Data',
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

export default ProfileNavigator;
