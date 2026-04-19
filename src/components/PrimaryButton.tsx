import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors, radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = 'primary',
  style,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isOutline = variant === 'outline';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        isOutline ? styles.outline : styles.filled,
        { minWidth: 0 },
        pressed && { opacity: 0.85 },
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      {isOutline ? (
        <Text style={[styles.labelOutlineBtn, styles.labelOutline]} numberOfLines={2}>
          {label}
        </Text>
      ) : (
        <LinearGradient
          colors={[colors.accent, colors.accent2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.inner}>
            <Text style={styles.label} numberOfLines={2}>
              {label}
            </Text>
          </View>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  btn: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    overflow: 'hidden',
  },
  filled: { backgroundColor: colors.accent, paddingVertical: 0, paddingHorizontal: 0 },
  outline: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 50,
    justifyContent: 'center',
  },
  gradient: { alignSelf: 'stretch', width: '100%' },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xs,
  },
  /** На градиенте всегда светлый текст — читается и в светлой, и в тёмной теме. */
  label: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.28)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  labelOutline: { color: colors.text },
  labelOutlineBtn: {
    fontWeight: '800',
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
});
