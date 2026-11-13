import { getMemberC, darkThemeColors } from "../../../../theme/colors";
import * as React from "react";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../../../store/useAuthStore";
import type { useMemberNotificationsScreenPresentation } from "../../../../screens/member/MemberFeatureScreens";
import type { MemberNotification } from "../../../../types/member";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const C = getMemberC(darkThemeColors);

// ─── Local UI Notification Type ───────────────────────────────────────────────
type UiNotification = {
  notification_uuid: string;
  title: string;
  body: string;
  status: string;
  read_at?: string | null;
  created_at: string;
  notification_type: string;
  payload: Record<string, unknown>;
  category: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  timeLabel: string;
  group: "TODAY" | "EARLIER_THIS_WEEK";
  bodyBold?: string[];
};

const CATEGORIES = ["All", "Workouts", "Payments", "Announcements", "System"] as const;
type Category = (typeof CATEGORIES)[number];

// ─── Bold-text renderer ───────────────────────────────────────────────────────
function BoldText({ text, boldParts }: { text: string; boldParts?: string[] }) {
  if (!boldParts?.length) return <Text style={s.notifBody}>{text}</Text>;
  const parts: Array<{ text: string; bold: boolean }> = [];
  let remaining = text;
  for (const bold of boldParts) {
    const idx = remaining.indexOf(bold);
    if (idx === -1) continue;
    if (idx > 0) parts.push({ text: remaining.slice(0, idx), bold: false });
    parts.push({ text: bold, bold: true });
    remaining = remaining.slice(idx + bold.length);
  }
  if (remaining) parts.push({ text: remaining, bold: false });
  return (
    <Text style={s.notifBody}>
      {parts.map((p, i) =>
        p.bold ? (
          <Text key={i} style={s.notifBodyBold}>
            {p.text}
          </Text>
        ) : (
          <Text key={i}>{p.text}</Text>
        )
      )}
    </Text>
  );
}

// ─── Squircle Icon ────────────────────────────────────────────────────────────
function SquircleIcon({
  name,
  bg,
}: {
  name: keyof typeof Ionicons.glyphMap;
  bg: string;
}) {
  return (
    <View
      style={[
        s.squircle,
        { backgroundColor: bg + "22", borderColor: bg + "44" },
      ]}
    >
      <Ionicons name={name} size={20} color={bg} />
    </View>
  );
}

