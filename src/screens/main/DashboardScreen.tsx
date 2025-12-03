/**
 * Dashboard Screen
 *
 * Main home screen showing:
 * - Patient summary
 * - Recent vitals
 * - Active medications
 * - Upcoming appointments
 * - Recent activity
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppSelector, useAppDispatch } from '../../store';
import { selectCurrentPatient, selectCurrentProviderId } from '../../store/slices/authSlice';
import { selectIsDarkMode } from '../../store/slices/uiSlice';
import { useDashboardData } from '../../query/useFHIRData';
import { setRefreshing, selectIsRefreshing } from '../../store/slices/uiSlice';
import { Observation } from '../../domain/entities/Observation';
import { MedicationRequest } from '../../domain/entities/MedicationRequest';
import { Config } from '../../utils/config';

const { width } = Dimensions.get('window');

// Card component for dashboard sections
interface DashboardCardProps {
  title: string;
  icon: string;
  onPress?: () => void;
  children: React.ReactNode;
  isDark: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  onPress,
  children,
  isDark,
}) => (
  <TouchableOpacity
    style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.cardHeader}>
      <View style={styles.cardTitleContainer}>
        <Icon name={icon} size={20} color={isDark ? '#60A5FA' : '#2563EB'} />
        <Text style={[styles.cardTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>{title}</Text>
      </View>
      {onPress && <Icon name="chevron-right" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />}
    </View>
    {children}
  </TouchableOpacity>
);

// Vital display component
interface VitalItemProps {
  observation: Observation;
  isDark: boolean;
}

const VitalItem: React.FC<VitalItemProps> = ({ observation, isDark }) => {
  const displayValue = useMemo(() => {
    if (observation.valueQuantity) {
      return `${observation.valueQuantity.value} ${observation.valueQuantity.unit || ''}`;
    }
    if (observation.valueString) {
      return observation.valueString;
    }
    return 'N/A';
  }, [observation]);

  const displayName = observation.code?.coding?.[0]?.display || 'Vital Sign';
  const isAbnormal = observation.interpretation?.[0]?.coding?.[0]?.code !== 'N';

  return (
    <View style={styles.vitalItem}>
      <Text style={[styles.vitalName, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        {displayName}
      </Text>
      <Text
        style={[
          styles.vitalValue,
          {
            color: isAbnormal ? '#EF4444' : isDark ? '#F9FAFB' : '#111827',
          },
        ]}
      >
        {displayValue}
      </Text>
    </View>
  );
};

// Medication display component
interface MedicationItemProps {
  medication: MedicationRequest;
  isDark: boolean;
}

const MedicationItem: React.FC<MedicationItemProps> = ({ medication, isDark }) => {
  const name =
    medication.medicationCodeableConcept?.coding?.[0]?.display ||
    medication.medicationCodeableConcept?.text ||
    'Medication';

  const dosage = medication.dosageInstruction?.[0]?.text || '';

  return (
    <View style={styles.medicationItem}>
      <Icon name="pill" size={16} color={isDark ? '#60A5FA' : '#2563EB'} />
      <View style={styles.medicationInfo}>
        <Text
          style={[styles.medicationName, { color: isDark ? '#F9FAFB' : '#111827' }]}
          numberOfLines={1}
        >
          {name}
        </Text>
        {dosage && (
          <Text
            style={[styles.medicationDosage, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
            numberOfLines={1}
          >
            {dosage}
          </Text>
        )}
      </View>
    </View>
  );
};

const DashboardScreen: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const patient = useAppSelector(selectCurrentPatient);
  const providerId = useAppSelector(selectCurrentProviderId);
  const isDark = useAppSelector(selectIsDarkMode);
  const isRefreshing = useAppSelector(selectIsRefreshing);

  // Fetch dashboard data
  const { vitals, medications, isLoading, refetchAll } = useDashboardData({
    patientId: patient?.id || '',
    providerBaseUrl: Config.DEFAULT_FHIR_SERVER_URL,
    enabled: !!patient?.id,
  });

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    dispatch(setRefreshing(true));
    try {
      await refetchAll();
    } finally {
      dispatch(setRefreshing(false));
    }
  }, [dispatch, refetchAll]);

  // Get patient display name
  const patientName = useMemo(() => {
    if (!patient) return 'Patient';
    const name = patient.name?.[0];
    if (!name) return 'Patient';
    const given = name.given?.join(' ') || '';
    const family = name.family || '';
    return `${given} ${family}`.trim() || 'Patient';
  }, [patient]);

  // Get recent vitals (last 3)
  const recentVitals = useMemo((): Observation[] => {
    return vitals.slice(0, 3);
  }, [vitals]);

  // Get active medications (up to 3)
  const activeMeds = useMemo((): MedicationRequest[] => {
    return medications.filter((m: MedicationRequest) => m.status === 'active').slice(0, 3);
  }, [medications]);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || isLoading}
            onRefresh={handleRefresh}
            tintColor={isDark ? '#60A5FA' : '#2563EB'}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Welcome back,
            </Text>
            <Text style={[styles.patientName, { color: isDark ? '#F9FAFB' : '#111827' }]}>
              {patientName}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <Icon name="bell-outline" size={24} color={isDark ? '#F9FAFB' : '#111827'} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: isDark ? '#1E40AF' : '#2563EB' }]}
            onPress={() => navigation.navigate('Records' as never, { screen: 'Vitals' })}
          >
            <Icon name="heart-pulse" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Vitals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: isDark ? '#065F46' : '#059669' }]}
            onPress={() => navigation.navigate('Records' as never, { screen: 'LabResults' })}
          >
            <Icon name="flask" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Labs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: isDark ? '#7C2D12' : '#EA580C' }]}
            onPress={() => navigation.navigate('Records' as never, { screen: 'Medications' })}
          >
            <Icon name="pill" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Meds</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: isDark ? '#581C87' : '#7C3AED' }]}
            onPress={() => navigation.navigate('Records' as never, { screen: 'Encounters' })}
          >
            <Icon name="calendar" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Visits</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Vitals */}
        <DashboardCard
          title="Recent Vitals"
          icon="heart-pulse"
          isDark={isDark}
          onPress={() => navigation.navigate('Records' as never, { screen: 'Vitals' })}
        >
          {recentVitals.length > 0 ? (
            <View style={styles.vitalsGrid}>
              {recentVitals.map((vital, index) => (
                <VitalItem key={vital.id || index} observation={vital} isDark={isDark} />
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              No recent vitals recorded
            </Text>
          )}
        </DashboardCard>

        {/* Active Medications */}
        <DashboardCard
          title="Active Medications"
          icon="pill"
          isDark={isDark}
          onPress={() => navigation.navigate('Records' as never, { screen: 'Medications' })}
        >
          {activeMeds.length > 0 ? (
            <View style={styles.medicationsList}>
              {activeMeds.map((med, index) => (
                <MedicationItem key={med.id || index} medication={med} isDark={isDark} />
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              No active medications
            </Text>
          )}
        </DashboardCard>

        {/* Connected Providers */}
        <DashboardCard
          title="Healthcare Providers"
          icon="hospital-building"
          isDark={isDark}
          onPress={() => navigation.navigate('Providers' as never)}
        >
          <View style={styles.providerInfo}>
            <Icon name="check-circle" size={16} color="#22C55E" />
            <Text style={[styles.providerText, { color: isDark ? '#F9FAFB' : '#111827' }]}>
              {providerId ? '1 provider connected' : 'No providers connected'}
            </Text>
          </View>
        </DashboardCard>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  patientName: {
    fontSize: 24,
    fontWeight: '700',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAction: {
    width: (width - 48) / 4 - 4,
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vitalItem: {
    width: '32%',
    marginBottom: 8,
  },
  vitalName: {
    fontSize: 12,
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  medicationsList: {
    gap: 8,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  medicationInfo: {
    flex: 1,
    marginLeft: 8,
  },
  medicationName: {
    fontSize: 14,
    fontWeight: '500',
  },
  medicationDosage: {
    fontSize: 12,
    marginTop: 2,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerText: {
    fontSize: 14,
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default DashboardScreen;
