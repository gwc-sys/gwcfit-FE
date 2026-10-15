import { Pressable } from "../NativePressable";
import { controlMetrics } from "../../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SkeletonList } from "../DataState";
import { EmptyState as BaseEmptyState } from "../EmptyState";
import { SectionHeader as BaseSectionHeader } from "../SectionHeader";
import { StatusBadge as BaseStatusBadge } from "../StatusBadge";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import { radius, shadows, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";

type IconName = keyof typeof Ionicons.glyphMap;

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

type CardProps = {
  title: string;
  value?: string;
  subtitle?: string;
  icon?: IconName;
  tone?: Tone;
  children?: ReactNode;
  onPress?: () => void;
};

function createToneColors(
  colors: ThemeColors,
): Record<Tone, { background: string; foreground: string }> {
  return {
    success: { background: colors.successSoft, foreground: colors.success },
    warning: { background: colors.warningSoft, foreground: colors.warning },
    danger: { background: colors.dangerSoft, foreground: colors.danger },
    info: { background: colors.infoSoft, foreground: colors.info },
    neutral: { background: colors.surfaceMuted, foreground: colors.muted },
  };
}

function useMemberStyles() {
  const { colors } = useAppTheme();

  return useMemo(
    () => ({
      colors,
      styles: createStyles(colors),
      toneColors: createToneColors(colors),
    }),
    [colors],
  );
}

export function MemberStatCard({
  title,
  value,
  subtitle,
  icon = "analytics-outline",
  tone = "info",
}: CardProps) {
  const { styles, toneColors } = useMemberStyles();

  return (
    <View style={styles.statCard}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: toneColors[tone].background },
        ]}
      >
        <Ionicons name={icon} size={20} color={toneColors[tone].foreground} />
      </View>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value ?? "--"}
      </Text>
      <Text style={styles.statTitle} numberOfLines={2}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.mutedText} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function MemberQuickActionCard({
  title,
  subtitle,
  icon = "chevron-forward-outline",
  tone = "info",
  onPress,
}: CardProps) {
  const { colors, styles, toneColors } = useMemberStyles();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: toneColors[tone].background },
        ]}
      >
        <Ionicons name={icon} size={20} color={toneColors[tone].foreground} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.actionTitle} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.mutedText} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
    </Pressable>
  );
}

