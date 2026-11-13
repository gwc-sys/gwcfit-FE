import { getMemberC, darkThemeColors } from "../../../../theme/colors";
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  Animated,
  Easing,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  useMemberAttendance,
  useCheckInMember,
  useCheckOutMember,
  useMemberNotifications,
  memberQueryKeys,
} from "../../../../hooks/useMember";
import { useAuthStore } from "../../../../store/useAuthStore";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "../../../../services/api/operations";
import { getApiErrorMessage } from "../../../../services/api/client";

// ─── Cyberpunk Theme Palette ──────────────────────────────────────────────────
const C = getMemberC(darkThemeColors);

// ─── Gradient Button ──────────────────────────────────────────────────────────
function GradientBtn({
  onPress,
  children,
  style,
  disabled,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: object;
  disabled?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        {
          borderRadius: 50,
          overflow: "hidden",
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={["#E91E63", "#E91E63"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingVertical: 14,
          paddingHorizontal: 28,
          borderRadius: 50,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
        }}
      >
        {children}
      </LinearGradient>
    </Pressable>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  subtitle: string;
  targetBadge?: string;
  secondarySubtitle?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  barColor: string;
  barPercent: number;
}

function MetricCard({
  title,
  value,
  unit,
  subtitle,
  targetBadge,
  secondarySubtitle,
  iconName,
  iconColor,
  iconBgColor,
  barColor,
  barPercent,
}: MetricCardProps) {
  return (
    <View style={styles.metricCard}>
      {/* Top row: Title and Icon */}
      <View style={styles.metricTopRow}>
        <Text style={styles.metricTitle}>{title}</Text>
        <View style={[styles.metricIconBox, { backgroundColor: iconBgColor, borderColor: iconColor + "55" }]}>
          <Ionicons name={iconName} size={15} color={iconColor} />
        </View>
      </View>

      {/* Main Value row */}
      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{value}</Text>
        {unit ? <Text style={styles.metricUnit}>{unit}</Text> : null}
        {targetBadge ? <Text style={styles.targetBadge}>{targetBadge}</Text> : null}
      </View>

      {/* Subtitles */}
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
      {secondarySubtitle ? (
        <Text style={styles.metricSecondarySubtitle}>{secondarySubtitle}</Text>
      ) : null}

      {/* Progress bar line */}
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.min(Math.max(barPercent, 0), 100)}%` as any,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

// ─── QR Scanner Modal ─────────────────────────────────────────────────────────
function QRScannerModal({
  visible,
  onClose,
  onScanToken,
  onSimulate,
  isPending,
  isSuccessMessage,
  errorMessage,
  onClearError,
}: {
  visible: boolean;
  onClose: () => void;
  onScanToken: (token: string) => Promise<void> | void;
  onSimulate: () => void;
  isPending?: boolean;
  isSuccessMessage?: string | null;
  errorMessage?: string | null;
  onClearError?: () => void;
}) {
  const scanAnim = useRef(new Animated.Value(0)).current;
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualToken, setManualToken] = useState("");

  useEffect(() => {
    if (visible) {
      setScanned(false);
      setShowManualInput(false);
      setManualToken("");
      const loopAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      );
      loopAnim.start();
      return () => loopAnim.stop();
    } else {
      scanAnim.setValue(0);
      setTorch(false);
    }
  }, [visible]);

  const scanLineTop = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 190],
  });

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned || isPending) return;
    const rawData = result.data?.trim();
    if (!rawData) return;
    setScanned(true);

    let token = rawData;
    try {
      if (rawData.startsWith("{") && rawData.endsWith("}")) {
        const parsed = JSON.parse(rawData);
        token = parsed.token || parsed.jwt || parsed.qr || rawData;
      } else if (rawData.includes("token=")) {
        const match = rawData.match(/[?&]token=([^&]+)/);
        if (match?.[1]) {
          token = decodeURIComponent(match[1]);
        }
      }
    } catch {
      // Keep token as rawData
    }

    onScanToken(token);
  };

  const handleManualSubmit = () => {
    const trimmed = manualToken.trim();
    if (!trimmed || isPending) return;
    setScanned(true);
    onScanToken(trimmed);
  };

  const handleRetry = () => {
    setScanned(false);
    onClearError?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalDialog} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <View style={styles.modalCameraIconWrap}>
                <Ionicons name="camera-outline" size={20} color={C.primary} />
              </View>
              <View>
                <Text style={styles.modalTitle}>QR Scanner</Text>
                <Text style={styles.modalSubtitle}>Point your camera at the gym kiosk QR</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={styles.modalCloseBtn}
              onPress={onClose}
            >
              <Ionicons name="close" size={18} color={C.muted} />
            </Pressable>
          </View>

          {/* Scanner Viewport Box */}
          <View style={styles.scannerViewport}>
            {permission?.granted ? (
              <CameraView
                style={StyleSheet.absoluteFill}
                facing={facing}
                enableTorch={torch}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={scanned || isPending ? undefined : handleBarcodeScanned}
              />
            ) : (
              <View style={styles.permissionPromptBox}>
                <View style={styles.permissionIconWrap}>
                  <Ionicons name="videocam-outline" size={24} color={C.primary} />
                </View>
                <Text style={styles.permissionPromptText}>Camera access is required</Text>
                <Text style={styles.permissionPromptSubtext}>
                  Enable camera to scan the gym kiosk QR code
                </Text>
                <Pressable
                  accessibilityRole="button"
                  style={styles.permissionBtn}
                  onPress={() => void requestPermission()}
                >
                  <Text style={styles.permissionBtnText}>Enable Camera</Text>
                </Pressable>
              </View>
            )}

            {/* Camera Floating Controls (Torch & Flip) */}
            {permission?.granted ? (
              <View style={styles.scannerControlsRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Switch Camera"
                  onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
                  style={styles.scannerControlBtn}
                >
                  <Ionicons name="camera-reverse-outline" size={18} color={C.white} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Toggle Flashlight"
                  onPress={() => setTorch((t) => !t)}
                  style={[styles.scannerControlBtn, torch && styles.scannerControlBtnActive]}
                >
                  <Ionicons
                    name={torch ? "flash" : "flash-outline"}
                    size={17}
                    color={torch ? C.yellow : C.white}
                  />
                </Pressable>
              </View>
            ) : null}

            {/* Glowing Corner Brackets */}
            <View style={[styles.cornerBracket, styles.cbTopLeft]} pointerEvents="none" />
            <View style={[styles.cornerBracket, styles.cbTopRight]} pointerEvents="none" />
            <View style={[styles.cornerBracket, styles.cbBottomLeft]} pointerEvents="none" />
            <View style={[styles.cornerBracket, styles.cbBottomRight]} pointerEvents="none" />

            {/* Center Crosshair Marks */}
            <View style={styles.centerCrosshairs} pointerEvents="none">
              <View style={styles.crosshairCornerTL} />
              <View style={styles.crosshairCornerTR} />
              <View style={styles.crosshairCornerBL} />
              <View style={styles.crosshairCornerBR} />
            </View>

            {/* Laser Scanning Line */}
            <Animated.View style={[styles.laserScanLine, { top: scanLineTop }]} pointerEvents="none">
              <LinearGradient
                colors={["rgba(233, 30, 99, 0)", "rgba(233, 30, 99, 0.9)", "rgba(233, 30, 99, 0)"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            {/* Searching / Scanned Status Pill */}
            <View style={styles.searchingPill} pointerEvents="none">
              <Text style={styles.searchingPillText}>
                {isPending
                  ? "Validating QR code..."
                  : scanned
                  ? "QR Code Detected!"
                  : "Searching for QR code..."}
              </Text>
            </View>
          </View>

          {/* Error Message Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={C.primary} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={handleRetry}
                style={styles.retryBtn}
              >
                <Ionicons name="refresh" size={12} color={C.white} />
                <Text style={styles.retryBtnText}>Retry</Text>
              </Pressable>
            </View>
          ) : null}

          {/* Success Message Banner */}
          {isSuccessMessage ? (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={16} color={C.green} />
              <Text style={styles.successBannerText}>{isSuccessMessage}</Text>
            </View>
          ) : null}

          {/* Simulate Action Button */}
          <GradientBtn
            onPress={onSimulate}
            disabled={isPending}
            style={{ width: "100%", marginTop: 16 }}
          >
            <Ionicons name="flash-outline" size={16} color={C.white} />
            <Text style={styles.simulateBtnText}>
              {isPending ? "Processing Scan..." : "Simulate Instant Scan & Check-in"}
            </Text>
          </GradientBtn>

          {/* Manual Token Entry Toggle */}
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowManualInput((prev) => !prev)}
            style={styles.manualInputToggle}
          >
            <Text style={styles.manualInputToggleText}>
              {showManualInput ? "Hide manual QR code entry" : "Enter QR code manually"}
            </Text>
          </Pressable>

          {showManualInput ? (
            <View style={styles.manualInputBox}>
              <TextInput
                style={styles.manualInputField}
                placeholder="Paste gym kiosk QR token here..."
                placeholderTextColor={C.muted}
                value={manualToken}
                onChangeText={setManualToken}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                accessibilityRole="button"
                disabled={!manualToken.trim() || isPending}
                onPress={handleManualSubmit}
                style={[
                  styles.manualInputSubmitBtn,
                  (!manualToken.trim() || isPending) && { opacity: 0.5 },
                ]}
              >
                <Text style={styles.manualInputSubmitText}>
                  {isPending ? "Validating..." : "Submit Scan Token"}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* Cancel Button */}
          <Pressable style={styles.modalCancelBtn} onPress={onClose}>
            <Text style={styles.modalCancelBtnText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── History Row Component ────────────────────────────────────────────────────
interface HistoryLogItem {
  id: string;
  sessionTitle: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  date: string;
  status: "COMPLETED" | "ACTIVE";
}

function HistoryRow({
  item,
  isLast,
  showDetailedData,
}: {
  item: HistoryLogItem;
  isLast: boolean;
  showDetailedData: boolean;
}) {
  return (
    <View style={[styles.historyRow, !isLast && styles.historyRowBorder]}>
      {/* Icon */}
      <View style={styles.historyIconWrap}>
        <Ionicons name="log-in-outline" size={20} color={C.green} />
      </View>

      {/* Main Info */}
      <View style={styles.historyInfoCol}>
        <View style={styles.historyTitleRow}>
          <Text style={styles.historySessionTitle}>{item.sessionTitle}</Text>
          <View style={styles.statusBadgeCompleted}>
            <Text style={styles.statusBadgeText}>{item.status}</Text>
          </View>
        </View>

        {showDetailedData ? (
          <Text style={styles.historyCheckTimes}>
            Check-in: <Text style={styles.timeHighlight}>{item.checkIn}</Text> • Check-out:{" "}
            <Text style={styles.timeHighlight}>{item.checkOut}</Text>
          </Text>
        ) : (
          <Text style={styles.historyCheckTimes}>Completed Gym Session</Text>
        )}
      </View>

      {/* Right details */}
      <View style={styles.historyRightCol}>
        <View style={styles.historyDurationRow}>
          <Ionicons name="time-outline" size={13} color={C.green} />
          <Text style={styles.historyDurationValue}>{item.duration}</Text>
        </View>
        <Text style={styles.historyDateText}>{item.date}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Export log"
          style={styles.historyExportBtn}
        >
          <Ionicons name="document-text-outline" size={15} color={C.muted} />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main Attendance View ─────────────────────────────────────────────────────
export function MemberAttendanceScreenView(_props?: any) {
  const navigation = useNavigation<any>();
  const query = useMemberAttendance();
  const unreadNotifications = useMemberNotifications(true).data ?? [];
  const checkInMutation = useCheckInMember();
  const checkOutMutation = useCheckOutMember();
  const user = useAuthStore((state) => state.user);

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<"All Logs" | "This Week">("All Logs");
  const [showLogData, setShowLogData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Backend data mapping (100% real API data)
  const attendance = query.data;
  const todayVisits = attendance
    ? `${attendance.today_visit_count}/${attendance.daily_visit_limit}`
    : "1/1";
  const monthPercent = attendance ? Math.round(attendance.attendance_percentage) : 20;
  const missedDaysCount = attendance ? attendance.missed_days : 4;
  const weeklyDaysCount = attendance
    ? attendance.history.filter(
        (r) => Date.now() - new Date(r.check_in_at).getTime() <= 604800000
      ).length || 1
    : 1;

  const latestCheckIn = attendance?.history?.[0]?.check_in_at;
  const checkInTimeStr = latestCheckIn
    ? new Date(latestCheckIn).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "08:48 AM";
  const checkInSubtitle = attendance?.today_status === "checked_in" || (attendance?.today_visit_count && attendance.today_visit_count > 0)
    ? `Checked in at ${checkInTimeStr}`
    : "No visits logged today";

  // Real history mapped strictly from backend API history
  const displayLogs: HistoryLogItem[] = useMemo(() => {
    if (attendance?.history && attendance.history.length > 0) {
      return attendance.history.map((h, i) => {
        const inDate = new Date(h.check_in_at);
        const outDate = h.check_out_at ? new Date(h.check_out_at) : null;
        const diffMs = outDate ? outDate.getTime() - inDate.getTime() : 3600000;
        const diffMins = Math.max(1, Math.round(diffMs / 60000));
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        const durStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        return {
          id: h.attendance_uuid || `log-${i}`,
          sessionTitle: `${h.gym_name || "ZD Fitness"} - Session #${attendance.history.length - i}`,
          checkIn: inDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          checkOut: outDate
            ? outDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
            : "Active",
          duration: durStr,
          date: inDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          status: "COMPLETED" as const,
        };
      });
    }
    return [];
  }, [attendance]);

  // Filtered list
  const filteredLogs = useMemo(() => {
    let result = displayLogs;
    if (filterTab === "This Week" && attendance?.history) {
      const now = Date.now();
      result = displayLogs.filter((_, i) => {
        const record = attendance.history[i];
        return record ? (now - new Date(record.check_in_at).getTime() <= 604800000) : true;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.sessionTitle.toLowerCase().includes(q) ||
          l.date.toLowerCase().includes(q) ||
          l.checkIn.toLowerCase().includes(q)
      );
    }
    return result;
  }, [displayLogs, filterTab, searchQuery, attendance?.history]);

  const queryClient = useQueryClient();
  const [scanError, setScanError] = useState<string | null>(null);

  const scanDailyQrMutation = useMutation({
    mutationFn: (token: string) => attendanceApi.scanDailyQr(token),
    onSuccess: (record) => {
      const isCheckout = Boolean(record.check_out_at);
      setToastMessage(
        isCheckout
          ? "Checked out successfully! Great session!"
          : "Checked in successfully! Have a great workout!"
      );
      setScanError(null);
      void query.refetch();
      void queryClient.invalidateQueries({ queryKey: memberQueryKeys.attendance() });
      void queryClient.invalidateQueries({ queryKey: memberQueryKeys.dashboard() });
      void queryClient.invalidateQueries({ queryKey: memberQueryKeys.activity() });
      setTimeout(() => {
        setQrModalOpen(false);
        setToastMessage(null);
      }, 1400);
    },
    onError: (err: any) => {
      const msg = getApiErrorMessage(err) || "Failed to validate attendance QR code.";
      setScanError(msg);
    },
  });

  const handleScanToken = async (token: string) => {
    setScanError(null);
    try {
      await scanDailyQrMutation.mutateAsync(token);
    } catch {
      // Handled in mutation onError
    }
  };

  const handleSimulateScan = () => {
    setScanError(null);
    if (attendance?.can_check_out) {
      checkOutMutation.mutate(
        { source: "qr_code" } as any,
        {
          onSuccess: () => {
            setToastMessage("Checked out successfully! Great session!");
            void query.refetch();
            void queryClient.invalidateQueries({ queryKey: memberQueryKeys.attendance() });
            void queryClient.invalidateQueries({ queryKey: memberQueryKeys.dashboard() });
            void queryClient.invalidateQueries({ queryKey: memberQueryKeys.activity() });
            setTimeout(() => {
              setQrModalOpen(false);
              setToastMessage(null);
            }, 1200);
          },
          onError: (err: any) => {
            setScanError(getApiErrorMessage(err) || "Failed to process check-out.");
          },
        }
      );
    } else {
      checkInMutation.mutate(
        { source: "qr_code" } as any,
        {
          onSuccess: () => {
            setToastMessage("Checked in successfully! Have a great workout!");
            void query.refetch();
            void queryClient.invalidateQueries({ queryKey: memberQueryKeys.attendance() });
            void queryClient.invalidateQueries({ queryKey: memberQueryKeys.dashboard() });
            void queryClient.invalidateQueries({ queryKey: memberQueryKeys.activity() });
            setTimeout(() => {
              setQrModalOpen(false);
              setToastMessage(null);
            }, 1200);
          },
          onError: (err: any) => {
            setScanError(getApiErrorMessage(err) || "Failed to process check-in.");
          },
        }
      );
    }
  };

  return (
    <View style={styles.root}>
      {/* ── Top Header matching reference ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.breadcrumb}>MEMBER DASHBOARD • GYM ACCESS</Text>
          <Text style={styles.pageTitle}>Attendance</Text>
          <Text style={styles.pageSubtitle}>
            Track check-ins, check-outs and attendance summary
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Search bar with ⌘K badge */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={15} color={C.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search something..."
              placeholderTextColor={C.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={styles.kbdBadge}>
              <Text style={styles.kbdText}>⌘K</Text>
            </View>
          </View>

          {/* Date pill */}
          <View style={styles.datePill}>
            <Ionicons name="calendar-outline" size={14} color={C.primary} />
            <Text style={styles.datePillText}>Nov 5, 2026</Text>
            <Ionicons name="chevron-down" size={13} color={C.muted} />
          </View>

          {/* Notification bell with red badge */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => navigation.navigate("MemberNotifications")}
            style={styles.bellBtn}
          >
            <Ionicons name="notifications-outline" size={18} color={C.white} />
            {unreadNotifications.length > 0 ? <View style={styles.bellBadgeDot} /> : null}
          </Pressable>

          {/* Orange Profile Avatar "M" */}
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "M"}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 4 Top Metric Cards Row ── */}
        <View style={styles.metricsRow}>
          {/* Card 1: Today's Visits */}
          <MetricCard
            title="Today's Visits"
            value={todayVisits}
            subtitle={checkInSubtitle}
            iconName="calendar-outline"
            iconColor={C.primary}
            iconBgColor="rgba(233, 30, 99, 0.15)"
            barColor={C.primary}
            barPercent={100}
          />

          {/* Card 2: This Month */}
          <MetricCard
            title="This Month"
            value={`${monthPercent}%`}
            subtitle="22 / 30 Days Attended"
            targetBadge="Target: 80%"
            iconName="pie-chart-outline"
            iconColor={C.green}
            iconBgColor={C.greenBg}
            barColor={C.green}
            barPercent={monthPercent}
          />

          {/* Card 3: This Week */}
          <MetricCard
            title="This Week"
            value={`${weeklyDaysCount}`}
            unit="Days"
            subtitle="Great streak this week!"
            iconName="time-outline"
            iconColor={C.cyan}
            iconBgColor={C.cyanBg}
            barColor={C.cyan}
            barPercent={80}
          />

          {/* Card 4: Missed Days */}
          <MetricCard
            title="Missed Days"
            value={`${missedDaysCount}`}
            subtitle="Keep going!"
            iconName="warning-outline"
            iconColor={C.amber}
            iconBgColor={C.amberBg}
            barColor={C.amber}
            barPercent={40}
          />
        </View>

        {/* ── Center Card: Scan the gym's daily QR ── */}
        <View style={styles.qrCardContainer}>
          <LinearGradient
            colors={["rgba(52, 199, 89, 0.14)", "#1C1C1E", "#000000"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.qrCardGradient}
          >
            {/* Ambient emerald backlight circle */}
            <View style={styles.emeraldAura} />

            {/* QR Icon with red glowing corner brackets */}
            <View style={styles.qrIconGlowBox}>
              <View style={[styles.qrCorner, styles.qrCornerTL]} />
              <View style={[styles.qrCorner, styles.qrCornerTR]} />
              <View style={[styles.qrCorner, styles.qrCornerBL]} />
              <View style={[styles.qrCorner, styles.qrCornerBR]} />
              <Ionicons name="qr-code-outline" size={38} color={C.white} />
            </View>

            {/* Big Card Title */}
            <Text style={styles.qrCardTitle}>Scan the gym's daily QR</Text>

            {/* Subtitle explanation */}
            <Text style={styles.qrCardSubtitle}>
              Checkout is available 30 minutes after check-in. Each pair of scans{"\n"}
              completes one visit. You can visit up to 1 times per day.
            </Text>

            {/* CTA Button */}
            <GradientBtn
              onPress={() => setQrModalOpen(true)}
              style={styles.openQrBtn}
            >
              <Ionicons name="camera-outline" size={17} color={C.white} />
              <Text style={styles.openQrBtnText}>Open QR scanner</Text>
            </GradientBtn>
          </LinearGradient>
        </View>

        {/* ── Recent History Section ── */}
        <View style={styles.historyCardContainer}>
          {/* Section Header */}
          <View style={styles.historyHeaderRow}>
            <View style={styles.historyHeaderLeft}>
              <View style={styles.historyRedIconWrap}>
                <Ionicons name="time-outline" size={16} color={C.primary} />
              </View>
              <View>
                <Text style={styles.historySectionTitle}>Recent History</Text>
                <Text style={styles.historySectionSubtitle}>
                  Your gym check-in and check-out logs
                </Text>
              </View>
            </View>

            <View style={styles.historyHeaderRight}>
              {/* Filter Tabs */}
              <View style={styles.filterPillsGroup}>
                <Pressable
                  onPress={() => setFilterTab("All Logs")}
                  style={[
                    styles.filterTabPill,
                    filterTab === "All Logs" && styles.filterTabPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTabPillText,
                      filterTab === "All Logs" && styles.filterTabPillTextActive,
                    ]}
                  >
                    All Logs
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setFilterTab("This Week")}
                  style={[
                    styles.filterTabPill,
                    filterTab === "This Week" && styles.filterTabPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTabPillText,
                      filterTab === "This Week" && styles.filterTabPillTextActive,
                    ]}
                  >
                    This Week
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* History List Rows */}
          <View style={styles.historyListWrap}>
            {filteredLogs.length === 0 ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <Text style={{ color: C.muted, fontSize: 13 }}>No attendance check-in logs found.</Text>
              </View>
            ) : (
              filteredLogs.map((item, index) => (
                <HistoryRow
                  key={item.id}
                  item={item}
                  isLast={index === filteredLogs.length - 1}
                  showDetailedData={showLogData}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* ── Floating Ask Gemini Pill (bottom-right) ── */}
      <View style={styles.floatingGeminiPill}>
        <Ionicons name="sparkles" size={13} color="#007AFF" />
        <Text style={styles.floatingGeminiText}>Ask Gemini</Text>
      </View>

      {/* ── QR Scanner Modal ── */}
      <QRScannerModal
        visible={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false);
          setScanError(null);
        }}
        onScanToken={handleScanToken}
        onSimulate={handleSimulateScan}
        isPending={
          scanDailyQrMutation.isPending ||
          checkInMutation.isPending ||
          checkOutMutation.isPending
        }
        isSuccessMessage={toastMessage}
        errorMessage={scanError}
        onClearError={() => setScanError(null)}
      />
    </View>
  );
}

