import { useState } from "react";
import { PrimaryButton } from "../../components/PrimaryButton";
import { NoticeBanner } from "../../components/NoticeBanner";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { DataState } from "../../components/DataState";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SurfacePanel } from "../../components/SurfacePanel";
import { getApiErrorMessage } from "../../../../services/api/client";
import type * as React from "react";
import type { useNotificationsScreenPresentation } from "../../../../screens/saas/NotificationsScreen";

export function NotificationsScreenView({ model }: { model: ReturnType<typeof useNotificationsScreenPresentation> }): React.ReactNode {
  const [filter, setFilter] = useState<"All" | "Unread" | "Important">("All");
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, query, colors, markRead, openRelated } = model.props;
      const notifications = query.data?.filter(n => filter === "All" || (filter === "Important" ? n.important : n.status === "unread")) ?? [];
      return ((
    <Screen scroll contentContainerStyle={styles.screen}>
      <ScreenHeader title="Notifications" subtitle="Platform activity, enquiries, subscriptions, and security" icon="notifications-outline" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{(["All", "Unread", "Important"] as const).map(option => <Pressable key={option} accessibilityRole="tab" accessibilityState={{ selected: filter === option }} onPress={() => setFilter(option)} style={{ minHeight: 44, paddingHorizontal: 18, justifyContent: "center", borderRadius: 12, backgroundColor: filter === option ? colors.primarySoft : colors.surface }}><Text style={{ color: filter === option ? colors.primary : colors.ink }}>{option}</Text></Pressable>)}<PrimaryButton title="Refresh" variant="secondary" loading={query.isFetching} onPress={() => void query.refetch()} /></View>
      <NoticeBanner tone="error" message={markRead.error ? getApiErrorMessage(markRead.error) : null} />
      <DataState loading={query.isLoading} error={query.error ? getApiErrorMessage(query.error) : null} />
      {query.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {!query.isLoading && !query.error && !notifications.length ? <SurfacePanel title="All caught up" kicker="Notifications" icon="checkmark-circle-outline"><Text style={[styles.emptyText, { color: colors.textSecondary }]}>{filter === "Unread" ? "No unread notifications." : filter === "Important" ? "No important notifications." : "Your platform notifications will appear here."}</Text></SurfacePanel> : null}
      {notifications.map((notification) => (
        <View key={notification.id}>
          <SurfacePanel title={notification.title} kicker={notification.status === "unread" ? "Unread" : "Read"} icon={notification.status === "unread" ? "notifications-outline" : "checkmark-circle-outline"}>
            <Text style={[styles.body, { color: colors.textSecondary }]}>{notification.body}</Text>
            <View style={styles.meta}><Text style={[styles.date, { color: colors.textMuted }]}>{new Date(notification.created_at).toLocaleString("en-IN")}</Text>{notification.gym_name ? <Text style={[styles.gym, { color: colors.primary }]}>{notification.gym_name}</Text> : null}</View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {notification.status === "unread" ? <PrimaryButton title="Mark as read" variant="secondary" disabled={markRead.isPending} onPress={() => markRead.mutate(notification.id)} /> : null}
              {notification.route && notification.route !== "Notifications" ? <PrimaryButton title="Open related information" variant="secondary" onPress={() => { if (notification.status === "unread") markRead.mutate(notification.id); openRelated(notification); }} /> : null}
            </View>
          </SurfacePanel>
        </View>
      ))}
    </Screen>
  ));
    }
  }
}
