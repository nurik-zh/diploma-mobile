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

export function VerificationScreen() {
  const { colors, mode: themeMode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const elevation = useMemo(() => cardShadow(themeMode), [themeMode]);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<VerificationSlot[]>([]);
  const [bookings, setBookings] = useState<VerificationBooking[]>([]);
  const [myRoadmaps, setMyRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [mode, setMode] = useState<'online' | 'offline'>('online');

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
      setMyRoadmaps(mine);
      setSelectedRoadmapId((prev) => prev ?? mine[0]?.id ?? null);
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

  return (
    <ScreenScaffold title="Подтверждение навыков" loading={loading}>
      <View style={styles.content}>
        <View style={[styles.card, elevation]}>
          <Text style={styles.h}>Оформление записи</Text>

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
              </View>
              <PrimaryButton
                label={item.seats === 0 ? 'Нет мест' : 'Записаться'}
                onPress={async () => {
                  if (!selectedRoadmap) return;
                  if (item.seats === 0) return;
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
                }}
                disabled={!selectedRoadmap || item.seats === 0}
              />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: spacing.md }}
        />

        <Text style={styles.sectionTitle}>Мои записи</Text>
        {bookings.map((b) => (
          <View key={b.id} style={[styles.booking, elevation]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.slotTitle} numberOfLines={1}>{b.roadmapTitle}</Text>
              <Text style={styles.slotMeta} numberOfLines={2}>
                {b.date} {b.time} · {b.mode} · {b.location}
              </Text>
              <Text style={styles.small}>Статус: {b.status}</Text>
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
                      await cancelVerificationBooking(b.id);
                      await load();
                    },
                  },
                ]);
              }}
            />
          </View>
        ))}
      </View>
    </ScreenScaffold>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl * 2 },
  card: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  h: { color: colors.text, fontWeight: '900', marginBottom: spacing.sm },
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
  small: { color: colors.textMuted, marginTop: 4, fontSize: 12 },
});

