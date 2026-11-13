import { Pressable } from "../../components/NativePressable";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Image, KeyboardAvoidingView, Modal, Platform, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { DataState } from "../../components/DataState";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
import { getApiErrorMessage } from "../../../../services/api/client";
import { showAlert } from "../../../../utils/appAlert";
import type { Trainer } from "../../../../types/saas";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import { referenceTrainersStyles, createReferenceTrainersStyles } from "../../styles/screens/saas/TrainersScreen.styles";
import type * as React from "react";
import type { useTrainersScreenPresentation, useStatPresentation, useTrainerRowPresentation } from "../../../../screens/saas/TrainersScreen";

type TrainerFilter = "all" | "active" | "inactive";

export function TrainersScreenView({ model }: { model: ReturnType<typeof useTrainersScreenPresentation> }): React.ReactNode {
  const reduceMotion = useReducedMotion();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      return (<AccessDeniedScreen />);
    }
    case "view2": {
      const {
        styles,
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
        openTrainerForm,
        remove,
        page,
        formOpen,
        setFormOpen,
        editing,
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

      /* =========================================================================
       * 1. FULL PAGE: TRAINER DETAILS VIEW (Apple HIG Mobile)
       * ========================================================================= */
      if (detailTrainer) {
        const totalReviews = feedbackQuery.data?.total_reviews ?? detailTrainer.total_reviews ?? 0;
        const avgRating = feedbackQuery.data?.average_rating ?? detailTrainer.average_rating ?? 0;
        const starDistribution = feedbackQuery.data?.star_distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const reviews = feedbackQuery.data?.reviews ?? [];

        return (
          <Screen scroll contentContainerStyle={styles.screen}>
            {/* Top Navigation */}
            <View style={styles.pageBackNav}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to trainers list"
                style={styles.backButton}
                onPress={() => setDetailTrainer(null)}
              >
                <Ionicons name="chevron-back" size={18} color={colors.ink} />
                <Text style={styles.backButtonText}>Trainers</Text>
              </Pressable>

              <PrimaryButton
                title="Edit Trainer"
                onPress={() => openTrainerForm(detailTrainer)}
              />
            </View>

            {/* Trainer Profile Card */}
            <View style={styles.pageHeroCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={styles.heroAvatar}>
                  <Text style={styles.heroAvatarText}>
                    {detailTrainer.full_name.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase() || "TR"}
                  </Text>
                </View>

                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <View style={styles.heroTitleRow}>
                    <Text style={styles.heroName}>{detailTrainer.full_name}</Text>
                    <StatusBadge
                      label={detailTrainer.is_active ? "Active" : "Inactive"}
                      tone={detailTrainer.is_active ? "success" : "warning"}
                    />
                  </View>
                  <Text style={styles.meta}>TRN-{detailTrainer.id.slice(0, 8).toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.heroMetaRow}>
                {detailTrainer.email ? (
                  <View style={styles.heroMetaItem}>
                    <Ionicons name="mail-outline" size={13} color={colors.muted} />
                    <Text style={styles.heroMetaText}>{detailTrainer.email}</Text>
                  </View>
                ) : null}

                {detailTrainer.phone ? (
                  <View style={styles.heroMetaItem}>
                    <Ionicons name="call-outline" size={13} color={colors.muted} />
                    <Text style={styles.heroMetaText}>{detailTrainer.phone}</Text>
                  </View>
                ) : null}

                {detailTrainer.hourly_rate_cents ? (
                  <View style={styles.heroMetaItem}>
                    <Ionicons name="cash-outline" size={13} color={colors.muted} />
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

            {/* Ratings & Star Distribution Card */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name="star" size={18} color={colors.primary} />
                  <Text style={styles.sectionHeaderTitle}>Ratings & Star Distribution</Text>
                </View>
                <Text style={styles.meta}>
                  {totalReviews > 0 ? `${totalReviews} total reviews` : "No reviews yet"}
                </Text>
              </View>

              <View style={styles.ratingGrid}>
                {/* Score Box */}
                <View style={styles.scoreDisplay}>
                  <Text style={styles.scoreNumber}>{avgRating > 0 ? avgRating.toFixed(1) : "0.0"}</Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= Math.round(avgRating) && totalReviews > 0 ? "star" : "star-outline"}
                        size={16}
                        color={totalReviews > 0 ? colors.primary : colors.muted}
                      />
                    ))}
                  </View>
                  <Text style={styles.scoreSub}>
                    {totalReviews > 0 ? `Based on ${totalReviews} ${totalReviews === 1 ? "review" : "reviews"}` : "Unrated"}
                  </Text>
                </View>

                {/* Distribution Bars */}
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

            {/* Member Feedback Section */}
            <View style={{ gap: 12 }}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name="chatbubbles-outline" size={18} color={colors.primary} />
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
                  <Ionicons name="chatbubble-ellipses-outline" size={36} color={colors.muted} />
                  <Text style={styles.emptyFeedbackTitle}>No member feedback yet</Text>
                  <Text style={styles.emptyFeedbackSub}>
                    When members rate this trainer in their mobile fitness app, their ratings, tags, and feedback messages will appear here.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
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
                                <Text style={styles.meta}>Month: {reviewMonthFormatted}</Text>
                              ) : null}
                            </View>
                          </View>

                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <Ionicons name="calendar-outline" size={12} color={colors.muted} />
                            <Text style={styles.reviewDate}>{reviewDateFormatted}</Text>
                          </View>
                        </View>

                        <View style={styles.feedbackStarsRow}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Ionicons
                                key={star}
                                name={star <= review.rating ? "star" : "star-outline"}
                                size={14}
                                color={colors.primary}
                              />
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

            {/* Add / Edit Form Modal */}
            <Modal visible={formOpen} transparent animationType={reduceMotion ? "none" : "fade"} onRequestClose={() => setFormOpen(false)}>
              <Pressable accessibilityRole="button" style={styles.modalBackdrop} onPress={() => setFormOpen(false)}>
                <Pressable accessibilityRole="button" style={styles.formCard} onPress={(event) => event.stopPropagation()} accessible={false} importantForAccessibility="no">
                  <Text style={styles.formTitle}>{editing ? "Edit Trainer" : "Add Trainer"}</Text>
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
                      placeholderTextColor={colors.subtle}
                      style={styles.input}
                    />
                  ))}
                  <View style={styles.formActions}>
                    <PrimaryButton title={editing ? "Save Changes" : "Create Trainer"} onPress={save} loading={resource.createMutation.isPending || resource.updateMutation.isPending} />
                    <PrimaryButton title="Cancel" variant="secondary" onPress={() => setFormOpen(false)} />
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          </Screen>
        );
      }

      /* =========================================================================
       * 2. FULL PAGE: TRAINERS LIST VIEW (AMOLED Reference Design)
       * ========================================================================= */
      const { isSmallPhone, isLargeFont, isShortScreen } = useResponsiveLayout();
      const s = createReferenceTrainersStyles(colors);
      const totalCount = trainers.length;
      const activeCount = activeTrainerCount;
      const newCount = newTrainerCount;
      const inactiveCount = inactiveTrainerCount;

      const trainersToRender: Trainer[] = visible;

      return (
        <Screen
          scroll
          contentContainerStyle={s.screen}
          refreshControl={
            <RefreshControl
              refreshing={resource.listQuery.isFetching}
              onRefresh={() => { void resource.listQuery.refetch(); }}
              tintColor={colors.primary}
            />
          }
        >
          {/* Top Brand & Actions Bar */}
          <View style={s.topBarRow}>
            <View style={s.topBrandLeft}>
              <View style={s.topAvatar}>
                <Image
                  source={require("../../../../../assets/images/pulsefit-logo.png")}
                  style={{ width: 24, height: 24 }}
                  resizeMode="contain"
                />
              </View>
              <View style={s.topBrandInfo}>
                <View style={s.brandTitleRow}>
                  <Text style={s.brandName}>ZD Fitness</Text>
                  <View style={s.proBadge}>
                    <Text style={s.proBadgeText}>PRO</Text>
                  </View>
                </View>
                <View style={s.subscriptionDueRow}>
                  <View style={s.subscriptionDot} />
                  <Text style={s.subscriptionText}>Gym SaaS Subscription Due Tomorrow</Text>
                </View>
              </View>
            </View>

            <View style={s.topBarRight}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                onPress={() => showAlert("Notifications", "You have no unread notifications.")}
                style={s.bellButton}
              >
                <Ionicons name="notifications-outline" size={18} color={colors.textPrimary} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add trainer"
                onPress={openCreate}
                style={s.addPillButton}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={s.addPillText}>Add</Text>
              </Pressable>
            </View>
          </View>

          {/* Section Header: Trainers Roster + Live Sync */}
          <View style={s.sectionHeaderRow}>
            <View style={s.sectionTitleRow}>
              <Text style={s.sectionTitle}>Trainers Roster</Text>
              <View style={s.liveSyncBadge}>
                <View style={s.liveSyncDot} />
                <Text style={s.liveSyncText}>Live Sync</Text>
              </View>
            </View>
            <Text style={s.subtitle}>
              Manage gym trainers, qualifications & assigned members.
            </Text>
          </View>

          {/* Stats Row (4 Columns with Dividers, adapts gracefully on small screens) */}
          <View style={[s.statsCard, (isSmallPhone || isLargeFont) && { paddingVertical: 10, paddingHorizontal: 8 }]}>
            <View style={s.statCol}>
              <Text style={s.statLabel}>Total</Text>
              <Text style={s.statValWhite}>{totalCount}</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statCol}>
              <Text style={s.statLabel}>Active</Text>
              <Text style={s.statValGreen}>{activeCount}</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statCol}>
              <Text style={s.statLabel}>New</Text>
              <Text style={s.statValPink}>{newCount}</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statCol}>
              <Text style={s.statLabel}>Inactive</Text>
              <Text style={s.statValMuted}>{inactiveCount}</Text>
            </View>
          </View>

          {/* Filter Tabs Strip (Horizontal scrollable to prevent wrapping/clipping) */}
          <View style={s.filterTabsStrip}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: "row", gap: 8, paddingHorizontal: 4 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`All Trainers (${totalCount})`}
                onPress={() => setFilter("all")}
                style={[s.tabPill, filter === "all" && s.tabPillActive]}
              >
                <Text style={[s.tabText, filter === "all" && s.tabTextActive]}>
                  All Trainers ({totalCount})
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Active Trainers"
                onPress={() => setFilter("active")}
                style={[s.tabPill, filter === "active" && s.tabPillActive]}
              >
                <Text style={[s.tabText, filter === "active" && s.tabTextActive]}>
                  Active
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Inactive Trainers"
                onPress={() => setFilter("inactive")}
                style={[s.tabPill, filter === "inactive" && s.tabPillActive]}
              >
                <Text style={[s.tabText, filter === "inactive" && s.tabTextActive]}>
                  Inactive
                </Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* Search & Sort Row */}
          <View style={s.searchSortRow}>
            <View style={s.searchBox}>
              <Ionicons name="search-outline" size={16} color={colors.subtle} />
              <TextInput
                value={search}
                onChangeText={(value) => { setSearch(value); setPage(0); }}
                placeholder="Search name or specialty..."
                placeholderTextColor={colors.subtle}
                style={s.searchInput}
                accessibilityLabel="Search name or specialty"
              />
              {search ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  onPress={() => { setSearch(""); setPage(0); }}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="close" size={16} color={colors.subtle} />
                </Pressable>
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sort by"
              onPress={() => setFilter((value) => value === "all" ? "active" : value === "active" ? "inactive" : "all")}
              style={s.sortDropdown}
            >
              <Text style={s.sortDropdownText}>Sort: Newest</Text>
              <Ionicons name="chevron-down" size={14} color={colors.textPrimary} />
            </Pressable>
          </View>

          <DataState
            loading={resource.listQuery.isLoading}
            error={resource.listQuery.error ? getApiErrorMessage(resource.listQuery.error) : null}
            empty={!resource.listQuery.isLoading && visible.length === 0 && (Boolean(search) || filter !== "all")}
            emptyTitle="No trainers found"
            emptyMessage="No trainers match your search or filter."
            emptyActionLabel="Clear filters"
            onEmptyAction={() => { setSearch(""); setFilter("all"); }}
          />

          {trainersToRender.length > 0 ? (
            <FlatList
              data={trainersToRender}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TrainerRow
                  trainer={item}
                  styles={styles}
                  colors={colors}
                  onEdit={() => openEdit(item)}
                  onEditForm={() => openTrainerForm(item)}
                  onDelete={() => remove(item)}
                />
              )}
            />
          ) : null}

          {/* Footer Text */}
          <Text style={s.footerText}>
            Showing {trainersToRender.length} of {totalCount} trainers
          </Text>

          {/* Add / Edit Form Modal (KeyboardAvoiding and Scrollable for short devices) */}
          <Modal visible={formOpen} transparent animationType={reduceMotion ? "none" : "fade"} onRequestClose={() => setFormOpen(false)}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
              <Pressable accessibilityRole="button" style={styles.modalBackdrop} onPress={() => setFormOpen(false)}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", width: "100%" }} keyboardShouldPersistTaps="handled">
                  <Pressable accessibilityRole="button" style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.separator, borderRadius: 20, width: "92%", maxWidth: 440 }]} onPress={(event) => event.stopPropagation()} accessible={false} importantForAccessibility="no">
                    <Text style={[styles.formTitle, { color: "#FFFFFF" }]}>{editing ? "Edit Trainer" : "Add Trainer"}</Text>
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
                        placeholderTextColor={colors.subtle}
                        style={[styles.input, { backgroundColor: colors.background, borderColor: colors.separator, color: "#FFFFFF" }]}
                      />
                    ))}
                    <View style={styles.formActions}>
                      <PrimaryButton title={editing ? "Save Changes" : "Create Trainer"} onPress={save} loading={resource.createMutation.isPending || resource.updateMutation.isPending} />
                      <PrimaryButton title="Cancel" variant="secondary" onPress={() => setFormOpen(false)} />
                    </View>
                  </Pressable>
                </ScrollView>
              </Pressable>
            </KeyboardAvoidingView>
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
      const { styles, tone, icon, label, value } = model.props;
      return (
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: `${tone}33` }]}>
            <Ionicons name={icon} size={23} color={tone} />
          </View>
          <View>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTrend}>↑ Live data</Text>
          </View>
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
      const { styles, trainer, onEdit, onEditForm, colors, onDelete } = model.props;
      const s = createReferenceTrainersStyles(colors);
      const initials = trainer.full_name
        ? trainer.full_name.split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase()
        : "TR";
      const trainerCode = trainer.id ? `TRN-${trainer.id.slice(0, 5).toUpperCase()}` : "TRN";
      const specialtiesList = (trainer.specialties && trainer.specialties.length > 0)
        ? trainer.specialties
        : ["General Trainer"];
      const trainerRole = specialtiesList[0];
      const trainerMeta = `${trainerCode} • ${specialtiesList.length} ${specialtiesList.length === 1 ? "specialty" : "specialties"}`;
      const rating = trainer.average_rating ? trainer.average_rating.toFixed(1) : "0.0";
      const reviewCount = trainer.total_reviews ?? 0;

      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Trainer card ${trainer.full_name}`}
          onPress={onEdit}
          style={s.trainerCard}
        >
          {/* Card Top Row: Avatar, Identity, Active Badge */}
          <View style={s.cardTopRow}>
            <View style={s.cardAvatar}>
              <Text style={s.cardAvatarText}>{initials}</Text>
            </View>

            <View style={s.cardIdentity}>
              <Text numberOfLines={1} style={s.trainerName}>{trainer.full_name || "Trainer"}</Text>
              <Text numberOfLines={1} style={s.trainerRole}>{trainerRole}</Text>
              <Text numberOfLines={1} style={s.trainerMeta}>{trainerMeta}</Text>
            </View>

            <View style={trainer.is_active ? s.statusBadgeActive : s.statusBadgeInactive}>
              <Text style={trainer.is_active ? s.statusBadgeTextActive : s.statusBadgeTextInactive}>
                {trainer.is_active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>

          {/* Specialties Section */}
          <View style={s.specialtiesSection}>
            <Text style={s.specialtiesLabel}>SPECIALTIES</Text>
            <View style={s.specialtiesRow}>
              {specialtiesList.map((spec: string, idx: number) => (
                <View key={`${spec}-${idx}`} style={s.specialtyPill}>
                  <Text style={s.specialtyPillText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Card Bottom Row: Rating, Details Button, Options Button */}
          <View style={s.cardBottomRow}>
            <View style={s.ratingRow}>
              <Text style={s.ratingValue}>{rating}</Text>
              <Ionicons name="star" size={13} color={colors.primary} />
              <Text style={s.reviewsText}>· {reviewCount} reviews</Text>
            </View>

            <View style={s.cardActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Details"
                onPress={onEdit}
                style={s.detailsButton}
              >
                <Ionicons name="eye-outline" size={14} color="#FFFFFF" />
                <Text style={s.detailsButtonText}>Details</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Trainer options"
                onPress={onEditForm || onEdit}
                style={s.optionsButton}
              >
                <Ionicons name="ellipsis-vertical" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </Pressable>
      );
    }
  }
}
