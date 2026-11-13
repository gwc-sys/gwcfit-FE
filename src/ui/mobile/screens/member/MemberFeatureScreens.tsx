import { MemberPaymentReceipt } from "../../../../features/operations/MemberPaymentReceipt";
import { MemberPlanCheckout } from "../../../../features/operations/MembershipCheckout";
import { WeekCalendar } from "../../components/WeekCalendar";
import { createMembershipStyles } from "../../styles/screens/member/MemberMembershipScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "../../components/NativePressable";
import { useEffect, useMemo, useState } from "react";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../../store/useAuthStore";
import { useDailySteps } from "../../../../hooks/useDailySteps";
import { useActivitySync } from "../../../../hooks/useActivitySync";
import { memberQueryKeys, useMemberActivity, useSyncMemberActivity } from "../../../../hooks/useMember";
import { membershipCheckoutApi } from "../../../../services/api/membershipCheckout";
import { positiveNumberError, progressFormError, supportFormError } from "../../components/member/formValidation";
import { changePasswordSchema } from "../../../../validation/auth";
import { MemberProgressOverview, useMemberReferenceColors } from "../../components/member/MemberReference";
import { getMemberPaymentTotals, getCompletedWorkoutCount, getRewardPoints, getRewardBadgeCount } from "../../../../utils/memberFeatureMetrics";
import { ActivityIndicator, FlatList, Image, Linking, Modal, RefreshControl, ScrollView, Switch, Text, TextInput, useWindowDimensions, View } from "react-native";
import type { ReactNode } from "react";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ClassBookingCard, EmptyState, ErrorState, GoalProgressCard, LoadingSkeleton, MemberStatCard, NotificationItem, PaymentHistoryCard, RewardBadge, ScrollListCard, StatusBadge } from "../../components/member/index";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { AppLogo } from "../../../../components/AppLogo";
import { getApiErrorMessage } from "../../../../services/api/client";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import type { MemberAttendance, MemberClass, MemberGoal, MemberMealPlan, MemberNotification, MemberPayment, MemberProfile, MemberProgressLog, MemberReward, MemberWorkout } from "../../../../types/member";
import { requestLogoutConfirmation } from "../../../../utils/logoutConfirmation";
import { formatCurrency, formatDate, formatDateTime, memberStatusTone } from "../../../../utils/formatters";
import type * as React from "react";
import type { useQueryRefreshPresentation, useQueryStatePresentation, useListSectionPresentation, useDetailGridPresentation, useSectionTitlePresentation, useMemberMembershipScreenPresentation, useMemberAttendanceScreenPresentation, useMemberWorkoutScreenPresentation, useMemberMealPlanScreenPresentation, useMemberProgressScreenPresentation, useMemberTrainerScreenPresentation, useMemberClassesScreenPresentation, useMemberNotificationsScreenPresentation, useMemberGoalsScreenPresentation, useMemberRewardsScreenPresentation, useMemberSupportScreenPresentation, useMemberSettingsScreenPresentation } from "../../../../screens/member/MemberFeatureScreens";

export function QueryRefreshView({ model }: { model: ReturnType<typeof useQueryRefreshPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { refreshing, onRefresh } = model.props;
      return (<RefreshControl refreshing={refreshing} onRefresh={() => { void onRefresh(); }} tintColor={colors.primary} />);
    }
  }
}

export function QueryStateView<T>({ model }: { model: ReturnType<typeof useQueryStatePresentation<T>> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      
      return (<LoadingSkeleton rows={4} />);
    }
    case "view2": {
      const { error, onRetry } = model.props;
      return (<ErrorState message={getApiErrorMessage(error)} onRetry={onRetry} />);
    }
    case "view3": {
      const { emptyTitle, emptyMessage } = model.props;
      return (<EmptyState title={emptyTitle} message={emptyMessage} icon="file-tray-outline" />);
    }
  }
}

export function ListSectionView<T extends object>({ model }: { model: ReturnType<typeof useListSectionPresentation<T>> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { data, keyExtractor, renderItem, styles } = model.props;
      return ((
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => renderItem(item)}
      scrollEnabled={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  ));
    }
  }
}

export function DetailGridView({ model }: { model: ReturnType<typeof useDetailGridPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, children } = model.props;
      return (<View style={styles.grid}>{children}</View>);
    }
  }
}

export function SectionTitleView({ model }: { model: ReturnType<typeof useSectionTitlePresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, title } = model.props;
      return (<Text style={styles.sectionTitle}>{title}</Text>);
    }
  }
}

interface MobileAvailablePlanItem {
  id: string;
  name: string;
  priceFormatted: string;
  priceCents: number;
  currency: string;
  durationDays: number;
  description: string;
  dailyVisits: number;
  isPopular: boolean;
  features: string[];
}

