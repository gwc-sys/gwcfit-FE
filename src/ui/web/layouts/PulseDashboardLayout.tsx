import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { initials } from "../../../utils/formatters";
import { requestLogoutConfirmation } from "../../../utils/logoutConfirmation";
import { Screen } from "../components/Screen";
import type * as React from "react";
import type { usePulseDashboardLayoutPresentation, useGymOwnerSidebarPresentation, useOwnerAccountItemPresentation, useMobileBrandButtonPresentation, usePulseDashboardHeaderPresentation, useHeaderCircleButtonPresentation } from "../../../components/dashboard/PulseDashboardLayout";

export function PulseDashboardLayoutView({ model }: { model: ReturnType<typeof usePulseDashboardLayoutPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, contentStyle, refreshControl, isDesktop, isTrainer, isGymOwner, GymOwnerSidebar, activeLabel, navigation, isPlatformAdmin, colors, resolvedRoleLabel, sidebarItems, setAccountMenuOpen, userName, MobileBrandButton, firstName, ownerDate, unreadNotificationCount, resolvedTrainerSearch, setResolvedTrainerSearch, trainerDate, children, accountMenuOpen, user, OwnerAccountItem, isDark, toggleColorScheme, logout } = model.props;
      return ((
    <Screen
      scroll
      noPadding
      style={styles.root}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
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
            style={[styles.sidebar, isTrainer && styles.trainerSidebar]}
            contentContainerStyle={
              isGymOwner
                ? styles.ownerSidebarContent
                : [
                    styles.sidebarContent,
                    isTrainer && styles.trainerSidebarContent,
                  ]
            }
            showsVerticalScrollIndicator={false}
          >
            {isGymOwner ? (
              <GymOwnerSidebar
                activeLabel={activeLabel}
                onNavigate={(route, params) =>
                  navigation.navigate(route, params)
                }
                styles={styles}
              />
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
                  <LinearGradient
                    colors={
                      isPlatformAdmin || isTrainer
                        ? ["#0A84FF", "#007AFF"]
                        : ["#FFFFFF", "rgba(255,255,255,0.72)"]
                    }
                    style={[
                      styles.brandMark,
                      isPlatformAdmin && styles.platformBrandMark,
                      isTrainer && styles.trainerBrandMark,
                    ]}
                  >
                    <Ionicons
                      name={isPlatformAdmin ? "pulse" : "barbell"}
                      size={isPlatformAdmin ? 23 : isTrainer ? 23 : 27}
                      color={
                        isPlatformAdmin || isTrainer ? colors.white : "#050A12"
                      }
                    />
                  </LinearGradient>
                  <View>
                    <Text style={styles.brandName}>PulseFit</Text>
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
                                ? colors.white
                                : isTrainer
                                  ? "#A9B8CC"
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
                              ? ["#0A84FF", "#007AFF"]
                              : ["#DBEAFE", "#93C5FD"]
                          }
                          style={styles.avatar}
                        >
                          <Text style={styles.avatarText}>
                            {initials(userName) || "JT"}
                          </Text>
                        </LinearGradient>
                        <View style={styles.profileCopy}>
                          <Text numberOfLines={1} style={styles.profileName}>
                            {userName}
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
          <View style={styles.mobileBrandBar}>
            <View style={styles.mobileBrandGroup}>
              <LinearGradient
                colors={["#0A84FF", "#007AFF"]}
                style={styles.mobileBrandMark}
              >
                <Ionicons name="barbell" size={20} color="#050A12" />
              </LinearGradient>
              <Text style={styles.mobileBrandName}>PulseFit</Text>
              <View style={styles.mobileIdentityCopy}>
                <Text numberOfLines={1} style={styles.mobileIdentityName}>
                  {userName}
                </Text>
                <Text numberOfLines={1} style={styles.mobileIdentityRole}>
                  {resolvedRoleLabel}
                </Text>
              </View>
            </View>
            <View style={styles.mobileBrandActions}>
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
        ) : null}

        <View style={styles.mainPanel}>
          {isGymOwner ? (
            <View style={styles.sharedOwnerHeader}>
              <View style={styles.sharedOwnerGreeting}>
                <Text numberOfLines={1} style={styles.sharedOwnerTitle}>
                  Welcome back, {firstName(userName)}! 👋
                </Text>
                <Text numberOfLines={1} style={styles.sharedOwnerSubtitle}>
                  Here&apos;s what&apos;s happening at Gold Gym today.
                </Text>
              </View>
              <View style={styles.sharedOwnerActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open attendance calendar"
                  onPress={() => navigation.navigate("Attendance")}
                  style={styles.sharedOwnerDate}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.sharedOwnerDateText}>{ownerDate}</Text>
                  <Ionicons
                    name="chevron-down"
                    size={15}
                    color={colors.textSecondary}
                  />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Search"
                  style={styles.sharedOwnerIcon}
                >
                  <Ionicons
                    name="search-outline"
                    size={22}
                    color={colors.ink}
                  />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open notifications"
                  onPress={() => navigation.navigate("Notifications")}
                  style={styles.sharedOwnerIcon}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color={colors.ink}
                  />
                  {unreadNotificationCount > 0 ? (
                    <View style={styles.sharedOwnerBadge}>
                      <Text style={styles.sharedOwnerBadgeText}>
                        {unreadNotificationCount > 99
                          ? "99+"
                          : unreadNotificationCount}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add member"
                  onPress={() => navigation.navigate("AddMember")}
                  style={styles.sharedOwnerAdd}
                >
                  <Ionicons name="add" size={21} color="#FFFFFF" />
                  <Text style={styles.sharedOwnerAddText}>Add Member</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open Gym Owner profile menu"
                  onPress={() => setAccountMenuOpen(true)}
                  style={styles.sharedOwnerProfile}
                >
                  <View style={styles.sharedOwnerAvatar}>
                    <Text style={styles.sharedOwnerAvatarText}>
                      {initials(userName) || "GO"}
                    </Text>
                  </View>
                  <View style={styles.sharedOwnerProfileCopy}>
                    <Text
                      numberOfLines={1}
                      style={styles.sharedOwnerProfileName}
                    >
                      {userName}
                    </Text>
                    <Text style={styles.sharedOwnerProfileRole}>Gym Owner</Text>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={15}
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
                  <Ionicons name="search-outline" size={21} color="#78B8FF" />
                  <TextInput
                    value={resolvedTrainerSearch}
                    onChangeText={setResolvedTrainerSearch}
                    placeholder="Search something..."
                    placeholderTextColor="#93A4BF"
                    style={styles.sharedTrainerSearchInput}
                  />
                  {resolvedTrainerSearch ? (
                    <Pressable accessibilityRole="button"
                      accessibilityLabel="Clear search"
                      onPress={() => setResolvedTrainerSearch("")}
                    >
                      <Ionicons name="close-circle" size={18} color="#93A4BF" />
                    </Pressable>
                  ) : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open attendance calendar"
                  onPress={() => navigation.navigate("Attendance")}
                  style={styles.sharedTrainerDate}
                >
                  <Ionicons name="calendar-outline" size={20} color="#78B8FF" />
                  <Text style={styles.sharedTrainerDateText}>
                    {trainerDate}
                  </Text>
                  <Ionicons name="chevron-down" size={17} color="#78B8FF" />
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
                    color="#A8CAEF"
                  />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open trainer profile menu"
                  onPress={() => setAccountMenuOpen(true)}
                  style={styles.sharedTrainerProfile}
                >
                  <View style={styles.sharedTrainerProfileInner}>
                    <Ionicons name="person" size={22} color="#C4B5FD" />
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
          animationType="fade"
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
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </Screen>
  ));
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
    >
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
