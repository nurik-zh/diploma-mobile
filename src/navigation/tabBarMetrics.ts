/** Общие размеры плавающего таббара (должны совпадать с MainTabs). */
export const TAB_FLOAT_H = 62;
export const TAB_FLOAT_BOTTOM = 6;
export const TAB_CORNER = 26;
/** Доп. отступ снизу у ScrollView, чтобы контент не уезжал под меню. */
export const TAB_SCROLL_EXTRA = 24;

/** Сколько пикселей добавить к contentContainerStyle.paddingBottom на экранах вкладок. */
export function tabBarScrollBottomInset(safeAreaBottom: number): number {
  return TAB_FLOAT_BOTTOM + safeAreaBottom + TAB_FLOAT_H + TAB_SCROLL_EXTRA;
}
