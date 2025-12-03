/**
 * Lab Results Screen
 *
 * Displays laboratory results and diagnostic reports with
 * categorization and trend visualization.
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
import { Loading } from '../../components/ui';
import { Observation } from '../../domain/entities/Observation';

type LabCategory = 'all' | 'chemistry' | 'hematology' | 'urinalysis' | 'other';

interface CategoryFilter {
  key: LabCategory;
  label: string;
}

const LAB_CATEGORIES: CategoryFilter[] = [
  { key: 'all', label: 'All' },
  { key: 'chemistry', label: 'Chemistry' },
  { key: 'hematology', label: 'Blood' },
  { key: 'urinalysis', label: 'Urine' },
  { key: 'other', label: 'Other' },
];

interface LabResultItemProps {
  result: Observation;
  isDark: boolean;
  onPress?: () => void;
}

const LabResultItem: React.FC<LabResultItemProps> = ({ result, isDark, onPress }) => {
  const testName = result.code?.coding?.[0]?.display || result.code?.text || 'Lab Test';

  const getValue = () => {
    if (result.valueQuantity) {
      return `${result.valueQuantity.value} ${result.valueQuantity.unit || ''}`;
    }
    if (result.valueString) {
      return result.valueString;
    }
    if (result.valueCodeableConcept) {
      return result.valueCodeableConcept.coding?.[0]?.display || '';
    }
    return 'N/A';
  };

  const getReferenceRange = () => {
    const range = result.referenceRange?.[0];
    if (!range) return null;

    const low = range.low?.value;
    const high = range.high?.value;
    const unit = range.low?.unit || range.high?.unit || '';

    if (low && high) {
      return `${low} - ${high} ${unit}`;
    }
    if (low) {
      return `> ${low} ${unit}`;
    }
    if (high) {
      return `< ${high} ${unit}`;
    }
    return null;
  };

  const isAbnormal = result.interpretation?.[0]?.coding?.[0]?.code !== 'N';
  const date = result.effectiveDateTime
    ? new Date(result.effectiveDateTime).toLocaleDateString()
    : '';

  return (
    <TouchableOpacity
      style={[styles.labItem, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
      onPress={onPress}
    >
      <View style={styles.labHeader}>
        <View style={styles.labTitleContainer}>
          <Text
            style={[styles.labTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}
            numberOfLines={2}
          >
            {testName}
          </Text>
          <Text style={[styles.labDate, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{date}</Text>
        </View>
        <View style={styles.labValueContainer}>
          <Text
            style={[
              styles.labValue,
              {
                color: isAbnormal ? '#EF4444' : isDark ? '#10B981' : '#059669',
              },
            ]}
          >
            {getValue()}
          </Text>
          {isAbnormal && <Icon name="alert-circle" size={16} color="#EF4444" />}
        </View>
      </View>
      {getReferenceRange() && (
        <Text style={[styles.referenceRange, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          Ref: {getReferenceRange()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const LabResultsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<LabCategory>('all');

  const patient = useAppSelector(selectCurrentPatient);
  const provider = useAppSelector(selectActiveProvider);
  const isDark = useAppSelector(selectIsDarkMode);

  // Fetch lab results
  const {
    data: labResults = [],
    isLoading,
    refetch,
    isRefetching,
  } = useObservations({
    patientId: patient?.id || '',
    providerBaseUrl: provider?.fhirServerUrl || '',
    category: 'laboratory',
    enabled: !!patient?.id && !!provider?.fhirServerUrl,
  });

  // Filter and sort results
  const filteredResults = useMemo(() => {
    // For now, return all (category filtering would need code mappings)
    return [...labResults].sort((a: Observation, b: Observation) => {
      const dateA = a.effectiveDateTime || '';
      const dateB = b.effectiveDateTime || '';
      return dateB.localeCompare(dateA);
    });
  }, [labResults]);

  // Group by date
  const groupedResults = useMemo(() => {
    const groups: { [key: string]: Observation[] } = {};

    filteredResults.forEach((result: Observation) => {
      const date = result.effectiveDateTime?.split('T')[0] || 'Unknown';
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(result);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({
        date,
        data: items,
      }));
  }, [filteredResults]);

  const renderFilterButton = useCallback(
    (filter: CategoryFilter) => (
      <TouchableOpacity
        key={filter.key}
        style={[
          styles.filterButton,
          {
            backgroundColor:
              selectedCategory === filter.key
                ? isDark
                  ? '#2563EB'
                  : '#2563EB'
                : isDark
                  ? '#374151'
                  : '#E5E7EB',
          },
        ]}
        onPress={() => setSelectedCategory(filter.key)}
      >
        <Text
          style={[
            styles.filterButtonText,
            {
              color: selectedCategory === filter.key ? '#FFFFFF' : isDark ? '#D1D5DB' : '#4B5563',
            },
          ]}
        >
          {filter.label}
        </Text>
      </TouchableOpacity>
    ),
    [selectedCategory, isDark]
  );

  const renderResult = useCallback(
    ({ item }: { item: Observation }) => (
      <LabResultItem
        result={item}
        isDark={isDark}
        onPress={() => {
          // Navigate to detail
        }}
      />
    ),
    [isDark]
  );

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

  if (isLoading && labResults.length === 0) {
    return <Loading message="Loading lab results..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
      {/* Filter Bar */}
      <View style={[styles.filterBar, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        {LAB_CATEGORIES.map(renderFilterButton)}
      </View>

      {/* Results List */}
      {groupedResults.length > 0 ? (
        <FlatList
          data={groupedResults}
          keyExtractor={item => item.date}
          renderItem={({ item }) => (
            <View style={styles.dateGroup}>
              {renderDateHeader(item.date)}
              {item.data.map((result, index) => (
                <View key={result.id || index}>{renderResult({ item: result })}</View>
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
          <Icon name="flask" size={64} color={isDark ? '#4B5563' : '#9CA3AF'} />
          <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            No lab results available
          </Text>
          <Text style={[styles.emptySubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            Connect a healthcare provider to sync your lab results
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
  labItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  labHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  labTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  labTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  labDate: {
    fontSize: 12,
  },
  labValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  labValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  referenceRange: {
    fontSize: 12,
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

export default LabResultsScreen;
