import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { getLeaderboard, getProfile } from '../api/services';
import type { Profile } from '../api/types';
import { ThemeColors, cardShadow, radius, spacing } from '../theme';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../navigation/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export function HomeScreen() {
  const { colors, mode, toggleMode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const elevation = useMemo(() => cardShadow(mode), [mode]);
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Home'>>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [leaders, setLeaders] = useState<
    { userId: number; fullName: string; points: number; rank: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const menuX = useRef(new Animated.Value(-340)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    try {
      const [p, lb] = await Promise.all([getProfile(), getLeaderboard()]);
      setProfile(p);
      setLeaders(lb.leaders.slice(0, 8));
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const closeMenu = useCallback(() => {
    Animated.parallel([
      Animated.timing(menuX, {
        toValue: -340,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => setMenuVisible(false));
  }, [menuX, overlayOpacity]);

  const openMenu = useCallback(() => {
    setMenuVisible(true);
    Animated.parallel([
      Animated.timing(menuX, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [menuX, overlayOpacity]);

  const goFromMenu = useCallback(
    (screen: 'DailyTasks' | 'Friends' | 'Verification' | 'LevelDetermination') => {
      closeMenu();
      setTimeout(() => navigation.navigate('Profile', { screen }), 170);
    },
    [closeMenu, navigation]
  );

  return (
    <ScreenScaffold loading={loading}>
      <View style={styles.topBar}>
        <Pressable style={styles.menuBtn} onPress={openMenu}>
          <MaterialCommunityIcons name="menu" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.brand}>Diploma</Text>
        </View>
        <Pressable
          style={styles.themeBtn}
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
        {profile ? (
          <>
            <View style={[styles.heroCard, elevation]}>
              <Text style={styles.heroTitle}>Все сделано на сегодня</Text>
              <View style={styles.heroMeta}>
                <MaterialCommunityIcons name="check-decagram" size={16} color={colors.success} />
                <Text style={styles.heroMetaText}>
                  {profile.completedTests} задач
                </Text>
              </View>
            </View>

            <View style={[styles.rankCard, elevation]}>
              <Text style={styles.sectionTitle}>Топ платформы</Text>
              {leaders.map((l) => (
                <View key={l.userId} style={styles.row}>
                  <Text style={styles.rank}>#{l.rank}</Text>
                  <Text style={styles.name} numberOfLines={1}>
                    {l.fullName}
                  </Text>
                  <Text style={styles.pts}>{l.points}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.err}>Не удалось загрузить профиль</Text>
        )}
      </ScrollView>

      {menuVisible ? (
        <View style={styles.menuOverlayRoot} pointerEvents="box-none">
          <Animated.View style={[styles.backdrop, { opacity: overlayOpacity }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
          </Animated.View>

          <Animated.View style={[styles.drawer, { transform: [{ translateX: menuX }] }]}>
            <Text style={styles.drawerTitle}>Меню</Text>

            <Pressable style={styles.drawerItem} onPress={() => goFromMenu('DailyTasks')}>
              <MaterialCommunityIcons name="shield-star-outline" size={22} color={colors.textMuted} />
              <Text style={styles.drawerItemText}>Квесты дня</Text>
            </Pressable>
            <Pressable style={styles.drawerItem} onPress={() => goFromMenu('Friends')}>
              <MaterialCommunityIcons name="account-group-outline" size={22} color={colors.textMuted} />
              <Text style={styles.drawerItemText}>Друзья</Text>
            </Pressable>
            <Pressable style={styles.drawerItem} onPress={() => goFromMenu('Verification')}>
              <MaterialCommunityIcons name="shield-check-outline" size={22} color={colors.textMuted} />
              <Text style={styles.drawerItemText}>Подтверждение</Text>
            </Pressable>
            <Pressable style={styles.drawerItem} onPress={() => goFromMenu('LevelDetermination')}>
              <MaterialCommunityIcons name="chart-line" size={22} color={colors.textMuted} />
              <Text style={styles.drawerItemText}>Определение уровня</Text>
            </Pressable>

            <Pressable
              style={styles.drawerItem}
              onPress={() => navigation.navigate('Profile', { screen: 'ProfileHome' })}
            >
              <MaterialCommunityIcons name="account-outline" size={22} color={colors.textMuted} />
              <Text style={styles.drawerItemText}>Профиль</Text>
            </Pressable>
          </Animated.View>
        </View>
      ) : null}
    </ScreenScaffold>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  topBar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { color: colors.text, fontWeight: '900', fontSize: 22, letterSpacing: 0.4 },
  themeBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  heroCard: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heroMeta: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardInset,
  },
  heroMetaText: { color: colors.text, fontWeight: '600', fontSize: 16 },
  rankCard: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rank: { width: 40, color: colors.accent, fontWeight: '700', fontSize: 16 },
  name: { flex: 1, color: colors.text, fontSize: 16 },
  pts: { color: colors.textMuted, fontWeight: '600', fontSize: 16 },
  menuOverlayRoot: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 340,
    backgroundColor: colors.bg2,
    borderRightWidth: 1,
    borderColor: colors.border,
    paddingTop: 64,
    paddingHorizontal: spacing.md,
  },
  drawerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
  },
  drawerItemText: { color: colors.text, fontSize: 16, fontWeight: '700', lineHeight: 22 },
  err: { color: colors.danger },
});
