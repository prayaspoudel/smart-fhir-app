/**
 * Vital Detail Screen
 *
 * Displays detailed information about a specific vital sign observation.
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecordsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RecordsStackParamList, 'VitalDetail'>;

const VitalDetailScreen: React.FC<Props> = ({ route }) => {
  const { observationId } = route.params;

  // In a real app, this would fetch the observation data
  const vitalData = {
    type: 'Blood Pressure',
    value: '120/80',
    unit: 'mmHg',
    date: '2024-01-15 09:30',
    status: 'Normal',
    notes: 'Measured at rest',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.vitalType}>{vitalData.type}</Text>
          <Text style={styles.vitalValue}>
            {vitalData.value} <Text style={styles.vitalUnit}>{vitalData.unit}</Text>
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{vitalData.status}</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>{vitalData.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Observation ID</Text>
            <Text style={styles.detailValue}>{observationId}</Text>
          </View>
          {vitalData.notes && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.detailValue}>{vitalData.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  vitalType: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  vitalValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  vitalUnit: {
    fontSize: 18,
    fontWeight: '400',
    color: '#6B7280',
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  detailRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1F2937',
  },
});

export default VitalDetailScreen;
