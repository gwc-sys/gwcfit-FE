import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import type * as React from "react";
import {
  Keyboard,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Pressable } from "../../components/NativePressable";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { positiveNumberError } from "../../components/member/formValidation";
import { AppLogo } from "../../../../components/AppLogo";
import { getMobileViewportMetrics } from "../../theme/theme";
import { getApiErrorMessage } from "../../../../services/api/client";
import { requestLogoutConfirmation } from "../../../../utils/logoutConfirmation";
import type { useMemberProfileScreenPresentation } from "../../../../screens/member/MemberProfileScreen";

function getInitials(name?: string | null, fallback = "GR"): string {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function MemberProfileScreenView({
  model,
}: {
  model: ReturnType<typeof useMemberProfileScreenPresentation> | any;
}): React.ReactNode {
  const { width, height } = useWindowDimensions();
  const rawInsets = typeof useSafeAreaInsets === "function" ? useSafeAreaInsets() : null;
  const vp = getMobileViewportMetrics(width, height, rawInsets);
  const [autoRenew, setAutoRenew] = useState(true);
  const [editing, setEditing] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>();

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;

  const props = model.props as any;
  const profileQuery = props.profileQuery;
  const membershipQuery = props.membershipQuery;
  const refreshProfile = props.refreshProfile;
  const profile = props.profile ?? profileQuery?.data;
  const membership = props.membership ?? membershipQuery?.data;
  const progressLogs = props.progressLogs ?? [];
  const goals = props.goals ?? [];
  const rewards = props.rewards ?? [];
  const trainer = props.trainer;
  const trainerFeedback = props.trainerFeedback;
  const unreadNotifications = props.unreadNotifications ?? [];
  const user = props.user;
  const form = props.form;
  const setForm = props.setForm;
  const updateProfile = props.updateProfile;
  const submit = props.submit;
  const navigation = props.navigation;

  const isRefreshing = Boolean(
    profileQuery?.isRefetching || membershipQuery?.isRefetching,
  );

  const memberName =
    profile?.member_name ?? user?.full_name ?? "Member";
  const userInitials = getInitials(memberName, "MB");
  const email = profile?.email ?? user?.email ?? "Not provided";
  const gymName =
    profile?.gym_name ??
    membership?.gym_name ??
    user?.gym_name ??
    "PulseFit Workspace";
  const fitnessGoal =
    profile?.fitness_goal ||
    goals?.[0]?.goal_name ||
    "General Fitness";
  const isActive = (
    profile?.membership_status ??
    membership?.status ??
    "active"
  )
    .toLowerCase()
    .includes("active");

  // Measurements & Vitals (real data from latest progress log or profile)
  const latestLog = Array.isArray(progressLogs) ? progressLogs[0] : null;
  const weightVal: number | null =
    typeof latestLog?.weight === "number" && latestLog.weight > 0
      ? latestLog.weight
      : typeof profile?.weight === "number" && profile.weight > 0
        ? profile.weight
        : null;
  const activeWeightGoal = Array.isArray(goals)
    ? goals.find(
        (g: any) => typeof g?.target_weight === "number" && g.target_weight > 0,
      )?.target_weight
    : null;
  const targetWeightVal: number | null =
    typeof activeWeightGoal === "number"
      ? activeWeightGoal
      : typeof latestLog?.target_weight === "number" && latestLog.target_weight > 0
        ? latestLog.target_weight
        : null;

  const heightVal: number | null =
    typeof profile?.height === "number" && profile.height > 0
      ? Math.round(profile.height)
      : null;

  const calculatedBmi: number | null =
    typeof latestLog?.bmi === "number" && latestLog.bmi > 0
      ? latestLog.bmi
      : typeof profile?.bmi === "number" && profile.bmi > 0
        ? profile.bmi
        : weightVal && heightVal
          ? Number((weightVal / Math.pow(heightVal / 100, 2)).toFixed(1))
          : null;
  const bmiCategory = calculatedBmi ? getBmiCategory(calculatedBmi) : "Unrecorded";

  // Membership & Plan
  const rawPlanName =
    membership?.membership_plan_name ??
    profile?.membership_plan_name ??
    null;
  const planDuration = membership?.plan_duration_days;
  const planTitle = rawPlanName
    ? planDuration
      ? `${rawPlanName} (${planDuration} Days)`
      : rawPlanName
    : "No Active Plan";
  const priceRupees: number | null =
    typeof membership?.plan_price_cents === "number" &&
    membership.plan_price_cents > 0
      ? Math.round(membership.plan_price_cents / 100)
      : null;
  const daysRemaining: number | null =
    typeof membership?.days_remaining === "number"
      ? Math.max(0, membership.days_remaining)
      : null;

  // Activity Awards
  const badgesCount = Array.isArray(rewards) ? rewards.length : 0;

  // Trainer info for Preferences & Support
  const rawTrainerName =
    trainer?.trainer_name ?? profile?.trainer_name ?? null;
  const trainerDisplay = rawTrainerName
    ? rawTrainerName.startsWith("Trainer")
      ? rawTrainerName
      : `Trainer ${rawTrainerName}`
    : null;
  const trainerRating =
    typeof trainerFeedback?.rating === "number" && trainerFeedback.rating > 0
      ? trainerFeedback.rating.toFixed(1)
      : null;

  const unreadCount = Array.isArray(unreadNotifications)
    ? unreadNotifications.length
    : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingHorizontal: vp.horizontalPadding,
            paddingBottom: vp.safeBottomPadding + 16,
            gap: vp.gridGap + 2,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              void refreshProfile?.();
            }}
            tintColor="#E91E63"
          />
        }
      >
        {/* Dynamic Island Status Capsule */}
        <View style={styles.islandRow}>
          <View style={styles.dynamicIsland}>
            <AppLogo size={16} chromeless />
            <Text style={styles.islandText}>PulseFit</Text>
            <View style={styles.islandGreenRing}>
              <View style={styles.islandGreenDot} />
            </View>
          </View>
        </View>

        {/* Top Header Row */}
        <View style={styles.topHeaderRow}>
          <Text style={styles.topKicker} numberOfLines={1}>MEMBER OVERVIEW & SETTINGS</Text>
          <View style={styles.topHeaderActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => navigation?.navigate?.("MemberNotifications")}
              style={styles.bellButton}
            >
              <Ionicons name="notifications-outline" size={21} color="#F2F2F7" />
              {unreadCount >= 0 ? <View style={styles.bellBadgeDot} /> : null}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Member Profile"
              onPress={() => navigation?.navigate?.("MemberProfileHome")}
              style={styles.avatarCircle}
            >
              <Text style={styles.avatarInitials}>{userInitials}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.headerDivider} />

        {/* Hero Row */}
        <View style={styles.heroRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.heroKicker} numberOfLines={1}>MEMBER HUB</Text>
            <Text style={[styles.heroTitle, { fontSize: vp.heroTitleSize }]} numberOfLines={1}>Profile</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={editing ? "Cancel editing profile" : "Edit profile"}
            onPress={() => {
              setSavedBanner(false);
              setValidationError(undefined);
              setEditing((prev) => !prev);
            }}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>
              {editing ? "Done" : "Edit"}
            </Text>
          </Pressable>
        </View>

        {/* Member Identity Card */}
        <View style={[styles.identityCard, { padding: vp.cardPadding }]}>
          <View style={styles.identityAvatarSquare}>
            <Text style={styles.identityAvatarText}>{userInitials}</Text>
          </View>

          <View style={styles.identityInfoCol}>
            <View style={styles.identityNameRow}>
              <Text style={styles.identityName} numberOfLines={1}>
                {memberName}
              </Text>
              <View style={styles.activeStatusPill}>
                <Text style={styles.activeStatusPillText}>
                  {isActive ? "Active" : "Member"}
                </Text>
              </View>
            </View>
            <Text style={styles.identityEmail} numberOfLines={1}>
              {email}
            </Text>
            <Text style={styles.identityMeta} numberOfLines={1}>
              {`${gymName} • Goal: ${fitnessGoal}`}
            </Text>
          </View>
        </View>

        {/* Inline Edit Drawer when Edit is toggled */}
        {editing && form && setForm ? (
          <View style={styles.editFormCard}>
            <Text style={styles.editFormTitle}>Edit Personal Details</Text>
            <View style={styles.editFieldGroup}>
              <Text style={styles.editFieldLabel}>Phone</Text>
              <TextInput
                value={form.phone}
                onChangeText={(v) =>
                  setForm((cur: any) => ({ ...cur, phone: v }))
                }
                placeholder="Phone number"
                placeholderTextColor="#F2F2F7"
                keyboardType="phone-pad"
                style={styles.editInput}
              />
            </View>
            <View style={styles.editRowDuo}>
              <View style={[styles.editFieldGroup, { flex: 1 }]}>
                <Text style={styles.editFieldLabel}>Weight (kg)</Text>
                <TextInput
                  value={form.weight}
                  onChangeText={(v) =>
                    setForm((cur: any) => ({ ...cur, weight: v }))
                  }
                  placeholder="62.0"
                  placeholderTextColor="#F2F2F7"
                  keyboardType="decimal-pad"
                  style={styles.editInput}
                />
              </View>
              <View style={[styles.editFieldGroup, { flex: 1 }]}>
                <Text style={styles.editFieldLabel}>Height (cm)</Text>
                <TextInput
                  value={form.height}
                  onChangeText={(v) =>
                    setForm((cur: any) => ({ ...cur, height: v }))
                  }
                  placeholder="165"
                  placeholderTextColor="#F2F2F7"
                  keyboardType="decimal-pad"
                  style={styles.editInput}
                />
              </View>
            </View>
            <View style={styles.editFieldGroup}>
              <Text style={styles.editFieldLabel}>Fitness Goal</Text>
              <TextInput
                value={form.fitnessGoal}
                onChangeText={(v) =>
                  setForm((cur: any) => ({ ...cur, fitnessGoal: v }))
                }
                placeholder="Stay Fit"
                placeholderTextColor="#F2F2F7"
                style={styles.editInput}
              />
            </View>
            <NoticeBanner message={validationError ?? null} tone="error" />
            <NoticeBanner
              message={
                updateProfile?.error
                  ? getApiErrorMessage(updateProfile.error)
                  : null
              }
              tone="error"
            />
            <PrimaryButton
              title="Save Changes"
              loading={Boolean(updateProfile?.isPending)}
              onPress={async () => {
                const err =
                  positiveNumberError(form.height, "Height") ??
                  positiveNumberError(form.weight, "Weight");
                setValidationError(err);
                if (!err && !updateProfile?.isPending && (await submit?.())) {
                  Keyboard.dismiss();
                  setEditing(false);
                  setSavedBanner(true);
                }
              }}
            />
          </View>
        ) : null}

        {savedBanner ? (
          <NoticeBanner message="Profile updated." tone="success" />
        ) : null}

        {/* MEASUREMENTS & VITALS */}
        <Text style={styles.sectionHeaderLabel}>MEASUREMENTS & VITALS</Text>
        <View style={styles.listCard}>
          {/* Weight Row */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Weight details"
            onPress={() => navigation?.navigate?.("MemberProgress")}
            style={styles.vitalRow}
          >
            <View style={styles.vitalLeft}>
              <Ionicons name="scale-outline" size={18} color="#E91E63" />
              <Text style={styles.vitalLabel}>Weight</Text>
            </View>
            <View style={styles.vitalRight}>
              <Text style={styles.vitalValueStrong}>
                {weightVal !== null ? `${Number(weightVal).toFixed(1)} kg` : "--"}
              </Text>
              {targetWeightVal !== null ? (
                <Text style={styles.vitalTargetText}>
                  {`(Target: ${Number(targetWeightVal).toFixed(1)} kg)`}
                </Text>
              ) : null}
            </View>
          </Pressable>

          <View style={styles.rowDivider} />

          {/* BMI Index Row */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="BMI Index details"
            onPress={() => navigation?.navigate?.("MemberProgress")}
            style={styles.vitalRow}
          >
            <View style={styles.vitalLeft}>
              <Ionicons name="pulse-outline" size={18} color="#34C759" />
              <Text style={styles.vitalLabel}>BMI Index</Text>
            </View>
            <View style={styles.vitalRight}>
              <Text style={styles.vitalValueStrong}>
                {calculatedBmi !== null ? Number(calculatedBmi).toFixed(1) : "--"}
              </Text>
              <View style={styles.normalBmiBadge}>
                <Text style={styles.normalBmiBadgeText}>{bmiCategory}</Text>
              </View>
            </View>
          </Pressable>

          <View style={styles.rowDivider} />

          {/* Height Row */}
          <View style={styles.vitalRow}>
            <View style={styles.vitalLeft}>
              <Ionicons name="resize-outline" size={18} color="#007AFF" />
              <Text style={styles.vitalLabel}>Height</Text>
            </View>
            <View style={styles.vitalRight}>
              <Text style={styles.vitalValueStrong}>
                {heightVal !== null ? `${heightVal} cm` : "--"}
              </Text>
            </View>
          </View>
        </View>

        {/* MEMBERSHIP & PLAN */}
        <Text style={styles.sectionHeaderLabel}>MEMBERSHIP & PLAN</Text>
        <View style={styles.membershipCard}>
          <View style={styles.membershipTopRow}>
            <View style={styles.membershipTextCol}>
              <Text style={styles.membershipPlanName}>{planTitle}</Text>
              <Text style={styles.membershipPlanSub}>
                {priceRupees !== null && daysRemaining !== null
                  ? `₹${priceRupees.toLocaleString("en-IN")} / mo • ${daysRemaining} Days Remaining`
                  : daysRemaining !== null
                    ? `${daysRemaining} Days Remaining`
                    : isActive
                      ? "Active Membership"
                      : "Upgrade to access all gym facilities"}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Upgrade Membership Plan"
              onPress={() => navigation?.navigate?.("MemberMembership")}
              style={styles.upgradeBtn}
            >
              <Text style={styles.upgradeBtnText}>Upgrade</Text>
            </Pressable>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.autoRenewRow}>
            <Text style={styles.autoRenewLabel}>Auto-Renew Subscription</Text>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: autoRenew }}
              accessibilityLabel="Auto-Renew Subscription"
              onPress={() => setAutoRenew((prev) => !prev)}
              style={[
                styles.toggleTrack,
                autoRenew ? styles.toggleTrackActive : styles.toggleTrackInactive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  autoRenew
                    ? styles.toggleThumbActive
                    : styles.toggleThumbInactive,
                ]}
              />
            </Pressable>
          </View>
        </View>

        {/* ACTIVITY AWARDS */}
        <View style={styles.awardsHeaderRow}>
          <Text style={styles.sectionHeaderLabelInline}>ACTIVITY AWARDS</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${badgesCount} Badges`}
            onPress={() => navigation?.navigate?.("MemberRewards")}
          >
            <Text style={styles.viewBadgesLink}>
              {badgesCount > 0 ? `View ${badgesCount} Badges` : "View Rewards"}
            </Text>
          </Pressable>
        </View>

        {rewards.length > 0 ? (
          <View style={styles.awardsOuterCard}>
            {rewards.slice(0, 3).map((reward: any, idx: number) => {
              const colorsList = [
                ["#E91E63", "#E91E63"],
                ["#007AFF", "#007AFF"],
                ["#E91E63", "#E91E63"],
              ];
              const iconsList: any = ["star", "barbell", "flame"];
              const pair = colorsList[idx % colorsList.length];
              const icon = iconsList[idx % iconsList.length];
              return (
                <Pressable
                  key={reward.reward_uuid || `reward-${idx}`}
                  accessibilityRole="button"
                  onPress={() => navigation?.navigate?.("MemberRewards")}
                  style={styles.awardTile}
                >
                  <LinearGradient
                    colors={pair as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.awardCircle}
                  >
                    <Ionicons name={icon} size={22} color={idx === 0 ? "#1C1C1E" : "#FFFFFF"} />
                  </LinearGradient>
                  <Text style={styles.awardTileTitle} numberOfLines={1}>
                    {reward.title || "Reward"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation?.navigate?.("MemberRewards")}
            style={styles.emptyAwardsCard}
          >
            <Ionicons name="trophy-outline" size={20} color="#F2F2F7" />
            <Text style={styles.emptyAwardsText}>
              No badges unlocked yet. Complete workouts to earn activity awards!
            </Text>
          </Pressable>
        )}

        {/* SYSTEM & SETTINGS (Matches Reference Image 1 & 4) */}
        <Text style={styles.sectionHeaderLabel}>SYSTEM & SETTINGS</Text>
        <View style={styles.listCard}>
          {/* Settings Row */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            onPress={() => navigation?.navigate?.("MemberSettings")}
            style={styles.systemRow}
          >
            <View style={styles.systemRowLeft}>
              <View style={[styles.systemIconCircle, { backgroundColor: "#1C1C1E" }]}>
                <Ionicons name="settings-outline" size={18} color="#E91E63" />
              </View>
              <View style={styles.systemRowInfo}>
                <View style={styles.systemTitleRow}>
                  <Text style={styles.systemTitle}>Settings</Text>
                  <View style={styles.systemBadge}>
                    <Text style={styles.systemBadgeText}>PulseFit v3.4</Text>
                  </View>
                </View>
                <Text style={styles.systemSubtitle}>
                  Preferences, Appearance, Security
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={17} color="#1C1C1E" />
          </Pressable>

          <View style={styles.rowDivider} />

          {/* Rate Trainer */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={trainerDisplay ? `Rate ${trainerDisplay}` : "Trainer Feedback"}
            onPress={() => navigation?.navigate?.("MemberTrainer")}
            style={styles.systemRow}
          >
            <View style={styles.systemRowLeft}>
              <View style={[styles.systemIconCircle, { backgroundColor: "#1C1C1E" }]}>
                <Ionicons name="chatbubble-outline" size={18} color="#E91E63" />
              </View>
              <View style={styles.systemRowInfo}>
                <Text style={styles.systemTitle}>
                  {trainerDisplay
                    ? `Rate ${trainerDisplay}${trainerRating ? ` (${trainerRating} ★)` : ""}`
                    : "Trainer Feedback (No trainer assigned)"}
                </Text>
                <Text style={styles.systemSubtitle}>
                  {trainerRating ? `${trainerRating} ★ Fair • Coach Feedback` : "2.0 ★ Fair • Coach Feedback"}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={17} color="#1C1C1E" />
          </Pressable>

          <View style={styles.rowDivider} />

          {/* Help & Support */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Support & Help FAQ"
            onPress={() => navigation?.navigate?.("MemberSupport")}
            style={styles.systemRow}
          >
            <View style={styles.systemRowLeft}>
              <View style={[styles.systemIconCircle, { backgroundColor: "#1C1C1E" }]}>
                <Ionicons name="help-circle-outline" size={19} color="#007AFF" />
              </View>
              <View style={styles.systemRowInfo}>
                <Text style={styles.systemTitle}>Help & Support</Text>
                <Text style={styles.systemSubtitle}>
                  FAQs, Gym Desk & Assistance
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={17} color="#1C1C1E" />
          </Pressable>
        </View>

        {/* Log Out Button (Prominent crimson border & text matching Image 1) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Log Out of ${gymName}`}
          onPress={() => {
            requestLogoutConfirmation(() => props.logout?.mutate?.());
          }}
          style={styles.logoutButton}
        >
          <Ionicons name="log-out-outline" size={19} color="#E91E63" />
          <Text style={styles.logoutButtonText}>{`Log Out of ${gymName}`}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#000000",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 34,
    gap: 14,
  },
  islandRow: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  dynamicIsland: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
  },
  islandRedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E91E63",
  },
  islandText: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  islandGreenRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(52, 199, 89, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  islandGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34C759",
  },
  topHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  topKicker: {
    color: "#E91E63",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  topHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  bellButton: {
    width: 34,
    height: 34,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  settingsHeaderButton: {
    width: 34,
    height: 34,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  bellBadgeDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E91E63",
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  avatarCircle: {
    width: 34,
    height: 34,
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.22)",
  },
  avatarInitials: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  headerDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: -16,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 2,
  },
  heroKicker: {
    color: "#F2F2F7",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  editButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  editButtonText: {
    color: "#E91E63",
    fontSize: 14,
    fontWeight: "700",
  },
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 18,
    gap: 14,
  },
  identityAvatarSquare: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
  },
  identityAvatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  identityInfoCol: {
    flex: 1,
    gap: 3,
  },
  identityNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  identityName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  activeStatusPill: {
    backgroundColor: "rgba(52, 199, 89, 0.14)",
    borderColor: "rgba(52, 199, 89, 0.35)",
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 2.5,
    borderRadius: 999,
  },
  activeStatusPillText: {
    color: "#34C759",
    fontSize: 10.5,
    fontWeight: "700",
  },
  identityEmail: {
    color: "#F2F2F7",
    fontSize: 13,
    fontWeight: "500",
  },
  identityMeta: {
    color: "#F2F2F7",
    fontSize: 11.5,
    fontWeight: "500",
  },
  editFormCard: {
    backgroundColor: "#000000",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    padding: 16,
    gap: 12,
  },
  editFormTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  editRowDuo: {
    flexDirection: "row",
    gap: 10,
  },
  editFieldGroup: {
    gap: 5,
  },
  editFieldLabel: {
    color: "#F2F2F7",
    fontSize: 11.5,
    fontWeight: "600",
  },
  editInput: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 14,
  },
  sectionHeaderLabel: {
    color: "#F2F2F7",
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginTop: 4,
  },
  sectionHeaderLabelInline: {
    color: "#F2F2F7",
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  listCard: {
    backgroundColor: "#000000",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  vitalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 10,
  },
  vitalLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  vitalLabel: {
    color: "#F2F2F7",
    fontSize: 14,
    fontWeight: "600",
  },
  vitalRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vitalValueStrong: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "800",
  },
  vitalTargetText: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "500",
  },
  normalBmiBadge: {
    backgroundColor: "rgba(52, 199, 89, 0.14)",
    borderColor: "rgba(52, 199, 89, 0.35)",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  normalBmiBadgeText: {
    color: "#34C759",
    fontSize: 11,
    fontWeight: "700",
  },
  rowDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  membershipCard: {
    backgroundColor: "#000000",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 18,
    gap: 14,
  },
  membershipTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  membershipTextCol: {
    flex: 1,
    gap: 4,
  },
  membershipPlanName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  membershipPlanSub: {
    color: "#F2F2F7",
    fontSize: 12.5,
    fontWeight: "500",
  },
  upgradeBtn: {
    backgroundColor: "#E91E63",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  upgradeBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  autoRenewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  autoRenewLabel: {
    color: "#F2F2F7",
    fontSize: 14,
    fontWeight: "700",
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
  },
  toggleTrackActive: {
    backgroundColor: "#34C759",
  },
  toggleTrackInactive: {
    backgroundColor: "#1C1C1E",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  toggleThumbInactive: {
    alignSelf: "flex-start",
  },
  awardsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  viewBadgesLink: {
    color: "#E91E63",
    fontSize: 12,
    fontWeight: "700",
  },
  awardsOuterCard: {
    flexDirection: "row",
    backgroundColor: "#000000",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 12,
    gap: 8,
  },
  awardTile: {
    flex: 1,
    backgroundColor: "#000000",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  awardCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  awardTileTitle: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "800",
    textAlign: "center",
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 10,
  },
  prefLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    flex: 1,
  },
  prefLabel: {
    color: "#F2F2F7",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyAwardsCard: {
    backgroundColor: "#000000",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyAwardsText: {
    color: "#F2F2F7",
    fontSize: 12.5,
    fontWeight: "500",
    textAlign: "center",
  },
  systemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  systemRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  systemIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  systemRowInfo: {
    flex: 1,
    gap: 2,
  },
  systemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  systemTitle: {
    color: "#F2F2F7",
    fontSize: 15,
    fontWeight: "600",
  },
  systemBadge: {
    backgroundColor: "rgba(233, 30, 99, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  systemBadgeText: {
    color: "#E91E63",
    fontSize: 10,
    fontWeight: "700",
  },
  systemSubtitle: {
    color: "#F2F2F7",
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.4)",
    borderRadius: 14,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
  },
  logoutButtonText: {
    color: "#E91E63",
    fontSize: 15,
    fontWeight: "600",
  },
});
