/**
 * MedicationCard Component
 *
 * Displays medication information with dosage and status.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';

export type MedicationStatus = 'active' | 'completed' | 'stopped' | 'on-hold' | 'unknown';

interface MedicationCardProps {
  name: string;
  dosage: string;
  frequency: string;
  status?: MedicationStatus;
  prescriber?: string;
  startDate?: string;
  endDate?: string;
  onPress?: () => void;
  testID?: string;
}

const getStatusColor = (status: MedicationStatus): string => {
  switch (status) {
    case 'active':
      return colors.success.main;
    case 'completed':
      return colors.neutral[400];
    case 'stopped':
      return colors.error.main;
    case 'on-hold':
      return colors.warning.main;
    default:
      return colors.neutral[400];
  }
};

const getStatusLabel = (status: MedicationStatus): string => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'stopped':
      return 'Stopped';
    case 'on-hold':
      return 'On Hold';
    default:
      return 'Unknown';
  }
};

export const MedicationCard: React.FC<MedicationCardProps> = ({
  name,
  dosage,
  frequency,
  status = 'active',
  prescriber,
  startDate,
  endDate,
  onPress,
  testID,
}) => {
  const statusColor = getStatusColor(status);

  const content = (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>💊</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Dosage:</Text>
          <Text style={styles.detailValue}>{dosage}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Frequency:</Text>
          <Text style={styles.detailValue}>{frequency}</Text>
        </View>
        {prescriber && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Prescribed by:</Text>
            <Text style={styles.detailValue}>{prescriber}</Text>
          </View>
        )}
        {startDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Started:</Text>
            <Text style={styles.detailValue}>{startDate}</Text>
          </View>
        )}
        {endDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ends:</Text>
            <Text style={styles.detailValue}>{endDate}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.health.medications + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  headerContent: {
    flex: 1,
  },
  name: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semiBold,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
});

export default MedicationCard;
