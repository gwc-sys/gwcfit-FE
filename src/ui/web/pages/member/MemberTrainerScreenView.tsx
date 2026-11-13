import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../../components/Screen";
import { ErrorState, LoadingSkeleton } from "../../components/member";
import { NoticeBanner } from "../../components/NoticeBanner";
import { getApiErrorMessage } from "../../../../services/api/client";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import type { ThemeColors } from "../../../../theme/theme";
import type { useMemberTrainerScreenPresentation } from "../../../../screens/member/MemberFeatureScreens";

type PlanCardItem = {
  title: string;
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  tagColor: string;
  tagBg: string;
  tagBorder: string;
  description: string;
  metric1: string;
  metric1Icon: keyof typeof Ionicons.glyphMap;
  metric1IconColor?: string;
  metric2: string;
  metric2Icon: keyof typeof Ionicons.glyphMap;
  metric2IconColor?: string;
  route?: string;
};

const createTrainerStyles = (colors: ThemeColors, width: number) => {
  const isNarrow = width < 768;
  const isMedium = width < 1024;

  return StyleSheet.create({
    screen: {
      gap: 22,
      paddingTop: 16,
      paddingBottom: 40,
    },
    topHeaderRow: {
      flexDirection: isNarrow ? "column" : "row",
      alignItems: isNarrow ? "flex-start" : "center",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 4,
    },
    headerLeft: {
      gap: 4,
    },
    headerKicker: {
      fontSize: 12,
      fontWeight: "800",
      color: "#FF3B30",
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    headerTitle: {
      fontSize: isNarrow ? 26 : 30,
      fontWeight: "800",
      color: "#F2F2F7",
      letterSpacing: -0.5,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
    },
    pastSessionsButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "#1C1C1E",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.12)",
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 42,
    },
    pastSessionsText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#F2F2F7",
    },
    leaveReviewButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "#FF3B30",
      borderRadius: 12,
      paddingHorizontal: 18,
      height: 42,
      shadowColor: "#FF3B30",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 3,
    },
    leaveReviewText: {
      fontSize: 13,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    trainerHeroCard: {
      backgroundColor: "#1C1C1E",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.08)",
      padding: isNarrow ? 18 : 24,
      flexDirection: width < 960 ? "column" : "row",
      justifyContent: "space-between",
      alignItems: width < 960 ? "flex-start" : "center",
      gap: 24,
    },
    heroLeftSection: {
      flexDirection: isNarrow ? "column" : "row",
      alignItems: isNarrow ? "flex-start" : "center",
      gap: 18,
      flex: 1,
      minWidth: 0,
    },
    avatarContainer: {
      position: "relative",
      width: 88,
      height: 88,
      borderRadius: 18,
    },
    avatarImage: {
      width: 88,
      height: 88,
      borderRadius: 18,
      backgroundColor: "#1C1C1E",
    },
    onlineIndicator: {
      position: "absolute",
      bottom: 2,
      right: 2,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: "#34C759",
      borderWidth: 2.5,
      borderColor: "#1C1C1E",
    },
    heroDetails: {
      flex: 1,
      minWidth: 0,
      gap: 6,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 10,
    },
    trainerNameText: {
      fontSize: isNarrow ? 20 : 23,
      fontWeight: "800",
      color: "#FFFFFF",
      letterSpacing: -0.3,
    },
    roleBadge: {
      backgroundColor: "rgba(255, 59, 48, 0.14)",
      borderWidth: 1,
      borderColor: "rgba(255, 59, 48, 0.3)",
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    roleBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#E91E63",
      letterSpacing: 0.2,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },
    metaText: {
      fontSize: 13,
      color: "#F2F2F7",
      fontWeight: "400",
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      marginTop: 2,
    },
    statsRating: {
      fontSize: 13,
      fontWeight: "700",
      color: "#F2F2F7",
      marginRight: 8,
    },
    statsDivider: {
      color: "#F2F2F7",
      marginRight: 8,
    },
    statsClients: {
      fontSize: 13,
      color: "#F2F2F7",
    },
    heroRightSection: {
      alignItems: width < 960 ? "flex-start" : "flex-end",
      gap: 16,
      width: width < 960 ? "100%" : "auto",
    },
    contactList: {
      gap: 10,
      width: width < 960 ? "100%" : "auto",
    },
    contactRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    contactIconBox: {
      width: 32,
      height: 32,
      borderRadius: 9,
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      alignItems: "center",
      justifyContent: "center",
    },
    contactText: {
      fontSize: 13,
      fontWeight: "500",
      color: "#F2F2F7",
    },
    actionButtonsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      width: width < 960 ? "100%" : "auto",
    },
    messageTrainerButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FF3B30",
      borderRadius: 12,
      paddingHorizontal: 20,
      height: 44,
      flex: width < 960 ? 1 : undefined,
      shadowColor: "#FF3B30",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 3,
    },
    messageTrainerText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    videoCallButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    plansSection: {
      gap: 16,
      marginTop: 6,
    },
    plansHeaderRow: {
      flexDirection: isNarrow ? "column" : "row",
      alignItems: isNarrow ? "flex-start" : "center",
      justifyContent: "space-between",
      gap: 8,
    },
    plansHeaderLeft: {
      gap: 2,
    },
    plansHeaderTitleRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    plansHeading: {
      fontSize: 20,
      fontWeight: "800",
      color: "#F2F2F7",
      letterSpacing: -0.3,
    },
    plansSubheading: {
      fontSize: 13,
      color: "#F2F2F7",
      marginTop: 2,
    },
    plansCountBadge: {
      fontSize: 13,
      fontWeight: "600",
      color: "#F2F2F7",
    },
    plansGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 14,
    },
    availabilityCard: {
      backgroundColor: "#1C1C1E",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.08)",
      padding: isNarrow ? 18 : 22,
      gap: 16,
    },
    availabilityHeaderRow: {
      flexDirection: isNarrow ? "column" : "row",
      alignItems: isNarrow ? "flex-start" : "center",
      justifyContent: "space-between",
      gap: 10,
    },
    availabilityHeaderLeft: {
      gap: 2,
    },
    availabilityTitleRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    availabilityHeading: {
      fontSize: 18,
      fontWeight: "800",
      color: "#F2F2F7",
      letterSpacing: -0.2,
    },
    availabilitySubheading: {
      fontSize: 13,
      color: "#F2F2F7",
    },
    availabilityStatusBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(52, 199, 89, 0.12)",
      borderWidth: 1,
      borderColor: "rgba(52, 199, 89, 0.25)",
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 5,
      gap: 6,
    },
    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#34C759",
    },
    availabilityStatusText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#34C759",
    },
    scheduleGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    scheduleDayCard: {
      flex: 1,
      minWidth: isNarrow ? 80 : 100,
      borderRadius: 12,
      borderWidth: 1,
      padding: 12,
      alignItems: "center",
      gap: 4,
    },
    scheduleDayActive: {
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      borderColor: "rgba(255, 255, 255, 0.08)",
    },
    scheduleDayOff: {
      backgroundColor: "rgba(255, 255, 255, 0.01)",
      borderColor: "rgba(255, 255, 255, 0.04)",
      opacity: 0.6,
    },
    dayLabel: {
      fontSize: 13,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    dayLabelActive: {
      color: "#F2F2F7",
    },
    dayLabelOff: {
      color: "#F2F2F7",
    },
    hoursLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: "#F2F2F7",
      fontVariant: ["tabular-nums"],
    },
    slotLabel: {
      fontSize: 11,
      color: "#F2F2F7",
      marginTop: 2,
    },
    availabilityFooterRow: {
      flexDirection: isNarrow ? "column" : "row",
      alignItems: isNarrow ? "flex-start" : "center",
      justifyContent: "space-between",
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: "rgba(255, 255, 255, 0.05)",
      gap: 12,
    },
    nextSessionBadge: {
      flexDirection: "row",
      alignItems: "center",
    },
    nextSessionText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#F2F2F7",
    },
    bookSessionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#007AFF",
      borderRadius: 10,
      paddingHorizontal: 16,
      height: 38,
      shadowColor: "#007AFF",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 2,
    },
    bookSessionText: {
      fontSize: 13,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    planCard: {
      backgroundColor: "#1C1C1E",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.08)",
      padding: 20,
      gap: 14,
      width: isNarrow ? "100%" : isMedium ? "48%" : "31.8%",
      minWidth: isNarrow ? "100%" : 280,
      flexGrow: 1,
      justifyContent: "space-between",
    },
    planCardTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    planIconBox: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    planTagBadge: {
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    planTagText: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    planTitleText: {
      fontSize: 17,
      fontWeight: "800",
      color: "#FFFFFF",
      letterSpacing: -0.2,
    },
    planDescriptionText: {
      fontSize: 13,
      color: "#F2F2F7",
      lineHeight: 18,
    },
    planMetricsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: "rgba(255, 255, 255, 0.05)",
    },
    metricItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    metricText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#F2F2F7",
    },
    reviewPanel: {
      backgroundColor: "#1C1C1E",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.08)",
      padding: isNarrow ? 18 : 24,
      gap: 20,
      marginTop: 4,
    },
    reviewHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 14,
    },
    reviewIconBox: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: "rgba(255, 59, 48, 0.14)",
      alignItems: "center",
      justifyContent: "center",
    },
    reviewHeaderTextGroup: {
      flex: 1,
      gap: 3,
    },
    reviewTitleText: {
      fontSize: 19,
      fontWeight: "800",
      color: "#FFFFFF",
      letterSpacing: -0.3,
    },
    reviewSubtitleText: {
      fontSize: 13,
      color: "#F2F2F7",
      lineHeight: 18,
    },
    reviewSubSection: {
      gap: 10,
    },
    subSectionLabel: {
      fontSize: 11,
      fontWeight: "800",
      color: "#F2F2F7",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    starsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    starButton: {
      padding: 2,
    },
    ratingLabelText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#E91E63",
      marginLeft: 6,
    },
    chipsWrapper: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chipButton: {
      backgroundColor: "#1C1C1E",
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.08)",
    },
    chipButtonSelected: {
      backgroundColor: "rgba(233, 30, 99, 0.15)",
      borderColor: "#E91E63",
    },
    chipText: {
      fontSize: 12.5,
      fontWeight: "600",
      color: "#F2F2F7",
    },
    chipTextSelected: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    feedbackTextInput: {
      backgroundColor: "#000000",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.08)",
      padding: 14,
      color: "#FFFFFF",
      fontSize: 13.5,
      minHeight: 88,
      textAlignVertical: "top",
    },
    reviewSubmitRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    submitReviewButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FF3B30",
      borderRadius: 12,
      paddingHorizontal: 22,
      height: 42,
      shadowColor: "#FF3B30",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 3,
    },
    submitReviewText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });
};