function formatMembershipDateShort(d: string | null | undefined): string {
  if (!d) return "--";
  try {
    const parsed = new Date(d);
    if (Number.isNaN(parsed.getTime())) return d;
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function formatMembershipRangeDayMonth(d: string | null | undefined): string {
  if (!d) return "--";
  try {
    const parsed = new Date(d);
    if (Number.isNaN(parsed.getTime())) return d;
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

export function MemberMembershipScreenView({
  model,
}: {
  model: ReturnType<typeof useMemberMembershipScreenPresentation>;
}): React.ReactNode {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRenew, setAutoRenew] = useState(true);
  const [digitalPassModalOpen, setDigitalPassModalOpen] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<MobileAvailablePlanItem | null>(null);
  const [transactionRef, setTransactionRef] = useState("");
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<{ text: string; error?: boolean } | null>(null);

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;

  switch (model.kind) {
    case "view1": {
      const { queryRefresh, query } = model.props;
      const membership = query.data;

      const gymName = (membership?.gym_name || user?.gym_name || "").trim();
      const gymBadgeText = gymName
        ? `${gymName.toUpperCase()} • VERIFIED PASS`
        : "VERIFIED PASS";

      const planName = membership?.membership_plan_name || "No Active Plan";
      const planDescription = membership?.plan_description || "";
      const dailyVisitsCount = membership?.plan_daily_visit_limit ?? null;
      const planSubtitleText = [
        planDescription,
        dailyVisitsCount != null
          ? `${dailyVisitsCount} visit${dailyVisitsCount === 1 ? "" : "s"}/day`
          : null,
      ]
        .filter(Boolean)
        .join(" • ");

      const daysLeft = Math.max(0, membership?.days_remaining ?? 0);
      const daysTotal = Math.max(0, membership?.plan_duration_days ?? 0);
      const daysCompleted = daysTotal > 0 ? Math.max(0, Math.min(daysTotal, daysTotal - daysLeft)) : 0;
      const progressRatio = daysTotal > 0 ? Math.min(1, Math.max(0, daysCompleted / daysTotal)) : 0;

      const currencySymbol = (membership?.plan_currency || "INR").toUpperCase() === "INR" ? "₹" : "$";
      const planPriceFormatted =
        membership?.plan_price_cents != null
          ? `${currencySymbol}${Number((membership.plan_price_cents / 100).toFixed(0)).toLocaleString()}`
          : null;

      const startDateFormatted = formatMembershipDateShort(membership?.start_date);
      const expiryDateFormatted = formatMembershipDateShort(membership?.expiry_date);
      const rawStatus = (membership?.status || "inactive").trim();
      const isPlanActive = rawStatus.toLowerCase() === "active";
      const statusLabel = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

      // Available plans from backend
      const availablePlans: MobileAvailablePlanItem[] = useMemo(() => {
        const list = membership?.available_plans ?? [];
        return list.map((p, index) => {
          const sym = (p.currency || "INR").toUpperCase() === "INR" ? "₹" : "$";
          const amt = Number((p.price_cents / 100).toFixed(0)).toLocaleString();
          const isPopular = p.name.toLowerCase().includes("standard") || (list.length > 1 && index === 0);
          return {
            id: p.plan_uuid,
            name: p.name,
            priceFormatted: `${sym}${amt}`,
            priceCents: p.price_cents,
            currency: p.currency || "INR",
            durationDays: p.duration_days,
            description: p.description || "",
            dailyVisits: p.daily_visit_limit ?? 1,
            isPopular,
            features: Array.isArray(p.benefits) ? p.benefits.filter(Boolean) : [],
          };
        });
      }, [membership?.available_plans]);

      const filteredPlans = useMemo(() => {
        if (!searchQuery.trim()) return availablePlans;
        const q = searchQuery.toLowerCase().trim();
        return availablePlans.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.features.some((f) => f.toLowerCase().includes(q))
        );
      }, [availablePlans, searchQuery]);

      const filteredHistory = useMemo(() => {
        const hist = membership?.history ?? [];
        if (!searchQuery.trim()) return hist;
        const q = searchQuery.toLowerCase().trim();
        return hist.filter(
          (h) =>
            (h.membership_plan_name && h.membership_plan_name.toLowerCase().includes(q)) ||
            (h.status && h.status.toLowerCase().includes(q)) ||
            (h.start_date && h.start_date.toLowerCase().includes(q)) ||
            (h.expiry_date && h.expiry_date.toLowerCase().includes(q))
        );
      }, [membership?.history, searchQuery]);

      const passQrValue = useMemo(() => {
        return JSON.stringify({
          member_uuid: membership?.member_uuid || user?.id,
          name: membership?.member_name || user?.full_name,
          plan: planName,
          status: membership?.status || "active",
          valid_until: expiryDateFormatted,
        });
      }, [membership, user, planName, expiryDateFormatted]);

      const handleUpgradePress = () => {
        const defaultPlan =
          availablePlans.find((p) => p.isPopular) || availablePlans[0] || null;
        if (defaultPlan) {
          setSelectedCheckoutPlan(defaultPlan);
          setCheckoutNotice(null);
          setTransactionRef("");
        }
      };

      const handleProceedToPayment = async () => {
        if (!selectedCheckoutPlan) return;
        setIsSubmittingCheckout(true);
        setCheckoutNotice(null);
        try {
          await membershipCheckoutApi.submit({
            plan_uuid: selectedCheckoutPlan.id,
            method: "manual_qr",
            quoted_amount_cents: selectedCheckoutPlan.priceCents,
            quoted_currency: selectedCheckoutPlan.currency || "INR",
            transaction_reference:
              transactionRef.trim() || `TXN-${Date.now().toString(36).toUpperCase()}`,
          });
          setCheckoutNotice({
            text: `Payment request submitted for ${selectedCheckoutPlan.name}! Gym administration will verify and activate your plan.`,
          });
          void queryClient.invalidateQueries({ queryKey: memberQueryKeys.membership() });
          void queryClient.invalidateQueries({ queryKey: ["member"] });
          setTimeout(() => {
            setSelectedCheckoutPlan(null);
            setCheckoutNotice(null);
            setTransactionRef("");
          }, 2200);
        } catch (err: unknown) {
          setCheckoutNotice({
            text:
              getApiErrorMessage(err) ||
              "Could not submit plan checkout. Please try again or contact gym staff.",
            error: true,
          });
        } finally {
          setIsSubmittingCheckout(false);
        }
      };

      return (
        <Screen
          scroll
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 40,
            gap: 0,
            backgroundColor: "#000000",
          }}
          refreshControl={queryRefresh(query.isRefetching, () => {
            void query.refetch();
          })}
        >
          {/* A. Navigation & Top Header Bar */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "800",
                color: "#E91E63",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              PLAN & RENEWAL
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "900",
                  color: "#FFFFFF",
                  letterSpacing: -0.5,
                }}
              >
                Membership
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Search membership plans and history"
                onPress={() => setSearchOpen((prev) => !prev)}
                style={({ pressed }) => [
                  {
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: "#1C1C1E",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Ionicons name="search" size={17} color="#007AFF" />
              </Pressable>
            </View>

            {searchOpen ? (
              <View
                style={{
                  marginTop: 12,
                  backgroundColor: "#000000",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  gap: 8,
                }}
              >
                <Ionicons name="search-outline" size={16} color="#F2F2F7" />
                <TextInput
                  accessibilityLabel="Search plans and receipts"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search plans or payment history..."
                  placeholderTextColor="#F2F2F7"
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    fontSize: 13,
                    color: "#FFFFFF",
                  }}
                />
                {searchQuery ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Clear search"
                    onPress={() => setSearchQuery("")}
                  >
                    <Ionicons name="close-circle" size={16} color="#F2F2F7" />
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>

          {query.isLoading && !query.data ? <LoadingSkeleton rows={4} /> : null}
          {query.error && !query.data ? (
            <ErrorState message={getApiErrorMessage(query.error)} onRetry={() => query.refetch()} />
          ) : null}

          {membership ? (
            <>
              {/* B. Active Plan Summary Card (Current Plan Container) */}
              <View
                style={{
                  backgroundColor: "#000000",
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  padding: 16,
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                {/* Top Badge Row */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(233, 30, 99, 0.14)",
                      borderWidth: 1,
                      borderColor: "rgba(233, 30, 99, 0.3)",
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "800",
                        color: "#E91E63",
                        letterSpacing: 0.6,
                      }}
                    >
                      {gymBadgeText}
                    </Text>
                  </View>

                  <View
                    style={{
                      backgroundColor: isPlanActive
                        ? "rgba(52, 199, 89, 0.14)"
                        : "rgba(233, 30, 99, 0.14)",
                      borderWidth: 1,
                      borderColor: isPlanActive
                        ? "rgba(52, 199, 89, 0.35)"
                        : "rgba(233, 30, 99, 0.35)",
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: isPlanActive ? "#34C759" : "#E91E63",
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: isPlanActive ? "#34C759" : "#E91E63",
                      }}
                    >
                      {statusLabel}
                    </Text>
                  </View>
                </View>

                {/* Plan Title & Price + Subtitle */}
                <View style={{ gap: 4 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 26,
                        fontWeight: "900",
                        color: "#FFFFFF",
                        letterSpacing: -0.4,
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {planName}
                    </Text>

                    {planPriceFormatted ? (
                      <Text>
                        <Text style={{ fontSize: 15, fontWeight: "800", color: "#007AFF" }}>
                          {planPriceFormatted}
                        </Text>
                        {daysTotal > 0 ? (
                          <Text style={{ fontSize: 12, fontWeight: "600", color: "#F2F2F7" }}>
                            {` / ${daysTotal}d`}
                          </Text>
                        ) : null}
                      </Text>
                    ) : null}
                  </View>

                  {planSubtitleText ? (
                    <Text style={{ fontSize: 12, color: "#F2F2F7" }} numberOfLines={2}>
                      {planSubtitleText}
                    </Text>
                  ) : null}
                </View>

                {/* Days Remaining Progress Bar */}
                <View style={{ gap: 8 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "800",
                        color: "#E91E63",
                        letterSpacing: 0.4,
                      }}
                    >
                      {`${daysLeft} DAYS LEFT`}
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: "#F2F2F7" }}>
                      {`${daysCompleted} / ${daysTotal} Days Completed`}
                    </Text>
                  </View>

                  <View
                    style={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#1C1C1E",
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#E91E63",
                        height: "100%",
                        width: `${Math.round(progressRatio * 100)}%`,
                        borderRadius: 4,
                      }}
                    />
                  </View>
                </View>

                {/* Subscription Details Grid (3-Column Box) */}
                <View
                  style={{
                    backgroundColor: "#000000",
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.06)",
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1, alignItems: "center", gap: 3 }}>
                    <Text style={{ fontSize: 10, fontWeight: "600", color: "#F2F2F7" }}>
                      Start Date
                    </Text>
                    <Text
                      style={{ fontSize: 12, fontWeight: "800", color: "#FFFFFF" }}
                      numberOfLines={1}
                    >
                      {startDateFormatted}
                    </Text>
                  </View>

                  <View style={{ flex: 1, alignItems: "center", gap: 3 }}>
                    <Text style={{ fontSize: 10, fontWeight: "600", color: "#F2F2F7" }}>
                      Expiry
                    </Text>
                    <Text
                      style={{ fontSize: 12, fontWeight: "800", color: "#E91E63" }}
                      numberOfLines={1}
                    >
                      {expiryDateFormatted}
                    </Text>
                  </View>

                  <View style={{ flex: 1, alignItems: "center", gap: 3 }}>
                    <Text style={{ fontSize: 10, fontWeight: "600", color: "#F2F2F7" }}>
                      Daily Visits
                    </Text>
                    <Text
                      style={{ fontSize: 12, fontWeight: "800", color: "#FFFFFF" }}
                      numberOfLines={1}
                    >
                      {dailyVisitsCount != null ? `${dailyVisitsCount} / Day` : "--"}
                    </Text>
                  </View>
                </View>

                {/* Action Button Row */}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="View Digital Pass"
                    onPress={() => setDigitalPassModalOpen(true)}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        backgroundColor: "#1C1C1E",
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        paddingVertical: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Ionicons name="qr-code-outline" size={15} color="#007AFF" />
                    <Text style={{ fontSize: 13, fontWeight: "800", color: "#FFFFFF" }}>
                      View Digital Pass
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Upgrade Plan"
                    onPress={handleUpgradePress}
                    disabled={availablePlans.length === 0}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        backgroundColor: "#E91E63",
                        borderRadius: 12,
                        paddingVertical: 12,
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: "#E91E63",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.35,
                        shadowRadius: 8,
                        elevation: 3,
                      },
                      pressed && { opacity: 0.85 },
                      availablePlans.length === 0 && { opacity: 0.5 },
                    ]}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "800", color: "#FFFFFF" }}>
                      Upgrade Plan
                    </Text>
                  </Pressable>
                </View>

                {/* Auto-Renew Row */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 2,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#F2F2F7" }}>
                    Auto-Renew Subscription:
                  </Text>
                  <Switch
                    value={autoRenew}
                    onValueChange={setAutoRenew}
                    trackColor={{ false: "#1C1C1E", true: "#34C759" }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#1C1C1E"
                    style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                  />
                </View>
              </View>

              {/* C. Available Plans Section ("Choose Your Plan") */}
              <View style={{ marginBottom: 22 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "800", color: "#FFFFFF" }}>
                    Choose Your Plan
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: "#F2F2F7" }}>
                    StoreKit In-App
                  </Text>
                </View>

                {filteredPlans.length === 0 ? (
                  <EmptyState
                    title="No membership plans available"
                    message="Available subscription plans configured by your gym will appear here."
                    icon="pricetag-outline"
                  />
                ) : (
                  <View style={{ gap: 14 }}>
                    {filteredPlans.map((plan) => {
                      const subLine = [
                        plan.description,
                        `${plan.dailyVisits} visit${plan.dailyVisits === 1 ? "" : "s"}/day`,
                      ]
                        .filter(Boolean)
                        .join(" • ");

                      return (
                        <View
                          key={plan.id}
                          style={{
                            backgroundColor: "#000000",
                            borderRadius: 22,
                            borderWidth: plan.isPopular ? 1.5 : 1,
                            borderColor: plan.isPopular
                              ? "#E91E63"
                              : "rgba(255, 255, 255, 0.08)",
                            padding: 18,
                            gap: 12,
                          }}
                        >
                          {/* Top Row: Plan Title & Popular Pill */}
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 8,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 19,
                                fontWeight: "900",
                                color: "#FFFFFF",
                                flex: 1,
                              }}
                              numberOfLines={1}
                            >
                              {plan.name}
                            </Text>

                            {plan.isPopular ? (
                              <View
                                style={{
                                  backgroundColor: "#E91E63",
                                  borderRadius: 999,
                                  paddingHorizontal: 10,
                                  paddingVertical: 4,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 10,
                                    fontWeight: "900",
                                    color: "#FFFFFF",
                                    letterSpacing: 0.6,
                                  }}
                                >
                                  POPULAR
                                </Text>
                              </View>
                            ) : null}
                          </View>

                          {/* Price & Subtitle */}
                          <View style={{ gap: 4 }}>
                            <Text>
                              <Text
                                style={{
                                  fontSize: 28,
                                  fontWeight: "900",
                                  color: "#FFFFFF",
                                  letterSpacing: -0.5,
                                }}
                              >
                                {plan.priceFormatted}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: "600",
                                  color: "#F2F2F7",
                                }}
                              >
                                {` / ${plan.durationDays} days`}
                              </Text>
                            </Text>

                            {subLine ? (
                              <Text style={{ fontSize: 12, color: "#F2F2F7" }}>
                                {subLine}
                              </Text>
                            ) : null}
                          </View>

                          {/* Feature Checklist */}
                          {plan.features.length > 0 ? (
                            <View style={{ gap: 7, marginTop: 2 }}>
                              {plan.features.map((feat, idx) => (
                                <View
                                  key={idx}
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <Ionicons
                                    name="checkmark"
                                    size={15}
                                    color="#34C759"
                                  />
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      fontWeight: "600",
                                      color: "#FFFFFF",
                                      flex: 1,
                                    }}
                                  >
                                    {feat}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          ) : null}

                          {/* CTA Button */}
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Choose ${plan.name}`}
                            onPress={() => {
                              setSelectedCheckoutPlan(plan);
                              setCheckoutNotice(null);
                              setTransactionRef("");
                            }}
                            style={({ pressed }) => [
                              {
                                backgroundColor: plan.isPopular ? "#E91E63" : "#1C1C1E",
                                borderRadius: 12,
                                paddingVertical: 13,
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: 4,
                                borderWidth: plan.isPopular ? 0 : 1,
                                borderColor: "rgba(255, 255, 255, 0.08)",
                              },
                              pressed && { opacity: 0.85 },
                            ]}
                          >
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: "800",
                                color: "#FFFFFF",
                              }}
                            >
                              {`Choose ${plan.name}`}
                            </Text>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* D. Membership History Section */}
              <View style={{ gap: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#FFFFFF" }}>
                  Membership History
                </Text>

                {filteredHistory.length === 0 ? (
                  <EmptyState
                    title="No billing history yet"
                    message="Your completed membership payments and downloadable receipts will appear here."
                    icon="receipt-outline"
                  />
                ) : (
                  filteredHistory.map((item) => {
                    const itemSym = (item.currency || "INR").toUpperCase() === "INR" ? "₹" : "$";
                    const itemAmt =
                      item.amount_cents != null
                        ? `${itemSym}${Number((item.amount_cents / 100).toFixed(0)).toLocaleString()}`
                        : planPriceFormatted || "";
                    const paidDateLabel = item.paid_at
                      ? formatMembershipDateShort(item.paid_at)
                      : formatMembershipDateShort(item.start_date);
                    const validitySpanLabel =
                      item.start_date && item.expiry_date
                        ? `${formatMembershipRangeDayMonth(item.start_date)} – ${formatMembershipRangeDayMonth(item.expiry_date)}`
                        : null;
                    const historySubtitle = [
                      paidDateLabel !== "--" ? `Paid ${paidDateLabel}` : null,
                      validitySpanLabel,
                    ]
                      .filter(Boolean)
                      .join(" • ");

                    const isPaid = item.status.toLowerCase() === "paid";

                    return (
                      <MemberPaymentReceipt
                        key={item.membership_uuid}
                        paymentId={item.membership_uuid}
                        mobileBottomSheet
                        durationDays={daysTotal || null}
                      >
                        {(openReceipt, isGenerating) => (
                          <Pressable
                            accessibilityRole={isPaid ? "button" : undefined}
                            accessibilityLabel={
                              isPaid
                                ? `View payment receipt for ${item.membership_plan_name || planName}`
                                : undefined
                            }
                            disabled={!isPaid || isGenerating}
                            onPress={openReceipt}
                            style={({ pressed }) => [
                              {
                                backgroundColor: "#000000",
                                borderRadius: 18,
                                borderWidth: 1,
                                borderColor: "rgba(255, 255, 255, 0.08)",
                                padding: 14,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 10,
                              },
                              isPaid && pressed && { opacity: 0.85 },
                            ]}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 12,
                                flex: 1,
                              }}
                            >
                              <View
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 20,
                                  backgroundColor: "#E91E63",
                                  borderWidth: 1,
                                  borderColor: "rgba(233, 30, 99, 0.3)",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Ionicons
                                  name="receipt-outline"
                                  size={18}
                                  color="#E91E63"
                                />
                              </View>

                              <View style={{ flex: 1, gap: 2 }}>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: "800",
                                    color: "#FFFFFF",
                                  }}
                                  numberOfLines={1}
                                >
                                  {item.membership_plan_name || planName}
                                </Text>
                                {historySubtitle ? (
                                  <Text
                                    style={{ fontSize: 11, color: "#F2F2F7" }}
                                    numberOfLines={1}
                                  >
                                    {historySubtitle}
                                  </Text>
                                ) : null}
                              </View>
                            </View>

                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              {itemAmt ? (
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: "900",
                                    color: "#FFFFFF",
                                  }}
                                >
                                  {itemAmt}
                                </Text>
                              ) : null}

                              <View
                                style={{
                                  backgroundColor: isPaid
                                    ? "rgba(52, 199, 89, 0.14)"
                                    : "rgba(233, 30, 99, 0.14)",
                                  borderWidth: 1,
                                  borderColor: isPaid
                                    ? "rgba(52, 199, 89, 0.35)"
                                    : "rgba(233, 30, 99, 0.35)",
                                  borderRadius: 999,
                                  paddingHorizontal: 10,
                                  paddingVertical: 5,
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 10,
                                    fontWeight: "800",
                                    color: isPaid ? "#34C759" : "#E91E63",
                                  }}
                                >
                                  {item.status.toUpperCase()}
                                </Text>
                                {isPaid ? (
                                  isGenerating ? (
                                    <ActivityIndicator size="small" color="#34C759" />
                                  ) : (
                                    <Ionicons
                                      name="document-text"
                                      size={11}
                                      color="#007AFF"
                                    />
                                  )
                                ) : null}
                              </View>
                            </View>
                          </Pressable>
                        )}
                      </MemberPaymentReceipt>
                    );
                  })
                )}
              </View>
            </>
          ) : null}

          {/* Digital Pass QR Modal */}
          <Modal
            visible={digitalPassModalOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setDigitalPassModalOpen(false)}
          >
            <Pressable
              style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.75)",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
              onPress={() => setDigitalPassModalOpen(false)}
            >
              <Pressable
                onPress={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  maxWidth: 360,
                  backgroundColor: "#000000",
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.12)",
                  padding: 20,
                  gap: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "800",
                        color: "#E91E63",
                        letterSpacing: 0.8,
                      }}
                    >
                      VERIFIED MEMBER PASS
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: "900", color: "#FFFFFF" }}>
                      {gymName || "Gym Pass"}
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close Digital Pass"
                    onPress={() => setDigitalPassModalOpen(false)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#1C1C1E",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="close" size={16} color="#F2F2F7" />
                  </Pressable>
                </View>

                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 18,
                    padding: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                  }}
                >
                  <QRCode
                    value={passQrValue}
                    size={168}
                    backgroundColor="#FFFFFF"
                    color="#000000"
                  />
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 11, color: "#F2F2F7" }}>Valid From</Text>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>
                      {startDateFormatted}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 11, color: "#F2F2F7" }}>Expires On</Text>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#E91E63" }}>
                      {expiryDateFormatted}
                    </Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Done"
                  onPress={() => setDigitalPassModalOpen(false)}
                  style={{
                    backgroundColor: "#E91E63",
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>
                    Done
                  </Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>

          {/* Plan Checkout / Upgrade Modal */}
          <Modal
            visible={selectedCheckoutPlan !== null}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedCheckoutPlan(null)}
          >
            <Pressable
              style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.75)",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
              onPress={() => setSelectedCheckoutPlan(null)}
            >
              <Pressable
                onPress={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  maxWidth: 380,
                  backgroundColor: "#000000",
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.12)",
                  padding: 20,
                  gap: 14,
                }}
              >
                {selectedCheckoutPlan ? (
                  <>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 17,
                            fontWeight: "900",
                            color: "#FFFFFF",
                          }}
                        >
                          {`Upgrade to ${selectedCheckoutPlan.name}`}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#F2F2F7" }}>
                          {`${selectedCheckoutPlan.priceFormatted} for ${selectedCheckoutPlan.durationDays} days`}
                        </Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Close checkout"
                        onPress={() => setSelectedCheckoutPlan(null)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: "#1C1C1E",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="close" size={16} color="#F2F2F7" />
                      </Pressable>
                    </View>

                    <View style={{ gap: 6 }}>
                      <Text style={{ fontSize: 12, fontWeight: "600", color: "#F2F2F7" }}>
                        Transaction / UPI Reference (Optional)
                      </Text>
                      <TextInput
                        accessibilityLabel="Transaction reference"
                        value={transactionRef}
                        onChangeText={setTransactionRef}
                        placeholder="Enter UPI / payment reference ID"
                        placeholderTextColor="#F2F2F7"
                        style={{
                          backgroundColor: "#000000",
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: "rgba(255, 255, 255, 0.1)",
                          paddingHorizontal: 14,
                          paddingVertical: 11,
                          fontSize: 13,
                          color: "#FFFFFF",
                        }}
                      />
                    </View>

                    {checkoutNotice ? (
                      <View
                        style={{
                          backgroundColor: checkoutNotice.error
                            ? "rgba(233, 30, 99, 0.14)"
                            : "rgba(52, 199, 89, 0.14)",
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: checkoutNotice.error
                            ? "rgba(233, 30, 99, 0.35)"
                            : "rgba(52, 199, 89, 0.35)",
                          padding: 10,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: checkoutNotice.error ? "#E91E63" : "#34C759",
                          }}
                        >
                          {checkoutNotice.text}
                        </Text>
                      </View>
                    ) : null}

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Confirm Plan Upgrade"
                      onPress={() => {
                        void handleProceedToPayment();
                      }}
                      disabled={isSubmittingCheckout}
                      style={({ pressed }) => [
                        {
                          backgroundColor: "#E91E63",
                          borderRadius: 12,
                          paddingVertical: 13,
                          alignItems: "center",
                          justifyContent: "center",
                        },
                        pressed && { opacity: 0.85 },
                        isSubmittingCheckout && { opacity: 0.6 },
                      ]}
                    >
                      <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>
                        {isSubmittingCheckout
                          ? "Submitting..."
                          : `Confirm ${selectedCheckoutPlan.name}`}
                      </Text>
                    </Pressable>
                  </>
                ) : null}
              </Pressable>
            </Pressable>
          </Modal>
        </Screen>
      );
    }
  }
}


export { MemberAttendanceScreenView } from "./MemberAttendanceScreen";


import { MemberWorkoutScreenView } from "./MemberWorkoutScreen";
export { MemberWorkoutScreenView };

export { MemberMealPlanScreenView } from "./MemberMealPlanScreen";

type MobileWeightTimeRange = "1W" | "1M" | "6M" | "1Y";

function computeMobileBmi(weightKg: number | null | undefined, heightCm: number | null | undefined): number | null {
  if (
    weightKg == null ||
    heightCm == null ||
    !Number.isFinite(weightKg) ||
    !Number.isFinite(heightCm) ||
    weightKg <= 0 ||
    heightCm <= 0
  ) {
    return null;
  }
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

function getMobileBmiBadge(bmi: number | null): { label: string; color: string; bg: string; border: string } {
  if (bmi == null || !Number.isFinite(bmi)) {
    return {
      label: "No Data",
      color: "#F2F2F7",
      bg: "rgba(255, 255, 255, 0.14)",
      border: "rgba(255, 255, 255, 0.28)",
    };
  }
  if (bmi < 18.5) {
    return {
      label: "Underweight",
      color: "#007AFF",
      bg: "rgba(0, 122, 255, 0.14)",
      border: "rgba(0, 122, 255, 0.3)",
    };
  }
  if (bmi < 25) {
    return {
      label: "Normal",
      color: "#34C759",
      bg: "rgba(52, 199, 89, 0.16)",
      border: "rgba(52, 199, 89, 0.35)",
    };
  }
  if (bmi < 30) {
    return {
      label: "Overweight",
      color: "#E91E63",
      bg: "rgba(233, 30, 99, 0.16)",
      border: "rgba(233, 30, 99, 0.35)",
    };
  }
  return {
    label: "Obese",
    color: "#E91E63",
    bg: "rgba(233, 30, 99, 0.16)",
    border: "rgba(233, 30, 99, 0.35)",
  };
}

function getMobileBodyFatRangeLabel(bodyFat: number | null): string {
  if (bodyFat == null || !Number.isFinite(bodyFat)) return "Athletic range";
  if (bodyFat < 6) return "Essential range";
  if (bodyFat <= 20) return "Athletic range";
  if (bodyFat <= 25) return "Fitness range";
  return "Elevated range";
}

function buildSmoothWeightSvgPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M 16,${pts[0].y} L 304,${pts[0].y}`;
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const curr = pts[i];
    const next = pts[i + 1];
    const cpx1 = Math.round(curr.x + (next.x - curr.x) / 2);
    const cpy1 = curr.y;
    const cpx2 = Math.round(curr.x + (next.x - curr.x) / 2);
    const cpy2 = next.y;
    d += ` C ${cpx1},${cpy1} ${cpx2},${cpy2} ${next.x},${next.y}`;
  }
  return d;
}

export function MemberProgressScreenView({
  model,
}: {
  model: ReturnType<typeof useMemberProgressScreenPresentation>;
}): React.ReactNode {
  const [timeRange, setTimeRange] = useState<MobileWeightTimeRange>("1W");
  const [bannerNotice, setBannerNotice] = useState<{ text: string; tone: "success" | "error" } | null>(null);

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;

  switch (model.kind) {
    case "view1": {
      const {
        queryRefresh,
        query,
        profileQuery,
        goalsQuery,
        createLog,
        updateGoal,
        weight,
        setWeight,
        bodyFat,
        setBodyFat,
        activeCalories,
        setActiveCalories,
        progressValidation,
        setProgressValidation,
        notes,
        setNotes,
      } = model.props;

      const rawLogs: MemberProgressLog[] = Array.isArray(query?.data)
        ? (query.data as MemberProgressLog[])
        : [];
      const profile: MemberProfile | undefined = profileQuery?.data;
      const goals: MemberGoal[] = Array.isArray(goalsQuery?.data)
        ? (goalsQuery.data as MemberGoal[])
        : [];

      const activeLogs = useMemo(() => {
        return [...rawLogs].sort(
          (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
        );
      }, [rawLogs]);

      const heightCm = useMemo(() => {
        if (profile?.height != null && Number(profile.height) > 0) {
          return Number(profile.height);
        }
        const logWithHeight = activeLogs.find(
          (l) =>
            l.measurements &&
            typeof l.measurements.height_cm === "number" &&
            Number(l.measurements.height_cm) > 0
        );
        if (logWithHeight) {
          return Number(logWithHeight.measurements.height_cm);
        }
        return null;
      }, [profile?.height, activeLogs]);

      const activeGoal = useMemo(() => {
        return (
          goals.find(
            (g) =>
              g.status === "active" &&
              g.target_weight != null &&
              Number(g.target_weight) > 0
          ) ||
          goals.find((g) => g.status === "active") ||
          goals.find((g) => g.target_weight != null && Number(g.target_weight) > 0) ||
          goals[0] ||
          null
        );
      }, [goals]);

      const targetWeight = useMemo(() => {
        const goalWithTarget =
          goals.find(
            (g) =>
              g.status === "active" &&
              g.target_weight != null &&
              Number(g.target_weight) > 0
          ) ||
          goals.find((g) => g.target_weight != null && Number(g.target_weight) > 0);
        if (goalWithTarget?.target_weight != null) {
          return Number(goalWithTarget.target_weight);
        }
        const logWithTarget = activeLogs.find(
          (l) =>
            l.measurements &&
            l.measurements.target_weight != null &&
            Number(l.measurements.target_weight) > 0
        );
        if (logWithTarget) {
          return Number(logWithTarget.measurements.target_weight);
        }
        return null;
      }, [goals, activeLogs]);

      const weightLogs = useMemo(
        () => activeLogs.filter((l) => l.weight != null && Number(l.weight) > 0),
        [activeLogs]
      );
      const bodyFatLogs = useMemo(
        () =>
          activeLogs.filter(
            (l) => l.body_fat_percentage != null && Number(l.body_fat_percentage) > 0
          ),
        [activeLogs]
      );

      const latestWeightLog = weightLogs[0] ?? null;
      const oldestWeightLog =
        weightLogs.length > 0 ? weightLogs[weightLogs.length - 1] : null;

      const currentWeight: number | null =
        latestWeightLog?.weight != null
          ? Number(latestWeightLog.weight)
          : profile?.weight != null && Number(profile.weight) > 0
            ? Number(profile.weight)
            : null;

      const currentBmi: number | null = useMemo(() => {
        if (latestWeightLog?.bmi != null && Number(latestWeightLog.bmi) > 0) {
          return Number(Number(latestWeightLog.bmi).toFixed(1));
        }
        const fromWeightAndHeight = computeMobileBmi(currentWeight, heightCm);
        if (fromWeightAndHeight != null) {
          return fromWeightAndHeight;
        }
        const logWithBmi = activeLogs.find((l) => l.bmi != null && Number(l.bmi) > 0);
        if (logWithBmi?.bmi != null) {
          return Number(Number(logWithBmi.bmi).toFixed(1));
        }
        if (profile?.bmi != null && Number(profile.bmi) > 0) {
          return Number(Number(profile.bmi).toFixed(1));
        }
        return null;
      }, [latestWeightLog, currentWeight, heightCm, activeLogs, profile?.bmi]);

      const latestBodyFatLog = bodyFatLogs[0] ?? null;
      const currentBodyFat: number | null =
        latestBodyFatLog?.body_fat_percentage != null
          ? Number(latestBodyFatLog.body_fat_percentage)
          : null;

      const goalProgress: number = useMemo(() => {
        const latestLoggedGoalPct = activeLogs.find(
          (l) => l.goal_progress_percentage != null
        )?.goal_progress_percentage;

        if (targetWeight != null && currentWeight != null) {
          if (Math.abs(currentWeight - targetWeight) < 0.05) {
            return 100;
          }
          const startWeight =
            oldestWeightLog?.weight != null
              ? Number(oldestWeightLog.weight)
              : profile?.weight != null && Number(profile.weight) > 0
                ? Number(profile.weight)
                : null;
          if (
            startWeight != null &&
            Math.abs(startWeight - targetWeight) >= 0.05 &&
            Math.abs(startWeight - currentWeight) >= 0.05
          ) {
            const totalSpan = Math.abs(startWeight - targetWeight);
            const covered =
              targetWeight < startWeight
                ? startWeight - currentWeight
                : currentWeight - startWeight;
            return Math.round(Math.max(0, Math.min(100, (covered / totalSpan) * 100)));
          }
          if (latestLoggedGoalPct != null) {
            return Math.round(Number(latestLoggedGoalPct));
          }
          if (activeGoal?.progress_percentage != null) {
            return Math.round(Number(activeGoal.progress_percentage));
          }
          return 0;
        }

        if (latestLoggedGoalPct != null) {
          return Math.round(Number(latestLoggedGoalPct));
        }
        if (activeGoal?.progress_percentage != null) {
          return Math.round(Number(activeGoal.progress_percentage));
        }
        return 0;
      }, [targetWeight, currentWeight, oldestWeightLog, profile?.weight, activeLogs, activeGoal]);

      const bmiBadge = useMemo(() => getMobileBmiBadge(currentBmi), [currentBmi]);
      const bodyFatRangeLabel = useMemo(
        () => getMobileBodyFatRangeLabel(currentBodyFat),
        [currentBodyFat]
      );

      // Active log date badge in header
      const activeLogDateLabel = useMemo(() => {
        const refDateStr = activeLogs[0]?.logged_at;
        const dt = refDateStr ? new Date(refDateStr) : new Date();
        const validDt = !Number.isNaN(dt.getTime()) ? dt : new Date();
        return validDt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }, [activeLogs]);

      // Weight Trend Chart Data (1W, 1M, 6M, 1Y)
      const trendData = useMemo(() => {
        const nowMs = Date.now();
        const rangeDays: Record<MobileWeightTimeRange, number> = {
          "1W": 7,
          "1M": 30,
          "6M": 180,
          "1Y": 365,
        };
        const cutoffMs = nowMs - rangeDays[timeRange] * 24 * 60 * 60 * 1000;

        let inRange = weightLogs.filter((l) => {
          const t = new Date(l.logged_at).getTime();
          return Number.isFinite(t) && t >= cutoffMs;
        });

        // If no logs fall in the narrow window, fall back to available weight logs
        if (inRange.length === 0 && weightLogs.length > 0) {
          inRange = weightLogs;
        }

        const chronological = [...inRange]
          .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())
          .slice(-8);

        const rawWeights = chronological.map((l) => Number(l.weight));
        if (rawWeights.length === 0 && currentWeight != null) {
          rawWeights.push(currentWeight);
        }

        if (rawWeights.length === 0) {
          return {
            hasData: false,
            linePath: "",
            areaPath: "",
            endPoint: null as { x: number; y: number } | null,
            startWeight: null as number | null,
            nowWeight: null as number | null,
            delta: null as number | null,
          };
        }

        const minW = Math.min(...rawWeights);
        const maxW = Math.max(...rawWeights);
        const spanW = maxW - minW;

        const xStart = 12;
        const xEnd = 308;
        const yTop = 22;
        const yBottom = 86;
        const chartBaseY = 108;

        const pts = rawWeights.map((w, idx) => {
          const x =
            rawWeights.length === 1
              ? xEnd
              : Math.round(xStart + (idx / (rawWeights.length - 1)) * (xEnd - xStart));
          const y =
            spanW < 0.05
              ? Math.round((yTop + yBottom) / 2)
              : Math.round(yBottom - ((w - minW) / spanW) * (yBottom - yTop));
          return { x, y, weight: w };
        });

        const linePath = buildSmoothWeightSvgPath(pts);
        const firstX = pts.length === 1 ? 16 : pts[0].x;
        const lastPt = pts[pts.length - 1];
        const areaPath = `${linePath} L ${lastPt.x},${chartBaseY} L ${firstX},${chartBaseY} Z`;

        const startW = rawWeights[0];
        const nowW = rawWeights[rawWeights.length - 1];
        const delta = Number((nowW - startW).toFixed(1));

        return {
          hasData: true,
          linePath,
          areaPath,
          endPoint: { x: lastPt.x, y: lastPt.y },
          startWeight: startW,
          nowWeight: nowW,
          delta,
        };
      }, [weightLogs, timeRange, currentWeight]);

      const showBanner = (text: string, tone: "success" | "error" = "success") => {
        setBannerNotice({ text, tone });
        setTimeout(() => setBannerNotice(null), 3500);
      };

      const handleStepCalories = (delta: number) => {
        const currentVal = parseInt(activeCalories.trim() || "0", 10);
        const base = Number.isFinite(currentVal) ? currentVal : 0;
        const nextVal = Math.max(0, Math.min(100000, base + delta));
        setActiveCalories(String(nextVal));
      };

      const handleSaveProgressLog = () => {
        const trimmedWeight = weight.trim() || (currentWeight != null ? String(currentWeight) : "");
        const parsedWeight = Number(trimmedWeight);
        if (!trimmedWeight || !Number.isFinite(parsedWeight) || parsedWeight <= 0 || parsedWeight > 500) {
          setProgressValidation("Please enter a valid weight in kg (e.g. 62.0).");
          showBanner("Please enter a valid weight in kg (e.g. 62.0).", "error");
          return;
        }

        const trimmedBodyFat = bodyFat.trim();
        const parsedBodyFat = trimmedBodyFat ? Number(trimmedBodyFat) : null;
        if (
          parsedBodyFat != null &&
          (!Number.isFinite(parsedBodyFat) || parsedBodyFat <= 0 || parsedBodyFat >= 100)
        ) {
          setProgressValidation("Enter a valid body fat percentage (1 - 99%).");
          showBanner("Enter a valid body fat percentage (1 - 99%).", "error");
          return;
        }

        const trimmedCalories = activeCalories.trim();
        const parsedCalories = trimmedCalories ? parseInt(trimmedCalories, 10) : null;
        if (
          parsedCalories != null &&
          (!Number.isFinite(parsedCalories) || parsedCalories < 0 || parsedCalories > 100000)
        ) {
          setProgressValidation("Enter active calories between 0 and 100000 kcal.");
          showBanner("Enter active calories between 0 and 100000 kcal.", "error");
          return;
        }

        setProgressValidation(null);
        const computedBmi = computeMobileBmi(parsedWeight, heightCm);

        let computedGoalPct: number | null = null;
        if (targetWeight != null) {
          if (Math.abs(parsedWeight - targetWeight) < 0.05) {
            computedGoalPct = 100;
          } else {
            const startW =
              oldestWeightLog?.weight != null
                ? Number(oldestWeightLog.weight)
                : currentWeight ?? parsedWeight;
            const totalSpan = Math.abs(startW - targetWeight);
            if (totalSpan >= 0.05) {
              const covered =
                targetWeight < startW ? startW - parsedWeight : parsedWeight - startW;
              computedGoalPct = Math.round(Math.max(0, Math.min(100, (covered / totalSpan) * 100)));
            } else {
              computedGoalPct = 0;
            }
          }
        }

        createLog.mutate(
          {
            weight: parsedWeight,
            bmi: computedBmi,
            body_fat_percentage: parsedBodyFat,
            calories_burned: parsedCalories,
            goal_progress_percentage: computedGoalPct,
            notes: notes.trim() || null,
            measurements: heightCm != null ? { height_cm: heightCm } : {},
          },
          {
            onSuccess: () => {
              setWeight("");
              setBodyFat("");
              setActiveCalories("");
              setNotes("");
              showBanner("Progress log saved successfully!", "success");
              void query?.refetch?.();
              void profileQuery?.refetch?.();
              void goalsQuery?.refetch?.();
              if (computedGoalPct != null && activeGoal?.goal_uuid && updateGoal?.mutate) {
                updateGoal.mutate({
                  goalUuid: activeGoal.goal_uuid,
                  payload: { progress_percentage: computedGoalPct },
                });
              }
            },
            onError: (err: unknown) => {
              showBanner(getApiErrorMessage(err) || "Could not save progress log.", "error");
            },
          }
        );
      };

      const TIME_RANGES: MobileWeightTimeRange[] = ["1W", "1M", "6M", "1Y"];

      return (
        <Screen
          scroll
          keyboard
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 40,
            gap: 0,
            backgroundColor: "#000000",
          }}
          refreshControl={queryRefresh(query.isRefetching, () => {
            void query.refetch();
            void profileQuery?.refetch?.();
            void goalsQuery?.refetch?.();
          })}
        >
          {/* A. Header Bar */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "800",
                color: "#E91E63",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              HEALTH INDICATORS
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "900",
                  color: "#FFFFFF",
                  letterSpacing: -0.5,
                }}
              >
                Measurements
              </Text>

              <View
                style={{
                  backgroundColor: "#1C1C1E",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: 999,
                  paddingHorizontal: 13,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#FFFFFF" }}>
                  {activeLogDateLabel}
                </Text>
              </View>
            </View>
          </View>

          {query.isLoading && !query.data ? <LoadingSkeleton rows={4} /> : null}
          {query.error && !query.data ? (
            <ErrorState message={getApiErrorMessage(query.error)} onRetry={() => query.refetch()} />
          ) : null}

          {/* B. 2x2 Health Indicators Summary Grid */}
          <View style={{ gap: 10, marginBottom: 16 }}>
            {/* Top Row: Weight & Body Mass Index */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* 1. Weight Card */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#000000",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  padding: 14,
                  gap: 6,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Ionicons name="scale-outline" size={18} color="#E91E63" />
                  <View
                    style={{
                      backgroundColor: "rgba(233, 30, 99, 0.16)",
                      borderWidth: 1,
                      borderColor: "rgba(233, 30, 99, 0.35)",
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#E91E63" }}>
                      Profile
                    </Text>
                  </View>
                </View>

                <Text style={{ fontSize: 12, fontWeight: "600", color: "#F2F2F7" }}>
                  Weight
                </Text>

                <Text numberOfLines={1}>
                  <Text style={{ fontSize: 26, fontWeight: "900", color: "#FFFFFF" }}>
                    {currentWeight != null ? currentWeight.toFixed(1) : "--"}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#F2F2F7" }}>
                    {" kg"}
                  </Text>
                </Text>

                <Text style={{ fontSize: 11, fontWeight: "500", color: "#F2F2F7" }} numberOfLines={1}>
                  {targetWeight != null ? `Target: ${targetWeight.toFixed(1)} kg` : "No target set"}
                </Text>
              </View>

              {/* 2. Body Mass Index Card */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#000000",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  padding: 14,
                  gap: 6,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Ionicons name="medkit-outline" size={18} color="#007AFF" />
                  <View
                    style={{
                      backgroundColor: bmiBadge.bg,
                      borderWidth: 1,
                      borderColor: bmiBadge.border,
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "700", color: bmiBadge.color }}>
                      {bmiBadge.label}
                    </Text>
                  </View>
                </View>

                <Text style={{ fontSize: 12, fontWeight: "600", color: "#F2F2F7" }}>
                  Body Mass Index
                </Text>

                <Text
                  style={{
                    fontSize: 26,
                    fontWeight: "900",
                    color: currentBmi != null ? bmiBadge.color : "#F2F2F7",
                  }}
                  numberOfLines={1}
                >
                  {currentBmi != null ? currentBmi.toFixed(1) : "--"}
                </Text>

                <Text style={{ fontSize: 11, fontWeight: "500", color: "#F2F2F7" }} numberOfLines={1}>
                  Healthy: 18.5 – 24.9
                </Text>
              </View>
            </View>

            {/* Bottom Row: Goal Progress & Body Fat % */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* 3. Goal Progress Card */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#000000",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  padding: 14,
                  gap: 6,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Ionicons name="disc-outline" size={18} color="#E91E63" />
                  <View
                    style={{
                      backgroundColor: "rgba(233, 30, 99, 0.16)",
                      borderWidth: 1,
                      borderColor: "rgba(233, 30, 99, 0.35)",
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#E91E63" }}>
                      {activeGoal?.status === "paused" ? "Paused" : "Active"}
                    </Text>
                  </View>
                </View>

                <Text style={{ fontSize: 12, fontWeight: "600", color: "#F2F2F7" }}>
                  Goal Progress
                </Text>

                <Text style={{ fontSize: 26, fontWeight: "900", color: "#FFFFFF" }} numberOfLines={1}>
                  {`${goalProgress}%`}
                </Text>

                <Text style={{ fontSize: 11, fontWeight: "500", color: "#F2F2F7" }} numberOfLines={1}>
                  {activeGoal?.goal_name?.trim() ? activeGoal.goal_name : "Target Weight Deficit"}
                </Text>
              </View>

              {/* 4. Body Fat % Card */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#000000",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  padding: 14,
                  gap: 6,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Ionicons name="stats-chart" size={16} color="#007AFF" />
                  <View
                    style={{
                      backgroundColor: "rgba(0, 122, 255, 0.16)",
                      borderWidth: 1,
                      borderColor: "rgba(0, 122, 255, 0.35)",
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#007AFF" }}>
                      Sensor
                    </Text>
                  </View>
                </View>

                <Text style={{ fontSize: 12, fontWeight: "600", color: "#F2F2F7" }}>
                  Body Fat %
                </Text>

                <Text style={{ fontSize: 26, fontWeight: "900", color: "#007AFF" }} numberOfLines={1}>
                  {currentBodyFat != null ? `${currentBodyFat.toFixed(1)}%` : "--%"}
                </Text>

                <Text style={{ fontSize: 11, fontWeight: "500", color: "#F2F2F7" }} numberOfLines={1}>
                  {bodyFatRangeLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* C. Log Progress & Metrics Form Card */}
          <View
            style={{
              backgroundColor: "#000000",
              borderRadius: 22,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.08)",
              padding: 16,
              gap: 14,
              marginBottom: 16,
            }}
          >
            {/* Card Header */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="create-outline" size={18} color="#E91E63" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#FFFFFF" }}>
                  Log Progress & Metrics
                </Text>
                <Text style={{ fontSize: 12, color: "#F2F2F7" }}>
                  {"Record today's metrics & fitness notes"}
                </Text>
              </View>
            </View>

            {/* 1. Active Calories Burned (kcal) */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#F2F2F7" }}>
                Active Calories Burned (kcal)
              </Text>
              <View
                style={{
                  backgroundColor: "#000000",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  flexDirection: "row",
                  alignItems: "center",
                  paddingLeft: 14,
                  paddingRight: 8,
                }}
              >
                <TextInput
                  accessibilityLabel="Active Calories Burned (kcal)"
                  value={activeCalories}
                  onChangeText={setActiveCalories}
                  placeholder="Enter calories burned (optional)"
                  placeholderTextColor="#F2F2F7"
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    paddingVertical: 11,
                    fontSize: 14,
                    color: "#FFFFFF",
                  }}
                />
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 4,
                    width: 18,
                    height: 22,
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 1,
                  }}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Increase calories"
                    onPress={() => handleStepCalories(10)}
                    hitSlop={4}
                  >
                    <Ionicons name="caret-up" size={10} color="#007AFF" />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Decrease calories"
                    onPress={() => handleStepCalories(-10)}
                    hitSlop={4}
                  >
                    <Ionicons name="caret-down" size={10} color="#007AFF" />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* 2. Two-Column Row: Weight (kg) * & % Body Fat (%) */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#F2F2F7" }}>
                  Weight (kg) *
                </Text>
                <TextInput
                  accessibilityLabel="Weight in kg"
                  value={weight}
                  onChangeText={setWeight}
                  placeholder={currentWeight != null ? currentWeight.toFixed(1) : "62.0"}
                  placeholderTextColor="#FFFFFF"
                  keyboardType="decimal-pad"
                  style={{
                    backgroundColor: "#000000",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    paddingHorizontal: 14,
                    paddingVertical: 11,
                    fontSize: 14,
                    color: "#FFFFFF",
                  }}
                />
              </View>

              <View style={{ flex: 1, gap: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#F2F2F7" }}>
                  % Body Fat (%)
                </Text>
                <TextInput
                  accessibilityLabel="Body Fat percentage"
                  value={bodyFat}
                  onChangeText={setBodyFat}
                  placeholder="Optional (%)"
                  placeholderTextColor="#F2F2F7"
                  keyboardType="decimal-pad"
                  style={{
                    backgroundColor: "#000000",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    paddingHorizontal: 14,
                    paddingVertical: 11,
                    fontSize: 14,
                    color: "#FFFFFF",
                  }}
                />
              </View>
            </View>

            {/* 3. Daily Notes / Goals */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#F2F2F7" }}>
                Daily Notes / Goals
              </Text>
              <TextInput
                accessibilityLabel="Daily Notes and Goals"
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Felt strong today, stuck to calorie targets..."
                placeholderTextColor="#F2F2F7"
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: "#000000",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  minHeight: 74,
                  textAlignVertical: "top",
                  fontSize: 14,
                  color: "#FFFFFF",
                }}
              />
            </View>

            {/* Validation / Banner Notice */}
            {bannerNotice || progressValidation ? (
              <View
                style={{
                  backgroundColor:
                    bannerNotice?.tone === "success"
                      ? "rgba(52, 199, 89, 0.14)"
                      : "rgba(233, 30, 99, 0.14)",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor:
                    bannerNotice?.tone === "success"
                      ? "rgba(52, 199, 89, 0.35)"
                      : "rgba(233, 30, 99, 0.35)",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: bannerNotice?.tone === "success" ? "#34C759" : "#E91E63",
                  }}
                >
                  {bannerNotice?.text ?? progressValidation}
                </Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save Progress Log"
              onPress={handleSaveProgressLog}
              disabled={createLog.isPending}
              style={({ pressed }) => [
                {
                  backgroundColor: "#E91E63",
                  borderRadius: 14,
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  shadowColor: "#E91E63",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 10,
                  elevation: 4,
                },
                pressed && { opacity: 0.85 },
                createLog.isPending && { opacity: 0.6 },
              ]}
            >
              <Ionicons name="save-outline" size={16} color="#FFFFFF" />
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>
                {createLog.isPending ? "Saving..." : "Save Progress Log"}
              </Text>
            </Pressable>
          </View>

          {/* D. Weight Trend Card */}
          <View
            style={{
              backgroundColor: "#000000",
              borderRadius: 22,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.08)",
              padding: 16,
              gap: 14,
            }}
          >
            {/* Header & Time Range Filter Pills */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#FFFFFF" }}>
                Weight Trend
              </Text>

              <View
                style={{
                  backgroundColor: "#000000",
                  borderRadius: 10,
                  padding: 3,
                  flexDirection: "row",
                  gap: 2,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.06)",
                }}
              >
                {TIME_RANGES.map((range) => {
                  const isSelected = timeRange === range;
                  return (
                    <Pressable
                      key={range}
                      accessibilityRole="tab"
                      accessibilityLabel={`Weight trend ${range}`}
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setTimeRange(range)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 7,
                        backgroundColor: isSelected ? "#1C1C1E" : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: isSelected ? "800" : "600",
                          color: isSelected ? "#FFFFFF" : "#F2F2F7",
                        }}
                      >
                        {range}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Trend Line Graph */}
            {trendData.hasData ? (
              <View style={{ height: 116, width: "100%", marginTop: 4 }}>
                <Svg width="100%" height={116} viewBox="0 0 320 116" preserveAspectRatio="none">
                  <Defs>
                    <SvgGradient id="mobileWeightGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#E91E63" stopOpacity={0.38} />
                      <Stop offset="100%" stopColor="#E91E63" stopOpacity={0.0} />
                    </SvgGradient>
                  </Defs>
                  <Path d={trendData.areaPath} fill="url(#mobileWeightGrad)" />
                  <Path
                    d={trendData.linePath}
                    fill="none"
                    stroke="#E91E63"
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                  {trendData.endPoint ? (
                    <Circle
                      cx={trendData.endPoint.x}
                      cy={trendData.endPoint.y}
                      r={5}
                      fill="#E91E63"
                      stroke="#FFFFFF"
                      strokeWidth={2.5}
                    />
                  ) : null}
                </Svg>
              </View>
            ) : (
              <View
                style={{
                  height: 96,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#000000",
                  borderRadius: 14,
                }}
              >
                <Text style={{ fontSize: 12, color: "#F2F2F7", fontWeight: "600" }}>
                  Log your weight above to start tracking your trend line.
                </Text>
              </View>
            )}

            {/* Footer Summary Row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 2,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#F2F2F7" }}>
                {`Start: ${trendData.startWeight != null ? `${trendData.startWeight.toFixed(1)} kg` : "--"}`}
              </Text>

              <Text style={{ fontSize: 12, fontWeight: "800", color: "#34C759" }}>
                {trendData.delta != null
                  ? `${trendData.delta > 0 ? `+${trendData.delta.toFixed(1)}` : trendData.delta.toFixed(1)} kg overall`
                  : "0.0 kg overall"}
              </Text>

              <Text style={{ fontSize: 12, fontWeight: "600", color: "#F2F2F7" }}>
                {`Now: ${trendData.nowWeight != null ? `${trendData.nowWeight.toFixed(1)} kg` : "--"}`}
              </Text>
            </View>
          </View>
        </Screen>
      );
    }
  }
}

export function MemberTrainerScreenView({ model }: { model: ReturnType<typeof useMemberTrainerScreenPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  const [activeTab, setActiveTab] = useState<"plans" | "schedule" | "review">("plans");
  const [planFilter, setPlanFilter] = useState<"all" | "workouts" | "dietary">("all");

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;

  switch (model.kind) {
    case "view1": {
      const {
        styles,
        queryRefresh,
        query,
        workoutsQuery,
        mealsQuery,
        dashboardQuery,
        profileQuery,
        notificationsQuery,
        attendanceQuery,
        user,
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
        profileQuery?.data?.trainer_name ||
        "Trainer Rohit";
      const trainerName = assignedTrainerName;
      const trainerDisplayName = trainerName.toLowerCase().startsWith("trainer")
        ? `Coach ${trainerName.replace(/^Trainer\s+/i, "")}`
        : `Coach ${trainerName}`;
      const trainerRole =
        query.data?.role ||
        (query.data?.specialization?.length ? query.data.specialization[0] : "Head Strength Coach");
      const trainerTagRole = trainerRole.toLowerCase().includes("coach")
        ? trainerRole
        : `${trainerRole} Coach`;
      const trainerPhoto = query.data?.trainer_photo;
      const trainerEmail = query.data?.email || "raskarmaheshvip@gmail.com";
      const trainerPhone = query.data?.phone || "+91 98765-43210";

      // Clean qualifications & experience tags (eliminate duplicate tokens)
      const rawList =
        query.data?.qualifications && query.data.qualifications.length > 0
          ? query.data.qualifications
          : (query.data?.specialization && query.data.specialization.length > 1
              ? query.data.specialization.slice(1)
              : ["Certified Master Trainer", "6+ Yrs Exp"]);

      const seen = new Set<string>();
      const cleanQualifications: string[] = [];
      for (const item of rawList) {
        if (!item) continue;
        const parts = item.split(/[•|]/).map((p: string) => p.trim()).filter(Boolean);
        for (const part of parts) {
          const lower = part.toLowerCase();
          if (!seen.has(lower) && lower !== trainerRole.toLowerCase() && lower !== trainerTagRole.toLowerCase()) {
            seen.add(lower);
            cleanQualifications.push(part);
          }
        }
      }
      const credentialsText =
        cleanQualifications.length > 0
          ? cleanQualifications.join(" • ")
          : "Certified Master Trainer • 6+ Yrs Exp";

      // Dynamic calculated trainer metrics
      const trainerRating = query.data?.average_rating ?? 0.0;
      const totalReviews = query.data?.total_reviews ?? 0;
      const activeClients = query.data?.active_clients ?? 0;

      // Logged in member initials
      const memberName =
        profileQuery?.data?.member_name ||
        user?.full_name ||
        "Mahesh";
      const memberInitials = (memberName
        .split(" ")
        .filter(Boolean)
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("") || "GR").toUpperCase();

      const trainerInitials = (trainerName
        .split(" ")
        .filter(Boolean)
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("") || "TR").toUpperCase();

      // Unread notifications
      const unreadCount = (notificationsQuery?.data ?? []).length;

      // Action Handlers
      const handleChat = () => navigation.navigate("MemberSupport");
      const handleCall = () => {
        if (trainerPhone) Linking.openURL(`tel:${trainerPhone.replace(/\s+/g, "")}`).catch(() => {});
      };
      const handleVideo = () => {
        if (trainerPhone || trainerEmail) {
          const contact = (trainerPhone || trainerEmail || "").replace(/\s+/g, "");
          Linking.openURL(`facetime:${contact}`).catch(() => navigation.navigate("MemberSupport"));
        } else {
          navigation.navigate("MemberSupport");
        }
      };
      const handleBookSlot = () => {
        setActiveTab("schedule");
      };

      // Assigned Plans Modeling
      type MobilePlanItem = {
        id: string;
        title: string;
        kind: "workout" | "diet";
        category: string;
        icon: keyof typeof Ionicons.glyphMap;
        iconColor: string;
        iconBg: string;
        tagColor: string;
        tagBg: string;
        tagBorder: string;
        description: string;
        rightBadge?: string;
        rightBadgeColor?: string;
        route: string;
      };

      const realWorkouts: MobilePlanItem[] = (workoutsQuery?.data ?? []).map((w: any, i: number) => {
        const estNum = w.today_workout?.estimated_duration_minutes ?? (w.sessions?.length ? w.sessions.length * 8 : 48);
        const isDone = w.completion_status?.toLowerCase() === "completed";
        const consistencyText = w.weekly_consistency > 0 ? `${Math.round(w.weekly_consistency)}% completed` : (isDone ? "100% completed" : "40% completed");
        const titleLower = (w.workout_plan_name || "").toLowerCase();
        let cat = isDone ? "COMPLETED" : "PROGRESSIVE";
        let icon: keyof typeof Ionicons.glyphMap = "barbell-outline";
        let iconColor = "#E91E63";
        let iconBg = "rgba(233, 30, 99, 0.15)";
        let tagColor = "#007AFF";
        let tagBg = "rgba(0, 122, 255, 0.12)";
        let tagBorder = "rgba(0, 122, 255, 0.25)";

        if (isDone) {
          tagColor = "#34C759";
          tagBg = "rgba(52, 199, 89, 0.14)";
          tagBorder = "rgba(52, 199, 89, 0.25)";
        } else if (titleLower.includes("cardio") || titleLower.includes("weight loss") || titleLower.includes("run")) {
          cat = "CARDIO";
          icon = "flame-outline";
          iconColor = "#007AFF";
          iconBg = "rgba(0, 122, 255, 0.15)";
          tagColor = "#007AFF";
          tagBg = "rgba(0, 122, 255, 0.12)";
          tagBorder = "rgba(0, 122, 255, 0.25)";
        }

        return {
          id: w.workout_plan_uuid || `workout-${i}`,
          title: w.workout_plan_name,
          kind: "workout",
          category: cat,
          icon,
          iconColor,
          iconBg,
          tagColor,
          tagBg,
          tagBorder,
          description: `${estNum} Mins • ${consistencyText}`,
          rightBadge: w.level ? `Level ${w.level.replace(/^level\s*/i, "")}` : "Level 1",
          rightBadgeColor: "#F2F2F7",
          route: "MemberWorkout",
        };
      });

      const realMeals: MobilePlanItem[] = (mealsQuery?.data ?? []).map((m: any, i: number) => {
        const isDone = m.completion_status?.toLowerCase() === "completed";
        const titleLower = (m.meal_plan_name || "").toLowerCase();
        let cat = "DIETARY";
        let icon: keyof typeof Ionicons.glyphMap = "restaurant-outline";
        let iconColor = "#E91E63";
        let iconBg = "rgba(233, 30, 99, 0.15)";
        let tagColor = "#E91E63";
        let tagBg = "rgba(233, 30, 99, 0.12)";
        let tagBorder = "rgba(233, 30, 99, 0.25)";
        let kcalColor = "#E91E63";

        if (isDone) {
          cat = "APPROVED";
          icon = "shield-checkmark-outline";
          iconColor = "#34C759";
          iconBg = "rgba(52, 199, 89, 0.15)";
          tagColor = "#34C759";
          tagBg = "rgba(52, 199, 89, 0.14)";
          tagBorder = "rgba(52, 199, 89, 0.25)";
          kcalColor = "#34C759";
        } else if (titleLower.includes("gain") || titleLower.includes("muscle") || titleLower.includes("bulk") || titleLower.includes("hypertrophy")) {
          cat = "PROGRESSIVE";
          icon = "flash-outline";
          iconColor = "#007AFF";
          iconBg = "rgba(0, 122, 255, 0.15)";
          tagColor = "#007AFF";
          tagBg = "rgba(0, 122, 255, 0.12)";
          tagBorder = "rgba(0, 122, 255, 0.25)";
          kcalColor = "#007AFF";
        } else if (titleLower.includes("loss") || titleLower.includes("cardio") || titleLower.includes("cut") || titleLower.includes("deficit")) {
          cat = "CARDIO";
          icon = "flame-outline";
          iconColor = "#007AFF";
          iconBg = "rgba(0, 122, 255, 0.15)";
          tagColor = "#007AFF";
          tagBg = "rgba(0, 122, 255, 0.12)";
          tagBorder = "rgba(0, 122, 255, 0.25)";
          kcalColor = "#007AFF";
        } else if (titleLower.includes("medic") || titleLower.includes("wellness") || titleLower.includes("recovery")) {
          cat = "APPROVED";
          icon = "shield-checkmark-outline";
          iconColor = "#34C759";
          iconBg = "rgba(52, 199, 89, 0.15)";
          tagColor = "#34C759";
          tagBg = "rgba(52, 199, 89, 0.14)";
          tagBorder = "rgba(52, 199, 89, 0.25)";
          kcalColor = "#34C759";
        }

        const desc = m.trainer_notes?.trim()
          ? m.trainer_notes
          : m.meals?.length
          ? `${m.meals.length} nutritional expenditure items`
          : "Recovery & lean muscle synthesis";

        return {
          id: m.meal_plan_uuid || `meal-${i}`,
          title: m.meal_plan_name,
          kind: "diet",
          category: cat,
          icon,
          iconColor,
          iconBg,
          tagColor,
          tagBg,
          tagBorder,
          description: desc,
          rightBadge: m.calories_per_day ? `${Number(m.calories_per_day).toLocaleString()} kcal` : "Custom kcal",
          rightBadgeColor: kcalColor,
          route: "MemberMealPlan",
        };
      });

      const allPlans = [...realWorkouts, ...realMeals];
      const filteredPlans = planFilter === "all"
        ? allPlans
        : planFilter === "workouts"
        ? realWorkouts
        : realMeals;

      // Schedule & Location Data
      const gymName = user?.gym_name || profileQuery?.data?.gym_name || "ZD Fitness Moshi";
      const pastSessionsCount = attendanceQuery?.data?.history?.length ?? attendanceQuery?.data?.monthly_attendance_count ?? 4;
      const rawSlot = query.data?.next_available_slot || "Today at 04:30 PM (Gym Floor)";
      const nextAvailableSlotText = rawSlot.replace(/^Next Available Slot:\s*/i, "");

      const getRatingLabel = (val: number) => {
        if (val >= 5) return "Excellent";
        if (val >= 4) return "Very Good";
        if (val >= 3) return "Good";
        if (val >= 2) return "Fair";
        return "Needs Improvement";
      };

      return (
        <Screen
          scroll
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 40,
            gap: 0,
            backgroundColor: "#000000",
          }}
          refreshControl={queryRefresh(query.isRefetching, () => {
            void query.refetch();
            void workoutsQuery?.refetch();
            void mealsQuery?.refetch();
            void feedbackQuery?.refetch();
            void attendanceQuery?.refetch();
          })}
        >
          {/* Top Pill Bar: Dynamic App Brand Indicator PulseFit */}
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <View
              style={{
                backgroundColor: "#1C1C1E",
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 5,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.08)",
              }}
            >
              <AppLogo size={16} chromeless />
              <Text style={{ fontSize: 12, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.3 }}>
                PulseFit
              </Text>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#34C759" }} />
            </View>
          </View>

          {/* Subheader Bar (ONLY Subheader Text + Bell + User Badge - NO Settings Gear!) */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "800",
                color: "#E91E63",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                flex: 1,
              }}
              numberOfLines={1}
            >
              {`COACH ${trainerName.replace(/^Trainer\s+/i, "")} • ${trainerRole}`}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                onPress={() => navigation.navigate("MemberNotifications")}
                style={{ position: "relative" }}
              >
                <Ionicons name="notifications-outline" size={22} color="#F2F2F7" />
                {unreadCount > 0 ? (
                  <View
                    style={{
                      position: "absolute",
                      top: -1,
                      right: -1,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#FF3B30",
                      borderWidth: 1.5,
                      borderColor: "#000000",
                    }}
                  />
                ) : null}
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Profile"
                onPress={() => navigation.navigate("MemberProfileHome")}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#E91E63",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "800", color: "#FFFFFF" }}>{memberInitials}</Text>
              </Pressable>
            </View>
          </View>

          {/* Title Block */}
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 11, fontWeight: "800", color: "#E91E63", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>
              CERTIFIED PERSONAL COACH
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 28, fontWeight: "900", color: "#FFFFFF", letterSpacing: -0.5 }}>
                {trainerName}
              </Text>
              <View
                style={{
                  backgroundColor: "rgba(52, 199, 89, 0.15)",
                  borderWidth: 1,
                  borderColor: "rgba(52, 199, 89, 0.3)",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#34C759" }} />
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#34C759" }}>
                  On Duty Today
                </Text>
              </View>
            </View>
          </View>

          {query.isLoading && !query.data ? <LoadingSkeleton rows={4} /> : null}
          {query.error && !query.data ? (
            <ErrorState message={getApiErrorMessage(query.error)} onRetry={() => query.refetch()} />
          ) : null}

          {!query.isLoading && !query.error && !query.data ? (
            <EmptyState
              title="No trainer assigned"
              message="Your assigned trainer will appear once your gym links one to your profile."
              icon="person-outline"
            />
          ) : null}

          {query.data ? (
            <>
              {/* Profile Summary Card */}
              <View
                style={{
                  backgroundColor: "#000000",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  padding: 16,
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <View style={{ position: "relative", width: 68, height: 68, borderRadius: 18 }}>
                    {trainerPhoto ? (
                      <Image
                        source={{ uri: trainerPhoto }}
                        style={{ width: 68, height: 68, borderRadius: 18, backgroundColor: "#1C1C1E" }}
                        accessibilityLabel={trainerName}
                      />
                    ) : (
                      <View
                        style={{
                          width: 68,
                          height: 68,
                          borderRadius: 18,
                          backgroundColor: "#E91E63",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ fontSize: 22, fontWeight: "900", color: "#FFFFFF" }}>{trainerInitials}</Text>
                      </View>
                    )}
                    <View
                      style={{
                        position: "absolute",
                        bottom: -2,
                        right: -2,
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: "#34C759",
                        borderWidth: 2.5,
                        borderColor: "#000000",
                      }}
                    />
                  </View>

                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <Text style={{ fontSize: 17, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.2 }}>
                        {trainerDisplayName}
                      </Text>
                      <View
                        style={{
                          backgroundColor: "rgba(255, 59, 48, 0.15)",
                          borderWidth: 1,
                          borderColor: "rgba(255, 59, 48, 0.3)",
                          borderRadius: 999,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: "700", color: "#E91E63" }}>
                          {trainerRole.toLowerCase().includes("head") ? "Head Coach" : trainerRole}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ fontSize: 12, fontWeight: "500", color: "#F2F2F7" }} numberOfLines={1}>
                      {credentialsText}
                    </Text>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <Ionicons name="star" size={13} color="#E91E63" />
                      <Text style={{ fontSize: 13, fontWeight: "800", color: "#E91E63" }}>
                        {trainerRating.toFixed(1)}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#F2F2F7" }}>
                        {`(${totalReviews})`}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#F2F2F7" }}>•</Text>
                      <Text style={{ fontSize: 12, color: "#F2F2F7" }}>
                        {`${activeClients} Active Clients`}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 4 Action Buttons Grid */}
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Chat with Trainer"
                    onPress={handleChat}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        height: 60,
                        backgroundColor: "#1C1C1E",
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "rgba(255, 255, 255, 0.08)",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 3,
                      },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Ionicons name="chatbubble-outline" size={17} color="#F2F2F7" />
                    <Text style={{ fontSize: 11, fontWeight: "600", color: "#F2F2F7" }}>Chat</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Call Trainer"
                    onPress={handleCall}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        height: 60,
                        backgroundColor: "#1C1C1E",
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "rgba(255, 255, 255, 0.08)",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 3,
                      },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Ionicons name="call-outline" size={17} color="#34C759" />
                    <Text style={{ fontSize: 11, fontWeight: "600", color: "#F2F2F7" }}>Call</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Video Call"
                    onPress={handleVideo}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        height: 60,
                        backgroundColor: "#1C1C1E",
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "rgba(255, 255, 255, 0.08)",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 3,
                      },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Ionicons name="videocam-outline" size={17} color="#007AFF" />
                    <Text style={{ fontSize: 11, fontWeight: "600", color: "#F2F2F7" }}>Video</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Book Slot"
                    onPress={handleBookSlot}
                    style={({ pressed }) => [
                      {
                        flex: 1.3,
                        height: 60,
                        backgroundColor: "rgba(0, 122, 255, 0.18)",
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "#007AFF",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 3,
                      },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Ionicons name="calendar-outline" size={17} color="#007AFF" />
                    <Text style={{ fontSize: 11, fontWeight: "800", color: "#007AFF" }}>Book Slot</Text>
                  </Pressable>
                </View>
              </View>

              {/* Segmented Tab Switcher */}
              <View
                style={{
                  backgroundColor: "#000000",
                  borderRadius: 14,
                  padding: 4,
                  flexDirection: "row",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.06)",
                  marginBottom: 16,
                  gap: 4,
                }}
              >
                <Pressable
                  accessibilityRole="tab"
                  accessibilityLabel="Plans Tab"
                  accessibilityState={{ selected: activeTab === "plans" }}
                  onPress={() => setActiveTab("plans")}
                  style={{
                    flex: 1,
                    paddingVertical: 9,
                    borderRadius: 10,
                    backgroundColor: activeTab === "plans" ? "#1C1C1E" : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: activeTab === "plans" ? "800" : "600",
                      color: activeTab === "plans" ? "#FFFFFF" : "#F2F2F7",
                    }}
                  >
                    {`Plans (${allPlans.length})`}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="tab"
                  accessibilityLabel="Schedule Tab"
                  accessibilityState={{ selected: activeTab === "schedule" }}
                  onPress={() => setActiveTab("schedule")}
                  style={{
                    flex: 1,
                    paddingVertical: 9,
                    borderRadius: 10,
                    backgroundColor: activeTab === "schedule" ? "#1C1C1E" : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: activeTab === "schedule" ? "800" : "600",
                      color: activeTab === "schedule" ? "#FFFFFF" : "#F2F2F7",
                    }}
                  >
                    Schedule
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="tab"
                  accessibilityLabel="Review Tab"
                  accessibilityState={{ selected: activeTab === "review" }}
                  onPress={() => setActiveTab("review")}
                  style={{
                    flex: 1,
                    paddingVertical: 9,
                    borderRadius: 10,
                    backgroundColor: activeTab === "review" ? "#1C1C1E" : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: activeTab === "review" ? "800" : "600",
                      color: activeTab === "review" ? "#FFFFFF" : "#F2F2F7",
                    }}
                  >
                    {`Review (${trainerRating.toFixed(1)} ★)`}
                  </Text>
                </Pressable>
              </View>

              {/* TAB CONTENT 1: PLANS */}
              {activeTab === "plans" ? (
                <View style={{ gap: 12 }}>
                  {/* Filter Pills */}
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setPlanFilter("all")}
                      style={{
                        backgroundColor: planFilter === "all" ? "#E91E63" : "#1C1C1E",
                        borderRadius: 16,
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                        borderWidth: planFilter === "all" ? 0 : 1,
                        borderColor: "rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "700", color: planFilter === "all" ? "#FFFFFF" : "#F2F2F7" }}>
                        {`All Plans (${allPlans.length})`}
                      </Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setPlanFilter("workouts")}
                      style={{
                        backgroundColor: planFilter === "workouts" ? "#E91E63" : "#1C1C1E",
                        borderRadius: 16,
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                        borderWidth: planFilter === "workouts" ? 0 : 1,
                        borderColor: "rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "700", color: planFilter === "workouts" ? "#FFFFFF" : "#F2F2F7" }}>
                        Workouts
                      </Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setPlanFilter("dietary")}
                      style={{
                        backgroundColor: planFilter === "dietary" ? "#E91E63" : "#1C1C1E",
                        borderRadius: 16,
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                        borderWidth: planFilter === "dietary" ? 0 : 1,
                        borderColor: "rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "700", color: planFilter === "dietary" ? "#FFFFFF" : "#F2F2F7" }}>
                        Dietary
                      </Text>
                    </Pressable>
                  </View>

                  {/* Vertical Plan List Card Grid */}
                  {filteredPlans.length === 0 ? (
                    <View
                      style={{
                        backgroundColor: "#000000",
                        borderRadius: 16,
                        padding: 24,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: "rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <Ionicons name="folder-open-outline" size={32} color="#F2F2F7" />
                      <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700", marginTop: 8 }}>
                        No plans found
                      </Text>
                    </View>
                  ) : (
                    <View style={{ gap: 8 }}>
                      {filteredPlans.map((plan) => (
                        <Pressable
                          key={plan.id}
                          accessibilityRole="button"
                          accessibilityLabel={`${plan.title} - ${plan.category}`}
                          onPress={() => navigation.navigate(plan.route)}
                          style={({ pressed }) => [
                            {
                              backgroundColor: "#000000",
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: "rgba(255, 255, 255, 0.08)",
                              padding: 12,
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 12,
                            },
                            pressed && { opacity: 0.85 },
                          ]}
                        >
                          <View
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 10,
                              backgroundColor: plan.iconBg,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Ionicons name={plan.icon} size={18} color={plan.iconColor} />
                          </View>

                          <View style={{ flex: 1, gap: 3 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>
                                {plan.title}
                              </Text>
                              <View
                                style={{
                                  backgroundColor: plan.tagBg,
                                  borderWidth: 1,
                                  borderColor: plan.tagBorder,
                                  borderRadius: 6,
                                  paddingHorizontal: 6,
                                  paddingVertical: 2,
                                }}
                              >
                                <Text style={{ fontSize: 9, fontWeight: "800", color: plan.tagColor }}>
                                  {plan.category}
                                </Text>
                              </View>
                            </View>

                            <Text style={{ fontSize: 11, color: "#F2F2F7" }} numberOfLines={1}>
                              {plan.description}
                            </Text>
                          </View>

                          {plan.rightBadge ? (
                            <Text style={{ fontSize: 12, fontWeight: "700", color: plan.rightBadgeColor || "#F2F2F7" }}>
                              {plan.rightBadge}
                            </Text>
                          ) : null}
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              ) : null}

              {/* TAB CONTENT 2: SCHEDULE */}
              {activeTab === "schedule" ? (
                <View style={{ gap: 12 }}>
                  {/* Next Available Floor Slot Banner */}
                  <View
                    style={{
                      backgroundColor: "#007AFF",
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: "rgba(0, 122, 255, 0.4)",
                      padding: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontSize: 10, fontWeight: "800", color: "#007AFF", letterSpacing: 0.6 }}>
                        NEXT AVAILABLE FLOOR SLOT
                      </Text>
                      <Text style={{ fontSize: 15, fontWeight: "800", color: "#FFFFFF" }} numberOfLines={1}>
                        {nextAvailableSlotText}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#F2F2F7" }}>
                        1-on-1 Personal Training Session
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Book Slot Now"
                      onPress={() =>
                        navigation.navigate("MemberWorkout", {
                          tab: "classes",
                        })
                      }
                      style={({ pressed }) => [
                        {
                          backgroundColor: "#007AFF",
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                        },
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "800", color: "#FFFFFF" }}>Book Now</Text>
                    </Pressable>
                  </View>

                  {/* Weekly Working Hours Card */}
                  <View
                    style={{
                      backgroundColor: "#000000",
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.08)",
                      padding: 14,
                      gap: 12,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>
                        Weekly Working Hours
                      </Text>
                      <Text style={{ fontSize: 12, color: "#F2F2F7" }}>
                        {gymName}
                      </Text>
                    </View>

                    {/* Condensed 3-Column Day Schedule Pills */}
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {/* Mon-Fri */}
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: "#1C1C1E",
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: "rgba(233, 30, 99, 0.3)",
                          padding: 10,
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: "800", color: "#E91E63" }}>MON-FRI</Text>
                        <Text style={{ fontSize: 10, fontWeight: "700", color: "#FFFFFF" }}>06:00-20:00</Text>
                        <Text style={{ fontSize: 9, color: "#F2F2F7" }}>Morning & Eve</Text>
                      </View>

                      {/* Sat */}
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: "#1C1C1E",
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: "rgba(233, 30, 99, 0.25)",
                          padding: 10,
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: "800", color: "#E91E63" }}>SAT</Text>
                        <Text style={{ fontSize: 10, fontWeight: "700", color: "#E91E63" }}>07:00-18:00</Text>
                        <Text style={{ fontSize: 9, color: "#F2F2F7" }}>Half Day</Text>
                      </View>

                      {/* Sun */}
                      <View
                        style={{
                          flex: 1.3,
                          backgroundColor: "#1C1C1E",
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: "rgba(255, 255, 255, 0.06)",
                          padding: 10,
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: "800", color: "#F2F2F7" }}>SUN</Text>
                        <Text style={{ fontSize: 10, fontWeight: "600", color: "#F2F2F7" }}>Off Duty (Rest Day)</Text>
                        <Text style={{ fontSize: 9, color: "#F2F2F7" }}>Recovery</Text>
                      </View>
                    </View>
                  </View>

                  {/* Past Sessions Link */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="View Past Sessions"
                    onPress={() => navigation.navigate("MemberAttendance")}
                    style={({ pressed }) => [
                      {
                        backgroundColor: "#1C1C1E",
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "rgba(255, 255, 255, 0.08)",
                        height: 46,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Ionicons name="time-outline" size={16} color="#007AFF" />
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>
                      {`View ${pastSessionsCount} Past Completed Sessions`}
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              {/* TAB CONTENT 3: REVIEW */}
              {activeTab === "review" ? (
                <View
                  style={{
                    backgroundColor: "#000000",
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    padding: 16,
                    gap: 14,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontSize: 16, fontWeight: "800", color: "#FFFFFF" }}>
                        {`Rate ${trainerName}`}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#F2F2F7" }}>
                        Anonymous review for coach optimization
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: "rgba(233, 30, 99, 0.15)",
                        borderWidth: 1,
                        borderColor: "rgba(233, 30, 99, 0.3)",
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "800", color: "#E91E63" }}>
                        {`${rating.toFixed(1)} ${getRatingLabel(rating)}`}
                      </Text>
                    </View>
                  </View>

                  {/* 5-Star Selector */}
                  <View style={{ flexDirection: "row", gap: 6, marginVertical: 4 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Pressable
                        key={star}
                        accessibilityRole="button"
                        accessibilityLabel={`Rate ${star} stars`}
                        onPress={() => setRating(star)}
                      >
                        <Ionicons
                          name={star <= rating ? "star" : "star-outline"}
                          size={26}
                          color={star <= rating ? "#E91E63" : "rgba(255, 255, 255, 0.2)"}
                        />
                      </Pressable>
                    ))}
                  </View>

                  {/* Feedback Pills */}
                  <View style={{ gap: 8 }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#F2F2F7" }}>
                      What went particularly well?
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      {[
                        "Motivating and encouraging",
                        "Knowledgeable and helpful",
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
                              {
                                backgroundColor: isSelected ? "rgba(233, 30, 99, 0.15)" : "#1C1C1E",
                                borderWidth: 1,
                                borderColor: isSelected ? "#E91E63" : "rgba(255, 255, 255, 0.08)",
                                borderRadius: 16,
                                paddingHorizontal: 12,
                                paddingVertical: 7,
                              },
                              pressed && { opacity: 0.8 },
                            ]}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: isSelected ? "700" : "500",
                                color: isSelected ? "#E91E63" : "#F2F2F7",
                              }}
                            >
                              {opt}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Review Textarea */}
                  <TextInput
                    value={customFeedback}
                    onChangeText={setCustomFeedback}
                    placeholder="Great coach! Highly recommend."
                    placeholderTextColor="#F2F2F7"
                    multiline
                    style={{
                      backgroundColor: "#1C1C1E",
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.08)",
                      padding: 12,
                      color: "#FFFFFF",
                      fontSize: 13,
                      minHeight: 84,
                      textAlignVertical: "top",
                    }}
                  />

                  {saveFeedback.error ? (
                    <NoticeBanner tone="error" message={getApiErrorMessage(saveFeedback.error)} />
                  ) : saveFeedback.isSuccess ? (
                    <NoticeBanner tone="success" message="Thank you! Your review has been saved." />
                  ) : null}

                  {/* Submit Button */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Update Review"
                    onPress={submitFeedback}
                    disabled={saveFeedback.isPending}
                    style={({ pressed }) => [
                      {
                        backgroundColor: "#E91E63",
                        height: 48,
                        borderRadius: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        shadowColor: "#E91E63",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 3,
                      },
                      pressed && { opacity: 0.85 },
                      saveFeedback.isPending && { opacity: 0.6 },
                    ]}
                  >
                    <Ionicons name="send" size={15} color="#FFFFFF" />
                    <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>
                      {saveFeedback.isPending
                        ? "Submitting..."
                        : feedbackQuery.data
                        ? "Update Review"
                        : "Submit Review"}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </>
          ) : null}
        </Screen>
      );
    }
  }
}

export function MemberClassesScreenView({
  model,
}: {
  model: ReturnType<typeof useMemberClassesScreenPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  const existingRouteParams = (model.props as any)?.routeParams ?? {};
  const mergedModel = {
    ...model,
    props: {
      ...model.props,
      routeParams: {
        tab: "classes",
        ...existingRouteParams,
      },
    },
  };
  return <MemberWorkoutScreenView model={mergedModel as any} />;
}

const NOTIFICATION_CATEGORIES = ["All", "Workouts", "Payments", "Announcements", "System"] as const;
type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

function formatNotificationTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "Recently";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 0) return "Just now";
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

function getNotificationVisuals(n: MemberNotification) {
  const text = `${n.notification_type || ""} ${n.title || ""} ${n.body || ""}`.toLowerCase();

  // Activity / Rings / Goals
  if (
    text.includes("ring") ||
    text.includes("goal") ||
    text.includes("move") ||
    text.includes("burn") ||
    text.includes("target") ||
    text.includes("step") ||
    text.includes("smashed")
  ) {
    return {
      category: "Workouts" as const,
      icon: "disc-outline" as keyof typeof Ionicons.glyphMap,
      iconColor: "#007AFF",
      bgColor: "#007AFF",
      borderColor: "rgba(0, 122, 255, 0.35)",
    };
  }

  // Workouts / Training / Exercise / Nutrition
  if (
    text.includes("workout") ||
    text.includes("lat") ||
    text.includes("pullover") ||
    text.includes("exercise") ||
    text.includes("rep") ||
    text.includes("set") ||
    text.includes("weight") ||
    text.includes("coach") ||
    text.includes("training") ||
    text.includes("diet") ||
    text.includes("meal")
  ) {
    return {
      category: "Workouts" as const,
      icon: "barbell-outline" as keyof typeof Ionicons.glyphMap,
      iconColor: "#E91E63",
      bgColor: "#E91E63",
      borderColor: "rgba(233, 30, 99, 0.35)",
    };
  }

  // Payments / Billing / RFID / Membership
  if (
    text.includes("pay") ||
    text.includes("receipt") ||
    text.includes("bill") ||
    text.includes("membership") ||
    text.includes("access") ||
    text.includes("rfid") ||
    text.includes("subscription") ||
    text.includes("invoice")
  ) {
    return {
      category: "Payments" as const,
      icon: "card-outline" as keyof typeof Ionicons.glyphMap,
      iconColor: "#007AFF",
      bgColor: "#007AFF",
      borderColor: "rgba(0, 122, 255, 0.35)",
    };
  }

  // Announcements / Classes / Schedule
  if (
    text.includes("announce") ||
    text.includes("class") ||
    text.includes("event") ||
    text.includes("notice") ||
    text.includes("schedule")
  ) {
    return {
      category: "Announcements" as const,
      icon: "megaphone-outline" as keyof typeof Ionicons.glyphMap,
      iconColor: "#007AFF",
      bgColor: "#007AFF",
      borderColor: "rgba(0, 122, 255, 0.35)",
    };
  }

  // System fallback
  return {
    category: "System" as const,
    icon: "hardware-chip-outline" as keyof typeof Ionicons.glyphMap,
    iconColor: "#007AFF",
    bgColor: "#1C1C1E",
    borderColor: "rgba(0, 122, 255, 0.3)",
  };
}

export function MemberNotificationsScreenView({
  model,
}: {
  model: ReturnType<typeof useMemberNotificationsScreenPresentation>;
}): React.ReactNode {
  const { colors } = useAppTheme();
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>("All");

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;

  switch (model.kind) {
    case "view1": {
      const {
        styles,
        queryRefresh,
        query,
        unreadOnly,
        setUnreadOnly,
        markRead,
        markAllRead,
        dismissNotification,
        clearAll,
      } = model.props;

      const rawNotifications: MemberNotification[] = query.data ?? [];
      const unreadCount = rawNotifications.filter(
        (n) => n.status === "unread" || !n.read_at
      ).length;

      // Filter by unreadOnly toggle
      let filtered = unreadOnly
        ? rawNotifications.filter((n) => n.status === "unread" || !n.read_at)
        : rawNotifications;

      // Filter by selected category pill
      if (selectedCategory !== "All") {
        filtered = filtered.filter(
          (n) => getNotificationVisuals(n).category === selectedCategory
        );
      }

      return (
        <Screen
          scroll
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 40,
            gap: 0,
            backgroundColor: "#000000",
          }}
          refreshControl={queryRefresh(query.isRefetching, () => {
            void query.refetch();
          })}
        >
          {/* Top Bar & Section Header */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "800",
                color: "#E91E63",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              ALERTS & MESSAGES
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "900",
                  color: "#FFFFFF",
                  letterSpacing: -0.5,
                }}
              >
                Notifications
              </Text>

              {/* Top-Right Clear All Button */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear all notifications"
                onPress={() => {
                  if (!clearAll.isPending && rawNotifications.length > 0) {
                    clearAll.mutate();
                  }
                }}
                disabled={clearAll.isPending || rawNotifications.length === 0}
                style={({ pressed }) => [
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: "#1C1C1E",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  },
                  pressed && { opacity: 0.75 },
                  (clearAll.isPending || rawNotifications.length === 0) && { opacity: 0.4 },
                ]}
              >
                <Ionicons name="trash-outline" size={13} color="#FF3B30" />
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#FF3B30" }}>
                  {clearAll.isPending ? "Clearing..." : "Clear all"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Notification Controls & Filter Container (Top Card) */}
          <View
            style={{
              backgroundColor: "#000000",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.08)",
              padding: 14,
              gap: 14,
              marginBottom: 16,
            }}
          >
            {/* Top Row: Unread only Switch + Mark all read */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Switch
                  value={unreadOnly}
                  onValueChange={(val) => setUnreadOnly(val)}
                  trackColor={{ false: "#1C1C1E", true: "#34C759" }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#1C1C1E"
                  style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                />
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>
                  Unread only
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mark all read"
                onPress={() => {
                  if (!markAllRead.isPending && unreadCount > 0) {
                    markAllRead.mutate();
                  }
                }}
                disabled={markAllRead.isPending || unreadCount === 0}
                style={({ pressed }) => [
                  { flexDirection: "row", alignItems: "center", gap: 4 },
                  pressed && { opacity: 0.75 },
                  (markAllRead.isPending || unreadCount === 0) && { opacity: 0.4 },
                ]}
              >
                <Ionicons name="checkmark" size={15} color="#34C759" />
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#34C759" }}>
                  {markAllRead.isPending ? "Marking..." : "Mark all read"}
                </Text>
              </Pressable>
            </View>

            {/* Bottom Row: Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
            >
              {NOTIFICATION_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    accessibilityRole="tab"
                    accessibilityLabel={`${cat} notifications`}
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setSelectedCategory(cat)}
                    style={({ pressed }) => [
                      {
                        paddingHorizontal: 16,
                        paddingVertical: 7,
                        borderRadius: 999,
                        backgroundColor: isSelected ? "#FFFFFF" : "#1C1C1E",
                        borderWidth: 1,
                        borderColor: isSelected ? "#FFFFFF" : "rgba(255, 255, 255, 0.08)",
                      },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: isSelected ? "800" : "600",
                        color: isSelected ? "#000000" : "#F2F2F7",
                      }}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Loading Skeleton */}
          {query.isLoading && !query.data ? <LoadingSkeleton rows={4} /> : null}

          {/* Error State */}
          {query.error && !query.data ? (
            <ErrorState
              message={getApiErrorMessage(query.error)}
              onRetry={() => query.refetch()}
            />
          ) : null}

          {/* Empty State */}
          {!query.isLoading && !query.error && filtered.length === 0 ? (
            <EmptyState
              title={
                unreadOnly
                  ? "No unread notifications"
                  : selectedCategory !== "All"
                  ? `No ${selectedCategory.toLowerCase()} notifications`
                  : "No notifications"
              }
              message="You're all caught up! New updates regarding workouts, payments, and gym announcements will appear here."
              icon="notifications-off-outline"
            />
          ) : null}

          {/* Notifications List */}
          {filtered.map((item) => {
            const isUnread = item.status === "unread" || !item.read_at;
            const visuals = getNotificationVisuals(item);
            const timeText = formatNotificationTime(item.created_at);

            return (
              <Pressable
                key={item.notification_uuid}
                accessibilityRole="button"
                accessibilityLabel={`Notification: ${item.title}`}
                onPress={() => {
                  if (isUnread) {
                    markRead.mutate(item.notification_uuid);
                  }
                }}
                style={({ pressed }) => [
                  {
                    backgroundColor: "#000000",
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: isUnread
                      ? "rgba(255, 255, 255, 0.12)"
                      : "rgba(255, 255, 255, 0.06)",
                    padding: 14,
                    marginBottom: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                {/* Category-specific Circular Icon Badge */}
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: visuals.bgColor,
                    borderWidth: 1,
                    borderColor: visuals.borderColor,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={visuals.icon} size={20} color={visuals.iconColor} />
                </View>

                {/* Content */}
                <View style={{ flex: 1, gap: 4 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flex: 1,
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "700",
                          color: "#FFFFFF",
                        }}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      {isUnread ? (
                        <View
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: "#E91E63",
                          }}
                        />
                      ) : null}
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#F2F2F7",
                      }}
                    >
                      {timeText}
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontSize: 13,
                      color: "#F2F2F7",
                      lineHeight: 18,
                    }}
                    numberOfLines={2}
                  >
                    {item.body}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </Screen>
      );
    }
  }
}


interface MobileDayOverview {
  dayName: string;
  dayNum: number;
  dateKey: string;
  dateObj: Date;
  status: "complete" | "partial" | "empty";
  percent: number;
  isSelected: boolean;
}

export function MemberGoalsScreenView({
  model,
}: {
  model: ReturnType<typeof useMemberGoalsScreenPresentation>;
}): React.ReactNode {
  const nowDate = useMemo(() => new Date(), []);
  const todayIso = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}-${String(nowDate.getDate()).padStart(2, "0")}`;

  const [selectedDayNum, setSelectedDayNum] = useState<number>(nowDate.getDate());
  const [editGoalModalVisible, setEditGoalModalVisible] = useState(false);

  const activityQuery = useMemberActivity(30);
  const syncActivityMutation = useSyncMemberActivity();
  const { steps: sensorSteps, hours: sensorHours, date: sensorDate, status: sensorStatus } = useDailySteps();

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;

  switch (model.kind) {
    case "view1": {
      const {
        queryRefresh,
        query,
        createGoal,
        updateGoal,
      } = model.props;

      const goals: MemberGoal[] = Array.isArray(query?.data)
        ? (query.data as MemberGoal[])
        : [];
      const activeGoal =
        goals.find((g) => g.status === "active" && g.calories_goal != null) ||
        goals.find((g) => g.calories_goal != null) ||
        goals.find((g) => g.status === "active") ||
        goals[0];

      const activityData = activityQuery.data;
      const realDailyTarget =
        activeGoal?.calories_goal != null && Number(activeGoal.calories_goal) > 0
          ? Number(activeGoal.calories_goal)
          : activityData?.today?.calories_target && Number(activityData.today.calories_target) > 0
            ? Number(activityData.today.calories_target)
            : 250;

      const [dailyTargetKcal, setDailyTargetKcal] = useState<number>(realDailyTarget);
      const [tempTargetKcal, setTempTargetKcal] = useState<string>(String(realDailyTarget));
      const [isGoalPaused, setIsGoalPaused] = useState<boolean>(activeGoal?.status === "paused");

      useEffect(() => {
        if (realDailyTarget > 0) {
          setDailyTargetKcal(realDailyTarget);
          setTempTargetKcal(String(realDailyTarget));
        }
      }, [realDailyTarget]);

      useEffect(() => {
        if (activeGoal?.status) {
          setIsGoalPaused(activeGoal.status === "paused");
        }
      }, [activeGoal?.status]);

      useActivitySync({
        date: sensorDate,
        hours: sensorHours,
        status: sensorStatus,
        calories: activityData?.today?.calories_completed ?? 0,
        target: dailyTargetKcal || 250,
      });

      // Compute 7 week days dynamically (Mon -> Sun)
      const weekDays: MobileDayOverview[] = useMemo(() => {
        const base = new Date();
        const monday = new Date(base);
        monday.setDate(base.getDate() - ((base.getDay() + 6) % 7));
        const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        return names.map((dayName, idx) => {
          const dt = new Date(monday);
          dt.setDate(monday.getDate() + idx);
          const dateKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
          const dayNum = dt.getDate();
          const matching =
            dateKey === activityData?.today?.activity_date
              ? activityData.today
              : activityData?.items?.find((item) => item.activity_date === dateKey);
          const daySteps =
            dateKey === todayIso
              ? Math.max(sensorSteps, matching?.steps ?? 0)
              : (matching?.steps ?? 0);
          const dayKcal = Math.max(
            matching?.calories_completed ?? 0,
            Math.round(((daySteps * 0.75) / 1000) * 70 * 0.5)
          );
          const target = matching?.calories_target || dailyTargetKcal || 250;
          const pct = target > 0 ? Math.round((dayKcal / target) * 100) : 0;
          return {
            dayName,
            dayNum,
            dateKey,
            dateObj: dt,
            percent: pct,
            status: pct >= 100 ? "complete" : pct > 0 ? "partial" : "empty",
            isSelected: dayNum === selectedDayNum,
          };
        });
      }, [activityData, selectedDayNum, sensorSteps, todayIso, dailyTargetKcal]);

      // Dynamic Week Range Header Label (e.g. "2 Nov – 8 Nov 2026")
      const weekRangeLabel = useMemo(() => {
        if (weekDays.length < 7) return "";
        const first = weekDays[0].dateObj;
        const last = weekDays[6].dateObj;
        const firstMonth = first.toLocaleDateString("en-GB", { month: "short" });
        const lastMonth = last.toLocaleDateString("en-GB", { month: "short" });
        const year = last.getFullYear();
        return `${first.getDate()} ${firstMonth} – ${last.getDate()} ${lastMonth} ${year}`;
      }, [weekDays]);

      // Selected day activity details
      const selectedDayObj = weekDays.find((d) => d.dayNum === selectedDayNum) ?? weekDays[0];
      const selectedDateKey = selectedDayObj?.dateKey ?? todayIso;
      const selectedDayActivity =
        selectedDateKey === activityData?.today?.activity_date
          ? activityData.today
          : activityData?.items?.find((i) => i.activity_date === selectedDateKey);

      const isSelectedToday = selectedDateKey === todayIso;

      const realHourlySteps = useMemo(() => {
        const saved =
          Array.isArray(selectedDayActivity?.hourly_steps) &&
          selectedDayActivity.hourly_steps.length === 24
            ? selectedDayActivity.hourly_steps
            : Array(24).fill(0);
        if (isSelectedToday && Array.isArray(sensorHours) && sensorHours.length === 24) {
          return Array.from({ length: 24 }, (_, idx) =>
            Math.max(saved[idx] ?? 0, sensorHours[idx] ?? 0)
          );
        }
        return saved;
      }, [selectedDayActivity, isSelectedToday, sensorHours]);

      const todayHourlyStepsSum = realHourlySteps.reduce((acc, v) => acc + v, 0);

      const totalSteps = Math.max(
        selectedDayActivity?.steps ?? 0,
        todayHourlyStepsSum,
        isSelectedToday ? sensorSteps : 0
      );

      const currentKcal = Math.max(
        selectedDayActivity?.calories_completed ?? 0,
        Math.round(
          ((totalSteps * 0.75) / 1000) *
            (selectedDayActivity?.calorie_estimate_weight_kg || 70) *
            0.5
        )
      );

      const movePercentage = Math.min(
        100,
        Math.round((currentKcal / Math.max(1, dailyTargetKcal)) * 100)
      );
      const kcalRemaining = Math.max(0, dailyTargetKcal - currentKcal);

      // Aggregate 24 hourly steps into 12 two-hour bars for the chart
      const chartBars = useMemo(() => {
        const buckets: number[] = [];
        for (let i = 0; i < 12; i++) {
          const h1 = realHourlySteps[i * 2] ?? 0;
          const h2 = realHourlySteps[i * 2 + 1] ?? 0;
          buckets.push(h1 + h2);
        }
        const maxBucket = Math.max(1, ...buckets);
        return buckets.map((val) => ({
          value: val,
          ratio: val / maxBucket,
        }));
      }, [realHourlySteps]);

      const distanceKmText = useMemo(() => {
        if (
          selectedDayActivity?.distance_km != null &&
          Number(selectedDayActivity.distance_km) > 0
        ) {
          return Number(selectedDayActivity.distance_km).toFixed(2);
        }
        return ((totalSteps * 0.75) / 1000).toFixed(2);
      }, [selectedDayActivity?.distance_km, totalSteps]);

      const flightsClimbedCount = useMemo(() => {
        const rawFlights = (selectedDayActivity as any)?.flights_climbed;
        if (typeof rawFlights === "number" && rawFlights >= 0) {
          return rawFlights;
        }
        return Math.max(0, Math.round(totalSteps / 600));
      }, [selectedDayActivity, totalSteps]);

      const handleTogglePauseGoal = () => {
        const nextPaused = !isGoalPaused;
        setIsGoalPaused(nextPaused);
        if (activeGoal?.goal_uuid) {
          updateGoal.mutate({
            goalUuid: activeGoal.goal_uuid,
            payload: { status: nextPaused ? "paused" : "active" },
          });
        }
      };

      const handleSaveEditedGoal = () => {
        const parsed = parseInt(tempTargetKcal.trim(), 10);
        if (!Number.isFinite(parsed) || parsed < 1 || parsed > 100000) {
          return;
        }
        setDailyTargetKcal(parsed);
        setEditGoalModalVisible(false);

        if (activeGoal?.goal_uuid) {
          updateGoal.mutate({
            goalUuid: activeGoal.goal_uuid,
            payload: { calories_goal: parsed },
          });
        } else {
          createGoal.mutate({
            goal_name: "Daily Move Goal",
            calories_goal: parsed,
            target_weight: null,
            progress_percentage: movePercentage,
          });
        }
      };

      // SVG Ring Dimensions
      const ringSize = 168;
      const ringStroke = 18;
      const ringRadius = (ringSize - ringStroke) / 2;
      const ringCircumference = 2 * Math.PI * ringRadius;
      const ringDashOffset =
        ringCircumference * (1 - Math.min(1, Math.max(0, currentKcal / Math.max(1, dailyTargetKcal))));

      return (
        <Screen
          scroll
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 40,
            gap: 0,
            backgroundColor: "#000000",
          }}
          refreshControl={queryRefresh(
            query.isRefetching || activityQuery.isRefetching,
            () => {
              void query.refetch();
              void activityQuery.refetch();
            }
          )}
        >
          {/* A. Header Bar */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "800",
                color: "#E91E63",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              ACTIVITY HISTORY
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "900",
                  color: "#FFFFFF",
                  letterSpacing: -0.5,
                }}
              >
                Goals & Activity
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit Goal"
                onPress={() => {
                  setTempTargetKcal(String(dailyTargetKcal));
                  setEditGoalModalVisible(true);
                }}
                style={({ pressed }) => [
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: "#1C1C1E",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    borderRadius: 999,
                    paddingHorizontal: 13,
                    paddingVertical: 7,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Ionicons name="settings-sharp" size={13} color="#007AFF" />
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#E91E63" }}>
                  Edit Goal
                </Text>
              </Pressable>
            </View>
          </View>

          {query.isLoading && !query.data && activityQuery.isLoading ? (
            <LoadingSkeleton rows={4} />
          ) : null}

          {/* B. Weekly Overview Date Selector Card */}
          <View
            style={{
              backgroundColor: "#000000",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.08)",
              padding: 14,
              gap: 12,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#FFFFFF" }}>
                Weekly Overview
              </Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#F2F2F7" }}>
                {weekRangeLabel}
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 6 }}>
              {weekDays.map((day) => {
                const isSelected = day.isSelected;
                const hasActivity = day.status !== "empty";

                return (
                  <Pressable
                    key={day.dateKey}
                    accessibilityRole="button"
                    accessibilityLabel={`${day.dayName} ${day.dayNum}`}
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setSelectedDayNum(day.dayNum)}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        borderRadius: 14,
                        paddingVertical: 10,
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        backgroundColor: isSelected
                          ? "rgba(233, 30, 99, 0.12)"
                          : "#000000",
                        borderWidth: isSelected ? 1.5 : 1,
                        borderColor: isSelected
                          ? "#E91E63"
                          : "rgba(255, 255, 255, 0.06)",
                      },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: isSelected
                          ? "#E91E63"
                          : hasActivity
                            ? "#F2F2F7"
                            : "#1C1C1E",
                      }}
                    >
                      {day.dayName}
                    </Text>

                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "900",
                        color: isSelected || hasActivity ? "#FFFFFF" : "#F2F2F7",
                      }}
                    >
                      {day.dayNum}
                    </Text>

                    {/* Completion Status Indicator Circle */}
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: isSelected ? "#E91E63" : "transparent",
                        borderWidth: isSelected ? 0 : 1.5,
                        borderColor: isSelected
                          ? "#E91E63"
                          : hasActivity
                            ? "#E91E63"
                            : "rgba(255, 255, 255, 0.12)",
                      }}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* C. Daily Move Goal Card */}
          <View
            style={{
              backgroundColor: "#000000",
              borderRadius: 22,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.08)",
              padding: 18,
              gap: 16,
              marginBottom: 16,
            }}
          >
            {/* Header Row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#E91E63",
                  }}
                />
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#FFFFFF" }}>
                  Daily Move Goal
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: isGoalPaused
                    ? "rgba(233, 30, 99, 0.14)"
                    : "rgba(233, 30, 99, 0.14)",
                  borderWidth: 1,
                  borderColor: isGoalPaused
                    ? "rgba(233, 30, 99, 0.35)"
                    : "rgba(233, 30, 99, 0.35)",
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: isGoalPaused ? "#E91E63" : "#E91E63",
                  }}
                >
                  {isGoalPaused ? "Paused" : "Active"}
                </Text>
              </View>
            </View>

            {/* Center Ring Display */}
            <View style={{ alignItems: "center", justifyContent: "center", marginVertical: 4 }}>
              <View style={{ width: ringSize, height: ringSize, position: "relative" }}>
                <Svg width={ringSize} height={ringSize}>
                  <Circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={ringRadius}
                    fill="none"
                    stroke="rgba(233, 30, 99, 0.18)"
                    strokeWidth={ringStroke}
                  />
                  <Circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={ringRadius}
                    fill="none"
                    stroke="#E91E63"
                    strokeWidth={ringStroke}
                    strokeLinecap="round"
                    strokeDasharray={`${ringCircumference} ${ringCircumference}`}
                    strokeDashoffset={ringDashOffset}
                    rotation="-90"
                    origin={`${ringSize / 2}, ${ringSize / 2}`}
                  />
                </Svg>

                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <Text style={{ fontSize: 28, fontWeight: "900", color: "#FFFFFF" }}>
                    {`${movePercentage}%`}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "800",
                      color: "#007AFF",
                      letterSpacing: 0.5,
                    }}
                  >
                    DAILY TARGET
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Counter & Status Subtext */}
            <View style={{ alignItems: "center", gap: 4 }}>
              <Text>
                <Text style={{ fontSize: 30, fontWeight: "900", color: "#E91E63" }}>
                  {currentKcal.toLocaleString()}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#F2F2F7" }}>
                  {` / ${dailyTargetKcal.toLocaleString()} kcal`}
                </Text>
              </Text>

              <Text style={{ fontSize: 12, fontWeight: "700", color: "#34C759" }}>
                {isGoalPaused
                  ? "Goal paused • Resume anytime"
                  : kcalRemaining === 0 && currentKcal > 0
                    ? "0 kcal remaining • Goal smashed!"
                    : `${kcalRemaining.toLocaleString()} kcal remaining • Keep moving!`}
              </Text>
            </View>

            {/* Pause / Resume Goal Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isGoalPaused ? "Resume Goal" : "Pause Goal"}
              onPress={handleTogglePauseGoal}
              disabled={updateGoal.isPending}
              style={({ pressed }) => [
                {
                  backgroundColor: "#1C1C1E",
                  borderRadius: 14,
                  paddingVertical: 13,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.06)",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                },
                pressed && { opacity: 0.85 },
                updateGoal.isPending && { opacity: 0.6 },
              ]}
            >
              <Ionicons
                name={isGoalPaused ? "play" : "pause"}
                size={14}
                color="#007AFF"
              />
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#FFFFFF" }}>
                {isGoalPaused ? "Resume Goal" : "Pause Goal"}
              </Text>
            </Pressable>
          </View>

          {/* D. Activity Throughout the Day Card */}
          <View
            style={{
              backgroundColor: "#000000",
              borderRadius: 22,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.08)",
              padding: 18,
              gap: 16,
            }}
          >
            {/* Header Row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#FFFFFF" }}>
                  Activity Throughout the Day
                </Text>
                <Text style={{ fontSize: 12, color: "#F2F2F7" }}>
                  Hourly steps distribution
                </Text>
              </View>

              <Text style={{ fontSize: 14, fontWeight: "800", color: "#E91E63" }}>
                {`${totalSteps.toLocaleString()} steps`}
              </Text>
            </View>

            {/* Hourly Steps Bar Chart */}
            <View style={{ gap: 8, marginTop: 4 }}>
              <View
                style={{
                  height: 112,
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  paddingHorizontal: 4,
                  borderBottomWidth: 1,
                  borderBottomColor: "rgba(255, 255, 255, 0.07)",
                  paddingBottom: 6,
                }}
              >
                {chartBars.map((bar, idx) => {
                  const hasVal = bar.value > 0;
                  const barHeight = hasVal
                    ? Math.max(14, Math.round(bar.ratio * 96))
                    : idx % 3 === 0
                      ? 8
                      : 4;
                  const barColor = !hasVal
                    ? "#1C1C1E"
                    : bar.ratio >= 0.75
                      ? "#E91E63"
                      : bar.ratio >= 0.4
                        ? "#E91E63"
                        : "#E91E63";

                  return (
                    <View
                      key={idx}
                      style={{
                        width: 12,
                        height: barHeight,
                        borderRadius: 4,
                        backgroundColor: barColor,
                      }}
                    />
                  );
                })}
              </View>

              {/* Time Labels */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {["00:00", "06:00", "12:00", "18:00", "24:00"].map((label) => (
                  <Text
                    key={label}
                    style={{ fontSize: 11, fontWeight: "600", color: "#F2F2F7" }}
                  >
                    {label}
                  </Text>
                ))}
              </View>
            </View>

            {/* 3 Metric Summary Cards */}
            <View style={{ flexDirection: "row", gap: 8, marginTop: 2 }}>
              {/* 1. Steps */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#000000",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.06)",
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "600", color: "#F2F2F7" }}>
                  Steps
                </Text>
                <Text
                  style={{ fontSize: 15, fontWeight: "900", color: "#FFFFFF" }}
                  numberOfLines={1}
                >
                  {totalSteps.toLocaleString()}
                </Text>
              </View>

              {/* 2. Distance */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#000000",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.06)",
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "600", color: "#F2F2F7" }}>
                  Distance
                </Text>
                <Text
                  style={{ fontSize: 15, fontWeight: "900", color: "#007AFF" }}
                  numberOfLines={1}
                >
                  {`${distanceKmText} km`}
                </Text>
              </View>

              {/* 3. Flights */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#000000",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.06)",
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "600", color: "#F2F2F7" }}>
                  Flights
                </Text>
                <Text
                  style={{ fontSize: 15, fontWeight: "900", color: "#007AFF" }}
                  numberOfLines={1}
                >
                  {`${flightsClimbedCount} Floors`}
                </Text>
              </View>
            </View>
          </View>

          {/* Edit Daily Move Goal Modal */}
          <Modal
            visible={editGoalModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setEditGoalModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.72)",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <View
                style={{
                  width: "100%",
                  maxWidth: 360,
                  backgroundColor: "#000000",
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.12)",
                  padding: 20,
                  gap: 14,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontSize: 17, fontWeight: "800", color: "#FFFFFF" }}>
                    Edit Daily Move Goal
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close modal"
                    onPress={() => setEditGoalModalVisible(false)}
                  >
                    <Ionicons name="close" size={20} color="#F2F2F7" />
                  </Pressable>
                </View>

                <Text style={{ fontSize: 12, color: "#F2F2F7" }}>
                  Set your daily active calorie burn target (kcal).
                </Text>

                <TextInput
                  accessibilityLabel="Daily Calorie Target"
                  value={tempTargetKcal}
                  onChangeText={setTempTargetKcal}
                  keyboardType="numeric"
                  placeholder="250"
                  placeholderTextColor="#F2F2F7"
                  style={{
                    backgroundColor: "#000000",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.12)",
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 18,
                    fontWeight: "800",
                    color: "#FFFFFF",
                  }}
                />

                <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Cancel"
                    onPress={() => setEditGoalModalVisible(false)}
                    style={{
                      flex: 1,
                      backgroundColor: "#1C1C1E",
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#007AFF" }}>
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Save Daily Goal"
                    onPress={handleSaveEditedGoal}
                    style={{
                      flex: 1,
                      backgroundColor: "#E91E63",
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "800", color: "#FFFFFF" }}>
                      Save Goal
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </Screen>
      );
    }
  }
}

export function MemberRewardsScreenView({ model }: { model: ReturnType<typeof useMemberRewardsScreenPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  const [activeTab, setActiveTab] = useState<"badges" | "challenges" | "perks">("badges");
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState<string | null>(null);

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;

  switch (model.kind) {
    case "view1": {
      const {
        styles,
        queryRefresh,
        query,
        gamificationQuery,
        attendanceQuery,
        workoutsQuery,
        mealsQuery,
        activityQuery,
        profileQuery,
        redeemPerk,
        navigation,
        user,
      } = model.props;

      const gamification = gamificationQuery?.data;
      const points = gamification?.points ?? 0;
      const streakDays = gamification?.streak_days ?? 0;
      const passStatus = gamification?.pass_status ?? "Active Pass";
      const badges = gamification?.badges ?? [];
      const challenges = gamification?.challenges ?? [];
      const perks = gamification?.perks ?? [];
      const unlockedBadgesCount = gamification?.unlocked_count ?? badges.filter((b: any) => !b.is_locked).length;

      const handleRedeem = (perk: any) => {
        if (points < perk.cost_pts) return;
        setRedeemSuccessMsg(null);
        redeemPerk.mutate(perk.id, {
          onSuccess: (res: any) => {
            setRedeemSuccessMsg(res.message || `Successfully redeemed ${perk.title}!`);
            setTimeout(() => setRedeemSuccessMsg(null), 4000);
          },
        });
      };

      const handleChallengeAction = (ch: any) => {
        if (ch.id === "ch-attendance") {
          navigation.navigate("MemberAttendance");
        } else if (ch.id === "ch-strength") {
          navigation.navigate("MemberWorkout");
        } else {
          navigation.navigate("MemberClasses");
        }
      };

      const getBadgeIconColor = (badge: any) => {
        if (badge.id === "badge-1") return "#000000";
        if (badge.id === "badge-2") return "#FFFFFF";
        if (badge.id === "badge-3") return "#FFFFFF";
        if (badge.id === "badge-4") return "#000000";
        if (badge.id === "badge-5") return "#000000";
        if (badge.id === "badge-6") return "#000000";
        return "#FFFFFF";
      };

      return (
        <Screen
          scroll
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 40,
            gap: 0,
            backgroundColor: "#000000",
          }}
          refreshControl={queryRefresh(gamificationQuery.isRefetching, () => {
            void gamificationQuery.refetch();
            void query.refetch();
            void attendanceQuery.refetch();
            void workoutsQuery.refetch();
          })}
        >
          {/* Top Bar & Navigation Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            {/* Left: < Back button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to Profile"
              onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("MemberProfile"))}
              style={({ pressed }) => [
                {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  minWidth: 60,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons name="chevron-back" size={20} color="#E91E63" />
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#E91E63" }}>Back</Text>
            </Pressable>

            {/* Center: Category Title & Header */}
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: "#E91E63",
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                }}
              >
                APPLE FITNESS AWARDS
              </Text>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#FFFFFF" }}>Awards & Badges</Text>
            </View>

            {/* Right: Quick Redeem Action */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Redeem Perks"
              onPress={() => setActiveTab("perks")}
              style={({ pressed }) => [
                {
                  minWidth: 60,
                  alignItems: "flex-end",
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#E91E63" }}>Redeem</Text>
            </Pressable>
          </View>

          {/* Reward Balance & Streak Header Card */}
          <View
            style={{
              backgroundColor: "#000000",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.08)",
              padding: 16,
              gap: 16,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              {/* Left Column: Reward Balance */}
              <View style={{ gap: 4, flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: "800", color: "#F2F2F7", letterSpacing: 0.5 }}>
                    REWARD BALANCE
                  </Text>
                  <View
                    style={{
                      backgroundColor: "rgba(233, 30, 99, 0.15)",
                      borderWidth: 1,
                      borderColor: "rgba(233, 30, 99, 0.3)",
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "800", color: "#E91E63" }}>{passStatus}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginVertical: 2 }}>
                  <Text style={{ fontSize: 36, fontWeight: "900", color: "#FFFFFF" }}>{points}</Text>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#F2F2F7" }}>PTS</Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setActiveTab("perks")}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#E91E63" }}>Redeem Perks & Rewards</Text>
                  <Ionicons name="chevron-forward" size={14} color="#E91E63" />
                </Pressable>
              </View>

              {/* Right Column: Daily Streak Counter with radial progress ring */}
              <View style={{ alignItems: "center", gap: 4, width: 95 }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: "#1C1C1E",
                    borderWidth: 3,
                    borderColor: streakDays > 0 ? "#E91E63" : "rgba(255, 255, 255, 0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="flame" size={24} color={streakDays > 0 ? "#E91E63" : "#F2F2F7"} />
                </View>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#FFFFFF", textAlign: "center" }}>
                  {`${streakDays} Day Streak`}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: "500", color: "#F2F2F7", textAlign: "center" }}>
                  Check-in daily
                </Text>
              </View>
            </View>

            {/* Awards Progress Row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: "rgba(255, 255, 255, 0.06)",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="trophy-outline" size={16} color="#E91E63" />
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#F2F2F7" }}>
                  Metallic Awards Progress
                </Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#FFFFFF" }}>
                {`${unlockedBadgesCount} / ${badges.length || 6} Unlocked`}
              </Text>
            </View>
          </View>

          {/* 3-Tab Segmented Switcher */}
          <View
            style={{
              backgroundColor: "#000000",
              borderRadius: 14,
              padding: 4,
              flexDirection: "row",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.06)",
              marginBottom: 16,
              gap: 4,
            }}
          >
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel="Badges Tab"
              accessibilityState={{ selected: activeTab === "badges" }}
              onPress={() => setActiveTab("badges")}
              style={{
                flex: 1,
                paddingVertical: 9,
                borderRadius: 10,
                backgroundColor: activeTab === "badges" ? "#1C1C1E" : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: activeTab === "badges" ? "800" : "600",
                  color: activeTab === "badges" ? "#FFFFFF" : "#F2F2F7",
                }}
              >
                {`Badges (${badges.length})`}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="tab"
              accessibilityLabel="Challenges Tab"
              accessibilityState={{ selected: activeTab === "challenges" }}
              onPress={() => setActiveTab("challenges")}
              style={{
                flex: 1,
                paddingVertical: 9,
                borderRadius: 10,
                backgroundColor: activeTab === "challenges" ? "#1C1C1E" : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: activeTab === "challenges" ? "800" : "600",
                  color: activeTab === "challenges" ? "#FFFFFF" : "#F2F2F7",
                }}
              >
                {`Challenges (${challenges.length})`}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="tab"
              accessibilityLabel="Perks Store Tab"
              accessibilityState={{ selected: activeTab === "perks" }}
              onPress={() => setActiveTab("perks")}
              style={{
                flex: 1,
                paddingVertical: 9,
                borderRadius: 10,
                backgroundColor: activeTab === "perks" ? "#1C1C1E" : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: activeTab === "perks" ? "800" : "600",
                  color: activeTab === "perks" ? "#FFFFFF" : "#F2F2F7",
                }}
              >
                Perks Store
              </Text>
            </Pressable>
          </View>

          {/* Loading / Error States */}
          {gamificationQuery.isLoading && !gamification ? <LoadingSkeleton rows={4} /> : null}
          {gamificationQuery.error && !gamification ? (
            <ErrorState message={getApiErrorMessage(gamificationQuery.error)} onRetry={() => gamificationQuery.refetch()} />
          ) : null}

          {/* Tab 1: Badges Showcase View */}
          {activeTab === "badges" && gamification ? (
            <View style={{ gap: 14 }}>
              <View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Ionicons name="sparkles" size={16} color="#E91E63" />
                    <Text style={{ fontSize: 13, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5 }}>
                      ACTIVITY AWARDS SHOWCASE
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: "#1C1C1E",
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.08)",
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#F2F2F7" }}>Tap to Inspect</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: "#F2F2F7", marginTop: 2 }}>
                  Realistic Apple Fitness styled metallic medals
                </Text>
              </View>

              {badges.length === 0 ? (
                <EmptyState
                  title="No Badges Available"
                  message="Activity awards will appear as you participate in workouts and gym check-ins."
                  icon="trophy-outline"
                />
              ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
                  {badges.map((badge: any) => {
                    const iconColor = getBadgeIconColor(badge);
                    return (
                      <Pressable
                        key={badge.id}
                        accessibilityRole="button"
                        accessibilityLabel={`${badge.title} - ${badge.category}`}
                        onPress={() => setSelectedBadge(badge)}
                        style={({ pressed }) => [
                          {
                            width: "48%",
                            backgroundColor: "#000000",
                            borderRadius: 18,
                            borderWidth: 1,
                            borderColor: "rgba(255, 255, 255, 0.08)",
                            padding: 16,
                            alignItems: "center",
                            gap: 6,
                          },
                          pressed && { opacity: 0.85 },
                        ]}
                      >
                        {/* Metallic Medal Circle */}
                        <View
                          style={{
                            width: 62,
                            height: 62,
                            borderRadius: 31,
                            backgroundColor: badge.theme_color,
                            alignItems: "center",
                            justifyContent: "center",
                            shadowColor: badge.theme_color,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.35,
                            shadowRadius: 10,
                            elevation: 4,
                            borderWidth: 2,
                            borderColor: "rgba(255, 255, 255, 0.35)",
                          }}
                        >
                          <Ionicons
                            name={(badge.icon_name || "star") as any}
                            size={28}
                            color={iconColor}
                          />
                        </View>

                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "800",
                            color: "#FFFFFF",
                            textAlign: "center",
                            marginTop: 4,
                          }}
                        >
                          {badge.title}
                        </Text>

                        <Text style={{ fontSize: 11, color: "#F2F2F7", textAlign: "center" }}>
                          {badge.category}
                        </Text>

                        {/* Lock / Unlock Status Pill */}
                        <View
                          style={{
                            marginTop: 4,
                            backgroundColor: badge.is_locked ? "#1C1C1E" : "rgba(52, 199, 89, 0.15)",
                            borderWidth: 1,
                            borderColor: badge.is_locked ? "rgba(255, 255, 255, 0.1)" : "rgba(52, 199, 89, 0.3)",
                            borderRadius: 999,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Ionicons
                            name={badge.is_locked ? "lock-closed" : "checkmark-circle"}
                            size={10}
                            color={badge.is_locked ? "#F2F2F7" : "#34C759"}
                          />
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: "700",
                              color: badge.is_locked ? "#F2F2F7" : "#34C759",
                            }}
                          >
                            {badge.is_locked ? "LOCKED" : "UNLOCKED"}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          ) : null}

          {/* Tab 2: Challenges View */}
          {activeTab === "challenges" && gamification ? (
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name="flag-outline" size={16} color="#E91E63" />
                  <Text style={{ fontSize: 13, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5 }}>
                    MONTHLY & CONSISTENCY CHALLENGES
                  </Text>
                </View>
                <Text style={{ fontSize: 11, fontWeight: "600", color: "#F2F2F7" }}>Earn Points</Text>
              </View>

              {challenges.length === 0 ? (
                <EmptyState
                  title="No Active Challenges"
                  message="Check back soon for upcoming monthly challenges and seasonal consistency sprints."
                  icon="flag-outline"
                />
              ) : (
                <View style={{ gap: 10 }}>
                  {challenges.map((ch: any) => {
                    const isCompleted = ch.badge_tag === "COMPLETED";
                    const isInProgress = ch.badge_tag === "IN_PROGRESS";
                    const tagBg = isCompleted
                      ? "rgba(52, 199, 89, 0.15)"
                      : isInProgress
                      ? ch.id === "ch-strength"
                        ? "rgba(0, 122, 255, 0.15)"
                        : "rgba(233, 30, 99, 0.15)"
                      : "rgba(0, 122, 255, 0.15)";
                    const tagBorder = isCompleted
                      ? "rgba(52, 199, 89, 0.3)"
                      : isInProgress
                      ? ch.id === "ch-strength"
                        ? "rgba(0, 122, 255, 0.3)"
                        : "rgba(233, 30, 99, 0.3)"
                      : "rgba(0, 122, 255, 0.3)";
                    const tagColor = isCompleted
                      ? "#34C759"
                      : isInProgress
                      ? ch.id === "ch-strength"
                        ? "#007AFF"
                        : "#E91E63"
                      : "#007AFF";

                    return (
                      <View
                        key={ch.id}
                        style={{
                          backgroundColor: "#000000",
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: "rgba(255, 255, 255, 0.08)",
                          padding: 14,
                          gap: 10,
                        }}
                      >
                        {/* Top row */}
                        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                          <View
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: 21,
                              backgroundColor: tagBg,
                              borderWidth: 1,
                              borderColor: tagBorder,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Ionicons name={(ch.icon_name || "trophy-outline") as any} size={20} color={tagColor} />
                          </View>

                          <View style={{ flex: 1, gap: 4 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                              <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>{ch.title}</Text>
                              <View
                                style={{
                                  backgroundColor: tagBg,
                                  borderWidth: 1,
                                  borderColor: tagBorder,
                                  borderRadius: 6,
                                  paddingHorizontal: 6,
                                  paddingVertical: 2,
                                }}
                              >
                                <Text style={{ fontSize: 9, fontWeight: "800", color: tagColor }}>{ch.badge_tag}</Text>
                              </View>
                            </View>
                            <Text style={{ fontSize: 12, color: "#F2F2F7" }}>{ch.description}</Text>
                          </View>

                          {/* Points pill */}
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                            <Ionicons name="star" size={13} color={tagColor} />
                            <Text style={{ fontSize: 14, fontWeight: "900", color: tagColor }}>
                              {`+${ch.reward_points}`}
                            </Text>
                          </View>
                        </View>

                        {/* Bottom row: Progress & CTA */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingTop: 8,
                            borderTopWidth: 1,
                            borderTopColor: "rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          <Text style={{ fontSize: 12, color: "#F2F2F7" }}>
                            {`${ch.current_progress} / ${ch.total_progress} ${ch.progress_label || ch.unit}`}
                          </Text>

                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={isInProgress ? "View Details" : "Start Challenge"}
                            onPress={() => setSelectedChallenge(ch)}
                            style={({ pressed }) => [
                              { flexDirection: "row", alignItems: "center", gap: 2 },
                              pressed && { opacity: 0.7 },
                            ]}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: "800",
                                color: isInProgress ? "#E91E63" : "#007AFF",
                              }}
                            >
                              {isInProgress ? "View Details >" : isCompleted ? "Completed ✓" : "Start Challenge >"}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          ) : null}

          {/* Tab 3: Perks Store View */}
          {activeTab === "perks" && gamification ? (
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <Ionicons name="bag-handle-outline" size={18} color="#E91E63" />
                <Text style={{ fontSize: 13, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5 }}>
                  REDEEM GYM REWARDS
                </Text>
              </View>

              {redeemSuccessMsg ? (
                <NoticeBanner tone="success" message={redeemSuccessMsg} />
              ) : null}

              {redeemPerk.error ? (
                <NoticeBanner tone="error" message={getApiErrorMessage(redeemPerk.error)} />
              ) : null}

              {perks.length === 0 ? (
                <EmptyState
                  title="No Perks in Store"
                  message="Reward items are replenished periodically. Check back soon!"
                  icon="gift-outline"
                />
              ) : (
                <View style={{ gap: 10 }}>
                  {perks.map((perk: any) => {
                    const canAfford = points >= perk.cost_pts;
                    return (
                      <View
                        key={perk.id}
                        style={{
                          backgroundColor: "#000000",
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: "rgba(255, 255, 255, 0.08)",
                          padding: 14,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <View style={{ flex: 1, gap: 3 }}>
                          <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>{perk.title}</Text>
                          <Text style={{ fontSize: 12, color: "#F2F2F7" }}>{perk.description}</Text>
                        </View>

                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Redeem ${perk.title} for ${perk.cost_pts} PTS`}
                          disabled={!canAfford || redeemPerk.isPending}
                          onPress={() => handleRedeem(perk)}
                          style={({ pressed }) => [
                            {
                              backgroundColor: canAfford ? "rgba(233, 30, 99, 0.15)" : "#1C1C1E",
                              borderWidth: 1,
                              borderColor: canAfford ? "rgba(233, 30, 99, 0.4)" : "rgba(255, 255, 255, 0.08)",
                              borderRadius: 999,
                              paddingHorizontal: 16,
                              paddingVertical: 9,
                              opacity: canAfford ? (pressed ? 0.8 : 1) : 0.6,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "800",
                              color: canAfford ? "#E91E63" : "#F2F2F7",
                            }}
                          >
                            {`${perk.cost_pts} PTS`}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          ) : null}

          {/* Modal: Inspect Badge */}
          {selectedBadge ? (
            <Modal
              visible={!!selectedBadge}
              transparent
              animationType="fade"
              onRequestClose={() => setSelectedBadge(null)}
            >
              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0, 0, 0, 0.75)",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 24,
                }}
                onPress={() => setSelectedBadge(null)}
              >
                <Pressable
                  style={{
                    width: "100%",
                    maxWidth: 340,
                    backgroundColor: "#000000",
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.12)",
                    padding: 20,
                    alignItems: "center",
                    gap: 12,
                  }}
                  onPress={(e) => e.stopPropagation()}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: selectedBadge.theme_color,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 3,
                      borderColor: "rgba(255, 255, 255, 0.4)",
                      shadowColor: selectedBadge.theme_color,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.4,
                      shadowRadius: 14,
                      elevation: 6,
                    }}
                  >
                    <Ionicons
                      name={(selectedBadge.icon_name || "star") as any}
                      size={36}
                      color={getBadgeIconColor(selectedBadge)}
                    />
                  </View>

                  <Text style={{ fontSize: 18, fontWeight: "900", color: "#FFFFFF", textAlign: "center" }}>
                    {selectedBadge.title}
                  </Text>

                  <View
                    style={{
                      backgroundColor: selectedBadge.is_locked ? "#1C1C1E" : "rgba(52, 199, 89, 0.15)",
                      borderWidth: 1,
                      borderColor: selectedBadge.is_locked ? "rgba(255, 255, 255, 0.1)" : "rgba(52, 199, 89, 0.3)",
                      borderRadius: 999,
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "800",
                        color: selectedBadge.is_locked ? "#F2F2F7" : "#34C759",
                      }}
                    >
                      {selectedBadge.is_locked ? "🔒 CURRENTLY LOCKED" : "✓ UNLOCKED"}
                    </Text>
                  </View>

                  <Text style={{ fontSize: 13, color: "#F2F2F7", textAlign: "center", lineHeight: 18 }}>
                    {selectedBadge.description}
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setSelectedBadge(null)}
                    style={{
                      marginTop: 8,
                      width: "100%",
                      backgroundColor: "#1C1C1E",
                      borderRadius: 12,
                      paddingVertical: 11,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>Close</Text>
                  </Pressable>
                </Pressable>
              </Pressable>
            </Modal>
          ) : null}

          {/* Modal: Challenge Details */}
          {selectedChallenge ? (
            <Modal
              visible={!!selectedChallenge}
              transparent
              animationType="fade"
              onRequestClose={() => setSelectedChallenge(null)}
            >
              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0, 0, 0, 0.75)",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 24,
                }}
                onPress={() => setSelectedChallenge(null)}
              >
                <Pressable
                  style={{
                    width: "100%",
                    maxWidth: 340,
                    backgroundColor: "#000000",
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.12)",
                    padding: 20,
                    gap: 14,
                  }}
                  onPress={(e) => e.stopPropagation()}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 16, fontWeight: "900", color: "#FFFFFF", flex: 1 }}>
                      {selectedChallenge.title}
                    </Text>
                    <Pressable onPress={() => setSelectedChallenge(null)}>
                      <Ionicons name="close" size={20} color="#F2F2F7" />
                    </Pressable>
                  </View>

                  <Text style={{ fontSize: 13, color: "#F2F2F7", lineHeight: 18 }}>
                    {selectedChallenge.description}
                  </Text>

                  <View
                    style={{
                      backgroundColor: "#1C1C1E",
                      borderRadius: 12,
                      padding: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: 12, color: "#F2F2F7" }}>Reward on completion:</Text>
                    <Text style={{ fontSize: 14, fontWeight: "900", color: "#E91E63" }}>
                      {`+${selectedChallenge.reward_points} PTS`}
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      const ch = selectedChallenge;
                      setSelectedChallenge(null);
                      handleChallengeAction(ch);
                    }}
                    style={{
                      backgroundColor: "#E91E63",
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "800", color: "#FFFFFF" }}>
                      Go to Activity
                    </Text>
                  </Pressable>
                </Pressable>
              </Pressable>
            </Modal>
          ) : null}
        </Screen>
      );
    }
  }
}



export function MemberSupportScreenView({ model }: { model: ReturnType<typeof useMemberSupportScreenPresentation> }): React.ReactNode {
  const [validationError, setValidationError] = useState<string>();
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, SectionTitle, navigation, category, setCategory, subject, setSubject, message, setMessage, createTicket, submit, gymFeedbackQuery, saveGymFeedback, gymRating, setGymRating, gymFeedbackText, setGymFeedbackText, gymFeedbackOption, setGymFeedbackOption, submitGymFeedback } = model.props;
      const gymFeedbackOptions = [
        ["Clean and maintained", "The gym is clean, organised, and well maintained. The workout areas and equipment feel comfortable to use, and I appreciate the effort the team puts into keeping shared spaces hygienic and welcoming."],
        ["Friendly staff", "The staff are friendly, approachable, and helpful whenever I need assistance. Their positive attitude creates a welcoming environment and makes the overall gym experience more comfortable and supportive."],
        ["Great equipment", "The gym provides a useful variety of equipment for strength, cardio, and general fitness. The machines are usually available and in good condition, which helps me complete my workouts effectively."],
        ["Helpful trainers", "The trainers are knowledgeable, encouraging, and willing to help. Their guidance makes exercises easier to understand and helps members feel confident, safe, and motivated during their fitness journey."],
        ["Could improve", "My overall experience is positive, but equipment availability, maintenance, or communication could be improved. I am sharing this feedback because I value the gym and would like the member experience to become even better."],
        ["Other", ""]
      ] as const;
      return ((
    <Screen scroll keyboard contentContainerStyle={styles.screen}>
      <ScreenHeader title="Support" subtitle="Trainer and gym contact" icon="chatbubbles-outline" />
      <View style={styles.panel}>
        <SectionTitle title="New Request" />
        <FormTextField required maxLength={80} label="Category" value={category} onChangeText={setCategory} leftIcon="pricetag-outline" />
        <FormTextField required maxLength={180} label="Subject" value={subject} onChangeText={setSubject} leftIcon="text-outline" />
        <FormTextField required maxLength={2000} label="Message" value={message} onChangeText={setMessage} leftIcon="chatbubble-outline" multiline />
        <NoticeBanner message={validationError ?? null} tone="error" />
        <PrimaryButton title="Send Request" icon="send-outline" loading={createTicket.isPending} onPress={() => {
          const error = supportFormError(category, subject, message); setValidationError(error);
          if (!error && !createTicket.isPending) submit();
        }} />
        <NoticeBanner message={createTicket.error ? getApiErrorMessage(createTicket.error) : createTicket.data ? "Request sent." : null} tone={createTicket.error ? "error" : "success"} />
      </View>
      <Text style={styles.rowText}>Requests are sent to your gym. This screen does not provide live chat or phone calls.</Text>
      <ScrollListCard title="Trainer request" subtitle="Prepare a request about training" icon="person-outline" onPress={() => { setCategory("trainer"); setSubject("Training support"); }} />
      <ScrollListCard title="Trainer feedback" subtitle="Rate and review your assigned trainer" icon="star-outline" onPress={() => navigation.navigate("MemberTrainer")} />
      <ScrollListCard title="Reception" subtitle="Prepare a front desk request" icon="call-outline" onPress={() => { setCategory("reception"); setSubject("Front desk support"); }} />
      <ScrollListCard title="Gym feedback" subtitle="Rate and review your gym" icon="heart-outline" onPress={() => { setCategory("feedback"); setSubject("Gym feedback"); }} />
      {category === "feedback" ? <View style={styles.feedbackPanel}>
        <View style={styles.feedbackHeader}><Text style={styles.feedbackTitle}>Rate your gym</Text><Text style={styles.kicker}>{gymFeedbackQuery.data ? "Update this month’s gym review." : "Tell your gym what is working well and what could improve."}</Text></View>
        <View style={styles.feedbackScoreRow}>
          <View style={styles.feedbackStars}>{[1, 2, 3, 4, 5].map((star) => <Pressable key={star} accessibilityRole="button" accessibilityLabel={`Rate ${star} out of 5`} onPress={() => setGymRating(star)} style={[styles.feedbackStarButton, star <= gymRating && styles.feedbackStarButtonActive]}><Text style={[styles.feedbackStar, { color: star <= gymRating ? "#E91E63" : colors.muted }]}>★</Text></Pressable>)}</View>
          <Text style={styles.feedbackScoreText}>{gymRating} of 5</Text>
        </View>
        <Text style={styles.feedbackScoreText}>Choose an optional message</Text>
        <View style={styles.feedbackOptions}>{gymFeedbackOptions.map(([option, draft]) => <Pressable key={option} accessibilityRole="button" onPress={() => { setGymFeedbackOption(option); setGymFeedbackText(draft); }} style={[styles.feedbackOption, gymFeedbackOption === option && styles.feedbackOptionActive]}><Text style={styles.feedbackOptionText}>{option}</Text></Pressable>)}</View>
        <FormTextField label={gymFeedbackOption === "Other" ? "Write your own message" : "Review message (optional)"} value={gymFeedbackText} onChangeText={(value) => { setGymFeedbackText(value); if (gymFeedbackOption && gymFeedbackOption !== "Other") setGymFeedbackOption("Other"); }} placeholder="Share your gym experience" multiline maxLength={1200} helper={`${gymFeedbackText.trim() ? gymFeedbackText.trim().split(/\s+/).length : 0} words`} />
        <PrimaryButton title={gymFeedbackQuery.data ? "Update gym review" : "Submit gym review"} icon="star-outline" loading={saveGymFeedback.isPending} onPress={submitGymFeedback} />
        <NoticeBanner message={saveGymFeedback.error ? getApiErrorMessage(saveGymFeedback.error) : saveGymFeedback.data ? "Thank you. Your gym review was saved." : null} tone={saveGymFeedback.error ? "error" : "success"} />
      </View> : null}

    </Screen>
  ));
    }
  }
}

export { MemberSettingsView as MemberSettingsScreenView } from "./MemberSettingsView";

