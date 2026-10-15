import { Children, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AppState, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useReducedMotion } from "react-native-reanimated";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { Pressable } from "./NativePressable";

type Props = { label: string; children: ReactNode };

export function InsightCarousel({ label, children }: Props) {
  const { colors } = useAppTheme();
  const reduceMotion = useReducedMotion();
  const pages = Children.toArray(children);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const position = useRef(0);
  const resumeAt = useRef(0);
  const scroll = useRef<ScrollView>(null);
  const count = pages.length;
  const goTo = useCallback((next: number, animated = true) => {
    position.current = next;
    setIndex(next);
    scroll.current?.scrollTo({ x: next * width, animated });
  }, [width]);
  useEffect(() => { goTo(Math.min(position.current, count - 1), false); }, [width, count, goTo]);
  useFocusEffect(useCallback(() => {
    if (reduceMotion || paused || !width || count < 2) return;
    const timer = setInterval(() => {
      if (AppState.currentState !== "active" || Date.now() < resumeAt.current) return;
      goTo((position.current + 1) % count);
    }, 5000);
    return () => clearInterval(timer);
  }, [reduceMotion, paused, width, count, goTo]));
  return <View style={{ gap: 4 }} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
    {width > 0 && <ScrollView ref={scroll} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
      accessibilityLabel={label} onTouchStart={() => { resumeAt.current = Date.now() + 15000; }}
      onScrollBeginDrag={() => { resumeAt.current = Date.now() + 15000; }}
      onMomentumScrollEnd={event => { const next = Math.max(0, Math.min(count - 1, Math.round(event.nativeEvent.contentOffset.x / width))); position.current = next; setIndex(next); }}>
      {pages.map((page, pageIndex) => <View key={pageIndex} style={{ width, paddingHorizontal: 1 }}>{page}</View>)}
    </ScrollView>}
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
      {pages.map((_, pageIndex) => <Pressable key={pageIndex} accessibilityRole="button" accessibilityLabel={`${label}, card ${pageIndex + 1} of ${count}`}
        accessibilityState={{ selected: index === pageIndex }} onPress={() => { resumeAt.current = Date.now() + 15000; goTo(pageIndex, !reduceMotion); }}
        style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: index === pageIndex ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: index === pageIndex ? colors.primary : colors.border }} />
      </Pressable>)}
      {!reduceMotion && <Pressable accessibilityRole="button" accessibilityLabel={paused ? `Resume ${label}` : `Pause ${label}`} onPress={() => setPaused(value => !value)} style={{ minHeight: 44, paddingHorizontal: 12, justifyContent: "center" }}><Text style={{ color: colors.primary, fontSize: 13 }}>{paused ? "Resume" : "Pause"}</Text></Pressable>}
    </View>
  </View>;
}
