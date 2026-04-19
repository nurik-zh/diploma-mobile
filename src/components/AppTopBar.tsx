import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeColors, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useOptionalSideMenu } from '../context/SideMenuContext';

type Props = {
  title: string;
  /** Показывать кнопку меню (на экране входа — нет). По умолчанию true. */
  showMenu?: boolean;
};

export function AppTopBar({ title, showMenu = true }: Props) {
  const { colors, mode, toggleMode } = useTheme();
  const sideMenu = useOptionalSideMenu();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const onMenuPress = () => {
    sideMenu?.openMenu();
  };

  return (
    <View style={styles.topBar}>
      {showMenu ? (
        <Pressable
          style={styles.iconBtn}
          onPress={onMenuPress}
          disabled={!sideMenu}
          accessibilityRole="button"
          accessibilityLabel="Меню"
        >
          <MaterialCommunityIcons name="menu" size={24} color={colors.text} />
        </Pressable>
      ) : (
        <View style={styles.iconBtnSpacer} />
      )}
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </View>
      <Pressable
        style={styles.iconBtn}
        onPress={toggleMode}
        accessibilityRole="button"
        accessibilityLabel="Переключить тему"
      >
        <MaterialCommunityIcons
          name={mode === 'dark' ? 'weather-night' : 'white-balance-sunny'}
          size={22}
          color={colors.accent}
        />
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    topBar: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xs },
    title: {
      color: colors.text,
      fontWeight: '900',
      fontSize: 22,
      letterSpacing: 0.4,
      maxWidth: '100%',
    },
    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.glass,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBtnSpacer: {
      width: 44,
      height: 44,
    },
  });
