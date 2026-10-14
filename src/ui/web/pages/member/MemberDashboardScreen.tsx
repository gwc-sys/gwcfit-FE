import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Image, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Screen } from "../../components/Screen";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { MemberWorkout } from "../../../../types/member";
import type * as React from "react";
import type { usePanelPresentation, useStatTilePresentation, useQuickActionTilePresentation, useStatusPillPresentation, useScheduleRowPresentation, useProgressCirclePresentation, useDashboardStatePresentation, useMemberDashboardScreenPresentation } from "../../../../screens/member/MemberDashboardScreen";

export function PanelView({ model }: { model: ReturnType<typeof usePanelPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, style, title, action, onAction, children } = model.props;
      return ((
    <View style={[styles.panel, style]}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>{title}</Text>
        {action ? (
          <Pressable accessibilityRole="button" onPress={onAction} style={({ pressed }) => pressed && styles.pressed}>
            <Text style={styles.panelAction}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  ));
    }
  }
}

export function StatTileView({ model }: { model: ReturnType<typeof useStatTilePresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, softColor, icon, color, value, label, subtitle, trend, isDown, ui } = model.props;
      return ((
    <View style={styles.statTile}>
      <View style={styles.statTopRow}>
        <View style={[styles.statIconBox, { backgroundColor: softColor }]}>
          <Ionicons name={icon} size={26} color={color} />
        </View>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statValue}>
          {value}
        </Text>
      </View>
      <Text numberOfLines={1} style={styles.statLabel}>
        {label}
      </Text>
      <Text numberOfLines={1} style={styles.statSubtitle}>
        {subtitle}
      </Text>
      {trend ? (
        <View style={styles.trendRow}>
          <Ionicons name={isDown ? "arrow-down-outline" : "arrow-up-outline"} size={14} color={isDown ? ui.danger : ui.success} />
          <Text style={[styles.trendText, isDown && styles.trendDown]}>{trend}</Text>
        </View>
      ) : null}
    </View>
  ));
    }
  }
}

export function QuickActionTileView({ model }: { model: ReturnType<typeof useQuickActionTilePresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onPress, styles, action, ui } = model.props;
      return ((
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressedLift]}>
      <View style={[styles.quickIconBox, { backgroundColor: action.softColor }]}>
        <Ionicons name={action.icon} size={27} color={action.color} />
      </View>
      <View style={styles.flex}>
        <Text numberOfLines={1} style={styles.quickTitle}>
          {action.title}
        </Text>
        <Text numberOfLines={1} style={styles.quickSubtitle}>
          {action.subtitle}
        </Text>
      </View>
      <View style={styles.chevronButton}>
        <Ionicons name="chevron-forward" size={18} color={ui.subtle} />
      </View>
    </Pressable>
  ));
    }
  }
}

export function StatusPillView({ model }: { model: ReturnType<typeof useStatusPillPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, done, label, ui } = model.props;
      return ((
    <View style={[styles.statusPill, done ? styles.statusDone : styles.statusUpcoming]}>
      <Text style={[styles.statusText, done ? styles.statusDoneText : styles.statusUpcomingText]}>{label}</Text>
      {done ? <Ionicons name="checkmark-circle-outline" size={15} color={ui.success} /> : null}
    </View>
  ));
    }
  }
}

export function ScheduleRowView({ model }: { model: ReturnType<typeof useScheduleRowPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, item, isLast, StatusPill } = model.props;
      return ((
    <View style={styles.scheduleRow}>
      <Text style={styles.scheduleTime}>{item.time}</Text>
      <View style={styles.timeline}>
        {!isLast ? <View style={styles.timelineLine} /> : null}
        <View style={[styles.timelineDot, { backgroundColor: item.color }]} />
      </View>
      <View style={[styles.scheduleIcon, { backgroundColor: item.softColor }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.scheduleCopy}>
        <Text numberOfLines={1} style={styles.scheduleTitle}>
          {item.title}
        </Text>
        <Text numberOfLines={1} style={styles.scheduleSubtitle}>
          {item.subtitle}
        </Text>
      </View>
      <StatusPill label={item.status} done={item.done} />
    </View>
  ));
    }
  }
}

export function ProgressCircleView({ model }: { model: ReturnType<typeof useProgressCirclePresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, size, radius, ui, strokeWidth, circumference, offset, progress } = model.props;
      return ((
    <View style={styles.progressCircle}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={ui.ringTrack} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ui.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.progressCenter}>
        <Text style={styles.progressPercent}>{progress}%</Text>
        <Text style={styles.progressLabel}>Goal Completed</Text>
      </View>
    </View>
  ));
    }
  }
}

