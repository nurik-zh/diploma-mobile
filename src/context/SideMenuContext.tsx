import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ProfileStackParamList, RootStackParamList } from '../navigation/types';
import { ThemeColors, spacing } from '../theme';
import { useTheme } from './ThemeContext';

type SideMenuContextValue = {
  openMenu: () => void;
  closeMenu: () => void;
};

const SideMenuContext = createContext<SideMenuContextValue | null>(null);

export function useOptionalSideMenu() {
  return useContext(SideMenuContext);
}

export function SideMenuProvider({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const styles = useMemo(() => makeDrawerStyles(colors), [colors]);

  const [menuVisible, setMenuVisible] = useState(false);
  const menuX = useRef(new Animated.Value(-340)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

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

  const goProfileTab = useCallback(
    (screen: keyof ProfileStackParamList) => {
      closeMenu();
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'Main',
            params: {
              screen: 'Profile',
              params: { screen },
            },
          })
        );
      }, 170);
    },
    [closeMenu, navigation]
  );

  const value = useMemo(() => ({ openMenu, closeMenu }), [openMenu, closeMenu]);

  return (
    <SideMenuContext.Provider value={value}>
      <View style={styles.wrapper}>
        {children}
        {menuVisible ? (
          <View style={styles.menuOverlayRoot} pointerEvents="box-none">
            <Animated.View style={[styles.backdrop, { opacity: overlayOpacity }]}>
              <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
            </Animated.View>

            <Animated.View style={[styles.drawer, { transform: [{ translateX: menuX }] }]}>
              <Text style={styles.drawerTitle}>Меню</Text>

              <Pressable style={styles.drawerItem} onPress={() => goProfileTab('DailyTasks')}>
                <MaterialCommunityIcons name="shield-star-outline" size={22} color={colors.textMuted} />
                <Text style={styles.drawerItemText}>Квесты дня</Text>
              </Pressable>
              <Pressable style={styles.drawerItem} onPress={() => goProfileTab('Friends')}>
                <MaterialCommunityIcons name="account-group-outline" size={22} color={colors.textMuted} />
                <Text style={styles.drawerItemText}>Друзья</Text>
              </Pressable>
              <Pressable style={styles.drawerItem} onPress={() => goProfileTab('Verification')}>
                <MaterialCommunityIcons name="shield-check-outline" size={22} color={colors.textMuted} />
                <Text style={styles.drawerItemText}>Подтверждение</Text>
              </Pressable>
              <Pressable style={styles.drawerItem} onPress={() => goProfileTab('LevelDetermination')}>
                <MaterialCommunityIcons name="chart-line" size={22} color={colors.textMuted} />
                <Text style={styles.drawerItemText}>Определение уровня</Text>
              </Pressable>

              <Pressable
                style={styles.drawerItem}
                onPress={() => goProfileTab('ProfileHome')}
              >
                <MaterialCommunityIcons name="account-outline" size={22} color={colors.textMuted} />
                <Text style={styles.drawerItemText}>Профиль</Text>
              </Pressable>
            </Animated.View>
          </View>
        ) : null}
      </View>
    </SideMenuContext.Provider>
  );
}

const makeDrawerStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: { flex: 1 },
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
  });
