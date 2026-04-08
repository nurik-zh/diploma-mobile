import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { PrimaryButton } from '../components/PrimaryButton';
import { getLeaderboard, getProfile } from '../api/services';
import type { Profile } from '../api/types';
import { colors, radius, spacing } from '../theme';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../navigation/types';

export function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Home'>>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [leaders, setLeaders] = useState<
    { userId: number; fullName: string; points: number; rank: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, lb] = await Promise.all([getProfile(), getLeaderboard()]);
      setProfile(p);
      setLeaders(lb.leaders.slice(0, 8));
    } catch {
      setProfile(null);
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

  return (
    <ScreenScaffold title="Главная" loading={loading}>
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
            <View style={styles.hero}>
              <Text style={styles.greeting}>Привет, {profile.fullName}</Text>
              <Text style={styles.points}>{profile.points} очков</Text>
              <Text style={styles.sub}>
                Тестов пройдено: {profile.completedTests} · {profile.city}
              </Text>
            </View>

            <PrimaryButton
              label="Квесты дня"
              onPress={() =>
                navigation.navigate('Profile', { screen: 'DailyTasks' })
              }
              style={styles.cta}
            />

            <Text style={styles.sectionTitle}>Топ платформы</Text>
            {leaders.map((l) => (
              <View key={l.userId} style={styles.row}>
                <Text style={styles.rank}>#{l.rank}</Text>
                <Text style={styles.name} numberOfLines={1}>
                  {l.fullName}
                </Text>
                <Text style={styles.pts}>{l.points}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.err}>Не удалось загрузить профиль</Text>
        )}
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  hero: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  greeting: { color: colors.text, fontSize: 20, fontWeight: '700' },
  points: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  sub: { color: colors.textMuted, marginTop: spacing.xs },
  cta: { marginBottom: spacing.lg },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rank: { width: 40, color: colors.accent, fontWeight: '700' },
  name: { flex: 1, color: colors.text },
  pts: { color: colors.textMuted, fontWeight: '600' },
  err: { color: colors.danger },
});