export function DashboardStateView({ model }: { model: ReturnType<typeof useDashboardStatePresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, icon, ui, title, message, onRetry } = model.props;
      return ((
    <View style={styles.stateBanner}>
      <View style={styles.stateIcon}>
        <Ionicons name={icon} size={22} color={ui.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.stateTitle}>{title}</Text>
        <Text style={styles.stateMessage}>{message}</Text>
      </View>
      {onRetry ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  ));
    }
  }
}

export function MemberDashboardScreenView({ model }: { model: ReturnType<typeof useMemberDashboardScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { DashboardThemeContext, dashboardTheme, styles, isRefreshing, refreshAll, ui, isDesktop, memberName, navigateTo, unreadNotifications, isNarrow, dashboardQuery, DashboardState, dashboard, isTablet, statTiles, StatTile, statsScrollRef, MOBILE_STAT_SNAP_INTERVAL, activeStatIndexRef, Panel, quickActions, QuickActionTile, scheduleItems, ScheduleRow, ProgressCircle, goalProgress, completedWorkouts, workoutsTarget, clamp, caloriesTarget, formatNumber, monthlyCalories, caloriesProgress, upcomingWorkouts, achievements } = model.props;
      return ((
    <DashboardThemeContext.Provider value={dashboardTheme}>
    <Screen
      scroll
      noPadding
      style={styles.root}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} tintColor={ui.primary} />}
    >
      <View style={[styles.dashboard, isDesktop && styles.dashboardDesktop]}>
        {!isDesktop ? (
          <View style={styles.mobileBrand}>
            <View style={[styles.brandRow, styles.mobileBrandContent]}>
              <Ionicons name="pulse" size={32} color={ui.primary} />
              <Text style={styles.brandText}>PulseFit</Text>
              <View style={styles.mobileIdentityCopy}>
                <Text numberOfLines={1} style={styles.mobileIdentityName}>{memberName}</Text>
                <Text style={styles.mobileIdentityRole}>Member</Text>
              </View>
            </View>
            <View style={styles.mobileBrandActions}>
              <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => navigateTo("MemberNotifications")} style={styles.mobileSettingsButton}>
                <Ionicons name="notifications-outline" size={19} color={ui.primary} />
                {unreadNotifications.length > 0 ? <View style={styles.mobileNotificationDot} /> : null}
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Profile" onPress={() => navigateTo("MemberProfileHome")} style={styles.mobileSettingsButton}>
                <Ionicons name="person-outline" size={19} color={ui.primary} />
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={[styles.main, isNarrow && styles.mainNarrow]}>
          {dashboardQuery.isLoading ? <DashboardState title="Loading dashboard" message="Preparing your member workspace." icon="pulse-outline" /> : null}
          {dashboardQuery.error ? (
            <DashboardState title="Dashboard unavailable" message={getApiErrorMessage(dashboardQuery.error)} icon="alert-circle-outline" onRetry={() => dashboardQuery.refetch()} />
          ) : null}
          {!dashboardQuery.isLoading && !dashboardQuery.error && !dashboard ? (
            <DashboardState title="Dashboard data unavailable" message="No member dashboard data was returned. Pull to refresh or contact your gym administrator." icon="id-card-outline" onRetry={() => dashboardQuery.refetch()} />
          ) : null}

          {isTablet ? (
            <View style={[styles.statsGrid, styles.statsGridWide]}>
              {statTiles.map((item) => (
                <StatTile key={item.label} {...item} />
              ))}
            </View>
          ) : (
            <ScrollView
              ref={statsScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsScrollContent}
              snapToInterval={MOBILE_STAT_SNAP_INTERVAL}
              snapToAlignment="start"
              decelerationRate="fast"
              onMomentumScrollEnd={(event) => {
                activeStatIndexRef.current = Math.round(
                  event.nativeEvent.contentOffset.x / MOBILE_STAT_SNAP_INTERVAL
                );
              }}
              accessibilityLabel="Monthly fitness statistics"
            >
              {statTiles.map((item) => (
                <View key={item.label} style={styles.mobileStatTileWrapper}>
                  <StatTile {...item} />
                </View>
              ))}
            </ScrollView>
          )}

          <View style={[styles.middleGrid, isDesktop && styles.middleGridDesktop]}>
            <Panel title="Quick Actions" style={styles.quickPanel}>
              <View style={styles.quickGrid}>
                {quickActions.map((action) => (
                  <QuickActionTile key={action.title} action={action} onPress={() => navigateTo(action.route)} />
                ))}
              </View>
            </Panel>

            <Panel title="Today's Schedule" action="View full schedule" onAction={() => navigateTo("MemberClasses")} style={styles.schedulePanel}>
              <View style={styles.scheduleList}>
                {scheduleItems.length ? scheduleItems.map((item, index) => (
                  <ScheduleRow key={`${item.time}-${item.title}`} item={item} isLast={index === scheduleItems.length - 1} />
                )) : <Text style={styles.emptyPanelText}>No workout, meal, or class is scheduled today.</Text>}
              </View>
            </Panel>
          </View>

          <View style={[styles.lowerGrid, isDesktop && styles.lowerGridDesktop]}>
            <Panel title="Progress Overview" action="This Month" onAction={() => navigateTo("MemberProgress")} style={styles.progressPanel}>
              <View style={styles.progressCard}>
                <Text style={styles.progressCardTitle}>Workout Progress</Text>
                <View style={styles.progressMainRow}>
                  <ProgressCircle progress={goalProgress} />
                  <View style={styles.workoutProgressCopy}>
                    <Text style={styles.progressMuted}>Workouts Completed</Text>
                    <Text style={styles.completedText}>
                      {completedWorkouts} of {workoutsTarget}
                    </Text>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${workoutsTarget > 0 ? clamp(Math.round((completedWorkouts / workoutsTarget) * 100)) : 0}%` }]} />
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.calorieCard}>
                <View style={[styles.statIconBox, { backgroundColor: ui.softOrange }]}>
                  <Ionicons name="flame-outline" size={25} color={ui.warning} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.calorieTitle}>Calories Burned</Text>
                  <Text style={styles.calorieSubtitle}>
                    {caloriesTarget > 0 ? `${formatNumber(monthlyCalories)} / ${formatNumber(caloriesTarget)} kcal` : `${formatNumber(monthlyCalories)} kcal - no calorie goal set`}
                  </Text>
                  <View style={styles.calorieTrack}>
                    <View style={[styles.calorieFill, { width: `${caloriesProgress}%` }]} />
                  </View>
                </View>
                <Text style={styles.caloriePercent}>{caloriesProgress}%</Text>
              </View>
            </Panel>

            <Panel title="Upcoming Workouts" action="View all" onAction={() => navigateTo("MemberWorkout")} style={styles.workoutPanel}>
              <View style={styles.workoutList}>
                {upcomingWorkouts.length ? upcomingWorkouts.map((item) => (
                  <Pressable key={`${item.title}-${item.date}`} accessibilityRole="button" onPress={() => navigateTo("MemberWorkout")} style={({ pressed }) => [styles.workoutRow, pressed && styles.pressed]}>
                    <Image source={item.image} style={styles.workoutImage} />
                    <View style={styles.flex}>
                      <Text numberOfLines={1} style={styles.workoutTitle}>
                        {item.title}
                      </Text>
                      <Text numberOfLines={1} style={styles.workoutSubtitle}>
                        {item.subtitle}
                      </Text>
                      <View style={styles.workoutDateRow}>
                        <Ionicons name="calendar-outline" size={14} color={ui.muted} />
                        <Text numberOfLines={1} style={styles.workoutDate}>
                          {item.date}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.roundChevron}>
                      <Ionicons name="chevron-forward" size={19} color={ui.muted} />
                    </View>
                  </Pressable>
                )) : <Text style={styles.emptyPanelText}>No workout plans have been assigned.</Text>}
              </View>
            </Panel>

            <Panel title="Achievements" action="View all" onAction={() => navigateTo("MemberRewards")} style={styles.achievementPanel}>
              <View style={styles.achievementList}>
                {achievements.length ? achievements.map((item) => (
                  <View key={`${item.title}-${item.date}`} style={styles.achievementRow}>
                    <View style={[styles.achievementIcon, { backgroundColor: item.softColor }]}>
                      <Ionicons name={item.icon} size={27} color={item.color} />
                    </View>
                    <View style={styles.flex}>
                      <Text numberOfLines={1} style={styles.achievementTitle}>
                        {item.title}
                      </Text>
                      <Text numberOfLines={1} style={styles.achievementSubtitle}>
                        {item.subtitle}
                      </Text>
                      <Text numberOfLines={1} style={styles.achievementDate}>
                        {item.date}
                      </Text>
                    </View>
                    <Ionicons name="checkmark-circle-outline" size={21} color={ui.success} />
                  </View>
                )) : <Text style={styles.emptyPanelText}>No achievements have been earned yet.</Text>}
              </View>
            </Panel>
          </View>
        </View>
      </View>
    </Screen>
    </DashboardThemeContext.Provider>
  ));
    }
  }
}
