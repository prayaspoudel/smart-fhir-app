/**
 * Profile Home Screen
 *
 * Displays the user's profile overview with health summary,
 * connected providers, and quick actions.
 */

import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppSelector, useAppDispatch } from '../../store';
import { selectIsDarkMode, setRefreshing, selectIsRefreshing } from '../../store/slices/uiSlice';
import { selectCurrentPatient } from '../../store/slices/authSlice';
import { selectConnectedProviders } from '../../store/slices/providersSlice';
import type { ProfileStackParamList } from '../../navigation/types';

type ProfileNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

interface ProfileMenuItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  isDark: boolean;
  showChevron?: boolean;
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  icon,
  label,
  value,
  onPress,
  isDark,
  showChevron = true,
}) => (
  <TouchableOpacity
    style={[styles.menuItem, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemLeft}>
      <View style={[styles.menuIconContainer, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
        <Icon name={icon} size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
      </View>
      <Text style={[styles.menuLabel, { color: isDark ? '#F9FAFB' : '#111827' }]}>{label}</Text>
    </View>
    <View style={styles.menuItemRight}>
      {value && (
        <Text style={[styles.menuValue, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{value}</Text>
      )}
      {showChevron && (
        <Icon name="chevron-right" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
      )}
    </View>
  </TouchableOpacity>
);

interface SectionHeaderProps {
  title: string;
  isDark: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, isDark }) => (
  <Text style={[styles.sectionHeader, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{title}</Text>
);

const ProfileHomeScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const isDarkMode = useAppSelector(selectIsDarkMode);
  const isRefreshing = useAppSelector(selectIsRefreshing);
  const patient = useAppSelector(selectCurrentPatient);
  const connectedProviders = useAppSelector(selectConnectedProviders);

  const handleRefresh = useCallback(() => {
    dispatch(setRefreshing(true));
    // Simulate refresh
    setTimeout(() => {
      dispatch(setRefreshing(false));
    }, 1500);
  }, [dispatch]);

  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAge = (birthDate?: string): string => {
    if (!birthDate) return 'Unknown';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} years`;
  };

  const patientName =
    patient?.name?.[0]?.text ||
    `${patient?.name?.[0]?.given?.join(' ') || ''} ${patient?.name?.[0]?.family || ''}`.trim() ||
    'Unknown Patient';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#F3F4F6' }]}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 20,
      }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={isDarkMode ? '#60A5FA' : '#3B82F6'}
        />
      }
    >
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
        <View
          style={[styles.avatarContainer, { backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB' }]}
        >
          <Text style={styles.avatarText}>{getInitials(patientName)}</Text>
        </View>

        <Text style={[styles.patientName, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
          {patientName}
        </Text>

        <View style={styles.patientInfo}>
          {patient?.birthDate && (
            <View style={styles.infoChip}>
              <Icon name="calendar" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Text style={[styles.infoText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                {getAge(patient.birthDate)}
              </Text>
            </View>
          )}
          {patient?.gender && (
            <View style={styles.infoChip}>
              <Icon
                name={patient.gender === 'male' ? 'gender-male' : 'gender-female'}
                size={14}
                color={isDarkMode ? '#9CA3AF' : '#6B7280'}
              />
              <Text style={[styles.infoText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Icon name="pencil" size={16} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
          <Text style={[styles.editButtonText, { color: isDarkMode ? '#60A5FA' : '#3B82F6' }]}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Health Summary */}
      <SectionHeader title="HEALTH INFORMATION" isDark={isDarkMode} />
      <View style={styles.menuGroup}>
        <ProfileMenuItem
          icon="heart-pulse"
          label="Health Profile"
          onPress={() => navigation.navigate('HealthProfile')}
          isDark={isDarkMode}
        />
        <ProfileMenuItem
          icon="alert-circle"
          label="Allergies"
          value="3 recorded"
          onPress={() => navigation.navigate('Allergies')}
          isDark={isDarkMode}
        />
        <ProfileMenuItem
          icon="pill"
          label="Current Medications"
          value="5 active"
          onPress={() => navigation.navigate('Medications')}
          isDark={isDarkMode}
        />
        <ProfileMenuItem
          icon="stethoscope"
          label="Conditions"
          value="2 active"
          onPress={() => navigation.navigate('Conditions')}
          isDark={isDarkMode}
        />
      </View>

      {/* Emergency Information */}
      <SectionHeader title="EMERGENCY" isDark={isDarkMode} />
      <View style={styles.menuGroup}>
        <ProfileMenuItem
          icon="account-multiple"
          label="Emergency Contacts"
          onPress={() => navigation.navigate('EmergencyContacts')}
          isDark={isDarkMode}
        />
        <ProfileMenuItem
          icon="card-account-details"
          label="Insurance Information"
          onPress={() => navigation.navigate('Insurance')}
          isDark={isDarkMode}
        />
        <ProfileMenuItem
          icon="file-document"
          label="Advance Directives"
          onPress={() => navigation.navigate('AdvanceDirectives')}
          isDark={isDarkMode}
        />
      </View>

      {/* Connected Providers */}
      <SectionHeader title="CONNECTED PROVIDERS" isDark={isDarkMode} />
      <View style={styles.menuGroup}>
        <ProfileMenuItem
          icon="hospital-building"
          label="Healthcare Providers"
          value={`${connectedProviders.length} connected`}
          onPress={() => navigation.navigate('Providers' as never)}
          isDark={isDarkMode}
        />
      </View>

      {/* Account */}
      <SectionHeader title="ACCOUNT" isDark={isDarkMode} />
      <View style={styles.menuGroup}>
        <ProfileMenuItem
          icon="account"
          label="Personal Information"
          onPress={() => navigation.navigate('EditProfile')}
          isDark={isDarkMode}
        />
        <ProfileMenuItem
          icon="shield-lock"
          label="Privacy & Security"
          onPress={() => navigation.navigate('Privacy')}
          isDark={isDarkMode}
        />
        <ProfileMenuItem
          icon="download"
          label="Export My Data"
          onPress={() => navigation.navigate('ExportData')}
          isDark={isDarkMode}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  patientName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  patientInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  menuGroup: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menuValue: {
    fontSize: 14,
    marginRight: 4,
  },
});

export default ProfileHomeScreen;
