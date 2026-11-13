import { Ionicons } from "@expo/vector-icons";
import { FlatList, Modal, Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import { DataState } from "../../components/DataState";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
import {
  ChevronDownSvg,
  ClockSvg,
  DumbbellSvg,
  EyeSvg,
  FilterFunnelSvg,
  MoreVerticalSvg,
  SearchSvg,
  StarFilledSvg,
  StarOutlineSvg,
  UserCheckSvg,
  UserPlusSvg,
} from "../../../../components/icons/PulseSvgIcons";
import { createStyles } from "../../styles/pages/saas/TrainersScreen.styles";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { Trainer } from "../../../../types/saas";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import type * as React from "react";
import type { useTrainersScreenPresentation, useStatPresentation, useTrainerRowPresentation } from "../../../../screens/saas/TrainersScreen";

type TrainerFilter = "all" | "active" | "inactive";

export function TrainersScreenView({ model }: { model: ReturnType<typeof useTrainersScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      return (<AccessDeniedScreen />);
    }
    case "view2": {
      const {
        resource,
        colors,
        search,
        setSearch,
        setPage,
        setFilter,
        filter,
        openCreate,
        Stat,
        trainers,
        visible,
        TrainerRow,
        openEdit,
        remove,
        page,
        formOpen,
        setFormOpen,
        detailTrainer,
        setDetailTrainer,
        feedbackQuery,
        name,
        setName,
        email,
        setEmail,
        phone,
        setPhone,
        specialties,
        setSpecialties,
        save,
        activeTrainerCount,
        inactiveTrainerCount,
        newTrainerCount
      } = model.props;

      const styles = createStyles(colors);

      /* =========================================================================
       * 1. FULL PAGE: TRAINER DETAILS VIEW (Apple HIG Principle)
       * ========================================================================= */
      if (detailTrainer) {
        const totalReviews = feedbackQuery.data?.total_reviews ?? detailTrainer.total_reviews ?? 0;
        const avgRating = feedbackQuery.data?.average_rating ?? detailTrainer.average_rating ?? 0;
        const starDistribution = feedbackQuery.data?.star_distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const reviews = feedbackQuery.data?.reviews ?? [];

        return (
          <Screen scroll contentContainerStyle={styles.screen}>
            {/* Navigation Bar / Breadcrumbs */}
            <View style={styles.pageBackNav}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Back to trainers list"
                  style={styles.backButton}
                  onPress={() => setDetailTrainer(null)}
                >
                  <Ionicons name="chevron-back" size={16} color={colors.ink} />
                  <Text style={styles.backButtonText}>Trainers</Text>
                </Pressable>
                <Text style={styles.breadcrumbText}>/  Trainer Details  /  {detailTrainer.full_name}</Text>
              </View>
            </View>

            {/* Trainer Hero Card */}
            <View style={styles.pageHeroCard}>
              <View style={styles.heroAvatar}>
                <Text style={styles.heroAvatarText}>
                  {detailTrainer.full_name.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase() || "TR"}
                </Text>
              </View>

              <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                <View style={styles.heroTitleRow}>
                  <Text style={styles.heroName}>{detailTrainer.full_name}</Text>
                  <StatusBadge
                    label={detailTrainer.is_active ? "Active" : "Inactive"}
                    tone={detailTrainer.is_active ? "success" : "warning"}
                  />
                </View>

                <View style={styles.heroMetaRow}>
                  <View style={styles.heroMetaItem}>
                    <Ionicons name="finger-print-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.heroMetaText}>TRN-{detailTrainer.id.slice(0, 8).toUpperCase()}</Text>
                  </View>

                  {detailTrainer.email ? (
                    <View style={styles.heroMetaItem}>
                      <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.heroMetaText}>{detailTrainer.email}</Text>
                    </View>
                  ) : null}

                  {detailTrainer.phone ? (
                    <View style={styles.heroMetaItem}>
                      <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.heroMetaText}>{detailTrainer.phone}</Text>
                    </View>
                  ) : null}

                  {detailTrainer.hourly_rate_cents ? (
                    <View style={styles.heroMetaItem}>
                      <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.heroMetaText}>₹{(detailTrainer.hourly_rate_cents / 100).toFixed(0)}/hr</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.specialtiesRow}>
                  {(detailTrainer.specialties && detailTrainer.specialties.length > 0
                    ? detailTrainer.specialties
                    : ["Not assigned"]
                  ).map((item: string) => (
                    <View key={item} style={styles.specialtyChip}>
                      <Text style={styles.specialtyChipText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Apple App Store Style Ratings & Star Distribution Card */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <StarFilledSvg size={20} color={colors.primary} />
                  <Text style={styles.sectionHeaderTitle}>Ratings & Star Distribution</Text>
                </View>
                <Text style={styles.meta}>
                  {totalReviews > 0 ? `${totalReviews} total reviews` : "No reviews yet"}
                </Text>
              </View>

              <View style={styles.ratingGrid}>
                {/* Big Score Box */}
                <View style={styles.scoreDisplay}>
                  <Text style={styles.scoreNumber}>{avgRating > 0 ? avgRating.toFixed(1) : "0.0"}</Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      star <= Math.round(avgRating) && totalReviews > 0 ? (
                        <StarFilledSvg key={star} size={18} color={colors.primary} />
                      ) : (
                        <StarOutlineSvg key={star} size={18} color={colors.primary} />
                      )
                    ))}
                  </View>
                  <Text style={styles.scoreSub}>
                    {totalReviews > 0 ? `Based on ${totalReviews} ${totalReviews === 1 ? "review" : "reviews"}` : "Unrated"}
                  </Text>
                </View>

                {/* Star Distribution Capsule Bars */}
                <View style={styles.distributionList}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = starDistribution[star] ?? 0;
                    const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                    return (
                      <View key={star} style={styles.distRow}>
                        <Text style={styles.distStar}>{star} ★</Text>
                        <View style={styles.distTrack}>
                          <View style={[styles.distFill, { width: `${percent}%` }]} />
                        </View>
                        <Text style={styles.distVal}>{count} ({percent}%)</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Member Feedback & Reviews Section */}
            <View style={{ gap: 14 }}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
                  <Text style={styles.sectionHeaderTitle}>Member Feedback</Text>
                </View>
                <View style={styles.feedbackCountBadge}>
                  <Text style={styles.feedbackCountText}>
                    {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
                  </Text>
                </View>
              </View>

              {feedbackQuery.isLoading ? (
                <View style={styles.emptyFeedbackBox}>
                  <Text style={styles.meta}>Loading member feedback…</Text>
                </View>
              ) : reviews.length === 0 ? (
                <View style={styles.emptyFeedbackBox}>
                  <Ionicons name="chatbubble-ellipses-outline" size={40} color={colors.textSecondary} />
                  <Text style={styles.emptyFeedbackTitle}>No member feedback yet</Text>
                  <Text style={styles.emptyFeedbackSub}>
                    When members submit monthly reviews for this trainer from their mobile fitness app, their ratings, tags, and feedback messages will appear here.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {reviews.map((review: any) => {
                    const reviewDateFormatted = new Date(review.updated_at || review.created_at).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });
                    const reviewMonthFormatted = review.review_month
                      ? new Date(review.review_month).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric"
                        })
                      : null;

                    return (
                      <View key={review.id} style={styles.feedbackCard}>
                        <View style={styles.feedbackHeader}>
                          <View style={styles.feedbackUser}>
                            <View style={styles.feedbackAvatar}>
                              <Text style={styles.feedbackAvatarText}>
                                {review.member_name ? review.member_name.charAt(0).toUpperCase() : "M"}
                              </Text>
                            </View>
                            <View>
                              <Text style={styles.feedbackUserName}>{review.member_name || "Gym Member"}</Text>
                              {reviewMonthFormatted ? (
                                <Text style={styles.meta}>Review Month: {reviewMonthFormatted}</Text>
                              ) : null}
                            </View>
                          </View>

                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                            <Text style={styles.reviewDate}>{reviewDateFormatted}</Text>
                          </View>
                        </View>

                        <View style={styles.feedbackStarsRow}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              star <= review.rating ? (
                                <StarFilledSvg key={star} size={14} color={colors.primary} />
                              ) : (
                                <StarOutlineSvg key={star} size={14} color={colors.primary} />
                              )
                            ))}
                          </View>
                          <Text style={styles.ratingScoreText}>
                            {review.rating}.0 / 5.0
                          </Text>
                        </View>

                        {review.feedback_option ? (
                          <View style={styles.feedbackTag}>
                            <Text style={styles.feedbackTagText}>{review.feedback_option}</Text>
                          </View>
                        ) : null}

                        {review.feedback_text ? (
                          <View style={styles.feedbackQuoteBox}>
                            <Text style={styles.feedbackQuoteText}>"{review.feedback_text}"</Text>
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

          </Screen>
        );
      }

      /* =========================================================================
       * 2. FULL PAGE: TRAINERS LIST VIEW (Matching reference image)
       * ========================================================================= */
      return (
        <Screen
          scroll
          contentContainerStyle={styles.screen}
          refreshControl={
            <RefreshControl
              refreshing={resource.listQuery.isFetching}
              onRefresh={() => { void resource.listQuery.refetch(); }}
              tintColor={colors.primary}
            />
          }
        >
          {/* Header & Right Action Controls */}
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.title}>Trainers</Text>
              <Text style={styles.subtitle}>Manage your gym trainers, specialties, and assigned members.</Text>
            </View>
            <View style={styles.headerActions}>
              <View style={styles.searchBox}>
                <SearchSvg size={16} color={colors.iconSecondary} />
                <TextInput
                  value={search}
                  onChangeText={(value) => { setSearch(value); setPage(0); }}
                  placeholder="Search trainers..."
                  placeholderTextColor={colors.placeholder}
                  style={styles.searchInput}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                style={styles.outlineButton}
                onPress={() => setFilter((value) => value === "all" ? "active" : value === "active" ? "inactive" : "all")}
              >
                <FilterFunnelSvg size={14} color={colors.primary} />
                <Text style={styles.buttonText}>Filter</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={openCreate}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>+ Add Trainer</Text>
              </Pressable>
            </View>
          </View>

          {/* 4 Stat KPI Cards */}
          <View style={styles.statsGrid}>
            <Stat icon="barbell-outline" label="Total Trainers" value={String(trainers.length)} tone={colors.primary} styles={styles as any} colors={colors} />
            <Stat icon="checkmark-done-outline" label="Active Trainers" value={String(activeTrainerCount)} tone={colors.success} styles={styles as any} colors={colors} />
            <Stat icon="person-add-outline" label="New This Month" value={String(newTrainerCount)} tone={colors.primary} styles={styles as any} colors={colors} />
            <Stat icon="time-outline" label="Inactive / Expired" value={String(inactiveTrainerCount)} tone={colors.iconSecondary} styles={styles as any} colors={colors} />
          </View>

          {/* Filter Bar with Tabs and Sort By */}
          <View style={styles.filterBarRow}>
            <View style={styles.tabs}>
              {(["all", "active", "inactive"] as TrainerFilter[]).map((value) => {
                const isActive = filter === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={value}
                    onPress={() => setFilter(value)}
                    style={[styles.tab, isActive && styles.tabActive]}
                  >
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                      {value === "all" ? "All Trainers" : value === "active" ? "Active" : "Inactive"}
                    </Text>
                    {value === "all" && (
                      <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{trainers.length}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.sortWrapper}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              <Pressable accessibilityRole="button" style={styles.sortPill}>
                <Text style={styles.sortPillText}>Newest</Text>
                <ChevronDownSvg size={13} color={colors.white} />
              </Pressable>
            </View>
          </View>

          {/* Table Container Card */}
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, styles.trainerCol]}>TRAINER</Text>
              <Text style={[styles.columnHeader, styles.specialtyCol]}>SPECIALIZATIONS</Text>
              <Text style={[styles.columnHeader, styles.ratingHeader]}>RATING</Text>
              <Text style={[styles.columnHeader, styles.actionHeader]}>ACTION</Text>
            </View>

            <DataState
              loading={resource.listQuery.isLoading}
              error={resource.listQuery.error ? getApiErrorMessage(resource.listQuery.error) : null}
              empty={!resource.listQuery.isLoading && visible.length === 0}
              emptyTitle="No trainers found"
              emptyMessage="Add a trainer to start managing your gym team."
              emptyActionLabel="Add Trainer"
              onEmptyAction={openCreate}
            />

            {visible.length > 0 ? (
              <FlatList
                data={visible}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => (
                  <TrainerRow
                    trainer={item}
                    styles={styles as any}
                    colors={colors}
                    onEdit={() => openEdit(item)}
                    onDelete={() => remove(item)}
                  />
                )}
              />
            ) : null}

            {/* Pagination Footer */}
            <View style={styles.pagination}>
              <Text style={styles.paginationText}>Showing {visible.length} of {trainers.length} trainers</Text>
              <View style={styles.paginationActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Previous page"
                  disabled={page === 0}
                  onPress={() => setPage((value) => Math.max(0, value - 1))}
                  style={styles.paginationCircle}
                >
                  <Text style={page === 0 ? styles.paginationCircleTextDisabled : styles.paginationCircleText}>‹</Text>
                </Pressable>
                <View style={[styles.paginationCircle, styles.paginationCircleActive]}>
                  <Text style={styles.paginationCircleText}>{page + 1}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Next page"
                  disabled={trainers.length < 50}
                  onPress={() => setPage((value) => value + 1)}
                  style={styles.paginationCircle}
                >
                  <Text style={trainers.length < 50 ? styles.paginationCircleTextDisabled : styles.paginationCircleText}>›</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Add Trainer Form Modal */}
          <Modal visible={formOpen} transparent animationType="fade" onRequestClose={() => setFormOpen(false)}>
            <Pressable accessibilityRole="button" style={styles.modalBackdrop} onPress={() => setFormOpen(false)}>
              <Pressable accessibilityRole="button" style={styles.formCard} onPress={(event) => event.stopPropagation()} accessible={false} importantForAccessibility="no">
                <Text style={styles.formTitle}>Add Trainer</Text>
                {[
                  [name, setName, "Full name"],
                  [email, setEmail, "Email"],
                  [phone, setPhone, "Phone"],
                  [specialties, setSpecialties, "Specializations (comma separated)"]
                ].map(([value, setter, placeholder]) => (
                  <TextInput
                    key={placeholder as string}
                    value={value as string}
                    onChangeText={setter as (value: string) => void}
                    placeholder={placeholder as string}
                  placeholderTextColor={colors.placeholder}
                    style={styles.input}
                  />
                ))}
                <View style={styles.formActions}>
                  <PrimaryButton title="Create Trainer" onPress={save} loading={resource.createMutation.isPending} />
                  <PrimaryButton title="Cancel" variant="secondary" onPress={() => setFormOpen(false)} />
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        </Screen>
      );
    }
  }
}

export function StatView({ model }: { model: ReturnType<typeof useStatPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { label, value, tone, colors } = model.props;
      const styles = model.props.styles as unknown as ReturnType<typeof createStyles>;

      // Render exact matching SVG icon based on label/metric
      const renderStatIcon = () => {
        if (label.includes("Total")) {
          return <DumbbellSvg size={18} color={tone} />;
        }
        if (label.includes("Active")) {
          return <UserCheckSvg size={18} color={tone} />;
        }
        if (label.includes("New")) {
          return <UserPlusSvg size={18} color={tone} />;
        }
        return <ClockSvg size={18} color={tone} />;
      };

      const iconBgColor =
        label.includes("Total") || label.includes("New")
          ? colors.primarySoft
          : label.includes("Active")
          ? colors.successSoft
          : colors.surfaceStrong;

      return (
        <View style={styles.statCard}>
          <View style={styles.statTopRow}>
            <Text style={styles.statLabel}>{label}</Text>
            <View style={[styles.statIconBox, { backgroundColor: iconBgColor }]}>
              {renderStatIcon()}
            </View>
          </View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTrend}>↑ Live data</Text>
        </View>
      );
    }
  }
}

