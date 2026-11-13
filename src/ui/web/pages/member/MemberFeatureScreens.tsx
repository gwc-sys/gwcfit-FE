import { Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { useState, useMemo } from "react";
import type { ThemeColors } from "../../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { MemberPaymentReceipt } from "../../../../features/operations/MemberPaymentReceipt";
import { MemberPlanCheckout } from "../../../../features/operations/MembershipCheckout";
import { getMemberPaymentTotals, getCompletedWorkoutCount, getRewardPoints, getRewardBadgeCount } from "../../../../utils/memberFeatureMetrics";
import { FoodIcon } from "../../../../components/FoodIcon";
import { FoodNutritionMealPicker } from "../../../../components/FoodNutritionMealPicker";
import { foodDisplayName } from "../../../../utils/foodNames";
import { FlatList, Image, RefreshControl, Switch, Text, TextInput, View } from "react-native";
import type { ReactNode } from "react";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ClassBookingCard, EmptyState, ErrorState, GoalProgressCard, LoadingSkeleton, MemberStatCard, NotificationItem, PaymentHistoryCard, RewardBadge, ScrollListCard, StatusBadge } from "../../components/member/index";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { getApiErrorMessage } from "../../../../services/api/client";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import type { MemberAttendance, MemberClass, MemberGoal, MemberMealPlan, MemberNotification, MemberPayment, MemberProgressLog, MemberReward, MemberWorkout } from "../../../../types/member";
import { requestLogoutConfirmation } from "../../../../utils/logoutConfirmation";
import { formatCurrency, formatDate, formatDateTime, memberStatusTone } from "../../../../utils/formatters";
import type * as React from "react";
import type { useQueryRefreshPresentation, useQueryStatePresentation, useListSectionPresentation, useDetailGridPresentation, useSectionTitlePresentation, useMemberMembershipScreenPresentation, useMemberAttendanceScreenPresentation, useMemberWorkoutScreenPresentation, useMemberMealPlanScreenPresentation, useMemberProgressScreenPresentation, useMemberTrainerScreenPresentation, useMemberClassesScreenPresentation, useMemberNotificationsScreenPresentation, useMemberGoalsScreenPresentation, useMemberRewardsScreenPresentation, useMemberSupportScreenPresentation, useMemberSettingsScreenPresentation } from "../../../../screens/member/MemberFeatureScreens";

const mealPlanImage = require("../../../../../assets/images/diet-plan-bowls.png");

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

export { MemberMembershipScreenView } from "./MemberMembershipScreenView";


export { MemberAttendanceScreenView } from "./MemberAttendanceScreenView";


export { MemberWorkoutScreenView } from "./MemberWorkoutScreen";
export { MemberMealPlanScreenView } from "./MemberMealPlanScreenView";

export { MemberProgressScreenView } from "./MemberProgressScreenView";
export { MemberTrainerScreenView } from "./MemberTrainerScreenView";


export { MemberClassesScreenView } from "./MemberScheduleScreenView";

export { MemberNotificationsScreenView } from "./MemberNotificationsScreenView";


export { MemberGoalsScreenView } from "./MemberGoalsScreenView";

export { MemberRewardsScreenView } from "./MemberRewardsScreenView";