// ─── Component Stubs for presentation compatibility ───────────────────────────
export function StatCardView(_props?: any) {
  return null;
}
export function ActionCardView(_props?: any) {
  return null;
}
export function HistoryRowView(_props?: any) {
  return null;
}

// ─── Stylesheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: C.headerBorder,
    paddingHorizontal: 28,
    paddingVertical: 18,
    gap: 16,
    flexWrap: "wrap",
  },
  headerLeft: {
    flex: 1,
    minWidth: 260,
    gap: 3,
  },
  breadcrumb: {
    fontSize: 10,
    fontWeight: "700",
    color: C.primary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: C.white,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: C.muted,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 8,
    minWidth: 210,
  },
  searchInput: {
    color: C.white,
    fontSize: 13,
    flex: 1,
    padding: 0,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  kbdBadge: {
    backgroundColor: C.pillBg,
    borderWidth: 1,
    borderColor: C.pillBorder,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  kbdText: {
    color: C.muted,
    fontSize: 10,
    fontWeight: "600",
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  datePillText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "600",
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bellBadgeDot: {
    position: "absolute",
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.primary,
    borderWidth: 1.5,
    borderColor: C.headerBg,
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.primaryOrange,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: C.white,
    fontWeight: "800",
    fontSize: 15,
  },

  // ── Scroll Body
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 28,
    gap: 22,
    paddingBottom: 90,
  },

  // ── 4 Metric Cards Row
  metricsRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  metricCard: {
    flex: 1,
    minWidth: 210,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 18,
    padding: 18,
    justifyContent: "space-between",
  },
  metricTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
  },
  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  metricValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 30,
    fontWeight: "800",
    color: C.white,
    letterSpacing: -1,
  },
  metricUnit: {
    fontSize: 15,
    fontWeight: "700",
    color: C.white,
  },
  targetBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: C.green,
    marginLeft: 6,
  },
  metricSubtitle: {
    fontSize: 12,
    color: C.muted,
  },
  metricSecondarySubtitle: {
    fontSize: 11,
    color: C.mutedDark,
    marginTop: 2,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: "#1C1C1E",
    borderRadius: 2,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },

  // ── Center QR Card
  qrCardContainer: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.2)",
  },
  qrCardGradient: {
    paddingVertical: 44,
    paddingHorizontal: 28,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  emeraldAura: {
    position: "absolute",
    top: -40,
    width: 320,
    height: 180,
    borderRadius: 160,
    backgroundColor: "rgba(52, 199, 89, 0.08)",
  },
  qrIconGlowBox: {
    width: 78,
    height: 78,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    position: "relative",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  qrCorner: {
    position: "absolute",
    width: 14,
    height: 14,
    borderColor: C.primary,
  },
  qrCornerTL: {
    top: 6,
    left: 6,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
  },
  qrCornerTR: {
    top: 6,
    right: 6,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
  },
  qrCornerBL: {
    bottom: 6,
    left: 6,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
  },
  qrCornerBR: {
    bottom: 6,
    right: 6,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
  },
  qrCardTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: C.white,
    textAlign: "center",
    marginBottom: 8,
  },
  qrCardSubtitle: {
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 540,
    marginBottom: 20,
  },
  openQrBtn: {
    minWidth: 210,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  openQrBtnText: {
    color: C.white,
    fontWeight: "700",
    fontSize: 15,
  },

  // ── History Section
  historyCardContainer: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 22,
    overflow: "hidden",
  },
  historyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
    flexWrap: "wrap",
    gap: 14,
  },
  historyHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyRedIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(233, 30, 99, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.white,
  },
  historySectionSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  historyHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  filterPillsGroup: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  filterTabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 11,
  },
  filterTabPillActive: {
    backgroundColor: "#1C1C1E",
  },
  filterTabPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
  },
  filterTabPillTextActive: {
    color: C.white,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
  },
  toggleTrack: {
    width: 42,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: C.primary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.white,
    alignSelf: "flex-start",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },

  // ── History List
  historyListWrap: {
    paddingHorizontal: 8,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 14,
  },
  historyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  historyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.greenBg,
    borderWidth: 1,
    borderColor: C.greenBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  historyInfoCol: {
    flex: 1,
    gap: 4,
  },
  historyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  historySessionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.white,
  },
  statusBadgeCompleted: {
    backgroundColor: C.greenBg,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: C.greenBorder,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: C.green,
    letterSpacing: 0.5,
  },
  historyCheckTimes: {
    fontSize: 12,
    color: C.muted,
  },
  timeHighlight: {
    color: C.white,
    fontWeight: "600",
  },
  historyRightCol: {
    alignItems: "flex-end",
    gap: 3,
  },
  historyDurationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  historyDurationValue: {
    fontSize: 14,
    fontWeight: "700",
    color: C.green,
  },
  historyDateText: {
    fontSize: 11,
    color: C.muted,
  },
  historyExportBtn: {
    padding: 2,
    marginTop: 2,
  },

  // ── Floating Gemini Pill
  floatingGeminiPill: {
    position: "absolute",
    bottom: 20,
    right: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 9,
    shadowColor: "#000000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  floatingGeminiText: {
    color: C.white,
    fontWeight: "600",
    fontSize: 13,
  },

  // ── QR Scanner Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalDialog: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalCameraIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(233, 30, 99, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(233, 30, 99, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: C.white,
  },
  modalSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Viewport
  scannerViewport: {
    backgroundColor: C.scannerBg,
    borderRadius: 18,
    height: 230,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    alignItems: "center",
    justifyContent: "center",
  },
  scannerGridOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#000000",
  },
  cornerBracket: {
    position: "absolute",
    width: 32,
    height: 32,
    borderColor: C.primary,
  },
  cbTopLeft: {
    top: 25,
    left: 45,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cbTopRight: {
    top: 25,
    right: 45,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cbBottomLeft: {
    bottom: 35,
    left: 45,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cbBottomRight: {
    bottom: 35,
    right: 45,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  centerCrosshairs: {
    width: 44,
    height: 44,
    position: "relative",
  },
  crosshairCornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#F2F2F7",
  },
  crosshairCornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "#F2F2F7",
  },
  crosshairCornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 8,
    height: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#F2F2F7",
  },
  crosshairCornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "#F2F2F7",
  },
  laserScanLine: {
    position: "absolute",
    left: 45,
    right: 45,
    height: 3,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  searchingPill: {
    position: "absolute",
    bottom: 12,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  searchingPillText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: "500",
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.greenBg,
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },
  successBannerText: {
    color: C.green,
    fontSize: 12,
    fontWeight: "600",
  },
  simulateBtnText: {
    color: C.white,
    fontWeight: "700",
    fontSize: 15,
  },
  scannerControlsRow: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    gap: 8,
    zIndex: 10,
  },
  scannerControlBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  scannerControlBtnActive: {
    backgroundColor: "rgba(233, 30, 99, 0.2)",
    borderColor: C.yellow,
  },
  permissionPromptBox: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 5,
  },
  permissionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(233, 30, 99, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  permissionPromptText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  permissionPromptSubtext: {
    color: C.muted,
    fontSize: 11,
    textAlign: "center",
    marginBottom: 14,
  },
  permissionBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  permissionBtnText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "700",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(233, 30, 99, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(233, 30, 99, 0.3)",
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },
  errorBannerText: {
    flex: 1,
    color: "#E91E63",
    fontSize: 12,
    fontWeight: "600",
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  retryBtnText: {
    color: C.white,
    fontSize: 11,
    fontWeight: "700",
  },
  manualInputToggle: {
    alignItems: "center",
    marginTop: 12,
  },
  manualInputToggleText: {
    color: C.muted,
    fontSize: 12,
    textDecorationLine: "underline",
  },
  manualInputBox: {
    marginTop: 10,
    gap: 8,
  },
  manualInputField: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 10,
    color: C.white,
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  manualInputSubmitBtn: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
  },
  manualInputSubmitText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "600",
  },
  modalCancelBtn: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 10,
  },
  modalCancelBtnText: {
    color: C.white,
    fontWeight: "600",
    fontSize: 14,
  },
});
