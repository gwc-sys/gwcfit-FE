import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { DataState } from "../../components/DataState";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SurfacePanel } from "../../components/SurfacePanel";
import { getApiErrorMessage } from "../../../../services/api/client";
import type * as React from "react";
import type { useNotificationsScreenPresentation } from "../../../../screens/saas/NotificationsScreen";

export function NotificationsScreenView({ model }: { model: ReturnType<typeof useNotificationsScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, query, colors, markRead } = model.props;
      return ((
    <Screen contentContainerStyle={styles.screen}>
      <ScreenHeader title="Notifications" subtitle="In-app updates" icon="notifications-outline" />
      <DataState loading={query.isLoading} error={query.error ? getApiErrorMessage(query.error) : null} />
      {query.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {!query.isLoading && !query.error && !query.data?.length ? <SurfacePanel title="All caught up" kicker="Notifications" icon="checkmark-circle-outline"><Text style={[styles.emptyText, { color: colors.textSecondary }]}>There are no new project notifications.</Text></SurfacePanel> : null}
      {query.data?.map((notification) => (
        <Pressable accessibilityRole="button" key={notification.id} onPress={() => notification.status === "unread" && markRead.mutate(notification.id)}>
          <SurfacePanel title={notification.title} kicker={notification.status === "unread" ? "Unread" : "Read"} icon={notification.status === "unread" ? "notifications-outline" : "checkmark-circle-outline"}>
            <Text style={[styles.body, { color: colors.textSecondary }]}>{notification.body}</Text>
            <View style={styles.meta}><Text style={[styles.date, { color: colors.textMuted }]}>{new Date(notification.created_at).toLocaleString("en-IN")}</Text>{notification.gym_name ? <Text style={[styles.gym, { color: colors.primary }]}>{notification.gym_name}</Text> : null}</View>
          </SurfacePanel>
        </Pressable>
      ))}
    </Screen>
  ));
    }
  }
}
