import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RoadmapsStackParamList } from './types';
import { RoadmapListScreen } from '../screens/RoadmapListScreen';
import { RoadmapDetailScreen } from '../screens/RoadmapDetailScreen';
import { TopicScreen } from '../screens/TopicScreen';
import { RoadmapAssessmentScreen } from '../screens/RoadmapAssessmentScreen';

const Stack = createNativeStackNavigator<RoadmapsStackParamList>();

export function RoadmapsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="RoadmapList" component={RoadmapListScreen} />
      <Stack.Screen name="RoadmapDetail" component={RoadmapDetailScreen} />
      <Stack.Screen name="Topic" component={TopicScreen} />
      <Stack.Screen name="Assessment" component={RoadmapAssessmentScreen} />
    </Stack.Navigator>
  );
}
