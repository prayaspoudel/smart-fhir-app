/**
 * Vitals Screen
 *
 * Displays vital signs (blood pressure, heart rate, temperature, etc.)
 * with trend visualization and filtering options.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppSelector } from '../../store';
import { selectCurrentPatient } from '../../store/slices/authSlice';
import { selectActiveProvider } from '../../store/slices/providersSlice';
import { selectIsDarkMode } from '../../store/slices/uiSlice';
import { useObservations } from '../../query/useFHIRData';
import { Observation } from '../../domain/entities/Observation';
import { VitalCard, VitalStatus } from '../../components/health';
import { Loading } from '../../components/ui';

type VitalCategory =
  | 'all'
  | 'blood-pressure'
  | 'heart-rate'
  | 'temperature'
  | 'respiratory'
  | 'oxygen';

interface VitalFilter {
  key: VitalCategory;
  label: string;
  code?: string;
}

const VITAL_FILTERS: VitalFilter[] = [
  { key: 'all', label: 'All' },
  { key: 'blood-pressure', label: 'BP', code: '85354-9' },
  { key: 'heart-rate', label: 'HR', code: '8867-4' },
  { key: 'temperature', label: 'Temp', code: '8310-5' },
  { key: 'respiratory', label: 'RR', code: '9279-1' },
  { key: 'oxygen', label: 'SpO2', code: '2708-6' },
];

// Helper to extract vital data from observation
const extractVitalData = (
  observation: Observation
): { title: string; value: string; unit: string; status: VitalStatus } => {
  const title = observation.code?.coding?.[0]?.display || observation.code?.text || 'Vital Sign';

  let value = '--';
  let unit = '';

  if (observation.valueQuantity) {
    value = String(observation.valueQuantity.value ?? '--');
    unit = observation.valueQuantity.unit || observation.valueQuantity.code || '';
  } else if (observation.component && observation.component.length > 0) {
    // For blood pressure with systolic/diastolic components
    const systolic = observation.component.find(c =>
      c.code?.coding?.some(coding => coding.code === '8480-6')
    );
    const diastolic = observation.component.find(c =>
      c.code?.coding?.some(coding => coding.code === '8462-4')
    );

    if (systolic?.valueQuantity && diastolic?.valueQuantity) {
      value = `${systolic.valueQuantity.value}/${diastolic.valueQuantity.value}`;
      unit = 'mmHg';
    }
  }

  // Determine status based on interpretation or reference range
  let status: VitalStatus = 'normal';
  const interpretation = observation.interpretation?.[0]?.coding?.[0]?.code;
  if (interpretation) {
    switch (interpretation) {
      case 'H':
      case 'HH':
        status = 'high';
        break;
      case 'L':
      case 'LL':
        status = 'low';
        break;
      case 'A':
        status = 'elevated';
        break;
      case 'AA':
        status = 'critical';
        break;
    }
  }

  return { title, value, unit, status };
};

const VitalsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<VitalCategory>('all');

  const patient = useAppSelector(selectCurrentPatient);
  const provider = useAppSelector(selectActiveProvider);
  const isDark = useAppSelector(selectIsDarkMode);

  // Fetch vital signs
  const {
    data: vitals = [],
    isLoading,
    refetch,
    isRefetching,
  } = useObservations({
    patientId: patient?.id || '',
    providerBaseUrl: provider?.fhirServerUrl || '',
    category: 'vital-signs',
    enabled: !!patient?.id && !!provider?.fhirServerUrl,
  });

  // Filter vitals based on selection
  const filteredVitals = useMemo(() => {
    if (selectedFilter === 'all') {
      return vitals;
    }

    const filter = VITAL_FILTERS.find(f => f.key === selectedFilter);
    if (!filter?.code) return vitals;

    return vitals.filter((vital: Observation) => {
      const codes = vital.code?.coding?.map((c: { code?: string }) => c.code) || [];
      return codes.includes(filter.code!);
    });
  }, [vitals, selectedFilter]);

  // Group vitals by date
  const groupedVitals = useMemo(() => {
    const groups: { [key: string]: Observation[] } = {};

    filteredVitals.forEach((vital: Observation) => {
      const date = vital.effectiveDateTime?.split('T')[0] || 'Unknown';
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(vital);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({
        date,
        data: items,
      }));
  }, [filteredVitals]);

  const renderFilterButton = useCallback(
    (filter: VitalFilter) => (
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

  const renderVital = useCallback(({ item }: { item: Observation }) => {
    const { title, value, unit, status } = extractVitalData(item);
    return (
      <VitalCard
        title={title}
        value={value}
        unit={unit}
        status={status}
        timestamp={item.effectiveDateTime}
        onPress={() => {
          // Navigate to detail view
        }}
      />
    );
  }, []);

  const renderDateHeader = useCallback(
    (date: string) => {
      const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      return (
        <Text style={[styles.dateHeader, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {formattedDate}
        </Text>
      );
    },
    [isDark]
  );

  if (isLoading && vitals.length === 0) {
    return <Loading message="Loading vitals..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
      {/* Filter Bar */}
      <View style={[styles.filterBar, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        {VITAL_FILTERS.map(renderFilterButton)}
      </View>

      {/* Vitals List */}
      {groupedVitals.length > 0 ? (
        <FlatList
          data={groupedVitals}
          keyExtractor={item => item.date}
          renderItem={({ item }) => (
            <View style={styles.dateGroup}>
              {renderDateHeader(item.date)}
              {item.data.map((vital, index) => (
                <View key={vital.id || index}>{renderVital({ item: vital })}</View>
              ))}
            </View>
          )}
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
          <Icon name="heart-pulse" size={64} color={isDark ? '#4B5563' : '#9CA3AF'} />
          <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            No vital signs recorded
          </Text>
          <Text style={[styles.emptySubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            Connect a healthcare provider to sync your vitals
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
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
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

export default VitalsScreen;
