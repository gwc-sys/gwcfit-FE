import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle, Line, Path, Polygon, Polyline } from "react-native-svg";

import { reportsApi } from "../../services/api/reports";
import { getApiErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import type { ManagedReview, RatingsDashboard } from "../../types/saas";
import { AccessDeniedScreen } from "./AccessDeniedScreen";

// --- Vector SVGs precisely matching reference images ---

function StarFilledIcon({ size = 15, color = "#E91E63" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </Svg>
  );
}

function MessageSquareIcon({ size = 15, color = "#E91E63" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PulseIcon({ size = 15, color = "#E91E63" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="22 12 18 12 15 21 9 3 6 12 2 12"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TrendingUpIcon({ size = 15, color = "#E91E63" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="23 6 13.5 15.5 8.5 10.5 1 18"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="17 6 23 6 23 12"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function RefreshIcon({ size = 16, color = "#8E8E93" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M23 4v6h-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M1 20v-6h6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SearchIcon({ size = 15, color = "#8E8E93" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Line
        x1="21"
        y1="21"
        x2="16.65"
        y2="16.65"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StarRating({ rating, size = 13 }: { rating: number; size?: number }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Svg key={s} width={size} height={size} viewBox="0 0 24 24" fill={s <= rating ? "#E91E63" : colors.border}>
          <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </Svg>
      ))}
    </View>
  );
}

const stars = [5, 4, 3, 2, 1];
const monthLabel = (value: string) => {
  const parts = value.split("-");
  const monthNum = parseInt(parts[1], 10);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  return months[monthNum - 1] || value;
};

export function RatingsFeedbackScreen() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const styles = useMemo(() => makeStyles(colors, compact), [colors, compact]);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const client = useQueryClient();

  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<"all" | "gym" | "trainer">("all");
  const [rating, setRating] = useState(0);
  const [replying, setReplying] = useState<ManagedReview | null>(null);
  const [reply, setReply] = useState("");

  const query = useQuery({
    queryKey: ["reports", "ratings"],
    queryFn: reportsApi.ratings,
    enabled: hasPermission("manage_reports"),
    retry: false,
  });

  const saveReply = useMutation({
    mutationFn: () => reportsApi.replyToReview(replying!.review_type, replying!.id, reply.trim()),
    onSuccess: async () => {
      setReplying(null);
      setReply("");
      await client.invalidateQueries({ queryKey: ["reports", "ratings"] });
    },
  });

  if (!hasPermission("manage_reports")) return <AccessDeniedScreen />;

  if (query.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#E91E63" size="large" />
        <Text style={styles.muted}>Loading member feedback…</Text>
      </View>
    );
  }

  // Real data with genuine zero fallbacks
  const rawData: RatingsDashboard = query.data || {
    gym_average_rating: 0,
    gym_total_reviews: 0,
    combined_average_rating: 0,
    total_reviews: 0,
    response_rate: 0,
    gym_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    trends: [],
    trainers: [],
    reviews: [],
  };

  const rawReviews = rawData.reviews ?? [];
  const rawTrends = rawData.trends ?? [];
  const gymDistribution =
    rawData.gym_distribution && Object.keys(rawData.gym_distribution).length
      ? rawData.gym_distribution
      : { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const maxDistribution = Math.max(...Object.values(gymDistribution), 1);

  const needle = search.trim().toLowerCase();
  const filteredReviews = rawReviews.filter(
    (item) =>
      (kind === "all" || item.review_type === kind) &&
      (!rating || item.rating === rating) &&
      (!needle ||
        `${item.member_name} ${item.trainer_name || ""} ${item.feedback || ""}`
          .toLowerCase()
          .includes(needle)),
  );

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      {/* 1. Header Row */}
      <View style={styles.heading}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>MEMBER EXPERIENCE</Text>
          <Text style={styles.heroTitle}>Ratings & Feedback</Text>
          <Text style={styles.subtitle}>
            Understand sentiment, compare trainer performance, and respond to every member.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh ratings"
          style={styles.refresh}
          onPress={() => query.refetch()}
        >
          <RefreshIcon size={16} color={colors.ink} />
        </Pressable>
      </View>

      {/* 2. 2x2 KPI Cards Grid (Image 1) */}
      <View style={styles.metrics}>
        {/* Card 1: Gym rating */}
        <View style={styles.metric}>
          <View style={styles.metricHeaderRow}>
            <Text style={styles.metricLabel}>Gym rating</Text>
            <View style={styles.metricIconSquircle}>
              <StarFilledIcon size={16} color="#E91E63" />
            </View>
          </View>
          <Text style={styles.metricValue}>
            {rawData.gym_average_rating ? rawData.gym_average_rating.toFixed(1) : "0.0"}
          </Text>
          <Text style={styles.small}>{rawData.gym_total_reviews} gym reviews</Text>
        </View>

        {/* Card 2: All feedback */}
        <View style={styles.metric}>
          <View style={styles.metricHeaderRow}>
            <Text style={styles.metricLabel}>All feedback</Text>
            <View style={styles.metricIconSquircle}>
              <MessageSquareIcon size={16} color="#E91E63" />
            </View>
          </View>
          <Text style={styles.metricValue}>{String(rawData.total_reviews)}</Text>
          <Text style={styles.small}>Gym and trainer reviews</Text>
        </View>

        {/* Card 3: Combined rating */}
        <View style={styles.metric}>
          <View style={styles.metricHeaderRow}>
            <Text style={styles.metricLabel}>Combined rating</Text>
            <View style={styles.metricIconSquircle}>
              <PulseIcon size={16} color="#E91E63" />
            </View>
          </View>
          <Text style={styles.metricValue}>
            {rawData.combined_average_rating
              ? rawData.combined_average_rating.toFixed(1)
              : "0.0"}
          </Text>
          <Text style={styles.small}>Across your gym</Text>
        </View>

        {/* Card 4: Response rate */}
        <View style={styles.metric}>
          <View style={styles.metricHeaderRow}>
            <Text style={styles.metricLabel}>Response rate</Text>
            <View style={styles.metricIconSquircle}>
              <TrendingUpIcon size={16} color="#E91E63" />
            </View>
          </View>
          <Text style={styles.metricValue}>{rawData.response_rate}%</Text>
          <Text style={styles.small}>Owner replies sent</Text>
        </View>
      </View>

      {/* 3. Rating Distribution Card (Image 1) */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Rating distribution</Text>
        <Text style={styles.panelSub}>Gym reviews by score</Text>
        <View style={styles.distList}>
          {stars.map((star) => {
            const count = gymDistribution[star] || 0;
            const hasCount = count > 0;
            const pct = hasCount ? (count * 100) / maxDistribution : 0;
            return (
              <View key={star} style={styles.distRow}>
                <Text style={styles.distLabel}>{star}★</Text>
                <View style={styles.track}>
                  {hasCount ? (
                    <View style={[styles.fill, { width: `${pct}%` }]} />
                  ) : null}
                </View>
                <Text style={styles.count}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 4. Six-Month Trend Card (Image 1 & 2) */}
      <View style={styles.panel}>
        <View style={styles.trendHeader}>
          <View>
            <Text style={styles.panelTitle}>Six-month trend</Text>
            <Text style={styles.panelSub}>Gym vs trainer average</Text>
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#E91E63" }]} />
              <Text style={styles.legendGym}>Gym</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#34C759" }]} />
              <Text style={styles.legendTrainer}>Trainers</Text>
            </View>
          </View>
        </View>

        <View style={styles.chart}>
          {rawTrends.map((point) => {
            const hasGym = point.gym_rating > 0;
            const hasTrainer = point.trainer_rating > 0;
            return (
              <View key={point.period} style={styles.chartCol}>
                <View style={styles.bars}>
                  {hasGym ? (
                    <View
                      style={[
                        styles.barGym,
                        { height: Math.max(16, point.gym_rating * 18) },
                      ]}
                    />
                  ) : (
                    <View style={styles.dotInactiveGym} />
                  )}
                  {hasTrainer ? (
                    <View
                      style={[
                        styles.barTrainer,
                        { height: Math.max(16, point.trainer_rating * 20) },
                      ]}
                    />
                  ) : (
                    <View style={styles.dotInactiveTrainer} />
                  )}
                </View>
                <Text style={styles.chartLabel}>{monthLabel(point.period)}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 5. Trainer Comparison Card (Image 2) */}
      <View style={styles.panelFull}>
        <Text style={styles.panelTitle}>Trainer comparison</Text>
        <Text style={styles.panelSub}>Performance from verified member reviews</Text>
        <View style={styles.trainers}>
          {rawData.trainers && rawData.trainers.length ? (
            rawData.trainers.map((trainer, index) => (
              <View key={trainer.trainer_id} style={styles.trainerRow}>
                <View style={styles.rankSquircle}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.trainerDetails}>
                  <Text style={styles.trainerName}>{trainer.trainer_name}</Text>
                  <StarRating rating={Math.round(trainer.average_rating)} size={13} />
                </View>
                <View style={styles.trainerScoreBlock}>
                  <Text style={styles.ratingValue}>{trainer.average_rating.toFixed(1)}</Text>
                  <Text style={styles.trainerReviewCount}>{trainer.total_reviews} reviews</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.muted}>No trainer reviews recorded yet.</Text>
            </View>
          )}
        </View>
      </View>

      {/* 6. Review Management Card (Image 2 & 3) */}
      <View style={styles.reviewSection}>
        <View style={styles.reviewHead}>
          <Text style={styles.panelTitle}>Review management</Text>
          <Text style={styles.panelSub}>{filteredReviews.length} matching reviews</Text>
          <View style={styles.searchBar}>
            <SearchIcon size={15} color={colors.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search feedback or member"
              placeholderTextColor={colors.textPlaceholder}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filters}>
          {(["all", "gym", "trainer"] as const).map((value) => {
            const active = kind === value;
            const label =
              value === "all" ? "All reviews" : value === "gym" ? "Gym" : "Trainers";
            return (
              <Pressable
                key={value}
                accessibilityRole="button"
                onPress={() => setKind(value)}
                style={[styles.filterPill, active && styles.filterPillActive]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            accessibilityRole="button"
            onPress={() => setRating(rating === 5 ? 0 : rating + 1)}
            style={[styles.filterPill, rating > 0 && styles.filterPillActive]}
          >
            <Text style={[styles.filterText, rating > 0 && styles.filterTextActive]}>
              {rating ? `${rating} stars` : "Any rating"}
            </Text>
          </Pressable>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {filteredReviews.map((review) => {
            const initials = review.member_name
              .split(/\s+/)
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            // Date format matching reference: "4 Nov 2026", "31 Oct 2026", "29 Oct 2026"
            const dateObj = new Date(review.created_at);
            const dateStr = dateObj.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            const subtitle =
              review.review_type === "gym"
                ? `Gym review - ${dateStr}`
                : `Trainer - ${review.trainer_name || "Unassigned trainer"} - ${dateStr}`;

            return (
              <View key={`${review.review_type}-${review.id}`} style={styles.reviewCard}>
                <View style={styles.reviewTopRow}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{initials || "--"}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{review.member_name}</Text>
                    <Text style={styles.reviewMeta}>{subtitle}</Text>
                  </View>
                  <StarRating rating={review.rating} size={14} />
                </View>

                {review.feedback ? (
                  <Text style={styles.feedbackText}>{review.feedback}</Text>
                ) : (
                  <Text style={styles.mutedFeedback}>
                    Rating submitted without written feedback.
                  </Text>
                )}

                {review.owner_reply ? (
                  <View style={styles.replyBox}>
                    <Text style={styles.replyLabel}>YOUR REPLY</Text>
                    <Text style={styles.replyText}>{review.owner_reply}</Text>
                  </View>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setReplying(review);
                    setReply(review.owner_reply || "");
                  }}
                  style={styles.replyActionPressable}
                >
                  <Text style={styles.replyActionText}>
                    {review.owner_reply ? "Edit reply" : "Reply to member"} →
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        {!filteredReviews.length ? (
          <View style={styles.empty}>
            <Text style={styles.muted}>No reviews match these filters.</Text>
          </View>
        ) : null}
      </View>

      {/* Reply Modal */}
      {replying ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBackdrop}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Reply to {replying.member_name}</Text>
              <Text style={styles.modalSub}>
                Your response is saved with this {replying.review_type} review.
              </Text>
              <TextInput
                autoFocus
                multiline
                value={reply}
                onChangeText={setReply}
                maxLength={1200}
                placeholder="Write a thoughtful response…"
                placeholderTextColor={colors.textPlaceholder}
                style={styles.replyInput}
              />
              {saveReply.error ? (
                <Text style={styles.error}>{getApiErrorMessage(saveReply.error)}</Text>
              ) : null}
              <View style={styles.modalActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setReplying(null)}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryText}>Cancel</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={!reply.trim() || saveReply.isPending}
                  onPress={() => saveReply.mutate()}
                  style={[
                    styles.primaryButton,
                    (!reply.trim() || saveReply.isPending) && styles.disabled,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {saveReply.isPending ? "Saving…" : "Save reply"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : null}
    </ScrollView>
  );
}

function makeStyles(c: any, compact: boolean) {
  const colors = c;
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: c.background,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 40,
      gap: 16,
      maxWidth: 1500,
      width: "100%",
      alignSelf: "center",
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 24,
      backgroundColor: c.background,
    },
    heading: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      marginTop: 4,
    },
    eyebrow: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.2,
      color: c.primary,
      textTransform: "uppercase",
    },
    heroTitle: {
      fontSize: 26,
      fontWeight: "800",
      color: c.ink,
      letterSpacing: -0.6,
      marginTop: 2,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: c.ink,
    },
    subtitle: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 4,
      lineHeight: 16,
    },
    muted: {
      fontSize: 13,
      color: c.textSecondary,
    },
    refresh: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: c.surfaceElevated,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },

    // 2x2 KPI Cards Grid matching Image 1
    metrics: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 10,
    },
    metric: {
      width: "48.5%",
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 18,
      padding: 16,
      gap: 8,
    },
    metricHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    metricLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: c.textSecondary,
    },
    metricIconSquircle: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: c.primarySoft,
      borderWidth: 1,
      borderColor: c.borderSubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    metricValue: {
      fontSize: 28,
      fontWeight: "800",
      color: c.ink,
      letterSpacing: -0.5,
    },
    small: {
      fontSize: 11,
      color: c.textSecondary,
    },

    // Panels
    panel: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 18,
      padding: 18,
    },
    panelFull: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 18,
      padding: 18,
    },
    panelTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: c.ink,
      letterSpacing: -0.3,
    },
    panelSub: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 2,
      marginBottom: 16,
    },

    // Rating distribution
    distList: {
      gap: 10,
    },
    distRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    distLabel: {
      width: 28,
      fontSize: 12,
      color: c.ink,
      fontWeight: "700",
    },
    track: {
      height: 8,
      flex: 1,
      backgroundColor: c.surfaceMuted,
      borderRadius: 4,
      overflow: "hidden",
    },
    fill: {
      height: 8,
      backgroundColor: c.primary,
      borderRadius: 4,
    },
    count: {
      width: 16,
      textAlign: "right",
      fontSize: 12,
      color: c.textSecondary,
      fontWeight: "600",
    },

    // Six-month trend
    trendHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    legend: {
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    legendDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    legendGym: {
      fontSize: 11,
      fontWeight: "700",
      color: "#E91E63",
    },
    legendTrainer: {
      fontSize: 11,
      fontWeight: "700",
      color: "#34C759",
    },
    chart: {
      height: 140,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-around",
      paddingTop: 16,
    },
    chartCol: {
      alignItems: "center",
      gap: 8,
      flex: 1,
      height: "100%",
      justifyContent: "flex-end",
    },
    bars: {
      height: 100,
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 4,
    },
    barGym: {
      width: 10,
      borderRadius: 5,
      backgroundColor: "#E91E63",
    },
    barTrainer: {
      width: 10,
      borderRadius: 5,
      backgroundColor: "#34C759",
    },
    dotInactiveGym: {
      width: 10,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#E91E63",
    },
    dotInactiveTrainer: {
      width: 10,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#34C759",
    },
    chartLabel: {
      fontSize: 11,
      color: c.textSecondary,
      fontWeight: "600",
    },

    // Trainer comparison
    trainers: {
      gap: 10,
    },
    trainerRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 14,
      backgroundColor: c.surfaceElevated,
      borderWidth: 1,
      borderColor: c.border,
      gap: 14,
    },
    rankSquircle: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: "#E91E63",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: c.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    rankText: {
      color: "#FFFFFF",
      fontWeight: "900",
      fontSize: 14,
    },
    trainerDetails: {
      flex: 1,
      gap: 4,
    },
    trainerName: {
      fontSize: 14,
      fontWeight: "800",
      color: c.ink,
    },
    trainerScoreBlock: {
      alignItems: "flex-end",
      gap: 2,
    },
    ratingValue: {
      fontSize: 20,
      fontWeight: "800",
      color: c.ink,
    },
    trainerReviewCount: {
      fontSize: 11,
      color: c.textSecondary,
    },

    // Review management section
    reviewSection: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 18,
      padding: 18,
      gap: 14,
    },
    reviewHead: {
      gap: 4,
    },
    searchBar: {
      width: "100%",
      height: 44,
      borderRadius: 12,
      backgroundColor: c.surfaceElevated,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 10,
    },
    searchInput: {
      flex: 1,
      color: c.ink,
      fontSize: 13,
      paddingVertical: 0,
    },

    // Filter pills
    filters: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 4,
    },
    filterPill: {
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: c.surfaceElevated,
      borderWidth: 1,
      borderColor: c.border,
    },
    filterPillActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    filterText: {
      fontSize: 12,
      fontWeight: "700",
      color: c.textSecondary,
    },
    filterTextActive: {
      color: "#FFFFFF",
      fontWeight: "800",
    },

    // Reviews list
    reviewsList: {
      gap: 12,
      marginTop: 4,
    },
    reviewCard: {
      backgroundColor: c.surfaceElevated,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      padding: 16,
      gap: 10,
    },
    reviewTopRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
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
      fontSize: 12,
      fontWeight: "800",
      color: "#FFFFFF",
    },
    memberName: {
      fontSize: 14,
      fontWeight: "800",
      color: c.ink,
    },
    reviewMeta: {
      fontSize: 11,
      color: c.textSecondary,
      marginTop: 2,
    },
    feedbackText: {
      fontSize: 13,
      lineHeight: 20,
      color: c.ink,
    },
    mutedFeedback: {
      fontSize: 13,
      color: c.textSecondary,
      fontStyle: "italic",
    },
    replyBox: {
      backgroundColor: c.surfaceMuted,
      borderRadius: 10,
      padding: 12,
      borderLeftWidth: 3,
      borderLeftColor: c.primary,
      marginTop: 4,
    },
    replyLabel: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.8,
      color: c.primary,
    },
    replyText: {
      fontSize: 12,
      lineHeight: 18,
      color: c.ink,
      marginTop: 3,
    },
    replyActionPressable: {
      alignSelf: "flex-start",
      marginTop: 4,
    },
    replyActionText: {
      fontSize: 12,
      fontWeight: "700",
      color: c.primary,
    },
    empty: {
      alignItems: "center",
      gap: 8,
      padding: 28,
    },

    // Modal
    modalBackdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,.60)",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      zIndex: 100,
    },
    modal: {
      width: "100%",
      maxWidth: 520,
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 22,
      borderWidth: 1,
      borderColor: c.border,
      gap: 12,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: c.ink,
    },
    modalSub: {
      fontSize: 12,
      color: c.textSecondary,
    },
    replyInput: {
      height: 120,
      textAlignVertical: "top",
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      padding: 12,
      color: c.ink,
      backgroundColor: c.surfaceElevated,
      fontSize: 13,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 6,
    },
    primaryButton: {
      backgroundColor: c.primary,
      borderRadius: 10,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 13,
    },
    secondaryButton: {
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceElevated,
      borderRadius: 10,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },
    secondaryText: {
      color: c.ink,
      fontWeight: "700",
      fontSize: 13,
    },
    disabled: {
      opacity: 0.45,
    },
    error: {
      color: c.danger,
      fontSize: 12,
      marginTop: 4,
    },
  });
}
