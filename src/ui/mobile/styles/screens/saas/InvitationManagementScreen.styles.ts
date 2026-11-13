import { controlMetrics, radius, spacing, typography } from "../../../theme/theme";
import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) => adaptPageStyles(StyleSheet.create({
  page: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
    gap: 16,
  },

  // Custom Screen Header
  customHeader: {
    gap: 6,
    paddingBottom: 4,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerMainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  proBadge: {
    backgroundColor: "#E91E63",
    borderColor: "#E91E63",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  proBadgeText: {
    color: "#E91E63",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  headerDateText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  headerSubtitleText: {
    color: colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
  },

  // 2x2 Stats Grid
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  stat: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 140,
    minHeight: 88,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 18,
    padding: 14,
    justifyContent: "space-between",
  },
  statActive: {
    borderColor: "#E91E63",
  },
  statTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.ink,
    marginVertical: 2,
  },
  statSub: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },

  // Main Cards
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
  },
  helper: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    marginTop: 2,
  },

  // Role Selection Container (2x2 Matrix)
  rolesContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 4,
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  role: {
    width: "49%",
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  roleActive: {
    backgroundColor: "#E91E63",
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  roleTextActive: {
    color: colors.ink,
    fontWeight: "700",
  },

  // Input Fields
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  inputLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputBadgeRequired: {
    fontSize: 12,
    fontWeight: "600",
    color: "#E91E63",
  },
  inputBox: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  inputBoxRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputText: {
    flex: 1,
    color: colors.ink,
    fontSize: 14,
    fontWeight: "500",
  },

  // Primary Action Button
  primaryCta: {
    backgroundColor: "#E91E63",
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  primaryCtaText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },

  // Token Box (Newly created code)
  tokenBox: {
    backgroundColor: "#007AFF",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 14,
    padding: 14,
    gap: 8,
    marginTop: 4,
  },
  tokenLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#E91E63",
    letterSpacing: 0.8,
  },
  token: {
    fontSize: 16,
    fontFamily: "monospace",
    fontWeight: "700",
    color: colors.ink,
  },

  // History Section
  historySection: {
    gap: 12,
    marginTop: 4,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
  },
  historySubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  refreshCircleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },

  // Filter Strip
  filterStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  filterPillSelected: {
    backgroundColor: "#E91E63",
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterPillTextSelected: {
    color: colors.ink,
    fontWeight: "700",
  },

  // History Search Bar
  historySearchBar: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  historySearchInput: {
    flex: 1,
    color: colors.ink,
    fontSize: 13,
  },

  // History Card (Stand-alone Card)
  historyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    gap: 6,
    marginRight: 8,
  },
  cardRoleText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  cardDot: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardEmailText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
    flexShrink: 1,
  },

  // Status Badges
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeUsed: {
    backgroundColor: "#34C759",
  },
  badgeActive: {
    backgroundColor: "#007AFF",
  },
  badgeRevoked: {
    backgroundColor: "#E91E63",
  },
  badgeExpired: {
    backgroundColor: colors.surfaceElevated,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  badgeTextUsed: {
    color: "#34C759",
  },
  badgeTextActive: {
    color: "#007AFF",
  },
  badgeTextRevoked: {
    color: "#FF3B30",
  },
  badgeTextExpired: {
    color: colors.textSecondary,
  },

  // Card Row 2
  cardMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },

  // Card Row 3 (Footer)
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  codeLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  codeValue: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
    fontFamily: "monospace",
  },
  cardActionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  copyButton: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  copyButtonActive: {
    backgroundColor: "#34C759",
    borderColor: "#34C759",
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  revokeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  revokeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF3B30",
  },

  // Super admin registration enquiries & modals
  segments: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  segmentSelected: {
    backgroundColor: "#E91E63",
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  segmentTextSelected: {
    color: colors.ink,
    fontWeight: "700",
  },
  registrationCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowCopy: {
    flex: 1,
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: "#007AFF",
    paddingVertical: 12,
    gap: 6,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },
  rowMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  reveal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E91E63",
    marginTop: 4,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeInactive: {
    backgroundColor: colors.surfaceElevated,
  },
  empty: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    paddingVertical: 16,
  },
  detailBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  detailSheet: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "85%",
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
}));
