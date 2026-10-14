import { Ionicons } from "@expo/vector-icons";
import { Controller } from "react-hook-form";
import { FlatList, Image, ImageBackground, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { DatePickerField } from "../../../../components/DatePickerField";
import { FoodNutritionMealPicker } from "../../../../components/FoodNutritionMealPicker";
import { FormTextField } from "../../components/FormTextField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { RelationshipSelectField } from "../../components/RelationshipSelectField";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { getApiErrorMessage } from "../../../../services/api/client";
import { radius, spacing, typography } from "../../theme/theme";
import { genderExerciseCounts, genderExerciseGroups, genderExerciseLibrary, genderExercisesByGroup } from "../../../../data/genderExerciseLibrary";
import type { WorkoutGender } from "../../../../types/fitness";
import type * as React from "react";
import type { useResourceCrudPanelPresentation, useGenderWorkoutSessionPickerPresentation, useLoadingRowsPresentation } from "../../../../features/operations/ResourceCrudPanel";

type DietScheduleMode = "single" | "range";

export function ResourceCrudPanelView<TRead extends { id: string }, TCreate, TUpdate>({ model }: { model: ReturnType<typeof useResourceCrudPanelPresentation<TRead, TCreate, TUpdate>> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { config, formOnly, showForm, beginCreate, styles, records, formTitle, closeForm, colors, autoAssignCurrentTrainer, currentUser, visibleFields, control, errors, setDietScheduleMode, setValue, dietStartDate, dietScheduleMode, dietEndDate, dietCaloriesByTitle, getRelationState, getRelationIcon, relationOptions, GenderWorkoutSessionPicker, dietTargetCalories, createMutation, updateMutation, isMutating, submit, editingRecord, notice, listQuery, deleteMutation, setSearch, search, setSortDirection, sortDirection, filteredRecords, LoadingRows, beginEdit, confirmDelete, page, setPage } = model.props;
      return ((
    <SurfacePanel
      title={config.title}
      kicker={config.subtitle}
      icon={config.icon}
      actionLabel={formOnly || showForm ? undefined : "New"}
      onAction={formOnly || showForm ? undefined : beginCreate}
    >
      {!formOnly ? (
        <View style={styles.summaryRow}>
          <StatusBadge label={`${records.length} loaded`} tone="neutral" />
          <StatusBadge
            label={config.permission.replace("manage_", "").replace("_", " ")}
            tone="success"
          />
        </View>
      ) : null}

      {showForm ? (
        <View style={styles.formBlock}>
          <View style={styles.formHeader}>
            <Text style={styles.blockTitle}>{formTitle}</Text>
            <Pressable accessibilityLabel="Close"
              accessibilityRole="button"
              onPress={closeForm}
              style={styles.iconButton}
            >
              <Ionicons name="close" size={20} color={colors.ink} />
            </Pressable>
          </View>

          {autoAssignCurrentTrainer ? (
            <View style={styles.autoTrainerNotice}>
              <View style={styles.autoTrainerIcon}>
                <Ionicons
                  name="person-circle-outline"
                  size={21}
                  color={colors.primary}
                />
              </View>
              <View style={styles.autoTrainerCopy}>
                <Text style={styles.autoTrainerTitle}>
                  Trainer assigned automatically
                </Text>
                <Text style={styles.autoTrainerText}>
                  {currentUser?.full_name ?? "Current trainer"} will be assigned
                  to this diet plan.
                </Text>
              </View>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
              />
            </View>
          ) : null}

          {visibleFields.map((field) =>
            config.key === "diet-plans" && field.name === "ends_at" ? null : (
              <Controller
                key={field.name}
                control={control}
                name={field.name}
                render={({ field: { onBlur, onChange, value } }) => {
                  const fieldError = errors[field.name]?.message
                    ? String(errors[field.name]?.message)
                    : undefined;

                  if (
                    config.key === "diet-plans" &&
                    field.name === "starts_at"
                  ) {
                    const chooseMode = (mode: DietScheduleMode) => {
                      setDietScheduleMode(mode);
                      if (mode === "single") {
                        setValue("ends_at", dietStartDate, {
                          shouldDirty: true,
                        });
                      }
                    };
                    return (
                      <View style={styles.scheduleBlock}>
                        <View style={styles.scheduleHeading}>
                          <View style={styles.scheduleTitleWrap}>
                            <Ionicons
                              name="calendar-outline"
                              size={20}
                              color={colors.primary}
                            />
                            <View>
                              <Text style={styles.scheduleTitle}>
                                When will this plan be used?
                              </Text>
                              <Text style={styles.scheduleHint}>
                                Choose one day or a date range.
                              </Text>
                            </View>
                          </View>
                          <View style={styles.modeSwitch}>
                            <Pressable accessibilityRole="button"
                              onPress={() => chooseMode("single")}
                              style={[
                                styles.modeOption,
                                dietScheduleMode === "single" &&
                                  styles.modeOptionActive,
                              ]}
                            >
                              <Ionicons
                                name="today-outline"
                                size={17}
                                color={
                                  dietScheduleMode === "single"
                                    ? "#FFFFFF"
                                    : colors.muted
                                }
                              />
                              <Text
                                style={[
                                  styles.modeText,
                                  dietScheduleMode === "single" &&
                                    styles.modeTextActive,
                                ]}
                              >
                                Single day
                              </Text>
                            </Pressable>
                            <Pressable accessibilityRole="button"
                              onPress={() => chooseMode("range")}
                              style={[
                                styles.modeOption,
                                dietScheduleMode === "range" &&
                                  styles.modeOptionActive,
                              ]}
                            >
                              <Ionicons
                                name="calendar-number-outline"
                                size={17}
                                color={
                                  dietScheduleMode === "range"
                                    ? "#FFFFFF"
                                    : colors.muted
                                }
                              />
                              <Text
                                style={[
                                  styles.modeText,
                                  dietScheduleMode === "range" &&
                                    styles.modeTextActive,
                                ]}
                              >
                                Date range
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                        <View
                          style={[
                            styles.dateFields,
                            dietScheduleMode === "single" &&
                              styles.singleDateField,
                          ]}
                        >
                          <View style={styles.dateField}>
                            <DatePickerField
                              error={fieldError}
                              label={
                                dietScheduleMode === "single"
                                  ? "Plan date"
                                  : "Starts on"
                              }
                              onChange={(nextDate) => {
                                onChange(nextDate);
                                if (dietScheduleMode === "single") {
                                  setValue("ends_at", nextDate, {
                                    shouldDirty: true,
                                  });
                                } else if (
                                  dietEndDate &&
                                  nextDate &&
                                  dietEndDate < nextDate
                                ) {
                                  setValue("ends_at", "", {
                                    shouldDirty: true,
                                  });
                                }
                              }}
                              value={String(value ?? "")}
                            />
                          </View>
                          {dietScheduleMode === "range" ? (
                            <View style={styles.dateField}>
                              <DatePickerField
                                error={
                                  errors.ends_at?.message
                                    ? String(errors.ends_at.message)
                                    : undefined
                                }
                                label="Ends on"
                                minimumDate={dietStartDate}
                                onChange={(nextDate) =>
                                  setValue("ends_at", nextDate, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  })
                                }
                                value={dietEndDate}
                              />
                            </View>
                          ) : null}
                        </View>
                      </View>
                    );
                  }

                  if (field.choices) {
                    return (
                      <View style={styles.choiceField}>
                        <Text style={styles.choiceLabel}>{field.label}</Text>
                        <View style={styles.choiceRow}>
                          {field.choices.map((choice) => {
                            const active = String(value ?? "") === choice;
                            return (
                              <Pressable accessibilityRole="button"
                                key={choice}
                                onPress={() => {
                                  onChange(choice);
                                  if (field.syncField)
                                    setValue(field.syncField, choice, {
                                      shouldDirty: true,
                                    });
                                  if (
                                    config.key === "diet-plans" &&
                                    field.name === "title"
                                  ) {
                                    setValue(
                                      "calories_per_day",
                                      dietCaloriesByTitle[choice] ?? "",
                                      { shouldDirty: true },
                                    );
                                  }
                                }}
                                style={[
                                  styles.choiceOption,
                                  active && styles.choiceOptionActive,
                                ]}
                              >
                                {active ? (
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={17}
                                    color="#FFFFFF"
                                  />
                                ) : null}
                                <Text
                                  style={[
                                    styles.choiceText,
                                    active && styles.choiceTextActive,
                                  ]}
                                >
                                  {choice}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                        {fieldError ? (
                          <Text style={styles.error}>{fieldError}</Text>
                        ) : null}
                      </View>
                    );
                  }

                  if (field.relation) {
                    const relationState = getRelationState(field.relation);
                    return (
                      <RelationshipSelectField
                        allowClear={field.allowClear ?? !field.createOnly}
                        error={fieldError ?? relationState.error}
                        helperText={
                          field.helperText ??
                          (field.createOnly
                            ? "Required when creating a new record."
                            : undefined)
                        }
                        icon={getRelationIcon(field.relation)}
                        label={field.label}
                        loading={relationState.loading}
                        onChange={(nextValue) => onChange(nextValue ?? "")}
                        options={relationOptions[field.relation]}
                        placeholder={field.placeholder ?? field.label}
                        value={String(value ?? "") || null}
                      />
                    );
                  }

                  if (field.catalog === "workout") {
                    return (
                      <GenderWorkoutSessionPicker
                        onChange={onChange}
                        value={String(value ?? "[]")}
                      />
                    );
                  }

                  if (field.catalog === "food") {
                    return (
                      <FoodNutritionMealPicker
                        onChange={onChange}
                        targetCalories={dietTargetCalories || 2000}
                        value={String(value ?? "[]")}
                      />
                    );
                  }

                  if (field.datePicker) {
                    return (
                      <DatePickerField
                        error={fieldError}
                        helper={field.helperText}
                        label={field.label}
                        onChange={onChange}
                        value={String(value ?? "")}
                      />
                    );
                  }

                  return (
                    <FormTextField
                      error={fieldError}
                      helper={
                        field.helperText ??
                        (field.createOnly
                          ? "Required when creating a new record."
                          : undefined)
                      }
                      keyboardType={field.keyboardType}
                      label={field.label}
                      multiline={field.multiline}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder={field.placeholder ?? field.label}
                      secureTextEntry={field.secureTextEntry}
                      value={String(value ?? "")}
                    />
                  );
                }}
              />
            ),
          )}

          {createMutation.error ? (
            <Text style={styles.error}>
              {getApiErrorMessage(createMutation.error)}
            </Text>
          ) : null}
          {updateMutation.error ? (
            <Text style={styles.error}>
              {getApiErrorMessage(updateMutation.error)}
            </Text>
          ) : null}
          <View style={styles.actionRow}>
            <PrimaryButton
              disabled={isMutating}
              loading={createMutation.isPending || updateMutation.isPending}
              onPress={submit}
              title={editingRecord ? "Save Changes" : "Create"}
              style={styles.actionButton}
            />
            <PrimaryButton
              disabled={isMutating}
              onPress={closeForm}
              title="Cancel"
              variant="secondary"
              style={styles.actionButton}
            />
          </View>
        </View>
      ) : null}

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {listQuery.error ? (
        <Text style={styles.error}>{getApiErrorMessage(listQuery.error)}</Text>
      ) : null}
      {deleteMutation.error ? (
        <Text style={styles.error}>
          {getApiErrorMessage(deleteMutation.error)}
        </Text>
      ) : null}

      {!formOnly ? (
        <>
          <View style={styles.toolbar}>
            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={20} color={colors.muted} />
              <TextInput
                autoCapitalize="none"
                onChangeText={setSearch}
                placeholder={`Search ${config.title.toLowerCase()}`}
                placeholderTextColor={colors.subtle}
                style={styles.searchInput}
                value={search}
              />
              {search ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSearch("")}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.muted}
                  />
                </Pressable>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                setSortDirection((value) => (value === "az" ? "za" : "az"))
              }
              style={styles.sortButton}
            >
              <Ionicons
                name={sortDirection === "az" ? "arrow-down" : "arrow-up"}
                size={18}
                color={colors.ink}
              />
              <Text style={styles.sortText}>{sortDirection.toUpperCase()}</Text>
            </Pressable>
          </View>

          <FlatList
            data={filteredRecords}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              listQuery.isLoading ? (
                <LoadingRows />
              ) : (
                <EmptyState
                  title={
                    search
                      ? "No matches found"
                      : `No ${config.title.toLowerCase()} yet`
                  }
                  message={
                    search
                      ? "Try a different search term or clear the filter."
                      : "Create the first record when you are ready."
                  }
                  actionLabel={search ? "Clear Search" : "New Record"}
                  onAction={search ? () => setSearch("") : beginCreate}
                />
              )
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={
              <RefreshControl
                refreshing={listQuery.isFetching}
                onRefresh={() => listQuery.refetch()}
              />
            }
            renderItem={({ item }) => {
              const details = config.getDetails?.(item).filter(Boolean) ?? [];
              const status = config.getStatus?.(item);

              return (
                <View style={styles.row}>
                  <View style={styles.rowIcon}>
                    <Ionicons
                      name={config.icon}
                      size={20}
                      color={colors.primaryDark}
                    />
                  </View>
                  <View style={styles.rowBody}>
                    <View style={styles.rowTitleLine}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {config.getTitle(item)}
                      </Text>
                      {status ? (
                        <StatusBadge label={status.label} tone={status.tone} />
                      ) : null}
                    </View>
                    <Text style={styles.rowMeta} numberOfLines={2}>
                      {config.getMeta(item)}
                    </Text>
                    {details.length > 0 ? (
                      <View style={styles.detailChips}>
                        {details.map((detail) => (
                          <Text
                            key={detail}
                            style={styles.detailChip}
                            numberOfLines={1}
                          >
                            {detail}
                          </Text>
                        ))}
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.rowActions}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => beginEdit(item)}
                      style={styles.iconButton}
                    >
                      <Ionicons
                        name="create-outline"
                        size={19}
                        color={colors.ink}
                      />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      disabled={deleteMutation.isPending}
                      onPress={() => confirmDelete(item)}
                      style={styles.iconButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={19}
                        color={colors.danger}
                      />
                    </Pressable>
                  </View>
                </View>
              );
            }}
            scrollEnabled={false}
          />

          <View style={styles.pagination}>
            <PrimaryButton
              disabled={page === 0 || listQuery.isFetching}
              onPress={() => setPage((value) => Math.max(0, value - 1))}
              title="Previous"
              variant="secondary"
              style={styles.pageButton}
            />
            <Text style={styles.pageLabel}>Page {page + 1}</Text>
            <PrimaryButton
              disabled={records.length < 50 || listQuery.isFetching}
              onPress={() => setPage((value) => value + 1)}
              title="Next"
              variant="secondary"
              style={styles.pageButton}
            />
          </View>
        </>
      ) : null}
    </SurfacePanel>
  ));
    }
  }
}

export function GenderWorkoutSessionPickerView({ model }: { model: ReturnType<typeof useGenderWorkoutSessionPickerPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { colors, setGender, gender, exerciseSearch, setExerciseSearch, setCategory, category, visibleExercises, selectedKeys, toggle, selected } = model.props;
      return ((
    <View style={{ gap: spacing.sm }}>
      <Text
        style={{ ...typography.small, color: colors.ink, fontWeight: "700" }}
      >
        Male & female workout library
      </Text>
      <ImageBackground
        imageStyle={{ borderRadius: radius.md, opacity: 0.28 }}
        source={require("../../../../../assets/images/workout-plan-library.png")}
        style={{
          minHeight: 118,
          borderRadius: radius.md,
          overflow: "hidden",
          justifyContent: "flex-end",
          padding: spacing.md,
          backgroundColor: colors.surface,
        }}
      >
        <Text style={{ ...typography.h3, color: colors.ink }}>
          Build a structured plan
        </Text>
        <Text style={{ ...typography.small, color: colors.muted }}>
          All {genderExerciseCounts.Male + genderExerciseCounts.Female} GIF
          workouts are grouped from their image names.
        </Text>
      </ImageBackground>

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        {(["Male", "Female"] as WorkoutGender[]).map((item) => (
          <Pressable accessibilityRole="button"
            key={item}
            onPress={() => setGender(item)}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: gender === item ? colors.primary : colors.border,
              borderRadius: radius.sm,
              padding: spacing.sm,
              backgroundColor:
                gender === item ? `${colors.primary}24` : colors.background,
            }}
          >
            <Text
              style={{
                ...typography.body,
                textAlign: "center",
                fontWeight: "700",
                color: gender === item ? colors.primary : colors.ink,
              }}
            >
              {item} ({genderExerciseCounts[item]})
            </Text>
          </Pressable>
        ))}
      </View>

      <View
        style={{
          minHeight: 46,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.sm,
          paddingHorizontal: spacing.md,
          backgroundColor: colors.background,
        }}
      >
        <Ionicons name="search-outline" size={18} color={colors.muted} />
        <TextInput
          value={exerciseSearch}
          onChangeText={setExerciseSearch}
          placeholder={`Search ${gender.toLowerCase()} workouts`}
          placeholderTextColor={colors.subtle}
          style={{ flex: 1, ...typography.body, color: colors.ink }}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.xs }}
      >
        {genderExerciseGroups.map((item) => (
          <Pressable accessibilityRole="button"
            key={item}
            onPress={() => setCategory(item)}
            style={{
              borderRadius: radius.pill,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              backgroundColor:
                category === item ? colors.primary : colors.surface,
            }}
          >
            <Text
              style={{
                ...typography.small,
                color: category === item ? "#fff" : colors.muted,
              }}
            >
              {item} ({genderExercisesByGroup[gender][item].length})
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
        {visibleExercises.map((item) => {
          const active = selectedKeys.has(`${item.gender}:${item.slug}`);
          return (
            <Pressable accessibilityRole="button"
              key={item.key}
              onPress={() => toggle(item)}
              style={{
                width: 126,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
                borderRadius: radius.sm,
                padding: spacing.xs,
                gap: spacing.xs,
                backgroundColor: active
                  ? `${colors.primary}24`
                  : colors.background,
              }}
            >
              <Image
                source={item.image}
                style={{
                  width: "100%",
                  height: 82,
                  borderRadius: radius.sm,
                  backgroundColor: colors.surface,
                }}
                resizeMode="contain"
              />
              <Text
                numberOfLines={2}
                style={{
                  ...typography.small,
                  color: active ? colors.primary : colors.ink,
                }}
              >
                {active ? "✓ " : ""}
                {item.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {visibleExercises.length === 0 ? (
        <Text style={{ ...typography.small, color: colors.muted }}>
          No workouts match this search in {category}.
        </Text>
      ) : null}

      {selected.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm }}
        >
          {selected.map((item) => {
            const exercise = item.gender
              ? genderExerciseLibrary[item.gender].find(
                  (candidate) =>
                    candidate.slug === item.exerciseId ||
                    candidate.title === item.name,
                )
              : undefined;
            return (
              <View
                key={`${item.gender ?? "Unisex"}:${item.exerciseId ?? item.name}`}
                style={{ width: 104, gap: spacing.xs }}
              >
                {exercise ? (
                  <Image
                    source={exercise.image}
                    style={{
                      width: 104,
                      height: 78,
                      borderRadius: radius.sm,
                      backgroundColor: colors.surface,
                    }}
                    resizeMode="contain"
                  />
                ) : null}
                <Text
                  numberOfLines={2}
                  style={{ ...typography.small, color: colors.ink }}
                >
                  {item.name}
                </Text>
                <Text style={{ ...typography.small, color: colors.muted }}>
                  {item.gender ?? "Existing"}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      ) : null}
      <Text style={{ ...typography.small, color: colors.muted }}>
        {selected.length} item{selected.length === 1 ? "" : "s"} selected.
        Gender, workout type, equipment, and image path are saved with each
        session.
      </Text>
    </View>
  ));
    }
  }
}

export function LoadingRowsView({ model }: { model: ReturnType<typeof useLoadingRowsPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles } = model.props;
      return ((
    <View style={styles.loadingList}>
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.loadingRow}>
          <View style={styles.loadingIcon} />
          <View style={styles.loadingBody}>
            <View style={styles.loadingLineWide} />
            <View style={styles.loadingLine} />
          </View>
        </View>
      ))}
    </View>
  ));
    }
  }
}
