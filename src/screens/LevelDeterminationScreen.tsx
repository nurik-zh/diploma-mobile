import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { PrimaryButton } from '../components/PrimaryButton';
import { getRoadmaps, getUserSkillLevels } from '../api/services';
import type { Roadmap, UserSkillLevel } from '../api/types';
import type { MainTabParamList } from '../navigation/types';
import { colors, radius, shadow, spacing } from '../theme';

export function LevelDeterminationScreen() {
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const [loading, setLoading] = useState(true);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [levels, setLevels] = useState<Record<string, UserSkillLevel>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [r, l] = await Promise.all([getRoadmaps(), getUserSkillLevels().catch(() => [])]);
      setRoadmaps(r);
      const byId: Record<string, UserSkillLevel> = {};
      l.forEach((x) => (byId[x.roadmapId] = x));
      setLevels(byId);
      setSelectedId((prev) => prev ?? r[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const selected = useMemo(
    () => roadmaps.find((r) => r.id === selectedId) ?? null,
    [roadmaps, selectedId]
  );

  return (
    <ScreenScaffold title="Определение уровня" loading={loading}>
      <View style={styles.content}>
        <View style={[styles.headerCard, shadow.card]}>
          <Text style={styles.hTitle}>Тесты по направлениям</Text>
          <Text style={styles.hSub}>
            Выберите направление: ИИ выдаст тест с вариантами ответов и открытые вопросы. После отправки уровень
            оценивается моделью и сохраняется в профиле.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Направления</Text>
        <FlatList
          data={roadmaps}
          keyExtractor={(i) => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.md }}
          renderItem={({ item }) => {
            const active = item.id === selectedId;
            const levelLabel = levels[item.id]?.levelLabel ?? 'Не определен';
            return (
              <Pressable
                onPress={() => setSelectedId(item.id)}
                style={[styles.rmCard, active && styles.rmCardActive]}
              >
                <Text style={styles.rmTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.rmDesc} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.levelPill}>
                  <Text style={styles.levelText}>{String(levelLabel).toUpperCase()}</Text>
                </View>
              </Pressable>
            );
          }}
        />

        <View style={[styles.detailCard, shadow.card]}>
          {selected ? (
            <>
              <Text style={styles.bigTitle}>{selected.title}</Text>
              <Text style={styles.bigSub}>{selected.description}</Text>
              <PrimaryButton
                label="Начать тест"
                onPress={() =>
                  tabNav.navigate('Roadmaps', {
                    screen: 'Assessment',
                    params: { roadmapId: selected.id, title: selected.title },
                  })
                }
                style={{ marginTop: spacing.lg }}
              />
            </>
          ) : (
            <Text style={styles.hSub}>Выберите направление</Text>
          )}
        </View>
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl * 3 },
  headerCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  hTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  hSub: { color: colors.textMuted, marginTop: 6, lineHeight: 18 },
  sectionTitle: { color: colors.textMuted, fontWeight: '900', letterSpacing: 0.9, fontSize: 12 },
  rmCard: {
    width: 240,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  rmCardActive: { borderColor: 'rgba(124,58,237,0.55)', backgroundColor: 'rgba(124,58,237,0.12)' },
  rmTitle: { color: colors.text, fontWeight: '900' },
  rmDesc: { color: colors.textMuted, marginTop: 6, fontSize: 12, lineHeight: 16 },
  levelPill: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  levelText: { color: colors.textMuted, fontWeight: '900', fontSize: 11, letterSpacing: 0.6 },
  detailCard: {
    marginTop: spacing.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  bigTitle: { color: colors.text, fontWeight: '900', fontSize: 18, textAlign: 'center' },
  bigSub: { color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center', lineHeight: 18 },
});

