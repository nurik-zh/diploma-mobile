import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressBar } from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../api/services';
import type { Profile } from '../api/types';
import type { ProfileStackParamList } from '../navigation/types';
import { colors, radius, shadow, spacing } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>;
};

export function ProfileScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const p = await getProfile();
      setProfile(p);
    } catch {
      setProfile(null);
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

  const avgSkill = useMemo(() => {
    if (!profile?.radarSkills?.length) return 0;
    const sum = profile.radarSkills.reduce((a, b) => a + (Number(b.value) || 0), 0);
    return Math.round(sum / profile.radarSkills.length);
  }, [profile?.radarSkills]);

  return (
    <ScreenScaffold title="Профиль" loading={loading}>
      <ScrollView contentContainerStyle={styles.content}>
        {profile ? (
          <>
            <View style={[styles.hero, shadow.card]}>
              <View style={styles.heroTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(profile.fullName?.[0] || profile.email[0] || 'U').toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{profile.fullName}</Text>
                  <Text style={styles.email}>{profile.email}</Text>
                  <Text style={styles.meta}>
                    {profile.city} · {profile.university}
                  </Text>
                </View>
                <View style={styles.rankPill}>
                  <Text style={styles.rankText}>{profile.points} pts</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{profile.completedTests}</Text>
                  <Text style={styles.statLbl}>пройдено тестов</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{profile.achievements.length}</Text>
                  <Text style={styles.statLbl}>достижений</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{avgSkill}%</Text>
                  <Text style={styles.statLbl}>средний скилл</Text>
                </View>
              </View>
            </View>

            <View style={[styles.card, shadow.card]}>
              <Text style={styles.sectionTitle}>Быстрые действия</Text>
              <View style={styles.actionsRow}>
                <PrimaryButton
                  label="Квесты дня"
                  onPress={() => navigation.navigate('DailyTasks')}
                  style={{ flex: 1 }}
                />
                <PrimaryButton
                  label="Друзья"
                  variant="outline"
                  onPress={() => navigation.navigate('Friends')}
                  style={{ flex: 1 }}
                />
              </View>
              <View style={styles.actionsRow}>
                <PrimaryButton
                  label="Подтверждение"
                  variant="outline"
                  onPress={() => navigation.navigate('Verification')}
                  style={{ flex: 1 }}
                />
                <PrimaryButton
                  label="Определение уровня"
                  variant="outline"
                  onPress={() => navigation.navigate('LevelDetermination')}
                  style={{ flex: 1 }}
                />
              </View>
              <View style={styles.actionsRow}>
                <PrimaryButton
                  label="Выйти"
                  variant="outline"
                  onPress={() => logout()}
                  style={{ flex: 1 }}
                />
              </View>
            </View>

            <View style={[styles.card, shadow.card]}>
              <Text style={styles.sectionTitle}>Навыки</Text>
              {profile.radarSkills.slice(0, 5).map((s) => (
                <View key={s.id} style={{ marginTop: spacing.sm }}>
                  <View style={styles.skillRow}>
                    <Text style={styles.skillLabel}>{s.label}</Text>
                    <Text style={styles.skillValue}>{s.value}%</Text>
                  </View>
                  <ProgressBar value={s.value} />
                </View>
              ))}
              <Text style={styles.muted}>Средний уровень: {avgSkill}%</Text>
            </View>

            <View style={[styles.card, shadow.card]}>
              <Text style={styles.sectionTitle}>Достижения</Text>
              <View style={styles.badgesWrap}>
                {profile.achievements.map((a) => (
                  <View key={a} style={styles.badge}>
                    <Text style={styles.badgeText}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.err}>Не удалось загрузить профиль</Text>
        )}
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl * 3 },
  hero: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(124,58,237,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.text, fontWeight: '900', fontSize: 18 },
  name: { color: colors.text, fontSize: 18, fontWeight: '900' },
  email: { color: colors.textMuted, marginTop: 2 },
  meta: { color: colors.textMuted, marginTop: 4, fontSize: 12 },
  rankPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.45)',
    backgroundColor: colors.accentSoft,
  },
  rankText: { color: colors.text, fontWeight: '900', fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  statBox: {
    flex: 1,
    minWidth: 110,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  statVal: { color: colors.text, fontWeight: '900', fontSize: 18 },
  statLbl: { color: colors.textMuted, marginTop: 2, fontSize: 11, fontWeight: '800' },
  card: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  sectionTitle: { color: colors.textMuted, fontWeight: '900', letterSpacing: 0.9, fontSize: 12 },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  skillRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  skillLabel: { color: colors.text, fontWeight: '800' },
  skillValue: { color: colors.textMuted, fontWeight: '900' },
  muted: { color: colors.textMuted, marginTop: spacing.md, fontWeight: '800' },
  badgesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: { color: colors.text, fontWeight: '700' },
  err: { color: colors.danger },
});
