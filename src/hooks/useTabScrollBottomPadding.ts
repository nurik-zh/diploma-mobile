import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tabBarScrollBottomInset } from '../navigation/tabBarMetrics';

/** Нижний отступ для ScrollView/FlatList на экранах вкладок (плавающее меню). */
export function useTabScrollBottomPadding(): number {
  const { bottom } = useSafeAreaInsets();
  return tabBarScrollBottomInset(bottom);
}
