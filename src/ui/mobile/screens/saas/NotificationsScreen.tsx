import { showAlert } from "../../../../utils/appAlert";
import { Pressable } from "../../components/NativePressable";
import { pulseEffects } from "../../theme/referenceTokens";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Modal, RefreshControl, Text, View } from "react-native";
import { PulseChips, pulseStyles } from "../../components/PulseReference";
import { pulseAccents } from "../../theme/referenceTokens";
import { relativeTime } from "../../data/referenceMetrics";
import { DataState } from "../../components/DataState";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { AppNotification } from "../../../../types/saas";
import type * as React from "react";
import type { useNotificationsScreenPresentation } from "../../../../screens/saas/NotificationsScreen";

function category(notification: AppNotification) {
  const title = notification.title.toLowerCase();
  if (/payment|invoice|receipt/.test(title)) return { icon: "wallet" as const, color: pulseAccents.green };
  if (/expir|renew/.test(title)) return { icon: "calendar" as const, color: pulseAccents.orange };
  if (/announcement|class|schedule/.test(title)) return { icon: "megaphone" as const, color: pulseAccents.pink };
  return { icon: "people" as const, color: pulseAccents.blue };
}

export function NotificationsScreenView({ model }: { model: ReturnType<typeof useNotificationsScreenPresentation> }): React.ReactNode {
  const [filter, setFilter] = useState<"All" | "Unread">("All");
  const [selected, setSelected] = useState<AppNotification | null>(null);
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  const { query, colors, markRead } = model.props;
  const s = pulseStyles(colors);
  const notifications = query.data?.filter(notification => filter === "All" || notification.status === "unread") ?? [];
  return <Screen reference scroll contentContainerStyle={s.screen} refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} tintColor={colors.primary} />}>
    <ScreenHeader title="Notifications" />
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <PulseChips options={["All", "Unread"]} value={filter} onChange={setFilter} />
      <Pressable accessibilityRole="button" accessibilityLabel="Important notifications information" onPress={() => showAlert("Important notifications", "These updates do not include importance labels. Use All or Unread to view your notifications.")} style={{ minHeight: 48, justifyContent: "center" }}><View style={{ minHeight: 32, paddingHorizontal: 14, borderRadius: 10, backgroundColor: colors.surfaceMuted, justifyContent: "center" }}><Text style={s.chipText}>Important</Text></View></Pressable>
    </View>
    <DataState loading={query.isLoading} error={query.error ? getApiErrorMessage(query.error) : null} empty={!query.isLoading && !query.error && !notifications.length} emptyTitle="All caught up" emptyMessage={filter === "Unread" ? "No unread notifications." : "Your updates will appear here."} />
    <NoticeBanner tone="error" message={markRead.error ? getApiErrorMessage(markRead.error) : null} />
    <View>{notifications.map(notification => {
      const item = category(notification);
      return <Pressable accessibilityRole="button" accessibilityLabel={`${notification.title}, ${notification.status}. Open notification`} key={notification.id} onPress={() => { setSelected(notification); if (notification.status === "unread" && !markRead.isPending) markRead.mutate(notification.id); }} style={({ pressed }) => [s.row, { paddingVertical: 16, alignItems: "flex-start", borderBottomWidth: 0.5, borderBottomColor: colors.borderMuted }, pressed && { opacity: 0.65 }]}>
        <View style={[s.avatar, { backgroundColor: `${item.color}18` }]}><Ionicons name={item.icon} size={20} color={item.color} /></View>
        <View style={s.copy}><Text style={s.name}>{notification.title}</Text><Text style={s.meta}>{notification.body}</Text><Text style={s.meta}>{relativeTime(notification.created_at)}{notification.gym_name ? ` - ${notification.gym_name}` : ""}</Text></View>
        <View style={{ alignItems: "center", gap: 16, paddingTop: 4 }}>{notification.status === "unread" && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: pulseAccents.blue }} />}<Ionicons name="chevron-forward" size={16} color={colors.muted} /></View>
      </Pressable>;
    })}</View>
    <Modal visible={Boolean(selected)} transparent animationType="none" onRequestClose={() => setSelected(null)}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close notification" onPress={() => setSelected(null)} style={{ flex: 1, justifyContent: "center", backgroundColor: pulseEffects.scrim, padding: 20 }}>
        <Pressable accessible={false} onPress={event => event.stopPropagation()} style={s.card}><Text accessibilityRole="header" style={[s.name, { fontSize: 20 }]}>{selected?.title}</Text><Text style={[s.meta, { fontSize: 16, lineHeight: 24 }]}>{selected?.body}</Text><Text style={s.meta}>{selected ? relativeTime(selected.created_at) : ""}</Text><PrimaryButton title="Done" onPress={() => setSelected(null)} /></Pressable>
      </Pressable>
    </Modal>
  </Screen>;
}
