/**
 * Records Navigator
 *
 * Medical records stack navigation:
 * - Records list (all records)
 * - Vitals
 * - Lab results
 * - Diagnostic reports
 * - Medications
 * - Encounters
 * - Detail screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RecordsStackParamList } from './types';

// Screens
import RecordsListScreen from '../screens/records/RecordsListScreen';
import VitalsScreen from '../screens/records/VitalsScreen';
import LabResultsScreen from '../screens/records/LabResultsScreen';
import DiagnosticReportsScreen from '../screens/records/DiagnosticReportsScreen';
import MedicationsScreen from '../screens/records/MedicationsScreen';
import EncountersScreen from '../screens/records/EncountersScreen';
import VitalDetailScreen from '../screens/records/VitalDetailScreen';
import LabResultDetailScreen from '../screens/records/LabResultDetailScreen';
import DiagnosticReportDetailScreen from '../screens/records/DiagnosticReportDetailScreen';
import MedicationDetailScreen from '../screens/records/MedicationDetailScreen';
import EncounterDetailScreen from '../screens/records/EncounterDetailScreen';
import RecordSearchScreen from '../screens/records/RecordSearchScreen';

const Stack = createNativeStackNavigator<RecordsStackParamList>();

const RecordsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="RecordsList"
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: '#2563EB',
        headerStyle: {
          backgroundColor: '#F9FAFB',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="RecordsList"
        component={RecordsListScreen}
        options={{
          title: 'Medical Records',
          headerLargeTitle: true,
        }}
      />

      <Stack.Screen
        name="Vitals"
        component={VitalsScreen}
        options={{
          title: 'Vitals',
        }}
      />

      <Stack.Screen
        name="LabResults"
        component={LabResultsScreen}
        options={{
          title: 'Lab Results',
        }}
      />

      <Stack.Screen
        name="DiagnosticReports"
        component={DiagnosticReportsScreen}
        options={{
          title: 'Diagnostic Reports',
        }}
      />

      <Stack.Screen
        name="Medications"
        component={MedicationsScreen}
        options={{
          title: 'Medications',
        }}
      />

      <Stack.Screen
        name="Encounters"
        component={EncountersScreen}
        options={{
          title: 'Encounters',
        }}
      />

      {/* Detail Screens */}
      <Stack.Screen
        name="VitalDetail"
        component={VitalDetailScreen}
        options={{
          title: 'Vital Signs',
        }}
      />

      <Stack.Screen
        name="LabResultDetail"
        component={LabResultDetailScreen}
        options={{
          title: 'Lab Result',
        }}
      />

      <Stack.Screen
        name="DiagnosticReportDetail"
        component={DiagnosticReportDetailScreen}
        options={{
          title: 'Report Details',
        }}
      />

      <Stack.Screen
        name="MedicationDetail"
        component={MedicationDetailScreen}
        options={{
          title: 'Medication',
        }}
      />

      <Stack.Screen
        name="EncounterDetail"
        component={EncounterDetailScreen}
        options={{
          title: 'Encounter',
        }}
      />

      <Stack.Screen
        name="RecordSearch"
        component={RecordSearchScreen}
        options={{
          title: 'Search Records',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default RecordsNavigator;
