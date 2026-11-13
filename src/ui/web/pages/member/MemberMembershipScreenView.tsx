import { getMemberC, darkThemeColors } from "../../../../theme/colors";
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import QRCode from "react-native-qrcode-svg";
import { useMemberMembership, useMemberNotifications, memberQueryKeys } from "../../../../hooks/useMember";
import { useAuthStore } from "../../../../store/useAuthStore";
import { MemberPaymentReceipt } from "../../../../features/operations/MemberPaymentReceipt";
import { membershipCheckoutApi } from "../../../../services/api/membershipCheckout";
import { getApiErrorMessage } from "../../../../services/api/client";

// ─── Theme Colors ─────────────────────────────────────────────────────────────
const C = getMemberC(darkThemeColors);

// ─── Plan Interface ───────────────────────────────────────────────────────────
interface PricingPlan {
  id: string;
  name: string;
  price: string;
  priceCents: number;
  currency: string;
  durationDays: number;
  durationLabel: string;
  description: string;
  visitsLabel: string;
  isPopular?: boolean;
  features: string[];
}

export function MemberMembershipScreenView(_props?: any) {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const query = useMemberMembership();
  const unreadNotifications = useMemberNotifications(true).data ?? [];
  const user = useAuthStore((state) => state.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [autoRenew, setAutoRenew] = useState(true);
  const [digitalPassModalOpen, setDigitalPassModalOpen] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<PricingPlan | null>(null);

  // Checkout submission states
  const [transactionRef, setTransactionRef] = useState("");
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<{ text: string; error?: boolean } | null>(null);

  // Real Membership Data from API
  const membership = query.data;
  const gymName = membership?.gym_name || "ZD FITNESS";
  const planName = membership?.membership_plan_name || "Basic Plan";
  const planDescription = membership?.plan_description || "Perfect for getting started";
  const daysLeft = membership?.days_remaining ?? 0;
  const daysTotal = membership?.plan_duration_days ?? 30;
  const daysCompleted = Math.max(0, daysTotal - daysLeft);
  const planCurrencySymbol = membership?.plan_currency === "INR" ? "₹" : "$";
  const price = membership?.plan_price_cents != null
    ? `${planCurrencySymbol}${Number((membership.plan_price_cents / 100).toFixed(0)).toLocaleString()}`
    : "₹999";
  const dailyVisits = membership?.plan_daily_visit_limit != null ? `${membership.plan_daily_visit_limit}` : "1";
  const startDate = formatDate(membership?.start_date);
  const expiryDate = formatDate(membership?.expiry_date);

  function formatDate(d: string | null | undefined) {
    if (!d) return "--";
    try {
      const parsed = new Date(d);
      if (isNaN(parsed.getTime())) return d;
      return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return d;
    }
  }

  // Real Gym Owner Created Plans from Database (via API)
  const plans: PricingPlan[] = useMemo(() => {
    const list = membership?.available_plans ?? [];
    if (list.length === 0) {
      return [];
    }
    return list.map((p, index) => {
      const sym = p.currency === "INR" ? "₹" : "$";
      const amt = Number((p.price_cents / 100).toFixed(0)).toLocaleString();
      const isPopular = p.name.toLowerCase().includes("standard") || index === 1;
      return {
        id: p.plan_uuid,
        name: p.name,
        price: `${sym}${amt}`,
        priceCents: p.price_cents,
        currency: p.currency,
        durationDays: p.duration_days,
        durationLabel: `${p.duration_days} days`,
        description: p.description || "Designed to reach your peak performance",
        visitsLabel: `Up to ${p.daily_visit_limit ?? 1} visits per day`,
        isPopular,
        features: Array.isArray(p.benefits) && p.benefits.length > 0 ? p.benefits : ["Full Gym Access", "Equipment Access"],
      };
    });
  }, [membership?.available_plans]);

  // Filter plans based on search bar
  const filteredPlans = useMemo(() => {
    if (!searchQuery.trim()) return plans;
    const q = searchQuery.toLowerCase().trim();
    return plans.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.features.some((f) => f.toLowerCase().includes(q))
    );
  }, [plans, searchQuery]);

  // Filter real membership payment history based on search bar
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

  // Current real date formatted for header
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  // Pass QR payload
  const passQrValue = useMemo(() => {
    return JSON.stringify({
      member_uuid: membership?.member_uuid || user?.id,
      name: membership?.member_name || user?.full_name,
      plan: planName,
      status: membership?.status || "active",
      valid_until: expiryDate,
    });
  }, [membership, user, planName, expiryDate]);

  // Handle plan purchase / upgrade submission
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
        transaction_reference: transactionRef.trim() || `TXN-${Date.now().toString(36).toUpperCase()}`,
      });
      setCheckoutNotice({
        text: `Payment request submitted for ${selectedCheckoutPlan.name}! Gym administration will verify and activate your plan.`,
      });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.membership() });
      queryClient.invalidateQueries({ queryKey: ["member"] });
      setTimeout(() => {
        setSelectedCheckoutPlan(null);
        setCheckoutNotice(null);
        setTransactionRef("");
      }, 2500);
    } catch (err: any) {
      setCheckoutNotice({
        text: getApiErrorMessage(err) || "Could not submit plan checkout. Please try again or contact gym staff.",
        error: true,
      });
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* ── Top Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => navigation.goBack?.()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={18} color={C.white} />
          </Pressable>
          <View>
            <Text style={styles.pageTitle}>Membership</Text>
            <Text style={styles.pageSubtitle}>Plan and renewal details</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={14} color={C.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search plans &amp; receipts..."
              placeholderTextColor={C.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Real date pill */}
          <View style={styles.datePill}>
            <Ionicons name="calendar-outline" size={14} color={C.primary} />
            <Text style={styles.datePillText}>{todayFormatted}</Text>
          </View>

          {/* Notification bell */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => navigation.navigate("MemberNotifications")}
            style={styles.bellBtn}
          >
            <Ionicons name="notifications-outline" size={18} color={C.white} />
            {unreadNotifications.length > 0 ? <View style={styles.bellBadgeDot} /> : null}
          </Pressable>

          {/* Profile Avatar */}
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>
              {user?.full_name
                ? user.full_name.charAt(0).toUpperCase()
                : membership?.member_name
                ? membership.member_name.charAt(0).toUpperCase()
                : "M"}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Eyebrow */}
        <Text style={styles.sectionKicker}>CURRENT MEMBERSHIP</Text>

        {/* ── Big Current Membership Card ── */}
        <View style={styles.currentCardContainer}>
          {/* Soft emerald backlight in corner */}
          <View style={styles.emeraldCornerGlow} />

          {/* Card Top: Gym Pass & Status */}
          <View style={styles.currentCardHeader}>
            <View>
              <Text style={styles.verifiedPassText}>
                {gymName.toUpperCase()} • VERIFIED PASS
              </Text>
              <Text style={styles.currentPlanTitle}>{planName}</Text>
              <Text style={styles.currentPlanSubtitle}>{planDescription}</Text>
            </View>

            <View style={styles.activeStatusBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeStatusText}>
                {(membership?.status || "ACTIVE").toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Content Layout: Left Circle + Right 7 Stat Cards */}
          <View style={styles.currentCardBody}>
            {/* Left Circular Ring */}
            <View style={styles.leftRingCard}>
              <View style={styles.ringGraphicWrap}>
                <View style={styles.ringCircleTrack}>
                  <View style={styles.ringCircleGreenArc} />
                  <View style={styles.ringInnerCenter}>
                    <Text style={styles.ringCenterNumber}>{daysLeft}</Text>
                    <Text style={styles.ringCenterLabel}>DAYS LEFT</Text>
                  </View>
                </View>
              </View>

              <View style={styles.ringTextCol}>
                <Text style={styles.periodMutedLabel}>Subscription Period</Text>
                <Text style={styles.periodPlanName}>{daysTotal} Days Plan</Text>
                <Text style={styles.periodDaysCompleted}>{daysCompleted} Days Completed</Text>
              </View>
            </View>

            {/* Right 7 Stat Cards Grid */}
            <View style={styles.rightStatsGrid}>
              {/* 1. Price */}
              <View style={styles.miniStatCard}>
                <View style={[styles.miniStatIcon, { backgroundColor: C.greenBg }]}>
                  <Ionicons name="cash-outline" size={14} color={C.green} />
                </View>
                <Text style={styles.miniStatVal}>{price}</Text>
                <Text style={styles.miniStatKey}>Price</Text>
              </View>

              {/* 2. Days left */}
              <View style={styles.miniStatCard}>
                <View style={[styles.miniStatIcon, { backgroundColor: C.redBg }]}>
                  <Ionicons name="calendar-number-outline" size={14} color={C.red} />
                </View>
                <Text style={styles.miniStatVal}>{daysLeft}</Text>
                <View style={styles.miniSubRow}>
                  <Text style={styles.miniStatKey}>Days left</Text>
                  <Text style={styles.noReminderText}>
                    {membership?.renewal_reminder || "No reminder"}
                  </Text>
                </View>
              </View>

              {/* 3. Days completed */}
              <View style={styles.miniStatCard}>
                <View style={[styles.miniStatIcon, { backgroundColor: C.greenBg }]}>
                  <Ionicons name="checkmark-circle-outline" size={14} color={C.green} />
                </View>
                <Text style={styles.miniStatVal}>{daysCompleted}</Text>
                <Text style={styles.miniStatKey}>Days completed</Text>
              </View>

              {/* 4. Duration */}
              <View style={styles.miniStatCard}>
                <View style={[styles.miniStatIcon, { backgroundColor: C.cyanBg }]}>
                  <Ionicons name="time-outline" size={14} color={C.cyan} />
                </View>
                <Text style={styles.miniStatVal}>{daysTotal}d</Text>
                <Text style={styles.miniStatKey}>Duration</Text>
              </View>

              {/* 5. Daily visits */}
              <View style={styles.miniStatCard}>
                <View style={[styles.miniStatIcon, { backgroundColor: C.redBg }]}>
                  <Ionicons name="footsteps-outline" size={14} color={C.red} />
                </View>
                <Text style={styles.miniStatVal}>{dailyVisits}</Text>
                <Text style={styles.miniStatKey}>Daily visits</Text>
              </View>

              {/* 6. Start date */}
              <View style={styles.miniStatCard}>
                <View style={[styles.miniStatIcon, { backgroundColor: C.purpleBg }]}>
                  <Ionicons name="calendar-outline" size={14} color={C.purple} />
                </View>
                <Text style={styles.miniStatValSmall}>{startDate}</Text>
                <Text style={styles.miniStatKey}>Start date</Text>
              </View>

              {/* 7. Expiry */}
              <View style={styles.miniStatCard}>
                <View style={[styles.miniStatIcon, { backgroundColor: C.redBg }]}>
                  <Ionicons name="calendar-clear-outline" size={14} color={C.red} />
                </View>
                <Text style={styles.miniStatValSmall}>{expiryDate}</Text>
                <Text style={styles.miniStatKey}>Expiry</Text>
              </View>
            </View>
          </View>

          {/* Bottom Card Actions Row */}
          <View style={styles.currentCardFooter}>
            <View style={styles.footerBtnsLeft}>
              {/* View Digital Pass */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View Digital Pass"
                onPress={() => setDigitalPassModalOpen(true)}
                style={styles.viewPassBtn}
              >
                <Ionicons name="qr-code-outline" size={16} color={C.green} />
                <Text style={styles.viewPassBtnText}>View Digital Pass</Text>
              </Pressable>

              {/* Upgrade Plan */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Upgrade Plan"
                onPress={() => {
                  const upgradeCandidate =
                    plans.find((p) => p.id !== membership?.membership_plan_uuid) ||
                    plans[1] ||
                    plans[0];
                  if (upgradeCandidate) {
                    setSelectedCheckoutPlan(upgradeCandidate);
                  }
                }}
                style={styles.upgradePlanBtn}
              >
                <Text style={styles.upgradePlanBtnText}>Upgrade Plan</Text>
              </Pressable>
            </View>

            {/* Auto-Renew Switch */}
            <View style={styles.autoRenewRow}>
              <Text style={styles.autoRenewLabel}>Auto-Renew Subscription:</Text>
              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: autoRenew }}
                onPress={() => setAutoRenew(!autoRenew)}
                style={[styles.toggleTrack, autoRenew && styles.toggleTrackActive]}
              >
                <View style={[styles.toggleThumb, autoRenew && styles.toggleThumbActive]} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Choose Your Plan Section ── */}
        <View style={styles.plansSectionHeader}>
          <Text style={styles.plansSectionTitle}>Choose your plan</Text>
          <Text style={styles.plansSectionSubtitle}>
            Find the membership that fits your training goals.
          </Text>
        </View>

        {/* Real Dynamic Plans Grid */}
        <View style={styles.plansRow}>
          {filteredPlans.length === 0 ? (
            <View style={styles.emptyPlansCard}>
              <Ionicons name="cube-outline" size={32} color={C.muted} />
              <Text style={styles.emptyPlansText}>
                {query.isLoading ? "Loading membership plans..." : "No membership plans found."}
              </Text>
            </View>
          ) : (
            filteredPlans.map((plan) => (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  plan.isPopular && styles.planCardPopular,
                ]}
              >
                {/* Popular Badge */}
                {plan.isPopular ? (
                  <View style={styles.popularBadgeWrap}>
                    <LinearGradient
                      colors={["#E91E63", "#E91E63"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.popularBadge}
                    >
                      <Text style={styles.popularBadgeText}>POPULAR</Text>
                    </LinearGradient>
                  </View>
                ) : null}

                <Text style={styles.planCardTitle}>{plan.name}</Text>

                <View style={styles.planPriceRow}>
                  <Text style={styles.planPriceAmount}>{plan.price}</Text>
                  <Text style={styles.planPriceDuration}> / {plan.durationLabel}</Text>
                </View>

                <Text style={styles.planCardDesc}>{plan.description}</Text>

                {/* Visits pill */}
                <View
                  style={[
                    styles.visitsPill,
                    plan.isPopular && styles.visitsPillPopular,
                  ]}
                >
                  <Text
                    style={[
                      styles.visitsPillText,
                      plan.isPopular && styles.visitsPillTextPopular,
                    ]}
                  >
                    {plan.visitsLabel}
                  </Text>
                </View>

                {/* Feature checkmarks */}
                <View style={styles.featuresList}>
                  {plan.features.map((feat, idx) => (
                    <View key={idx} style={styles.featureItemRow}>
                      <Ionicons name="checkmark" size={15} color={C.primary} />
                      <Text style={styles.featureItemText}>{feat}</Text>
                    </View>
                  ))}
                </View>

                {/* Choose plan button */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Choose ${plan.name}`}
                  onPress={() => {
                    setSelectedCheckoutPlan(plan);
                    setCheckoutNotice(null);
                    setTransactionRef("");
                  }}
                  style={styles.choosePlanBtn}
                >
                  <LinearGradient
                    colors={["#E91E63", "#E91E63"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.choosePlanBtnGradient}
                  >
                    <Text style={styles.choosePlanBtnText}>Choose plan</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ))
          )}
        </View>

        {/* ── Membership History Section ── */}
        <View style={styles.historySection}>
          <Text style={styles.historySectionTitle}>Membership History</Text>
          {filteredHistory.length === 0 ? (
            <View style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <View style={[styles.receiptIconBox, { backgroundColor: "rgba(255,255,255,0.05)", borderColor: C.cardBorder }]}>
                  <Ionicons name="receipt-outline" size={18} color={C.muted} />
                </View>
                <View>
                  <Text style={styles.historyPlanTitle}>{planName}</Text>
                  <Text style={styles.historyPlanDates}>
                    {startDate !== "--" ? `Active cycle: ${startDate} - ${expiryDate}` : "No recorded billing receipts yet"}
                  </Text>
                </View>
              </View>

              <View style={styles.historyRight}>
                <Text style={styles.historyPriceText}>{price}</Text>
                <View style={styles.paidBadge}>
                  <Text style={styles.paidBadgeText}>
                    {(membership?.status || "ACTIVE").toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            filteredHistory.map((item) => {
              const itemSym = item.currency === "INR" ? "₹" : "$";
              const itemAmt = item.amount_cents != null
                ? `${itemSym}${Number((item.amount_cents / 100).toFixed(0)).toLocaleString()}`
                : price;
              const paidDateStr = item.paid_at ? formatDate(item.paid_at) : formatDate(item.start_date);
              const dateRangeStr = item.start_date && item.expiry_date
                ? `${formatDate(item.start_date)} - ${formatDate(item.expiry_date)}`
                : "Active period";

              const isPaidItem = item.status.toLowerCase() === "paid";

              return (
                <MemberPaymentReceipt key={item.membership_uuid} paymentId={item.membership_uuid}>
                  {(openReceipt, isGenerating) => (
                    <Pressable
                      accessibilityRole={isPaidItem ? "button" : undefined}
                      accessibilityLabel={isPaidItem ? `View receipt for ${item.membership_plan_name || planName}` : undefined}
                      disabled={!isPaidItem || isGenerating}
                      onPress={openReceipt}
                      style={({ pressed }) => [
                        styles.historyCard,
                        isPaidItem && pressed && { opacity: 0.88 },
                      ]}
                    >
                      <View style={styles.historyLeft}>
                        <View style={styles.receiptIconBox}>
                          <Ionicons name="receipt-outline" size={18} color={C.primary} />
                        </View>
                        <View>
                          <Text style={styles.historyPlanTitle}>
                            {item.membership_plan_name || planName}
                          </Text>
                          <Text style={styles.historyPlanDates}>
                            Paid {paidDateStr} • {dateRangeStr}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.historyRight}>
                        <Text style={styles.historyPriceText}>{itemAmt}</Text>
                        <View
                          style={[
                            styles.paidBadge,
                            !isPaidItem && {
                              backgroundColor: "rgba(233, 30, 99, 0.15)",
                              borderColor: "rgba(233, 30, 99, 0.4)",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.paidBadgeText,
                              !isPaidItem && { color: "#E91E63" },
                            ]}
                          >
                            {item.status.toUpperCase()}
                          </Text>
                        </View>

                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="View Receipt"
                          onPress={openReceipt}
                          disabled={!isPaidItem || isGenerating}
                          style={styles.downloadReceiptBtn}
                        >
                          {isGenerating ? (
                            <ActivityIndicator size="small" color={C.muted} />
                          ) : (
                            <Ionicons name="document-text-outline" size={16} color={C.muted} />
                          )}
                        </Pressable>
                      </View>
                    </Pressable>
                  )}
                </MemberPaymentReceipt>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ── Floating Ask Gemini Pill ── */}
      <View style={styles.floatingGeminiPill}>
        <Ionicons name="sparkles" size={13} color="#007AFF" />
        <Text style={styles.floatingGeminiText}>Ask Gemini</Text>
      </View>

      {/* ── Digital Pass Modal (Real QR Code) ── */}
      <Modal
        visible={digitalPassModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDigitalPassModalOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setDigitalPassModalOpen(false)}
        >
          <Pressable style={styles.passModalCard} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.passCardHeader}>
              <View>
                <Text style={styles.passVerifiedLabel}>VERIFIED MEMBER PASS</Text>
                <Text style={styles.passGymName}>{gymName}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={styles.modalCloseCircle}
                onPress={() => setDigitalPassModalOpen(false)}
              >
                <Ionicons name="close" size={18} color={C.muted} />
              </Pressable>
            </View>

            {/* Real Member Info */}
            <View style={styles.passMemberRow}>
              <View style={styles.passAvatar}>
                <Text style={styles.passAvatarText}>
                  {user?.full_name
                    ? user.full_name.charAt(0).toUpperCase()
                    : membership?.member_name
                    ? membership.member_name.charAt(0).toUpperCase()
                    : "M"}
                </Text>
              </View>
              <View>
                <Text style={styles.passMemberName}>
                  {membership?.member_name || user?.full_name || "Member"}
                </Text>
                <Text style={styles.passMemberId}>
                  Member ID: #M-{(membership?.member_uuid || user?.id || "8842").slice(0, 6).toUpperCase()}
                </Text>
                <Text style={styles.passPlanType}>
                  {planName} • {(membership?.status || "Active").toUpperCase()}
                </Text>
              </View>
            </View>

            {/* QR Scanner Display with Real Scannable QR */}
            <View style={styles.passQrContainer}>
              <View style={styles.passQrBox}>
                <QRCode
                  value={passQrValue}
                  size={160}
                  backgroundColor="#FFFFFF"
                  color="#1C1C1E"
                />
              </View>
              <Text style={styles.passQrHint}>Scan at reception turnstile kiosk</Text>
            </View>

            {/* Validity details */}
            <View style={styles.passValidityRow}>
              <View>
                <Text style={styles.passValKey}>Valid From</Text>
                <Text style={styles.passValVal}>{startDate}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.passValKey}>Expires On</Text>
                <Text style={styles.passValVal}>{expiryDate}</Text>
              </View>
            </View>

            <Pressable
              style={styles.passCloseBtn}
              onPress={() => setDigitalPassModalOpen(false)}
            >
              <Text style={styles.passCloseBtnText}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Plan Checkout Modal (Real API Submission) ── */}
      <Modal
        visible={selectedCheckoutPlan !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCheckoutPlan(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSelectedCheckoutPlan(null)}
        >
          <Pressable style={styles.checkoutModalCard} onPress={(e) => e.stopPropagation()}>
            {selectedCheckoutPlan ? (
              <>
                <View style={styles.modalHeaderRow}>
                  <View>
                    <Text style={styles.checkoutModalTitle}>Upgrade to {selectedCheckoutPlan.name}</Text>
                    <Text style={styles.checkoutModalSubtitle}>
                      {selectedCheckoutPlan.price} for {selectedCheckoutPlan.durationLabel}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    style={styles.modalCloseCircle}
                    onPress={() => setSelectedCheckoutPlan(null)}
                  >
                    <Ionicons name="close" size={18} color={C.muted} />
                  </Pressable>
                </View>

                <View style={styles.checkoutFeaturesList}>
                  {selectedCheckoutPlan.features.map((feat, idx) => (
                    <View key={idx} style={styles.featureItemRow}>
                      <Ionicons name="checkmark-circle" size={16} color={C.green} />
                      <Text style={[styles.featureItemText, { color: C.white }]}>{feat}</Text>
                    </View>
                  ))}
                </View>

                {/* Transaction Reference input */}
                <View style={styles.txInputContainer}>
                  <Text style={styles.txInputLabel}>Transaction Reference / UTR (Optional)</Text>
                  <TextInput
                    style={styles.txInput}
                    placeholder="Enter bank or UPI transaction reference"
                    placeholderTextColor={C.muted}
                    value={transactionRef}
                    onChangeText={setTransactionRef}
                  />
                  <Text style={styles.txInputHint}>
                    Pay to gym reception or QR and enter the reference number.
                  </Text>
                </View>

                <View style={styles.checkoutTotalRow}>
                  <Text style={styles.checkoutTotalKey}>Total Due Today</Text>
                  <Text style={styles.checkoutTotalVal}>{selectedCheckoutPlan.price}</Text>
                </View>

                {checkoutNotice ? (
                  <View
                    style={[
                      styles.checkoutNoticeBox,
                      checkoutNotice.error && styles.checkoutNoticeBoxError,
                    ]}
                  >
                    <Ionicons
                      name={checkoutNotice.error ? "alert-circle" : "checkmark-circle"}
                      size={16}
                      color={checkoutNotice.error ? C.primary : C.green}
                    />
                    <Text
                      style={[
                        styles.checkoutNoticeText,
                        checkoutNotice.error && { color: C.primary },
                      ]}
                    >
                      {checkoutNotice.text}
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  style={styles.actionBtnWrap}
                  disabled={isSubmittingCheckout}
                  onPress={handleProceedToPayment}
                >
                  <LinearGradient
                    colors={["#E91E63", "#E91E63"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionBtnGradient}
                  >
                    {isSubmittingCheckout ? (
                      <ActivityIndicator size="small" color={C.white} />
                    ) : (
                      <Text style={styles.actionBtnText}>Proceed to Payment</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Stylesheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: C.headerBorder,
    paddingHorizontal: 28,
    paddingVertical: 18,
    gap: 16,
    flexWrap: "wrap",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: C.white,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 12,
    color: C.muted,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 8,
    minWidth: 200,
  },
  searchInput: {
    color: C.white,
    fontSize: 13,
    flex: 1,
    padding: 0,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  datePillText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "600",
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bellBadgeDot: {
    position: "absolute",
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.primary,
    borderWidth: 1.5,
    borderColor: C.headerBg,
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.primaryOrange,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: C.white,
    fontWeight: "800",
    fontSize: 15,
  },

  // ── Scroll Body
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 28,
    gap: 24,
    paddingBottom: 90,
  },

  sectionKicker: {
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  // ── Current Membership Card
  currentCardContainer: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.25)",
    borderRadius: 22,
    padding: 24,
    position: "relative",
    overflow: "hidden",
  },
  emeraldCornerGlow: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(52, 199, 89, 0.08)",
  },
  currentCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  verifiedPassText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.green,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  currentPlanTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: C.white,
    letterSpacing: -0.5,
  },
  currentPlanSubtitle: {
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },
  activeStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.4)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.green,
  },
  activeStatusText: {
    color: C.green,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // ── Current Body (Ring + Stats)
  currentCardBody: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  leftRingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 18,
    padding: 20,
    gap: 18,
    minWidth: 280,
  },
  ringGraphicWrap: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  ringCircleTrack: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 6,
    borderColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ringCircleGreenArc: {
    position: "absolute",
    top: -6,
    left: -6,
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 6,
    borderColor: C.green,
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
    transform: [{ rotate: "45deg" }],
  },
  ringInnerCenter: {
    alignItems: "center",
  },
  ringCenterNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: C.white,
  },
  ringCenterLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: C.muted,
    letterSpacing: 0.5,
  },
  ringTextCol: {
    gap: 3,
  },
  periodMutedLabel: {
    fontSize: 11,
    color: C.muted,
  },
  periodPlanName: {
    fontSize: 16,
    fontWeight: "800",
    color: C.white,
  },
  periodDaysCompleted: {
    fontSize: 12,
    fontWeight: "600",
    color: C.green,
    marginTop: 2,
  },

  // ── Right 7 Stat Cards Grid
  rightStatsGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    minWidth: 320,
  },
  miniStatCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 14,
    padding: 12,
    justifyContent: "space-between",
    gap: 4,
  },
  miniStatIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  miniStatVal: {
    fontSize: 18,
    fontWeight: "800",
    color: C.white,
    letterSpacing: -0.5,
  },
  miniStatValSmall: {
    fontSize: 12,
    fontWeight: "700",
    color: C.white,
  },
  miniStatKey: {
    fontSize: 11,
    color: C.muted,
  },
  miniSubRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  noReminderText: {
    fontSize: 9,
    color: C.mutedDark,
  },

  // ── Current Card Footer
  currentCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.cardBorder,
    paddingTop: 18,
    flexWrap: "wrap",
    gap: 14,
  },
  footerBtnsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  viewPassBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#1C1C1E",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  viewPassBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.white,
  },
  upgradePlanBtn: {
    borderWidth: 1,
    borderColor: "rgba(233, 30, 99, 0.35)",
    backgroundColor: "rgba(233, 30, 99, 0.08)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  upgradePlanBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.primary,
  },
  autoRenewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  autoRenewLabel: {
    fontSize: 13,
    color: C.white,
    fontWeight: "600",
  },
  toggleTrack: {
    width: 42,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    paddingHorizontal: 2,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  toggleTrackActive: {
    backgroundColor: C.green,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.white,
    alignSelf: "flex-start",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },

  // ── Choose Your Plan Section
  plansSectionHeader: {
    marginTop: 10,
    gap: 3,
  },
  plansSectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.white,
  },
  plansSectionSubtitle: {
    fontSize: 13,
    color: C.muted,
  },
  plansRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  emptyPlansCard: {
    flex: 1,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyPlansText: {
    color: C.muted,
    fontSize: 14,
  },
  planCard: {
    flex: 1,
    minWidth: 230,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 22,
    padding: 22,
    gap: 10,
    position: "relative",
  },
  planCardPopular: {
    borderColor: C.primary,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
  },
  popularBadgeWrap: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    left: "35%",
  },
  popularBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  popularBadgeText: {
    color: C.white,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  planCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.white,
  },
  planPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  planPriceAmount: {
    fontSize: 28,
    fontWeight: "900",
    color: C.white,
    letterSpacing: -1,
  },
  planPriceDuration: {
    fontSize: 12,
    color: C.muted,
    fontWeight: "600",
  },
  planCardDesc: {
    fontSize: 12,
    color: C.muted,
  },
  visitsPill: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: C.cardBorder,
    marginVertical: 4,
  },
  visitsPillPopular: {
    backgroundColor: "rgba(233, 30, 99, 0.12)",
    borderColor: "rgba(233, 30, 99, 0.3)",
  },
  visitsPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
  },
  visitsPillTextPopular: {
    color: C.primary,
  },
  featuresList: {
    gap: 8,
    marginVertical: 8,
  },
  featureItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureItemText: {
    fontSize: 12,
    color: C.muted,
  },
  choosePlanBtn: {
    borderRadius: 50,
    overflow: "hidden",
    marginTop: 8,
  },
  choosePlanBtnGradient: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  choosePlanBtnText: {
    color: C.white,
    fontWeight: "700",
    fontSize: 13,
  },

  // ── Membership History
  historySection: {
    gap: 12,
    marginTop: 8,
  },
  historySectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.white,
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 18,
    padding: 18,
    flexWrap: "wrap",
    gap: 12,
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  receiptIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.redBg,
    borderWidth: 1,
    borderColor: C.redBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  historyPlanTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.white,
  },
  historyPlanDates: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  historyRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyPriceText: {
    fontSize: 18,
    fontWeight: "800",
    color: C.white,
  },
  paidBadge: {
    backgroundColor: C.greenBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: C.greenBorder,
  },
  paidBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: C.green,
    letterSpacing: 0.5,
  },
  downloadReceiptBtn: {
    padding: 4,
  },

  // ── Floating Gemini Pill
  floatingGeminiPill: {
    position: "absolute",
    bottom: 20,
    right: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 9,
    shadowColor: "#000000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  floatingGeminiText: {
    color: C.white,
    fontWeight: "600",
    fontSize: 13,
  },

  // ── Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  passModalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  passCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  passVerifiedLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.green,
    letterSpacing: 1,
  },
  passGymName: {
    fontSize: 20,
    fontWeight: "900",
    color: C.white,
    marginTop: 2,
  },
  modalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  passMemberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#1C1C1E",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  passAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.primaryOrange,
    alignItems: "center",
    justifyContent: "center",
  },
  passAvatarText: {
    color: C.white,
    fontSize: 20,
    fontWeight: "900",
  },
  passMemberName: {
    fontSize: 15,
    fontWeight: "800",
    color: C.white,
  },
  passMemberId: {
    fontSize: 12,
    color: C.muted,
  },
  passPlanType: {
    fontSize: 12,
    fontWeight: "700",
    color: C.green,
    marginTop: 2,
  },
  passQrContainer: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    gap: 8,
  },
  passQrBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  passQrHint: {
    color: "#F2F2F7",
    fontSize: 11,
    fontWeight: "600",
  },
  passValidityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  passValKey: {
    fontSize: 11,
    color: C.muted,
  },
  passValVal: {
    fontSize: 13,
    fontWeight: "700",
    color: C.white,
    marginTop: 2,
  },
  passCloseBtn: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6,
  },
  passCloseBtnText: {
    color: C.white,
    fontWeight: "700",
    fontSize: 14,
  },

  // Checkout Modal
  checkoutModalCard: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  checkoutModalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.white,
  },
  checkoutModalSubtitle: {
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },
  checkoutFeaturesList: {
    backgroundColor: "#1C1C1E",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 8,
  },
  txInputContainer: {
    gap: 6,
  },
  txInputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
  },
  txInput: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: C.white,
    fontSize: 13,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  txInputHint: {
    fontSize: 11,
    color: C.mutedDark,
  },
  checkoutTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  checkoutTotalKey: {
    fontSize: 14,
    color: C.muted,
  },
  checkoutTotalVal: {
    fontSize: 22,
    fontWeight: "900",
    color: C.white,
  },
  checkoutNoticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.greenBg,
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 12,
    padding: 12,
  },
  checkoutNoticeBoxError: {
    backgroundColor: C.redBg,
    borderColor: C.redBorder,
  },
  checkoutNoticeText: {
    flex: 1,
    color: C.green,
    fontSize: 12,
    fontWeight: "600",
  },
  actionBtnWrap: {
    borderRadius: 50,
    overflow: "hidden",
    marginTop: 4,
  },
  actionBtnGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    color: C.white,
    fontWeight: "700",
    fontSize: 15,
  },
});
