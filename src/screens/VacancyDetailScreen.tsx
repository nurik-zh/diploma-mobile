import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { PrimaryButton } from '../components/PrimaryButton';
import { getVacancyById } from '../api/services';
import type { VacanciesStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<VacanciesStackParamList, 'VacancyDetail'>;

type VacancyDetail = {
  summary: string;
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
  const { id, title } = route.params;
  const [data, setData] = useState<VacancyDetail | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <ScreenScaffold title={title} loading={loading}>
      <ScrollView contentContainerStyle={styles.content}>
        {data ? (
          <>
            <Text style={styles.summary}>{data.summary}</Text>

            <Text style={styles.h2}>Вопросы с ответами</Text>
            {questions.map((q) => (
              <View key={q.id} style={styles.block}>
                <Text style={styles.q}>{q.question}</Text>
                <Text style={styles.a}>{q.answer}</Text>
              </View>
            ))}

            <Text style={styles.h2}>Тестовые вопросы</Text>
            {tests.map((t) => (
              <View key={t.id} style={styles.block}>
                <Text style={styles.q}>{t.question}</Text>
                {t.options.map((o, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.opt,
                      i === t.correctAnswerIndex && styles.optOk,
                    ]}
                  >
                    {i + 1}. {o}
                  </Text>
                ))}
              </View>
            ))}
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

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  summary: { color: colors.text, lineHeight: 22, marginBottom: spacing.lg },
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
  opt: { color: colors.textMuted, marginTop: 4 },
  optOk: { color: colors.success, fontWeight: '600' },
  err: { color: colors.danger },
});
