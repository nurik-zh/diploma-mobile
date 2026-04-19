import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { ThemeColors, radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

export function AuthScreen() {
  const { login, register } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register(email.trim(), password, fullName.trim() || undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setBusy(false);
    }
  }

  const headerTitle = mode === 'login' ? 'Вход' : 'Регистрация';

  return (
    <ScreenScaffold title={headerTitle} showMenu={false} loading={false}>
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <Text style={styles.logo}>Diploma</Text>
          <Text style={styles.tagline}>Подготовка к IT-собеседованиям</Text>
        </View>

        <View style={styles.toggleRow}>
          <PrimaryButton
            label="Вход"
            variant={mode === 'login' ? 'primary' : 'outline'}
            onPress={() => setMode('login')}
            style={styles.toggleBtn}
          />
          <PrimaryButton
            label="Регистрация"
            variant={mode === 'register' ? 'primary' : 'outline'}
            onPress={() => setMode('register')}
            style={styles.toggleBtn}
          />
        </View>

        {mode === 'register' ? (
          <TextInput
            style={styles.input}
            placeholder="Имя"
            placeholderTextColor={colors.textMuted}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Пароль"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          label={mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          onPress={onSubmit}
          disabled={busy || !email || !password}
        />

        <Text style={styles.hint}>
          Сервер должен быть запущен на ПК (порт 5002). Телефон и ПК — в одной Wi‑Fi
          сети. Если вход всё равно не работает, в корне проекта создайте .env с
          строкой EXPO_PUBLIC_API_URL=http://IP_ВАШЕГО_ПК:5002
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
    </ScreenScaffold>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  brand: { marginBottom: spacing.xl },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1,
  },
  tagline: { color: colors.textMuted, marginTop: spacing.xs, fontSize: 15 },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  toggleBtn: { flex: 1 },
  input: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    marginBottom: spacing.md,
    fontSize: 16,
  },
  error: { color: colors.danger, marginBottom: spacing.md },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
