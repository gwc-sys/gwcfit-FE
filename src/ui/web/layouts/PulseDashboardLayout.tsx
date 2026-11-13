import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useReducedMotion } from "react-native-reanimated";
import { useState, type ReactNode } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Svg, { Path, Rect, Circle, Polygon, Polyline, Line } from "react-native-svg";
import { initials } from "../../../utils/formatters";
import { requestLogoutConfirmation } from "../../../utils/logoutConfirmation";
import { Screen } from "../components/Screen";
import { AppLogo } from "../../../components/AppLogo";
import {
  BellSvg,
  ClockSvg,
  SearchSvg,
  SunSvg,
} from "../../../components/icons/PulseSvgIcons";
import type * as React from "react";
import type { usePulseDashboardLayoutPresentation, useGymOwnerSidebarPresentation, useOwnerAccountItemPresentation, useMobileBrandButtonPresentation, usePulseDashboardHeaderPresentation, useHeaderCircleButtonPresentation } from "../../../components/dashboard/PulseDashboardLayout";

// --- Vector SVGs for the Collapsed Navigation Rail matching reference images ---

function CollapsedRailIcon({ label, color }: { label: string; color: string }) {
  switch (label) {
    case "Dashboard":
    case "Overview":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <Line x1="4" y1="20" x2="4" y2="14" />
          <Line x1="9" y1="20" x2="9" y2="5" />
          <Line x1="14" y1="20" x2="14" y2="11" />
          <Line x1="19" y1="20" x2="19" y2="7" />
        </Svg>
      );
    case "Members":
      return (
        <Svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <Circle cx="9" cy="7" r="4" />
          <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </Svg>
      );
    case "Trainers":
      return (
        <Svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M6 5v14" />
          <Path d="M18 5v14" />
          <Path d="M2 9v6" />
          <Path d="M22 9v6" />
          <Line x1="6" y1="12" x2="18" y2="12" />
        </Svg>
      );
    case "Receptionists":
    case "Staff":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </Svg>
      );
    case "Invitations":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M19 21v-2a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v2" />
          <Circle cx="13" cy="7" r="4" />
          <Line x1="3" y1="11" x2="7" y2="11" />
          <Line x1="5" y1="9" x2="5" y2="13" />
        </Svg>
      );
    case "Attendance":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <Rect x="3" y="4" width="18" height="18" rx="3" />
          <Line x1="16" y1="2" x2="16" y2="6" />
          <Line x1="8" y1="2" x2="8" y2="6" />
          <Line x1="3" y1="10" x2="21" y2="10" />
          <Circle cx="8" cy="14" r="0.8" fill={color} />
          <Circle cx="12" cy="14" r="0.8" fill={color} />
          <Circle cx="16" cy="14" r="0.8" fill={color} />
          <Circle cx="8" cy="18" r="0.8" fill={color} />
          <Circle cx="12" cy="18" r="0.8" fill={color} />
          <Circle cx="16" cy="18" r="0.8" fill={color} />
        </Svg>
      );
    case "Workouts":
      return (
        <Svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M2 13h4l2.5-6 4 13 3-9 2.5 4h2" />
          <Circle cx="21" cy="13" r="1.5" fill={color} />
        </Svg>
      );
    case "Nutrition":
    case "Diets":
      return (
        <Ionicons name="restaurant-outline" size={20} color={color} />
      );
    case "Payments":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <Rect x="2" y="5" width="20" height="14" rx="3" />
          <Rect x="5" y="8" width="4" height="3" rx="0.5" fill={color} />
        </Svg>
      );
    case "Membership Plans":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <Polygon points="12 2 2 7 12 12 22 7 12 2" />
          <Path d="M2 12l10 5 10-5" />
          <Path d="M2 17l10 5 10-5" />
        </Svg>
      );
    case "Reports":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <Polyline points="14 2 14 8 20 8" />
          <Line x1="16" y1="13" x2="8" y2="13" />
          <Line x1="16" y1="17" x2="8" y2="17" />
        </Svg>
      );
    case "Ratings & Feedback":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </Svg>
      );
    case "Settings":
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="12" cy="12" r="3" />
          <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </Svg>
      );
    default:
      return <Ionicons name="ellipse-outline" size={18} color={color} />;
  }
}

