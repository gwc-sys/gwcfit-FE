import { Pressable } from "../../components/NativePressable";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Modal, RefreshControl, Text, TextInput, View } from "react-native";
import { DataState } from "../../components/DataState";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
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
                  <Ionicons name="star" size={18} color="#F59E0B" />
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
                        color={totalReviews > 0 ? "#F59E0B" : colors.muted}
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
                                color="#F59E0B"
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
            <Modal visible={formOpen} transparent animationType="fade" onRequestClose={() => setFormOpen(false)}>
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
       * 2. FULL PAGE: TRAINERS LIST VIEW (Table & Metrics)
       * ========================================================================= */
      return (
        <Screen scroll contentContainerStyle={styles.screen} refreshControl={<RefreshControl refreshing={resource.listQuery.isFetching} onRefresh={() => { void resource.listQuery.refetch(); }} />}>
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.title}>Trainers</Text>
              <Text style={styles.subtitle}>Manage your gym trainers, specialties, and assigned members.</Text>
            </View>
            <View style={styles.headerActions}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={19} color={colors.muted} />
                <TextInput value={search} onChangeText={(value) => { setSearch(value); setPage(0); }} placeholder="Search trainers..." placeholderTextColor={colors.subtle} style={styles.searchInput} />
              </View>
              <Pressable accessibilityRole="button" style={styles.outlineButton} onPress={() => setFilter((value) => value === "all" ? "active" : value === "active" ? "inactive" : "all")}>
                <Ionicons name="funnel-outline" size={17} color={colors.ink} />
                <Text style={styles.buttonText}>Filter{filter !== "all" ? `: ${filter}` : ""}</Text>
              </Pressable>
              <PrimaryButton title="Add Trainer" onPress={openCreate} style={styles.addButton} />
            </View>
          </View>

          <View style={styles.statsGrid}>
            <Stat icon="people" label="Total Trainers" value={String(trainers.length)} tone="#0A84FF" styles={styles} />
            <Stat icon="person" label="Active Trainers" value={String(activeTrainerCount)} tone="#16C784" styles={styles} />
            <Stat icon="person-add" label="New This Month" value={String(newTrainerCount)} tone="#3B82F6" styles={styles} />
            <Stat icon="time" label="Inactive / Expired" value={String(inactiveTrainerCount)} tone="#F59E0B" styles={styles} />
          </View>

          <View style={styles.tableCard}>
            <View style={styles.filterBar}>
              <View style={styles.tabs}>
                {(["all", "active", "inactive"] as TrainerFilter[]).map((value) => (
                  <Pressable accessibilityRole="button" key={value} onPress={() => setFilter(value)} style={[styles.tab, filter === value && styles.tabActive]}><Text style={[styles.tabText, filter === value && styles.tabTextActive]}>{value === "all" ? `All Trainers  ${trainers.length}` : value[0].toUpperCase() + value.slice(1)}</Text></Pressable>
                ))}
              </View>
              <View style={styles.sortBox}>
                <Text style={styles.buttonText}>Sort by: Newest</Text>
                <Ionicons name="chevron-down" size={14} color={colors.muted} />
              </View>
            </View>

            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, styles.trainerCol]}>Trainer</Text>
              <Text style={styles.columnHeader}>Contact</Text>
              <Text style={styles.columnHeader}>Specializations</Text>
              <Text style={styles.columnHeader}>Rating</Text>
              <Text style={styles.columnHeader}>Assigned Members</Text>
              <Text style={styles.columnHeader}>Status</Text>
              <Text style={styles.columnHeader}>Join Date</Text>
              <Text style={styles.columnHeader}>Action</Text>
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
                    styles={styles}
                    colors={colors}
                    onEdit={() => openEdit(item)}
                    onEditForm={() => openTrainerForm(item)}
                    onDelete={() => remove(item)}
                  />
                )}
              />
            ) : null}

            <View style={styles.pagination}>
              <Text style={styles.paginationText}>Showing {visible.length} of {trainers.length} trainers</Text>
              <View style={styles.paginationActions}>
                <Pressable accessibilityRole="button" accessibilityLabel="Previous" disabled={page === 0} onPress={() => setPage((value) => Math.max(0, value - 1))} style={styles.pageButton} accessibilityState={{ disabled: page === 0 }}>
                  <Ionicons name="chevron-back" size={16} color={colors.ink} />
                </Pressable>
                <Text style={styles.pageNumber}>{page + 1}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Next" disabled={trainers.length < 50} onPress={() => setPage((value) => value + 1)} style={styles.pageButton} accessibilityState={{ disabled: trainers.length < 50 }}>
                  <Ionicons name="chevron-forward" size={16} color={colors.ink} />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Add / Edit Form Modal */}
          <Modal visible={formOpen} transparent animationType="fade" onRequestClose={() => setFormOpen(false)}>
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
      return (
        <View style={styles.row}>
          <Pressable accessibilityRole="button" onPress={onEdit} accessibilityLabel={`View details for ${trainer.full_name}`} style={[styles.trainerCell, styles.trainerCol]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{trainer.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.identity}>
              <Text style={styles.name} numberOfLines={1}>{trainer.full_name}</Text>
              <Text style={styles.meta} numberOfLines={1}>TRN-{trainer.id.slice(0, 5).toUpperCase()} · {trainer.specialties.length} specialties</Text>
            </View>
          </Pressable>
          <View style={styles.contactCell}>
            <Text style={styles.cellText} numberOfLines={1}>{trainer.phone || "—"}</Text>
            <Text style={styles.meta} numberOfLines={1}>{trainer.email || "No email"}</Text>
          </View>
          <View style={styles.specialtyCell}>
            {(trainer.specialties.length ? trainer.specialties : ["Not assigned"]).slice(0, 2).map((item) => (
              <Text key={item} style={styles.specialtyTag}>{item}</Text>
            ))}
          </View>
          <Pressable accessibilityRole="button" onPress={onEdit} accessibilityLabel={`View ratings for ${trainer.full_name}`} style={styles.ratingCell}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(trainer.average_rating || 0) && trainer.total_reviews > 0 ? "star" : "star-outline"}
                  size={12}
                  color={trainer.total_reviews > 0 ? "#F59E0B" : colors.muted}
                />
              ))}
            </View>
            <Text style={styles.cellText}>{trainer.total_reviews ? `${trainer.average_rating.toFixed(1)} (${trainer.total_reviews})` : "No reviews"}</Text>
          </Pressable>
          <View style={styles.assignedCell}>
            <Text style={styles.cellText}>—</Text>
            <View style={styles.progress}><View style={styles.progressFill} /></View>
          </View>
          <View style={styles.statusCell}>
            <StatusBadge label={trainer.is_active ? "Active" : "Inactive"} tone={trainer.is_active ? "success" : "warning"} />
          </View>
          <Text style={styles.dateCell}>{new Date(trainer.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" style={styles.iconButton} onPress={onEdit} accessibilityLabel={"View trainer details"}>
              <Ionicons name="eye-outline" size={18} color={colors.ink} />
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.iconButton} onPress={onEditForm || onEdit} accessibilityLabel={"Edit trainer"}>
              <Ionicons name="create-outline" size={18} color={colors.ink} />
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.iconButton} onPress={onDelete} accessibilityLabel={"Deactivate trainer"}>
              <Ionicons name="ellipsis-vertical" size={18} color={colors.muted} />
            </Pressable>
          </View>
        </View>
      );
    }
  }
}
