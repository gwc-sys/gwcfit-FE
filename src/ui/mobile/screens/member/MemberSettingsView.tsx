import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Pressable } from "../../components/NativePressable";
import { getMobileViewportMetrics } from "../../theme/theme";
import type { useMemberSettingsScreenPresentation } from "../../../../screens/member/MemberFeatureScreens";
import { getApiErrorMessage } from "../../../../services/api/client";
import { changePasswordSchema } from "../../../../validation/auth";
import { requestLogoutConfirmation } from "../../../../utils/logoutConfirmation";

type Props = { model: ReturnType<typeof useMemberSettingsScreenPresentation> };
type SettingsTab = "preferences" | "appearance" | "security";

// Design System Constants matching Apple HIG & User Specs
const C = {
  bg: "#000000",
  card: "#1C1C1E",
  cardBorder: "#1C1C1E",
  accentRed: "#E91E63",
  successGreen: "#34C759",
  mutedText: "#F2F2F7",
  white: "#FFFFFF",
  inputBg: "#000000",
  tabTrack: "#000000",
  activeTabBg: "#1C1C1E",
};

function getInitials(name?: string | null, fallback = "MR"): string {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export function MemberSettingsView({ model }: Props) {
  const { width, height } = useWindowDimensions();
  const rawInsets = typeof useSafeAreaInsets === "function" ? useSafeAreaInsets() : null;
  const vp = getMobileViewportMetrics(width, height, rawInsets);
  const p = model.props;
  const [activeTab, setActiveTab] = useState<SettingsTab>("preferences");
  const [error, setError] = useState<string>();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [appleWatchSync, setAppleWatchSync] = useState(
    p.appleWatchSync ?? true,
  );
  const [faceIdAuth, setFaceIdAuth] = useState(p.faceIdAuth ?? true);

  const userName =
    p.profile?.member_name ?? p.user?.full_name ?? "Mahesh Raskar";
  const userInitials = getInitials(userName, "MR");
  const userEmail =
    p.profile?.email ?? p.user?.email ?? "maheshzraskarvip@gmail.com";
  const gymName =
    p.profile?.gym_name ?? p.user?.gym_name ?? "ZD Fitness";

  const handleBack = () => {
    if (p.navigation?.canGoBack?.()) {
      p.navigation.goBack();
    } else {
      p.navigation?.navigate?.("AppTabs", { screen: "MemberProfile" });
    }
  };

  const submit = () => {
    const parsed = changePasswordSchema.safeParse({
      old_password: p.oldPassword,
      new_password: p.newPassword,
    });
    const message = !p.oldPassword
      ? "Enter your current password."
      : !parsed.success
        ? parsed.error.issues[0]?.message
        : p.oldPassword === p.newPassword
          ? "Choose a different new password."
          : undefined;
    setError(message);
    if (!message && !p.changePassword.isPending) {
      p.submitPassword();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingHorizontal: vp.horizontalPadding,
            paddingBottom: vp.safeBottomPadding + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ========================================================
            2. HEADER & NAVIGATION BAR
           ======================================================== */}
        <View style={styles.navBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={handleBack}
            style={styles.navActionLeft}
          >
            <Ionicons name="chevron-back" size={22} color={C.accentRed} />
            <Text style={styles.navActionText}>Back</Text>
          </Pressable>

          <Text accessibilityRole="header" style={styles.navTitle}>
            Settings
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Done"
            onPress={handleBack}
            style={styles.navActionRight}
          >
            <Text style={styles.navActionText}>Done</Text>
          </Pressable>
        </View>

        {/* ========================================================
            3. USER PROFILE CARD HEADER
           ======================================================== */}
        <View style={styles.userProfileCard}>
          <LinearGradient
            colors={["#E91E63", "#E91E63"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.userAvatarGradient}
          >
            <Text style={styles.userAvatarInitials}>{userInitials}</Text>
          </LinearGradient>

          <View style={styles.userMetaCol}>
            <View style={styles.userNamePillRow}>
              <Text style={styles.userNameText} numberOfLines={1}>
                {userName}
              </Text>
              <View style={styles.proBadgePill}>
                <Text style={styles.proBadgePillText}>Pro</Text>
              </View>
            </View>
            <Text style={styles.userEmailText} numberOfLines={1}>
              {userEmail}
            </Text>
            <Text style={styles.userVerifiedPassText} numberOfLines={1}>
              {`${gymName} Member • Verified Pass`}
            </Text>
          </View>
        </View>

        {/* ========================================================
            4. SEGMENTED TAB NAVIGATION CONTROL
           ======================================================== */}
        <View style={styles.segmentedControlTrack}>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === "preferences" }}
            accessibilityLabel="Preferences"
            onPress={() => setActiveTab("preferences")}
            style={[
              styles.segmentItem,
              activeTab === "preferences" && styles.segmentItemActive,
            ]}
          >
            <Text
              style={[
                styles.segmentItemText,
                activeTab === "preferences" && styles.segmentItemTextActive,
              ]}
            >
              Preferences
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === "appearance" }}
            accessibilityLabel="Appearance"
            onPress={() => setActiveTab("appearance")}
            style={[
              styles.segmentItem,
              activeTab === "appearance" && styles.segmentItemActive,
            ]}
          >
            <Text
              style={[
                styles.segmentItemText,
                activeTab === "appearance" && styles.segmentItemTextActive,
              ]}
            >
              Appearance
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === "security" }}
            accessibilityLabel="Security"
            onPress={() => setActiveTab("security")}
            style={[
              styles.segmentItem,
              activeTab === "security" && styles.segmentItemActive,
            ]}
          >
            <Text
              style={[
                styles.segmentItemText,
                activeTab === "security" && styles.segmentItemTextActive,
              ]}
            >
              Security
            </Text>
          </Pressable>
        </View>

        {/* ========================================================
            5. TAB CONTENT SPECIFICATIONS
           ======================================================== */}

        {/* --- TAB A: "PREFERENCES" --- */}
        {activeTab === "preferences" && (
          <View style={styles.tabSectionContainer}>
            <Text style={styles.sectionHeaderLabel}>SYSTEM PREFERENCES</Text>
            <View style={styles.groupedCard}>
              {/* Row 1: Notifications */}
              <View style={styles.settingRow}>
                <View style={styles.settingRowLeft}>
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color={C.accentRed}
                  />
                  <View style={styles.settingTextCol}>
                    <Text style={styles.settingTitle}>Notifications</Text>
                    <Text style={styles.settingDescription}>
                      Reminders and gym updates
                    </Text>
                  </View>
                </View>

                {/* Right-aligned Green iOS Toggle Switch */}
                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: p.notifications }}
                  accessibilityLabel="Notifications"
                  onPress={() => p.setNotifications(!p.notifications)}
                  style={[
                    styles.iosToggleTrack,
                    p.notifications
                      ? styles.iosToggleTrackOn
                      : styles.iosToggleTrackOff,
                  ]}
                >
                  <View
                    style={[
                      styles.iosToggleThumb,
                      p.notifications
                        ? styles.iosToggleThumbOn
                        : styles.iosToggleThumbOff,
                    ]}
                  />
                </Pressable>
              </View>

              <View style={styles.rowDivider} />

              {/* Row 2: Privacy */}
              <View style={styles.settingRow}>
                <View style={styles.settingRowLeft}>
                  <Ionicons name="eye-off-outline" size={22} color="#007AFF" />
                  <View style={styles.settingTextCol}>
                    <Text style={styles.settingTitle}>Privacy</Text>
                    <Text style={styles.settingDescription}>
                      Use display names in shared views
                    </Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: p.privacy }}
                  accessibilityLabel="Privacy"
                  onPress={() => p.setPrivacy(!p.privacy)}
                  style={[
                    styles.iosToggleTrack,
                    p.privacy
                      ? styles.iosToggleTrackOn
                      : styles.iosToggleTrackOff,
                  ]}
                >
                  <View
                    style={[
                      styles.iosToggleThumb,
                      p.privacy
                        ? styles.iosToggleThumbOn
                        : styles.iosToggleThumbOff,
                    ]}
                  />
                </Pressable>
              </View>

              <View style={styles.rowDivider} />

              {/* Row 3: Apple Watch Auto-Sync */}
              <View style={styles.settingRow}>
                <View style={styles.settingRowLeft}>
                  <Ionicons name="watch-outline" size={22} color={C.successGreen} />
                  <View style={styles.settingTextCol}>
                    <Text style={styles.settingTitle}>
                      Apple Watch Auto-Sync
                    </Text>
                    <Text style={styles.settingDescription}>
                      Continuous background ring telemetry
                    </Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: appleWatchSync }}
                  accessibilityLabel="Apple Watch Auto-Sync"
                  onPress={() => setAppleWatchSync((prev: boolean) => !prev)}
                  style={[
                    styles.iosToggleTrack,
                    appleWatchSync
                      ? styles.iosToggleTrackOn
                      : styles.iosToggleTrackOff,
                  ]}
                >
                  <View
                    style={[
                      styles.iosToggleThumb,
                      appleWatchSync
                        ? styles.iosToggleThumbOn
                        : styles.iosToggleThumbOff,
                    ]}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* --- TAB B: "APPEARANCE" --- */}
        {activeTab === "appearance" && (
          <View style={styles.tabSectionContainer}>
            <Text style={styles.sectionHeaderLabel}>DISPLAY & APPEARANCE</Text>

            {/* Horizontal Side-by-Side Preview Cards */}
            <View style={styles.themePreviewRow}>
              {/* Light Card */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Select light mode"
                onPress={() => p.setColorScheme("light")}
                style={[
                  styles.themePreviewCard,
                  !p.isDark && styles.themePreviewCardActive,
                ]}
              >
                <View style={styles.themeMockupBoxLight}>
                  <View style={styles.mockupHeaderLight} />
                  <View style={styles.mockupInputLight}>
                    <View style={styles.mockupInputDot} />
                  </View>
                  <View style={styles.mockupFooterRow}>
                    <View style={styles.mockupDashLight} />
                    <View style={styles.mockupDashLight} />
                  </View>
                </View>

                <View style={styles.radioControlRow}>
                  <View
                    style={[
                      styles.radioCircleOutline,
                      !p.isDark && styles.radioCircleOutlineActive,
                    ]}
                  >
                    {!p.isDark ? <View style={styles.radioInnerDot} /> : null}
                  </View>
                  <Text
                    style={[
                      styles.radioLabelText,
                      !p.isDark && styles.radioLabelTextActive,
                    ]}
                  >
                    Light
                  </Text>
                </View>
              </Pressable>

              {/* Dark Card */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Select dark mode"
                onPress={() => p.setColorScheme("dark")}
                style={[
                  styles.themePreviewCard,
                  p.isDark && styles.themePreviewCardActive,
                ]}
              >
                <View style={styles.themeMockupBoxDark}>
                  <View style={styles.mockupHeaderDark} />
                  <View style={styles.mockupInputDark}>
                    <View style={styles.mockupInputDot} />
                  </View>
                  <View style={styles.mockupFooterRow}>
                    <View style={styles.mockupDashDark} />
                    <View style={styles.mockupDashDark} />
                  </View>
                </View>

                <View style={styles.radioControlRow}>
                  <View
                    style={[
                      styles.radioCircleOutline,
                      p.isDark && styles.radioCircleOutlineActive,
                    ]}
                  >
                    {p.isDark ? <View style={styles.radioInnerDot} /> : null}
                  </View>
                  <Text
                    style={[
                      styles.radioLabelText,
                      p.isDark && styles.radioLabelTextActive,
                    ]}
                  >
                    Dark
                  </Text>
                </View>
              </Pressable>
            </View>

            {/* Secondary Row Card: Dark Mode toggle */}
            <View style={[styles.groupedCard, { marginTop: 14 }]}>
              <View style={styles.settingRow}>
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingTitle}>Dark Mode</Text>
                  <Text style={styles.settingDescription}>
                    {p.isDark ? "Dark mode is on" : "Dark mode is off"}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: p.isDark }}
                  accessibilityLabel="Dark Mode"
                  onPress={() =>
                    p.setColorScheme(p.isDark ? "light" : "dark")
                  }
                  style={[
                    styles.iosToggleTrack,
                    p.isDark
                      ? styles.iosToggleTrackOn
                      : styles.iosToggleTrackOff,
                  ]}
                >
                  <View
                    style={[
                      styles.iosToggleThumb,
                      p.isDark
                        ? styles.iosToggleThumbOn
                        : styles.iosToggleThumbOff,
                    ]}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* --- TAB C: "SECURITY" --- */}
        {activeTab === "security" && (
          <View style={styles.tabSectionContainer}>
            <Text style={styles.sectionHeaderLabel}>
              PASSWORD & AUTHENTICATION
            </Text>
            <View style={styles.groupedCard}>
              {/* 1. OLD PASSWORD */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabelText}>OLD PASSWORD</Text>
                <View style={styles.inputFieldContainer}>
                  <TextInput
                    accessibilityLabel="Current password"
                    placeholder="Enter current password"
                    placeholderTextColor="#1C1C1E"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                    importantForAutofill="no"
                    secureTextEntry={!showOldPassword}
                    value={p.oldPassword}
                    onChangeText={p.setOldPassword}
                    style={styles.textInputBox}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      showOldPassword ? "Hide password" : "Show password"
                    }
                    onPress={() => setShowOldPassword(!showOldPassword)}
                    style={styles.inputIconButton}
                  >
                    <Ionicons
                      name={showOldPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={C.mutedText}
                    />
                  </Pressable>
                </View>
              </View>

              {/* 2. NEW PASSWORD */}
              <View style={[styles.fieldBlock, { marginTop: 14 }]}>
                <Text style={styles.fieldLabelText}>NEW PASSWORD</Text>
                <View style={styles.inputFieldContainer}>
                  <TextInput
                    accessibilityLabel="New password"
                    placeholder="Enter new strong password"
                    placeholderTextColor="#1C1C1E"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    secureTextEntry={!showNewPassword}
                    value={p.newPassword}
                    onChangeText={p.setNewPassword}
                    style={styles.textInputBox}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.inputIconButton}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={C.mutedText}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={[styles.rowDivider, { marginVertical: 14 }]} />

              {/* 3. Face ID Authentication */}
              <View style={styles.settingRowWithoutPadding}>
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingTitle}>Face ID Authentication</Text>
                  <Text style={styles.settingDescription}>
                    Unlock turnstile pass with Face ID
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: faceIdAuth }}
                  accessibilityLabel="Face ID Authentication"
                  onPress={() => setFaceIdAuth((prev: boolean) => !prev)}
                  style={[
                    styles.iosToggleTrack,
                    faceIdAuth
                      ? styles.iosToggleTrackOn
                      : styles.iosToggleTrackOff,
                  ]}
                >
                  <View
                    style={[
                      styles.iosToggleThumb,
                      faceIdAuth
                        ? styles.iosToggleThumbOn
                        : styles.iosToggleThumbOff,
                    ]}
                  />
                </Pressable>
              </View>

              {/* Feedback Alert Banners */}
              {error || p.changePassword.error ? (
                <Text
                  accessibilityRole="alert"
                  style={styles.errorAlertText}
                >
                  {error ?? getApiErrorMessage(p.changePassword.error)}
                </Text>
              ) : null}
              {p.changePassword.data && !p.changePassword.error ? (
                <Text
                  accessibilityLiveRegion="polite"
                  style={styles.successAlertText}
                >
                  {p.changePassword.data.message}
                </Text>
              ) : null}

              {/* 4. Primary Button: Solid Crimson Filled Button */}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{
                  disabled: p.changePassword.isPending,
                  busy: p.changePassword.isPending,
                }}
                disabled={p.changePassword.isPending}
                onPress={submit}
                style={[
                  styles.changePasswordPrimaryBtn,
                  p.changePassword.isPending && { opacity: 0.6 },
                ]}
              >
                {p.changePassword.isPending ? (
                  <ActivityIndicator color={C.white} />
                ) : (
                  <>
                    <Ionicons name="key-outline" size={20} color={C.white} />
                    <Text style={styles.changePasswordPrimaryBtnText}>
                      Change Password
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* ========================================================
            6. SHARED FOOTER ACTIONS (Rendered on all 3 tabs)
           ======================================================== */}
        <View style={styles.footerActionsContainer}>
          {/* Secondary Button: Return to Dashboard */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Return to Dashboard"
            onPress={handleBack}
            style={styles.returnDashboardBtn}
          >
            <Ionicons name="speedometer-outline" size={20} color="#007AFF" />
            <Text style={styles.returnDashboardBtnText}>
              Return to Dashboard
            </Text>
          </Pressable>

          {/* Danger Action Button: Log Out */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Log Out of ${gymName}`}
            accessibilityState={{
              disabled: p.logout.isPending,
              busy: p.logout.isPending,
            }}
            disabled={p.logout.isPending}
            onPress={() => requestLogoutConfirmation(() => p.logout.mutate())}
            style={styles.dangerLogoutBtn}
          >
            {p.logout.isPending ? (
              <ActivityIndicator color={C.accentRed} />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color={C.accentRed} />
                <Text style={styles.dangerLogoutBtnText}>Log Out</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
    backgroundColor: C.bg,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 44,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },

  // 2. Navigation Bar
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginBottom: 8,
    minHeight: 44,
  },
  navActionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minWidth: 64,
    minHeight: 44,
    justifyContent: "center",
  },
  navActionRight: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 64,
    minHeight: 44,
  },
  navActionText: {
    color: C.accentRed,
    fontSize: 16,
    fontWeight: "600",
  },
  navTitle: {
    color: C.white,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  // 3. User Profile Card
  userProfileCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  userAvatarGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarInitials: {
    color: C.white,
    fontSize: 18,
    fontWeight: "700",
  },
  userMetaCol: {
    flex: 1,
    gap: 3,
  },
  userNamePillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userNameText: {
    color: C.white,
    fontSize: 17,
    fontWeight: "700",
  },
  proBadgePill: {
    backgroundColor: "rgba(233, 30, 99, 0.18)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  proBadgePillText: {
    color: C.accentRed,
    fontSize: 11,
    fontWeight: "700",
  },
  userEmailText: {
    color: C.mutedText,
    fontSize: 13,
  },
  userVerifiedPassText: {
    color: C.successGreen,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  // 4. Segmented Control Switcher
  segmentedControlTrack: {
    flexDirection: "row",
    backgroundColor: C.tabTrack,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    minHeight: 44,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    minHeight: 36,
  },
  segmentItemActive: {
    backgroundColor: C.activeTabBg,
  },
  segmentItemText: {
    color: C.mutedText,
    fontSize: 14,
    fontWeight: "600",
  },
  segmentItemTextActive: {
    color: C.white,
    fontWeight: "700",
  },

  // 5. Tab Content Sections
  tabSectionContainer: {
    marginBottom: 16,
  },
  sectionHeaderLabel: {
    color: C.mutedText,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  groupedCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 16,
  },
  rowDivider: {
    height: 1,
    backgroundColor: C.cardBorder,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    minHeight: 52,
  },
  settingRowWithoutPadding: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    minHeight: 48,
  },
  settingRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  settingTextCol: {
    flex: 1,
    gap: 3,
  },
  settingTitle: {
    color: "#F2F2F7",
    fontSize: 15,
    fontWeight: "600",
  },
  settingDescription: {
    color: C.mutedText,
    fontSize: 12,
  },

  // Apple HIG iOS Toggle Switches
  iosToggleTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: "center",
  },
  iosToggleTrackOn: {
    backgroundColor: C.successGreen,
  },
  iosToggleTrackOff: {
    backgroundColor: "#1C1C1E",
  },
  iosToggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.white,
  },
  iosToggleThumbOn: {
    alignSelf: "flex-end",
  },
  iosToggleThumbOff: {
    alignSelf: "flex-start",
  },

  // Tab B: Theme Previews
  themePreviewRow: {
    flexDirection: "row",
    gap: 12,
  },
  themePreviewCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.cardBorder,
    padding: 12,
    alignItems: "center",
    minHeight: 120,
  },
  themePreviewCardActive: {
    borderColor: C.accentRed,
  },
  themeMockupBoxLight: {
    width: "100%",
    height: 74,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 8,
    justifyContent: "space-between",
  },
  mockupHeaderLight: {
    width: "40%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F2F2F7",
  },
  mockupInputLight: {
    width: "100%",
    height: 22,
    borderRadius: 6,
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: "#F2F2F7",
    justifyContent: "center",
    paddingLeft: 6,
  },
  mockupInputDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.accentRed,
  },
  mockupFooterRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  mockupDashLight: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#F2F2F7",
  },
  themeMockupBoxDark: {
    width: "100%",
    height: 74,
    backgroundColor: "#000000",
    borderRadius: 10,
    padding: 8,
    justifyContent: "space-between",
  },
  mockupHeaderDark: {
    width: "40%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1C1C1E",
  },
  mockupInputDark: {
    width: "100%",
    height: 22,
    borderRadius: 6,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#1C1C1E",
    justifyContent: "center",
    paddingLeft: 6,
  },
  mockupDashDark: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1C1C1E",
  },
  radioControlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    minHeight: 24,
  },
  radioCircleOutline: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.mutedText,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleOutlineActive: {
    borderColor: C.accentRed,
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.accentRed,
  },
  radioLabelText: {
    color: C.mutedText,
    fontSize: 13,
    fontWeight: "500",
  },
  radioLabelTextActive: {
    color: C.white,
    fontWeight: "700",
  },

  // Tab C: Security Form
  fieldBlock: {
    gap: 6,
  },
  fieldLabelText: {
    color: C.mutedText,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  inputFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  textInputBox: {
    flex: 1,
    color: C.white,
    fontSize: 15,
    paddingVertical: 10,
    minHeight: 44,
  },
  inputIconButton: {
    padding: 8,
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  changePasswordPrimaryBtn: {
    backgroundColor: C.accentRed,
    borderRadius: 999,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
  },
  changePasswordPrimaryBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "700",
  },
  errorAlertText: {
    color: C.accentRed,
    fontSize: 13,
    marginTop: 10,
    textAlign: "center",
  },
  successAlertText: {
    color: C.successGreen,
    fontSize: 13,
    marginTop: 10,
    textAlign: "center",
  },

  // 6. Shared Footer Actions
  footerActionsContainer: {
    gap: 12,
    marginTop: 12,
  },
  returnDashboardBtn: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  returnDashboardBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "600",
  },
  dangerLogoutBtn: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(233, 30, 99, 0.4)",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dangerLogoutBtnText: {
    color: C.accentRed,
    fontSize: 15,
    fontWeight: "600",
  },
});
