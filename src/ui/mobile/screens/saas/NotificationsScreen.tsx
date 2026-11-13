import { showAlert } from "../../../../utils/appAlert";
import { Pressable } from "../../components/NativePressable";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { RefreshControl, Text, View } from "react-native";
import { PulseChips, pulseStyles } from "../../components/PulseReference";
import { pulseAccents } from "../../theme/referenceTokens";
import { relativeTime } from "../../data/referenceMetrics";
import { DataState } from "../../components/DataState";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { InteractionDialog } from "../../components/InteractionDialog";
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
  const [filter, setFilter] = useState<"All" | "Unread" | "Important">("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => { setSelectedId(null); }, [model?.props?.query?.isFetching, model?.props?.query?.error, model?.props?.userRole]);
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  const { query, colors, markRead, markAllRead, dismissNotification, clearAll, enableDelivery, openRelated, userRole } = model.props;
  const s = pulseStyles(colors);
  const visibleData = query.error || (userRole === "trainer" && query.isFetching) ? [] : query.data ?? [];
  const selected = visibleData.find(notification => notification.id === selectedId) ?? null;
  const notifications = visibleData.filter(notification => filter === "All" || (filter === "Important" ? notification.important : notification.status === "unread"));
  return <Screen reference scroll contentContainerStyle={s.screen} refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => { void query.refetch(); }} tintColor={colors.primary} />}>
    <ScreenHeader title="Notifications" />
    <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
      <PulseChips options={["All", "Unread", "Important"]} value={filter} onChange={setFilter} />
      <PrimaryButton title="Mark all as read" icon="checkmark-done-outline" variant="secondary" loading={markAllRead.isPending} disabled={!notifications.some(n => n.status === "unread")} onPress={() => markAllRead.mutate()} />
      <PrimaryButton title="Clear all" icon="trash-outline" variant="danger" loading={clearAll.isPending} disabled={!notifications.length} onPress={() => clearAll.mutate()} />
    </View>
    <PrimaryButton title="Enable system notifications" icon="notifications-outline" variant="secondary" loading={enableDelivery.isPending} onPress={() => enableDelivery.mutate()} />
    <NoticeBanner message={enableDelivery.error ? (enableDelivery.error as Error).message : enableDelivery.data ?? null} tone={enableDelivery.error ? "error" : "info"} />
    <DataState loading={query.isLoading || (userRole === "trainer" && query.isFetching)} error={query.error ? getApiErrorMessage(query.error) : null} empty={!query.isFetching && !query.error && !notifications.length} emptyTitle="All caught up" emptyMessage={filter === "Unread" ? "No unread notifications." : "Your updates will appear here."} />
    <NoticeBanner tone="error" message={markRead.error ? getApiErrorMessage(markRead.error) : null} />
    <View>{notifications.map(notification => {
      const item = category(notification);
      return <Pressable accessibilityRole="button" accessibilityLabel={`${notification.title}, ${notification.status}. Open notification`} key={notification.id} onPress={() => { setSelectedId(notification.id); if (notification.status === "unread" && !markRead.isPending) markRead.mutate(notification.id); }} style={({ pressed }) => [s.row, { paddingVertical: 16, alignItems: "flex-start", borderBottomWidth: 0.5, borderBottomColor: colors.borderMuted }, pressed && { opacity: 0.65 }]}>
        <View style={[s.avatar, { backgroundColor: `${item.color}18` }]}><Ionicons name={item.icon} size={20} color={item.color} /></View>
        <View style={s.copy}><Text style={s.name}>{notification.title}</Text><Text style={s.meta}>{notification.body}</Text><Text style={s.meta}>{relativeTime(notification.created_at)}{notification.gym_name ? ` - ${notification.gym_name}` : ""}</Text></View>
        <View style={{ alignItems: "center", gap: 16, paddingTop: 4 }}>{notification.status === "unread" && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: pulseAccents.blue }} />}<Ionicons name="chevron-forward" size={16} color={colors.muted} /></View>
      </Pressable>;
    })}</View>
    <InteractionDialog visible={Boolean(selected)} onClose={() => setSelectedId(null)} accessibilityLabel="Notification details">
      <Text accessibilityRole="header" style={[s.name, { fontSize: 20 }]}>{selected?.title}</Text>
      <Text style={[s.meta, { fontSize: 16, lineHeight: 24 }]}>{selected?.body}</Text>
      <Text style={s.meta}>{selected ? relativeTime(selected.created_at) : ""}</Text>
      {selected?.route && selected.route !== "Notifications" ? <PrimaryButton title="Open related information" onPress={() => { if (selected) openRelated(selected); setSelectedId(null); }} /> : null}
      {selected ? <PrimaryButton title="Dismiss" variant="danger" onPress={() => { dismissNotification.mutate(selected.id); setSelectedId(null); }} /> : null}
      <PrimaryButton title="Done" onPress={() => setSelectedId(null)} />
    </InteractionDialog>
  </Screen>;
}
