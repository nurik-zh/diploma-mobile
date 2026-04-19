import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from './types';
import { ProfileScreen } from '../screens/ProfileScreen';
import { DailyTasksScreen } from '../screens/DailyTasksScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { VerificationScreen } from '../screens/VerificationScreen';
import { LevelDeterminationScreen } from '../screens/LevelDeterminationScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="DailyTasks" component={DailyTasksScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="LevelDetermination" component={LevelDeterminationScreen} />
    </Stack.Navigator>
  );
}
