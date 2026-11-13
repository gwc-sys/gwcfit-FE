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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  useMemberRewards,
  useMemberNotifications,
  useMemberAttendance,
  useMemberWorkouts,
  useMemberActivity,
  useMemberMeals,
  useMemberProfile,
} from "../../../../hooks/useMember";
import { useAuthStore } from "../../../../store/useAuthStore";

// ─── Theme Colors ─────────────────────────────────────────────────────────────
const C = getMemberC(darkThemeColors);

// ─── Types ───────────────────────────────────────────────────────────────────
interface ChallengeItem {
  id: string;
  title: string;
  badgeTag: "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";
  badgeTagColor: string;
  badgeTagBg: string;
  badgeTagBorder: string;
  description: string;
  progressLabel: string;
  currentProgress: number;
  totalProgress: number;
  unit: string;
  rewardPoints: number;
  rewardColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  iconBorder: string;
}

interface AwardBadge {
  id: string;
  title: string;
  category: string;
  isLocked: boolean;
  themeColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
  description: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function MemberRewardsScreenView(_props?: any) {
  const navigation = useNavigation<any>();
  const query = useMemberRewards();
  const attendanceQuery = useMemberAttendance();
  const workoutsQuery = useMemberWorkouts();
  const activityQuery = useMemberActivity(30);
  const mealsQuery = useMemberMeals();
  const profileQuery = useMemberProfile();
  const unreadNotifications = useMemberNotifications(true).data ?? [];
  const user = useAuthStore((state) => state.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"All" | "Active" | "Badges Showcase">("All");

  // Selected modals
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeItem | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<AwardBadge | null>(null);
  const [perksModalOpen, setPerksModalOpen] = useState(false);

  // Real progress metrics computed from member APIs
  const attendance = attendanceQuery.data;
  const workouts = workoutsQuery.data ?? [];
  const activityDays = activityQuery.data?.items ?? [];
  const meals = mealsQuery.data ?? [];
  const profile = profileQuery.data;

  const totalAttendanceDays = useMemo(() => {
    const uniqueDays = new Set(
      (attendance?.history ?? [])
        .map((item) => item.check_in_at?.slice(0, 10))
        .filter(Boolean)
    );
    return Math.max(uniqueDays.size, attendance?.monthly_attendance_count ?? 0);
  }, [attendance]);

  const streakDays = useMemo(() => {
    const dates = Array.from(
      new Set(
        (attendance?.history ?? [])
          .map((item) => item.check_in_at?.slice(0, 10))
          .filter((d): d is string => Boolean(d))
      )
    ).sort((a, b) => (a > b ? -1 : 1));
    if (dates.length === 0) return 0;
    let streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const curr = new Date(`${dates[i]}T00:00:00Z`).getTime();
      const prev = new Date(`${dates[i + 1]}T00:00:00Z`).getTime();
      const diffDays = Math.round((curr - prev) / 86_400_000);
      if (diffDays === 1) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  }, [attendance]);

  const completedWorkouts = useMemo(() => {
    return workouts.reduce((sum, w) => {
      const count = typeof w.completed_workouts === "number" ? w.completed_workouts : 0;
      const statusCount = w.completion_status === "completed" ? 1 : 0;
      return sum + Math.max(count, statusCount);
    }, 0);
  }, [workouts]);

  const totalCalories = useMemo(() => {
    return activityDays.reduce((sum, d) => sum + (d.calories_completed || 0), 0);
  }, [activityDays]);

  const earlyMorningSessions = useMemo(() => {
    return (attendance?.history ?? []).filter((h) => {
      if (!h.check_in_at) return false;
      const dt = new Date(h.check_in_at);
      return !Number.isNaN(dt.getTime()) && dt.getHours() < 8;
    }).length;
  }, [attendance]);

  const completedMealPlans = useMemo(() => {
    return meals.filter((m) => m.completion_status === "completed").length;
  }, [meals]);

  // Challenges list built from backend /api/v1/member/rewards and real member progress
  const challenges: ChallengeItem[] = useMemo(() => {
    const apiRewards = query.data ?? [];
    const attendanceReward = apiRewards.find((r) => r.challenge_type === "attendance");
    const workoutReward = apiRewards.find((r) => r.challenge_type === "workout");

    const attendanceCompleted =
      totalAttendanceDays >= 30 || attendanceReward?.status === "completed";
    const strengthCompleted =
      completedWorkouts >= 12 || workoutReward?.status === "completed";

    const list: ChallengeItem[] = [
      {
        id: attendanceReward?.reward_uuid ?? "ch-attendance",
        title: attendanceReward?.title ?? "30-day attendance challenge",
        badgeTag: attendanceCompleted
          ? "COMPLETED"
          : totalAttendanceDays > 0
            ? "IN_PROGRESS"
            : "AVAILABLE",
        badgeTagColor: attendanceCompleted ? C.green : C.gold,
        badgeTagBg: attendanceCompleted ? C.greenBg : "rgba(233, 30, 99, 0.15)",
        badgeTagBorder: attendanceCompleted ? C.greenBorder : "rgba(233, 30, 99, 0.3)",
        description:
          attendanceReward?.description ??
          "Complete consistent daily gym check-ins for 30 consecutive days.",
        progressLabel: "Progress",
        currentProgress: Math.min(totalAttendanceDays, 30),
        totalProgress: 30,
        unit: "Days",
        rewardPoints: attendanceReward?.points || 300,
        rewardColor: C.gold,
        iconName: "calendar-outline",
        iconColor: C.gold,
        iconBg: "rgba(233, 30, 99, 0.12)",
        iconBorder: "rgba(233, 30, 99, 0.3)",
      },
      {
        id: workoutReward?.reward_uuid ?? "ch-strength",
        title: workoutReward?.title ?? "Strength challenge",
        badgeTag: strengthCompleted
          ? "COMPLETED"
          : completedWorkouts > 0
            ? "IN_PROGRESS"
            : "AVAILABLE",
        badgeTagColor: strengthCompleted ? C.green : C.purple,
        badgeTagBg: strengthCompleted ? C.greenBg : C.purpleBg,
        badgeTagBorder: strengthCompleted ? C.greenBorder : C.purpleBorder,
        description:
          workoutReward?.description ??
          "Log strength workout milestones and complete targeted set routines.",
        progressLabel: "Workouts Completed",
        currentProgress: Math.min(completedWorkouts, 12),
        totalProgress: 12,
        unit: "Workouts",
        rewardPoints: workoutReward?.points || 250,
        rewardColor: C.purple,
        iconName: "barbell-outline",
        iconColor: C.purple,
        iconBg: C.purpleBg,
        iconBorder: C.purpleBorder,
      },
    ];

    apiRewards
      .filter((r) => r.challenge_type !== "attendance" && r.challenge_type !== "workout")
      .forEach((r) => {
        const isDone = r.status === "completed" || r.status === "unlocked";
        list.push({
          id: r.reward_uuid,
          title: r.title,
          badgeTag: isDone ? "COMPLETED" : "AVAILABLE",
          badgeTagColor: isDone ? C.green : C.cyan,
          badgeTagBg: isDone ? C.greenBg : C.cyanBg,
          badgeTagBorder: isDone ? C.greenBorder : C.cyanBorder,
          description: r.description ?? "Complete this gym milestone to unlock bonus points.",
          progressLabel: "Progress",
          currentProgress: isDone ? 1 : 0,
          totalProgress: 1,
          unit: "Milestone",
          rewardPoints: r.points || 100,
          rewardColor: C.cyan,
          iconName: "trophy-outline",
          iconColor: C.cyan,
          iconBg: C.cyanBg,
          iconBorder: C.cyanBorder,
        });
      });

    return list;
  }, [query.data, totalAttendanceDays, completedWorkouts]);

  // Activity Awards Badges computed strictly from real member achievements
  const badges: AwardBadge[] = useMemo(
    () => [
      {
        id: "badge-1",
        title: "30-Day Star",
        category: "Attendance",
        isLocked: totalAttendanceDays < 30,
        themeColor: C.gold,
        iconName: "star",
        description: "Checked in consistently for 30 consecutive days at the gym.",
      },
      {
        id: "badge-2",
        title: "Iron Lifter",
        category: "Strength",
        isLocked: completedWorkouts < 12,
        themeColor: C.purple,
        iconName: "barbell",
        description: "Completed 12 heavy hypertrophy & strength lifting routines.",
      },
      {
        id: "badge-3",
        title: "Cardio Master",
        category: "Calories",
        isLocked: totalCalories < 10000,
        themeColor: C.red,
        iconName: "flame",
        description: "Burned over 10,000 active calories across high intensity sessions.",
      },
      {
        id: "badge-4",
        title: "Early Bird",
        category: "Time",
        isLocked: earlyMorningSessions < 10,
        themeColor: C.green,
        iconName: "sunny",
        description: "Logged 10 early morning workouts before 08:00 AM.",
      },
      {
        id: "badge-5",
        title: "Hydration Hero",
        category: "Wellness",
        isLocked: completedMealPlans < 14,
        themeColor: C.cyan,
        iconName: "water",
        description: "Consistently logged daily recovery and hydration goals for 2 weeks.",
      },
      {
        id: "badge-6",
        title: "Perfect Month",
        category: "Elite",
        isLocked: totalAttendanceDays < 25 || completedWorkouts < 12,
        themeColor: C.gold,
        iconName: "trophy",
        description: "Closed all daily rings and attended all scheduled classes this month.",
      },
    ],
    [totalAttendanceDays, completedWorkouts, totalCalories, earlyMorningSessions, completedMealPlans]
  );

  const badgesUnlocked = useMemo(
    () => badges.filter((b) => !b.isLocked).length,
    [badges]
  );

  const points = useMemo(() => {
    const apiPoints = (query.data ?? []).reduce((sum, r) => sum + (r.points || 0), 0);
    const challengePoints = challenges
      .filter((c) => c.badgeTag === "COMPLETED")
      .reduce((sum, c) => sum + c.rewardPoints, 0);
    return Math.max(apiPoints, challengePoints);
  }, [query.data, challenges]);

  // Filtered challenges
  const filteredChallenges = useMemo(() => {
    if (filterTab === "Badges Showcase") return [];
    let list = challenges;
    if (filterTab === "Active") {
      list = list.filter((c) => c.badgeTag !== "COMPLETED");
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [challenges, filterTab, searchQuery]);

  return (
    <View style={styles.root}>
      {/* ── Top Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.breadcrumb}>MEMBER GAMIFICATION • CHALLENGES & BADGES</Text>
          <Text style={styles.pageTitle}>Rewards</Text>
          <Text style={styles.pageSubtitle}>Challenges and badges earned through consistency</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={14} color={C.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search rewards..."
              placeholderTextColor={C.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Notification bell with yellow dot */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => navigation.navigate("MemberNotifications")}
            style={styles.bellBtn}
          >
            <Ionicons name="notifications-outline" size={18} color={C.white} />
            {unreadNotifications.length > 0 ? <View style={styles.bellBadgeDot} /> : null}
          </Pressable>

          {/* Orange Profile Avatar "M" */}
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "M"}
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
        {/* ── 3 Metric Cards Row ── */}
        <View style={styles.metricsRow}>
          {/* Card 1: Reward points */}
          <View style={styles.metricCard}>
            <View style={styles.metricCardTop}>
              <Text style={styles.metricCardTitle}>Reward points</Text>
              <View style={[styles.metricIconCircle, { backgroundColor: "rgba(233, 30, 99, 0.15)", borderColor: "rgba(233, 30, 99, 0.4)" }]}>
                <Ionicons name="star" size={15} color={C.gold} />
              </View>
            </View>

            <View style={styles.metricValueRow}>
              <Text style={styles.metricMainValue}>{points}</Text>
              <Text style={[styles.metricUnitText, { color: C.gold }]}>PTS</Text>
            </View>

            <Text style={styles.metricSubtitle}>Available to redeem</Text>

            <View style={styles.metricBottomRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Redeem Perks"
                onPress={() => setPerksModalOpen(true)}
                style={styles.redeemBtn}
              >
                <Text style={styles.redeemBtnText}>Redeem Perks</Text>
                <Ionicons name="chevron-forward" size={12} color={C.gold} />
              </Pressable>
              <Text style={styles.memberIdText}>
                {profile?.member_code ? `ID: #${profile.member_code}` : ""}
              </Text>
            </View>
          </View>

          {/* Card 2: Badges */}
          <View style={styles.metricCard}>
            <View style={styles.metricCardTop}>
              <Text style={styles.metricCardTitle}>Badges</Text>
              <View style={[styles.metricIconCircle, { backgroundColor: C.greenBg, borderColor: C.greenBorder }]}>
                <Ionicons name="ribbon-outline" size={15} color={C.green} />
              </View>
            </View>

            <View style={styles.metricValueRow}>
              <Text style={styles.metricMainValue}>{badgesUnlocked}</Text>
              <Text style={styles.metricUnitMuted}>/ {badges.length} Unlocked</Text>
            </View>

            <Text style={styles.metricSubtitle}>Complete challenges to earn</Text>

            <View style={styles.trackBarWrapper}>
              <View
                style={[
                  styles.trackBarFill,
                  {
                    width: `${badges.length > 0 ? Math.round((badgesUnlocked / badges.length) * 100) : 0}%` as any,
                    backgroundColor: C.green,
                  },
                ]}
              />
            </View>
          </View>

          {/* Card 3: Current Streak */}
          <View style={styles.metricCard}>
            <View style={styles.metricCardTop}>
              <Text style={styles.metricCardTitle}>Current Streak</Text>
              <View style={[styles.metricIconCircle, { backgroundColor: C.redBg, borderColor: C.redBorder }]}>
                <Ionicons name="flame" size={15} color={C.red} />
              </View>
            </View>

            <View style={styles.metricValueRow}>
              <Text style={styles.metricMainValue}>{streakDays}</Text>
              <Text style={[styles.metricUnitText, { color: C.red }]}>Days Active</Text>
            </View>

            <Text style={styles.metricSubtitle}>Check-in daily to keep streak</Text>

            {/* Streak segment pills */}
            <View style={styles.streakPillRow}>
              {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                const isActive = dayNum <= streakDays;
                return (
                  <View
                    key={dayNum}
                    style={[
                      styles.streakPillSegment,
                      isActive && { backgroundColor: C.red },
                    ]}
                  />
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Active Challenges Section ── */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.trophyIcon}>🏆</Text>
            <View>
              <Text style={styles.sectionTitle}>Active Challenges</Text>
              <Text style={styles.sectionSubtitle}>
                Complete tasks to unlock badges and earn reward points
              </Text>
            </View>
          </View>

          {/* Filter Pills */}
          <View style={styles.filterPillsWrap}>
            {(["All", "Active", "Badges Showcase"] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setFilterTab(tab)}
                style={[
                  styles.filterTabBtn,
                  filterTab === tab && styles.filterTabBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterTabBtnText,
                    filterTab === tab && styles.filterTabBtnTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Challenge Cards List */}
        {filteredChallenges.map((challenge) => {
          const progressPercent = Math.min(
            Math.round((challenge.currentProgress / challenge.totalProgress) * 100),
            100
          );

          return (
            <View key={challenge.id} style={styles.challengeCard}>
              {/* Left Squircle Icon */}
              <View
                style={[
                  styles.challengeIconBox,
                  {
                    backgroundColor: challenge.iconBg,
                    borderColor: challenge.iconBorder,
                  },
                ]}
              >
                <Ionicons
                  name={challenge.iconName}
                  size={24}
                  color={challenge.iconColor}
                />
              </View>

              {/* Middle Details */}
              <View style={styles.challengeInfoCol}>
                <View style={styles.challengeTitleRow}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <View
                    style={[
                      styles.challengeTag,
                      {
                        backgroundColor: challenge.badgeTagBg,
                        borderColor: challenge.badgeTagBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.challengeTagText,
                        { color: challenge.badgeTagColor },
                      ]}
                    >
                      {challenge.badgeTag}
                    </Text>
                  </View>
                </View>

                <Text style={styles.challengeDescription}>
                  {challenge.description}
                </Text>

                {/* Progress Bar + Label */}
                <View style={styles.challengeProgressBlock}>
                  <View style={styles.progressLabelsRow}>
                    <Text style={styles.progressLabelLeft}>{challenge.progressLabel}</Text>
                    <Text style={styles.progressLabelRight}>
                      {challenge.currentProgress} / {challenge.totalProgress}{" "}
                      {challenge.unit}
                    </Text>
                  </View>
                  <View style={styles.challengeProgressBarTrack}>
                    <View
                      style={[
                        styles.challengeProgressBarFill,
                        {
                          width: `${progressPercent}%` as any,
                          backgroundColor: challenge.iconColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>

              {/* Right Reward & Action */}
              <View style={styles.challengeRightCol}>
                <Text style={styles.rewardEyebrow}>Reward</Text>
                <View style={styles.rewardPointsBadge}>
                  <Ionicons name="star" size={13} color={challenge.rewardColor} />
                  <Text
                    style={[
                      styles.rewardPointsText,
                      { color: challenge.rewardColor },
                    ]}
                  >
                    +{challenge.rewardPoints} PTS
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View details"
                  style={styles.viewDetailsBtn}
                  onPress={() => setSelectedChallenge(challenge)}
                >
                  <Text style={styles.viewDetailsBtnText}>View details</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        {/* ── Activity Awards Showcase Section ── */}
        <View style={[styles.sectionHeaderRow, { marginTop: 14 }]}>
          <View style={styles.sectionHeaderLeft}>
            <View style={styles.shieldIconWrap}>
              <Ionicons name="shield-checkmark-outline" size={17} color={C.green} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Activity Awards Showcase</Text>
              <Text style={styles.sectionSubtitle}>
                Apple Fitness styled metallic achievements
              </Text>
            </View>
          </View>
        </View>

        {/* Badges Grid */}
        <View style={styles.badgesGrid}>
          {badges.map((badge) => (
            <Pressable
              key={badge.id}
              accessibilityRole="button"
              accessibilityLabel={badge.title}
              onPress={() => setSelectedBadge(badge)}
              style={({ pressed }) => [
                styles.badgeCard,
                pressed && { opacity: 0.88 },
              ]}
            >
              {/* Metallic Ring Avatar */}
              <View
                style={[
                  styles.badgeMetallicOuter,
                  {
                    borderColor: badge.themeColor + "88",
                    shadowColor: badge.themeColor,
                  },
                ]}
              >
                <View
                  style={[
                    styles.badgeMetallicInner,
                    { borderColor: badge.themeColor + "55" },
                  ]}
                >
                  <Ionicons
                    name={badge.iconName}
                    size={22}
                    color={badge.themeColor}
                  />
                </View>
              </View>

              {/* Title & Category */}
              <Text
                style={[
                  styles.badgeTitle,
                  badge.title === "Perfect Month" && { color: C.amber },
                ]}
              >
                {badge.title}
              </Text>
              <Text style={styles.badgeCategory}>{badge.category}</Text>

              {/* Locked / Unlocked Pill */}
              <View
                style={[
                  styles.badgeStatusPill,
                  !badge.isLocked && {
                    backgroundColor: "rgba(52, 199, 89, 0.15)",
                    borderColor: "rgba(52, 199, 89, 0.4)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeStatusPillText,
                    !badge.isLocked && { color: C.green },
                  ]}
                >
                  {badge.isLocked ? "LOCKED" : "UNLOCKED"}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* ── Floating Ask Gemini Pill ── */}
      <View style={styles.floatingGeminiPill}>
        <Ionicons name="sparkles" size={13} color="#007AFF" />
        <Text style={styles.floatingGeminiText}>Ask Gemini</Text>
      </View>

      {/* ── Challenge Details Modal ── */}
      <Modal
        visible={selectedChallenge !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedChallenge(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSelectedChallenge(null)}
        >
          <Pressable style={styles.modalDialog} onPress={(e) => e.stopPropagation()}>
            {selectedChallenge ? (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <View
                      style={[
                        styles.challengeIconBox,
                        {
                          width: 44,
                          height: 44,
                          backgroundColor: selectedChallenge.iconBg,
                          borderColor: selectedChallenge.iconBorder,
                        },
                      ]}
                    >
                      <Ionicons
                        name={selectedChallenge.iconName}
                        size={22}
                        color={selectedChallenge.iconColor}
                      />
                    </View>
                    <View>
                      <Text style={styles.modalTitle}>{selectedChallenge.title}</Text>
                      <Text style={styles.modalSubtitle}>Challenge Milestone</Text>
                    </View>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedChallenge(null)}
                  >
                    <Ionicons name="close" size={18} color={C.muted} />
                  </Pressable>
                </View>

                <Text style={styles.modalBodyText}>
                  {selectedChallenge.description}
                </Text>

                <View style={styles.modalInfoBox}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoKey}>Reward Points</Text>
                    <Text style={[styles.modalInfoVal, { color: selectedChallenge.rewardColor }]}>
                      +{selectedChallenge.rewardPoints} PTS
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoKey}>Current Progress</Text>
                    <Text style={styles.modalInfoVal}>
                      {selectedChallenge.currentProgress} / {selectedChallenge.totalProgress} {selectedChallenge.unit}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={styles.modalActionBtn}
                  onPress={() => setSelectedChallenge(null)}
                >
                  <LinearGradient
                    colors={["#E91E63", "#E91E63"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.modalActionBtnGradient}
                  >
                    <Text style={styles.modalActionBtnText}>Track Progress</Text>
                  </LinearGradient>
                </Pressable>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Badge Details Modal ── */}
      <Modal
        visible={selectedBadge !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBadge(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSelectedBadge(null)}
        >
          <Pressable
            style={[styles.modalDialog, { alignItems: "center" }]}
            onPress={(e) => e.stopPropagation()}
          >
            {selectedBadge ? (
              <>
                <View
                  style={[
                    styles.badgeMetallicOuter,
                    {
                      width: 90,
                      height: 90,
                      borderRadius: 45,
                      borderColor: selectedBadge.themeColor,
                      marginBottom: 16,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.badgeMetallicInner,
                      {
                        width: 76,
                        height: 76,
                        borderRadius: 38,
                        borderColor: selectedBadge.themeColor + "77",
                      },
                    ]}
                  >
                    <Ionicons
                      name={selectedBadge.iconName}
                      size={36}
                      color={selectedBadge.themeColor}
                    />
                  </View>
                </View>

                <Text style={styles.modalTitle}>{selectedBadge.title}</Text>
                <Text style={[styles.modalSubtitle, { marginBottom: 12 }]}>
                  {selectedBadge.category} Achievement
                </Text>

                <Text style={[styles.modalBodyText, { textAlign: "center", marginBottom: 20 }]}>
                  {selectedBadge.description}
                </Text>

                <View
                  style={[
                    styles.badgeStatusPill,
                    { paddingHorizontal: 16, paddingVertical: 6, marginBottom: 20 },
                  ]}
                >
                  <Text style={styles.badgeStatusPillText}>
                    {selectedBadge.isLocked ? "🔒 LOCKED - COMPLETE CHALLENGE TO UNLOCK" : "🎉 UNLOCKED"}
                  </Text>
                </View>

                <Pressable
                  style={[styles.modalCancelBtn, { width: "100%" }]}
                  onPress={() => setSelectedBadge(null)}
                >
                  <Text style={styles.modalCancelBtnText}>Close</Text>
                </Pressable>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Redeem Perks Modal ── */}
      <Modal
        visible={perksModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPerksModalOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setPerksModalOpen(false)}
        >
          <Pressable style={styles.modalDialog} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View
                  style={[
                    styles.challengeIconBox,
                    {
                      width: 44,
                      height: 44,
                      backgroundColor: "rgba(233, 30, 99, 0.15)",
                      borderColor: "rgba(233, 30, 99, 0.4)",
                    },
                  ]}
                >
                  <Ionicons name="gift-outline" size={22} color={C.gold} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Redeem Perks</Text>
                  <Text style={styles.modalSubtitle}>Your Balance: {points} PTS</Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={styles.modalCloseBtn}
                onPress={() => setPerksModalOpen(false)}
              >
                <Ionicons name="close" size={18} color={C.muted} />
              </Pressable>
            </View>

            <View style={{ gap: 10, marginVertical: 14 }}>
              {[
                { name: "Free Protein Shake Bar Voucher", pts: 150 },
                { name: "1-on-1 PT Consultation (30 min)", pts: 350 },
                { name: "Premium Gym Shaker Bottle", pts: 250 },
                { name: "1 Free Guest Day Pass", pts: 200 },
              ].map((perk, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 12,
                    backgroundColor: "#1C1C1E",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: C.cardBorder,
                  }}
                >
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ color: C.white, fontWeight: "600", fontSize: 13 }}>
                      {perk.name}
                    </Text>
                    <Text style={{ color: C.gold, fontSize: 12, fontWeight: "700", marginTop: 2 }}>
                      {perk.pts} PTS
                    </Text>
                  </View>
                  <Pressable
                    style={{
                      backgroundColor: points >= perk.pts ? C.primary : "#1C1C1E",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                    disabled={points < perk.pts}
                  >
                    <Text
                      style={{
                        color: points >= perk.pts ? C.white : C.muted,
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      {points >= perk.pts ? "Redeem" : "Locked"}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <Pressable
              style={styles.modalCancelBtn}
              onPress={() => setPerksModalOpen(false)}
            >
              <Text style={styles.modalCancelBtnText}>Done</Text>
            </Pressable>
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
    flex: 1,
    minWidth: 260,
    gap: 3,
  },
  breadcrumb: {
    fontSize: 10,
    fontWeight: "700",
    color: C.gold,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: C.white,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: C.muted,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  demoStateWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  demoStateLabel: {
    fontSize: 12,
    color: C.muted,
  },
  demoStateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.pillBg,
    borderWidth: 1,
    borderColor: C.pillBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  demoStateBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.white,
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
    minWidth: 180,
  },
  searchInput: {
    color: C.white,
    fontSize: 13,
    flex: 1,
    padding: 0,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
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
    backgroundColor: C.gold,
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
    gap: 22,
    paddingBottom: 90,
  },

  // ── 3 Metric Cards Row
  metricsRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  metricCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 18,
    padding: 20,
    justifyContent: "space-between",
  },
  metricCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metricCardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: C.muted,
  },
  metricIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  metricValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 4,
  },
  metricMainValue: {
    fontSize: 32,
    fontWeight: "800",
    color: C.white,
    letterSpacing: -1,
  },
  metricUnitText: {
    fontSize: 15,
    fontWeight: "800",
  },
  metricUnitMuted: {
    fontSize: 14,
    fontWeight: "600",
    color: C.muted,
  },
  metricSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginBottom: 12,
  },
  metricBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  redeemBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  redeemBtnText: {
    color: C.gold,
    fontWeight: "700",
    fontSize: 12,
  },
  memberIdText: {
    color: C.mutedDark,
    fontSize: 11,
    fontWeight: "600",
  },
  trackBarWrapper: {
    height: 4,
    backgroundColor: C.trackBg,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 6,
  },
  trackBarFill: {
    height: 4,
    borderRadius: 2,
  },
  streakPillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  streakPillSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.trackBg,
  },

  // ── Section Header Row
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 6,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  trophyIcon: {
    fontSize: 20,
  },
  shieldIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.greenBg,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: C.white,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  filterPillsWrap: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  filterTabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 11,
  },
  filterTabBtnActive: {
    backgroundColor: "#1C1C1E",
  },
  filterTabBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
  },
  filterTabBtnTextActive: {
    color: C.white,
  },

  // ── Challenge Card
  challengeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 18,
    padding: 20,
    gap: 18,
    flexWrap: "wrap",
  },
  challengeIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  challengeInfoCol: {
    flex: 1,
    minWidth: 260,
    gap: 6,
  },
  challengeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  challengeTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.white,
  },
  challengeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  challengeTagText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  challengeDescription: {
    fontSize: 12,
    color: C.muted,
  },
  challengeProgressBlock: {
    marginTop: 4,
    gap: 6,
  },
  progressLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabelLeft: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
  },
  progressLabelRight: {
    fontSize: 12,
    fontWeight: "700",
    color: C.white,
  },
  challengeProgressBarTrack: {
    height: 4,
    backgroundColor: C.trackBg,
    borderRadius: 2,
    overflow: "hidden",
  },
  challengeProgressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  challengeRightCol: {
    alignItems: "flex-end",
    gap: 6,
    minWidth: 110,
  },
  rewardEyebrow: {
    fontSize: 11,
    color: C.muted,
  },
  rewardPointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rewardPointsText: {
    fontSize: 14,
    fontWeight: "800",
  },
  viewDetailsBtn: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  viewDetailsBtnText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "700",
  },

  // ── Badges Grid
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  badgeCard: {
    flex: 1,
    minWidth: 155,
    maxWidth: 200,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  badgeMetallicOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  badgeMetallicInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: C.white,
    textAlign: "center",
  },
  badgeCategory: {
    fontSize: 11,
    color: C.muted,
  },
  badgeStatusPill: {
    backgroundColor: "#1C1C1E",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  badgeStatusPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 0.5,
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
  modalDialog: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: C.white,
  },
  modalSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBodyText: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalInfoBox: {
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 14,
    gap: 10,
    marginBottom: 20,
  },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalInfoKey: {
    fontSize: 13,
    color: C.muted,
  },
  modalInfoVal: {
    fontSize: 14,
    fontWeight: "700",
    color: C.white,
  },
  modalActionBtn: {
    borderRadius: 50,
    overflow: "hidden",
  },
  modalActionBtnGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalActionBtnText: {
    color: C.white,
    fontWeight: "700",
    fontSize: 15,
  },
  modalCancelBtn: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: "center",
  },
  modalCancelBtnText: {
    color: C.white,
    fontWeight: "600",
    fontSize: 14,
  },
});
