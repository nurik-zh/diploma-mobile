import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { PrimaryButton } from '../components/PrimaryButton';
import { generateVacancyAIPrep, getVacancyById } from '../api/services';
import type { VacanciesStackParamList } from '../navigation/types';
import { ThemeColors, radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTabScrollBottomPadding } from '../hooks/useTabScrollBottomPadding';

type Props = NativeStackScreenProps<VacanciesStackParamList, 'VacancyDetail'>;

type VacancyDetail = {
  summary: string;
  realTasks?: {
    id: string;
    title: string;
    brief: string;
    estimatedHours: number;
    requirements?: string[];
    deliverables?: string[];
  }[];
  preparation?: {
    questions: { id: string; question: string; answer: string }[];
    test: {
      id: string;
      question: string;
      options: string[];
      correctAnswerIndex: number;
    }[];
  };
};

export function VacancyDetailScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const scrollBottomPad = useTabScrollBottomPadding();
  const { id, title } = route.params;
  const [data, setData] = useState<VacancyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pickedOptions, setPickedOptions] = useState<Record<string, number>>({});
  const [writtenAnswers, setWrittenAnswers] = useState<Record<string, string>>({});
  const [testsChecked, setTestsChecked] = useState(false);

  const load = useCallback(async () => {
    const v = (await getVacancyById(id)) as VacancyDetail;
    setData(v);
  }, [id]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const v = (await getVacancyById(id)) as VacancyDetail;
        if (alive) setData(v);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const questions = data?.preparation?.questions ?? [];
  const tests = data?.preparation?.test ?? [];
  const tasks = data?.realTasks ?? [];
  const hasAIPrep = questions.length > 0 || tests.length > 0 || tasks.length > 0;
  const testScore = useMemo(() => {
    if (!testsChecked || tests.length === 0) return null;
    const correct = tests.reduce((sum, t) => {
      const picked = pickedOptions[t.id];
      return sum + (picked === t.correctAnswerIndex ? 1 : 0);
    }, 0);
    return { correct, total: tests.length };
  }, [pickedOptions, tests, testsChecked]);

  return (
    <ScreenScaffold title={title} loading={loading}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: scrollBottomPad }]}>
        {data ? (
          <>
            <Text style={styles.summary}>{data.summary}</Text>

            {!hasAIPrep ? (
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>ИИ-подготовка пока не сгенерирована</Text>
                <Text style={styles.infoText}>
                  Нажмите кнопку ниже, чтобы получить персональные вопросы, тесты и практические задачи по этой вакансии.
                </Text>
              </View>
            ) : null}

            <PrimaryButton
              label={generating ? 'ИИ готовит материалы...' : 'Сгенерировать ИИ-подготовку'}
              onPress={async () => {
                try {
                  setGenerating(true);
                  await generateVacancyAIPrep(id);
                  await load();
                  setPickedOptions({});
                  setWrittenAnswers({});
                  setTestsChecked(false);
                  Alert.alert('Готово', 'ИИ-подготовка успешно обновлена');
                } catch (e) {
                  Alert.alert('Ошибка генерации', e instanceof Error ? e.message : 'Повторите позже');
                } finally {
                  setGenerating(false);
                }
              }}
              disabled={generating}
              style={{ marginBottom: spacing.lg }}
            />

            <Text style={styles.h2}>Текстовые вопросы</Text>
            {questions.length === 0 ? (
              <Text style={styles.empty}>Пока нет вопросов. Сгенерируйте ИИ-подготовку.</Text>
            ) : (
              questions.map((q) => (
                <View key={q.id} style={styles.block}>
                  <Text style={styles.q}>{q.question}</Text>
                  <TextInput
                    value={writtenAnswers[q.id] ?? ''}
                    onChangeText={(text) =>
                      setWrittenAnswers((prev) => ({
                        ...prev,
                        [q.id]: text,
                      }))
                    }
                    multiline
                    placeholder="Напишите свой ответ..."
                    placeholderTextColor={colors.textMuted}
                    style={styles.answerInput}
                  />
                  {testsChecked ? (
                    <>
                      <Text style={styles.answerLabel}>Эталонный ответ:</Text>
                      <Text style={styles.a}>{q.answer}</Text>
                    </>
                  ) : null}
                </View>
              ))
            )}

            <Text style={styles.h2}>Тестовые вопросы</Text>
            {tests.length === 0 ? (
              <Text style={styles.empty}>Пока нет тестов. Сгенерируйте ИИ-подготовку.</Text>
            ) : (
              <>
                {tests.map((t) => (
                  <View key={t.id} style={styles.block}>
                    <Text style={styles.q}>{t.question}</Text>
                    {t.options.map((o, i) => {
                      const picked = pickedOptions[t.id] === i;
                      const isCorrect = i === t.correctAnswerIndex;
                      const isWrongPick = testsChecked && picked && !isCorrect;
                      return (
                        <Pressable
                          key={i}
                          style={[
                            styles.optionBtn,
                            picked && styles.optionBtnSelected,
                            testsChecked && isCorrect && styles.optionBtnCorrect,
                            isWrongPick && styles.optionBtnWrong,
                          ]}
                          onPress={() => {
                            if (testsChecked) return;
                            setPickedOptions((prev) => ({ ...prev, [t.id]: i }));
                          }}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              picked && styles.optionTextSelected,
                              testsChecked && isCorrect && styles.optionTextCorrect,
                            ]}
                          >
                            {i + 1}. {o}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
                {testScore ? (
                  <Text style={styles.scoreText}>
                    Результат теста: {testScore.correct} из {testScore.total}
                  </Text>
                ) : null}
                <PrimaryButton
                  label={testsChecked ? 'Проверено' : 'Проверить тест'}
                  onPress={() => setTestsChecked(true)}
                  disabled={testsChecked || tests.some((t) => pickedOptions[t.id] === undefined)}
                  style={{ marginBottom: spacing.md }}
                />
              </>
            )}

            <Text style={styles.h2}>Практические задачи</Text>
            {tasks.length === 0 ? (
              <Text style={styles.empty}>Пока нет задач. Сгенерируйте ИИ-подготовку.</Text>
            ) : (
              tasks.map((task) => (
                <View key={task.id} style={styles.block}>
                  <Text style={styles.q}>{task.title}</Text>
                  <Text style={styles.a}>{task.brief}</Text>
                  <Text style={styles.meta}>Оценка времени: {task.estimatedHours} ч</Text>
                </View>
              ))
            )}
          </>
        ) : (
          <Text style={styles.err}>Не найдено</Text>
        )}

        <PrimaryButton
          label="Назад"
          variant="outline"
          onPress={() => navigation.pop()}
        />
      </ScrollView>
    </ScreenScaffold>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  content: { padding: spacing.md },
  summary: { color: colors.text, lineHeight: 22, marginBottom: spacing.lg },
  infoCard: {
    backgroundColor: colors.cardInset,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoTitle: { color: colors.text, fontWeight: '700' },
  infoText: { color: colors.textMuted, marginTop: 4, lineHeight: 20 },
  h2: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  block: {
    backgroundColor: colors.bgElevated,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  q: { color: colors.text, fontWeight: '600', marginBottom: spacing.sm },
  a: { color: colors.textMuted, lineHeight: 20 },
  answerInput: {
    minHeight: 90,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardInset,
    color: colors.text,
    padding: spacing.sm,
    textAlignVertical: 'top',
  },
  answerLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.sm,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  meta: { color: colors.accent, fontWeight: '700', marginTop: spacing.sm },
  empty: { color: colors.textMuted, marginBottom: spacing.md },
  optionBtn: {
    marginTop: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardInset,
    padding: spacing.sm,
  },
  optionBtnSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  optionBtnCorrect: {
    borderColor: 'rgba(22,163,74,0.45)',
    backgroundColor: 'rgba(22,163,74,0.12)',
  },
  optionBtnWrong: {
    borderColor: 'rgba(220,38,38,0.5)',
    backgroundColor: 'rgba(220,38,38,0.12)',
  },
  optionText: { color: colors.textMuted },
  optionTextSelected: { color: colors.text, fontWeight: '700' },
  optionTextCorrect: { color: colors.success, fontWeight: '700' },
  scoreText: { color: colors.text, fontWeight: '800', marginBottom: spacing.sm },
  err: { color: colors.danger },
});
