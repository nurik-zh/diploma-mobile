import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenScaffold } from '../components/ScreenScaffold';
import {
  getRoadmapCollection,
  getRoadmapTree,
  getRoadmaps,
  getUserSkillLevels,
  removeRoadmapFromCollection,
} from '../api/services';
import type { Roadmap, RoadmapTree } from '../api/types';
import type { RoadmapsStackParamList } from '../navigation/types';
import { ProgressBar } from '../components/ProgressBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { ThemeColors, cardShadow, radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Props = {
  navigation: NativeStackNavigationProp<RoadmapsStackParamList, 'RoadmapList'>;
};

export function RoadmapListScreen({ navigation }: Props) {
  const { colors, mode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const elevation = useMemo(() => cardShadow(mode), [mode]);
  const [list, setList] = useState<Roadmap[]>([]);
  const [tree, setTree] = useState<RoadmapTree>({});
  const [collection, setCollection] = useState<string[]>([]);
  const [skillLevels, setSkillLevels] = useState<Record<string, { levelLabel: string }>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [maps, t, col, levels] = await Promise.all([
        getRoadmaps(),
        getRoadmapTree(),
        getRoadmapCollection(),
        getUserSkillLevels().catch(() => []),
      ]);
      setList(maps);
      setTree(t);
      setCollection(col);
      const byId: Record<string, { levelLabel: string }> = {};
      levels.forEach((l) => (byId[l.roadmapId] = { levelLabel: l.levelLabel }));
      setSkillLevels(byId);
    } catch {
      setList([]);
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

  const my = list.filter((r) => collection.includes(r.id));
  const other = list.filter((r) => !collection.includes(r.id));

  return (
    <ScreenScaffold title="Дорожные карты" loading={loading}>
      <FlatList
        data={[{ key: 'my' }, { key: 'other' }] as { key: 'my' | 'other' }[]}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.accent}
          />
        }
        renderItem={({ item }) => {
          const items = item.key === 'my' ? my : other;
          const title = item.key === 'my' ? 'Мои дорожные карты' : 'Добавить направление';
          return (
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={styles.sectionTitle}>{title}</Text>
              {items.length === 0 ? (
                <Text style={styles.empty}>
                  {item.key === 'my' ? 'Нет выбранных направлений' : 'Пока нет доступных направлений'}
                </Text>
              ) : (
                items.map((rm) => {
                  const nodes = tree[rm.id] ?? [];
                  const completed = nodes.filter((n) => n.status === 'completed').length;
                  const percent = nodes.length ? Math.round((completed / nodes.length) * 100) : 0;
                  const userLevel = skillLevels[rm.id]?.levelLabel;
                  return (
                    <View key={rm.id} style={[styles.card, elevation]}>
                      <View style={styles.topRow}>
                        <View style={styles.levelPill}>
                          <Text style={styles.levelText}>
                            {(userLevel || rm.level || 'BEGINNER').toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.cardTitle}>{rm.title}</Text>
                      <Text style={styles.cardDesc} numberOfLines={2}>
                        {rm.description}
                      </Text>

                      {item.key === 'my' ? (
                        <View style={styles.progressBlock}>
                          <Text style={styles.progressLabel}>ПРОГРЕСС</Text>
                          <View style={styles.progressMeta}>
                            <Text style={styles.progressCount}>
                              {completed}/{nodes.length} тем
                            </Text>
                            <Text style={styles.progressPct}>{percent}%</Text>
                          </View>
                          <ProgressBar value={percent} />
                        </View>
                      ) : null}

                      <View style={styles.actions}>
                        {item.key === 'my' ? (
                          <>
                            <PrimaryButton
                              label="Открыть карту"
                              onPress={() =>
                                navigation.navigate('RoadmapDetail', {
                                  roadmapId: rm.id,
                                  title: rm.title,
                                  level: rm.level,
                                  description: rm.description,
                                })
                              }
                              style={{ flex: 1 }}
                            />
                            <PrimaryButton
                              label="Удалить"
                              variant="outline"
                              onPress={() => {
                                Alert.alert(
                                  'Удалить дорожку?',
                                  `Вы точно хотите удалить «${rm.title}» из ваших направлений?`,
                                  [
                                    { text: 'Отмена', style: 'cancel' },
                                    {
                                      text: 'Удалить',
                                      style: 'destructive',
                                      onPress: async () => {
                                        await removeRoadmapFromCollection(rm.id);
                                        await load();
                                      },
                                    },
                                  ]
                                );
                              }}
                              style={{ flex: 1 }}
                            />
                          </>
                        ) : (
                          <PrimaryButton
                            label="Пройти оценку"
                            onPress={() =>
                              navigation.navigate('Assessment', { roadmapId: rm.id, title: rm.title })
                            }
                            style={{ flex: 1 }}
                          />
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          );
        }}
      />
    </ScreenScaffold>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  list: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.9,
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glass,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardInset,
    alignSelf: 'flex-start',
  },
  levelText: { color: colors.textMuted, fontSize: 11, fontWeight: '900', letterSpacing: 0.6 },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: spacing.sm },
  cardDesc: { color: colors.textMuted, marginTop: spacing.xs, fontSize: 13, lineHeight: 18 },
  progressBlock: { marginTop: spacing.md },
  progressLabel: { color: colors.textMuted, fontWeight: '800', letterSpacing: 1, fontSize: 12 },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressCount: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  progressPct: { color: colors.text, fontSize: 12, fontWeight: '900' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  empty: { color: colors.textMuted },
});
