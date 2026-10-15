import { Pressable } from "../../components/NativePressable";
import { controlMetrics } from "../../theme/theme";
import { showAlert } from "../../../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { Controller } from "react-hook-form";
import { FlatList, RefreshControl, Text, TextInput, View } from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { FormTextField } from "../../components/FormTextField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { getApiErrorMessage } from "../../../../services/api/client";
import { radius, spacing, typography } from "../../theme/theme";
import type { Gym } from "../../../../types/saas";
import type * as React from "react";
import type { useGymManagementPanelPresentation, useGymMetricPresentation, useGymDetailsPanelPresentation, useDetailMetricPresentation, useMyGymPanelPresentation, useGymFieldPresentation } from "../../../../features/operations/GymPanels";

type GymCreateFormValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
};

type GymUpdateFormValues = GymCreateFormValues & {
  settings: string;
  business_email: string;
  business_phone: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  description: string;
  facilities: string;
};

export function GymManagementPanelView({ model }: { model: ReturnType<typeof useGymManagementPanelPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, GymMetric, totalGyms, colors, setGymStatusFilter, gymStatusFilter, activeGyms, suspendedGyms, otherGyms, showForm, setShowForm, gymsQuery, setSearch, search, setSortDirection, sortDirection, closeForm, GymField, control, errors, createGymMutation, submit, notice, suspendGymMutation, deleteGymMutation, gyms, onSelectGym, confirmSuspend, confirmDelete, page, setPage } = model.props;
      return ((
    <>
      <View style={styles.metricGrid}>
        <GymMetric
          icon="business-outline"
          label="Total gyms"
          value={String(totalGyms)}
          color={colors.primaryDark}
          styles={styles}
          onPress={() => setGymStatusFilter("all")}
          active={gymStatusFilter === "all"}
        />
        <GymMetric
          icon="checkmark-circle-outline"
          label="Active gyms"
          value={String(activeGyms)}
          color="#46C77A"
          styles={styles}
          onPress={() => setGymStatusFilter("active")}
          active={gymStatusFilter === "active"}
        />
        <GymMetric
          icon="pause-circle-outline"
          label="Suspended gyms"
          value={String(suspendedGyms)}
          color="#F0B429"
          styles={styles}
          onPress={() => setGymStatusFilter("suspended")}
          active={gymStatusFilter === "suspended"}
        />
        <GymMetric
          icon="layers-outline"
          label="Other status"
          value={String(otherGyms)}
          color="#6EA8FE"
          styles={styles}
          onPress={() => setGymStatusFilter("other")}
          active={gymStatusFilter === "other"}
        />
      </View>
      <SurfacePanel
        kicker="Platform"
        title="Gym Management"
        icon="business-outline"
        actionLabel={showForm ? undefined : "New"}
        onAction={showForm ? undefined : () => setShowForm(true)}
      >
        <View style={styles.summaryRow}>
          <StatusBadge label={`${gymsQuery.data?.length ?? 0} loaded`} />
          <StatusBadge label="platform scope" tone="info" />
        </View>

        <View style={styles.toolbar}>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={20} color={colors.muted} />
            <TextInput
              autoCapitalize="none"
              onChangeText={setSearch}
              placeholder="Search gyms"
              placeholderTextColor={colors.subtle}
              style={styles.searchInput}
              value={search}
            />
            {search ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setSearch("")}
               accessibilityLabel={"Clear search"} style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="close-circle" size={20} color={colors.muted} />
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

        {showForm ? (
          <View style={styles.formBlock}>
            <View style={styles.formHeader}>
              <Text style={styles.blockTitle}>Create Gym</Text>
              <Pressable accessibilityLabel="Close"
                accessibilityRole="button"
                onPress={closeForm}
                style={styles.iconButton}
              >
                <Ionicons name="close" size={20} color={colors.ink} />
              </Pressable>
            </View>
            <GymField
              control={control}
              error={errors.name?.message}
              label="Name"
              leftIcon="business-outline"
              name="name"
              required
            />
            <GymField
              autoCapitalize="none"
              control={control}
              error={errors.email?.message}
              keyboardType="email-address"
              label="Email"
              leftIcon="mail-outline"
              name="email"
            />
            <GymField
              control={control}
              error={errors.phone?.message}
              keyboardType="phone-pad"
              label="Phone"
              leftIcon="call-outline"
              name="phone"
            />
            <GymField
              control={control}
              error={errors.address?.message}
              label="Address"
              leftIcon="location-outline"
              name="address"
            />
            <GymField
              control={control}
              error={errors.timezone?.message}
              label="Timezone"
              leftIcon="time-outline"
              name="timezone"
            />
            {createGymMutation.error ? (
              <Text style={styles.error}>
                {getApiErrorMessage(createGymMutation.error)}
              </Text>
            ) : null}
            <View style={styles.actionRow}>
              <PrimaryButton
                loading={createGymMutation.isPending}
                onPress={submit}
                title="Create Gym"
                style={styles.actionButton}
              />
              <PrimaryButton
                onPress={closeForm}
                title="Cancel"
                variant="secondary"
                style={styles.actionButton}
              />
            </View>
          </View>
        ) : null}

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        {gymsQuery.error ? (
          <Text style={styles.error}>
            {getApiErrorMessage(gymsQuery.error)}
          </Text>
        ) : null}
        {suspendGymMutation.error ? (
          <Text style={styles.error}>
            {getApiErrorMessage(suspendGymMutation.error)}
          </Text>
        ) : null}
        {deleteGymMutation.error ? (
          <Text style={styles.error}>
            {getApiErrorMessage(deleteGymMutation.error)}
          </Text>
        ) : null}

        <FlatList
          data={gyms}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            gymsQuery.isLoading ? (
              <Text style={styles.empty}>Loading gyms...</Text>
            ) : (
              <EmptyState
                icon="business-outline"
                title={search ? "No gyms match" : "No gyms yet"}
                message={
                  search
                    ? "Clear search or try another gym code."
                    : "Create a gym to start onboarding an owner."
                }
                actionLabel={search ? "Clear Search" : "Create Gym"}
                onAction={
                  search ? () => setSearch("") : () => setShowForm(true)
                }
              />
            )
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={gymsQuery.isFetching}
              onRefresh={() => gymsQuery.refetch()}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Pressable
                accessibilityRole="button"
                onPress={() => onSelectGym?.(item)}
                style={styles.rowMain}
              >
                <View style={styles.rowIcon}>
                  <Ionicons
                    name="business-outline"
                    size={20}
                    color={colors.primaryDark}
                  />
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{item.name}</Text>
                  <Text style={styles.rowMeta}>{item.code}</Text>
                  <StatusBadge
                    label={item.status}
                    tone={item.status === "active" ? "success" : "warning"}
                  />
                </View>
              </Pressable>
              <View style={styles.rowActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => confirmSuspend(item)}
                  style={styles.iconButton}
                 accessibilityLabel={"Suspend gym"}>
                  <Ionicons
                    name="pause-circle-outline"
                    size={19}
                    color={colors.ink}
                  />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => confirmDelete(item)}
                  style={styles.iconButton}
                 accessibilityLabel={"Delete record"}>
                  <Ionicons
                    name="trash-outline"
                    size={19}
                    color={colors.danger}
                  />
                </Pressable>
              </View>
            </View>
          )}
          scrollEnabled={false}
        />
        <View style={styles.pagination}>
          <PrimaryButton
            disabled={page === 0 || gymsQuery.isFetching}
            onPress={() => setPage((value) => Math.max(0, value - 1))}
            title="Previous"
            variant="secondary"
            style={styles.pageButton}
          />
          <Text style={styles.pageLabel}>Page {page + 1}</Text>
          <PrimaryButton
            disabled={
              (gymsQuery.data?.length ?? 0) < 50 || gymsQuery.isFetching
            }
            onPress={() => setPage((value) => value + 1)}
            title="Next"
            variant="secondary"
            style={styles.pageButton}
          />
        </View>
      </SurfacePanel>
    </>
  ));
    }
  }
}

