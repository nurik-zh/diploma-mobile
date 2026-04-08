export const colors = {
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
};

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
