import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { getLeaderboard, getProfile, getTodayTasks } from '../api/services';
import type { DailyTask, LeaderboardResponse, Profile } from '../api/types';
import { ThemeColors, cardShadow, radius, spacing } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export function HomeScreen() {
  const { colors, mode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const elevation = useMemo(() => cardShadow(mode), [mode]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayTasks, setTodayTasks] = useState<DailyTask[]>([]);
  const [leaders, setLeaders] = useState<
    { userId: number; fullName: string; points: number; rank: number }[]
  >([]);
  const [lbSelf, setLbSelf] = useState<LeaderboardResponse['currentUser'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, lb, tasks] = await Promise.all([
        getProfile(),
        getLeaderboard(),
        getTodayTasks().catch(() => [] as DailyTask[]),
      ]);
      setProfile(p);
      setTodayTasks(Array.isArray(tasks) ? tasks : []);
      setLeaders(lb.leaders.slice(0, 8));
      setLbSelf(lb.currentUser);
    } catch {
      setProfile(null);
      setLbSelf(null);
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

  const selfInLeaderboardTop = useMemo(() => {
    if (!profile) return false;
    return leaders.some((l) => l.userId === profile.id);
  }, [leaders, profile]);

  const hero = useMemo(() => {
    if (!profile) {
      return { title: '', subtitle: '', successIcon: false };
    }
    const total = todayTasks.length;
    const done = todayTasks.filter((t) => t.completed).length;
    const allDone = total > 0 && done === total;
    const title =
      total === 0
        ? 'Сводка дня'
        : allDone
          ? 'Все сделано на сегодня'
          : 'Квесты на сегодня';
    const subtitle =
      total > 0
        ? `Квесты дня: ${done} из ${total}`
        : `Пройдено тестов по дорожкам: ${profile.completedTests}`;
    return { title, subtitle, successIcon: allDone };
  }, [profile, todayTasks]);

  return (
    <ScreenScaffold title="Diploma" loading={loading}>
      <ScrollView
        contentContainerStyle={styles.content}
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
      >
        {profile ? (
          <>
            <View style={[styles.heroCard, elevation]}>
              <Text style={styles.heroTitle}>{hero.title}</Text>
              <View style={styles.heroMeta}>
                <MaterialCommunityIcons
                  name={hero.successIcon ? 'check-decagram' : 'clipboard-text-outline'}
                  size={18}
                  color={hero.successIcon ? colors.success : colors.textMuted}
                />
                <Text style={styles.heroMetaText}>{hero.subtitle}</Text>
              </View>
            </View>

            <View style={[styles.rankCard, elevation]}>
              <Text style={styles.sectionTitle}>Топ платформы</Text>
              {leaders.map((l) => {
                const isYou = l.userId === profile.id;
                return (
                  <View
                    key={l.userId}
                    style={[styles.row, isYou ? styles.rowYou : styles.rowDefault]}
                  >
                    <Text style={[styles.rank, isYou && styles.rankYou]}>#{l.rank}</Text>
                    <Text style={[styles.name, isYou && styles.nameYou]} numberOfLines={1}>
                      {l.fullName}
                    </Text>
                    <Text style={[styles.pts, isYou && styles.ptsYou]}>{l.points}</Text>
                  </View>
                );
              })}
              {!selfInLeaderboardTop && lbSelf && lbSelf.userId === profile.id ? (
                <>
                  <View style={styles.rankGap}>
                    <View style={styles.rankGapLine} />
                    <Text style={styles.rankGapText}>ваше место в общем рейтинге</Text>
                    <View style={styles.rankGapLine} />
                  </View>
                  <View style={[styles.row, styles.rowYou, styles.rowYouLast]}>
                    <Text style={[styles.rank, styles.rankYou]}>#{lbSelf.rank}</Text>
                    <Text style={[styles.name, styles.nameYou]} numberOfLines={1}>
                      {lbSelf.fullName}
                    </Text>
                    <Text style={[styles.pts, styles.ptsYou]}>{lbSelf.points}</Text>
                  </View>
                </>
              ) : null}
            </View>
          </>
        ) : (
          <Text style={styles.err}>Не удалось загрузить профиль</Text>
        )}
      </ScrollView>
    </ScreenScaffold>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  heroCard: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heroMeta: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardInset,
  },
  heroMetaText: { color: colors.text, fontWeight: '600', fontSize: 16 },
  rankCard: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  rowDefault: {
    marginHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowYou: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.22)',
    marginVertical: spacing.xs,
    borderBottomWidth: 0,
  },
  rowYouLast: { marginBottom: 0 },
  rankYou: { color: colors.accentDark },
  nameYou: { color: colors.text, fontWeight: '700' },
  ptsYou: { color: colors.text, fontWeight: '700' },
  rankGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  rankGapLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  rankGapText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rank: { width: 40, color: colors.accent, fontWeight: '700', fontSize: 16 },
  name: { flex: 1, minWidth: 0, color: colors.text, fontSize: 16, fontWeight: '600' },
  pts: { color: colors.textMuted, fontWeight: '600', fontSize: 16 },
  err: { color: colors.danger },
});
