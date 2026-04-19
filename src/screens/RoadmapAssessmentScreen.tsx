import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { PrimaryButton } from '../components/PrimaryButton';
import { getRoadmapAssessment, submitRoadmapAssessment } from '../api/services';
import type { RoadmapAssessment } from '../api/types';
import type { RoadmapsStackParamList } from '../navigation/types';
import { ThemeColors, cardShadow, radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<RoadmapsStackParamList, 'Assessment'>;

export function RoadmapAssessmentScreen({ route, navigation }: Props) {
  const { colors, mode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const elevation = useMemo(() => cardShadow(mode), [mode]);
  const { roadmapId, title } = route.params;
  const [data, setData] = useState<RoadmapAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quizChoice, setQuizChoice] = useState<Record<string, number>>({});
  const [written, setWritten] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [aiPreparing, setAiPreparing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setAiPreparing(true);
    try {
      const a = await getRoadmapAssessment(roadmapId);
      setData(a);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setAiPreparing(false);
      setLoading(false);
      setRefreshing(false);
    }
  }, [roadmapId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const assessmentHasContent = useMemo(() => {
    if (!data) return false;
    return data.quizQuestions.length > 0 || data.writtenQuestions.length > 0;
  }, [data]);

  const canSubmit = useMemo(() => {
    if (!data || !assessmentHasContent) return false;
    const quizOk = data.quizQuestions.every((q) => typeof quizChoice[q.id] === 'number');
    const writtenOk = data.writtenQuestions.every((q) => (written[q.id] ?? '').trim().length >= 3);
    return quizOk && writtenOk;
  }, [assessmentHasContent, data, written, quizChoice]);

  async function onSubmit() {
    if (!data) return;
    setSubmitting(true);
    setAiPreparing(true);
    setResultText(null);
    setError(null);
    try {
      const writtenAnswers = data.writtenQuestions.map((q) => ({
        question: q.text,
        answer: (written[q.id] ?? '').trim(),
      }));
      const res = (await submitRoadmapAssessment(roadmapId, {
        sessionId: data.sessionId,
        quizAnswers: quizChoice,
        writtenAnswers,
      })) as { levelLabel?: string; feedback?: string; message?: string; error?: string };
      setResultText(
        res?.levelLabel
          ? `Ваш уровень: ${res.levelLabel}${res.feedback ? `\n${res.feedback}` : ''}`
          : res?.message || 'Результат сохранён'
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setAiPreparing(false);
      setSubmitting(false);
    }
  }

  return (
    <ScreenScaffold title={`Оценка · ${title}`} loading={loading}>
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
        {error ? <Text style={styles.err}>{error}</Text> : null}
        {aiPreparing ? <Text style={styles.info}>ИИ готовит ответ, подождите…</Text> : null}

        {data ? (
          <>
            <View style={[styles.card, elevation]}>
              <Text style={styles.h}>Тест с вариантами ответов</Text>
              <Text style={styles.mutedIntro}>
                ИИ сформировал вопросы по направлению. Выберите один вариант в каждом вопросе.
              </Text>
              {data.quizQuestions.length === 0 ? (
                <Text style={styles.mutedBlock}>
                  {data.writtenQuestions.length === 0
                    ? 'ИИ готовит вопросы оценки — подождите несколько секунд и потяните экран вниз для обновления.'
                    : 'ИИ ещё готовит блок с вариантами ответов…'}
                </Text>
              ) : null}
              {data.quizQuestions.map((q) => {
                const selected = quizChoice[q.id];
                return (
                  <View key={q.id} style={styles.q}>
                    <Text style={styles.qTextBold}>{q.question}</Text>
                    <View style={styles.optionsCol}>
                      {q.options.map((label, optIdx) => {
                        const active = selected === optIdx;
                        return (
                          <Pressable
                            key={optIdx}
                            onPress={() => setQuizChoice((s) => ({ ...s, [q.id]: optIdx }))}
                            style={[styles.optionRow, active && styles.optionRowActive]}
                          >
                            <Text style={[styles.optionLetter, active && styles.optionLetterActive]}>
                              {String.fromCharCode(65 + optIdx)}
                            </Text>
                            <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{label}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={[styles.card, elevation]}>
              <Text style={styles.h}>Письменные ответы</Text>
              {data.writtenQuestions.length === 0 ? (
                <Text style={styles.mutedBlock}>
                  {data.quizQuestions.length === 0
                    ? 'Открытые вопросы появятся здесь после генерации ИИ.'
                    : 'ИИ ещё готовит открытые вопросы…'}
                </Text>
              ) : null}
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

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
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
  mutedIntro: { color: colors.textMuted, marginBottom: spacing.md, lineHeight: 18, fontSize: 13 },
  qTextBold: { color: colors.text, marginBottom: spacing.sm, lineHeight: 20, fontWeight: '700' },
  optionsCol: { gap: spacing.sm },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardInset,
  },
  optionRowActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  optionLetter: {
    width: 28,
    textAlign: 'center',
    color: colors.textMuted,
    fontWeight: '900',
    fontSize: 14,
  },
  optionLetterActive: { color: colors.text },
  optionLabel: { flex: 1, color: colors.textMuted, lineHeight: 20, fontSize: 14 },
  optionLabelActive: { color: colors.text },
  input: {
    minHeight: 90,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardInset,
    color: colors.text,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  muted: { color: colors.textMuted, marginTop: spacing.sm, fontWeight: '700' },
  err: { color: colors.danger },
  info: { color: colors.textMuted, marginBottom: spacing.sm },
  mutedBlock: { color: colors.textMuted, marginTop: spacing.sm, lineHeight: 20 },
  ok: { color: colors.success, fontWeight: '800', marginBottom: spacing.sm, lineHeight: 20 },
});

