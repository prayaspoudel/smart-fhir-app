/**
 * Medications Screen
 *
 * Displays current and past medications with dosage information.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppSelector } from '../../store';
import { selectCurrentPatient } from '../../store/slices/authSlice';
import { selectActiveProvider } from '../../store/slices/providersSlice';
import { selectIsDarkMode } from '../../store/slices/uiSlice';
import { useMedications } from '../../query/useFHIRData';
import { Loading } from '../../components/ui';
import { MedicationCard, MedicationStatus } from '../../components/health';
import { MedicationRequest } from '../../domain/entities/MedicationRequest';

type MedicationFilter = 'all' | 'active' | 'completed' | 'stopped';

interface FilterOption {
  key: MedicationFilter;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'stopped', label: 'Stopped' },
];

// Helper to extract medication data
const extractMedicationData = (
  med: MedicationRequest
): {
  name: string;
  dosage: string;
  frequency: string;
  status: MedicationStatus;
  prescriber?: string;
  startDate?: string;
} => {
  // Get medication name
  const name =
    med.medicationCodeableConcept?.coding?.[0]?.display ||
    med.medicationCodeableConcept?.text ||
    'Unknown Medication';

  // Get dosage
  const dosageInstruction = med.dosageInstruction?.[0];
  let dosage = '';
  if (dosageInstruction?.doseAndRate?.[0]?.doseQuantity) {
    const dose = dosageInstruction.doseAndRate[0].doseQuantity;
    dosage = `${dose.value} ${dose.unit || ''}`;
  } else if (dosageInstruction?.text) {
    dosage = dosageInstruction.text;
  }

  // Get frequency
  let frequency = '';
  if (dosageInstruction?.timing?.code?.text) {
    frequency = dosageInstruction.timing.code.text;
  } else if (dosageInstruction?.timing?.repeat) {
    const repeat = dosageInstruction.timing.repeat;
    if (repeat.frequency && repeat.period && repeat.periodUnit) {
      frequency = `${repeat.frequency}x every ${repeat.period} ${repeat.periodUnit}`;
    }
  }

  // Map status
  let status: MedicationStatus = 'unknown';
  switch (med.status) {
    case 'active':
      status = 'active';
      break;
    case 'completed':
      status = 'completed';
      break;
    case 'stopped':
    case 'cancelled':
      status = 'stopped';
      break;
    case 'on-hold':
      status = 'on-hold';
      break;
  }

  // Get prescriber
  const prescriber = med.requester?.display;

  // Get start date
  const startDate = med.authoredOn;

  return { name, dosage, frequency, status, prescriber, startDate };
};

const MedicationsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<MedicationFilter>('all');

  const patient = useAppSelector(selectCurrentPatient);
  const provider = useAppSelector(selectActiveProvider);
  const isDark = useAppSelector(selectIsDarkMode);

  // Fetch medications
  const {
    data: medications = [],
    isLoading,
    refetch,
    isRefetching,
  } = useMedications({
    patientId: patient?.id || '',
    providerBaseUrl: provider?.fhirServerUrl || '',
    enabled: !!patient?.id && !!provider?.fhirServerUrl,
  });

  // Filter medications
  const filteredMedications = useMemo(() => {
    if (selectedFilter === 'all') {
      return medications;
    }
    return medications.filter((med: MedicationRequest) => med.status === selectedFilter);
  }, [medications, selectedFilter]);

  // Group by status
  const groupedMedications = useMemo(() => {
    const active: MedicationRequest[] = [];
    const other: MedicationRequest[] = [];

    filteredMedications.forEach((med: MedicationRequest) => {
      if (med.status === 'active') {
        active.push(med);
      } else {
        other.push(med);
      }
    });

    const groups: { title: string; data: MedicationRequest[] }[] = [];
    if (active.length > 0) {
      groups.push({ title: 'Active Medications', data: active });
    }
    if (other.length > 0) {
      groups.push({ title: 'Past Medications', data: other });
    }

    return groups;
  }, [filteredMedications]);

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

  const renderMedication = useCallback(({ item }: { item: MedicationRequest }) => {
    const { name, dosage, frequency, status, prescriber, startDate } = extractMedicationData(item);
    return (
      <MedicationCard
        name={name}
        dosage={dosage || 'As directed'}
        frequency={frequency || 'As needed'}
        status={status}
        prescriber={prescriber}
        startDate={startDate}
        onPress={() => {
          // Navigate to detail
        }}
      />
    );
  }, []);

  if (isLoading && medications.length === 0) {
    return <Loading message="Loading medications..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
      {/* Filter Bar */}
      <View style={[styles.filterBar, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        {FILTER_OPTIONS.map(renderFilterButton)}
      </View>

      {/* Medications List */}
      {groupedMedications.length > 0 ? (
        <FlatList
          data={groupedMedications}
          keyExtractor={item => item.title}
          renderItem={({ item }) => (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {item.title}
              </Text>
              {item.data.map((med, index) => (
                <View key={med.id || index}>{renderMedication({ item: med })}</View>
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
          <Icon name="pill" size={64} color={isDark ? '#4B5563' : '#9CA3AF'} />
          <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            No medications found
          </Text>
          <Text style={[styles.emptySubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            Connect a healthcare provider to sync your medications
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
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

export default MedicationsScreen;
