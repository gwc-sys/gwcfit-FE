import { useRef, useState } from "react";
import { Pressable } from "../../components/NativePressable";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Modal, RefreshControl, ScrollView, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { CameraView } from "expo-camera";
import { Screen } from "../../components/Screen";
import { getApiErrorMessage } from "../../../../services/api/client";
import type * as React from "react";
import type { useMemberAttendanceScreenPresentation, useStatCardPresentation, useActionCardPresentation, useHistoryRowPresentation } from "../../../../screens/member/MemberAttendanceScreen";

export function MemberAttendanceScreenView({ model }: { model: ReturnType<typeof useMemberAttendanceScreenPresentation> }): React.ReactNode {
  const [showAllHistory, setShowAllHistory] = useState(false);
  const scanInFlight = useRef(false);
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, query, colors, formatDate, error, data, compact, statsScrollRef, MOBILE_STAT_INTERVAL, statsIndexRef, StatCard, weeklyCount, openScanner, HistoryRow, scannerOpen, setScannerOpen, scanMutation, qrAction, setQrAction, qrToken, gymName, checkIn, checkOut, confirm } = model.props;
      return ((
    <Screen scroll noPadding contentContainerStyle={styles.screen} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={colors.primary} />}>
      <View style={styles.header}>
        <View><Text style={[styles.title, { color: colors.ink }]}>Attendance</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>Track check-ins, check-outs and attendance summary</Text></View>
        <View style={[styles.datePill, { borderColor: colors.border, backgroundColor: colors.card }]}><Ionicons name="calendar-outline" size={17} color={colors.textSecondary} /><Text style={[styles.dateText, { color: colors.ink }]}>{formatDate(new Date())}</Text><Ionicons name="chevron-down" size={15} color={colors.textSecondary} /></View>
      </View>

      {query.isLoading ? <ActivityIndicator size="large" color={colors.primary} /> : null}
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{getApiErrorMessage(error)}</Text> : null}
      {data ? <>
        {compact ? (
          <ScrollView
            ref={statsScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mobileStatsContent}
            snapToInterval={MOBILE_STAT_INTERVAL}
            snapToAlignment="start"
            decelerationRate="fast"
            onMomentumScrollEnd={(event) => { statsIndexRef.current = Math.round(event.nativeEvent.contentOffset.x / MOBILE_STAT_INTERVAL); }}
          >
            <StatCard mobile title="Today's Visits" value={`${data.today_visit_count} / ${data.daily_visit_limit}`} detail={data.today_status === "checked_in" ? "Currently checked in" : data.can_check_in ? "Ready for your next visit" : "Daily limit reached"} icon="calendar-number-outline" tone={colors.primary} colors={colors} />
            <StatCard mobile title="This Month" value={String(data.monthly_attendance_count)} detail={`${Math.round(data.attendance_percentage)}% Attendance`} icon="calendar-outline" tone={colors.success} colors={colors} />
            <StatCard mobile title="This Week" value={String(weeklyCount)} detail="Days Attended" icon="stopwatch-outline" tone={colors.info} colors={colors} />
            <StatCard mobile title="Missed Days" value={String(data.missed_days)} detail={data.missed_days ? "Keep going!" : "Keep it up! 🎉"} icon="calendar-clear-outline" tone={colors.warning} colors={colors} />
          </ScrollView>
        ) : (
          <View style={styles.statsGrid}>
            <StatCard title="Today's Visits" value={`${data.today_visit_count} / ${data.daily_visit_limit}`} detail={data.today_status === "checked_in" ? "Currently checked in" : data.can_check_in ? "Ready for your next visit" : "Daily limit reached"} icon="calendar-number-outline" tone={colors.primary} colors={colors} />
            <StatCard title="This Month" value={String(data.monthly_attendance_count)} detail={`${Math.round(data.attendance_percentage)}% Attendance`} icon="calendar-outline" tone={colors.success} colors={colors} />
            <StatCard title="This Week" value={String(weeklyCount)} detail="Days Attended" icon="stopwatch-outline" tone={colors.info} colors={colors} />
            <StatCard title="Missed Days" value={String(data.missed_days)} detail={data.missed_days ? "Keep going!" : "Keep it up! 🎉"} icon="calendar-clear-outline" tone={colors.warning} colors={colors} />
          </View>
        )}

        <View style={[styles.actionShell, { borderColor: colors.border }]}>
          <View style={[styles.actionCard, { backgroundColor: `${colors.primary}12` }]}><Ionicons name="scan-outline" size={48} color={colors.primary} /><Text style={[styles.actionTitle, { color: colors.ink }]}>Scan the gym's daily QR</Text><Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Each pair of scans completes one visit. You can visit up to {data.daily_visit_limit} times per day.</Text><Pressable accessibilityRole="button" disabled={!data.can_check_in && !data.can_check_out} onPress={openScanner} style={[styles.actionButton, { backgroundColor: colors.primary }, !data.can_check_in && !data.can_check_out && styles.disabled]} accessibilityState={{ disabled: !data.can_check_in && !data.can_check_out }}><Ionicons name="camera-outline" size={23} color="#fff" /><Text style={styles.actionButtonText}>{data.today_visit_count >= data.daily_visit_limit && !data.can_check_out ? "Daily limit reached" : "Open QR scanner"}</Text></Pressable></View>
        </View>

        <View style={styles.historyHeader}><Text style={[styles.historyTitle, { color: colors.ink }]}>Recent History</Text><Pressable accessibilityRole="button" accessibilityLabel="Toggle full attendance history" accessibilityState={{ expanded: showAllHistory }} onPress={() => setShowAllHistory(value => !value)} style={{ minHeight: 44, justifyContent: "center" }}><Text style={[styles.viewAll, { color: colors.primary }]}>{showAllHistory ? "Show less" : "View all"}</Text></Pressable></View>
        <View style={[styles.historyCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          {data.history.length ? data.history.slice(0, showAllHistory ? undefined : 6).map((record, index) => <HistoryRow key={record.attendance_uuid} record={record} last={index === (showAllHistory ? data.history.length : Math.min(data.history.length, 6)) - 1} colors={colors} />) : <Text style={[styles.empty, { color: colors.textSecondary }]}>No attendance history yet.</Text>}
        </View>
      </> : null}

      <Modal visible={scannerOpen} animationType="slide" onRequestClose={() => setScannerOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "#000" }}><CameraView style={{ flex: 1 }} facing="back" barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={scanMutation.isPending ? undefined : ({ data }) => {
          if (scanInFlight.current) return;
          scanInFlight.current = true;
          scanMutation.mutate(data, { onSettled: () => { scanInFlight.current = false; } });
        }} /><Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setScannerOpen(false)} style={{ position: "absolute", top: 50, right: 20, padding: 14, borderRadius: 30, backgroundColor: "rgba(0,0,0,.65)" }}><Ionicons name="close" size={28} color="#fff" /></Pressable><Text style={{ position: "absolute", bottom: 60, alignSelf: "center", color: "#fff", fontWeight: "800" }}>{scanMutation.isPending ? "Recording attendance…" : "Point at the reception QR code"}</Text></View>
      </Modal>

      <Modal visible={qrAction !== null} transparent animationType="fade" onRequestClose={() => setQrAction(null)}>
        <View style={styles.backdrop}><View style={[styles.qrModal, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close QR code" style={styles.close} onPress={() => setQrAction(null)}><Ionicons name="close" size={23} color={colors.textSecondary} /></Pressable>
          <Text style={[styles.qrTitle, { color: colors.ink }]}>{qrAction === "check_in" ? "Check In QR Code" : "Check Out QR Code"}</Text>
          <Text style={[styles.qrHelp, { color: colors.textSecondary }]}>Show this code to the gym attendance scanner.</Text>
          <View style={styles.qrFrame}>{qrToken ? <QRCode value={qrToken} size={210} backgroundColor="#FFFFFF" color="#050A12" /> : <ActivityIndicator size="large" color={colors.primary} />}</View>
          <Text style={[styles.qrGym, { color: colors.textSecondary }]}>{gymName}</Text>
          <Pressable accessibilityRole="button" disabled={checkIn.isPending || checkOut.isPending} onPress={confirm} style={[styles.confirmButton, { backgroundColor: qrAction === "check_in" ? colors.primary : colors.success }]} accessibilityState={{ disabled: checkIn.isPending || checkOut.isPending }}>
            {checkIn.isPending || checkOut.isPending ? <ActivityIndicator color="#FFFFFF" /> : <><Ionicons name="finger-print-outline" size={21} color="#FFFFFF" /><Text style={styles.confirmText}>Confirm on this device</Text></>}
          </Pressable>
        </View></View>
      </Modal>
    </Screen>
  ));
    }
  }
}