export function GymMetricView({ model }: { model: ReturnType<typeof useGymMetricPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onPress, styles, active, color, icon, value, label } = model.props;
      return ((
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.metricCard, active && styles.metricCardActive]}
    >
      <View style={[styles.metricIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={21} color={color} />
      </View>
      <View>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricLive}>↑ Live data</Text>
      </View>
    </Pressable>
  ));
    }
  }
}

export function GymDetailsPanelView({ model }: { model: ReturnType<typeof useGymDetailsPanelPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, colors, gym, DetailMetric, usersQuery, activeMembers, plansQuery, expiringSoon, trial, trialProgress, trialCompletedDays, trialRemainingDays, trialEndsAt, monthStart, leadingDays, monthDays, expiryByDay, trialDayState, daysRemaining, dateLabel, paymentsQuery } = model.props;
      return ((
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="business" size={24} color={colors.primaryDark} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>{gym.name}</Text>
          <Text style={styles.heroMeta}>
            {gym.code} · {gym.address || "Platform tenant"}
          </Text>
        </View>
        <StatusBadge
          label={gym.status}
          tone={gym.status === "active" ? "success" : "warning"}
        />
      </View>

      <View style={styles.metrics}>
        <DetailMetric
          label="Total users"
          value={String(usersQuery.data?.length ?? 0)}
          icon="people-outline"
          color={colors.primaryDark}
        />
        <DetailMetric
          label="Active members"
          value={String(activeMembers.length)}
          icon="fitness-outline"
          color="#46C77A"
        />
        <DetailMetric
          label="Subscriptions"
          value={String(plansQuery.data?.length ?? 0)}
          icon="card-outline"
          color="#6EA8FE"
        />
        <DetailMetric
          label="Expiring in 10 days"
          value={String(expiringSoon.length)}
          icon="notifications-outline"
          color="#F0B429"
        />
      </View>

      {expiringSoon.length > 0 ? (
        <View style={styles.alert}>
          <Ionicons name="alert-circle-outline" size={21} color="#F0B429" />
          <View style={styles.alertCopy}>
            <Text style={styles.alertTitle}>Renewal reminders</Text>
            <Text style={styles.alertText}>
              {expiringSoon.length} member subscription
              {expiringSoon.length === 1 ? "" : "s"} expire within the next 10
              days.
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.trialCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Platform free trial</Text>
            <Text style={styles.cardSubtitle}>
              {trial?.status === "trialing"
                ? "This gym is using the 30-day free trial"
                : trial
                  ? `Subscription status: ${trial.status}`
                  : "No platform subscription found"}
            </Text>
          </View>
          <StatusBadge
            label={
              trial?.status === "trialing"
                ? "Free trial"
                : trial?.status || "Not started"
            }
            tone={trial?.status === "trialing" ? "success" : "warning"}
          />
        </View>
        {trial?.status === "trialing" ? (
          <>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${trialProgress}%` }]}
              />
            </View>
            <View style={styles.trialStats}>
              <Text style={styles.trialStat}>
                <Text style={styles.trialStrong}>{trialCompletedDays}</Text>{" "}
                days completed
              </Text>
              <Text style={styles.trialStat}>
                <Text style={styles.trialStrong}>{trialRemainingDays}</Text>{" "}
                days remaining
              </Text>
              <Text style={styles.trialStat}>
                Ends{" "}
                {trialEndsAt?.toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          </>
        ) : null}
      </View>

      <View style={styles.columns}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>User list</Text>
            <Text style={styles.cardCount}>
              {usersQuery.data?.length ?? 0} users
            </Text>
          </View>
          {usersQuery.isLoading ? (
            <Text style={styles.muted}>Loading users...</Text>
          ) : (
            (usersQuery.data ?? []).map((user) => (
              <View key={user.id} style={styles.listRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user.full_name.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.listBody}>
                  <Text style={styles.listTitle}>{user.full_name}</Text>
                  <Text style={styles.listMeta}>{user.email}</Text>
                </View>
                <StatusBadge label={user.role.replace("_", " ")} tone="info" />
              </View>
            ))
          )}
          {!usersQuery.isLoading && (usersQuery.data ?? []).length === 0 ? (
            <Text style={styles.muted}>No users linked to this gym.</Text>
          ) : null}
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Subscriptions</Text>
            <Text style={styles.cardCount}>
              {plansQuery.data?.length ?? 0} plans
            </Text>
          </View>
          {(plansQuery.data ?? []).map((plan) => (
            <View key={plan.id} style={styles.planRow}>
              <View>
                <Text style={styles.listTitle}>{plan.name}</Text>
                <Text style={styles.listMeta}>
                  {plan.duration_days} days · {plan.currency}{" "}
                  {(plan.price_cents / 100).toLocaleString()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={colors.muted} />
            </View>
          ))}
          {plansQuery.data?.length === 0 ? (
            <Text style={styles.muted}>No subscription plans found.</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Subscription calendar</Text>
            <Text style={styles.cardSubtitle}>
              Days marked in yellow have a membership ending
            </Text>
          </View>
          <Text style={styles.month}>
            {monthStart.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
        <View style={styles.trialCalendarSummary}>
          <Text style={styles.trialCalendarText}>
            <Text style={styles.completedText}>
              {trialCompletedDays} completed
            </Text>
            <Text style={styles.trialCalendarText}> · </Text>
            <Text style={styles.remainingText}>
              {trialRemainingDays} remaining
            </Text>
          </Text>
          <View style={styles.calendarLegend}>
            <View style={[styles.legendDot, styles.completedDot]} />
            <Text style={styles.legendText}>Completed</Text>
            <View style={[styles.legendDot, styles.remainingDot]} />
            <Text style={styles.legendText}>Remaining</Text>
          </View>
        </View>
        <View style={styles.weekRow}>
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <Text key={`${day}-${index}`} style={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.calendar}>
          {Array.from({ length: leadingDays + monthDays }, (_, index) => {
            const day = index - leadingDays + 1;
            const key =
              day > 0
                ? `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                : `blank-${index}`;
            const marked = expiryByDay.has(key);
            const state = trialDayState(day);
            return (
              <View
                key={key}
                style={[
                  styles.day,
                  day <= 0 ? styles.emptyDay : null,
                  marked ? styles.markedDay : null,
                  state === "completed" ? styles.completedDay : null,
                  state === "remaining" ? styles.remainingDay : null,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    marked || state !== "none" ? styles.markedText : null,
                  ]}
                >
                  {day > 0 ? day : ""}
                </Text>
                {state !== "none" ? (
                  <Text style={styles.dayLabel}>
                    {state === "completed" ? "done" : "left"}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
        <View style={styles.validityBlock}>
          <Text style={styles.validityTitle}>Membership validity</Text>
          {activeMembers
            .filter((member) => member.membership_ends_at)
            .slice(0, 6)
            .map((member) => {
              const remaining = daysRemaining(member.membership_ends_at);
              return (
                <View key={member.id} style={styles.validityRow}>
                  <Text style={styles.listTitle}>
                    {member.member_name ||
                      `${member.first_name} ${member.last_name}`}
                  </Text>
                  <Text
                    style={[
                      styles.validityText,
                      remaining !== null && remaining <= 10
                        ? styles.warningText
                        : null,
                    ]}
                  >
                    {remaining !== null && remaining >= 0
                      ? `${remaining} days left · ${dateLabel(member.membership_ends_at)}`
                      : "Expired"}
                  </Text>
                </View>
              );
            })}
          {activeMembers.filter((member) => member.membership_ends_at)
            .length === 0 ? (
            <Text style={styles.muted}>
              No active membership end dates recorded.
            </Text>
          ) : null}
        </View>
        {paymentsQuery.data?.length ? (
          <Text style={styles.footerNote}>
            {paymentsQuery.data.length} payment records available for this gym.
          </Text>
        ) : null}
      </View>
    </View>
  ));
    }
  }
}

export function DetailMetricView({ model }: { model: ReturnType<typeof useDetailMetricPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { colors, icon, color, value, label } = model.props;
      return ((
    <View
      style={{
        flex: 1,
        minWidth: 145,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        backgroundColor: colors.surface,
      }}
    >
      <Ionicons name={icon} size={20} color={color} />
      <Text
        style={{ ...typography.h2, color: colors.ink, marginTop: spacing.sm }}
      >
        {value}
      </Text>
      <Text style={{ ...typography.small, color: colors.muted }}>{label}</Text>
    </View>
  ));
    }
  }
}

export function MyGymPanelView({ model }: { model: ReturnType<typeof useMyGymPanelPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { myGymQuery, styles, GymField, control, errors, colors, setValue, setNotice, updateMyGymMutation, notice, submit } = model.props;
      return ((
    <SurfacePanel kicker="Gym Owner" title="My Gym" icon="settings-outline">
      {myGymQuery.data ? (
        <View style={styles.summaryRow}>
          <StatusBadge label={myGymQuery.data.code} tone="info" />
          <StatusBadge
            label={myGymQuery.data.status}
            tone={myGymQuery.data.status === "active" ? "success" : "warning"}
          />
        </View>
      ) : null}
      {myGymQuery.isLoading ? (
        <Text style={styles.empty}>Loading gym...</Text>
      ) : null}
      {myGymQuery.error ? (
        <Text style={styles.error}>{getApiErrorMessage(myGymQuery.error)}</Text>
      ) : null}
      <View style={styles.formBlock}>
        <GymField
          control={control}
          error={errors.name?.message}
          label="Name"
          leftIcon="business-outline"
          name="name"
        />
        <GymField
          autoCapitalize="none"
          control={control}
          error={errors.email?.message}
          keyboardType="email-address"
          label="Email"
          leftIcon="mail-outline"
          name="email"
        />
        <GymField
          control={control}
          error={errors.phone?.message}
          keyboardType="phone-pad"
          label="Phone"
          leftIcon="call-outline"
          name="phone"
        />
        <GymField
          control={control}
          error={errors.address?.message}
          label="Address"
          leftIcon="location-outline"
          name="address"
        />
        <GymField
          control={control}
          error={errors.timezone?.message}
          label="Timezone"
          leftIcon="time-outline"
          name="timezone"
        />
        <View style={styles.discoveryHeading}>
          <View style={styles.discoveryIcon}><Ionicons name="navigate-outline" size={22} color={colors.primary} /></View>
          <View style={styles.discoveryCopy}><Text style={styles.discoveryTitle}>Gym discovery profile</Text><Text style={styles.discoveryText}>This business information and location help nearby members find your gym. Your private owner details are not published.</Text></View>
        </View>
        <View style={styles.fieldGrid}>
          <GymField autoCapitalize="none" control={control} error={errors.business_email?.message} keyboardType="email-address" label="Public business email" leftIcon="mail-outline" name="business_email" />
          <GymField control={control} error={errors.business_phone?.message} keyboardType="phone-pad" label="Public business phone" leftIcon="call-outline" name="business_phone" />
          <GymField control={control} error={errors.city?.message} label="City" leftIcon="business-outline" name="city" />
          <GymField control={control} error={errors.state?.message} label="State" leftIcon="map-outline" name="state" />
          <GymField control={control} error={errors.pincode?.message} label="Pincode" leftIcon="pin-outline" name="pincode" />
        </View>
        <View style={styles.fieldGrid}>
          <GymField autoCapitalize="none" control={control} error={errors.latitude?.message} label="Latitude" leftIcon="locate-outline" name="latitude" />
          <GymField autoCapitalize="none" control={control} error={errors.longitude?.message} label="Longitude" leftIcon="locate-outline" name="longitude" />
        </View>
        <PrimaryButton variant="secondary" icon="navigate-outline" title="Use current location" onPress={() => {
          const geolocation = globalThis.navigator?.geolocation;
          if (!geolocation) { showAlert("Location unavailable", "Location access is not supported on this device."); return; }
          geolocation.getCurrentPosition(
            ({ coords }) => { setValue("latitude", coords.latitude.toFixed(6), { shouldDirty: true }); setValue("longitude", coords.longitude.toFixed(6), { shouldDirty: true }); setNotice("Current coordinates added. Review the address, then save your gym."); },
            () => showAlert("Location not available", "Allow location access and try again."),
            { enableHighAccuracy: true, timeout: 10000 },
          );
        }} />
        <GymField control={control} error={errors.description?.message} label="Public gym description" leftIcon="document-text-outline" multiline name="description" />
        <GymField control={control} error={errors.facilities?.message} label="Facilities (comma separated)" leftIcon="barbell-outline" name="facilities" />
        {updateMyGymMutation.error ? (
          <Text style={styles.error}>
            {getApiErrorMessage(updateMyGymMutation.error)}
          </Text>
        ) : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <PrimaryButton
          loading={updateMyGymMutation.isPending}
          onPress={submit}
          title="Save Gym"
        />
      </View>
    </SurfacePanel>
  ));
    }
  }
}

export function GymFieldView<T extends GymCreateFormValues | GymUpdateFormValues>({ model }: { model: ReturnType<typeof useGymFieldPresentation<T>> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { control, name, autoCapitalize, error, keyboardType, label, leftIcon, multiline, required } = model.props;
      return ((
    <Controller
      control={control}
      name={name}
      render={({ field: { onBlur, onChange, value } }) => (
        <FormTextField
          autoCapitalize={autoCapitalize}
          error={error}
          keyboardType={keyboardType}
          label={label}
          leftIcon={leftIcon}
          multiline={multiline}
          onBlur={onBlur}
          onChangeText={onChange}
          placeholder={label}
          required={required}
          value={String(value ?? "")}
        />
      )}
    />
  ));
    }
  }
}
