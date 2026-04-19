import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { PrimaryButton } from '../components/PrimaryButton';
import {
  createVerificationBooking,
  getRoadmapCollection,
  getRoadmaps,
  getVerificationBookings,
  getVerificationSlots,
  cancelVerificationBooking,
} from '../api/services';
import type { Roadmap, VerificationBooking, VerificationSlot } from '../api/types';
import { ThemeColors, cardShadow, radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTabScrollBottomPadding } from '../hooks/useTabScrollBottomPadding';

export function VerificationScreen() {
  const { colors, mode: themeMode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const elevation = useMemo(() => cardShadow(themeMode), [themeMode]);
  const scrollBottomPad = useTabScrollBottomPadding();
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<VerificationSlot[]>([]);
  const [bookings, setBookings] = useState<VerificationBooking[]>([]);
  const [myRoadmaps, setMyRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [mode, setMode] = useState<'online' | 'offline'>('online');
  const [submittingSlotId, setSubmittingSlotId] = useState<string | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [all, col, s, b] = await Promise.all([
        getRoadmaps(),
        getRoadmapCollection(),
        getVerificationSlots(),
        getVerificationBookings(),
      ]);
      setSlots(s);
      setBookings(b);
      const mine = all.filter((r) => col.includes(r.id));
      // If collection is empty, keep booking available with all roadmaps.
      const availableRoadmaps = mine.length > 0 ? mine : all;
      setMyRoadmaps(availableRoadmaps);
      setSelectedRoadmapId((prev) => {
        if (prev && availableRoadmaps.some((r) => r.id === prev)) return prev;
        return availableRoadmaps[0]?.id ?? null;
      });
    } catch (error) {
      Alert.alert(
        'Не удалось загрузить данные',
        error instanceof Error ? error.message : 'Повторите попытку позже'
      );
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

  const selectedRoadmap = useMemo(
    () => myRoadmaps.find((r) => r.id === selectedRoadmapId) ?? null,
    [myRoadmaps, selectedRoadmapId]
  );

  const filteredSlots = useMemo(
    () => slots.filter((s) => s.mode === mode).slice(0, 12),
    [slots, mode]
  );

  const scheduledBookings = useMemo(
    () => bookings.filter((b) => b.status === 'scheduled'),
    [bookings]
  );

  return (
    <ScreenScaffold title="Подтверждение навыков" loading={loading}>
      <View style={[styles.content, { paddingBottom: scrollBottomPad }]}>
        <View style={[styles.card, elevation]}>
          <Text style={styles.h}>Оформление записи</Text>
          <Text style={styles.sub}>
            Выберите направление и слот для подтверждения. В онлайн-формате ссылка приходит после записи.
          </Text>

          <Text style={styles.label}>Направление</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roadmapChips}>
            {myRoadmaps.map((r) => {
              const active = selectedRoadmapId === r.id;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => setSelectedRoadmapId(r.id)}
                  style={[styles.roadmapChip, active && styles.roadmapChipActive]}
                >
                  <Text style={[styles.roadmapChipText, active && styles.roadmapChipTextActive]} numberOfLines={1}>
                    {r.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>Формат прохождения</Text>
          <View style={styles.pills}>
            <PrimaryButton
              label="Онлайн"
              variant={mode === 'online' ? 'primary' : 'outline'}
              onPress={() => setMode('online')}
              style={{ flex: 1 }}
            />
            <PrimaryButton
              label="Офлайн"
              variant={mode === 'offline' ? 'primary' : 'outline'}
              onPress={() => setMode('offline')}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Свободные слоты</Text>
        {filteredSlots.length === 0 ? (
          <View style={[styles.emptyCard, elevation]}>
            <Text style={styles.emptyTitle}>Нет доступных слотов</Text>
            <Text style={styles.emptyText}>
              Для выбранного формата сейчас нет свободных мест. Переключите формат или обновите экран позже.
            </Text>
          </View>
        ) : null}
        <FlatList
          data={filteredSlots}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={[styles.slot, elevation]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.slotTitle} numberOfLines={1}>
                  {item.date} · {item.time}
                </Text>
                <Text style={styles.slotMeta} numberOfLines={2}>
                  {item.mode === 'online' ? 'Google Meet' : item.location} · {item.assessor}
                </Text>
                <View style={styles.slotMetaRow}>
                  <View style={[styles.seatPill, item.seats === 0 && styles.seatPillFull]}>
                    <Text style={[styles.seatPillText, item.seats === 0 && styles.seatPillTextFull]}>
                      {item.seats > 0 ? `Мест: ${item.seats}` : 'Нет мест'}
                    </Text>
                  </View>
                </View>
              </View>
              <PrimaryButton
                label={item.seats === 0 ? 'Нет мест' : 'Записаться'}
                onPress={async () => {
                  if (!selectedRoadmap) return;
                  if (item.seats === 0) return;
                  try {
                    setSubmittingSlotId(item.id);
                    await createVerificationBooking({
                      slotId: item.id,
                      roadmapId: selectedRoadmap.id,
                      roadmapTitle: selectedRoadmap.title,
                      mode: item.mode,
                      date: item.date,
                      time: item.time,
                      dateTimeIso: new Date(`${item.date}T${item.time}:00`).toISOString(),
                      location: item.location,
                      assessor: item.assessor,
                    });
                    await load();
                    Alert.alert('Готово', 'Вы успешно записались на подтверждение');
                  } catch (error) {
                    Alert.alert(
                      'Не удалось записаться',
                      error instanceof Error ? error.message : 'Повторите попытку позже'
                    );
                  } finally {
                    setSubmittingSlotId(null);
                  }
                }}
                disabled={!selectedRoadmap || item.seats === 0 || submittingSlotId === item.id}
              />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: spacing.sm }}
        />

        <Text style={styles.sectionTitle}>Мои записи</Text>
        {scheduledBookings.length === 0 ? (
          <View style={[styles.emptyCard, elevation]}>
            <Text style={styles.emptyTitle}>Активных записей пока нет</Text>
            <Text style={styles.emptyText}>
              После записи здесь появится ваш ближайший слот, статус и сертификат после прохождения.
            </Text>
          </View>
        ) : null}
        {bookings.map((b) => (
          <View key={b.id} style={[styles.booking, elevation]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.slotTitle} numberOfLines={1}>{b.roadmapTitle}</Text>
              <Text style={styles.slotMeta} numberOfLines={2}>
                {b.date} {b.time} · {b.mode} · {b.location}
              </Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusPill,
                    b.status === 'completed' ? styles.statusCompleted : styles.statusScheduled,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      b.status === 'completed' ? styles.statusCompletedText : styles.statusScheduledText,
                    ]}
                  >
                    {b.status === 'completed' ? 'Завершено' : 'Запланировано'}
                  </Text>
                </View>
              </View>
              {b.certificateId ? <Text style={styles.small}>Сертификат: {b.certificateId}</Text> : null}
            </View>
            <PrimaryButton
              label="Отменить"
              variant="outline"
              onPress={() => {
                Alert.alert('Отменить запись?', 'Вы точно хотите отменить запись на подтверждение?', [
                  { text: 'Нет', style: 'cancel' },
                  {
                    text: 'Отменить',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        setCancellingBookingId(b.id);
                        await cancelVerificationBooking(b.id);
                        await load();
                      } catch (error) {
                        Alert.alert(
                          'Не удалось отменить запись',
                          error instanceof Error ? error.message : 'Повторите попытку позже'
                        );
                      } finally {
                        setCancellingBookingId(null);
                      }
                    },
                  },
                ]);
              }}
              disabled={cancellingBookingId === b.id || b.status !== 'scheduled'}
            />
          </View>
        ))}
      </View>
    </ScreenScaffold>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  card: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  h: { color: colors.text, fontWeight: '900', marginBottom: spacing.sm },
  sub: { color: colors.textMuted, lineHeight: 20, marginBottom: spacing.sm },
  label: { color: colors.textMuted, fontWeight: '800', marginTop: spacing.sm, marginBottom: spacing.sm },
  pills: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  roadmapChips: { gap: spacing.sm, paddingBottom: spacing.sm },
  roadmapChip: {
    maxWidth: 220,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardInset,
  },
  roadmapChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  roadmapChipText: { color: colors.textMuted, fontWeight: '900' },
  roadmapChipTextActive: { color: colors.text },
  sectionTitle: { color: colors.textMuted, fontWeight: '900', letterSpacing: 0.9, fontSize: 12 },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  slotTitle: { color: colors.text, fontWeight: '900' },
  slotMeta: { color: colors.textMuted, marginTop: 2 },
  slotMetaRow: { marginTop: spacing.xs, flexDirection: 'row' },
  seatPill: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.35)',
    backgroundColor: 'rgba(22,163,74,0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  seatPillFull: {
    borderColor: 'rgba(220,38,38,0.35)',
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  seatPillText: { color: colors.success, fontWeight: '800', fontSize: 11 },
  seatPillTextFull: { color: colors.danger },
  booking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  statusRow: { marginTop: spacing.xs, flexDirection: 'row' },
  statusPill: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusScheduled: {
    borderColor: 'rgba(37,99,235,0.35)',
    backgroundColor: 'rgba(37,99,235,0.12)',
  },
  statusCompleted: {
    borderColor: 'rgba(22,163,74,0.35)',
    backgroundColor: 'rgba(22,163,74,0.12)',
  },
  statusPillText: { fontSize: 11, fontWeight: '800' },
  statusScheduledText: { color: '#3B82F6' },
  statusCompletedText: { color: colors.success },
  emptyCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyTitle: { color: colors.text, fontWeight: '800', marginBottom: 4 },
  emptyText: { color: colors.textMuted, lineHeight: 20 },
  small: { color: colors.textMuted, marginTop: 4, fontSize: 12 },
});