const ownerCollapsedNavItems = [
  { label: "Dashboard", route: "AppTabs", params: { screen: "Dashboard" } },
  { label: "Members", route: "MemberList" },
  { label: "Trainers", route: "Trainers" },
  { label: "Receptionists", route: "Staff" },
  { label: "Invitations", route: "Invitations" },
  { label: "Attendance", route: "Attendance" },
  { label: "Workouts", route: "WorkoutPlans" },
  { label: "Nutrition", route: "DietPlans" },
  { label: "Payments", route: "Payments" },
  { label: "Membership Plans", route: "MembershipPlans" },
  { label: "Reports", route: "Reports" },
  { label: "Ratings & Feedback", route: "RatingsFeedback" },
  { label: "Settings", route: "Settings" },
];

export function PulseDashboardLayoutView({ model }: { model: ReturnType<typeof usePulseDashboardLayoutPresentation> }): React.ReactNode {
  const reduceMotion = useReducedMotion();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [hoveredRailItem, setHoveredRailItem] = useState<string | null>(null);
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { hideDefaultHeader, paymentGraceEndsAt, savedGymName, styles, contentStyle, refreshControl, isDesktop, isTrainer, isGymOwner, GymOwnerSidebar, activeLabel, navigation, isPlatformAdmin, colors, resolvedRoleLabel, sidebarItems, setAccountMenuOpen, userName, MobileBrandButton, firstName, unreadNotificationCount, resolvedTrainerSearch, setResolvedTrainerSearch, trainerDate, children, accountMenuOpen, user, OwnerAccountItem, isDark, toggleColorScheme, logout, webMenuVisible, setWebMenuVisible } = model.props;
      return ((
    <Screen
      scroll
      noPadding
      maxWidth="none"
      style={[styles.root, isGymOwner && { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scrollContent, contentStyle, isGymOwner && { backgroundColor: colors.background }]}
      refreshControl={refreshControl}
    >
      <View
        style={[
          styles.shell,
          isDesktop ? styles.shellDesktop : styles.shellMobile,
        ]}
      >
        {isDesktop ? (
          <ScrollView
            scrollEnabled={!isTrainer}
            style={[
              styles.sidebar,
              isTrainer && styles.trainerSidebar,
              isGymOwner && styles.ownerSidebar,
              !webMenuVisible && {
                width: 64,
                flexBasis: 64,
                padding: 0,
                alignSelf: "flex-start",
                position: Platform.OS === "web" ? ("sticky" as any) : "relative",
                top: 0,
                height: Platform.OS === "web" ? ("100vh" as any) : undefined,
                maxHeight: Platform.OS === "web" ? ("100vh" as any) : undefined,
              }
            ]}
            contentContainerStyle={
              !webMenuVisible
                ? [styles.sidebarContent, { alignItems: "stretch", paddingHorizontal: 0, paddingTop: 12, paddingBottom: 24, backgroundColor: colors.surface, minHeight: "100%" }]
                : isGymOwner
                ? styles.ownerSidebarContent
                : [
                    styles.sidebarContent,
                    isTrainer && styles.trainerSidebarContent,
                  ]
            }
            showsVerticalScrollIndicator={false}
          >
            {isGymOwner && webMenuVisible ? (
              <View style={{ position: "relative", flex: 1, width: "100%" }}>
                <GymOwnerSidebar
                  activeLabel={activeLabel}
                  onNavigate={(route, params) =>
                    navigation.navigate(route, params)
                  }
                  styles={styles}
                  onCollapse={() => setWebMenuVisible(false)}
                />
              </View>
            ) : null}
            {isGymOwner && !webMenuVisible ? (
              <View style={{ width: "100%", alignItems: "stretch", minHeight: "100%" }}>
                {/* Top Brand Logo - clicking expands the sidebar */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Expand navigation menu"
                  onPress={() => setWebMenuVisible(true)}
                  style={({ pressed }) => [
                    {
                      alignItems: "center",
                      justifyContent: "center",
                      paddingTop: 8,
                      paddingBottom: 14,
                      cursor: "pointer" as any,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 0 22px rgba(233, 30, 99, 0.4)",
                    }}
                  >
                    <AppLogo size={36} chromeless />
                  </View>
                </Pressable>

                {/* 13 Navigation Rail Items */}
                <View style={{ width: "100%", gap: 3, alignItems: "stretch" }}>
                  {ownerCollapsedNavItems.map((item) => {
                    const isActive =
                      item.label === activeLabel ||
                      (item.label === "Receptionists" && (activeLabel === "Staff" || activeLabel === "Receptionists")) ||
                      (item.label === "Nutrition" && (activeLabel === "Diets" || activeLabel === "Nutrition")) ||
                      (item.label === "Membership Plans" && (activeLabel === "Membership plans" || activeLabel === "Membership Plans"));

                    const isHovered = hoveredRailItem === item.label;

                    return (
                      <Pressable
                        key={item.label}
                        accessibilityRole="button"
                        accessibilityLabel={item.label}
                        accessibilityState={{ selected: isActive }}
                        onHoverIn={() => setHoveredRailItem(item.label)}
                        onHoverOut={() => setHoveredRailItem((prev) => (prev === item.label ? null : prev))}
                        onPress={() =>
                          item.route &&
                          navigation.navigate(
                            item.route,
                            item.label === "Dashboard"
                              ? { screen: "Dashboard" }
                              : item.params,
                          )
                        }
                        style={({ pressed }) => [
                          {
                            width: "100%",
                            height: 46,
                            flexDirection: "row",
                            alignItems: "center",
                            cursor: "pointer" as any,
                          },
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        {isActive ? (
                          <View
                            style={{
                              flex: 1,
                              height: 46,
                              marginLeft: 8,
                              borderTopLeftRadius: 23,
                              borderBottomLeftRadius: 23,
                              borderTopRightRadius: 0,
                              borderBottomRightRadius: 0,
                              backgroundColor: "#E91E63",
                              alignItems: "center",
                              justifyContent: "center",
                              paddingRight: 8,
                              boxShadow: "0 0 20px rgba(233, 30, 99, 0.5)",
                            }}
                          >
                            <CollapsedRailIcon label={item.label} color="#FFFFFF" />
                          </View>
                        ) : (
                          <View
                            style={[
                              {
                                width: "100%",
                                height: 44,
                                alignItems: "center",
                                justifyContent: "center",
                              },
                              isHovered && {
                                backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
                                borderRadius: 12,
                              },
                            ]}
                          >
                            <CollapsedRailIcon
                              label={item.label}
                              color={isHovered ? colors.ink : colors.textSecondary}
                            />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
            {!isGymOwner ? (
              <>
                <View
                  style={[
                    styles.brandRow,
                    isPlatformAdmin && styles.platformBrandRow,
                    isTrainer && styles.trainerBrandRow,
                  ]}
                >
                  <AppLogo size={isTrainer ? 46 : 44} />
                  <View>
                    <Text style={styles.brandName}>
                      Pulse<Text style={{ color: "#E91E63" }}>Fit</Text>
                    </Text>
                    <Text style={styles.brandRole}>
                      {resolvedRoleLabel.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.navList,
                    isPlatformAdmin && styles.platformNavList,
                    isTrainer && styles.trainerNavList,
                  ]}
                >
                  {sidebarItems.map((item) => {
                    const isActive = item.label === activeLabel;
                    const section = isPlatformAdmin
                      ? (
                          {
                            Overview: "MAIN",
                            "Roles & Permissions": "SYSTEM",
                            Settings: "CONFIGURATION",
                          } as Record<string, string>
                        )[item.label]
                      : undefined;
                    return (
                      <View key={item.label}>
                        {section ? (
                          <Text style={styles.navSection}>{section}</Text>
                        ) : null}
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{ selected: isActive }}
                          onPress={() => {
                            if (!item.route) return;
                            if (item.route === "AppTabs") {
                              navigation.navigate("AppTabs", {
                                screen: "Dashboard",
                              });
                              return;
                            }
                            if (item.route === "Settings") {
                              navigation.navigate(item.route, item.params);
                              return;
                            }
                            navigation.navigate(item.route, item.params);
                          }}
                          style={({ pressed }) => [
                            styles.navItem,
                            isPlatformAdmin && styles.platformNavItem,
                            isTrainer && styles.trainerNavItem,
                            isActive && styles.navItemActive,
                            isPlatformAdmin &&
                              isActive &&
                              styles.platformNavActive,
                            isTrainer && isActive && styles.trainerNavActive,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Ionicons
                            name={item.icon}
                            size={isPlatformAdmin ? 17 : isTrainer ? 20 : 22}
                            color={
                              isActive
                                ? colors.primary
                                : colors.textSecondary
                            }
                          />
                          <Text
                            style={[
                              styles.navLabel,
                              isTrainer && styles.trainerNavLabel,
                              isActive && styles.navLabelActive,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>

                {!isTrainer ? (
                  <View style={styles.sidebarFooter}>
                    {isPlatformAdmin ? (
                      <View style={styles.copyright}>
                        <Text style={styles.copyrightText}>
                          © 2025 PulseFit Developer Ad
                        </Text>
                        <Text style={styles.copyrightText}>
                          All rights reserved.
                        </Text>
                      </View>
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Open trainer account menu"
                        onPress={() => setAccountMenuOpen(true)}
                        style={({ pressed }) => [
                          styles.profileCard,
                          isTrainer && styles.trainerProfileCard,
                          pressed && styles.pressed,
                        ]}
                      >
                        <LinearGradient
                          colors={
                            isTrainer
                              ? ["#E91E63", "#E91E63"]
                              : ["rgba(0, 122, 255, 0.14)", "#007AFF"]
                          }
                          style={styles.avatar}
                        >
                          <Text style={styles.avatarText}>
                            {initials(userName) || "JT"}
                          </Text>
                        </LinearGradient>
                        <View style={styles.profileCopy}>
                          <Text numberOfLines={1} style={styles.profileName}>
                            {isGymOwner ? savedGymName : userName}
                          </Text>
                          <Text numberOfLines={1} style={styles.profileRole}>
                            {resolvedRoleLabel}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-down"
                          size={18}
                          color={colors.textSecondary}
                        />
                      </Pressable>
                    )}
                  </View>
                ) : null}
              </>
            ) : null}
          </ScrollView>
        ) : null}

        {!isDesktop ? (
          <>
          <View style={styles.mobileBrandBar}>
            <View style={styles.mobileBrandGroup}>
              <AppLogo size={36} />
              <Text style={styles.mobileBrandName}>
                Pulse<Text style={{ color: "#E91E63" }}>Fit</Text>
              </Text>
              <View style={styles.mobileIdentityCopy}>
                <Text numberOfLines={1} style={styles.mobileIdentityName}>
                  {isGymOwner ? savedGymName : userName}
                </Text>
                <Text numberOfLines={1} style={styles.mobileIdentityRole}>
                  {resolvedRoleLabel}
                </Text>
              </View>
            </View>
            <View style={styles.mobileBrandActions}>
              <MobileBrandButton
                label={mobileMenuVisible ? "Close menu" : "Open menu"}
                icon={mobileMenuVisible ? "close" : "menu-outline"}
                onPress={() => setMobileMenuVisible((visible) => !visible)}
              />
              <MobileBrandButton
                label="Notifications"
                icon="notifications-outline"
                onPress={() => navigation.navigate("Notifications")}
              />
              <MobileBrandButton
                label="Profile"
                icon="person-outline"
                onPress={() => navigation.navigate("Profile")}
              />
            </View>
          </View>
          {mobileMenuVisible ? (
            <View style={styles.mobileMenuPanel}>
              {sidebarItems.map((item) => {
                const isActive = item.label === activeLabel;
                return (
                  <Pressable
                    key={item.label}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    onPress={() => {
                      if (!item.route) return;
                      setMobileMenuVisible(false);
                      if (item.route === "AppTabs") {
                        navigation.navigate("AppTabs", { screen: "Dashboard" });
                        return;
                      }
                      navigation.navigate(item.route, item.params);
                    }}
                    style={({ pressed }) => [
                      styles.mobileMenuItem,
                      isActive && styles.mobileMenuItemActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={isActive ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.mobileMenuLabel, isActive && styles.mobileMenuLabelActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          </>
        ) : null}

        <View style={[styles.mainPanel, isGymOwner && { backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: 18, gap: 16 }]}>
          {isGymOwner && !hideDefaultHeader ? (
            <View style={styles.sharedOwnerHeader}>
              <View style={styles.sharedOwnerGreeting}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text numberOfLines={1} style={styles.sharedOwnerTitle}>
                    Welcome to {savedGymName}
                  </Text>
                </View>
                <View style={styles.sharedOwnerSubRow}>
                  <Text style={styles.sharedOwnerPaymentInlineText}>
                    {paymentGraceEndsAt
                      ? (() => {
                          const days = Math.max(
                            0,
                            Math.ceil(
                              (Date.parse(String(paymentGraceEndsAt)) -
                                Date.now()) /
                                86400000,
                            ),
                          );
                          return `Payment due in ${days} ${days === 1 ? "day" : "days"}`;
                        })()
                      : "Payment due in 1 day"}
                  </Text>
                </View>
              </View>
              <View style={styles.sharedOwnerActions}>
                <View style={styles.sharedOwnerSearchWrap}>
                  <SearchSvg size={15} color={colors.textSecondary} />
                  <TextInput
                    placeholder="Search members..."
                    placeholderTextColor={colors.textPlaceholder}
                    style={styles.sharedOwnerSearchInput}
                    onFocus={() => navigation.navigate("MemberList")}
                  />
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open notifications"
                  onPress={() => navigation.navigate("Notifications")}
                  style={styles.sharedOwnerIcon}
                >
                  <BellSvg size={16} color={colors.ink} />
                  <View style={styles.sharedOwnerBadgeDot} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Toggle theme"
                  onPress={toggleColorScheme}
                  style={styles.sharedOwnerIcon}
                >
                  <SunSvg size={16} color="#E91E63" />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open Gym Owner profile menu"
                  onPress={() => setAccountMenuOpen(true)}
                  style={styles.sharedOwnerProfile}
                >
                  <View style={styles.sharedOwnerAvatar}>
                    <Text style={styles.sharedOwnerAvatarText}>
                      {initials(isGymOwner ? savedGymName : userName) || "ZF"}
                    </Text>
                  </View>
                  <View style={styles.sharedOwnerProfileCopy}>
                    <Text
                      numberOfLines={1}
                      style={styles.sharedOwnerProfileName}
                    >
                      {isGymOwner ? savedGymName : userName}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={13}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>
          ) : null}
          {isTrainer ? (
            <View style={styles.sharedTrainerHeader}>
              <View style={styles.sharedTrainerGreeting}>
                <Text style={styles.sharedTrainerName}>
                  {firstName(userName)}!
                </Text>
                <Text style={styles.sharedTrainerMessage}>
                  You're doing great. Keep pushing!
                </Text>
              </View>
              <View style={styles.sharedTrainerActions}>
                <View style={styles.sharedTrainerSearch}>
                  <Ionicons name="search-outline" size={21} color="#007AFF" />
                  <TextInput
                    value={resolvedTrainerSearch}
                    onChangeText={setResolvedTrainerSearch}
                    placeholder="Search something..."
                    placeholderTextColor={colors.textPlaceholder}
                    style={styles.sharedTrainerSearchInput}
                  />
                  {resolvedTrainerSearch ? (
                    <Pressable accessibilityRole="button"
                      accessibilityLabel="Clear search"
                      onPress={() => setResolvedTrainerSearch("")}
                    >
                      <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                    </Pressable>
                  ) : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open attendance calendar"
                  onPress={() => navigation.navigate("Attendance")}
                  style={styles.sharedTrainerDate}
                >
                  <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                  <Text style={styles.sharedTrainerDateText}>
                    {trainerDate}
                  </Text>
                  <Ionicons name="chevron-down" size={17} color="#007AFF" />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open notifications"
                  onPress={() => navigation.navigate("Notifications")}
                  style={styles.sharedTrainerIcon}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={24}
                    color="#007AFF"
                  />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open trainer profile menu"
                  onPress={() => setAccountMenuOpen(true)}
                  style={styles.sharedTrainerProfile}
                >
                  <View style={styles.sharedTrainerProfileInner}>
                    <Ionicons name="person" size={22} color="#007AFF" />
                  </View>
                </Pressable>
              </View>
            </View>
          ) : null}
          {children}
        </View>
      </View>
      {accountMenuOpen ? (
        <Modal
          visible
          transparent
          animationType={reduceMotion ? "none" : "fade"}
          onRequestClose={() => setAccountMenuOpen(false)}
        >
          <View
            style={[
              styles.ownerAccountBackdrop,
              isTrainer && styles.trainerAccountBackdrop,
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close account menu"
              style={StyleSheet.absoluteFill}
              onPress={() => setAccountMenuOpen(false)}
            />
            <View
              style={[
                styles.ownerAccountMenu,
                isTrainer && styles.trainerAccountMenu,
              ]}
            >
              <View
                style={[
                  styles.ownerAccountIdentity,
                  isTrainer && styles.trainerAccountIdentity,
                ]}
              >
                <View
                  style={[
                    styles.ownerAccountAvatar,
                    isTrainer && styles.trainerAccountAvatar,
                  ]}
                >
                  <Text style={styles.ownerAccountAvatarText}>
                    {initials(isGymOwner ? savedGymName : userName) || "U"}
                  </Text>
                </View>
                <View style={styles.ownerAccountCopy}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.ownerAccountName,
                      !isTrainer && { color: colors.ink, fontSize: 15 },
                      isTrainer && styles.trainerAccountName,
                    ]}
                  >
                    {isGymOwner ? savedGymName : userName}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.ownerAccountEmail,
                      !isTrainer && { color: colors.textSecondary, fontSize: 12 },
                      isTrainer && styles.trainerAccountEmail,
                    ]}
                  >
                    {user?.email ?? resolvedRoleLabel}
                  </Text>
                </View>
              </View>
              <View style={styles.ownerAccountDivider} />
              <OwnerAccountItem
                icon="person-outline"
                label="My Profile"
                trainer={isTrainer}
                onPress={() => {
                  setAccountMenuOpen(false);
                  navigation.navigate("Profile");
                }}
                styles={styles}
              />
              {isTrainer ? (
                <OwnerAccountItem
                  icon="settings-outline"
                  label="Settings"
                  trainer
                  onPress={() => {
                    setAccountMenuOpen(false);
                    navigation.navigate("Profile");
                  }}
                  styles={styles}
                />
              ) : (
                <>
                  <OwnerAccountItem
                    icon="settings-outline"
                    label="Settings"
                    onPress={() => {
                      setAccountMenuOpen(false);
                      navigation.navigate("Settings");
                    }}
                    styles={styles}
                  />
                </>
              )}
              <OwnerAccountItem
                icon="notifications-outline"
                label="Notifications"
                trainer={isTrainer}
                onPress={() => {
                  setAccountMenuOpen(false);
                  navigation.navigate("Notifications");
                }}
                styles={styles}
              />
              {isTrainer ? (
                <OwnerAccountItem
                  icon="shield-checkmark-outline"
                  label="Security"
                  trainer
                  onPress={() => {
                    setAccountMenuOpen(false);
                    navigation.navigate("Profile");
                  }}
                  styles={styles}
                />
              ) : (
                <OwnerAccountItem
                  icon="shield-checkmark-outline"
                  label="Security"
                  onPress={() => {
                    setAccountMenuOpen(false);
                    navigation.navigate("FeaturePlaceholder", {
                      title: "Security",
                    });
                  }}
                  styles={styles}
                />
              )}
              {isTrainer ? (
                <OwnerAccountItem
                  icon={isDark ? "sunny-outline" : "moon-outline"}
                  label={`Theme: ${isDark ? "Dark" : "Light"}`}
                  trainer
                  onPress={toggleColorScheme}
                  styles={styles}
                />
              ) : null}
              <View style={styles.ownerAccountDivider} />
              <OwnerAccountItem
                icon="log-out-outline"
                label={logout.isPending ? "Logging out..." : "Log out"}
                trainer={isTrainer}
                danger
                disabled={logout.isPending}
                onPress={() => {
                  setAccountMenuOpen(false);
                  requestLogoutConfirmation(() => logout.mutate());
                }}
                styles={styles}
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </Screen>
  ));
    }
  }
}

export function GymOwnerSidebarView({ model }: { model: ReturnType<typeof useGymOwnerSidebarPresentation> }): React.ReactNode {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, colors, ownerNavItems, activeLabel, onNavigate, userCounts, onCollapse } = model.props;
      return (
        <View style={{ flex: 1, justifyContent: "space-between", minHeight: "100%" }}>
          <View>
            <View style={styles.ownerBrandRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
                <AppLogo size={38} />
                <View>
                  <Text style={styles.ownerBrandName}>
                    Pulse<Text style={{ color: "#E91E63" }}>Fit</Text>
                  </Text>
                  <Text style={styles.ownerBrandRole}>GYM OWNER PANEL</Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Hide navigation menu"
                onPress={() => onCollapse?.()}
                style={({ pressed }) => [pressed && styles.pressed, { padding: 4 }]}
              >
                <Ionicons name="chevron-back" size={16} color={colors.ink} />
              </Pressable>
            </View>

            <View style={styles.ownerNavList}>
              {ownerNavItems.filter((item: any) => item.label !== "Messages").map((item: any) => {
                const active = item.label === activeLabel;
                const isHovered = hoveredItem === item.label;
                const memberBadge = item.label === "Members" ? (userCounts?.member ?? 2) : undefined;
                const trainerBadge = item.label === "Trainers" ? (userCounts?.trainer ?? 1) : undefined;
                const badge = memberBadge ?? trainerBadge;

                const rowContent = (
                  <>
                    <Ionicons
                      name={item.icon}
                      size={17}
                      color={active ? "#FFFFFF" : isHovered ? colors.ink : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.ownerNavLabel,
                        isHovered && !active && { color: colors.ink },
                        active && styles.ownerNavLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {badge != null ? (
                      <View style={[styles.ownerNavBadge, active && { backgroundColor: "rgba(0,0,0,0.22)" }]}>
                        <Text style={[styles.ownerNavBadgeText, active && { color: "#FFFFFF" }]}>{badge}</Text>
                      </View>
                    ) : null}
                  </>
                );

                return (
                  <Pressable
                    key={item.label}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onHoverIn={() => setHoveredItem(item.label)}
                    onHoverOut={() => setHoveredItem((prev) => (prev === item.label ? null : prev))}
                    onPress={() =>
                      item.route &&
                      onNavigate(
                        item.route,
                        item.label === "Dashboard"
                          ? { screen: "Dashboard" }
                          : item.params,
                      )
                    }
                    style={({ pressed }) => [
                      styles.ownerNavItem,
                      !active && isHovered && { backgroundColor: colors.surfaceMuted },
                      active && styles.ownerNavItemActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    {rowContent}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      );
    }
  }
}

export function OwnerAccountItemView({ model }: { model: ReturnType<typeof useOwnerAccountItemPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { disabled, onPress, styles, trainer, icon, danger, label } = model.props;
      return ((
    <Pressable accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.ownerAccountItem,
        trainer && styles.trainerAccountItem,
        pressed && styles.pressed,
        disabled && styles.ownerAccountDisabled,
      ]}
    >
      <Ionicons
        name={icon}
        size={trainer ? 20 : 19}
        color={danger ? "#FF3B30" : trainer ? "#E91E63" : "#E91E63"}
      />
      <Text
        style={[
          styles.ownerAccountItemText,
          trainer && styles.trainerAccountItemText,
          danger && styles.ownerAccountDanger,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  ));
    }
  }
}

export function MobileBrandButtonView({ model }: { model: ReturnType<typeof useMobileBrandButtonPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { label, onPress, stylesStatic, icon, colors } = model.props;
      return ((
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        stylesStatic.mobileBrandButton,
        pressed && stylesStatic.pressed,
      ]}
    >
      <Ionicons name={icon} size={18} color={colors.primary} />
    </Pressable>
  ));
    }
  }
}

export function PulseDashboardHeaderView({ model }: { model: ReturnType<typeof usePulseDashboardHeaderPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, title, subtitle, colors, resolvedDate, onSearch, HeaderCircleButton, onNotifications, notificationBadge, onMessages } = model.props;
      return ((
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text
          maxFontSizeMultiplier={1.1}
          numberOfLines={2}
          style={styles.title}
        >
          {title}
        </Text>
        <Text
          maxFontSizeMultiplier={1.1}
          numberOfLines={2}
          style={styles.subtitle}
        >
          {subtitle}
        </Text>
      </View>
      <View style={styles.headerActions}>
        <View style={styles.datePill}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color={colors.textSecondary}
          />
          <Text numberOfLines={1} style={styles.dateText}>
            {resolvedDate}
          </Text>
        </View>
        {onSearch ? (
          <HeaderCircleButton icon="search-outline" onPress={onSearch} />
        ) : null}
        {onNotifications ? (
          <HeaderCircleButton
            icon="notifications-outline"
            badge={notificationBadge}
            onPress={onNotifications}
          />
        ) : null}
        {onMessages ? (
          <HeaderCircleButton
            icon="chatbubble-ellipses-outline"
            onPress={onMessages}
          />
        ) : null}
      </View>
    </View>
  ));
    }
  }
}

export function HeaderCircleButtonView({ model }: { model: ReturnType<typeof useHeaderCircleButtonPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onPress, styles, icon, colors, badge } = model.props;
      return ((
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={icon === "notifications-outline" ? `Open notifications${badge ? `, ${badge} unread` : ""}` : icon === "chatbubble-ellipses-outline" ? "Open messages" : "Search"}
      onPress={onPress}
      style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={22} color={colors.ink} />
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  ));
    }
  }
}
