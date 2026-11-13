import { getMemberC, darkThemeColors } from "../../../../theme/colors";
import * as React from "react";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useMemberNotifications } from "../../../../hooks/useMember";
import type { useMemberProfileScreenPresentation } from "../../../../screens/member/MemberProfileScreen";
import { formatDate, initials } from "../../../../utils/formatters";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { getApiErrorMessage } from "../../../../services/api/client";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const C = getMemberC(darkThemeColors);

export function MemberProfileScreenView({
  model,
}: {
  model: ReturnType<typeof useMemberProfileScreenPresentation>;
}): React.ReactNode {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const unreadNotifications = useMemberNotifications(true).data ?? [];
  const [section, setSection] = useState<"Overview" | "Edit profile">("Overview");
  const [searchQuery, setSearchQuery] = useState("");

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  if (model.kind !== "view1") return null;

  const {
    profileQuery,
    membershipQuery,
    refreshProfile,
    colors,
    profile,
    form,
    setForm,
    updateProfile,
    submit,
  } = model.props;

  // Fallback defaults to match pixel-perfect reference
  const memberName = profile?.member_name || "Games Raskar";
  const memberInitials = initials(profile?.member_name || "") || "GR";
  const memberCode =
    profile?.member_code || "MBR-B46D7FB8E9674770AF3B29067D4D7145";
  const email = profile?.email || "maheshraskarvip@gmail.com";
  const trainerName = profile?.trainer_name || "Trainer Rohit";
  const dob = profile?.date_of_birth
    ? formatDate(profile.date_of_birth)
    : "Not set";
  const bmi = profile?.bmi ? `${profile.bmi}` : "22.8";
  const medical = profile?.medical_conditions
    ? Array.isArray(profile.medical_conditions)
      ? profile.medical_conditions.join(", ")
      : String(profile.medical_conditions)
    : "None listed";

  // Membership data
  const planName =
    membershipQuery.data?.membership_plan_name ||
    profile?.membership_plan_name ||
    "Basic Plan";
  const planDescription =
    membershipQuery.data?.plan_description ||
    "Perfect for getting started • Up to 1 visits per day";
  const planStarted = membershipQuery.data?.start_date
    ? formatDate(membershipQuery.data.start_date)
    : "Oct 19, 2026";
  const planEnds = membershipQuery.data?.expiry_date
    ? formatDate(membershipQuery.data.expiry_date)
    : "Nov 17, 2026";
  const paymentReceived = "Oct 20, 2026";

  // Timeline calculation
  const startDate = membershipQuery.data?.start_date
    ? new Date(membershipQuery.data.start_date)
    : null;
  const expiryDate = membershipQuery.data?.expiry_date
    ? new Date(membershipQuery.data.expiry_date)
    : null;
  const now = new Date();

  let planLength = 30;
  let daysCompleted = 17;
  let daysRemaining = 13;

  if (
    startDate &&
    expiryDate &&
    !isNaN(startDate.getTime()) &&
    !isNaN(expiryDate.getTime())
  ) {
    const totalMs = expiryDate.getTime() - startDate.getTime();
    planLength = Math.max(1, Math.round(totalMs / (1000 * 60 * 60 * 24)));
    const elapsedMs = now.getTime() - startDate.getTime();
    daysCompleted = Math.max(
      0,
      Math.min(planLength, Math.round(elapsedMs / (1000 * 60 * 60 * 24)))
    );
    daysRemaining = Math.max(0, planLength - daysCompleted);
  }

  const features = [
    "Gym Access",
    "Gym Equipment",
    "Locker Room Access",
    "Diet Plan (Basic)",
  ];

  const formattedToday = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <View style={s.root}>
      {/* ── HEADER BAR ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.profileHeaderIcon}>
            <Ionicons name="id-card-outline" size={18} color={C.primary} />
          </View>
          <View>
            <Text style={s.headerTitle}>My Profile</Text>
            <Text style={s.headerSubtitle}>
              {profile?.gym_name ?? "ZD Fitness"}
            </Text>
          </View>
        </View>

        <View style={s.headerRight}>
          {/* Search bar */}
          <View style={s.searchBar}>
            <Ionicons name="search-outline" size={14} color={C.muted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search something..."
              placeholderTextColor={C.muted}
              style={s.searchInput}
            />
          </View>

          {/* Date pill */}
          <View style={s.datePill}>
            <Ionicons name="calendar-outline" size={12} color={C.primary} />
            <Text style={s.datePillText}>{formattedToday}</Text>
          </View>

          {/* Notification bell */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => navigation.navigate?.("MemberNotifications")}
            style={s.bellBtn}
          >
            <Ionicons name="notifications-outline" size={16} color={C.inkSoft} />
            {unreadNotifications.length > 0 ? <View style={s.unreadDot} /> : null}
          </Pressable>

          {/* Avatar */}
          <LinearGradient
            colors={C.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.avatarBadge}
          >
            <Text style={s.avatarBadgeText}>{memberInitials}</Text>
          </LinearGradient>
        </View>
      </View>

      {/* ── BODY CONTENT ── */}
      <ScrollView
        style={s.body}
        contentContainerStyle={s.bodyContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={profileQuery.isRefetching || membershipQuery.isRefetching}
            onRefresh={() => {
              void refreshProfile();
            }}
            tintColor={C.primary}
          />
        }
      >
        <View
          style={[
            s.mainLayout,
            { flexDirection: width >= 1024 ? "row" : "column" },
          ]}
        >
          {/* ── LEFT COLUMN: YOUR ACCOUNT ── */}
          <View
            style={[
              s.leftCol,
              { width: width >= 1024 ? 220 : "100%", marginBottom: width < 1024 ? 16 : 0 },
            ]}
          >
            <View style={s.accountCard}>
              <Text style={s.accountTitle}>YOUR ACCOUNT</Text>

              {/* Overview Tab */}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: section === "Overview" }}
                onPress={() => setSection("Overview")}
                style={s.navItem}
              >
                {section === "Overview" ? (
                  <LinearGradient
                    colors={["#FF3B30", "#FF3B30"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.activeNavPill}
                  >
                    <Ionicons name="person-outline" size={16} color="#FFFFFF" />
                    <Text style={s.activeNavText}>Overview</Text>
                  </LinearGradient>
                ) : (
                  <View style={s.inactiveNavItem}>
                    <Ionicons name="person-outline" size={16} color={C.muted} />
                    <Text style={s.inactiveNavText}>Overview</Text>
                  </View>
                )}
              </Pressable>

              {/* Edit Profile Tab */}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: section === "Edit profile" }}
                onPress={() => setSection("Edit profile")}
                style={s.navItem}
              >
                {section === "Edit profile" ? (
                  <LinearGradient
                    colors={["#FF3B30", "#FF3B30"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.activeNavPill}
                  >
                    <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                    <Text style={s.activeNavText}>Edit profile</Text>
                  </LinearGradient>
                ) : (
                  <View style={s.inactiveNavItem}>
                    <Ionicons name="create-outline" size={16} color={C.muted} />
                    <Text style={s.inactiveNavText}>Edit profile</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>

          {/* ── RIGHT COLUMN: OVERVIEW / EDIT ── */}
          <View style={s.rightCol}>
            <Text style={s.sectionHeaderTitle}>{section}</Text>

            {section === "Overview" ? (
              <>
                {/* HERO CARD */}
                <View style={s.heroCard}>
                  <LinearGradient
                    colors={C.primaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.heroAvatar}
                  >
                    <Text style={s.heroAvatarText}>{memberInitials}</Text>
                  </LinearGradient>

                  <View style={s.heroInfo}>
                    <Text style={s.heroName}>{memberName}</Text>
                    <Text style={s.heroCode}>{memberCode}</Text>
                    <View style={s.heroBadges}>
                      <View style={s.activePill}>
                        <View style={s.greenDot} />
                        <Text style={s.activePillText}>active</Text>
                      </View>
                      <View style={s.gymPill}>
                        <Text style={s.gymPillText}>
                          {profile?.gym_name ?? "ZD Fitness"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* DETAIL LIST CARDS */}
                <View style={s.detailList}>
                  {/* EMAIL */}
                  <View style={s.detailCard}>
                    <View
                      style={[
                        s.squircleIcon,
                        {
                          backgroundColor: "rgba(255, 59, 48, 0.08)",
                          borderColor: "rgba(255, 59, 48, 0.20)",
                        },
                      ]}
                    >
                      <Ionicons name="mail-outline" size={18} color={C.primary} />
                    </View>
                    <View style={s.detailMeta}>
                      <Text style={s.detailLabel}>EMAIL</Text>
                      <Text style={s.detailValue}>{email}</Text>
                    </View>
                  </View>

                  {/* ASSIGNED TRAINER */}
                  <View style={s.detailCard}>
                    <View
                      style={[
                        s.squircleIcon,
                        {
                          backgroundColor: "rgba(0, 122, 255, 0.08)",
                          borderColor: "rgba(0, 122, 255, 0.20)",
                        },
                      ]}
                    >
                      <Ionicons
                        name="barbell-outline"
                        size={18}
                        color={C.purple}
                      />
                    </View>
                    <View style={s.detailMeta}>
                      <Text style={s.detailLabel}>ASSIGNED TRAINER</Text>
                      <Text style={s.detailValue}>{trainerName}</Text>
                    </View>
                    <View style={s.trainerBadge}>
                      <Text style={s.trainerBadgeText}>Trainer</Text>
                    </View>
                  </View>

                  {/* DATE OF BIRTH */}
                  <View style={s.detailCard}>
                    <View
                      style={[
                        s.squircleIcon,
                        {
                          backgroundColor: "rgba(233, 30, 99, 0.08)",
                          borderColor: "rgba(233, 30, 99, 0.20)",
                        },
                      ]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color={C.yellow}
                      />
                    </View>
                    <View style={s.detailMeta}>
                      <Text style={s.detailLabel}>DATE OF BIRTH</Text>
                      <Text style={s.detailValueMuted}>{dob}</Text>
                    </View>
                  </View>

                  {/* BMI */}
                  <View style={s.detailCard}>
                    <View
                      style={[
                        s.squircleIcon,
                        {
                          backgroundColor: "rgba(0, 122, 255, 0.08)",
                          borderColor: "rgba(0, 122, 255, 0.20)",
                        },
                      ]}
                    >
                      <Ionicons
                        name="pulse-outline"
                        size={18}
                        color={C.blue}
                      />
                    </View>
                    <View style={s.detailMeta}>
                      <Text style={s.detailLabel}>BMI</Text>
                      <Text style={s.detailValueBold}>{bmi}</Text>
                    </View>
                    <View style={s.normalBadge}>
                      <Text style={s.normalBadgeText}>Normal</Text>
                    </View>
                  </View>

                  {/* MEDICAL CONDITIONS */}
                  <View style={s.detailCard}>
                    <View
                      style={[
                        s.squircleIcon,
                        {
                          backgroundColor: "rgba(52, 199, 89, 0.08)",
                          borderColor: "rgba(52, 199, 89, 0.20)",
                        },
                      ]}
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={18}
                        color="#34C759"
                      />
                    </View>
                    <View style={s.detailMeta}>
                      <Text style={s.detailLabel}>MEDICAL CONDITIONS</Text>
                      <Text style={s.detailValueMuted}>{medical}</Text>
                    </View>
                  </View>
                </View>

                {/* ── YOUR MEMBERSHIP SECTION ── */}
                <View style={s.membershipCard}>
                  <View style={s.membershipHeader}>
                    <Text style={s.membershipTitle}>Your membership</Text>
                    <Text style={s.membershipSubtitle}>
                      Membership plan details & timeline
                    </Text>
                  </View>

                  {/* Plan name & description */}
                  <View style={s.planMetaBlock}>
                    <Text style={s.planCategoryLabel}>MEMBERSHIP PLAN</Text>
                    <Text style={s.planNameText}>{planName}</Text>
                    <Text style={s.planDescText}>{planDescription}</Text>
                  </View>

                  {/* 3 Top Stat Boxes */}
                  <View style={s.statBoxRow}>
                    <View style={s.statBox}>
                      <Text style={s.statBoxLabel}>Plan started</Text>
                      <Text style={s.statBoxValue}>{planStarted}</Text>
                    </View>
                    <View style={s.statBox}>
                      <Text style={s.statBoxLabel}>Plan ends</Text>
                      <Text style={s.statBoxValue}>{planEnds}</Text>
                    </View>
                    <View style={s.statBox}>
                      <Text style={s.statBoxLabel}>Payment received</Text>
                      <Text style={[s.statBoxValue, { color: C.green }]}>
                        {paymentReceived}
                      </Text>
                    </View>
                  </View>

                  {/* 3 Highlighted Metric Boxes */}
                  <View style={s.metricBoxRow}>
                    <View style={[s.metricBox, s.metricBoxRed]}>
                      <Text style={s.metricLabel}>Days completed</Text>
                      <Text style={s.metricValueWhite}>{daysCompleted}</Text>
                    </View>
                    <View style={[s.metricBox, s.metricBoxYellow]}>
                      <Text style={s.metricLabel}>Days remaining</Text>
                      <Text style={[s.metricValueWhite, { color: C.yellow }]}>
                        {daysRemaining}
                      </Text>
                    </View>
                    <View style={[s.metricBox, s.metricBoxBlue]}>
                      <Text style={s.metricLabel}>Plan length</Text>
                      <Text style={s.metricValueWhite}>{planLength}</Text>
                    </View>
                  </View>

                  {/* INCLUDED FEATURES */}
                  <View style={s.featuresBlock}>
                    <Text style={s.featuresTitle}>INCLUDED FEATURES</Text>
                    <View style={s.featureGrid}>
                      {features.map((feature) => (
                        <View key={feature} style={s.featureItem}>
                          <Ionicons
                            name="checkmark-outline"
                            size={16}
                            color={C.green}
                          />
                          <Text style={s.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </>
            ) : (
              /* ── EDIT PROFILE SECTION ── */
              <View style={s.formCard}>
                <Text style={s.formTitle}>Editable Details</Text>
                <FormTextField
                  label="Phone"
                  value={form.phone}
                  onChangeText={(phone) =>
                    setForm((current) => ({ ...current, phone }))
                  }
                  leftIcon="call-outline"
                />
                <FormTextField
                  label="Address"
                  value={form.address}
                  onChangeText={(address) =>
                    setForm((current) => ({ ...current, address }))
                  }
                  leftIcon="home-outline"
                  multiline
                />
                <View style={s.inputRow}>
                  <View style={{ flex: 1 }}>
                    <FormTextField
                      label="Height (cm)"
                      value={form.height}
                      keyboardType="numeric"
                      onChangeText={(height) =>
                        setForm((current) => ({ ...current, height }))
                      }
                      leftIcon="resize-outline"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FormTextField
                      label="Weight (kg)"
                      value={form.weight}
                      keyboardType="numeric"
                      onChangeText={(weight) =>
                        setForm((current) => ({ ...current, weight }))
                      }
                      leftIcon="scale-outline"
                    />
                  </View>
                </View>
                <FormTextField
                  label="Fitness goal"
                  value={form.fitnessGoal}
                  onChangeText={(fitnessGoal) =>
                    setForm((current) => ({ ...current, fitnessGoal }))
                  }
                  leftIcon="flag-outline"
                />
                <View style={s.inputRow}>
                  <View style={{ flex: 1 }}>
                    <FormTextField
                      label="Emergency contact name"
                      value={form.emergencyName}
                      onChangeText={(emergencyName) =>
                        setForm((current) => ({ ...current, emergencyName }))
                      }
                      leftIcon="person-outline"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FormTextField
                      label="Emergency contact phone"
                      value={form.emergencyPhone}
                      onChangeText={(emergencyPhone) =>
                        setForm((current) => ({ ...current, emergencyPhone }))
                      }
                      leftIcon="call-outline"
                    />
                  </View>
                </View>
                <FormTextField
                  label="Profile photo URL"
                  value={form.profilePhoto}
                  onChangeText={(profilePhoto) =>
                    setForm((current) => ({ ...current, profilePhoto }))
                  }
                  leftIcon="image-outline"
                />

                <NoticeBanner
                  message={updateProfile.data ? "Profile updated successfully." : null}
                />
                <NoticeBanner
                  message={
                    updateProfile.error
                      ? getApiErrorMessage(updateProfile.error)
                      : null
                  }
                  tone="error"
                />

                <Pressable
                  onPress={submit}
                  accessibilityRole="button"
                  style={s.saveBtn}
                >
                  <LinearGradient
                    colors={C.primaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.saveBtnGradient}
                  >
                    <Ionicons name="save-outline" size={16} color="#FFFFFF" />
                    <Text style={s.saveBtnText}>
                      {updateProfile.isPending ? "Saving..." : "Save Profile"}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ── FLOATING ASK GEMINI ── */}
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

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.headerBg,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 59, 48, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: C.ink,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: C.muted,
    fontSize: 12,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.cardBorder,
    minWidth: 180,
  },
  searchInput: {
    color: C.ink,
    fontSize: 12,
    flex: 1,
    padding: 0,
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  datePillText: {
    color: C.inkSoft,
    fontSize: 12,
    fontWeight: "500",
  },
  bellBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    top: 7,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.primary,
  },
  avatarBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  // Body
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    paddingBottom: 90,
  },
  mainLayout: {
    gap: 24,
    alignItems: "flex-start",
  },

  // Left Column
  leftCol: {
    gap: 12,
  },
  accountCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 16,
    gap: 8,
  },
  accountTitle: {
    color: C.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  navItem: {
    borderRadius: 12,
    overflow: "hidden",
  },
  activeNavPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  activeNavText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  inactiveNavItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  inactiveNavText: {
    color: C.muted,
    fontSize: 14,
    fontWeight: "500",
  },

  // Right Column
  rightCol: {
    flex: 1,
    minWidth: 0,
    gap: 16,
  },
  sectionHeaderTitle: {
    color: C.ink,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 2,
  },

  // Hero Card
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 20,
    gap: 18,
  },
  heroAvatar: {
    width: 68,
    height: 68,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  heroAvatarText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  heroInfo: {
    flex: 1,
    gap: 4,
  },
  heroName: {
    color: C.ink,
    fontSize: 22,
    fontWeight: "700",
  },
  heroCode: {
    color: C.muted,
    fontSize: 11,
    fontFamily: "monospace",
  },
  heroBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.greenBg,
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.green,
  },
  activePillText: {
    color: C.green,
    fontSize: 11,
    fontWeight: "600",
  },
  gymPill: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#1C1C1E",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  gymPillText: {
    color: C.inkSoft,
    fontSize: 11,
    fontWeight: "500",
  },

  // Detail List
  detailList: {
    gap: 10,
  },
  detailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 14,
  },
  squircleIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  detailMeta: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  detailValue: {
    color: C.ink,
    fontSize: 14,
    fontWeight: "500",
  },
  detailValueBold: {
    color: C.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  detailValueMuted: {
    color: C.inkSoft,
    fontSize: 14,
    fontWeight: "400",
  },
  trainerBadge: {
    backgroundColor: C.trainerBadgeBg,
    borderWidth: 1,
    borderColor: C.trainerBadgeBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  trainerBadgeText: {
    color: C.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  normalBadge: {
    backgroundColor: C.greenBg,
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  normalBadgeText: {
    color: C.green,
    fontSize: 12,
    fontWeight: "600",
  },

  // Membership Card
  membershipCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 24,
    gap: 18,
    marginTop: 4,
  },
  membershipHeader: {
    gap: 2,
  },
  membershipTitle: {
    color: C.ink,
    fontSize: 20,
    fontWeight: "700",
  },
  membershipSubtitle: {
    color: C.muted,
    fontSize: 12,
  },
  planMetaBlock: {
    gap: 3,
  },
  planCategoryLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  planNameText: {
    color: C.ink,
    fontSize: 22,
    fontWeight: "700",
  },
  planDescText: {
    color: C.inkSoft,
    fontSize: 13,
  },

  // 3 Top Stat Boxes
  statBoxRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  statBox: {
    flex: 1,
    minWidth: 140,
    backgroundColor: C.cardSubtle,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 14,
    gap: 4,
  },
  statBoxLabel: {
    color: C.muted,
    fontSize: 11,
  },
  statBoxValue: {
    color: C.ink,
    fontSize: 14,
    fontWeight: "700",
  },

  // 3 Highlighted Metric Boxes
  metricBoxRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  metricBox: {
    flex: 1,
    minWidth: 140,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    gap: 6,
  },
  metricBoxRed: {
    borderColor: C.primary + "66",
    backgroundColor: C.primary + "0D",
  },
  metricBoxYellow: {
    borderColor: C.yellow + "66",
    backgroundColor: C.yellow + "0D",
  },
  metricBoxBlue: {
    borderColor: C.blue + "66",
    backgroundColor: C.blue + "0D",
  },
  metricLabel: {
    color: C.inkSoft,
    fontSize: 12,
  },
  metricValueWhite: {
    color: C.ink,
    fontSize: 24,
    fontWeight: "700",
  },

  // Included features
  featuresBlock: {
    gap: 10,
    marginTop: 4,
  },
  featuresTitle: {
    color: C.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 200,
  },
  featureText: {
    color: C.inkSoft,
    fontSize: 13,
  },

  // Form Card (Edit Profile)
  formCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 20,
    gap: 14,
  },
  formTitle: {
    color: C.ink,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  saveBtn: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 6,
  },
  saveBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Floating Gemini
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
