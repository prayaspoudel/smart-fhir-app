/**
 * VitalCard Component
 *
 * Displays a single vital sign with status indicator.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';

export type VitalStatus = 'normal' | 'elevated' | 'high' | 'critical' | 'low';

interface VitalCardProps {
  title: string;
  value: string | number;
  unit: string;
  status?: VitalStatus;
  timestamp?: string;
  onPress?: () => void;
  testID?: string;
}

const getStatusColor = (status: VitalStatus): string => {
  return colors.vitalsStatus[status] || colors.vitalsStatus.normal;
};

const getStatusLabel = (status: VitalStatus): string => {
  switch (status) {
    case 'normal':
      return 'Normal';
    case 'elevated':
      return 'Elevated';
    case 'high':
      return 'High';
    case 'critical':
      return 'Critical';
    case 'low':
      return 'Low';
    default:
      return '';
  }
};

export const VitalCard: React.FC<VitalCardProps> = ({
  title,
  value,
  unit,
  status = 'normal',
  timestamp,
  onPress,
  testID,
}) => {
  const statusColor = getStatusColor(status);

  const content = (
    <View style={[styles.container, { borderLeftColor: statusColor }]} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {status !== 'normal' && (
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
          </View>
        )}
      </View>

      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: statusColor }]}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>

      {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
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
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semiBold,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  unit: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.hint,
    marginTop: spacing.xs,
  },
});

export default VitalCard;
