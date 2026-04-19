import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { AppTopBar } from './AppTopBar';

type Props = {
  /** Заголовок в верхней панели (меню — название — тема). */
  title?: string;
  /** Показывать кнопку меню (на экране входа — false). По умолчанию true. */
  showMenu?: boolean;
  children: React.ReactNode;
  loading?: boolean;
};

export function ScreenScaffold({ title, showMenu = true, children, loading }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={[colors.bg2, colors.bg]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {title ? <AppTopBar title={title} showMenu={showMenu} /> : null}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        children
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: { bg: string }) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  });