// ─── Notification Card ────────────────────────────────────────────────────────
function NotifCard({
  item,
  onMarkRead,
  onDismiss,
}: {
  item: UiNotification;
  onMarkRead?: () => void;
  onDismiss: () => void;
}) {
  const isUnread = item.status === "unread";
  return (
    <View style={s.notifCard}>
      <View style={s.notifRow}>
        <SquircleIcon name={item.iconName} bg={item.iconBg} />
        <View style={s.notifMeta}>
          <View style={s.notifTitleRow}>
            <Text style={s.notifTitle}>{item.title}</Text>
            {isUnread ? (
              <View style={s.unreadDot} />
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(52, 199, 89, 0.14)", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Ionicons name="checkmark-done" size={11} color={C.green} />
                <Text style={{ color: C.green, fontSize: 10, fontWeight: "700" }}>Read</Text>
              </View>
            )}
            <Text style={[s.notifTime]}>{item.timeLabel}</Text>
          </View>
          <BoldText text={item.body} boldParts={item.bodyBold} />
        </View>
      </View>

      {isUnread && <View style={s.cardDivider} />}

      <View style={s.notifActions}>
        <View style={{ flex: 1 }} />
        {isUnread && onMarkRead ? (
          <Pressable
            onPress={onMarkRead}
            accessibilityRole="button"
            style={s.markReadBtn}
          >
            <Text style={s.markReadText}>Mark Read</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          style={s.dismissBtn}
        >
          <Text style={s.dismissText}>Dismiss</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Group Header ─────────────────────────────────────────────────────────────
function GroupHeader({
  label,
  right,
}: {
  label: string;
  right: string;
}) {
  return (
    <View style={s.groupHeader}>
      <Text style={s.groupLabel}>{label}</Text>
      <Text style={s.groupRight}>{right}</Text>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <View style={s.emptyWrap}>
      <View style={s.emptyIconWrap}>
        <Ionicons name="notifications-off-outline" size={40} color={C.muted} />
      </View>
      <Text style={s.emptyTitle}>No notifications</Text>
      <Text style={s.emptyMsg}>
        Membership, payments, workouts, classes, and gym announcements will
        appear here.
      </Text>
    </View>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
export function MemberNotificationsScreenView({
  model,
}: {
  model: ReturnType<typeof useMemberNotificationsScreenPresentation>;
}): React.ReactNode {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const storageKeyPrefix = `pulsefit:member-notif:${user?.id || "guest"}`;
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [searchText, setSearchText] = useState("");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [clearedAll, setClearedAll] = useState<boolean>(() => {
    try {
      return globalThis.localStorage?.getItem(`${storageKeyPrefix}:cleared`) === "1";
    } catch {
      return false;
    }
  });
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    try {
      const raw = globalThis.localStorage?.getItem(`${storageKeyPrefix}:dismissed`);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [localReadIds, setLocalReadIds] = useState<Set<string>>(() => {
    try {
      const raw = globalThis.localStorage?.getItem(`${storageKeyPrefix}:read`);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;

  if (model.kind !== "view1") return null;
  const { unreadOnly, setUnreadOnly, markRead, markAllRead, dismissNotification, clearAll } = model.props;

  // Map real backend notifications
  const backendData: MemberNotification[] = model.props.query.data ?? [];
  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  const rawNotifications: UiNotification[] = backendData.map((n) => {
    const typeLower = `${n.notification_type} ${n.title}`.toLowerCase();
    const category =
      typeLower.includes("pay") || typeLower.includes("receipt") || typeLower.includes("plan")
        ? "Payments"
        : typeLower.includes("workout") || typeLower.includes("diet") || typeLower.includes("meal") || typeLower.includes("train")
        ? "Workouts"
        : typeLower.includes("announce") || typeLower.includes("class") || typeLower.includes("schedule")
        ? "Announcements"
        : "System";
    const iconName: keyof typeof Ionicons.glyphMap =
      category === "Payments"
        ? "checkmark"
        : category === "Workouts"
        ? "barbell-outline"
        : category === "Announcements"
        ? "megaphone-outline"
        : "notifications-outline";
    const iconBg =
      category === "Payments"
        ? C.green
        : category === "Workouts"
        ? C.primary
        : category === "Announcements"
        ? C.blue
        : C.purple;
    const createdDate = new Date(n.created_at);
    const isToday =
      !Number.isNaN(createdDate.getTime()) &&
      createdDate.toDateString() === new Date().toDateString();
    const timeLabel = !Number.isNaN(createdDate.getTime())
      ? isToday
        ? createdDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : createdDate.toLocaleDateString("en-US", { month: "short", day: "2-digit" })
      : "Just now";
    return {
      notification_uuid: n.notification_uuid,
      title: n.title,
      body: n.body,
      status: n.status,
      read_at: n.read_at,
      created_at: n.created_at,
      notification_type: n.notification_type,
      payload: n.payload,
      category,
      iconName,
      iconBg,
      timeLabel,
      group: isToday ? "TODAY" : "EARLIER_THIS_WEEK",
      bodyBold: undefined,
    };
  });

  // Apply local state overrides
  const notifications = rawNotifications
    .filter((n) => !dismissedIds.has(n.notification_uuid))
    .map((n) => ({
      ...n,
      status: localReadIds.has(n.notification_uuid) ? "read" : n.status,
    }));

  // Filter by category
  const categoryFiltered =
    activeCategory === "All"
      ? notifications
      : notifications.filter((n) => n.category === activeCategory);

  // Filter by unread
  const unreadFiltered = unreadOnly
    ? categoryFiltered.filter((n) => n.status === "unread")
    : categoryFiltered;

  // Filter by search
  const filtered = searchText.trim()
    ? unreadFiltered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchText.toLowerCase()) ||
          n.body.toLowerCase().includes(searchText.toLowerCase())
      )
    : unreadFiltered;

  // Groups
  const todayItems = filtered.filter((n) => n.group === "TODAY");
  const earlierItems = filtered.filter((n) => n.group === "EARLIER_THIS_WEEK");

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const persistReadIds = (next: Set<string>) => {
    try {
      globalThis.localStorage?.setItem(`${storageKeyPrefix}:read`, JSON.stringify([...next]));
    } catch {
      // Ignore storage errors
    }
  };
  const persistDismissedIds = (next: Set<string>, isCleared = clearedAll) => {
    try {
      globalThis.localStorage?.setItem(`${storageKeyPrefix}:dismissed`, JSON.stringify([...next]));
      globalThis.localStorage?.setItem(`${storageKeyPrefix}:cleared`, isCleared ? "1" : "0");
    } catch {
      // Ignore storage errors
    }
  };

  const handleMarkRead = (id: string) => {
    setLocalReadIds((prev) => {
      const next = new Set([...prev, id]);
      persistReadIds(next);
      return next;
    });
    if (isUuid(id)) {
      markRead.mutate(id);
    }
    setActionFeedback("Notification marked as read.");
  };
  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => {
      const next = new Set([...prev, id]);
      persistDismissedIds(next);
      return next;
    });
    if (isUuid(id)) {
      dismissNotification?.mutate(id);
    }
    setActionFeedback("Notification dismissed.");
  };
  const handleMarkAllRead = () => {
    const ids = notifications.map((n) => n.notification_uuid);
    setLocalReadIds((prev) => {
      const next = new Set([...prev, ...ids]);
      persistReadIds(next);
      return next;
    });
    markAllRead?.mutate();
    setActionFeedback("All notifications marked as read.");
  };
  const handleClearAll = () => {
    const allIds = rawNotifications.map((n) => n.notification_uuid);
    setClearedAll(true);
    setDismissedIds((prev) => {
      const next = new Set([...prev, ...allIds]);
      persistDismissedIds(next, true);
      return next;
    });
    clearAll?.mutate();
    setActionFeedback("All notifications cleared.");
  };

  const avatarInitial = (
    user?.full_name?.[0] ||
    "M"
  ).toUpperCase();

  const formattedToday = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <View style={s.root}>
      {/* ── HEADER ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack?.()}
            style={s.backBtn}
          >
            <Ionicons name="chevron-back" size={16} color={C.inkSoft} />
          </Pressable>
          <View>
            <View style={s.headerTitleRow}>
              <Text style={s.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={s.unreadBadge}>
                  <Text style={s.unreadBadgeText}>{unreadCount} unread</Text>
                </View>
              )}
            </View>
            <Text style={s.headerSubtitle}>Personal updates</Text>
          </View>
        </View>

        <View style={s.headerRight}>
          {/* Search bar */}
          <View style={s.searchBar}>
            <Ionicons name="search-outline" size={14} color={C.muted} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search notifications..."
              placeholderTextColor={C.muted}
              style={s.searchInput}
            />
          </View>

          {/* Date pill */}
          <View style={s.datePill}>
            <Ionicons name="calendar-outline" size={12} color={C.primary} />
            <Text style={s.datePillText}>{formattedToday}</Text>
          </View>

          {/* Avatar */}
          <View style={s.avatar}>
            <Text style={s.avatarText}>{avatarInitial}</Text>
          </View>
        </View>
      </View>

      {/* ── BODY ── */}
      <ScrollView
        style={s.body}
        contentContainerStyle={s.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Control Bar */}
        <View style={s.controlBar}>
          <View style={s.controlLeft}>
            <Switch
              value={unreadOnly}
              onValueChange={setUnreadOnly}
              trackColor={{ true: C.muted, false: "#1C1C1E" }}
              thumbColor={unreadOnly ? "#FFFFFF" : "#F2F2F7"}
              style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
            />
            <View>
              <Text style={s.unreadOnlyLabel}>Unread only</Text>
              <Text style={s.unreadOnlySub}>Filter current alerts</Text>
            </View>
          </View>
          <View style={s.controlRight}>
            <Pressable
              onPress={handleMarkAllRead}
              accessibilityRole="button"
              style={s.markAllBtn}
            >
              <Ionicons name="checkmark-outline" size={13} color={C.green} />
              <Text style={s.markAllText}>Mark all as read</Text>
            </Pressable>
            <Pressable
              onPress={handleClearAll}
              accessibilityRole="button"
              style={s.clearAllBtn}
            >
              <Ionicons name="trash-outline" size={13} color={C.primary} />
              <Text style={s.clearAllText}>Clear all</Text>
            </Pressable>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={s.tabRow}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeCategory === cat }}
              style={[s.tab, activeCategory === cat && s.tabActive]}
            >
              <Text
                style={[
                  s.tabText,
                  activeCategory === cat && s.tabTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Notifications */}
        {actionFeedback ? (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(52, 199, 89, 0.14)", borderColor: "rgba(52, 199, 89, 0.14)", borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="checkmark-circle" size={16} color={C.green} />
              <Text style={{ color: C.ink, fontSize: 13, fontWeight: "600" }}>{actionFeedback}</Text>
            </View>
            <Pressable onPress={() => setActionFeedback(null)} accessibilityRole="button">
              <Ionicons name="close" size={16} color={C.muted} />
            </Pressable>
          </View>
        ) : null}
        <>
          {/* TODAY */}
          {todayItems.length > 0 && (
            <>
              <GroupHeader label="TODAY" right="Apple Push Sync" />
              {todayItems.map((item) => (
                <NotifCard
                  key={item.notification_uuid}
                  item={item}
                  onMarkRead={
                    item.status === "unread"
                      ? () => handleMarkRead(item.notification_uuid)
                      : undefined
                  }
                  onDismiss={() => handleDismiss(item.notification_uuid)}
                />
              ))}
            </>
          )}

          {/* EARLIER THIS WEEK */}
          {earlierItems.length > 0 && (
            <>
              <GroupHeader label="EARLIER THIS WEEK" right="Archived Alerts" />
              {earlierItems.map((item) => (
                <NotifCard
                  key={item.notification_uuid}
                  item={item}
                  onMarkRead={
                    item.status === "unread"
                      ? () => handleMarkRead(item.notification_uuid)
                      : undefined
                  }
                  onDismiss={() => handleDismiss(item.notification_uuid)}
                />
              ))}
            </>
          )}

          {filtered.length === 0 && <EmptyState />}
        </>
      </ScrollView>

      {/* ── FLOATING ASK GEMINI ── */}
      <View style={s.floatingWrap} pointerEvents="box-none">
        <Pressable accessibilityRole="button" style={s.geminiPill}>
          <Ionicons name="sparkles" size={14} color="#FFFFFF" />
          <Text style={s.geminiText}>Ask Gemini</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.headerBg,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: C.ink,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: C.muted,
    fontSize: 12,
    marginTop: 1,
  },
  unreadBadge: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.cardBorder,
    minWidth: 180,
  },
  searchInput: {
    color: C.ink,
    fontSize: 12,
    flex: 1,
    padding: 0,
  },
  searchPlaceholder: {
    color: C.muted,
    fontSize: 12,
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  datePillText: {
    color: C.inkSoft,
    fontSize: 12,
    fontWeight: "500",
  },
  emptyStatePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.blue + "55",
  },
  emptyStatePillActive: {
    backgroundColor: C.blue,
    borderColor: C.blue,
  },
  emptyStatePillText: {
    color: C.blue,
    fontSize: 12,
    fontWeight: "500",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  // Body
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    paddingBottom: 80,
    gap: 0,
  },

  // Control Bar
  controlBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 0,
    marginBottom: 0,
    flexWrap: "wrap",
    gap: 10,
  },
  controlLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  controlRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unreadOnlyLabel: {
    color: C.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  unreadOnlySub: {
    color: C.muted,
    fontSize: 11,
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1C1C1E",
    backgroundColor: "rgba(52, 199, 89, 0.14)",
  },
  markAllText: {
    color: C.green,
    fontSize: 12,
    fontWeight: "600",
  },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1C1C1E",
    backgroundColor: "rgba(255, 59, 48, 0.14)",
  },
  clearAllText: {
    color: C.primary,
    fontSize: 12,
    fontWeight: "600",
  },

  // Category Tabs
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.card,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: C.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: C.ink,
  },
  tabText: {
    color: C.muted,
    fontSize: 13,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#000000",
    fontWeight: "700",
  },

  // Group Headers
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 4,
  },
  groupLabel: {
    color: C.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  groupRight: {
    color: C.muted,
    fontSize: 11,
  },

  // Notification Card
  notifCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    marginBottom: 10,
    paddingTop: 14,
    paddingHorizontal: 14,
    overflow: "hidden",
  },
  notifRow: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 12,
  },
  squircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  notifMeta: {
    flex: 1,
    gap: 4,
  },
  notifTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  notifTitle: {
    color: C.ink,
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 1,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.primary,
  },
  notifTime: {
    color: C.muted,
    fontSize: 12,
    marginLeft: "auto",
  },
  notifBody: {
    color: C.inkSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  notifBodyBold: {
    color: C.ink,
    fontWeight: "700",
  },
  cardDivider: {
    height: 1,
    backgroundColor: C.cardBorder,
    marginHorizontal: -14,
  },
  notifActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    justifyContent: "flex-end",
  },
  markReadBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1C1C1E",
    backgroundColor: "#1C1C1E",
  },
  markReadText: {
    color: C.inkSoft,
    fontSize: 12,
    fontWeight: "600",
  },
  dismissBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.primary + "55",
    backgroundColor: "transparent",
  },
  dismissText: {
    color: C.primary,
    fontSize: 12,
    fontWeight: "600",
  },

  // Empty State
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    color: C.ink,
    fontSize: 18,
    fontWeight: "700",
  },
  emptyMsg: {
    color: C.muted,
    fontSize: 13,
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 20,
  },

  // Floating Gemini
  floatingWrap: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  geminiPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 122, 255, 0.14)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.14)",
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  geminiText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