export function TrainerRowView({ model }: { model: ReturnType<typeof useTrainerRowPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { trainer, onEdit, onDelete, colors } = model.props;
      const styles = createStyles(colors);
      const initials = trainer.full_name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "TR";

      const ratingScore = trainer.average_rating ?? 0;
      const reviewCount = trainer.total_reviews ?? 0;

      return (
        <View style={styles.row}>
          {/* TRAINER COLUMN */}
          <Pressable
            accessibilityRole="button"
            onPress={onEdit}
            accessibilityLabel={`View details for ${trainer.full_name}`}
            style={[styles.trainerCell, styles.trainerCol]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.identity}>
              <Text style={styles.name} numberOfLines={1}>{trainer.full_name}</Text>
              <Text style={styles.meta} numberOfLines={1}>
                TRN-{trainer.id.slice(0, 5).toUpperCase()} • {trainer.specialties.length} {trainer.specialties.length === 1 ? "specialty" : "specialties"}
              </Text>
            </View>
          </Pressable>

          {/* SPECIALIZATIONS COLUMN */}
          <View style={styles.specialtyCell}>
            {(trainer.specialties.length ? trainer.specialties : ["General Trainer"]).map((item) => (
              <Text key={item} style={styles.specialtyTag}>{item}</Text>
            ))}
          </View>

          {/* RATING COLUMN */}
          <Pressable
            accessibilityRole="button"
            onPress={onEdit}
            accessibilityLabel={`View ratings for ${trainer.full_name}`}
            style={styles.ratingCell}
          >
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                star <= Math.round(ratingScore) ? (
                  <StarFilledSvg key={star} size={14} color={colors.primary} />
                ) : (
                  <StarOutlineSvg key={star} size={14} color={colors.primary} />
                )
              ))}
            </View>
            <Text style={styles.ratingScoreText}>
              {ratingScore.toFixed(1)}
              <Text style={styles.ratingCountText}> ({reviewCount})</Text>
            </Text>
          </Pressable>

          {/* ACTION COLUMN */}
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              style={styles.actionCircleButton}
              onPress={onEdit}
              accessibilityLabel={"View trainer details"}
            >
              <EyeSvg size={15} color={colors.iconSecondary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={styles.actionCircleButton}
              onPress={onDelete}
              accessibilityLabel={"Trainer options"}
            >
              <MoreVerticalSvg size={15} color={colors.iconSecondary} />
            </Pressable>
          </View>
        </View>
      );
    }
  }
}
