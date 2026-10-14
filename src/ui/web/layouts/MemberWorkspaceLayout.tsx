import { Ionicons } from "@expo/vector-icons";
import { type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { requestLogoutConfirmation } from "../../../utils/logoutConfirmation";
import type * as React from "react";
import type { useMemberDesktopLayoutPresentation } from "../../../components/member/MemberDesktopLayout";

export function MemberDesktopLayoutView({ model }: { model: ReturnType<typeof useMemberDesktopLayoutPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, colors, children } = model.props;
      return ((
      <View
        style={[styles.mobileShell, { backgroundColor: colors.background }]}
      >
        {children}
      </View>
    ));
    }
    case "view2": {
      const { styles, colors, coachMode, visibleItems, activeNavLabel, setSelectedNavLabel, navigation, activeNavColor, chromeIconColor, user, logout, content } = model.props;
      return ((
    <View style={[styles.shell, { backgroundColor: colors.background }]}>
      <View style={styles.sidebar}>
        <ScrollView
          style={styles.sidebarScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sidebarContent}
        >
          <View style={styles.brandRow}>
            <Ionicons name="pulse" size={34} color={colors.primary} />
            <View>
              <Text style={styles.brand}>PulseFit</Text>
              <Text style={styles.role}>
                {coachMode ? "AI COACH" : "Member Dashboard"}
              </Text>
            </View>
          </View>
          <View style={styles.navList}>
            {visibleItems.map((item) => {
              const active = activeNavLabel === item.label;
              return (
                <Pressable
                  key={item.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    setSelectedNavLabel(item.label);
                    if (item.tab)
                      navigation.navigate("AppTabs", { screen: item.route });
                    else navigation.navigate(item.route);
                  }}
                  style={({ pressed }) => [
                    styles.navItem,
                    active && styles.navItemActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={21}
                    color={active ? activeNavColor : chromeIconColor}
                  />
                  <Text
                    style={[
                      styles.navText,
                      { color: active ? activeNavColor : chromeIconColor },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {coachMode ? (
            <View style={styles.heartCard}>
              <View style={styles.heartTitle}>
                <Ionicons name="heart" size={18} color="#EC4899" />
                <Text style={styles.heartLabel}>Live Heart Rate</Text>
              </View>
              <View style={styles.heartValueRow}>
                <Text style={styles.heartValue}>--</Text>
                <Text style={styles.heartUnit}>BPM</Text>
              </View>
              <View style={styles.heartChart}>
                {[9, 15, 8, 19, 12, 22, 11, 25, 16, 29, 18].map(
                  (height, index) => (
                    <View key={index} style={[styles.heartBar, { height }]} />
                  ),
                )}
              </View>
              <Text style={styles.heartHint}>Sensor not connected</Text>
            </View>
          ) : null}
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
            <View style={styles.userCopy}>
              <Text numberOfLines={1} style={styles.userName}>
                {user?.full_name ?? "Member"}
              </Text>
              <Text style={styles.userRole}>Member</Text>
            </View>
            <Pressable accessibilityRole="button"
              accessibilityLabel="Log out"
              onPress={() => requestLogoutConfirmation(() => logout.mutate())}
            >
              <Ionicons name="chevron-down" size={21} color={chromeIconColor} />
            </Pressable>
          </View>
        </ScrollView>
      </View>
      {content}
    </View>
  ));
    }
  }
}
