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

const Tab = createBottomTabNavigator<MainTabParamList>();

/** Плавающая панель как на референсе: отступы от краёв и от «чёлки», сплошной фон. */
const TAB_FLOAT_H = 66;
const TAB_FLOAT_SIDE = 14;
const TAB_FLOAT_BOTTOM = 6;
const TAB_CORNER = 26;
const CONTENT_EXTRA = 18;

export function MainTabs() {
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors, mode), [colors, mode]);

  const { tabBarStyle, scenePaddingBottom, tabBarFillBg } = useMemo(() => {
    const bottom = TAB_FLOAT_BOTTOM + insets.bottom;
    const scenePaddingBottom = bottom + TAB_FLOAT_H + CONTENT_EXTRA;
    const tabBarStyle = [
      styles.tabShell,
      Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: mode === 'dark' ? 0.45 : 0.12,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 12 },
        },
        android: { elevation: 20 },
      }),
      { bottom, height: TAB_FLOAT_H },
    ];
    const tabBarFillBg = mode === 'dark' ? '#161A28' : '#FFFFFF';
    return { tabBarStyle, scenePaddingBottom, tabBarFillBg };
  }, [insets.bottom, mode, styles.tabShell]);

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      sceneContainerStyle: { paddingBottom: scenePaddingBottom },
      tabBarStyle: tabBarStyle,
      tabBarLabelStyle: styles.tabLabel,
      tabBarItemStyle: styles.tabItem,
      tabBarIconStyle: styles.tabIcon,
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: mode === 'dark' ? 'rgba(200,206,220,0.55)' : 'rgba(55,65,81,0.55)',
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
    [colors.accent, mode, scenePaddingBottom, styles, tabBarFillBg, tabBarStyle]
  );

  return (
    <SideMenuProvider>
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Главная',
            tabBarIcon: ({ color, focused, size }) => (
              <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} size={size + 2} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Roadmaps"
          component={RoadmapsStack}
          options={{
            title: 'Дорожки',
            tabBarIcon: ({ color, focused, size }) => (
              <MaterialCommunityIcons
                name={focused ? 'map-marker-path' : 'map-marker-outline'}
                size={size + 2}
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
            tabBarIcon: ({ color, focused, size }) => (
              <MaterialCommunityIcons
                name={focused ? 'briefcase' : 'briefcase-outline'}
                size={size + 2}
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
            tabBarIcon: ({ color, focused, size }) => (
              <MaterialCommunityIcons name={focused ? 'forum' : 'forum-outline'} size={size + 2} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{
            title: 'Профиль',
            tabBarIcon: ({ color, focused, size }) => (
              <MaterialCommunityIcons name={focused ? 'account' : 'account-outline'} size={size + 2} color={color} />
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
      left: TAB_FLOAT_SIDE,
      right: TAB_FLOAT_SIDE,
      marginHorizontal: 0,
      marginBottom: 0,
      marginTop: 0,
      paddingHorizontal: 4,
      paddingTop: 8,
      paddingBottom: 8,
      borderRadius: TAB_CORNER,
      borderTopWidth: 0,
      borderWidth: 1,
      borderColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : colors.border,
      backgroundColor: 'transparent',
      overflow: 'hidden',
    },
    tabIcon: {
      marginTop: 0,
      marginBottom: 2,
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 0,
      marginBottom: 0,
      letterSpacing: 0.1,
    },
    tabItem: {
      paddingTop: 0,
      paddingBottom: 0,
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
    },
  });
