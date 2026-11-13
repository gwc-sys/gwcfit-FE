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
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { useMemberSettingsScreenPresentation } from "../../../../screens/member/MemberFeatureScreens";
import { requestLogoutConfirmation } from "../../../../utils/logoutConfirmation";
import { getApiErrorMessage } from "../../../../services/api/client";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const C = getMemberC(darkThemeColors);

export function MemberSettingsScreenView({
  model,
}: {
  model: ReturnType<typeof useMemberSettingsScreenPresentation>;
}): React.ReactNode {
  const { width } = useWindowDimensions();
  const [section, setSection] = useState<"Preferences" | "Appearance" | "Security">("Preferences");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  if (model.kind !== "view1") return null;

  const {
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    changePassword,
    submitPassword,
    notifications,
    setNotifications,
    privacy,
    setPrivacy,
    isDark,
    setColorScheme,
    navigation,
    logout,
  } = model.props;

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation?.navigate?.("AppTabs", { screen: "MemberHome" });
    }
  };

  const isDesktop = width >= 1024;

  return (
    <View style={s.root}>
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ── SUBHEADER ── */}
        <View style={s.subheader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={handleBack}
            style={s.backBtn}
          >
            <Ionicons name="chevron-back" size={18} color={C.inkSoft} />
          </Pressable>
          <View style={s.subheaderInfo}>
            <Text style={s.pageTitle}>Settings</Text>
            <Text style={s.pageSubtitle}>
              Manage your account and preferences
            </Text>
          </View>
        </View>

        {/* ── TWO COLUMN LAYOUT ── */}
        <View
          style={[
            s.mainLayout,
            { flexDirection: isDesktop ? "row" : "column" },
          ]}
        >
          {/* ── LEFT COLUMN: YOUR ACCOUNT ── */}
          <View
            style={[
              s.leftCol,
              { width: isDesktop ? 220 : "100%", marginBottom: isDesktop ? 0 : 16 },
            ]}
          >
            <Text style={s.accountTitle}>YOUR ACCOUNT</Text>

            <View style={s.navGroup}>
              {/* Preferences Tab */}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: section === "Preferences" }}
                onPress={() => setSection("Preferences")}
                style={[
                  s.navBtn,
                  section === "Preferences" ? s.navBtnActive : s.navBtnInactive,
                ]}
              >
                <Ionicons
                  name="options-outline"
                  size={18}
                  color={section === "Preferences" ? C.primary : C.muted}
                />
                <Text
                  style={[
                    s.navBtnText,
                    section === "Preferences"
                      ? s.navBtnTextActive
                      : s.navBtnTextInactive,
                  ]}
                >
                  Preferences
                </Text>
              </Pressable>

              {/* Appearance Tab */}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: section === "Appearance" }}
                onPress={() => setSection("Appearance")}
                style={[
                  s.navBtn,
                  section === "Appearance" ? s.navBtnActive : s.navBtnInactive,
                ]}
              >
                <Ionicons
                  name="color-palette-outline"
                  size={18}
                  color={section === "Appearance" ? C.primary : C.muted}
                />
                <Text
                  style={[
                    s.navBtnText,
                    section === "Appearance"
                      ? s.navBtnTextActive
                      : s.navBtnTextInactive,
                  ]}
                >
                  Appearance
                </Text>
              </Pressable>

              {/* Security Tab */}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: section === "Security" }}
                onPress={() => setSection("Security")}
                style={[
                  s.navBtn,
                  section === "Security" ? s.navBtnActive : s.navBtnInactive,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={section === "Security" ? C.primary : C.muted}
                />
                <Text
                  style={[
                    s.navBtnText,
                    section === "Security"
                      ? s.navBtnTextActive
                      : s.navBtnTextInactive,
                  ]}
                >
                  Security
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ── RIGHT COLUMN: ACTIVE TAB CONTENT ── */}
          <View style={s.rightCol}>
            <Text style={s.sectionHeaderTitle}>{section}</Text>

            {/* TAB: PREFERENCES */}
            {section === "Preferences" && (
              <View style={s.tabSection}>
                {/* Notifications Row */}
                <View style={s.settingRow}>
                  <View style={s.settingRowMeta}>
                    <Text style={s.settingRowTitle}>Notifications</Text>
                    <Text style={s.settingRowSub}>
                      Reminders and gym updates
                    </Text>
                  </View>
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{ true: C.teal, false: "#1C1C1E" }}
                    thumbColor={notifications ? C.primary : "#F2F2F7"}
                    ios_backgroundColor="#1C1C1E"
                  />
                </View>

                {/* Privacy Row */}
                <View style={s.settingRow}>
                  <View style={s.settingRowMeta}>
                    <Text style={s.settingRowTitle}>Privacy</Text>
                    <Text style={s.settingRowSub}>
                      Use display names in shared views
                    </Text>
                  </View>
                  <Switch
                    value={privacy}
                    onValueChange={setPrivacy}
                    trackColor={{ true: C.teal, false: "#1C1C1E" }}
                    thumbColor={privacy ? C.primary : "#F2F2F7"}
                    ios_backgroundColor="#1C1C1E"
                  />
                </View>
              </View>
            )}

            {/* TAB: APPEARANCE */}
            {section === "Appearance" && (
              <View style={s.tabSection}>
                {/* Dark mode Row */}
                <View style={s.settingRow}>
                  <View style={s.settingRowMeta}>
                    <Text style={s.settingRowTitle}>Dark mode</Text>
                    <Text style={s.settingRowSub}>
                      {isDark ? "Dark mode is on" : "Light mode is on"}
                    </Text>
                  </View>
                  <Switch
                    value={isDark}
                    onValueChange={(enabled) =>
                      setColorScheme(enabled ? "dark" : "light")
                    }
                    trackColor={{ true: C.green, false: "#1C1C1E" }}
                    thumbColor={isDark ? "#FFFFFF" : "#F2F2F7"}
                    ios_backgroundColor="#1C1C1E"
                  />
                </View>
              </View>
            )}

            {/* TAB: SECURITY */}
            {section === "Security" && (
              <View style={s.tabSection}>
                <View style={s.securityCard}>
                  <Text style={s.securityCardTitle}>Security</Text>

                  {/* Old password */}
                  <View style={s.fieldGroup}>
                    <Text style={s.fieldLabel}>Old password</Text>
                    <View style={s.inputContainer}>
                      <TextInput
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        secureTextEntry={!showOldPassword}
                        placeholder="Enter old password"
                        placeholderTextColor={C.muted}
                        style={s.textInputField}
                      />
                      <Pressable
                        onPress={() => setShowOldPassword((v) => !v)}
                        style={s.inputIconBtn}
                        accessibilityRole="button"
                        accessibilityLabel="Toggle old password visibility"
                      >
                        <Ionicons
                          name={showOldPassword ? "eye-off-outline" : "lock-closed-outline"}
                          size={18}
                          color={C.muted}
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* New password */}
                  <View style={s.fieldGroup}>
                    <Text style={s.fieldLabel}>New password</Text>
                    <View style={s.inputContainer}>
                      <TextInput
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNewPassword}
                        placeholder="Enter new password"
                        placeholderTextColor={C.muted}
                        style={s.textInputField}
                      />
                      <Pressable
                        onPress={() => setShowNewPassword((v) => !v)}
                        style={s.inputIconBtn}
                        accessibilityRole="button"
                        accessibilityLabel="Toggle new password visibility"
                      >
                        <Ionicons
                          name={showNewPassword ? "eye-off-outline" : "lock-closed-outline"}
                          size={18}
                          color={C.muted}
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Change Password Button */}
                  <Pressable
                    onPress={submitPassword}
                    disabled={changePassword.isPending}
                    accessibilityRole="button"
                    style={s.changePasswordBtn}
                  >
                    {changePassword.isPending ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="key-outline" size={16} color="#FFFFFF" />
                        <Text style={s.changePasswordBtnText}>Change Password</Text>
                      </>
                    )}
                  </Pressable>

                  {/* Error / Success Feedback */}
                  {changePassword.error && (
                    <View style={s.feedbackError}>
                      <Ionicons name="alert-circle-outline" size={16} color={C.primary} />
                      <Text style={s.feedbackErrorText}>
                        {getApiErrorMessage(changePassword.error)}
                      </Text>
                    </View>
                  )}
                  {changePassword.data?.message && (
                    <View style={s.feedbackSuccess}>
                      <Ionicons name="checkmark-circle-outline" size={16} color={C.green} />
                      <Text style={s.feedbackSuccessText}>
                        {changePassword.data.message}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ── BOTTOM ACTION BUTTONS: DASHBOARD & LOGOUT ── */}
            <View style={s.actionRow}>
              {/* Dashboard Button */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go to dashboard"
                onPress={() =>
                  navigation?.navigate?.("AppTabs", { screen: "MemberHome" })
                }
                style={s.dashboardBtn}
              >
                <Ionicons name="speedometer-outline" size={18} color="#FFFFFF" />
                <Text style={s.dashboardBtnText}>Dashboard</Text>
              </Pressable>

              {/* Logout Button */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Logout"
                onPress={() => requestLogoutConfirmation(() => logout.mutate())}
                style={s.logoutBtn}
              >
                <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
                <Text style={s.logoutBtnText}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── FLOATING ASK GEMINI PILL ── */}
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 90,
  },

  // Subheader
  subheader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  subheaderInfo: {
    gap: 2,
  },
  pageTitle: {
    color: C.ink,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    color: C.muted,
    fontSize: 13,
  },

  // Main Layout
  mainLayout: {
    gap: 32,
    alignItems: "flex-start",
  },

  // Left Column
  leftCol: {
    gap: 10,
  },
  accountTitle: {
    color: C.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  navGroup: {
    gap: 6,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  navBtnActive: {
    backgroundColor: C.navActiveBg,
  },
  navBtnInactive: {
    backgroundColor: "transparent",
  },
  navBtnText: {
    fontSize: 14,
  },
  navBtnTextActive: {
    color: C.ink,
    fontWeight: "700",
  },
  navBtnTextInactive: {
    color: C.muted,
    fontWeight: "500",
  },

  // Right Column
  rightCol: {
    flex: 1,
    minWidth: 0,
    gap: 18,
    maxWidth: 720,
  },
  sectionHeaderTitle: {
    color: C.ink,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  tabSection: {
    gap: 12,
  },

  // Setting Rows (Preferences / Appearance)
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  settingRowMeta: {
    flex: 1,
    gap: 3,
  },
  settingRowTitle: {
    color: C.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  settingRowSub: {
    color: C.muted,
    fontSize: 12,
  },

  // Security Card
  securityCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 24,
    gap: 18,
  },
  securityCardTitle: {
    color: C.ink,
    fontSize: 16,
    fontWeight: "700",
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    color: C.inkSoft,
    fontSize: 13,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 14,
    height: 48,
  },
  textInputField: {
    flex: 1,
    color: C.ink,
    fontSize: 14,
    padding: 0,
  },
  inputIconBtn: {
    padding: 4,
  },
  changePasswordBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  changePasswordBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  feedbackError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 59, 48, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.14)",
    borderRadius: 10,
    padding: 12,
  },
  feedbackErrorText: {
    color: C.primary,
    fontSize: 13,
  },
  feedbackSuccess: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(52, 199, 89, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.14)",
    borderRadius: 10,
    padding: 12,
  },
  feedbackSuccessText: {
    color: C.green,
    fontSize: 13,
  },

  // Bottom Action Row
  actionRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 10,
  },
  dashboardBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1C1C1E",
    paddingVertical: 14,
  },
  dashboardBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  logoutBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  logoutBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Floating Gemini Pill
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

