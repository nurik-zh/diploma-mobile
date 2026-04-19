import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MainTabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { RoadmapsStack } from './RoadmapsStack';
import { VacanciesStack } from './VacanciesStack';
import { CommunityScreen } from '../screens/CommunityScreen';
import { ProfileStack } from './ProfileStack';
import { Platform, StyleSheet, View } from 'react-native';
import type { ThemeColors, ThemeMode } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { SideMenuProvider } from '../context/SideMenuContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_CORNER, TAB_FLOAT_BOTTOM, TAB_FLOAT_H } from './tabBarMetrics';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICON_SIZE = 21;

export function MainTabs() {
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors, mode), [colors, mode]);

  const { tabBarStyle, tabBarFillBg } = useMemo(() => {
    const bottom = TAB_FLOAT_BOTTOM + insets.bottom;
    const tabBarStyle = [
      styles.tabShell,
      Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: mode === 'dark' ? 0.4 : 0.1,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
        },
        android: { elevation: 16 },
      }),
      { bottom, height: TAB_FLOAT_H },
    ];
    const tabBarFillBg =
      mode === 'dark' ? 'rgba(22, 26, 38, 0.88)' : 'rgba(255, 255, 255, 0.92)';
    return { tabBarStyle, tabBarFillBg };
  }, [insets.bottom, mode, styles.tabShell]);

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarStyle: tabBarStyle,
      tabBarLabelStyle: styles.tabLabel,
      tabBarItemStyle: styles.tabItem,
      tabBarIconStyle: styles.tabIcon,
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: mode === 'dark' ? 'rgba(190, 198, 215, 0.5)' : 'rgba(55, 65, 81, 0.5)',
      tabBarHideOnKeyboard: true,
      tabBarBackground: () => (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: tabBarFillBg,
              borderRadius: TAB_CORNER,
            },
          ]}
        />
      ),
    }),
    [colors.accent, mode, styles, tabBarFillBg, tabBarStyle]
  );

  return (
    <SideMenuProvider>
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Главная',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} size={ICON_SIZE} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Roadmaps"
          component={RoadmapsStack}
          options={{
            title: 'Дорожки',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={focused ? 'map-marker-path' : 'map-marker-outline'}
                size={ICON_SIZE}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Vacancies"
          component={VacanciesStack}
          options={{
            title: 'Вакансии',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={focused ? 'briefcase' : 'briefcase-outline'}
                size={ICON_SIZE}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Community"
          component={CommunityScreen}
          options={{
            title: 'Сообщество',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons name={focused ? 'forum' : 'forum-outline'} size={ICON_SIZE} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{
            title: 'Профиль',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons name={focused ? 'account' : 'account-outline'} size={ICON_SIZE} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </SideMenuProvider>
  );
}

const makeStyles = (colors: ThemeColors, mode: ThemeMode) =>
  StyleSheet.create({
    tabShell: {
      position: 'absolute',
      left: 14,
      right: 14,
      marginHorizontal: 0,
      marginBottom: 0,
      marginTop: 0,
      paddingHorizontal: 2,
      paddingTop: 6,
      paddingBottom: 6,
      borderRadius: TAB_CORNER,
      borderTopWidth: 0,
      borderWidth: 1,
      borderColor: mode === 'dark' ? 'rgba(255,255,255,0.07)' : colors.border,
      backgroundColor: 'transparent',
      overflow: 'hidden',
    },
    tabIcon: {
      marginTop: 0,
      marginBottom: 1,
    },
    tabLabel: {
      fontSize: 9.5,
      fontWeight: '600',
      marginTop: 0,
      marginBottom: 0,
      letterSpacing: 0.05,
    },
    tabItem: {
      paddingTop: 0,
      paddingBottom: 0,
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
    },
  });
