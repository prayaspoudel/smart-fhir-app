/**
 * Card Component
 *
 * Reusable card container for content sections.
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof spacing | number;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  style,
  testID,
}) => {
  const getPadding = (): number => {
    if (typeof padding === 'number') {
      return padding;
    }
    return spacing[padding];
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          ...shadows.md,
          backgroundColor: colors.background.elevated,
        };
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: colors.border.default,
          backgroundColor: colors.background.card,
        };
      default:
        return {
          backgroundColor: colors.background.card,
        };
    }
  };

  const content = (
    <View
      style={[styles.card, getVariantStyles(), { padding: getPadding() }, style]}
      testID={testID}
    >
      {children}
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
  card: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
});

export default Card;
