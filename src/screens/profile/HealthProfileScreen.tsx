/**
 * Health Profile Screen
 *
 * Displays comprehensive health profile information including
 * conditions, procedures, and health history.
 */

import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppSelector, useAppDispatch } from '../../store';
import { selectIsDarkMode, setRefreshing, selectIsRefreshing } from '../../store/slices/uiSlice';

interface HealthItemProps {
  title: string;
  value: string;
  icon: string;
  status?: 'active' | 'resolved' | 'inactive';
  date?: string;
  isDark: boolean;
  onPress?: () => void;
}

const HealthItem: React.FC<HealthItemProps> = ({
  title,
  value,
  icon,
  status,
  date,
  isDark,
  onPress,
}) => {
  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: '#22C55E20', text: '#22C55E' },
    resolved: { bg: '#6B728020', text: '#6B7280' },
    inactive: { bg: '#9CA3AF20', text: '#9CA3AF' },
  };

  return (
    <TouchableOpacity
      style={[styles.healthItem, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View
        style={[styles.healthIconContainer, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}
      >
        <Icon name={icon} size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
      </View>
      <View style={styles.healthItemContent}>
        <Text
          style={[styles.healthItemTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          style={[styles.healthItemValue, { color: isDark ? '#D1D5DB' : '#4B5563' }]}
          numberOfLines={2}
        >
          {value}
        </Text>
        {date && (
          <Text style={[styles.healthItemDate, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            {date}
          </Text>
        )}
      </View>
      {status && (
        <View style={[styles.statusBadge, { backgroundColor: statusColors[status].bg }]}>
          <Text style={[styles.statusText, { color: statusColors[status].text }]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
  emptyMessage?: string;
}

const Section: React.FC<SectionProps> = ({ title, children, isDark, emptyMessage }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{title}</Text>
    {children || (
      <View style={[styles.emptyContainer, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Text style={[styles.emptyText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          {emptyMessage || 'No data available'}
        </Text>
      </View>
    )}
  </View>
);

// Mock data for health profile
const mockConditions = [
  {
    id: '1',
    name: 'Type 2 Diabetes Mellitus',
    clinicalStatus: 'active',
    onsetDate: 'January 2022',
  },
  {
    id: '2',
    name: 'Essential Hypertension',
    clinicalStatus: 'active',
    onsetDate: 'March 2020',
  },
  {
    id: '3',
    name: 'Seasonal Allergic Rhinitis',
    clinicalStatus: 'resolved',
    onsetDate: 'April 2019',
  },
];

const mockProcedures = [
  {
    id: '1',
    name: 'Appendectomy',
    date: 'June 2021',
    location: 'General Hospital',
  },
  {
    id: '2',
    name: 'Colonoscopy',
    date: 'March 2023',
    location: 'Medical Center',
  },
];

const mockAllergies = [
  {
    id: '1',
    substance: 'Penicillin',
    reaction: 'Skin rash',
    severity: 'Moderate',
  },
  {
    id: '2',
    substance: 'Peanuts',
    reaction: 'Anaphylaxis',
    severity: 'Severe',
  },
  {
    id: '3',
    substance: 'Latex',
    reaction: 'Contact dermatitis',
    severity: 'Mild',
  },
];

const mockImmunizations = [
  {
    id: '1',
    vaccine: 'COVID-19 mRNA',
    date: 'November 2023',
    status: 'Completed',
  },
  {
    id: '2',
    vaccine: 'Influenza',
    date: 'October 2023',
    status: 'Completed',
  },
  {
    id: '3',
    vaccine: 'Tdap',
    date: 'May 2020',
    status: 'Completed',
  },
];

const HealthProfileScreen: React.FC = () => {
  const _navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const isDarkMode = useAppSelector(selectIsDarkMode);
  const isRefreshing = useAppSelector(selectIsRefreshing);

  const handleRefresh = useCallback(() => {
    dispatch(setRefreshing(true));
    setTimeout(() => {
      dispatch(setRefreshing(false));
    }, 1500);
  }, [dispatch]);

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
      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
          <Icon name="heart-pulse" size={24} color={isDarkMode ? '#F87171' : '#EF4444'} />
          <Text style={[styles.statValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
            {mockConditions.filter(c => c.clinicalStatus === 'active').length}
          </Text>
          <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            Active Conditions
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
          <Icon name="alert-circle" size={24} color={isDarkMode ? '#FBBF24' : '#F59E0B'} />
          <Text style={[styles.statValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
            {mockAllergies.length}
          </Text>
          <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            Allergies
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
          <Icon name="needle" size={24} color={isDarkMode ? '#34D399' : '#10B981'} />
          <Text style={[styles.statValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
            {mockImmunizations.length}
          </Text>
          <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            Immunizations
          </Text>
        </View>
      </View>

      {/* Conditions */}
      <Section title="CURRENT CONDITIONS" isDark={isDarkMode}>
        <View style={styles.itemsContainer}>
          {mockConditions.map(condition => (
            <HealthItem
              key={condition.id}
              title={condition.name}
              value={`Onset: ${condition.onsetDate}`}
              icon="stethoscope"
              status={condition.clinicalStatus as 'active' | 'resolved'}
              isDark={isDarkMode}
            />
          ))}
        </View>
      </Section>

      {/* Allergies */}
      <Section title="ALLERGIES" isDark={isDarkMode}>
        <View style={styles.itemsContainer}>
          {mockAllergies.map(allergy => (
            <HealthItem
              key={allergy.id}
              title={allergy.substance}
              value={`Reaction: ${allergy.reaction} • ${allergy.severity}`}
              icon="alert-octagon"
              isDark={isDarkMode}
            />
          ))}
        </View>
      </Section>

      {/* Immunizations */}
      <Section title="IMMUNIZATIONS" isDark={isDarkMode}>
        <View style={styles.itemsContainer}>
          {mockImmunizations.map(immunization => (
            <HealthItem
              key={immunization.id}
              title={immunization.vaccine}
              value={immunization.status}
              date={immunization.date}
              icon="needle"
              isDark={isDarkMode}
            />
          ))}
        </View>
      </Section>

      {/* Procedures */}
      <Section title="PROCEDURES" isDark={isDarkMode}>
        <View style={styles.itemsContainer}>
          {mockProcedures.map(procedure => (
            <HealthItem
              key={procedure.id}
              title={procedure.name}
              value={procedure.location}
              date={procedure.date}
              icon="hospital"
              isDark={isDarkMode}
            />
          ))}
        </View>
      </Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  itemsContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  healthIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  healthItemContent: {
    flex: 1,
    marginRight: 8,
  },
  healthItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  healthItemValue: {
    fontSize: 13,
    lineHeight: 18,
  },
  healthItemDate: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

export default HealthProfileScreen;
