/**
 * Records List Screen
 *
 * Main screen showing all medical records categories.
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecordsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RecordsStackParamList, 'RecordsList'>;

interface RecordCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  screen: keyof RecordsStackParamList;
  count?: number;
}

const CATEGORIES: RecordCategory[] = [
  {
    id: 'vitals',
    title: 'Vitals',
    description: 'Blood pressure, heart rate, weight, etc.',
    icon: '❤️',
    screen: 'Vitals',
  },
  {
    id: 'labs',
    title: 'Lab Results',
    description: 'Blood tests, urine tests, etc.',
    icon: '🧪',
    screen: 'LabResults',
  },
  {
    id: 'reports',
    title: 'Diagnostic Reports',
    description: 'Imaging, pathology reports, etc.',
    icon: '📋',
    screen: 'DiagnosticReports',
  },
  {
    id: 'medications',
    title: 'Medications',
    description: 'Current and past medications',
    icon: '💊',
    screen: 'Medications',
  },
  {
    id: 'encounters',
    title: 'Encounters',
    description: 'Office visits, hospital stays, etc.',
    icon: '🏥',
    screen: 'Encounters',
  },
];

const RecordsListScreen: React.FC<Props> = ({ navigation }) => {
  const handleCategoryPress = (category: RecordCategory) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigation.navigate(category.screen as any, {});
  };

  const renderCategory = (category: RecordCategory) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(category)}
    >
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryIconText}>{category.icon}</Text>
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
      </View>
      <View style={styles.categoryArrow}>
        <Text style={styles.categoryArrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Medical Records</Text>
          <Text style={styles.headerSubtitle}>View and manage your health data</Text>
        </View>

        <View style={styles.categoriesContainer}>{CATEGORIES.map(renderCategory)}</View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryArrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryArrowText: {
    fontSize: 24,
    color: '#9CA3AF',
  },
});

export default RecordsListScreen;
