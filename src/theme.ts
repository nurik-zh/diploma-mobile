export const darkColors = {
  bg: '#070A10',
  bg2: '#0B1020',
  bgElevated: 'rgba(255,255,255,0.06)',
  surface: 'rgba(255,255,255,0.05)',
  glass: 'rgba(255,255,255,0.06)',
  glass2: 'rgba(255,255,255,0.10)',
  border: 'rgba(255,255,255,0.10)',
  text: '#F3F4F6',
  textMuted: 'rgba(243,244,246,0.68)',
  accent: '#7C3AED',
  accent2: '#A855F7',
  accentDark: '#5B21B6',
  accentSoft: 'rgba(124,58,237,0.18)',
  success: '#34D399',
  danger: '#FB7185',
  warning: '#FBBF24',
  locked: 'rgba(243,244,246,0.35)',
  cardInset: 'rgba(255,255,255,0.06)',
} as const;

export const lightColors = {
  bg: '#F5F6FA',
  bg2: '#FFFFFF',
  bgElevated: '#FFFFFF',
  surface: '#F8FAFC',
  glass: '#FFFFFF',
  glass2: '#F8FAFC',
  border: '#E3E8EF',
  text: '#111827',
  textMuted: '#6B7280',
  accent: '#4F46E5',
  accent2: '#7C3AED',
  accentDark: '#3730A3',
  accentSoft: 'rgba(79,70,229,0.12)',
  success: '#059669',
  danger: '#DC2626',
  warning: '#D97706',
  locked: '#9CA3AF',
  cardInset: '#F1F5F9',
} as const;

export type ThemeColors = {
  bg: string;
  bg2: string;
  bgElevated: string;
  surface: string;
  glass: string;
  glass2: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accent2: string;
  accentDark: string;
  accentSoft: string;
  success: string;
  danger: string;
  warning: string;
  locked: string;
  cardInset: string;
};
export type ThemeMode = 'dark' | 'light';

export const colors = darkColors;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
} as const;

/** Softer elevation for light mode (soft UI). */
export const shadowLightCard = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.08,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 10,
} as const;

export function cardShadow(mode: ThemeMode) {
  return mode === 'light' ? shadowLightCard : shadow.card;
}
