/**
 * Button Component
 *
 * Reusable button component with multiple variants.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  onPress,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const getBackgroundColor = (): string => {
    if (isDisabled) {
      return colors.neutral[200];
    }
    switch (variant) {
      case 'primary':
        return colors.primary[500];
      case 'secondary':
        return colors.secondary[500];
      case 'outline':
      case 'ghost':
        return 'transparent';
      case 'danger':
        return colors.error.main;
      default:
        return colors.primary[500];
    }
  };

  const getBorderColor = (): string => {
    if (isDisabled) {
      return colors.neutral[300];
    }
    switch (variant) {
      case 'outline':
        return colors.primary[500];
      default:
        return 'transparent';
    }
  };

  const getTextColor = (): string => {
    if (isDisabled) {
      return colors.neutral[400];
    }
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return colors.neutral[0];
      case 'outline':
      case 'ghost':
        return colors.primary[500];
      default:
        return colors.neutral[0];
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
          minHeight: 32,
        };
      case 'large':
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          minHeight: 56,
        };
      default:
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          minHeight: 44,
        };
    }
  };

  const getTextSize = (): number => {
    switch (size) {
      case 'small':
        return typography.fontSize.sm;
      case 'large':
        return typography.fontSize.lg;
      default:
        return typography.fontSize.md;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getSizeStyles(),
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={isDisabled}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost' ? colors.primary[500] : colors.neutral[0]
          }
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getTextSize(),
                marginLeft: leftIcon ? spacing.xs : 0,
                marginRight: rightIcon ? spacing.xs : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: typography.fontWeight.semiBold,
    textAlign: 'center',
  },
});

export default Button;
