import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { VacanciesStackParamList } from './types';
import { VacancyListScreen } from '../screens/VacancyListScreen';
import { VacancyDetailScreen } from '../screens/VacancyDetailScreen';

const Stack = createNativeStackNavigator<VacanciesStackParamList>();

export function VacanciesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0f1419' },
      }}
    >
      <Stack.Screen name="VacancyList" component={VacancyListScreen} />
      <Stack.Screen name="VacancyDetail" component={VacancyDetailScreen} />
    </Stack.Navigator>
  );
}
