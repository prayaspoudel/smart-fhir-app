/**
 * ProviderCard Component
 *
 * Displays healthcare provider information with connection status.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';

export type ProviderConnectionStatus = 'connected' | 'disconnected' | 'syncing' | 'error';

interface ProviderCardProps {
  name: string;
  type: string;
  logoUrl?: string;
  status?: ProviderConnectionStatus;
  lastSynced?: string;
  recordCount?: number;
  onPress?: () => void;
  onSync?: () => void;
  testID?: string;
}

const getStatusColor = (status: ProviderConnectionStatus): string => {
  switch (status) {
    case 'connected':
      return colors.success.main;
    case 'disconnected':
      return colors.neutral[400];
    case 'syncing':
      return colors.info.main;
    case 'error':
      return colors.error.main;
    default:
      return colors.neutral[400];
  }
};

const getStatusLabel = (status: ProviderConnectionStatus): string => {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'disconnected':
      return 'Disconnected';
    case 'syncing':
      return 'Syncing...';
    case 'error':
      return 'Error';
    default:
      return 'Unknown';
  }
};

export const ProviderCard: React.FC<ProviderCardProps> = ({
  name,
  type,
  logoUrl,
  status = 'disconnected',
  lastSynced,
  recordCount,
  onPress,
  onSync,
  testID,
}) => {
  const statusColor = getStatusColor(status);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>{name.charAt(0)}</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.type}>{type}</Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusLabel, { color: statusColor }]}>{getStatusLabel(status)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        {lastSynced && <Text style={styles.lastSynced}>Last synced: {lastSynced}</Text>}
        {recordCount !== undefined && recordCount > 0 && (
          <Text style={styles.recordCount}>{recordCount} records</Text>
        )}
        {onSync && status === 'connected' && (
          <TouchableOpacity onPress={onSync} style={styles.syncButton}>
            <Text style={styles.syncButtonText}>🔄 Sync</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
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
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: spacing.md,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
  },
  type: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  lastSynced: {
    fontSize: typography.fontSize.xs,
    color: colors.text.hint,
  },
  recordCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  syncButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.xs,
  },
  syncButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
});

export default ProviderCard;