export function MemberSupportScreenView({ model }: { model: ReturnType<typeof useMemberSupportScreenPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const [section, setSection] = useState<"New request" | "Gym feedback" | "Help">("New request");
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, SectionTitle, category, setCategory, subject, setSubject, message, setMessage, createTicket, submit, gymFeedbackQuery, saveGymFeedback, gymRating, setGymRating, gymFeedbackText, setGymFeedbackText, gymFeedbackOption, setGymFeedbackOption, submitGymFeedback } = model.props;
      const feedbackOptions = [
        ["Clean and well maintained", "I have had a very positive experience with the cleanliness and maintenance of the gym. The workout areas, changing spaces, and equipment are generally kept tidy, organised, and ready to use. It makes every visit feel comfortable and welcoming. I appreciate the effort the team puts into maintaining a hygienic environment, especially during busy hours. Continuing to check equipment regularly and keeping shared areas clean will help members feel confident and enjoy their workouts even more."],
        ["Friendly staff", "The gym staff have been friendly, approachable, and helpful whenever I have needed assistance. They create a welcoming atmosphere and make it easier to ask questions about equipment, classes, or general gym facilities. Their positive attitude makes the gym feel like a supportive place to work towards personal fitness goals. I appreciate the way the team treats members with respect and patience. Please continue offering this level of care and support, because it makes a real difference to the overall member experience."],
        ["Great equipment", "I am happy with the variety and quality of the equipment available at the gym. There are useful options for strength training, cardio, and general fitness, which helps me follow my workouts without unnecessary interruptions. The machines and free weights are easy to access and are usually in good working condition. I appreciate the investment in equipment and the effort to keep it available for members. Adding more variety over time and maintaining the most popular machines will make the experience even better."],
        ["Helpful trainers", "The trainers are knowledgeable, encouraging, and willing to help members improve their workouts safely. Their guidance has made it easier for me to understand exercises, use equipment correctly, and stay motivated. I value their professional approach and the time they take to answer questions or suggest improvements. The support from the training team makes the gym feel more personal than simply working out alone. Please continue providing clear guidance and regular availability, as it helps members build confidence and stay consistent with their fitness goals."],
        ["Could be improved", "My overall experience at the gym has been positive, but there are a few areas that could be improved to make visits more comfortable and effective. Better availability of equipment during busy periods, clearer communication about schedules, and faster attention to maintenance requests would be helpful. I am sharing this feedback because I value the gym and would like to see the member experience improve further. I hope the team can review these areas and continue making practical changes that support every member’s fitness journey."],
        ["Other", ""]
      ] as const;
      return ((
    <Screen scroll contentContainerStyle={[styles.screen, { gap: 24 }]} maxWidth="screen">
      <ScreenHeader title="Support" subtitle="Trainer and gym contact" icon="chatbubbles-outline" />
      <View style={{ flexDirection: width >= 1180 ? "row" : "column", gap: 30, alignItems: "flex-start" }}>
      <View style={{ width: width >= 1180 ? 240 : "100%", gap: 8 }}>
        <Text style={{ color: colors.muted, fontSize: 13, fontWeight: "600", marginBottom: 6 }}>HELP & CONTACT</Text>
        {(["New request", "Gym feedback", "Help"] as const).map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: section === item }} onPress={() => { setSection(item); if (item === "Gym feedback") setCategory("feedback"); }} style={{ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: section === item ? colors.surfaceElevated : "transparent" }}>
          <Ionicons name={item === "New request" ? "create-outline" : item === "Gym feedback" ? "star-outline" : "help-circle-outline"} size={20} color={section === item ? colors.primary : colors.muted} />
          <Text style={{ color: section === item ? colors.ink : colors.muted, fontSize: 15, fontWeight: section === item ? "700" : "500" }}>{item}</Text>
        </Pressable>)}
      </View>
      <View style={{ flex: 1, width: width >= 1180 ? undefined : "100%", minWidth: 0, gap: 18 }}>
      <Text style={{ color: colors.ink, fontSize: 23, fontWeight: "700" }}>{section}</Text>
      {section === "New request" ? <>
      <View style={styles.panel}>
        <SectionTitle title="New Request" />
        <FormTextField label="Category" value={category} onChangeText={setCategory} leftIcon="pricetag-outline" />
        <FormTextField label="Subject" value={subject} onChangeText={setSubject} leftIcon="text-outline" />
        <FormTextField label="Message" value={message} onChangeText={setMessage} leftIcon="chatbubble-outline" multiline />
        <PrimaryButton title="Send Request" icon="send-outline" loading={createTicket.isPending} onPress={submit} />
        <NoticeBanner message={createTicket.error ? getApiErrorMessage(createTicket.error) : createTicket.data ? "Request sent." : null} tone={createTicket.error ? "error" : "success"} />
      </View>
      <ScrollListCard title="Trainer message" subtitle="Send a request to your assigned trainer" icon="person-outline" onPress={() => { setCategory("trainer"); setSubject("Training support"); }} />
      <ScrollListCard title="Reception" subtitle="Contact the gym desk" icon="call-outline" onPress={() => { setCategory("reception"); setSubject("Front desk support"); }} />
      <ScrollListCard title="Feedback" subtitle="Share feedback with your gym" icon="heart-outline" onPress={() => { setCategory("feedback"); setSubject("Gym feedback"); setSection("Gym feedback"); }} />
      </> : null}
      {section === "Gym feedback" ? <View style={styles.feedbackPanel}>
        <View style={styles.feedbackHeader}><Text style={styles.feedbackTitle}>Rate your gym</Text><Text style={styles.kicker}>{gymFeedbackQuery.data ? "Update your review for this month." : "How was your experience? Your feedback helps the team improve."}</Text></View>
        <View style={styles.feedbackScoreRow}>
          <View style={styles.feedbackStars}>{[1, 2, 3, 4, 5].map((star) => <Pressable key={star} accessibilityRole="button" accessibilityLabel={`Rate ${star} out of 5`} onPress={() => setGymRating(star)} style={[styles.feedbackStarButton, star <= gymRating && styles.feedbackStarButtonActive]}><Text style={[styles.feedbackStar, { color: star <= gymRating ? "#E91E63" : colors.muted }]}>★</Text></Pressable>)}</View>
          <Text style={styles.feedbackScoreText}>{gymRating} of 5</Text>
        </View>
        <View style={styles.feedbackHeader}><Text style={styles.feedbackScoreText}>What would you like to share? (optional)</Text><View style={styles.feedbackOptions}>{feedbackOptions.map(([option, draft]) => <Pressable key={option} accessibilityRole="button" onPress={() => { setGymFeedbackOption(option); setGymFeedbackText(draft); }} style={[styles.feedbackOption, gymFeedbackOption === option && styles.feedbackOptionActive]}><Text style={styles.feedbackOptionText}>{option}</Text></Pressable>)}</View></View>
        <FormTextField label={gymFeedbackOption === "Other" ? "Write your own message" : "Add more detail (optional)"} helper={`${gymFeedbackText.trim() ? gymFeedbackText.trim().split(/\s+/).length : 0} words · 100–150 words is ideal`} value={gymFeedbackText} onChangeText={(value) => { setGymFeedbackText(value); if (gymFeedbackOption && gymFeedbackOption !== "Other" && value !== gymFeedbackOption) setGymFeedbackOption("Other"); }} placeholder={gymFeedbackOption === "Other" ? "Tell us about your experience — what worked well and what could be improved." : "Share more about your experience — 100 to 150 words is ideal."} multiline style={{ height: 160, textAlignVertical: "top" }} />
        <PrimaryButton title={gymFeedbackQuery.data ? "Update review" : "Submit review"} icon="star-outline" loading={saveGymFeedback.isPending} onPress={submitGymFeedback} style={{ alignSelf: "flex-start", minWidth: 190 }} />
        <NoticeBanner message={saveGymFeedback.error ? getApiErrorMessage(saveGymFeedback.error) : saveGymFeedback.data ? "Thanks for sharing your feedback." : null} tone={saveGymFeedback.error ? "error" : "success"} />
      </View> : null}
      {section === "Help" ? <ScrollListCard title="FAQ" subtitle="Common membership and billing questions" icon="help-circle-outline" /> : null}
      </View>
      </View>
    </Screen>
  ));
    }
  }
}

export { MemberSettingsScreenView } from "./MemberSettingsScreenView";

