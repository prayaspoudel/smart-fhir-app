/**
 * App Theme Configuration
 *
 * Centralized theme tokens for consistent styling across the app.
 * Follows Material Design 3 guidelines with healthcare-appropriate colors.
 */

export const colors = {
  // Primary colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#1E88E5', // Main primary
    600: '#1976D2',
    700: '#1565C0',
    800: '#0D47A1',
    900: '#0A3D91',
  },

  // Secondary colors
  secondary: {
    50: '#E0F7FA',
    100: '#B2EBF2',
    200: '#80DEEA',
    300: '#4DD0E1',
    400: '#26C6DA',
    500: '#00BCD4', // Main secondary
    600: '#00ACC1',
    700: '#0097A7',
    800: '#00838F',
    900: '#006064',
  },

  // Semantic colors
  success: {
    light: '#A5D6A7',
    main: '#4CAF50',
    dark: '#388E3C',
    contrastText: '#FFFFFF',
  },
  warning: {
    light: '#FFE082',
    main: '#FFC107',
    dark: '#FFA000',
    contrastText: '#000000',
  },
  error: {
    light: '#EF9A9A',
    main: '#F44336',
    dark: '#D32F2F',
    contrastText: '#FFFFFF',
  },
  info: {
    light: '#81D4FA',
    main: '#03A9F4',
    dark: '#0288D1',
    contrastText: '#FFFFFF',
  },

  // Neutral colors
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    1000: '#000000',
  },

  // Health-specific colors
  health: {
    vitals: '#2196F3',
    labs: '#9C27B0',
    medications: '#FF9800',
    encounters: '#4CAF50',
    diagnostics: '#F44336',
    immunizations: '#00BCD4',
    allergies: '#E91E63',
    conditions: '#795548',
  },

  // Vital signs color coding
  vitalsStatus: {
    normal: '#4CAF50',
    elevated: '#FFC107',
    high: '#FF9800',
    critical: '#F44336',
    low: '#2196F3',
  },

  // Background colors
  background: {
    default: '#FFFFFF',
    paper: '#F9FAFB',
    elevated: '#FFFFFF',
    card: '#FFFFFF',
  },

  // Text colors
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    disabled: '#9CA3AF',
    hint: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  // Border colors
  border: {
    default: '#E5E7EB',
    light: '#F3F4F6',
    focused: '#1E88E5',
    error: '#F44336',
  },
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },

  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },

  // Typography presets
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0.15,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
    letterSpacing: 0.15,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  overline: {
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
    textTransform: 'uppercase' as const,
  },
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const animation = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },
};

// Create the full theme object
export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  animation,
};

// Light theme
export const lightTheme = {
  ...theme,
  dark: false,
  colors: {
    ...theme.colors,
    background: {
      default: '#FFFFFF',
      paper: '#F9FAFB',
      elevated: '#FFFFFF',
      card: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      disabled: '#9CA3AF',
      hint: '#9CA3AF',
      inverse: '#FFFFFF',
    },
  },
};

// Dark theme
export const darkTheme = {
  ...theme,
  dark: true,
  colors: {
    ...theme.colors,
    background: {
      default: '#111827',
      paper: '#1F2937',
      elevated: '#374151',
      card: '#1F2937',
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      disabled: '#6B7280',
      hint: '#6B7280',
      inverse: '#111827',
    },
    border: {
      default: '#374151',
      light: '#1F2937',
      focused: '#42A5F5',
      error: '#EF5350',
    },
  },
};

export type Theme = typeof lightTheme;
export type ThemeColors = typeof colors;

export default theme;