export function ScrollListCard({
  title,
  subtitle,
  icon = "list-outline",
  status,
  statusTone = "neutral",
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  status?: string;
  statusTone?: Tone;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors, styles } = useMemberStyles();

  return (
    <View style={styles.listCard}>
      <View style={styles.listIcon}>
        <Ionicons name={icon} size={19} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.mutedText} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {description ? (
          <Text style={styles.description} numberOfLines={3}>
            {description}
          </Text>
        ) : null}
      </View>
      <View style={styles.side}>
        {status ? <BaseStatusBadge label={status} tone={statusTone} /> : null}
        {actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            style={styles.smallButton}
          >
            <Text
              style={styles.smallButtonText}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function MembershipStatusCard({
  title,
  value,
  subtitle,
  tone = "success",
}: CardProps) {
  return (
    <MemberStatCard
      title={title}
      value={value}
      subtitle={subtitle}
      icon="ribbon-outline"
      tone={tone}
    />
  );
}

export function AttendanceSummaryCard({
  title,
  value,
  subtitle,
  tone = "info",
}: CardProps) {
  return (
    <MemberStatCard
      title={title}
      value={value}
      subtitle={subtitle}
      icon="walk-outline"
      tone={tone}
    />
  );
}

export function WorkoutTodayCard({ title, subtitle, onPress }: CardProps) {
  return (
    <MemberQuickActionCard
      title={title}
      subtitle={subtitle}
      icon="barbell-outline"
      tone="success"
      onPress={onPress}
    />
  );
}

export function MealTodayCard({ title, subtitle, onPress }: CardProps) {
  return (
    <MemberQuickActionCard
      title={title}
      subtitle={subtitle}
      icon="nutrition-outline"
      tone="warning"
      onPress={onPress}
    />
  );
}

export function ProgressChartCard({ title, value, subtitle }: CardProps) {
  return (
    <MemberStatCard
      title={title}
      value={value}
      subtitle={subtitle}
      icon="trending-up-outline"
      tone="info"
    />
  );
}

export function TrainerCard({ title, subtitle, onPress }: CardProps) {
  return (
    <MemberQuickActionCard
      title={title}
      subtitle={subtitle}
      icon="person-outline"
      tone="info"
      onPress={onPress}
    />
  );
}

export function ClassBookingCard(props: Parameters<typeof ScrollListCard>[0]) {
  return <ScrollListCard {...props} icon={props.icon ?? "calendar-outline"} />;
}

export function PaymentHistoryCard(
  props: Parameters<typeof ScrollListCard>[0],
) {
  return <ScrollListCard {...props} icon={props.icon ?? "card-outline"} />;
}

export function NotificationItem(props: Parameters<typeof ScrollListCard>[0]) {
  return (
    <ScrollListCard {...props} icon={props.icon ?? "notifications-outline"} />
  );
}

export function GoalProgressCard({
  title,
  value,
  subtitle,
  onPress,
}: CardProps) {
  return (
    <MemberQuickActionCard
      title={title}
      subtitle={subtitle ?? value}
      icon="flag-outline"
      tone="success"
      onPress={onPress}
    />
  );
}

export function RewardBadge({ title, subtitle }: CardProps) {
  return (
    <MemberQuickActionCard
      title={title}
      subtitle={subtitle}
      icon="trophy-outline"
      tone="warning"
    />
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const { colors, styles } = useMemberStyles();

  return (
    <View style={styles.errorBox}>
      <Ionicons name="alert-circle-outline" size={22} color={colors.danger} />
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export const LoadingSkeleton = SkeletonList;

export const EmptyState = BaseEmptyState;

export const StatusBadge = BaseStatusBadge;

export const SectionHeader = BaseSectionHeader;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    statCard: {
      flex: 1,
      minWidth: 138,
      minHeight: 144,
      justifyContent: "space-between",
      gap: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: spacing.md,
      ...shadows.subtle,
    },
    iconBox: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.sm,
    },
    statValue: {
      ...typography.h2,
      color: colors.ink,
    },
    statTitle: {
      ...typography.small,
      color: colors.muted,
    },
    mutedText: {
      ...typography.small,
      color: colors.muted,
    },
    actionCard: {
      minHeight: 76,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: spacing.md,
      ...shadows.subtle,
    },
    pressed: {
      opacity: 0.78,
      transform: [{ translateY: 1 }],
    },
    actionTitle: {
      ...typography.body,
      color: colors.ink,
      fontWeight: "800",
    },
    listCard: {
      minHeight: 92,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: spacing.md,
      ...shadows.subtle,
    },
    listIcon: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.sm,
      backgroundColor: colors.primarySoft,
    },
    cardTitle: {
      ...typography.body,
      color: colors.ink,
      fontWeight: "800",
    },
    description: {
      ...typography.small,
      color: colors.inkSoft,
      marginTop: spacing.xs,
    },
    side: {
      maxWidth: 112,
      alignItems: "flex-end",
      gap: spacing.sm,
    },
    smallButton: { minHeight: controlMetrics.minimumTouchSize, minWidth: 78, alignItems: "center", justifyContent: "center", borderRadius: radius.sm, backgroundColor: colors.primary, paddingHorizontal: spacing.sm },
    smallButtonText: {
      ...typography.small,
      color: colors.white,
    },
    errorBox: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: colors.dangerSoft,
      padding: spacing.md,
    },
    errorText: {
      ...typography.small,
      color: colors.danger,
      flex: 1,
    },
    retryButton: { minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: radius.sm, backgroundColor: colors.surface, paddingHorizontal: spacing.sm },
    retryText: {
      ...typography.small,
      color: colors.ink,
    },
  });
