import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { PrimaryButton } from '../components/PrimaryButton';
import {
  getTopicContent,
  getTopicTest,
  submitTopicResult,
} from '../api/services';
import type { RoadmapsStackParamList } from '../navigation/types';
import { ThemeColors, radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<RoadmapsStackParamList, 'Topic'>;

type Q = {
  question: string;
  options: string[];
  correctIndex?: number;
  correctOption?: number;
};

export function TopicScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { topicId, title } = route.params;
  const [theory, setTheory] = useState('');
  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiPreparing, setAiPreparing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setAiPreparing(true);
    try {
      const content = await getTopicContent(topicId);
      const first = content[0];
      setTheory(first?.theory ?? '');

      const test = await getTopicTest(topicId);
      const raw = test as { questions?: Q[] };
      setQuestions(Array.isArray(raw.questions) ? raw.questions : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setAiPreparing(false);
      setLoading(false);
    }
  }, [topicId]);

  React.useEffect(() => {
    load();
  }, [load]);

  function scorePercent(): number {
    if (questions.length === 0) return 0;
    let ok = 0;
    questions.forEach((q, i) => {
      const correct =
        q.correctIndex !== undefined
          ? q.correctIndex
          : q.correctOption !== undefined
            ? q.correctOption
            : 0;
      if (answers[i] === correct) ok += 1;
    });
    return Math.round((ok / questions.length) * 100);
  }

  async function submit() {
    setError(null);
    setAiPreparing(true);
    try {
      const pct = scorePercent();
      await submitTopicResult(topicId, pct);
      setSubmitted(pct);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setAiPreparing(false);
    }
  }

  return (
    <ScreenScaffold title={title} loading={loading}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h2}>Теория</Text>
        <Text style={styles.theory}>{theory || '—'}</Text>

        <Text style={styles.h2}>Тест</Text>
        {aiPreparing ? <Text style={styles.info}>ИИ готовит, это может занять немного времени...</Text> : null}
        {questions.length === 0 ? (
          <Text style={styles.muted}>Вопросы пока не сгенерированы</Text>
        ) : (
          questions.map((q, qi) => (
            <View key={qi} style={styles.qBlock}>
              <Text style={styles.qText}>{q.question}</Text>
              {(q.options ?? []).map((opt, oi) => {
                const selected = answers[qi] === oi;
                return (
                  <Pressable
                    key={oi}
                    style={[
                      styles.opt,
                      selected && styles.optSelected,
                    ]}
                    onPress={() =>
                      setAnswers((a) => ({ ...a, [qi]: oi }))
                    }
                  >
                    <Text style={styles.optText}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))
        )}

        {submitted !== null ? (
          <Text style={styles.result}>
            Результат сохранён: {submitted}% (прогресс на сервере)
          </Text>
        ) : null}
        {error ? <Text style={styles.err}>{error}</Text> : null}

        {questions.length > 0 && submitted === null ? (
          <PrimaryButton
            label="Отправить результат"
            onPress={submit}
            disabled={Object.keys(answers).length !== questions.length}
          />
        ) : null}

        <PrimaryButton
          label="Назад к дорожкам"
          variant="outline"
          onPress={() => navigation.pop()}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </ScreenScaffold>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  h2: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  theory: { color: colors.text, lineHeight: 22, fontSize: 15 },
  muted: { color: colors.textMuted },
  qBlock: {
    marginBottom: spacing.lg,
    backgroundColor: colors.bgElevated,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qText: { color: colors.text, fontWeight: '600', marginBottom: spacing.sm },
  opt: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  optSelected: { borderWidth: 1, borderColor: colors.accent },
  optText: { color: colors.text },
  result: { color: colors.success, marginVertical: spacing.md, fontWeight: '600' },
  err: { color: colors.danger, marginVertical: spacing.sm },
  info: { color: colors.textMuted, marginBottom: spacing.sm },
});