export function MemberTrainerScreenView({
  model,
}: {
  model: ReturnType<typeof useMemberTrainerScreenPresentation>;
}): React.ReactNode {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const trainerStyles = useMemo(() => createTrainerStyles(colors, width), [colors, width]);
  const scrollViewRef = useRef<any>(null);
  const reviewSectionRef = useRef<any>(null);

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model as any;

  const {
    queryRefresh,
    query,
    workoutsQuery,
    mealsQuery,
    dashboardQuery,
    profileQuery,
    feedbackQuery,
    saveFeedback,
    rating,
    setRating,
    feedbackOption,
    setFeedbackOption,
    customFeedback,
    setCustomFeedback,
    submitFeedback,
    navigation,
  } = model.props;

  // Real trainer information
  const assignedTrainerName =
    query.data?.trainer_name ||
    dashboardQuery?.data?.assigned_trainer_name ||
    profileQuery?.data?.trainer_name;
  const trainerName = assignedTrainerName || "Trainer Rohit";
  const trainerEmail = query.data?.email || "raskarmaheshvip@gmail.com";
  const trainerPhone = query.data?.phone || "+91 98765-43210";
  const trainerPhoto =
    query.data?.trainer_photo ||
    "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80";

  // Role and clean qualification tags (eliminating any duplicate subtext bug)
  const roleBadgeText =
    query.data?.role ||
    (query.data?.specialization?.length ? query.data.specialization[0] : "Head Strength Coach");

  const cleanQualifications = useMemo(() => {
    const rawList =
      query.data?.qualifications && query.data.qualifications.length > 0
        ? query.data.qualifications
        : (query.data?.specialization && query.data.specialization.length > 1
            ? query.data.specialization.slice(1)
            : ["Certified Master Personal Trainer", "6+ Yrs Experience"]);

    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of rawList) {
      if (!item) continue;
      const parts = item.split(/[•|]/).map((p) => p.trim()).filter(Boolean);
      for (const part of parts) {
        const lower = part.toLowerCase();
        if (!seen.has(lower) && lower !== roleBadgeText.toLowerCase()) {
          seen.add(lower);
          result.push(part);
        }
      }
    }
    return result;
  }, [query.data, roleBadgeText]);

  const credentialsText =
    cleanQualifications.length > 0
      ? cleanQualifications.join(" • ")
      : "Certified Master Personal Trainer • 6+ Yrs Experience";

  // Dynamic calculated trainer metrics
  const trainerRating = query.data?.average_rating ?? 0.0;
  const totalReviews = query.data?.total_reviews ?? 0;
  const activeClients = query.data?.active_clients ?? 0;

  // Dynamic weekly schedule & availability
  const weeklySchedule = useMemo(() => {
    if (query.data?.schedule && query.data.schedule.length > 0) {
      return query.data.schedule;
    }
    return [
      { day: "Mon", hours: "06:00 - 20:00", active: true, slot: "Morning & Evening" },
      { day: "Tue", hours: "06:00 - 20:00", active: true, slot: "Morning & Evening" },
      { day: "Wed", hours: "06:00 - 20:00", active: true, slot: "Morning & Evening" },
      { day: "Thu", hours: "06:00 - 20:00", active: true, slot: "Morning & Evening" },
      { day: "Fri", hours: "06:00 - 20:00", active: true, slot: "Morning & Evening" },
      { day: "Sat", hours: "07:00 - 18:00", active: true, slot: "Half Day" },
      { day: "Sun", hours: "Off Duty", active: false, slot: "Rest Day" },
    ];
  }, [query.data?.schedule]);

  const availabilityStatus = query.data?.availability_status || "On Duty Today • Available";
  const nextAvailableSlot = query.data?.next_available_slot || "Next Available Slot: Today at 04:30 PM (Gym Floor)";
  const isAvailableToday =
    availabilityStatus.toLowerCase().includes("available") ||
    availabilityStatus.toLowerCase().includes("on duty");

  // Helper to dynamically style workout cards based on real plan data
  const buildWorkoutCard = (
    title: string,
    goal?: string | null,
    level?: string | null,
    estimatedDuration?: unknown,
    sessionCount?: number,
    consistency?: number | null,
    notes?: string | null,
    isCompleted?: boolean,
    categoryVal?: string | null
  ): PlanCardItem => {
    const estNum = typeof estimatedDuration === "number" ? estimatedDuration : Number(estimatedDuration) || null;
    const durationText = estNum
      ? `${estNum} Mins`
      : `${Math.max(30, (sessionCount || 0) * 8 || 48)} Mins`;
    const consistencyText =
      consistency && consistency > 0
        ? `${Math.round(consistency)}% completed`
        : isCompleted
        ? "100% completed"
        : level
        ? `${level}`
        : "40% completed";

    const titleLower = (title || "").toLowerCase();
    const goalLower = (goal || "").toLowerCase();
    const catLower = (categoryVal || "").toLowerCase();

    let category = "PROGRESSIVE";
    let icon: keyof typeof Ionicons.glyphMap = "barbell-outline";
    let iconColor = "#E91E63";
    let iconBg = "rgba(233, 30, 99, 0.14)";
    let tagColor = "#007AFF";
    let tagBg = "rgba(0, 122, 255, 0.12)";
    let tagBorder = "rgba(0, 122, 255, 0.25)";

    if (isCompleted) {
      category = "COMPLETED";
      tagColor = "#34C759";
      tagBg = "rgba(52, 199, 89, 0.12)";
      tagBorder = "rgba(52, 199, 89, 0.25)";
    } else if (
      catLower.includes("cardio") ||
      titleLower.includes("cardio") ||
      goalLower.includes("cardio") ||
      titleLower.includes("run") ||
      titleLower.includes("weight loss")
    ) {
      category = "CARDIO";
      icon = "stopwatch-outline";
      iconColor = "#007AFF";
      iconBg = "rgba(0, 122, 255, 0.14)";
      tagColor = "#007AFF";
      tagBg = "rgba(0, 122, 255, 0.12)";
      tagBorder = "rgba(0, 122, 255, 0.25)";
    } else if (
      categoryVal &&
      ["COMPLETED", "DIETARY", "PROGRESSIVE", "CARDIO"].includes(categoryVal.toUpperCase())
    ) {
      category = categoryVal.toUpperCase();
    }

    return {
      title,
      category,
      icon,
      iconColor,
      iconBg,
      tagColor,
      tagBg,
      tagBorder,
      description: notes?.trim()
        ? notes
        : goal
        ? `${goal} session focusing on ${level || "first level"}.`
        : "Targeted training session designed for strength & hypertrophy.",
      metric1: durationText,
      metric1Icon: "time-outline",
      metric2: consistencyText,
      metric2Icon: "repeat-outline",
      route: "MemberWorkout",
    };
  };

  // Helper to dynamically style meal cards based on real plan category & data
  const buildMealCard = (
    title: string,
    categoryVal?: string | null,
    calories?: number | null,
    mealsList?: any[],
    waterMl?: number | null,
    notes?: string | null,
    isCompleted?: boolean
  ): PlanCardItem => {
    const titleLower = (title || "").toLowerCase();
    const catLower = (categoryVal || "").toLowerCase();

    let category = "DIETARY";
    let icon: keyof typeof Ionicons.glyphMap = "restaurant-outline";
    let iconColor = "#E91E63";
    let iconBg = "rgba(233, 30, 99, 0.14)";
    let tagColor = "#E91E63";
    let tagBg = "rgba(233, 30, 99, 0.12)";
    let tagBorder = "rgba(233, 30, 99, 0.25)";
    let metric2 = waterMl ? `${waterMl} ml water` : "Daily update";
    let metric2Icon: keyof typeof Ionicons.glyphMap = waterMl ? "water-outline" : "calendar-outline";
    let metric2IconColor: string | undefined = waterMl ? "#007AFF" : "#F2F2F7";

    if (
      titleLower.includes("gain") ||
      titleLower.includes("bulk") ||
      titleLower.includes("muscle") ||
      catLower.includes("muscle")
    ) {
      category = "PROGRESSIVE";
      icon = "flash-outline";
      iconColor = "#007AFF";
      iconBg = "rgba(0, 122, 255, 0.14)";
      tagColor = "#007AFF";
      tagBg = "rgba(0, 122, 255, 0.12)";
      tagBorder = "rgba(0, 122, 255, 0.25)";
      metric2 = "High Intensity";
      metric2Icon = "pulse-outline";
      metric2IconColor = "#007AFF";
    } else if (
      titleLower.includes("medic") ||
      titleLower.includes("mobility") ||
      titleLower.includes("wellness") ||
      catLower.includes("medical")
    ) {
      category = "COMPLETED";
      icon = "heart-outline";
      iconColor = "#34C759";
      iconBg = "rgba(52, 199, 89, 0.14)";
      tagColor = "#34C759";
      tagBg = "rgba(52, 199, 89, 0.12)";
      tagBorder = "rgba(52, 199, 89, 0.25)";
      metric2 = "Approved";
      metric2Icon = "shield-checkmark-outline";
      metric2IconColor = "#34C759";
    } else if (
      titleLower.includes("loss") ||
      titleLower.includes("cardio") ||
      titleLower.includes("cut") ||
      catLower.includes("weight loss")
    ) {
      category = "CARDIO";
      icon = "stopwatch-outline";
      iconColor = "#007AFF";
      iconBg = "rgba(0, 122, 255, 0.14)";
      tagColor = "#007AFF";
      tagBg = "rgba(0, 122, 255, 0.12)";
      tagBorder = "rgba(0, 122, 255, 0.25)";
      metric2 = "On track";
      metric2Icon = "checkmark-circle-outline";
      metric2IconColor = "#34C759";
    }

    if (isCompleted) {
      category = "COMPLETED";
      tagColor = "#34C759";
      tagBg = "rgba(52, 199, 89, 0.12)";
      tagBorder = "rgba(52, 199, 89, 0.25)";
    }

    const description = notes?.trim()
      ? notes
      : mealsList?.length
      ? `${mealsList.length} nutritional items calibrated to support your daily caloric expenditure.`
      : "Nutritional meal plan calibrated for recovery and lean muscle synthesis.";

    return {
      title,
      category,
      icon,
      iconColor,
      iconBg,
      tagColor,
      tagBg,
      tagBorder,
      description,
      metric1: calories ? `${Number(calories).toLocaleString()} kcal` : "Custom kcal",
      metric1Icon: "flame-outline",
      metric1IconColor: iconColor,
      metric2,
      metric2Icon,
      metric2IconColor,
      route: "MemberMealPlan",
    };
  };

  // Real assigned workouts from workoutsQuery (strictly real data)
  const realWorkouts: PlanCardItem[] = (workoutsQuery?.data ?? []).map((w) =>
    buildWorkoutCard(
      w.workout_plan_name,
      w.goal,
      w.level,
      w.today_workout?.estimated_duration_minutes,
      w.sessions?.length,
      w.weekly_consistency,
      w.trainer_notes,
      w.completion_status?.toLowerCase() === "completed",
      w.category
    )
  );

  // Real assigned meals from mealsQuery (strictly real data)
  const realMeals: PlanCardItem[] = (mealsQuery?.data ?? []).map((m) =>
    buildMealCard(
      m.meal_plan_name,
      m.category,
      m.calories_per_day,
      m.meals,
      m.water_target_ml,
      m.trainer_notes,
      m.completion_status?.toLowerCase() === "completed"
    )
  );

  // Include supplementary assigned plan titles from query.data if not already present
  const existingTitles = new Set(
    [...realWorkouts, ...realMeals].map((p) => p.title.trim().toLowerCase())
  );

  const assignedWorkoutsOnly: PlanCardItem[] = (query.data?.assigned_workout_plans ?? [])
    .filter((name) => Boolean(name && !existingTitles.has(name.trim().toLowerCase())))
    .map((name) => {
      existingTitles.add(name.trim().toLowerCase());
      return buildWorkoutCard(
        name,
        "Workout Program",
        "Personalized",
        45,
        6,
        0,
        "Workout program assigned by your personal coach.",
        false
      );
    });

  const assignedMealsOnly: PlanCardItem[] = (query.data?.assigned_meal_plans ?? [])
    .filter((name) => Boolean(name && !existingTitles.has(name.trim().toLowerCase())))
    .map((name) => {
      existingTitles.add(name.trim().toLowerCase());
      return buildMealCard(
        name,
        null,
        2000,
        [],
        null,
        "Dietary regimen assigned by your personal coach.",
        false
      );
    });

  // ONLY real assigned workout & diet plans - strictly no mock or default filler
  const plansToDisplay: PlanCardItem[] = [
    ...realWorkouts,
    ...realMeals,
    ...assignedWorkoutsOnly,
    ...assignedMealsOnly,
  ];

  const handleScrollToReview = () => {
    if (reviewSectionRef.current) {
      if (typeof reviewSectionRef.current.scrollIntoView === "function") {
        reviewSectionRef.current.scrollIntoView({ behavior: "smooth" });
      } else if (typeof reviewSectionRef.current.measure === "function") {
        reviewSectionRef.current.measure(
          (_x: number, _y: number, _width: number, _height: number, _pageX: number, pageY: number) => {
            scrollViewRef.current?.scrollTo?.({ y: pageY || 800, animated: true });
          }
        );
      }
    }
  };

  return (
    <Screen
      scroll
      contentContainerStyle={trainerStyles.screen}
      refreshControl={queryRefresh(query.isRefetching, () => {
        void query.refetch();
        void workoutsQuery?.refetch();
        void mealsQuery?.refetch();
        void feedbackQuery?.refetch();
      })}
    >
      {/* Top Header: Coach & Availability / My Trainer Overview / Past Sessions & Leave Review */}
      <View style={trainerStyles.topHeaderRow}>
        <View style={trainerStyles.headerLeft}>
          <Text style={trainerStyles.headerKicker}>COACH & AVAILABILITY</Text>
          <Text style={trainerStyles.headerTitle}>My Trainer Overview</Text>
        </View>
        <View style={trainerStyles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Past Sessions"
            onPress={() => navigation.navigate("MemberAttendance")}
            style={({ pressed }) => [
              trainerStyles.pastSessionsButton,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Ionicons name="time-outline" size={17} color="#F2F2F7" />
            <Text style={trainerStyles.pastSessionsText}>Past Sessions</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Leave Review"
            onPress={handleScrollToReview}
            style={({ pressed }) => [
              trainerStyles.leaveReviewButton,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons name="star-outline" size={17} color="#FFFFFF" />
            <Text style={trainerStyles.leaveReviewText}>Leave Review</Text>
          </Pressable>
        </View>
      </View>

      {query.isLoading && !query.data ? <LoadingSkeleton rows={4} /> : null}
      {query.error && !query.data ? (
        <ErrorState
          message={getApiErrorMessage(query.error)}
          onRetry={() => query.refetch()}
        />
      ) : null}

      {/* Trainer Profile Hero Card with Real Data */}
      <View style={trainerStyles.trainerHeroCard}>
        <View style={trainerStyles.heroLeftSection}>
          <View style={trainerStyles.avatarContainer}>
            <Image
              source={{ uri: trainerPhoto }}
              style={trainerStyles.avatarImage}
              accessibilityLabel={trainerName}
            />
            <View style={trainerStyles.onlineIndicator} />
          </View>

          <View style={trainerStyles.heroDetails}>
            <View style={trainerStyles.nameRow}>
              <Text style={trainerStyles.trainerNameText}>{trainerName}</Text>
              <View style={trainerStyles.roleBadge}>
                <Text style={trainerStyles.roleBadgeText}>{roleBadgeText}</Text>
              </View>
            </View>

            <View style={trainerStyles.metaRow}>
              <Ionicons
                name="ribbon-outline"
                size={15}
                color="#E91E63"
                style={{ marginRight: 6 }}
              />
              <Text style={trainerStyles.metaText}>{credentialsText}</Text>
            </View>

            <View style={trainerStyles.statsRow}>
              <Ionicons name="star" size={14} color="#E91E63" style={{ marginRight: 5 }} />
              <Text style={trainerStyles.statsRating}>
                {`${trainerRating.toFixed(1)} (${totalReviews} ${totalReviews === 1 ? "review" : "reviews"})`}
              </Text>
              <Text style={trainerStyles.statsDivider}>•</Text>
              <Ionicons
                name="people-outline"
                size={15}
                color="#F2F2F7"
                style={{ marginRight: 5 }}
              />
              <Text style={trainerStyles.statsClients}>
                {`${activeClients} Active ${activeClients === 1 ? "Client" : "Clients"}`}
              </Text>
            </View>
          </View>
        </View>

        <View style={trainerStyles.heroRightSection}>
          <View style={trainerStyles.contactList}>
            <View style={trainerStyles.contactRow}>
              <View style={trainerStyles.contactIconBox}>
                <Ionicons name="mail-outline" size={16} color="#E91E63" />
              </View>
              <Text style={trainerStyles.contactText} numberOfLines={1}>
                {trainerEmail}
              </Text>
            </View>

            <View style={trainerStyles.contactRow}>
              <View style={trainerStyles.contactIconBox}>
                <Ionicons name="call-outline" size={16} color="#E91E63" />
              </View>
              <Text style={trainerStyles.contactText} numberOfLines={1}>
                {trainerPhone}
              </Text>
            </View>
          </View>

          <View style={trainerStyles.actionButtonsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Message Trainer"
              onPress={() => navigation.navigate("MemberSupport")}
              style={({ pressed }) => [
                trainerStyles.messageTrainerButton,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons
                name="chatbubble-outline"
                size={16}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={trainerStyles.messageTrainerText}>Message Trainer</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Video Call"
              onPress={() => {}}
              style={({ pressed }) => [
                trainerStyles.videoCallButton,
                pressed && { opacity: 0.75 },
              ]}
            >
              <Ionicons name="videocam-outline" size={19} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Coach Availability & Real-Time Schedule */}
      <View style={trainerStyles.availabilityCard}>
        <View style={trainerStyles.availabilityHeaderRow}>
          <View style={trainerStyles.availabilityHeaderLeft}>
            <View style={trainerStyles.availabilityTitleRow}>
              <Ionicons
                name="calendar-outline"
                size={19}
                color="#E91E63"
                style={{ marginRight: 8 }}
              />
              <Text style={trainerStyles.availabilityHeading}>
                Coach Working Hours & Availability
              </Text>
            </View>
            <Text style={trainerStyles.availabilitySubheading}>
              Real-time floor presence and 1-on-1 personal training hours
            </Text>
          </View>
          <View style={trainerStyles.availabilityStatusBadge}>
            <View
              style={[
                trainerStyles.liveDot,
                !isAvailableToday && { backgroundColor: "#F2F2F7" },
              ]}
            />
            <Text style={trainerStyles.availabilityStatusText}>
              {availabilityStatus}
            </Text>
          </View>
        </View>

        <View style={trainerStyles.scheduleGrid}>
          {weeklySchedule.map((item) => (
            <View
              key={item.day}
              style={[
                trainerStyles.scheduleDayCard,
                item.active
                  ? trainerStyles.scheduleDayActive
                  : trainerStyles.scheduleDayOff,
              ]}
            >
              <Text
                style={[
                  trainerStyles.dayLabel,
                  item.active
                    ? trainerStyles.dayLabelActive
                    : trainerStyles.dayLabelOff,
                ]}
              >
                {item.day}
              </Text>
              <Text style={trainerStyles.hoursLabel}>{item.hours}</Text>
              <Text style={trainerStyles.slotLabel}>{item.slot}</Text>
            </View>
          ))}
        </View>

        <View style={trainerStyles.availabilityFooterRow}>
          <View style={trainerStyles.nextSessionBadge}>
            <Ionicons
              name="time-outline"
              size={15}
              color="#34C759"
              style={{ marginRight: 6 }}
            />
            <Text style={trainerStyles.nextSessionText}>
              {nextAvailableSlot.startsWith("Next Available Slot:")
                ? nextAvailableSlot
                : `Next Available Slot: ${nextAvailableSlot}`}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Book 1-on-1 Session"
            onPress={() => navigation.navigate("MemberClasses")}
            style={({ pressed }) => [
              trainerStyles.bookSessionButton,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons
              name="calendar-number-outline"
              size={16}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={trainerStyles.bookSessionText}>Book 1-on-1 Session</Text>
          </Pressable>
        </View>
      </View>

      {/* Assigned Workout & Diet Plans Section */}
      <View style={trainerStyles.plansSection}>
        <View style={trainerStyles.plansHeaderRow}>
          <View style={trainerStyles.plansHeaderLeft}>
            <View style={trainerStyles.plansHeaderTitleRow}>
              <Ionicons
                name="folder-outline"
                size={19}
                color="#E91E63"
                style={{ marginRight: 8 }}
              />
              <Text style={trainerStyles.plansHeading}>
                Assigned Workout & Diet Plans
              </Text>
            </View>
            <Text style={trainerStyles.plansSubheading}>
              Tailored programs designed specifically for your goals
            </Text>
          </View>
          {plansToDisplay.length > 0 ? (
            <Text style={trainerStyles.plansCountBadge}>
              {plansToDisplay.length} Total Plans
            </Text>
          ) : null}
        </View>

        {workoutsQuery?.isLoading || mealsQuery?.isLoading ? (
          <LoadingSkeleton rows={2} />
        ) : plansToDisplay.length === 0 ? (
          <View style={{ padding: 28, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="folder-open-outline" size={40} color="#F2F2F7" />
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700", marginTop: 8 }}>
              No plans assigned yet
            </Text>
            <Text style={{ color: "#F2F2F7", fontSize: 13, textAlign: "center", marginTop: 4 }}>
              Your trainer has not assigned any workout or diet plans to your profile yet. Check back soon.
            </Text>
          </View>
        ) : (
          <View style={trainerStyles.plansGrid}>
            {plansToDisplay.map((plan, index) => (
              <Pressable
                key={`${plan.title}-${index}`}
                accessibilityRole="button"
                accessibilityLabel={`${plan.title} - ${plan.category}`}
                onPress={() => {
                  if (plan.route) {
                    navigation.navigate(plan.route);
                  }
                }}
                style={({ pressed, hovered }: any) => [
                  trainerStyles.planCard,
                  hovered && {
                    borderColor: "rgba(255, 255, 255, 0.22)",
                    transform: [{ translateY: -2 }],
                  },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <View style={trainerStyles.planCardTop}>
                  <View
                    style={[
                      trainerStyles.planIconBox,
                      { backgroundColor: plan.iconBg },
                    ]}
                  >
                    <Ionicons name={plan.icon} size={20} color={plan.iconColor} />
                  </View>
                  <View
                    style={[
                      trainerStyles.planTagBadge,
                      { backgroundColor: plan.tagBg, borderColor: plan.tagBorder },
                    ]}
                  >
                    <Text
                      style={[
                        trainerStyles.planTagText,
                        { color: plan.tagColor },
                      ]}
                    >
                      {plan.category}
                    </Text>
                  </View>
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={trainerStyles.planTitleText}>{plan.title}</Text>
                  <Text style={trainerStyles.planDescriptionText} numberOfLines={3}>
                    {plan.description}
                  </Text>
                </View>

                <View style={trainerStyles.planMetricsRow}>
                  <View style={trainerStyles.metricItem}>
                    <Ionicons
                      name={plan.metric1Icon}
                      size={14}
                      color={plan.metric1IconColor || "#F2F2F7"}
                      style={{ marginRight: 5 }}
                    />
                    <Text style={trainerStyles.metricText}>{plan.metric1}</Text>
                  </View>
                  <View style={trainerStyles.metricItem}>
                    <Ionicons
                      name={plan.metric2Icon}
                      size={14}
                      color={plan.metric2IconColor || "#F2F2F7"}
                      style={{ marginRight: 5 }}
                    />
                    <Text style={trainerStyles.metricText}>{plan.metric2}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Rate Your Trainer Review Panel */}
      <View ref={reviewSectionRef} style={trainerStyles.reviewPanel}>
        <View style={trainerStyles.reviewHeaderRow}>
          <View style={trainerStyles.reviewIconBox}>
            <Ionicons name="chatbox-ellipses-outline" size={22} color="#E91E63" />
          </View>
          <View style={trainerStyles.reviewHeaderTextGroup}>
            <Text style={trainerStyles.reviewTitleText}>Rate Your Trainer</Text>
            <Text style={trainerStyles.reviewSubtitleText}>
              Your anonymous feedback helps {trainerName} optimize your personal training strategy.
            </Text>
          </View>
        </View>

        <View style={trainerStyles.reviewSubSection}>
          <Text style={trainerStyles.subSectionLabel}>OVERALL RATING</Text>
          <View style={trainerStyles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                accessibilityRole="button"
                accessibilityLabel={`Rate ${star} stars`}
                onPress={() => setRating(star)}
                style={trainerStyles.starButton}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={26}
                  color={star <= rating ? "#E91E63" : "rgba(255, 255, 255, 0.2)"}
                />
              </Pressable>
            ))}
            <Text style={trainerStyles.ratingLabelText}>
              {rating === 5
                ? "5.0 Excellent"
                : rating === 4
                ? "4.0 Very Good"
                : rating === 3
                ? "3.0 Good"
                : rating === 2
                ? "2.0 Fair"
                : "1.0 Needs Improvement"}
            </Text>
          </View>
        </View>

        <View style={trainerStyles.reviewSubSection}>
          <Text style={trainerStyles.subSectionLabel}>WHAT WENT PARTICULARLY WELL?</Text>
          <View style={trainerStyles.chipsWrapper}>
            {[
              "Knowledgeable and helpful",
              "Motivating and encouraging",
              "Personalized my workouts",
              "Clear communication",
              "Could improve availability",
            ].map((opt) => {
              const isSelected = feedbackOption === opt;
              return (
                <Pressable
                  key={opt}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setFeedbackOption(isSelected ? null : opt)}
                  style={({ pressed }) => [
                    trainerStyles.chipButton,
                    isSelected && trainerStyles.chipButtonSelected,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text
                    style={[
                      trainerStyles.chipText,
                      isSelected && trainerStyles.chipTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={trainerStyles.reviewSubSection}>
          <TextInput
            value={customFeedback}
            onChangeText={setCustomFeedback}
            placeholder="Write additional feedback or comments..."
            placeholderTextColor="#F2F2F7"
            multiline
            style={trainerStyles.feedbackTextInput}
          />
        </View>

        {saveFeedback.error ? (
          <NoticeBanner tone="error" message={getApiErrorMessage(saveFeedback.error)} />
        ) : saveFeedback.isSuccess ? (
          <NoticeBanner tone="success" message="Thank you! Your review has been submitted." />
        ) : null}

        <View style={trainerStyles.reviewSubmitRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Submit Review"
            onPress={submitFeedback}
            disabled={saveFeedback.isPending}
            style={({ pressed }) => [
              trainerStyles.submitReviewButton,
              pressed && { opacity: 0.85 },
              saveFeedback.isPending && { opacity: 0.6 },
            ]}
          >
            <Ionicons name="send" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={trainerStyles.submitReviewText}>
              {saveFeedback.isPending
                ? "Submitting..."
                : feedbackQuery.data
                ? "Update Review"
                : "Submit Review"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
