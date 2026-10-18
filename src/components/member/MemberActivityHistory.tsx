import { useInfiniteQuery } from "@tanstack/react-query";
import { Modal, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { memberApi } from "../../services/api/member";
import type { MemberActivityDay } from "../../types/member";

type Props = { onClose: () => void; onGoal: () => void };
export function MemberActivityHistory({ onClose, onGoal }: Props) {
  const { isDark } = useAppTheme();
  const text = isDark ? "#FFFFFF" : "#111111";
  const muted = isDark ? "#A9A9B0" : "#5B5B64";
  const background = isDark ? "#090909" : "#F2F2F7";
  const panel = isDark ? "#202020" : "#FFFFFF";
  const query = useInfiniteQuery({
    queryKey: ["member", "activity", "history"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => memberApi.getActivity(30, pageParam),
    getNextPageParam: (last, pages) => { const count = pages.reduce((n, page) => n + page.items.length, 0); return count < last.total ? count : undefined; },
  });
  const button = (label: string, action: () => void) => <Pressable accessibilityRole="button" onPress={action} style={s.button}><Text style={{ color: text, fontWeight: "600" }}>{label}</Text></Pressable>;
  const row = ({ item }: { item: MemberActivityDay }) => <View style={[s.day, { backgroundColor: panel }]}>
    <Text style={[s.date, { color: text }]}>{new Date(`${item.activity_date}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", weekday: "short" })}</Text>
    <View style={s.stats}><Text style={[s.stat, { color: text }]}>{item.source ? item.steps.toLocaleString() : "—"} steps</Text><Text style={[s.stat, { color: text }]}>{item.source ? item.distance_km.toFixed(2) : "—"} km</Text></View>
    <Text style={[s.detail, { color: text }]}>{item.calories_completed.toLocaleString()} / {item.calories_target || "—"} kcal</Text>
    <Text style={{ color: muted }}>{item.calories_target ? `${item.calories_remaining} kcal remaining · ${item.completion_percentage}% complete` : "No daily kcal target recorded"}</Text>
    {item.calories_source === "steps" ? <Text style={[s.source, { color: muted }]}>{item.calories_estimated} kcal estimated from steps{item.calorie_estimate_uses_default_weight ? " (70 kg default weight)" : ""}</Text> : null}
    <Text style={[s.source, { color: muted }]}>{item.source === "android_foreground" ? "Steps recorded while app was active · Estimated distance" : item.source === "ios_pedometer" ? "Phone motion sensor · Estimated distance" : "No step data recorded"}</Text>
  </View>;
  return <Modal animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose} visible>
    <View style={[s.screen, { backgroundColor: background }]}>
      <View style={s.header}><Text accessibilityRole="header" style={[s.title, { color: text }]}>Activity history</Text>{button("Close", onClose)}</View>
      <Text style={[s.subtitle, { color: muted }]}>Your daily Move goal, steps and estimated distance</Text>
      {button("Set / change daily kcal goal", () => { onClose(); onGoal(); })}
      {query.isLoading ? <Text style={{ color: muted }}>Loading activity history…</Text> : null}
      {query.error ? <View><Text style={{ color: muted }}>Could not load activity history.</Text>{button("Retry", () => void query.refetch())}</View> : null}
      <FlatList data={query.data?.pages.flatMap(page => page.items) ?? []} keyExtractor={item => item.activity_date} renderItem={row}
        contentContainerStyle={{ gap: 12, paddingBottom: 32 }} refreshing={query.isRefetching && !query.isFetchingNextPage} onRefresh={() => void query.refetch()}
        ListEmptyComponent={!query.isLoading && !query.error ? <Text style={{ color: muted }}>Recorded days will appear here.</Text> : null}
        ListFooterComponent={query.hasNextPage ? button(query.isFetchingNextPage ? "Loading…" : "Load earlier days", () => { if (!query.isFetchingNextPage) void query.fetchNextPage(); }) : null} />
    </View>
  </Modal>;
}
const s = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20, paddingTop: 28 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  title: { fontSize: 23, fontWeight: "700", flexShrink: 1 }, subtitle: { fontSize: 13, lineHeight: 19, marginBottom: 6 },
  button: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4, marginBottom: 8 }, day: { padding: 18, borderRadius: 20, gap: 9 },
  date: { fontSize: 17, fontWeight: "600" }, stats: { flexDirection: "row", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  stat: { fontSize: 21, fontWeight: "600" }, detail: { fontSize: 16 }, source: { fontSize: 11, lineHeight: 16 }
});
