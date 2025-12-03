/**
 * Diagnostic Reports Screen
 *
 * Displays diagnostic reports like imaging and pathology.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecordsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RecordsStackParamList, 'DiagnosticReports'>;

interface DiagnosticReport {
  id: string;
  title: string;
  category: string;
  date: string;
  status: 'final' | 'preliminary' | 'cancelled';
  performer?: string;
}

// Sample data
const SAMPLE_REPORTS: DiagnosticReport[] = [
  {
    id: '1',
    title: 'Chest X-Ray',
    category: 'Radiology',
    date: '2024-01-15',
    status: 'final',
    performer: 'Dr. Smith',
  },
  {
    id: '2',
    title: 'MRI Brain',
    category: 'Radiology',
    date: '2024-01-10',
    status: 'final',
    performer: 'Dr. Johnson',
  },
  {
    id: '3',
    title: 'Pathology Report',
    category: 'Pathology',
    date: '2024-01-05',
    status: 'preliminary',
    performer: 'Dr. Williams',
  },
];

const DiagnosticReportsScreen: React.FC<Props> = ({ navigation }) => {
  const [reports] = useState<DiagnosticReport[]>(SAMPLE_REPORTS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
    setRefreshing(false);
  };

  const handleReportPress = (report: DiagnosticReport) => {
    navigation.navigate('DiagnosticReportDetail', {
      reportId: report.id,
      providerId: 'default',
    });
  };

  const getStatusColor = (status: DiagnosticReport['status']) => {
    switch (status) {
      case 'final':
        return '#059669';
      case 'preliminary':
        return '#D97706';
      case 'cancelled':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const renderReport = ({ item }: { item: DiagnosticReport }) => (
    <TouchableOpacity style={styles.reportCard} onPress={() => handleReportPress(item)}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.reportCategory}>{item.category}</Text>
      <View style={styles.reportFooter}>
        <Text style={styles.reportDate}>{item.date}</Text>
        {item.performer && <Text style={styles.reportPerformer}>{item.performer}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={reports}
        renderItem={renderReport}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No diagnostic reports found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: 16,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  reportCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reportDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reportPerformer: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default DiagnosticReportsScreen;
