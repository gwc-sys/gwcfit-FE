import { useState } from "react";
import { StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Controller } from "react-hook-form";

import { Pressable } from "../../components/NativePressable";
import { NoticeBanner } from "../../components/NoticeBanner";
import { Screen } from "../../components/Screen";
import { AppLogo } from "../../../../components/AppLogo";
import { getMobileViewportMetrics } from "../../theme/theme";
import { getApiErrorMessage } from "../../../../services/api/client";
import { showAlert } from "../../../../utils/appAlert";
import type { useLoginScreenPresentation } from "../../../../screens/auth/LoginScreen";

export function LoginScreenView({ model }: { model: ReturnType<typeof useLoginScreenPresentation> }) {
  const {
    navigation,
    canGoBack,
    control,
    errors,
    passwordVisible,
    setPasswordVisible,
    colors,
    isDark,
    toggleColorScheme,
    loginMutation,
    submit,
  } = model.props;

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { width, height } = useWindowDimensions();
  const rawInsets = typeof useSafeAreaInsets === "function" ? useSafeAreaInsets() : null;
  const vp = getMobileViewportMetrics(width, height, rawInsets);

  const handleAppleSignIn = () => {
    showAlert(
      "Apple Sign-In",
      "Apple Sign-In is configured for registered iOS accounts. Please use your email and password to log in to this workspace."
    );
  };

  const handleFaceIdSignIn = () => {
    showAlert(
      "Face ID",
      "Biometric authentication is configured on enrolled devices. Please use your email and password to log in."
    );
  };

  const handleClose = () => {
    if (canGoBack) {
      navigation.goBack();
    } else {
      navigation.navigate("PublicLanding" as any);
    }
  };

  return (
    <Screen
      scroll
      keyboard
      noPadding
      reference={false}
      contentContainerStyle={[
        styles.page,
        {
          paddingHorizontal: vp.horizontalPadding,
          paddingBottom: Math.max(vp.safeBottomPadding, 28),
        },
      ]}
    >
      {/* ── Top Navigation Bar ── */}
      <View style={styles.topNav}>
        {/* Left Status Pill */}
        <View style={styles.nodeStatusPill}>
          <View style={styles.nodeStatusDot} />
          <Text style={styles.nodeStatusText} numberOfLines={1}>All Gym Nodes Active</Text>
        </View>

        {/* Right Action Cluster: Theme Toggle + Close */}
        <View style={styles.topNavActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle Theme"
            onPress={toggleColorScheme}
            style={({ pressed }) => [styles.themeToggleBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="sunny-outline" size={16} color="#E91E63" />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={handleClose}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.closeBtnText}>Close ×</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Brand Hero Section ── */}
      <View style={styles.heroSection}>
        {/* Glowing Logo Badge */}
        <AppLogo size={68} />

        {/* Tagline Pill */}
        <View style={styles.taglinePill}>
          <Text style={styles.taglinePillText}>YOUR GYM. CONNECTED.</Text>
        </View>

        {/* Main Heading */}
        <View style={styles.headingWrap}>
          <Text style={[styles.headingWhite, { fontSize: vp.heroTitleSize }]}>A clearer view.</Text>
          <Text style={[styles.headingGradient, { fontSize: vp.heroTitleSize }]}>A stronger journey.</Text>
        </View>

        {/* Body Subtext */}
        <Text style={styles.bodySubtext}>
          Manage your workout routines, meal plans, and personal coaching in one native Apple workspace.
        </Text>
      </View>

      {/* ── 3-Column Metrics Bar ── */}
      <View style={[styles.metricsBar, { gap: vp.gridGap }]}>
        <View style={[styles.metricCard, vp.isUltraCompact && { paddingHorizontal: 4 }]}>
          <Text style={[styles.metricValue, vp.isUltraCompact && { fontSize: 15 }]} numberOfLines={1}>99.9%</Text>
          <Text style={styles.metricLabel} numberOfLines={1}>Door Uptime</Text>
        </View>

        <View style={[styles.metricCard, vp.isUltraCompact && { paddingHorizontal: 4 }]}>
          <Text style={[styles.metricValue, vp.isUltraCompact && { fontSize: 15 }]} numberOfLines={1}>1.2M+</Text>
          <Text style={styles.metricLabel} numberOfLines={1}>Check-ins</Text>
        </View>

        <View style={[styles.metricCard, vp.isUltraCompact && { paddingHorizontal: 4 }]}>
          <Text style={[styles.metricValue, vp.isUltraCompact && { fontSize: 15 }]} numberOfLines={1}>{"< 0.2s"}</Text>
          <Text style={styles.metricLabel} numberOfLines={1}>RFID Auth</Text>
        </View>
      </View>

      {/* ── Card Container: Sign In Form ── */}
      <View style={[styles.formCard, { padding: vp.cardPadding }]}>
        {/* Form Headers */}
        <View style={styles.formHeaders}>
          <Text style={styles.formCategoryLabel}>WELCOME BACK</Text>
          <Text style={styles.formTitle}>Sign in to PulseFit</Text>
          <Text style={styles.formSubtext}>Use the email and password registered with ZD Fitness.</Text>
        </View>

        {/* EMAIL Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>EMAIL</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onBlur, onChange, value } }) => (
              <>
                <View
                  style={[
                    styles.inputContainer,
                    emailFocused && styles.inputFocused,
                    !!errors.email && styles.inputError,
                  ]}
                >
                  <TextInput
                    accessibilityLabel="Email, required"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="you@example.com"
                    placeholderTextColor="#1C1C1E"
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => {
                      setEmailFocused(false);
                      onBlur();
                    }}
                  />
                  <Text style={styles.trailingIcon}>@</Text>
                </View>
                {errors.email?.message ? (
                  <Text style={styles.fieldErrorText}>{errors.email.message}</Text>
                ) : null}
              </>
            )}
          />
        </View>

        {/* PASSWORD Field */}
        <View style={styles.fieldGroup}>
          <View style={styles.passwordLabelRow}>
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Forgot password?"
              onPress={() => navigation.navigate("AccountRecovery")}
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.forgotPasswordLink}>Forgot password?</Text>
            </Pressable>
          </View>

          <Controller
            control={control}
            name="password"
            render={({ field: { onBlur, onChange, value } }) => (
              <>
                <View
                  style={[
                    styles.inputContainer,
                    passwordFocused && styles.inputFocused,
                    !!errors.password && styles.inputError,
                  ]}
                >
                  <TextInput
                    accessibilityLabel="Password, required"
                    autoComplete="password"
                    placeholder="••••••••"
                    placeholderTextColor="#1C1C1E"
                    secureTextEntry={!passwordVisible}
                    maxLength={72}
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => {
                      setPasswordFocused(false);
                      onBlur();
                    }}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
                    onPress={() => setPasswordVisible((v: boolean) => !v)}
                    hitSlop={8}
                  >
                    <Text style={styles.visibilityToggleText}>
                      {passwordVisible ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>
                {errors.password?.message ? (
                  <Text style={styles.fieldErrorText}>{errors.password.message}</Text>
                ) : null}
              </>
            )}
          />
        </View>

        {/* Notice Banner Error */}
        {loginMutation.error ? (
          <NoticeBanner message={getApiErrorMessage(loginMutation.error)} tone="error" />
        ) : null}

        {/* Primary Action Button: -> Sign In */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign In"
          disabled={loginMutation.isPending}
          onPress={() => {
            void submit();
          }}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && { opacity: 0.85 },
            loginMutation.isPending && { opacity: 0.65 },
          ]}
        >
          <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </Text>
        </Pressable>

        {/* Apple Sign-In */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign in with Apple"
          onPress={handleAppleSignIn}
          style={({ pressed }) => [styles.appleButton, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="logo-apple" size={18} color="#000000" />
          <Text style={styles.appleButtonText}>Sign in with Apple</Text>
        </Pressable>

        {/* Face ID Sign-In */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign in with Face ID"
          onPress={handleFaceIdSignIn}
          style={({ pressed }) => [styles.faceIdButton, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="scan-outline" size={18} color="#34C759" />
          <Text style={styles.faceIdButtonText}>Sign in with Face ID</Text>
        </Pressable>

        {/* Footer Navigation Link */}
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate("SignUp")}
          style={({ pressed }) => [styles.createAccountWrap, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.createAccountText}>
            New to PulseFit? <Text style={styles.createAccountLink}>Create account →</Text>
          </Text>
        </Pressable>
      </View>

      {/* ── Footer Security Text ── */}
      <Text style={styles.securityFooterText}>
        © 2026 PulseFit Inc. All rights reserved. Encrypted with 256-bit AES.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: "#000000",
  },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  nodeStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(52, 199, 89, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.35)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  nodeStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34C759",
  },
  nodeStatusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#34C759",
  },
  topNavActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  themeToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F2F2F7",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 8,
  },
  logoBadgeText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  taglinePill: {
    backgroundColor: "#1C1C1E",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginTop: 16,
  },
  taglinePillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#E91E63",
    letterSpacing: 0.8,
  },
  headingWrap: {
    alignItems: "center",
    marginTop: 14,
  },
  headingWhite: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.6,
    textAlign: "center",
  },
  headingGradient: {
    fontSize: 32,
    fontWeight: "900",
    color: "#E91E63",
    letterSpacing: -0.6,
    textAlign: "center",
    marginTop: 2,
  },
  bodySubtext: {
    fontSize: 13,
    lineHeight: 19,
    color: "#F2F2F7",
    textAlign: "center",
    maxWidth: 320,
    marginTop: 8,
  },
  metricsBar: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#000000",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 2,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#F2F2F7",
  },
  formCard: {
    backgroundColor: "#000000",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 20,
    gap: 16,
  },
  formHeaders: {
    gap: 2,
  },
  formCategoryLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#F2F2F7",
    letterSpacing: 0.8,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    marginTop: 2,
  },
  formSubtext: {
    fontSize: 12,
    color: "#F2F2F7",
    marginTop: 2,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#F2F2F7",
    letterSpacing: 0.5,
  },
  passwordLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  forgotPasswordLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E91E63",
  },
  inputContainer: {
    backgroundColor: "#000000",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: "#E91E63",
  },
  inputError: {
    borderColor: "#E91E63",
  },
  textInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  trailingIcon: {
    color: "#F2F2F7",
    fontSize: 15,
    fontWeight: "600",
  },
  visibilityToggleText: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "700",
  },
  fieldErrorText: {
    color: "#E91E63",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: "#E91E63",
    height: 48,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  appleButton: {
    backgroundColor: "#FFFFFF",
    height: 46,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  appleButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
  },
  faceIdButton: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    height: 46,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  faceIdButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  createAccountWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  createAccountText: {
    fontSize: 13,
    color: "#F2F2F7",
  },
  createAccountLink: {
    color: "#E91E63",
    fontWeight: "800",
  },
  securityFooterText: {
    fontSize: 11,
    color: "#F2F2F7",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 12,
  },
});
