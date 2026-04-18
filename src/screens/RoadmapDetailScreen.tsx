import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { ProgressBar } from '../components/ProgressBar';
import { StatusPill, type RoadmapNodeStatus } from '../components/StatusPill';
import { getRoadmapTree, getTodayTasks } from '../api/services';
import type { DailyTask, RoadmapTree } from '../api/types';
import type { RoadmapsStackParamList } from '../navigation/types';
import { ThemeColors, cardShadow, radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<RoadmapsStackParamList, 'RoadmapDetail'>;

export function RoadmapDetailScreen({ route, navigation }: Props) {
  const { colors, mode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const elevation = useMemo(() => cardShadow(mode), [mode]);
  const { roadmapId, title } = route.params;
  const [tree, setTree] = useState<RoadmapTree>({});
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [t, tasks] = await Promise.all([getRoadmapTree(), getTodayTasks()]);
      setTree(t);
      setDailyTasks(tasks);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const nodes = tree[roadmapId] ?? [];
  const completed = nodes.filter((n) => n.status === 'completed').length;
  const inProgress = nodes.filter((n) => n.status === 'in_progress').length;
  const percent = nodes.length ? Math.round((completed / nodes.length) * 100) : 0;

  const dailyByNodeId = useMemo(() => {
    const map = new Map<string, DailyTask>();
    dailyTasks.forEach((t) => {
      if (t.nodeId) map.set(String(t.nodeId), t);
    });
    return map;
  }, [dailyTasks]);

  const header = useMemo(
    () => (
      <View style={[styles.progressCard, elevation]}>
        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>ПРОГРЕСС</Text>
          <Text style={styles.progressPct}>{percent}%</Text>
        </View>
        <ProgressBar value={percent} />
        <View style={styles.progressBadges}>
          <View style={styles.miniPill}>
            <Text style={styles.miniText}>
              {completed}/{nodes.length} завершено
            </Text>
          </View>
          <View style={styles.miniPill}>
            <Text style={styles.miniText}>{inProgress} в процессе</Text>
          </View>
        </View>
      </View>
    ),
    [completed, inProgress, nodes.length, percent, styles, elevation]
  );

  return (
    <ScreenScaffold title={title} loading={loading}>
      <FlatList
        data={nodes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.accent2}
          />
        }
        renderItem={({ item }) => {
          const status = (item.status ?? 'locked') as RoadmapNodeStatus;
          const locked = status === 'locked';
          const daily = dailyByNodeId.get(String(item.id));
          return (
            <Pressable
              disabled={locked}
              onPress={() =>
                navigation.navigate('Topic', { topicId: item.id, title: item.title })
              }
              style={({ pressed }) => [
                styles.row,
                locked && styles.rowLocked,
                pressed && !locked && { opacity: 0.85 },
              ]}
            >
              <Text style={[styles.topic, locked && styles.topicLocked]} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.right}>
                {daily ? (
                  <View style={styles.dailyPill}>
                    <Text style={styles.dailyText}>+{daily.points} Тест дня</Text>
                  </View>
                ) : null}
                <StatusPill status={status} />
              </View>
            </Pressable>
          );
        }}
      />
    </ScreenScaffold>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
    gap: spacing.sm,
  },
  progressCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glass,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressLabel: { color: colors.textMuted, fontWeight: '800', letterSpacing: 1, fontSize: 12 },
  progressPct: { color: colors.text, fontWeight: '900', fontSize: 14 },
  progressBadges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  miniPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardInset,
  },
  miniText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glass,
  },
  rowLocked: {
    backgroundColor: colors.cardInset,
    borderColor: colors.border,
    opacity: 0.85,
  },
  topic: { color: colors.text, fontWeight: '700', fontSize: 15, flex: 1, marginRight: spacing.sm },
  topicLocked: { color: colors.locked },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dailyPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.45)',
    backgroundColor: colors.accentSoft,
  },
  dailyText: { color: colors.text, fontSize: 11, fontWeight: '900', letterSpacing: 0.2 },
});

