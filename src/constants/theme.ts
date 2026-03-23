export const Colors = {
  // Dark backgrounds
  background: '#0B0B14',
  surface: '#161625',
  surfaceSecondary: '#1E1E30',
  fill: '#252540',

  // Primary - teal/mint (calm, modern)
  primary: '#2DD4BF',
  primaryLight: 'rgba(45, 212, 191, 0.15)',
  primaryDark: '#14B8A6',

  // Accent - soft violet (warmth, attention)
  accent: '#A78BFA',
  accentLight: 'rgba(167, 139, 250, 0.15)',

  // Secondary accent - warm pink
  pink: '#F472B6',
  pinkLight: 'rgba(244, 114, 182, 0.15)',

  // Text - improved hierarchy
  text: '#F1F1F6',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  textMuted: '#4B5563',

  // Semantic
  warning: '#FBBF24',
  warningLight: 'rgba(251, 191, 36, 0.15)',
  danger: '#F87171',
  dangerLight: 'rgba(248, 113, 113, 0.15)',
  success: '#2DD4BF',
  successLight: 'rgba(45, 212, 191, 0.15)',

  // Borders & separators
  separator: 'rgba(255, 255, 255, 0.06)',
  border: 'rgba(255, 255, 255, 0.10)',

  // Gradient colors
  gradientPurple: '#7C3AED',
  gradientTeal: '#2DD4BF',
  gradientPink: '#EC4899',
  gradientBlue: '#3B82F6',

  // Legacy aliases
  cream: '#0B0B14',
  green: '#2DD4BF',
  greenLight: 'rgba(45, 212, 191, 0.15)',
  greenDark: '#14B8A6',
  greenBg: 'rgba(45, 212, 191, 0.15)',
  terracotta: '#A78BFA',
  terracottaLight: 'rgba(167, 139, 250, 0.15)',
  slate: '#F1F1F6',
  slateMuted: '#9CA3AF',
  white: '#F1F1F6',
  offWhite: '#1E1E30',
  warmGray: 'rgba(255, 255, 255, 0.10)',
  orange: '#FBBF24',
  orangeBg: 'rgba(251, 191, 36, 0.15)',
  red: '#F87171',
  redLight: 'rgba(248, 113, 113, 0.25)',
  redBg: 'rgba(248, 113, 113, 0.15)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSizes = {
  caption: 11,
  small: 13,
  body: 15,
  large: 17,
  h3: 20,
  h2: 26,
  h1: 34,
  hero: 42,
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
};
