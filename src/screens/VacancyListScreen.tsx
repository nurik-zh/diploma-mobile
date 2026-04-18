import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { getVacancies } from '../api/services';
import type { VacancyListItem } from '../api/types';
import type { VacanciesStackParamList } from '../navigation/types';
import { ThemeColors, cardShadow, radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Props = {
  navigation: NativeStackNavigationProp<VacanciesStackParamList, 'VacancyList'>;
};

export function VacancyListScreen({ navigation }: Props) {
  const { colors, mode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const elevation = useMemo(() => cardShadow(mode), [mode]);
  const [items, setItems] = useState<VacancyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');
  const [level, setLevel] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const v = await getVacancies();
      setItems(v);
    } catch {
      setItems([]);
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

  const filtered = items.filter((v) => {
    const s = `${v.title} ${v.company} ${v.tags.join(' ')} ${v.level} ${v.location}`.toLowerCase();
    const okQ = !q.trim() || s.includes(q.trim().toLowerCase());
    const okLevel = !level || v.level.toLowerCase().includes(level.toLowerCase());
    return okQ && okLevel;
  });

  return (
    <ScreenScaffold title="Вакансии" loading={loading}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md }}>
            <View style={[styles.headerCard, elevation]}>
              <Text style={styles.hTitle}>Карьерный трек</Text>
              <Text style={styles.hSub}>Выберите вакансию и перейдите в план подготовки</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Открытых позиций</Text>
                  <Text style={styles.statVal}>{items.length}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Компаний</Text>
                  <Text style={styles.statVal}>{new Set(items.map((i) => i.company)).size}</Text>
                </View>
              </View>
            </View>
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Поиск вакансии, компании, тега..."
              placeholderTextColor={colors.textMuted}
              style={styles.search}
            />
            <View style={styles.filters}>
              <Pressable
                style={[styles.chip, level === null && styles.chipActive]}
                onPress={() => setLevel(null)}
              >
                <Text style={[styles.chipText, level === null && styles.chipTextActive]}>Все</Text>
              </Pressable>
              {['junior', 'middle', 'senior'].map((l) => (
                <Pressable
                  key={l}
                  style={[styles.chip, level === l && styles.chipActive]}
                  onPress={() => setLevel(l)}
                >
                  <Text style={[styles.chipText, level === l && styles.chipTextActive]}>
                    {l.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
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
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, elevation, pressed && { opacity: 0.9 }]}
            onPress={() =>
              navigation.navigate('VacancyDetail', {
                id: item.id,
                title: item.title,
              })
            }
          >
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.company}>{item.company}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>
                  {item.level} · {item.location} · {item.employment}
                </Text>
              </View>
              <View style={styles.levelPill}>
                <Text style={styles.levelText}>{item.level.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.salaryRow}>
              <Text style={styles.salary}>{item.salaryRange}</Text>
              <View style={styles.tasksPill}>
                <Text style={styles.tasksText}>{item._count?.realTasks ?? 0} задач</Text>
              </View>
            </View>
            <View style={styles.tags}>
              {item.tags.slice(0, 4).map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          </Pressable>
        )}
      />
    </ScreenScaffold>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  list: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  headerCard: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  hTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  hSub: { color: colors.textMuted, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  statBox: {
    flex: 1,
    backgroundColor: colors.cardInset,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  statLabel: { color: colors.textMuted, fontWeight: '900', fontSize: 11, letterSpacing: 0.8 },
  statVal: { color: colors.text, fontWeight: '900', fontSize: 18, marginTop: 6 },
  search: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardInset,
    color: colors.text,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  filters: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardInset,
  },
  chipActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  chipText: { color: colors.textMuted, fontWeight: '900', fontSize: 11, letterSpacing: 0.6 },
  chipTextActive: { color: colors.text },
  card: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  company: { color: colors.accent, fontWeight: '700', fontSize: 13 },
  title: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: 4 },
  meta: { color: colors.textMuted, marginTop: spacing.sm, fontSize: 13 },
  levelPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardInset,
  },
  levelText: { color: colors.textMuted, fontWeight: '900', fontSize: 11, letterSpacing: 0.6 },
  salaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  salary: { color: colors.success, fontWeight: '800' },
  tasksPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardInset,
  },
  tasksText: { color: colors.textMuted, fontWeight: '900', fontSize: 11, letterSpacing: 0.4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  tag: {
    backgroundColor: colors.cardInset,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  tagText: { color: colors.textMuted, fontSize: 12 },
});
