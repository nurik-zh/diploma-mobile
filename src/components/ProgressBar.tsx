import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemeColors, radius } from '../theme';
import { useTheme } from '../context/ThemeContext';

export function ProgressBar({ value }: { value: number }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const v = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${v}%` }]} />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
});

