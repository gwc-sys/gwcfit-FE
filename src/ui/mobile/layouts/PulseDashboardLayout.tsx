import { useReducedMotion } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from "react-native";
import { initials } from "../../../utils/formatters";
import { requestLogoutConfirmation } from "../../../utils/logoutConfirmation";
import { Screen, EmbeddedScreenContext } from "../components/Screen";
import { createWorkspaceChromeStyles } from "./WorkspaceChrome.styles";
import type * as React from "react";
import type { usePulseDashboardLayoutPresentation, useGymOwnerSidebarPresentation, useOwnerAccountItemPresentation, useMobileBrandButtonPresentation, usePulseDashboardHeaderPresentation, useHeaderCircleButtonPresentation } from "../../../components/dashboard/PulseDashboardLayout";

export function PulseDashboardLayoutView({ model }: { model: ReturnType<typeof usePulseDashboardLayoutPresentation> }): React.ReactNode {
  const reduceMotion = useReducedMotion();
  const { width } = useWindowDimensions();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, contentStyle, refreshControl, isDesktop: _isDesktop, isTrainer, isGymOwner, GymOwnerSidebar, activeLabel, navigation, isPlatformAdmin, colors, resolvedRoleLabel, sidebarItems, setAccountMenuOpen, userName, MobileBrandButton, firstName, ownerDate, unreadNotificationCount, resolvedTrainerSearch, setResolvedTrainerSearch, trainerDate, children, accountMenuOpen, user, OwnerAccountItem, isDark, toggleColorScheme, logout } = model.props;
      const chrome = createWorkspaceChromeStyles(colors, width);
      const isDashboard = activeLabel === "Dashboard" || activeLabel === "Overview";
      const workspaceScrolls = isDashboard || Boolean(contentStyle);
      const showBack = navigation.getState?.().type === "stack" && navigation.canGoBack?.();
      return (
    <Screen scroll={workspaceScrolls} noPadding style={chrome.root} contentContainerStyle={[workspaceScrolls ? chrome.dashboardContent : chrome.pageContent, contentStyle]} refreshControl={refreshControl}>
      <View style={chrome.navigationBar}>
        {showBack ? <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={chrome.iconButton}><Ionicons name="chevron-back" size={24} color={colors.primary} /></Pressable> : null}
        <View style={chrome.brand}>
          <View style={chrome.brandMark}><Ionicons name="pulse" size={22} color={colors.primary} /></View>
          <View style={chrome.identity}>
            <Text style={chrome.brandName}>PulseFit</Text>
            <Text numberOfLines={1} style={chrome.role}>{resolvedRoleLabel}</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Notifications${unreadNotificationCount ? `, ${unreadNotificationCount} unread` : ""}`} onPress={() => navigation.navigate("Notifications")} style={({ pressed }) => [chrome.iconButton, pressed && chrome.pressed]}>
          <Ionicons name="notifications-outline" size={22} color={colors.ink} />
          {unreadNotificationCount > 0 ? <View style={chrome.notificationDot} /> : null}
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Open account menu" onPress={() => setAccountMenuOpen(true)} style={({ pressed }) => [chrome.accountButton, pressed && chrome.pressed]}>
          <Text style={chrome.accountInitials}>{initials(userName) || "U"}</Text>
        </Pressable>
      </View>
      {isTrainer ? <View style={chrome.searchBar}>
        <Ionicons name="search-outline" size={20} color={colors.muted} />
        <TextInput accessibilityLabel="Search workspace" value={resolvedTrainerSearch} onChangeText={setResolvedTrainerSearch} placeholder="Search workspace" placeholderTextColor={colors.subtle} style={chrome.searchInput} />
        {resolvedTrainerSearch ? <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setResolvedTrainerSearch("")} style={chrome.clearButton}><Ionicons name="close-circle" size={20} color={colors.muted} /></Pressable> : null}
      </View> : null}
      {isDashboard && isGymOwner ? <View style={chrome.overview}>
        <Text style={chrome.eyebrow}>YOUR GYM AT A GLANCE</Text>
        <Text accessibilityRole="header" style={chrome.title}>Today</Text>
        <Text style={chrome.subtitle}>Welcome back, {firstName(userName)}.</Text>
        <View style={chrome.toolbar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Open attendance calendar" onPress={() => navigation.navigate("Attendance")} style={({ pressed }) => [chrome.dateButton, pressed && chrome.pressed]}><Ionicons name="calendar-outline" size={18} color={colors.primary} /><Text style={chrome.dateText}>{ownerDate}</Text><Ionicons name="chevron-forward" size={14} color={colors.muted} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Add member" onPress={() => navigation.navigate("AddMember")} style={({ pressed }) => [chrome.addButton, pressed && chrome.pressed]}><Ionicons name="add" size={20} color={colors.white} /><Text style={chrome.addText}>Add member</Text></Pressable>
        </View>
      </View> : null}
      {isDashboard && isTrainer ? <Pressable accessibilityRole="button" accessibilityLabel="Open attendance calendar" onPress={() => navigation.navigate("Attendance")} style={chrome.trainerDate}><Ionicons name="calendar-outline" size={18} color={colors.primary} /><Text style={chrome.dateText}>{trainerDate}</Text></Pressable> : null}
      <EmbeddedScreenContext.Provider value={!workspaceScrolls}>
        <View style={workspaceScrolls ? chrome.dashboardBody : chrome.screenBody}>{children}</View>
      </EmbeddedScreenContext.Provider>
      {accountMenuOpen ? (
        <Modal
          visible
          transparent
          animationType={reduceMotion ? "none" : "fade"}
          onRequestClose={() => setAccountMenuOpen(false)}
        >
          <Pressable accessibilityRole="button"
            style={[
              styles.ownerAccountBackdrop,
              isTrainer && styles.trainerAccountBackdrop,
            ]}
            onPress={() => setAccountMenuOpen(false)}
          >
            <Pressable accessibilityRole="button"
              style={[
                styles.ownerAccountMenu,
                isTrainer && styles.trainerAccountMenu,
              ]}
              onPress={(event) => event.stopPropagation()}
             accessible={false} importantForAccessibility="no">
              <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }}>
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
                    {initials(userName) || "U"}
                  </Text>
                </View>
                <View style={styles.ownerAccountCopy}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.ownerAccountName,
                      isTrainer && styles.trainerAccountName,
                    ]}
                  >
                    {userName}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.ownerAccountEmail,
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
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </Screen>
      );
    }
  }
}

export function GymOwnerSidebarView({ model }: { model: ReturnType<typeof useGymOwnerSidebarPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, colors, ownerNavItems, activeLabel, onNavigate } = model.props;
      return ((
    <>
      <View style={styles.ownerBrandRow}>
        <View style={styles.ownerBrandMark}>
          <Ionicons name="pulse" size={25} color={colors.white} />
        </View>
        <View>
          <Text style={styles.ownerBrandName}>
            Pulse<Text style={styles.ownerBrandAccent}>Fit</Text>
          </Text>
          <Text style={styles.ownerBrandRole}>Gym Owner Panel</Text>
        </View>
      </View>
      <View style={styles.ownerNavList}>
        {ownerNavItems.slice(0, 10).map((item) => {
          const active = item.label === activeLabel;
          return (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
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
                active && styles.ownerNavItemActive,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={active ? colors.white : colors.muted}
              />
              <Text
                style={[
                  styles.ownerNavLabel,
                  active && styles.ownerNavLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: activeLabel === "Settings" }}
        onPress={() => onNavigate("Settings")}
        style={({ pressed }) => [
          styles.ownerNavItem,
          activeLabel === "Settings" && styles.ownerNavItemActive,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="settings-outline"
          size={18}
          color={activeLabel === "Settings" ? colors.white : colors.muted}
        />
        <Text
          style={[
            styles.ownerNavLabel,
            activeLabel === "Settings" && styles.ownerNavLabelActive,
          ]}
        >
          Settings
        </Text>
      </Pressable>
      <View style={styles.ownerQuickActions}>
        <Text style={styles.ownerQuickTitle}>Quick Actions</Text>
        {[
          ["Add Member", "person-add-outline", "AddMember"],
          ["Add Trainer", "person-add-outline", "Trainers"],
          ["Mark Attendance", "checkmark-circle-outline", "Attendance"],
          ["Create Plan", "document-outline", "MembershipPlans"],
        ].map(([label, icon, route]) => (
          <Pressable accessibilityRole="button"
            key={label}
            onPress={() => onNavigate(route)}
            style={styles.ownerQuickRow}
          >
            <Ionicons
              name={icon as keyof typeof Ionicons.glyphMap}
              size={17}
              color={colors.primary}
            />
            <Text style={styles.ownerQuickText}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </>
  ));
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
     accessibilityState={{ disabled: disabled }}>
      <Ionicons
        name={icon}
        size={trainer ? 20 : 19}
        color={danger ? "#EF4444" : "#A9C9E9"}
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
          
          numberOfLines={2}
          style={styles.title}
        >
          {title}
        </Text>
        <Text
          
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
