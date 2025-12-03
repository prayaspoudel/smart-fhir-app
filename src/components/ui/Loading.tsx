/**
 * Loading Indicator Component
 *
 * Reusable loading states with multiple variants.
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../theme';

type LoadingSize = 'small' | 'large';
type LoadingVariant = 'default' | 'overlay' | 'inline';

interface LoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  message?: string;
  color?: string;
  style?: ViewStyle;
  testID?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  variant = 'default',
  message,
  color = colors.primary[500],
  style,
  testID,
}) => {
  if (variant === 'overlay') {
    return (
      <View style={[styles.overlay, style]} testID={testID}>
        <View style={styles.overlayContent}>
          <ActivityIndicator size={size} color={color} />
          {message && <Text style={styles.overlayMessage}>{message}</Text>}
        </View>
      </View>
    );
  }

  if (variant === 'inline') {
    return (
      <View style={[styles.inline, style]} testID={testID}>
        <ActivityIndicator size={size} color={color} />
        {message && <Text style={styles.inlineMessage}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]} testID={testID}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

/**
 * Skeleton Loading Component
 *
 * Placeholder loading state for content.
 */
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as import('react-native').DimensionValue,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

/**
 * Full screen loading overlay
 */
interface FullScreenLoadingProps {
  visible: boolean;
  message?: string;
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({ visible, message }) => {
  if (!visible) return null;

  return (
    <View style={styles.fullScreen}>
      <View style={styles.fullScreenContent}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        {message && <Text style={styles.fullScreenMessage}>{message}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: colors.background.card,
    padding: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 150,
  },
  overlayMessage: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    textAlign: 'center',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  inlineMessage: {
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  skeleton: {
    backgroundColor: colors.neutral[200],
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  fullScreenContent: {
    alignItems: 'center',
  },
  fullScreenMessage: {
    marginTop: spacing.lg,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    textAlign: 'center',
  },
});

export default Loading;
