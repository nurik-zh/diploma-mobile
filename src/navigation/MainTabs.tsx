import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MainTabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { RoadmapsStack } from './RoadmapsStack';
import { VacanciesStack } from './VacanciesStack';
import { CommunityScreen } from '../screens/CommunityScreen';
import { ProfileStack } from './ProfileStack';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { cardShadow, radius } from '../theme';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const { colors, mode } = useTheme();
  const styles = makeStyles(colors, mode);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView intensity={35} tint={mode === 'dark' ? 'dark' : 'light'} style={[StyleSheet.absoluteFill, styles.blur]} />
          </View>
        ),
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: mode === 'dark' ? 'rgba(243,244,246,0.55)' : 'rgba(17,24,39,0.45)',
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Главная',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Roadmaps"
        component={RoadmapsStack}
        options={{
          title: 'Дорожки',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-marker-path" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Vacancies"
        component={VacanciesStack}
        options={{
          title: 'Вакансии',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="briefcase" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          title: 'Сообщество',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="forum" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const makeStyles = (colors: { border: string; bg2: string }, mode: 'dark' | 'light') =>
  StyleSheet.create({
    tabBar: {
      height: 64,
      marginHorizontal: 14,
      marginBottom: 14,
      borderRadius: radius.lg,
      borderTopWidth: 0,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: 'transparent',
      overflow: 'hidden',
      ...cardShadow(mode),
    },
    blur: {
      backgroundColor: colors.bg2,
    },
  });
