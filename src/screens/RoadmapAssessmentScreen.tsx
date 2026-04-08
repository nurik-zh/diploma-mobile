import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { PrimaryButton } from '../components/PrimaryButton';
import { getRoadmapAssessment, submitRoadmapAssessment } from '../api/services';
import type { RoadmapAssessment } from '../api/types';
import type { RoadmapsStackParamList } from '../navigation/types';
import { colors, radius, shadow, spacing } from '../theme';

type Props = NativeStackScreenProps<RoadmapsStackParamList, 'Assessment'>;

export function RoadmapAssessmentScreen({ route, navigation }: Props) {
  const { roadmapId, title } = route.params;
  const [data, setData] = useState<RoadmapAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [theoryScores, setTheoryScores] = useState<Record<number, 1 | 2 | 3>>({});
  const [written, setWritten] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const a = await getRoadmapAssessment(roadmapId);
      setData(a);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }, [roadmapId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const theoryTotal = useMemo(() => {
    if (!data) return 0;
    return data.theoryQuestions.reduce((sum, _, idx) => sum + (theoryScores[idx] ?? 1), 0);
  }, [data, theoryScores]);

  const canSubmit = useMemo(() => {
    if (!data) return false;
    const writtenOk = data.writtenQuestions.every((q) => (written[q.id] ?? '').trim().length >= 3);
    return writtenOk;
  }, [data, written]);

  async function onSubmit() {
    if (!data) return;
    setSubmitting(true);
    setResultText(null);
    setError(null);
    try {
      const writtenAnswers = data.writtenQuestions.map((q) => ({
        question: q.text,
        answer: (written[q.id] ?? '').trim(),
      }));
      const res = (await submitRoadmapAssessment(roadmapId, {
        theoryScore: theoryTotal,
        writtenAnswers,
      })) as { levelLabel?: string; feedback?: string; message?: string };
      setResultText(
        res?.levelLabel
          ? `Ваш уровень: ${res.levelLabel}${res.feedback ? `\n${res.feedback}` : ''}`
          : res?.message || 'Результат сохранён'
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenScaffold title={`Оценка · ${title}`} loading={loading}>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={styles.err}>{error}</Text> : null}

        {data ? (
          <>
            <View style={[styles.card, shadow.card]}>
              <Text style={styles.h}>Теоретический блок</Text>
              {data.theoryQuestions.map((q, idx) => {
                const v = theoryScores[idx] ?? 1;
                return (
                  <View key={idx} style={styles.q}>
                    <Text style={styles.qText}>{q}</Text>
                    <View style={styles.scoreRow}>
                      {[1, 2, 3].map((n) => {
                        const active = v === n;
                        return (
                          <Pressable
                            key={n}
                            onPress={() => setTheoryScores((s) => ({ ...s, [idx]: n as 1 | 2 | 3 }))}
                            style={[styles.scorePill, active && styles.scorePillActive]}
                          >
                            <Text style={[styles.scoreText, active && styles.scoreTextActive]}>{n}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
              <Text style={styles.muted}>Сумма теории: {theoryTotal}</Text>
            </View>

            <View style={[styles.card, shadow.card]}>
              <Text style={styles.h}>Письменные ответы</Text>
              {data.writtenQuestions.map((q) => (
                <View key={q.id} style={styles.q}>
                  <Text style={styles.qText}>{q.text}</Text>
                  <TextInput
                    value={written[q.id] ?? ''}
                    onChangeText={(t) => setWritten((w) => ({ ...w, [q.id]: t }))}
                    placeholder={q.placeholder || 'Ответ...'}
                    placeholderTextColor={colors.textMuted}
                    multiline
                    style={styles.input}
                  />
                </View>
              ))}
            </View>

            {resultText ? <Text style={styles.ok}>{resultText}</Text> : null}

            <PrimaryButton
              label={submitting ? 'Отправка...' : 'Завершить оценку'}
              onPress={onSubmit}
              disabled={!canSubmit || submitting}
            />
            <PrimaryButton
              label="Назад"
              variant="outline"
              onPress={() => navigation.pop()}
              style={{ marginTop: spacing.sm }}
            />
          </>
        ) : null}
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  card: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  h: { color: colors.text, fontWeight: '900', marginBottom: spacing.sm, letterSpacing: 0.2 },
  q: { marginBottom: spacing.md },
  qText: { color: colors.textMuted, marginBottom: spacing.sm, lineHeight: 20 },
  scoreRow: { flexDirection: 'row', gap: spacing.sm },
  scorePill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  scorePillActive: {
    borderColor: 'rgba(124,58,237,0.55)',
    backgroundColor: 'rgba(124,58,237,0.18)',
  },
  scoreText: { color: colors.textMuted, fontWeight: '900', fontSize: 16 },
  scoreTextActive: { color: colors.text },
  input: {
    minHeight: 90,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: colors.text,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  muted: { color: colors.textMuted, marginTop: spacing.sm, fontWeight: '700' },
  err: { color: colors.danger },
  ok: { color: colors.success, fontWeight: '800', marginBottom: spacing.sm, lineHeight: 20 },
});

