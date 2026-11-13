import { Platform, StyleSheet } from "react-native";

import { spacing } from "../../../theme/theme";

export const styles = StyleSheet.create({
  container: { flex: 1, minHeight: "100vh" as any, overflow: "hidden" },
  safeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg
  },
  topBar: {
    width: "100%",
    maxWidth: 440,
    alignItems: "flex-end"
  },
  skipButton: {
    minWidth: 60,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    paddingHorizontal: 14,
    cursor: "pointer" as any
  },
  skipButtonPressed: { backgroundColor: "rgba(255,255,255,0.12)" },
  skipText: { color: "#FFFFFF", fontSize: 17, lineHeight: 22, fontWeight: "600" },
  glowTop: {
    position: "absolute",
    width: 420,
    height: 420,
    top: -210,
    right: -170,
    borderRadius: 210,
    backgroundColor: "rgba(0, 122, 255,0.22)"
  },
  glowBottom: {
    position: "absolute",
    width: 360,
    height: 360,
    left: -220,
    bottom: -190,
    borderRadius: 180,
    backgroundColor: "rgba(233,30,99,0.15)"
  },
  hero: {
    flex: 1,
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 24
  },
  mark: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.32)",
    ...(Platform.OS === "web" ? { boxShadow: "0 16px 40px rgba(0,0,0,0.20)" } : {})
  },
  title: {
    color: "#FFFFFF",
    fontSize: 42,
    lineHeight: 50,
    fontWeight: "700",
    letterSpacing: -1.2,
    marginTop: 28
  },
  subtitle: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "400",
    marginTop: 8,
    paddingHorizontal: spacing.md,
    textAlign: "center",
    maxWidth: 340
  },
  footer: {
    width: "100%",
    maxWidth: 260,
    alignItems: "center",
    gap: 14,
    paddingBottom: spacing.sm
  },
  progressTrack: {
    width: 72,
    height: 3,
    overflow: "hidden",
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  progressFill: {
    width: 44,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.92)"
  },
  footerText: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
    letterSpacing: 1.7,
    textAlign: "center"
  }
});
