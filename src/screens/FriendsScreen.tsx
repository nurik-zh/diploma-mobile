import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { PrimaryButton } from '../components/PrimaryButton';
import {
  addFriendByEmail,
  getFriendChallenges,
  getFriendNotifications,
  getFriends,
  getGlobalMap,
  markFriendNotificationRead,
  removeFriend,
} from '../api/services';
import type { Friend, FriendChallenge, FriendNotification, GlobalMap } from '../api/types';
import { colors, radius, shadow, spacing } from '../theme';
import { ProgressBar } from '../components/ProgressBar';

export function FriendsScreen() {
  const [items, setItems] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [map, setMap] = useState<GlobalMap | null>(null);
  const [notifications, setNotifications] = useState<FriendNotification[]>([]);
  const [challenges, setChallenges] = useState<FriendChallenge[]>([]);
  const [modalUser, setModalUser] = useState<GlobalMap['participants'][number] | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const [f, m, n, c] = await Promise.all([
        getFriends(),
        getGlobalMap().catch(() => null),
        getFriendNotifications().catch(() => []),
        getFriendChallenges().catch(() => []),
      ]);
      setItems(f);
      setMap(m);
      setNotifications(n);
      setChallenges(c.slice(0, 6));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Ошибка');
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

  async function onAdd() {
    setErr(null);
    try {
      const next = await addFriendByEmail(email.trim());
      setItems(next);
      setEmail('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Ошибка');
    }
  }

  const headerStats = useMemo(() => {
    const friendsCount = items.length;
    const mapCount = map?.participants?.length ?? Math.max(friendsCount, friendsCount ? friendsCount + 1 : 0);
    return (
      <View style={styles.statsRow}>
        <View style={[styles.statCard, shadow.card]}>
          <Text style={styles.statLabel}>Друзья</Text>
          <Text style={styles.statVal}>{friendsCount}</Text>
        </View>
        <View style={[styles.statCard, shadow.card]}>
          <Text style={styles.statLabel}>Участники карты</Text>
          <Text style={styles.statVal}>{mapCount}</Text>
        </View>
      </View>
    );
  }, [items.length, map?.participants?.length]);

  return (
    <ScreenScaffold title="Друзья" loading={loading}>
      <View style={styles.content}>
        {headerStats}
        <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl * 3 }}>
          <View style={[styles.card, shadow.card]}>
            <Text style={styles.sectionTitle}>Добавить друга</Text>
            <View style={styles.row}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Введите email"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                style={styles.input}
              />
              <PrimaryButton label="Добавить" onPress={onAdd} disabled={!email.trim()} />
            </View>
            {err ? <Text style={styles.err}>{err}</Text> : null}
          </View>

          <View style={[styles.card, shadow.card]}>
            <Text style={styles.sectionTitle}>Ваша сеть</Text>
            {items.map((item) => (
              <View key={item.userId} style={[styles.friend, { marginTop: spacing.sm }]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.fullName}</Text>
                  <Text style={styles.meta}>
                    {item.country} · {item.city}
                  </Text>
                  <View style={{ marginTop: spacing.sm }}>
                    <ProgressBar value={item.roadmapProgressPercent} />
                  </View>
                  <View style={styles.friendMetaRow}>
                    <View style={styles.miniPill}>
                      <Text style={styles.miniText}>{item.roadmapProgressPercent}%</Text>
                    </View>
                    <View style={styles.miniPill}>
                      <Text style={styles.miniText}>🏆 {item.points}</Text>
                    </View>
                  </View>
                </View>
                <PrimaryButton
                  label="Удалить"
                  variant="outline"
                  onPress={() => {
                    Alert.alert(
                      'Удалить друга?',
                      `Вы точно хотите удалить «${item.fullName}» из друзей?`,
                      [
                        { text: 'Отмена', style: 'cancel' },
                        {
                          text: 'Удалить',
                          style: 'destructive',
                          onPress: async () => {
                            const next = await removeFriend(item.userId);
                            setItems(next);
                          },
                        },
                      ]
                    );
                  }}
                />
              </View>
            ))}
          </View>

          <View style={[styles.card, shadow.card]}>
            <Text style={styles.sectionTitle}>Глобальная карта</Text>
            <Text style={styles.meta}>
              Открывайте каждого участника и смотрите его персональную “паутинную” диаграмму.
            </Text>

            <View style={styles.globalRoot}>
              <Text style={styles.globalRootText}>GLOBAL IT ROOT</Text>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Приглашения</Text>
            {notifications.length === 0 ? (
              <Text style={styles.meta}>Новых приглашений нет.</Text>
            ) : (
              notifications.map((n) => (
                <Pressable
                  key={n.id}
                  onPress={async () => {
                    await markFriendNotificationRead(n.id);
                    await load();
                  }}
                  style={styles.invite}
                >
                  <Text style={styles.inviteTitle}>
                    {n.roadmapTitle} · {n.challengerName}
                  </Text>
                  <Text style={styles.meta}>Нажмите, чтобы отметить прочитанным</Text>
                </Pressable>
              ))
            )}

            <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Последние соревнования</Text>
            {challenges.length === 0 ? (
              <Text style={styles.meta}>Пока пусто.</Text>
            ) : (
              challenges.map((c) => (
                <View key={c.id} style={styles.challenge}>
                  <Text style={styles.challengeTop}>{c.roadmapTitle}</Text>
                  <Text style={styles.challengeVs}>vs {c.opponentName}</Text>
                  <Text style={styles.meta}>
                    {c.status === 'completed'
                      ? `Завершено`
                      : c.status === 'waiting_opponent'
                        ? `Ожидаем ответ…`
                        : c.status}
                  </Text>
                </View>
              ))
            )}

            <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Участники</Text>
            <View style={styles.participants}>
              {(map?.participants ?? []).slice(0, 4).map((p) => (
                <View key={p.userId} style={styles.participantCard}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{p.avatar}</Text>
                  </View>
                  <Text style={styles.name} numberOfLines={1}>
                    {p.fullName}
                  </Text>
                  <View style={{ marginTop: spacing.sm }}>
                    <ProgressBar value={p.overallProgressPercent} />
                  </View>
                  <View style={styles.friendMetaRow}>
                    <View style={styles.miniPill}>
                      <Text style={styles.miniText}>{p.overallProgressPercent}%</Text>
                    </View>
                    <View style={styles.miniPill}>
                      <Text style={styles.miniText}>🏆 {p.points}</Text>
                    </View>
                  </View>
                  <PrimaryButton
                    label="Открыть паутину"
                    variant="outline"
                    onPress={() => setModalUser(p)}
                  />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      <Modal visible={modalUser != null} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, shadow.card]}>
            <Text style={styles.modalTitle}>Паутина знаний</Text>
            <Text style={styles.meta}>{modalUser?.fullName}</Text>
            <ScrollView style={{ marginTop: spacing.md }} contentContainerStyle={{ gap: spacing.sm }}>
              {(map?.roadmaps ?? []).map((r) => {
                const v = modalUser?.roadmapProgress?.[r.roadmapId] ?? 0;
                return (
                  <View key={r.roadmapId}>
                    <View style={styles.skillRow}>
                      <Text style={styles.skillLabel}>{r.title}</Text>
                      <Text style={styles.skillValue}>{v}%</Text>
                    </View>
                    <ProgressBar value={v} />
                  </View>
                );
              })}
            </ScrollView>
            <PrimaryButton label="Закрыть" onPress={() => setModalUser(null)} style={{ marginTop: spacing.md }} />
          </View>
        </View>
      </Modal>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  statLabel: { color: colors.textMuted, fontWeight: '900', letterSpacing: 0.8, fontSize: 11 },
  statVal: { color: colors.text, fontWeight: '900', fontSize: 20, marginTop: 6 },
  card: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  sectionTitle: { color: colors.textMuted, fontWeight: '900', letterSpacing: 0.9, fontSize: 12 },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, alignItems: 'center' },
  input: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: colors.text,
    padding: spacing.md,
  },
  err: { color: colors.danger, marginTop: spacing.sm },
  friend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124,58,237,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.text, fontWeight: '900' },
  name: { color: colors.text, fontWeight: '900' },
  meta: { color: colors.textMuted, marginTop: 2 },
  friendMetaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  miniPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  miniText: { color: colors.textMuted, fontWeight: '800', fontSize: 12 },
  globalRoot: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.35)',
    backgroundColor: 'rgba(124,58,237,0.10)',
  },
  globalRootText: { color: colors.text, fontWeight: '900', fontSize: 11, letterSpacing: 0.6 },
  invite: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  inviteTitle: { color: colors.text, fontWeight: '900' },
  challenge: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  challengeTop: { color: colors.textMuted, fontWeight: '900', fontSize: 11, letterSpacing: 0.8 },
  challengeVs: { color: colors.text, fontWeight: '900', marginTop: 4 },
  participants: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  participantCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: colors.bg2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    maxHeight: '78%',
  },
  modalTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  skillRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, marginTop: spacing.sm },
  skillLabel: { color: colors.text, fontWeight: '800' },
  skillValue: { color: colors.textMuted, fontWeight: '900' },
});

