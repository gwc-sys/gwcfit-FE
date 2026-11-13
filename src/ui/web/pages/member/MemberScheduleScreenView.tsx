import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../../components/Screen";
import { useAuthStore } from "../../../../store/useAuthStore";
import {
  useBookClass,
  useCancelClass,
  useMemberClasses,
  useMemberWorkouts,
} from "../../../../hooks/useMember";
import type { MemberClass, MemberWorkout } from "../../../../types/member";

type ScheduleTab = "overview" | "workouts" | "classes";

interface ClassItem {
  id: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  spotsLeft: string;
  spotsAlert?: boolean;
  title: string;
  description: string;
  coach: string;
  coachColor: string;
  time: string;
  booked?: boolean;
}

export function MemberScheduleScreenView({
  model,
}: {
  model?: any;
}): React.JSX.Element {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const { width } = useWindowDimensions();
  const isNarrow = width < 980;
  const isMobile = width < 720;

  // Real backend queries & mutations
  const hookClasses = useMemberClasses();
  const hookWorkouts = useMemberWorkouts();
  const query = model?.props?.query ?? hookClasses;
  const workoutsQuery = model?.props?.workoutsQuery ?? hookWorkouts;
  const bookClassMutation = useBookClass();
  const cancelClassMutation = useCancelClass();

  // State
  const [activeTab, setActiveTab] = useState<ScheduleTab>("overview");
  const [showEmptyClasses, setShowEmptyClasses] = useState(false);
  const [deletedUpcoming, setDeletedUpcoming] = useState(false);
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [newWorkoutModalVisible, setNewWorkoutModalVisible] = useState(false);
  const [selectedRescheduleTime, setSelectedRescheduleTime] =
    useState("10:00 AM");
  const [upcomingTime, setUpcomingTime] = useState("10:00 AM (45 min)");

  // Real Gym Classes mapped from backend API (query.data)
  const mappedClasses: ClassItem[] = useMemo(() => {
    return ((query?.data as MemberClass[] | undefined) ?? []).map((c: MemberClass) => {
      const isBooked = c.booking_status === "booked";
      const typeLower = (c.class_type || "").toLowerCase();
      let tagColor = "#E91E63";
      let tagBg = "rgba(233, 30, 99, 0.15)";
      if (typeLower.includes("yoga") || typeLower.includes("flex")) {
        tagColor = "#34C759";
        tagBg = "rgba(52, 199, 89, 0.15)";
      } else if (typeLower.includes("spin") || typeLower.includes("cycle")) {
        tagColor = "#007AFF";
        tagBg = "rgba(0, 122, 255, 0.15)";
      }

      return {
        id: c.class_uuid,
        tag: c.class_type?.toUpperCase() || "FITNESS",
        tagColor,
        tagBg,
        spotsLeft: isBooked ? "Booked (Reserved)" : `${c.available_seats} spot${c.available_seats === 1 ? "" : "s"} left`,
        spotsAlert: c.available_seats <= 3,
        title: c.class_name,
        description: (c as any).description || (
          typeLower.includes("hiit")
            ? "High intensity interval training designed for maximum calorie burn."
            : typeLower.includes("yoga")
            ? "Flowing movement and breathing techniques to improve flexibility and core strength."
            : "High-energy rhythm indoor cycling session with steep climbs and sprints."
        ),
        coach: c.trainer_name || "Trainer Rohit",
        coachColor: tagColor,
        time: c.time || "05:00 PM (50m)",
        booked: isBooked,
      };
    });
  }, [query.data]);

  // Toggle Class Booking with real API mutation
  const handleToggleBookClass = (item: ClassItem) => {
    if (item.booked) {
      cancelClassMutation.mutate(item.id, {
        onSuccess: () => {
          void query.refetch();
        },
      });
    } else {
      bookClassMutation.mutate(item.id, {
        onSuccess: () => {
          void query.refetch();
        },
      });
    }
  };

  // Real workouts mapped from backend API (workoutsQuery.data)
  const workouts = (workoutsQuery?.data as MemberWorkout[] | undefined) ?? [];
  const upcomingWorkouts = workouts.filter((w: MemberWorkout) => w.completion_status !== "completed");
  const completedWorkouts = workouts.filter((w: MemberWorkout) => w.completion_status === "completed");

  // Reschedule handler
  const handleConfirmReschedule = () => {
    setUpcomingTime(`${selectedRescheduleTime} (45 min)`);
    setRescheduleModalVisible(false);
  };

  return (
    <Screen
      scroll
      maxWidth="none"
      style={styles.screenContainer}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching || workoutsQuery.isRefetching}
          onRefresh={() => {
            void query.refetch();
            void workoutsQuery.refetch();
          }}
          tintColor="#E91E63"
        />
      }
    >
      {/* =================================================================== */}
      {/* 1. TOP HEADER BAR                                                   */}
      {/* =================================================================== */}
      <View style={[styles.headerRow, isNarrow && styles.headerRowNarrow]}>
        <View style={styles.headerLeft}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Schedule</Text>
            <Text style={styles.headerSubtitle}>Workouts and gym classes</Text>
          </View>
        </View>

        <View style={[styles.headerRight, isNarrow && styles.headerRightNarrow]}>
          {/* Date Pill */}
          <View style={styles.datePill}>
            <Ionicons
              name="calendar-outline"
              size={15}
              color="#E91E63"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.dateText}>November 5, 2026</Text>
          </View>

          {/* Book Class Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Book Class"
            onPress={() => setActiveTab("classes")}
            style={({ pressed }) => [
              styles.bookClassBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons
              name="add"
              size={16}
              color="#E91E63"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.bookClassBtnText}>Book Class</Text>
          </Pressable>

          {/* Add Workout Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add Workout"
            onPress={() => navigation.navigate("AIWorkoutGenerator")}
            style={({ pressed }) => [
              styles.addWorkoutBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons
              name="barbell-outline"
              size={16}
              color="#FFFFFF"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.addWorkoutBtnText}>Add Workout</Text>
          </Pressable>

          {/* User Avatar Circle */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Member Profile"
            onPress={() => navigation.navigate("MemberProfileHome")}
            style={({ pressed }) => [
              styles.avatarCircle,
              pressed && styles.btnPressed,
            ]}
          >
            <Text style={styles.avatarText}>
              {(user?.full_name?.[0] || user?.email?.[0] || "M").toUpperCase()}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* =================================================================== */}
      {/* 2. FILTER TABS & SWITCH BAR                                         */}
      {/* =================================================================== */}
      <View style={[styles.filterBarRow, isNarrow && styles.filterBarRowNarrow]}>
        <View style={styles.filterTabsPillBox}>
          {(
            [
              ["overview", "Overview"],
              ["workouts", "Workouts"],
              ["classes", "Gym Classes"],
            ] as Array<[ScheduleTab, string]>
          ).map(([key, label]) => {
            const active = activeTab === key;
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={`${label} Tab`}
                onPress={() => setActiveTab(key)}
                style={[
                  styles.filterTab,
                  active && styles.filterTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    active && styles.filterTabTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* =================================================================== */}
      {/* 3. SECTION 1: UPCOMING WORKOUTS                                     */}
      {/* =================================================================== */}
      {activeTab !== "classes" && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderLine}>
            <View style={styles.sectionTitleWithIcon}>
              <Ionicons
                name="time-outline"
                size={18}
                color="#E91E63"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.sectionTitleText}>Upcoming Workouts</Text>
            </View>
            <Text style={styles.sectionSubCount}>
              {deletedUpcoming || upcomingWorkouts.length === 0
                ? "0 sessions scheduled"
                : `${upcomingWorkouts.length} session scheduled`}
            </Text>
          </View>

          {!deletedUpcoming && upcomingWorkouts.length > 0 ? (
            upcomingWorkouts.map((workout: MemberWorkout) => (
              <View key={workout.workout_plan_uuid} style={styles.workoutScheduleCard}>
                <View style={styles.workoutCardLeft}>
                  {/* Red Squircle Dumbbell Icon */}
                  <View style={styles.redDumbbellBox}>
                    <Ionicons name="barbell" size={20} color="#E91E63" />
                  </View>

                  {/* Workout Details */}
                  <View style={styles.workoutCopyBox}>
                    <View style={styles.workoutTitleRow}>
                      <Text style={styles.workoutMainTitle}>{workout.workout_plan_name}</Text>
                      <View style={styles.upcomingPill}>
                        <Text style={styles.upcomingPillText}>UPCOMING</Text>
                      </View>
                    </View>
                    <Text style={styles.workoutSubtitleCoral}>
                      {workout.workout_plan_name} - {workout.level || "first level"}
                    </Text>
                    <View style={styles.workoutMetaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="person-outline"
                          size={13}
                          color="#F2F2F7"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.metaText}>{workout.trainer_name || "Trainer Rohit"}</Text>
                      </View>
                      <Text style={styles.metaDot}>•</Text>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color="#F2F2F7"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.metaText}>{upcomingTime}</Text>
                      </View>
                      <Text style={styles.metaDot}>•</Text>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="flame"
                          size={13}
                          color="#E91E63"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.metaText}>
                          ~{String((workout.today_workout as any)?.calories_burned || 350)} kcal
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View
                  style={[
                    styles.workoutCardRight,
                    isNarrow && styles.workoutCardRightNarrow,
                  ]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Start Session"
                    onPress={() => navigation.navigate("MemberWorkoutSession")}
                    style={({ pressed }) => [
                      styles.startSessionBtn,
                      pressed && styles.btnPressed,
                    ]}
                  >
                    <Ionicons
                      name="play"
                      size={14}
                      color="#FFFFFF"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.startSessionBtnText}>Start Session</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Reschedule Workout"
                    onPress={() => setRescheduleModalVisible(true)}
                    style={({ pressed }) => [
                      styles.rescheduleBtn,
                      pressed && styles.btnPressed,
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={15}
                      color="#F2F2F7"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.rescheduleBtnText}>Reschedule</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Cancel Workout"
                    onPress={() => setDeletedUpcoming(true)}
                    style={({ pressed }) => [
                      styles.deleteIconBtn,
                      pressed && styles.btnPressed,
                    ]}
                  >
                    <Ionicons name="trash-outline" size={17} color="#F2F2F7" />
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptySessionBox}>
              <Text style={styles.emptySessionText}>
                No upcoming workouts scheduled for today.
              </Text>
              {deletedUpcoming && (
                <Pressable
                  onPress={() => setDeletedUpcoming(false)}
                  style={styles.restoreBtn}
                >
                  <Text style={styles.restoreBtnText}>Restore Workout</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      )}

      {/* =================================================================== */}
      {/* 4. SECTION 2: COMPLETED WORKOUTS                                   */}
      {/* =================================================================== */}
      {activeTab !== "classes" && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderLine}>
            <View style={styles.sectionTitleWithIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#34C759"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.sectionTitleText}>Completed Workouts</Text>
            </View>
            <Text style={styles.sectionSubCount}>
              {completedWorkouts.length > 0
                ? `${completedWorkouts.length} completed today`
                : "1 completed today"}
            </Text>
          </View>

          <View style={styles.completedCard}>
            <View style={styles.completedCardLeft}>
              <View style={styles.greenCheckSquare}>
                <Ionicons name="checkmark" size={18} color="#34C759" />
              </View>
              <View>
                <Text style={styles.completedTitle}>
                  {completedWorkouts[0]?.workout_plan_name || "Upper Body & Core Warmup"}
                </Text>
                <Text style={styles.completedSubtitle}>
                  Completed at 08:00 AM • 320 kcal burned • 35 mins
                </Text>
              </View>
            </View>

            <View style={styles.completedCardRight}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View Summary"
                onPress={() => setSummaryModalVisible(true)}
                style={({ pressed }) => [
                  styles.viewSummaryBtn,
                  pressed && styles.btnPressed,
                ]}
              >
                <Text style={styles.viewSummaryBtnText}>View Summary</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Repeat Workout"
                onPress={() => {
                  setDeletedUpcoming(false);
                  setActiveTab("workouts");
                }}
                style={({ pressed }) => [
                  styles.repeatWorkoutBtn,
                  pressed && styles.btnPressed,
                ]}
              >
                <Text style={styles.repeatWorkoutBtnText}>Repeat Workout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* =================================================================== */}
      {/* 5. SECTION 3: GYM CLASSES                                           */}
      {/* =================================================================== */}
      {activeTab !== "workouts" && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderLine}>
            <View>
              <View style={styles.sectionTitleWithIcon}>
                <Ionicons
                  name="people-outline"
                  size={18}
                  color="#007AFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.sectionTitleText}>Gym Classes</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Join group fitness sessions led by expert coaches
              </Text>
            </View>
            <View style={styles.countBadgePill}>
              <Text style={styles.countBadgeText}>
                {showEmptyClasses ? "0 Available" : `${mappedClasses.length} Available`}
              </Text>
            </View>
          </View>

          {showEmptyClasses || mappedClasses.length === 0 ? (
            <View style={styles.emptyClassesContainer}>
              <Ionicons name="calendar-outline" size={40} color="#F2F2F7" />
              <Text style={styles.emptyClassesTitle}>
                No gym classes available right now
              </Text>
              <Text style={styles.emptyClassesSubtitle}>
                {showEmptyClasses
                  ? "Toggle \"Show Empty Classes State\" off to view available sessions."
                  : "Check back later for newly scheduled group classes."}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.classesGridRow,
                isNarrow && styles.classesGridRowNarrow,
              ]}
            >
              {mappedClasses.map((item) => (
                <View key={item.id} style={styles.classCard}>
                  {/* Top Tags Row */}
                  <View style={styles.classCardTopRow}>
                    <View
                      style={[
                        styles.classTagPill,
                        { backgroundColor: item.tagBg },
                      ]}
                    >
                      <Text
                        style={[styles.classTagText, { color: item.tagColor }]}
                      >
                        {item.tag}
                      </Text>
                    </View>

                    <View style={styles.spotsRow}>
                      {item.spotsAlert ? (
                        <Ionicons
                          name="flame"
                          size={13}
                          color="#E91E63"
                          style={{ marginRight: 4 }}
                        />
                      ) : (
                        <Ionicons
                          name="people-outline"
                          size={13}
                          color="#F2F2F7"
                          style={{ marginRight: 4 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.spotsText,
                          item.spotsAlert && { color: "#E91E63" },
                        ]}
                      >
                        {item.spotsLeft}
                      </Text>
                    </View>
                  </View>

                  {/* Title & Description */}
                  <View style={styles.classCardBody}>
                    <Text style={styles.classTitle}>{item.title}</Text>
                    <Text numberOfLines={2} style={styles.classDescription}>
                      {item.description}
                    </Text>
                  </View>

                  {/* Coach & Time Row */}
                  <View style={styles.classMetaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="person-outline"
                        size={13}
                        color={item.coachColor}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.metaText}>{item.coach}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="time-outline"
                        size={13}
                        color="#F2F2F7"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.metaText}>{item.time}</Text>
                    </View>
                  </View>

                  {/* Book / Cancel Button */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      item.booked ? "Cancel Booking" : "Book Class"
                    }
                    onPress={() => handleToggleBookClass(item)}
                    style={({ pressed }) => [
                      styles.bookClassActionBtn,
                      item.booked && styles.bookClassActionBtnActive,
                      pressed && styles.btnPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bookClassActionBtnText,
                        item.booked && styles.bookClassActionBtnTextActive,
                      ]}
                    >
                      {item.booked ? "✓ Booked" : "Book Class"}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Floating Subtle "Ask Gemini" Pill in Bottom Right */}
      <View style={styles.floatingGeminiPill}>
        <Text style={styles.floatingGeminiText}>Ask Gemini</Text>
      </View>

      {/* =================================================================== */}
      {/* 6. MODAL: VIEW WORKOUT SUMMARY                                      */}
      {/* =================================================================== */}
      <Modal
        visible={summaryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSummaryModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Workout Summary</Text>
              <Pressable onPress={() => setSummaryModalVisible(false)}>
                <Ionicons name="close" size={20} color="#F2F2F7" />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.summaryWorkoutTitle}>
                Upper Body & Core Warmup
              </Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Completed At:</Text>
                <Text style={styles.summaryVal}>08:00 AM Today</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Calories:</Text>
                <Text style={[styles.summaryVal, { color: "#E91E63" }]}>
                  320 kcal
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration:</Text>
                <Text style={styles.summaryVal}>35 minutes</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Target Areas:</Text>
                <Text style={styles.summaryVal}>Chest, Core, Shoulders</Text>
              </View>
            </View>

            <Pressable
              onPress={() => setSummaryModalVisible(false)}
              style={styles.modalPrimaryBtn}
            >
              <Text style={styles.modalPrimaryBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* =================================================================== */}
      {/* 7. MODAL: RESCHEDULE WORKOUT                                        */}
      {/* =================================================================== */}
      <Modal
        visible={rescheduleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRescheduleModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reschedule Workout</Text>
              <Pressable onPress={() => setRescheduleModalVisible(false)}>
                <Ionicons name="close" size={20} color="#F2F2F7" />
              </Pressable>
            </View>

            <Text style={styles.rescheduleSubtitle}>
              Select a new time slot for Back Workout:
            </Text>

            <View style={styles.timeSlotsGrid}>
              {[
                "09:00 AM",
                "10:00 AM",
                "11:30 AM",
                "02:00 PM",
                "04:30 PM",
                "06:00 PM",
              ].map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setSelectedRescheduleTime(t)}
                  style={[
                    styles.timeSlotPill,
                    selectedRescheduleTime === t && styles.timeSlotPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedRescheduleTime === t && styles.timeSlotTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleConfirmReschedule}
              style={styles.modalPrimaryBtn}
            >
              <Text style={styles.modalPrimaryBtnText}>Confirm Reschedule</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

// --------------------------------------------------------------------------
// STYLESHEET (Cyberpunk Dark Glassmorphic Apple Fitness Theme)
// --------------------------------------------------------------------------
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 48,
  },

  // 1. Header Bar
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 16,
  },
  headerRowNarrow: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#F2F2F7",
    marginTop: 2,
    fontWeight: "400",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "nowrap",
  },
  headerRightNarrow: {
    flexWrap: "wrap",
  },
  datePill: {
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },
  bookClassBtn: {
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(233, 30, 99, 0.35)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  bookClassBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  addWorkoutBtn: {
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E91E63",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  addWorkoutBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // 2. Filter Bar & Switch
  filterBarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 16,
  },
  filterBarRowNarrow: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 12,
  },
  filterTabsPillBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 3,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
  },
  filterTabActive: {
    backgroundColor: "#1C1C1E",
  },
  filterTabText: {
    fontSize: 12.5,
    fontWeight: "500",
    color: "#F2F2F7",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  switchLabel: {
    fontSize: 12.5,
    color: "#F2F2F7",
    fontWeight: "500",
  },

  // 3. Section Blocks Common
  sectionBlock: {
    marginBottom: 26,
  },
  sectionHeaderLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitleText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: "#F2F2F7",
    marginTop: 2,
  },
  sectionSubCount: {
    fontSize: 12.5,
    color: "#F2F2F7",
  },

  // Upcoming Workouts Card
  workoutScheduleCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  workoutCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  redDumbbellBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(233, 30, 99, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(233, 30, 99, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  workoutCopyBox: {
    gap: 3,
    flex: 1,
  },
  workoutTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  workoutMainTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  upcomingPill: {
    backgroundColor: "rgba(233, 30, 99, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  upcomingPillText: {
    color: "#E91E63",
    fontSize: 10.5,
    fontWeight: "700",
  },
  workoutSubtitleCoral: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#E91E63",
  },
  workoutMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#F2F2F7",
  },
  metaDot: {
    color: "#F2F2F7",
    fontSize: 12,
  },
  workoutCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  workoutCardRightNarrow: {
    flexWrap: "wrap",
  },
  startSessionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E91E63",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startSessionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  rescheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rescheduleBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "500",
  },
  deleteIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptySessionBox: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  emptySessionText: {
    color: "#F2F2F7",
    fontSize: 13,
  },
  restoreBtn: {
    marginTop: 8,
  },
  restoreBtnText: {
    color: "#E91E63",
    fontSize: 12.5,
    fontWeight: "600",
  },

  // Completed Workouts Card
  completedCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  completedCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  greenCheckSquare: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  completedTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  completedSubtitle: {
    fontSize: 12.5,
    color: "#F2F2F7",
    marginTop: 3,
  },
  completedCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  viewSummaryBtn: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 16,
  },
  viewSummaryBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "500",
  },
  repeatWorkoutBtn: {
    backgroundColor: "rgba(52, 199, 89, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.35)",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 16,
  },
  repeatWorkoutBtnText: {
    color: "#34C759",
    fontSize: 12.5,
    fontWeight: "700",
  },

  // Gym Classes Section
  countBadgePill: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  classesGridRow: {
    flexDirection: "row",
    gap: 16,
  },
  classesGridRowNarrow: {
    flexDirection: "column",
  },
  classCard: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 18,
    justifyContent: "space-between",
  },
  classCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  classTagPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  classTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  spotsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  spotsText: {
    fontSize: 12,
    color: "#F2F2F7",
  },
  classCardBody: {
    marginVertical: 4,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  classDescription: {
    fontSize: 12,
    color: "#F2F2F7",
    lineHeight: 18,
  },
  classMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 14,
  },
  bookClassActionBtn: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  bookClassActionBtnActive: {
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    borderColor: "rgba(52, 199, 89, 0.4)",
  },
  bookClassActionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  bookClassActionBtnTextActive: {
    color: "#34C759",
  },

  emptyClassesContainer: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyClassesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 12,
  },
  emptyClassesSubtitle: {
    fontSize: 13,
    color: "#F2F2F7",
    marginTop: 4,
  },

  // Floating Gemini Pill
  floatingGeminiPill: {
    position: "absolute",
    bottom: 16,
    right: 24,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingGeminiText: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "500",
  },

  // Modals Common
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalBody: {
    gap: 12,
    marginBottom: 20,
  },
  summaryWorkoutTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#34C759",
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    paddingBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#F2F2F7",
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalPrimaryBtn: {
    backgroundColor: "#E91E63",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  modalPrimaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Reschedule specifics
  rescheduleSubtitle: {
    fontSize: 13,
    color: "#F2F2F7",
    marginBottom: 14,
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  timeSlotPill: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timeSlotPillActive: {
    borderColor: "#E91E63",
    backgroundColor: "rgba(233, 30, 99, 0.15)",
  },
  timeSlotText: {
    color: "#F2F2F7",
    fontSize: 12.5,
  },
  timeSlotTextActive: {
    color: "#E91E63",
    fontWeight: "700",
  },

  btnPressed: {
    opacity: 0.82,
  },
});

export { MemberScheduleScreenView as MemberClassesScreenView };

