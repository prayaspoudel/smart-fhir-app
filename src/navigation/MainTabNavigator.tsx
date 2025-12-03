/**
 * Main Tab Navigator
 *
 * Bottom tab navigation for authenticated users:
 * - Dashboard (home)
 * - Records (medical records)
 * - Providers (healthcare providers)
 * - Profile (user profile & settings)
 */

import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { MainTabParamList } from './types';
import RecordsNavigator from './RecordsNavigator';
import ProvidersNavigator from './ProvidersNavigator';
import ProfileNavigator from './ProfileNavigator';

// Screens
import DashboardScreen from '../screens/main/DashboardScreen';

import { useAppSelector } from '../store';
import { selectIsDarkMode } from '../store/slices/uiSlice';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab bar icon component
interface TabIconProps {
  route: keyof MainTabParamList;
  focused: boolean;
  color: string;
  size: number;
}

const getTabIcon = ({ route, focused, color, size }: TabIconProps): React.ReactNode => {
  const icons: Record<keyof MainTabParamList, { active: string; inactive: string }> = {
    Dashboard: {
      active: 'view-dashboard',
      inactive: 'view-dashboard-outline',
    },
    Records: {
      active: 'file-document',
      inactive: 'file-document-outline',
    },
    Providers: {
      active: 'hospital-building',
      inactive: 'hospital-building',
    },
    Profile: {
      active: 'account-circle',
      inactive: 'account-circle-outline',
    },
  };

  const iconName = focused ? icons[route].active : icons[route].inactive;
  return <Icon name={iconName} size={size} color={color} />;
};

const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useAppSelector(selectIsDarkMode);

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) =>
          getTabIcon({ route: route.name as keyof MainTabParamList, focused, color, size }),
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: isDarkMode ? '#9CA3AF' : '#6B7280',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          borderTopColor: isDarkMode ? '#374151' : '#E5E7EB',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          height: Platform.OS === 'ios' ? 88 : 64,
          ...styles.tabBar,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Home',
          tabBarAccessibilityLabel: 'Home Dashboard',
        }}
      />

      <Tab.Screen
        name="Records"
        component={RecordsNavigator}
        options={{
          title: 'Records',
          tabBarAccessibilityLabel: 'Medical Records',
          // Show badge for new records
          // tabBarBadge: newRecordsCount > 0 ? newRecordsCount : undefined,
        }}
      />

      <Tab.Screen
        name="Providers"
        component={ProvidersNavigator}
        options={{
          title: 'Providers',
          tabBarAccessibilityLabel: 'Healthcare Providers',
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          title: 'Profile',
          tabBarAccessibilityLabel: 'User Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
});

export default MainTabNavigator;
