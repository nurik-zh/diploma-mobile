import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { PrimaryButton } from '../components/PrimaryButton';
import { getTodayTasks, submitDailyTask } from '../api/services';
import type { DailyTask } from '../api/types';
import type { ProfileStackParamList } from '../navigation/types';
import { ThemeColors, cardShadow, radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<ProfileStackParamList, 'DailyTasks'>;

type QuizQ = {
  id?: string;
  question?: string;
  options?: { id: string; label: string }[];
  correctOptionId?: string;
};

export function DailyTasksScreen({ navigation }: Props) {
  const { colors, mode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const elevation = useMemo(() => cardShadow(mode), [mode]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [aiPreparing, setAiPreparing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setAiPreparing(true);
    try {
      const t = await getTodayTasks();
      setTasks(t);
      setMsg(null);
    } catch (e) {
      setTasks([]);
      setMsg(e instanceof Error ? e.message : 'Не удалось загрузить задания');
    } finally {
      setAiPreparing(false);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const pendingAiCount = useMemo(() => {
    return tasks.filter((task) => {
      if (task.completed) return false;
      const quiz = task.quizData as { questions?: QuizQ[] } | null;
      const q0 = quiz?.questions?.[0];
      return !q0;
    }).length;
  }, [tasks]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  async function submit(task: DailyTask) {
    setMsg(null);
    const quiz = task.quizData as { questions?: QuizQ[] } | null;
    const q0 = quiz?.questions?.[0];
    const optionId = picked[task.id];
    if (!q0 || !optionId) {
      setMsg('Выберите вариант');
      return;
    }
    try {
      setAiPreparing(true);
      await submitDailyTask(task.id, optionId);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setAiPreparing(false);
    }
  }

  return (
    <ScreenScaffold title="Квесты дня" loading={loading}>
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
        {aiPreparing ? <Text style={styles.infoBanner}>ИИ готовит задание, подождите…</Text> : null}
        {tasks.length === 0 && !msg ? (
          <Text style={styles.infoBanner}>
            ИИ формирует квесты на сегодня. Загляните чуть позже или потяните экран вниз для обновления.
          </Text>
        ) : null}
        {tasks.length > 0 && pendingAiCount > 0 ? (
          <Text style={styles.infoBanner}>
            {pendingAiCount === tasks.length
              ? 'ИИ готовит тесты — вопросы появятся через несколько секунд. Обновите экран ниже.'
              : 'Часть тестов ещё готовит ИИ — подождите или обновите список.'}
          </Text>
        ) : null}
        {tasks.length === 0 ? null : (
          tasks.map((task) => {
            const quiz = task.quizData as { questions?: QuizQ[] } | null;
            const q0 = quiz?.questions?.[0];
            const done = task.completed;
            return (
              <View key={task.id} style={[styles.card, elevation]}>
                <Text style={styles.roadmap}>{task.roadmapTitle}</Text>
                <Text style={styles.node}>{task.nodeTitle}</Text>
                <Text style={styles.desc}>{task.description}</Text>
                <Text style={styles.points}>+{task.points} очков</Text>

                {done ? (
                  <Text style={styles.done}>Выполнено ✓</Text>
                ) : q0 ? (
                  <>
                    <Text style={styles.q}>{q0.question}</Text>
                    {(q0.options ?? []).map((o) => {
                      const sel = picked[task.id] === o.id;
                      return (
                        <Pressable
                          key={o.id}
                          style={[styles.opt, sel && styles.optSel]}
                          onPress={() =>
                            setPicked((p) => ({ ...p, [task.id]: o.id }))
                          }
                        >
                          <Text style={styles.optText}>{o.label}</Text>
                        </Pressable>
                      );
                    })}
                    <PrimaryButton
                      label="Ответить"
                      onPress={() => submit(task)}
                      disabled={!picked[task.id]}
                      style={{ marginTop: spacing.md }}
                    />
                  </>
                ) : (
                  <Text style={styles.infoInline}>ИИ готовит тест… Обновите экран чуть позже.</Text>
                )}
              </View>
            );
          })
        )}
        {msg ? <Text style={styles.err}>{msg}</Text> : null}
        <PrimaryButton
          label="Назад"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </ScreenScaffold>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roadmap: { color: colors.accent, fontWeight: '700' },
  node: { color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 4 },
  desc: { color: colors.textMuted, marginTop: spacing.sm },
  points: { color: colors.success, marginTop: spacing.sm, fontWeight: '600' },
  done: { color: colors.success, marginTop: spacing.md, fontWeight: '700' },
  q: { color: colors.text, marginTop: spacing.md, fontWeight: '600' },
  opt: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
  },
  optSel: { borderWidth: 1, borderColor: colors.accent },
  optText: { color: colors.text },
  muted: { color: colors.textMuted },
  infoBanner: {
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardInset,
  },
  infoInline: { color: colors.textMuted, marginTop: spacing.md, lineHeight: 20 },
  err: { color: colors.danger, marginTop: spacing.md },
});