export function StatCardView({ model }: { model: ReturnType<typeof useStatCardPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, mobile, colors, tone, icon, title, value, detail } = model.props;
      return (<View style={[styles.statCard, mobile && styles.mobileStatCard, { borderColor: colors.border, backgroundColor: colors.card }]}><View style={styles.statTop}><View style={[styles.statIcon, { backgroundColor: `${tone}22` }]}><Ionicons name={icon} size={20} color={tone} /></View><Text style={[styles.statLabel, { color: colors.textSecondary }]}>{title}</Text></View><Text numberOfLines={1} style={[styles.statValue, { color: colors.ink }]}>{value}</Text><Text style={[styles.statDetail, { color: colors.textSecondary }]}>{detail}</Text></View>);
    }
  }
}

export function ActionCardView({ model }: { model: ReturnType<typeof useActionCardPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, color, icon, colors, title, subtitle, time, formatDate, enabled, onPress, gym } = model.props;
      return (<View style={[styles.actionCard, { backgroundColor: `${color}12` }]}><View style={styles.actionHeading}><View style={[styles.actionIcon, { borderColor: color, backgroundColor: `${color}25` }]}><Ionicons name={icon} size={25} color={color} /></View><View><Text style={[styles.actionTitle, { color: colors.ink }]}>{title}</Text><Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text></View></View><Text style={[styles.actionTime, { color: colors.ink }]}>{time}</Text><Text style={[styles.actionDate, { color: colors.textSecondary }]}>{formatDate(new Date())}</Text><Pressable accessibilityRole="button" disabled={!enabled} onPress={onPress} style={[styles.actionButton, { backgroundColor: color }, !enabled && styles.disabled]} accessibilityState={{ disabled: !enabled }}><Ionicons name="qr-code-outline" size={23} color="#FFFFFF" /><Text style={styles.actionButtonText}>Tap to {title}</Text></Pressable><View style={[styles.branch, { borderColor: `${color}99` }]}><Ionicons name="location-outline" size={14} color={color} /><Text numberOfLines={1} style={[styles.branchText, { color: colors.textSecondary }]}>{gym}</Text></View></View>);
    }
  }
}

export function HistoryRowView({ model }: { model: ReturnType<typeof useHistoryRowPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, last, colors, tone, checkedOut, formatDate, record, formatTime } = model.props;
      return (<View style={[styles.historyRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}><View style={[styles.historyIcon, { backgroundColor: `${tone}22` }]}><Ionicons name={checkedOut ? "log-out-outline" : "log-in-outline"} size={20} color={tone} /></View><View style={styles.historyCopy}><Text style={[styles.historyStatus, { color: tone }]}>{checkedOut ? "Checked Out" : "Checked In"}</Text><Text numberOfLines={1} style={[styles.historyMeta, { color: colors.textSecondary }]}>{formatDate(record.check_in_at)} • {formatTime(record.check_in_at)} • {record.gym_name ?? "Main Branch"}</Text></View><Text style={[styles.historyEnd, { color: colors.textSecondary }]}>{record.check_out_at ? formatTime(record.check_out_at) : "Active"}</Text></View>);
    }
  }
}
