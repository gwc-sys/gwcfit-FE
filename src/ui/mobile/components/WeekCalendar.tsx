import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { Pressable } from "./NativePressable";

type Props = { selectedDate: Date; onSelect: (date: Date) => void };

/** Local calendar dates avoid UTC shifts around midnight and daylight savings. */
export function WeekCalendar({ selectedDate, onSelect }: Props) {
  const { colors } = useAppTheme();
  const [width, setWidth] = useState(0);
  const visibleDays = Math.max(1, Math.min(7, Math.floor((width + 4) / 52) || 7));
  const [week, setWeek] = useState(() => startOfWeek(selectedDate));
  const scroll = useRef<ScrollView>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  const [today, setToday] = useState(() => new Date().toDateString());
  useFocusEffect(useCallback(() => {
    const resetToToday = () => {
      const now = new Date();
      setToday(now.toDateString());
      setWeek(startOfWeek(now, visibleDays));
      selectRef.current(now);
    };
    resetToToday();
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") resetToToday();
    });
    return () => subscription.remove();
  }, [visibleDays]));
  const pageWidth = width;
  const selectedTime = selectedDate.getTime();
  useEffect(() => { setWeek(startOfWeek(new Date(selectedTime), visibleDays)); }, [selectedTime, visibleDays]);
  useEffect(() => { if (width) scroll.current?.scrollTo({ x: pageWidth, animated: false }); }, [week, width, pageWidth]);
  const moveWeek = (offset: number) => setWeek(current => new Date(current.getFullYear(), current.getMonth(), current.getDate() + offset * visibleDays));
  return (
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      <Text accessibilityLiveRegion="polite" style={[styles.month, { color: colors.muted }]}>{week.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</Text>
      {width > 0 && <ScrollView ref={scroll} horizontal snapToInterval={pageWidth} decelerationRate="fast" bounces={false} showsHorizontalScrollIndicator={false}
        accessibilityLabel="Calendar. Swipe left for upcoming dates or right for earlier dates."
        accessibilityActions={[{ name: "increment", label: "Upcoming dates" }, { name: "decrement", label: "Earlier dates" }]}
        onAccessibilityAction={event => moveWeek(event.nativeEvent.actionName === "increment" ? 1 : -1)}
        onMomentumScrollEnd={event => {
          const page = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
          if (page !== 1) moveWeek(page - 1);
        }}>
      {[-1, 0, 1].map(offset => <View key={offset} style={[styles.week, { width: pageWidth }]}>
      {Array.from({ length: visibleDays }, (_, index) => {
        const date = new Date(week.getFullYear(), week.getMonth(), week.getDate() + offset * visibleDays + index);
        const selected = date.toDateString() === selectedDate.toDateString();
        const isToday = date.toDateString() === today;
        return (
          <Pressable key={date.toDateString()} accessibilityRole="button"
            accessibilityLabel={`${isToday ? "Today, " : ""}${date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`}
            accessibilityState={{ selected }} onPress={() => onSelect(date)}
            style={({ pressed }) => [styles.day, { backgroundColor: isToday ? colors.primaryButton : colors.surface, borderWidth: 1, borderColor: selected ? colors.primaryButton : "transparent", opacity: pressed ? 0.7 : 1 }]}>
            <Text style={[styles.label, { color: isToday ? colors.white : colors.ink }]}>{date.toLocaleDateString(undefined, { weekday: "short" })}</Text>
            <View style={[styles.number, { backgroundColor: isToday ? colors.white : colors.surfaceMuted }]}>
              <Text style={[styles.label, { color: isToday ? colors.primaryButton : colors.ink, fontWeight: isToday || selected ? "600" : "400" }]}>{date.getDate()}</Text>
            </View>
          </Pressable>
        );
      })}
      </View>)}
      </ScrollView>}
    </View>
  );
}

function startOfWeek(date: Date, count = 7) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7) % count);
}

const styles = StyleSheet.create({
  month: { fontSize: 13, lineHeight: 20, marginBottom: 8 },
  week: { flexDirection: "row", justifyContent: "space-between", gap: 4, paddingVertical: 4, paddingBottom: 20 },
  day: { flex: 1, borderRadius: 40, padding: 3, paddingTop: 14, alignItems: "center", gap: 12 },
  label: { fontSize: 15, lineHeight: 22 },
  number: { alignSelf: "stretch", minHeight: 40, borderRadius: 30, padding: 6, alignItems: "center", justifyContent: "center" },
});
