import { Ionicons } from "@expo/vector-icons";
import { type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type * as React from "react";
import type { useMemberDesktopLayoutPresentation } from "../../../components/member/MemberDesktopLayout";
import { MemberMembershipCalendar } from "../components/member/MemberMembershipCalendar";
import { AppLogo } from "../../../components/AppLogo";

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
      const { styles, colors, coachMode, visibleItems, navigationGroups, activeNavLabel, setSelectedNavLabel, setProfileMenuOpen, calendarOpen, setCalendarOpen, navigation, activeNavColor, chromeIconColor, content, memberMenuVisible, setMemberMenuVisible } = model.props;
      return ((
    <View style={[styles.shell, { backgroundColor: colors.background }]}>
      <View style={[styles.sidebar, !memberMenuVisible && styles.sidebarCollapsed]}>
        <ScrollView
          style={styles.sidebarScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.sidebarContent, !memberMenuVisible && styles.sidebarContentCollapsed]}
        >
          <View style={[styles.brandRow, !memberMenuVisible && styles.brandRowCollapsed]}>
            {memberMenuVisible ? <>
              <AppLogo size={32} />
              <View style={styles.brandCopy}>
                <Text style={styles.brand}>
                  Pulse<Text style={{ color: "#E91E63" }}>Fit</Text>
                </Text>
                <Text style={styles.role}>Member Dashboard</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Collapse member navigation menu"
                accessibilityState={{ expanded: true }}
                onPress={() => setMemberMenuVisible(false)}
                style={({ pressed }) => [styles.sidebarToggle, pressed && styles.pressed]}
              >
                <Ionicons name="chevron-back" size={16} color={chromeIconColor} />
              </Pressable>
            </> : <Pressable
              accessibilityRole="button"
              accessibilityLabel="Expand member navigation menu"
              accessibilityState={{ expanded: false }}
              onPress={() => setMemberMenuVisible(true)}
              style={({ pressed }) => [styles.collapsedLogoButton, pressed && styles.pressed]}
            >
              <AppLogo size={30} />
            </Pressable>}
          </View>
          <View style={[styles.navList, !memberMenuVisible && styles.navListCollapsed]}>
            {navigationGroups.map((group) => <View key={group} style={styles.navGroup}>
              {memberMenuVisible ? <Text style={styles.navGroupLabel}>{group}</Text> : null}
              {visibleItems.filter((item) => item.group === group).map((item) => {
              const active = activeNavLabel === item.label;
              return (
                <Pressable
                  key={item.label}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    setProfileMenuOpen(false);
                    setSelectedNavLabel(item.label);
                    if (item.tab)
                      navigation.navigate("AppTabs", { screen: item.route });
                    else navigation.navigate(item.route);
                  }}
                  style={({ pressed }) => [
                    styles.navItem,
                    !memberMenuVisible && styles.navItemCollapsed,
                    active && styles.navItemActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={active ? colors.primary : chromeIconColor}
                  />
                  {memberMenuVisible ? <Text
                    style={[
                      styles.navText,
                      { color: active ? activeNavColor : chromeIconColor },
                    ]}
                  >
                    {item.label}
                  </Text> : null}
                </Pressable>
              );
              })}
            </View>)}
          </View>
        </ScrollView>
      </View>
      {content}
      {calendarOpen ? <MemberMembershipCalendar onClose={() => setCalendarOpen(false)} /> : null}
    </View>
  ));
    }
  }
}
