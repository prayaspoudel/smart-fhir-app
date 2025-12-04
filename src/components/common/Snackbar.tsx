/**
 * Snackbar Component
 *
 * A global notification system for showing alerts, errors, and success messages.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type SnackbarType = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarProps {
  visible: boolean;
  message: string;
  type?: SnackbarType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
  onDismiss: () => void;
}

const getTypeConfig = (type: SnackbarType) => {
  switch (type) {
    case 'success':
      return {
        backgroundColor: '#059669',
        icon: 'check-circle',
      };
    case 'error':
      return {
        backgroundColor: '#DC2626',
        icon: 'alert-circle',
      };
    case 'warning':
      return {
        backgroundColor: '#D97706',
        icon: 'alert',
      };
    case 'info':
    default:
      return {
        backgroundColor: '#2563EB',
        icon: 'information',
      };
  }
};

const Snackbar: React.FC<SnackbarProps> = ({
  visible,
  message,
  type = 'info',
  duration = 4000,
  action,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const config = getTypeConfig(type);

  const handleDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  }, [translateY, opacity, onDismiss]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        timer = setTimeout(() => {
          handleDismiss();
        }, duration);
      }
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [visible, duration, translateY, opacity, handleDismiss]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          transform: [{ translateY }],
          opacity,
          bottom: insets.bottom + 16,
        },
      ]}
    >
      <View style={styles.content}>
        <Icon name={config.icon} size={24} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
      <View style={styles.actions}>
        {action && (
          <TouchableOpacity onPress={action.onPress} style={styles.actionButton}>
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
          <Icon name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 4,
  },
});

export default Snackbar;
