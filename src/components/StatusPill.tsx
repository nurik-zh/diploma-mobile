import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export type RoadmapNodeStatus = 'locked' | 'not_started' | 'in_progress' | 'completed';

function labelFor(status: RoadmapNodeStatus): string {
  switch (status) {
    case 'completed':
      return 'ПРОЙДЕНО';
    case 'in_progress':
      return 'В ПРОЦЕССЕ';
    case 'not_started':
      return 'НЕ НАЧАТО';
    case 'locked':
    default:
      return 'ЗАБЛОКИРОВАНО';
  }
}

export function StatusPill({ status }: { status: RoadmapNodeStatus }) {
  const isLocked = status === 'locked';
  const isDone = status === 'completed';
  const isActive = status === 'in_progress';
  return (
    <View
      style={[
        styles.pill,
        isLocked && styles.locked,
        isDone && styles.done,
        isActive && styles.active,
      ]}
    >
      <Text
        style={[
          styles.text,
          isLocked && styles.textLocked,
          (isDone || isActive) && styles.textBright,
        ]}
      >
        {labelFor(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  done: { backgroundColor: colors.accentSoft, borderColor: 'rgba(124,58,237,0.45)' },
  active: { backgroundColor: 'rgba(168,85,247,0.14)', borderColor: 'rgba(168,85,247,0.45)' },
  locked: { backgroundColor: 'rgba(255,255,255,0.03)' },
  text: { color: colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  textBright: { color: colors.text },
  textLocked: { color: colors.locked },
});

