/**
 * Encounters Screen
 *
 * Displays healthcare encounters (visits, appointments, etc.)
 * with timeline visualization.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppSelector } from '../../store';
import { selectCurrentPatient } from '../../store/slices/authSlice';
import { selectActiveProvider } from '../../store/slices/providersSlice';
import { selectIsDarkMode } from '../../store/slices/uiSlice';
import { useEncounters } from '../../query/useFHIRData';
import { Loading } from '../../components/ui';
import { Encounter } from '../../domain/entities/Encounter';

type EncounterFilter = 'all' | 'inpatient' | 'outpatient' | 'emergency';

interface FilterOption {
  key: EncounterFilter;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'All' },
  { key: 'inpatient', label: 'Inpatient' },
  { key: 'outpatient', label: 'Outpatient' },
  { key: 'emergency', label: 'Emergency' },
];

// Helper to get encounter type display
const getEncounterType = (encounter: Encounter): string => {
  // Check class code
  const classCode = encounter.class?.code;
  switch (classCode) {
    case 'IMP':
    case 'ACUTE':
    case 'NONAC':
      return 'Inpatient';
    case 'AMB':
      return 'Outpatient';
    case 'EMER':
      return 'Emergency';
    case 'HH':
      return 'Home Health';
    case 'VR':
      return 'Virtual';
    default:
      return encounter.class?.display || 'Visit';
  }
};

// Helper to get icon based on encounter type
const getEncounterIcon = (encounter: Encounter): string => {
  const classCode = encounter.class?.code;
  switch (classCode) {
    case 'IMP':
    case 'ACUTE':
    case 'NONAC':
      return 'hospital-building';
    case 'EMER':
      return 'ambulance';
    case 'HH':
      return 'home-heart';
    case 'VR':
      return 'video';
    default:
      return 'stethoscope';
  }
};

// Helper to get status color
const getStatusColor = (status: string, isDark: boolean): string => {
  switch (status) {
    case 'in-progress':
      return '#3B82F6';
    case 'finished':
      return isDark ? '#10B981' : '#059669';
    case 'cancelled':
      return '#EF4444';
    case 'planned':
      return '#F59E0B';
    default:
      return isDark ? '#9CA3AF' : '#6B7280';
  }
};

interface EncounterItemProps {
  encounter: Encounter;
  isDark: boolean;
  onPress?: () => void;
}

const EncounterItem: React.FC<EncounterItemProps> = ({ encounter, isDark, onPress }) => {
  const type = getEncounterType(encounter);
  const icon = getEncounterIcon(encounter);
  const statusColor = getStatusColor(encounter.status, isDark);

  const reason =
    encounter.reasonCode?.[0]?.coding?.[0]?.display ||
    encounter.reasonCode?.[0]?.text ||
    encounter.type?.[0]?.coding?.[0]?.display ||
    encounter.type?.[0]?.text ||
    'Healthcare Visit';

  const provider =
    encounter.participant?.[0]?.individual?.display || encounter.serviceProvider?.display;

  const location = encounter.location?.[0]?.location?.display;

  const startDate = encounter.period?.start
    ? new Date(encounter.period.start).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const startTime = encounter.period?.start
    ? new Date(encounter.period.start).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  return (
    <TouchableOpacity
      style={[styles.encounterItem, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
        <Icon name={icon} size={24} color={isDark ? '#60A5FA' : '#2563EB'} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[styles.reason, { color: isDark ? '#F9FAFB' : '#111827' }]}
            numberOfLines={2}
          >
            {reason}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {encounter.status.charAt(0).toUpperCase() +
                encounter.status.slice(1).replace('-', ' ')}
            </Text>
          </View>
        </View>

        <Text style={[styles.type, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{type}</Text>

        {provider && (
          <View style={styles.infoRow}>
            <Icon name="doctor" size={14} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.infoText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {provider}
            </Text>
          </View>
        )}

        {location && (
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={14} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.infoText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {location}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Icon name="calendar" size={14} color={isDark ? '#6B7280' : '#9CA3AF'} />
          <Text style={[styles.infoText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {startDate} {startTime && `at ${startTime}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const EncountersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<EncounterFilter>('all');

  const patient = useAppSelector(selectCurrentPatient);
  const provider = useAppSelector(selectActiveProvider);
  const isDark = useAppSelector(selectIsDarkMode);

  // Fetch encounters
  const {
    data: encounters = [],
    isLoading,
    refetch,
    isRefetching,
  } = useEncounters({
    patientId: patient?.id || '',
    providerBaseUrl: provider?.fhirServerUrl || '',
    enabled: !!patient?.id && !!provider?.fhirServerUrl,
  });

  // Filter encounters
  const filteredEncounters = useMemo(() => {
    if (selectedFilter === 'all') {
      return encounters;
    }

    return encounters.filter((enc: Encounter) => {
      const classCode = enc.class?.code;
      switch (selectedFilter) {
        case 'inpatient':
          return ['IMP', 'ACUTE', 'NONAC'].includes(classCode || '');
        case 'outpatient':
          return classCode === 'AMB';
        case 'emergency':
          return classCode === 'EMER';
        default:
          return true;
      }
    });
  }, [encounters, selectedFilter]);

  // Sort by date (most recent first)
  const sortedEncounters = useMemo(() => {
    return [...filteredEncounters].sort((a: Encounter, b: Encounter) => {
      const dateA = a.period?.start || '';
      const dateB = b.period?.start || '';
      return dateB.localeCompare(dateA);
    });
  }, [filteredEncounters]);

  const renderFilterButton = useCallback(
    (filter: FilterOption) => (
      <TouchableOpacity
        key={filter.key}
        style={[
          styles.filterButton,
          {
            backgroundColor:
              selectedFilter === filter.key
                ? isDark
                  ? '#2563EB'
                  : '#2563EB'
                : isDark
                  ? '#374151'
                  : '#E5E7EB',
          },
        ]}
        onPress={() => setSelectedFilter(filter.key)}
      >
        <Text
          style={[
            styles.filterButtonText,
            {
              color: selectedFilter === filter.key ? '#FFFFFF' : isDark ? '#D1D5DB' : '#4B5563',
            },
          ]}
        >
          {filter.label}
        </Text>
      </TouchableOpacity>
    ),
    [selectedFilter, isDark]
  );

  const renderEncounter = useCallback(
    ({ item }: { item: Encounter }) => (
      <EncounterItem
        encounter={item}
        isDark={isDark}
        onPress={() => {
          // Navigate to detail
        }}
      />
    ),
    [isDark]
  );

  if (isLoading && encounters.length === 0) {
    return <Loading message="Loading encounters..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
      {/* Filter Bar */}
      <View style={[styles.filterBar, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        {FILTER_OPTIONS.map(renderFilterButton)}
      </View>

      {/* Encounters List */}
      {sortedEncounters.length > 0 ? (
        <FlatList
          data={sortedEncounters}
          keyExtractor={item => item.id || String(Math.random())}
          renderItem={renderEncounter}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={isDark ? '#60A5FA' : '#2563EB'}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="calendar-blank" size={64} color={isDark ? '#4B5563' : '#9CA3AF'} />
          <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            No encounters found
          </Text>
          <Text style={[styles.emptySubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            Connect a healthcare provider to sync your visit history
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  encounterItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  reason: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  type: {
    fontSize: 12,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  infoText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default EncountersScreen;
