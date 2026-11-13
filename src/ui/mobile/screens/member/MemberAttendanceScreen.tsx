import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import type * as React from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import QRCode from "react-native-qrcode-svg";

import { Pressable } from "../../components/NativePressable";
import { AppLogo } from "../../../../components/AppLogo";
import { getMobileViewportMetrics } from "../../theme/theme";
import { NoticeBanner } from "../../components/NoticeBanner";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { useMemberAttendanceScreenPresentation } from "../../../../screens/member/MemberAttendanceScreen";
import type { MemberAttendance } from "../../../../types/member";

export {
  StatCardView,
  ActionCardView,
  HistoryRowView,
} from "../../../web/pages/member/MemberAttendanceScreen";

function getInitials(name?: string | null, fallback = "GR"): string {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function formatPassDate(value?: string | null): string {
  if (!value) return "No Expiry";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function formatSessionTime(value?: string | null, fallback = "--:--"): string {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export function MemberAttendanceScreenView({
  model,
}: {
  model: ReturnType<typeof useMemberAttendanceScreenPresentation> | any;
}): React.ReactNode {
  const { width = 390, height = 844, fontScale = 1 } = useWindowDimensions();
  const rawInsets = typeof useSafeAreaInsets === "function" ? useSafeAreaInsets() : null;
  const vp = getMobileViewportMetrics(width, height, rawInsets);

  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"front" | "back">("back");
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [accessDeniedAlert, setAccessDeniedAlert] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const [localCamPerm, requestLocalCamPerm] = useCameraPermissions();

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;

  const props = model.props as any;
  const query = props.query;
  const data = props.data ?? query?.data;
  const profile = props.profile;
  const membership = props.membership;
  const user = props.user;
  const unreadNotifications = props.unreadNotifications ?? [];
  const navigation = props.navigation;
  const checkIn = props.checkIn;
  const checkOut = props.checkOut;
  const scanMutation = props.scanMutation;

  const cameraPermission = props.cameraPermission ?? localCamPerm;
  const requestCameraPermission = props.requestCameraPermission ?? requestLocalCamPerm;

  const scanAnim = useRef(
    Animated?.Value
      ? new Animated.Value(0)
      : ({ interpolate: () => 24, setValue: () => {} } as any),
  ).current;

  useEffect(() => {
    if (scannerModalOpen && Animated?.timing && Animated?.loop) {
      setScanned(false);
      setScanError(null);
      setAccessDeniedAlert(null);
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim as any, {
            toValue: 1,
            duration: 1800,
            easing: Easing?.inOut?.(Easing?.ease) ?? undefined,
            useNativeDriver: false,
          }),
          Animated.timing(scanAnim as any, {
            toValue: 0,
            duration: 1800,
            easing: Easing?.inOut?.(Easing?.ease) ?? undefined,
            useNativeDriver: false,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      (scanAnim as any)?.setValue?.(0);
      setTorchEnabled(false);
      setAccessDeniedAlert(null);
    }
  }, [scannerModalOpen]);

  const scanLineTop = typeof scanAnim?.interpolate === "function"
    ? scanAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [24, 218],
      })
    : 24;

  const memberName =
    profile?.member_name ?? user?.full_name ?? "Member";
  const firstName = memberName.trim().split(/\s+/)[0] || "MEMBER";
  const userInitials = getInitials(memberName, "MB");
  const unreadCount = Array.isArray(unreadNotifications)
    ? unreadNotifications.length
    : 0;

  const rawGymName =
    membership?.gym_name ??
    profile?.gym_name ??
    props.gymName ??
    user?.gym_name ??
    "PulseFit Workspace";
  const shortGymName = rawGymName.replace(/\s+Moshi$/i, "").trim() || "PulseFit Workspace";
  const gymPassHeader = `${shortGymName.toUpperCase()} PASS`;

  const rawCode =
    profile?.member_code ??
    membership?.membership_uuid?.slice(0, 12)?.toUpperCase() ??
    (profile?.id ? `MBR-${String(profile.id).slice(0, 8).toUpperCase()}` : "MBR-PENDING");
  const memberCodeDisplay = rawCode.startsWith("#")
    ? rawCode
    : `#${rawCode}`;

  const isMembershipActive =
    (membership?.status ?? profile?.membership_status ?? "active")
      .toLowerCase()
      .includes("active");

  const rawPlanName =
    membership?.membership_plan_name ??
    profile?.membership_plan_name ??
    (isMembershipActive ? "Standard Membership" : "No Active Plan");
  const durationDays = membership?.plan_duration_days;
  const planDisplay = durationDays
    ? rawPlanName.includes("(")
      ? rawPlanName
      : `${rawPlanName} (${durationDays}d)`
    : rawPlanName;

  const validUntilDisplay = formatPassDate(membership?.expiry_date);

  // 4 Attendance Metrics
  const todayVisits = data?.today_visit_count ?? 0;
  const dailyLimit = data?.daily_visit_limit ?? 1;
  const monthlyPercent = Math.round(data?.attendance_percentage ?? 0);
  const historyList: MemberAttendance[] = Array.isArray(data?.history)
    ? data.history
    : [];
  const streakDays = data?.streak_days ?? (data?.monthly_attendance_count ? 1 : 0);
  const missedDays = data?.missed_days ?? 0;

  const homeGymId =
    props.homeGymId ??
    profile?.gym_uuid ??
    profile?.gym_id ??
    membership?.gym_uuid ??
    membership?.gym_id ??
    user?.gym_id ??
    undefined;

  const isPending = Boolean(scanMutation?.isPending || checkIn?.isPending || checkOut?.isPending);

  const processScanToken = (rawData: string) => {
    setScanError(null);
    setAccessDeniedAlert(null);

    let token = rawData.trim();
    let scannedGymId: string | undefined;
    let scannedBranchId: string | undefined;

    try {
      if (token.startsWith("{") && token.endsWith("}")) {
        const parsed = JSON.parse(token);
        token = parsed.token || parsed.jwt || parsed.qr || token;
        scannedGymId = parsed.gym_id || parsed.gymId || parsed.gym || parsed.gym_uuid || parsed.gymUuid || undefined;
        scannedBranchId = parsed.branch_id || parsed.branchId || parsed.branch || undefined;
      } else if (
        token.includes("gym_id=") ||
        token.includes("gymId=") ||
        token.includes("gym_uuid=") ||
        token.includes("gymUuid=") ||
        token.includes("token=") ||
        token.includes("branch_id=")
      ) {
        const queryString = token.includes("?") ? token.split("?")[1] : token;
        const params = new URLSearchParams(queryString);
        if (params.get("token")) token = params.get("token")!;
        scannedGymId = params.get("gym_id") || params.get("gymId") || params.get("gym_uuid") || params.get("gymUuid") || undefined;
        scannedBranchId = params.get("branch_id") || params.get("branchId") || undefined;
      }
    } catch {
      // Keep raw token string
    }

    // Home Gym Validation Mismatch Check
    const targetGymId = scannedGymId || scannedBranchId;
    if (
      targetGymId &&
      homeGymId &&
      String(targetGymId).trim().toLowerCase() !== String(homeGymId).trim().toLowerCase()
    ) {
      // Mismatched / Foreign Gym: Reject immediately, pause playback & alert user
      setScanned(true);
      setAccessDeniedAlert({
        title: "Access Denied: Unrecognized Gym QR",
        message:
          "This QR code belongs to another gym location. Attendance check-in is restricted to your registered home gym.",
      });
      return;
    }

    // Authorized Check-In: Submit to attendanceApi.scanDailyQr
    if (scanMutation?.mutate) {
      scanMutation.mutate(token, {
        onSuccess: (record: any) => {
          const isCheckout = Boolean(record?.check_out_at);
          setToastMessage(
            isCheckout
              ? "Checked out successfully! Great session!"
              : "Check-In Successful",
          );
          void query?.refetch?.();
          setTimeout(() => {
            setScannerModalOpen(false);
            setToastMessage(null);
            setScanned(false);
          }, 1200);
        },
        onError: (err: any) => {
          const msg = getApiErrorMessage(err) || "Failed to validate gym attendance QR code.";
          setScanError(msg);
          setScanned(false);
        },
      });
    }
  };

  const handleBarcodeScanned = (result: any) => {
    if (scanned || isPending) return;
    const rawData = (result?.data || "").trim();
    if (!rawData) return;
    setScanned(true);
    processScanToken(rawData);
  };

  const handleFlipPassCard = () => {
    setIsCardFlipped((prev) => {
      const next = !prev;
      if (next && !props.qrToken) {
        const action =
          data?.today_status === "checked_in" && data?.can_check_out
            ? "check_out"
            : "check_in";
        props.showQr?.(action);
      }
      return next;
    });
  };

  const qrValue = props.qrToken || profile?.member_code || `PULSEFIT-${memberName.replace(/\s+/g, "").toUpperCase()}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingHorizontal: vp.horizontalPadding,
            paddingBottom: vp.safeBottomPadding,
            gap: vp.gridGap + 2,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(query?.isRefetching)}
            onRefresh={() => query?.refetch?.()}
            tintColor="#E91E63"
          />
        }
      >
        {/* Dynamic Island Status Capsule */}
        <View style={styles.islandRow}>
          <View style={styles.dynamicIsland}>
            <AppLogo size={16} chromeless />
            <Text style={styles.islandText}>PulseFit</Text>
            <View style={styles.islandGreenRing}>
              <View style={styles.islandGreenDot} />
            </View>
          </View>
        </View>

        {/* Top Header Row */}
        <View style={styles.topHeaderRow}>
          <Text style={styles.topKicker} numberOfLines={1}>
            TURNSTILE ACCESS & ATTENDANCE
          </Text>
          <View style={styles.topHeaderActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => navigation?.navigate?.("MemberNotifications")}
              style={styles.bellButton}
            >
              <Ionicons name="notifications-outline" size={21} color="#F2F2F7" />
              {unreadCount >= 0 ? <View style={styles.bellBadgeDot} /> : null}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Member Profile"
              onPress={() => navigation?.navigate?.("MemberProfileHome")}
              style={styles.avatarCircle}
            >
              <Text style={styles.avatarInitials}>{userInitials}</Text>
            </Pressable>
          </View>
        </View>

        <View
          style={[
            styles.headerDivider,
            { marginHorizontal: -vp.horizontalPadding },
          ]}
        />

        {/* Hero Row */}
        <View style={styles.heroRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.heroKicker} numberOfLines={1}>
              {gymPassHeader}
            </Text>
            <Text
              style={[styles.heroTitle, { fontSize: vp.heroTitleSize }]}
              numberOfLines={1}
            >
              Gym Access
            </Text>
          </View>
          <View style={styles.nodeOnlineRow}>
            {isCardFlipped ? <View style={styles.nodeOnlineDot} /> : null}
            <Text style={styles.nodeOnlineText}>Node Online</Text>
          </View>
        </View>

        {/* Flippable Pass Card (Front & Back) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isCardFlipped
              ? "Tap card again to flip back"
              : "Tap pass card to flip to QR code"
          }
          onPress={handleFlipPassCard}
        >
          {!isCardFlipped ? (
            <LinearGradient
              colors={["#000000", "#E91E63", "#000000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.passCardFront}
            >
              {/* Top Row */}
              <View style={styles.passTopRow}>
                <View style={styles.passBrandLeft}>
                  <View style={styles.passPinkCircle}>
                    <Text style={styles.passPinkCircleLetter}>P</Text>
                  </View>
                  <View style={styles.passTitleBlock}>
                    <Text style={styles.passGymTitle}>{gymPassHeader}</Text>
                    <Text style={styles.passMemberCode}>{memberCodeDisplay}</Text>
                  </View>
                </View>

                <View style={styles.passActiveBadge}>
                  <Text style={styles.passActiveBadgeText}>
                    {isMembershipActive ? "ACTIVE" : "INACTIVE"}
                  </Text>
                </View>
              </View>

              {/* Middle 3-Column Row */}
              <View style={styles.passMetaRow}>
                <View style={styles.passMetaCol}>
                  <Text style={styles.passMetaLabel}>MEMBER</Text>
                  <Text style={styles.passMetaValueWhite} numberOfLines={1}>
                    {memberName}
                  </Text>
                </View>

                <View style={styles.passMetaCol}>
                  <Text style={styles.passMetaLabel}>PLAN</Text>
                  <Text style={styles.passMetaValuePink} numberOfLines={1}>
                    {planDisplay}
                  </Text>
                </View>

                <View style={styles.passMetaColRight}>
                  <Text style={styles.passMetaLabel}>VALID UNTIL</Text>
                  <Text style={styles.passMetaValueWhite} numberOfLines={1}>
                    {validUntilDisplay}
                  </Text>
                </View>
              </View>

              <View style={styles.passDivider} />

              {/* Bottom Row */}
              <View style={styles.passBottomRow}>
                <View style={styles.passNfcRow}>
                  <Ionicons name="wifi-outline" size={16} color="#007AFF" />
                  <Text style={styles.passNfcText}>NFC Tap or QR Scan</Text>
                </View>

                <View style={styles.passFlipActionRow}>
                  <Ionicons name="refresh" size={13} color="#E91E63" />
                  <Text style={styles.passFlipActionText}>Tap to flip</Text>
                </View>
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.passCardBack}>
              <Text style={styles.presentTurnstileTitle}>
                Present at Turnstile
              </Text>

              <View style={styles.qrOuterWhiteBox}>
                <QRCode
                  value={qrValue}
                  size={140}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                />
              </View>

              <Text style={styles.qrCodeMonospaceText}>
                {qrValue.startsWith("#") ? qrValue : `#${qrValue}`}
              </Text>

              <Text style={styles.flipBackHint}>Tap card again to flip back</Text>
            </View>
          )}
        </Pressable>

        {/* Full-Width Open QR Scanner Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open QR Scanner for Gym Check-In"
          onPress={() => setScannerModalOpen(true)}
          style={styles.openScannerButton}
        >
          <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
          <Text style={styles.openScannerButtonText}>
            Open QR Scanner for Gym Check-In
          </Text>
        </Pressable>

        {toastMessage && !scannerModalOpen ? (
          <NoticeBanner message={toastMessage} tone="success" />
        ) : null}

        {props.error ? (
          <NoticeBanner message={getApiErrorMessage(props.error)} tone="error" />
        ) : null}

        {/* 4 Attendance Metric Tiles Row */}
        <View style={styles.statsQuadRow}>
          <View style={[styles.statQuadTile, fontScale > 1.15 && styles.statQuadTileLargeText]}>
            <Text style={styles.statQuadLabel}>TODAY</Text>
            <Text style={[styles.statQuadValue, { color: "#E91E63" }]}>
              {`${todayVisits}/${dailyLimit}`}
            </Text>
          </View>

          <View style={[styles.statQuadTile, fontScale > 1.15 && styles.statQuadTileLargeText]}>
            <Text style={styles.statQuadLabel}>THIS MONTH</Text>
            <Text style={[styles.statQuadValue, { color: "#34C759" }]}>
              {`${monthlyPercent}%`}
            </Text>
          </View>

          <View style={[styles.statQuadTile, fontScale > 1.15 && styles.statQuadTileLargeText]}>
            <Text style={styles.statQuadLabel}>STREAK</Text>
            <Text style={[styles.statQuadValue, { color: "#E91E63" }]}>
              {`${streakDays || 1} Day${(streakDays || 1) === 1 ? "" : "s"}`}
            </Text>
          </View>

          <View style={[styles.statQuadTile, fontScale > 1.15 && styles.statQuadTileLargeText]}>
            <Text style={styles.statQuadLabel}>MISSED</Text>
            <Text style={[styles.statQuadValue, { color: "#FFFFFF" }]}>
              {`${missedDays} Days`}
            </Text>
          </View>
        </View>

        {/* RECENT CHECK-INS Card */}
        <View style={styles.recentCheckinsCard}>
          <View style={styles.recentHeaderRow}>
            <Text style={styles.recentHeaderTitle}>RECENT CHECK-INS</Text>
            <Text style={styles.autoSyncedLabel}>Auto Synced</Text>
          </View>

          <View style={styles.recentList}>
            {historyList.length === 0 ? (
              <View style={styles.recentEmptyBox}>
                <Ionicons name="time-outline" size={24} color="#F2F2F7" />
                <Text style={styles.recentEmptyText}>
                  No recent check-in sessions recorded. Scan your gym's daily QR code to check in.
                </Text>
              </View>
            ) : (
              historyList.slice(0, 5).map((record, index) => {
                const inTime = formatSessionTime(record.check_in_at, "--:--");
                const outTime = record.check_out_at
                  ? formatSessionTime(record.check_out_at, "--:--")
                  : "Active";
                const sessionGym = record.gym_name
                  ? record.gym_name.replace(/\s+Moshi$/i, "")
                  : shortGymName;

                return (
                  <View
                    key={record.attendance_uuid}
                    style={styles.recentSessionRow}
                  >
                    <View style={styles.recentDoorIconBox}>
                      <Ionicons name="log-in-outline" size={18} color="#34C759" />
                    </View>
                    <View style={styles.recentSessionInfo}>
                      <Text style={styles.recentSessionTitle} numberOfLines={1}>
                        {`${sessionGym} • Session #${index + 1}`}
                      </Text>
                      <Text style={styles.recentSessionSub} numberOfLines={1}>
                        {`In: ${inTime} • Out: ${outTime}`}
                      </Text>
                    </View>
                    <View style={styles.recentCompletedPill}>
                      <Text style={styles.recentCompletedPillText}>
                        {record.check_out_at ? "Completed" : "Checked In"}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Full-Screen QR Scanner Overlay Modal (Matches Reference Image) */}
      <Modal
        visible={scannerModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setScannerModalOpen(false)}
      >
        <View style={styles.scannerOverlayContainer}>
          {/* Top Floating Controls Bar */}
          <SafeAreaView edges={["top"]} style={styles.scannerTopNav}>
            <View style={styles.scannerTopActions}>
              {cameraPermission?.granted ? (
                <>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Toggle Flashlight"
                    onPress={() => setTorchEnabled((t) => !t)}
                    style={[styles.scannerHeaderIconBtn, torchEnabled && styles.scannerHeaderIconBtnActive]}
                  >
                    <Ionicons
                      name={torchEnabled ? "flash" : "flash-outline"}
                      size={18}
                      color={torchEnabled ? "#E91E63" : "#FFFFFF"}
                    />
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Switch Camera"
                    onPress={() => setCameraFacing((f) => (f === "back" ? "front" : "back"))}
                    style={styles.scannerHeaderIconBtn}
                  >
                    <Ionicons name="camera-reverse-outline" size={20} color="#FFFFFF" />
                  </Pressable>
                </>
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close QR Scanner"
              onPress={() => setScannerModalOpen(false)}
              style={styles.scannerClosePill}
            >
              <Text style={styles.scannerClosePillText}>Close ×</Text>
            </Pressable>
          </SafeAreaView>

          {/* Central Viewfinder Area */}
          <View style={styles.scannerCenterArea}>
            <View style={styles.scannerFrameBox}>
              {/* Live Camera Stream if permission granted */}
              {cameraPermission?.granted ? (
                <CameraView
                  style={StyleSheet.absoluteFill}
                  facing={cameraFacing}
                  enableTorch={torchEnabled}
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                  }}
                  onBarcodeScanned={scanned || isPending ? undefined : handleBarcodeScanned}
                />
              ) : (
                <View style={styles.scannerNoCameraView}>
                  <Ionicons name="camera-outline" size={32} color="#E91E63" />
                  <Text style={styles.scannerNoCameraTitle}>Camera Access Required</Text>
                  <Text style={styles.scannerNoCameraSub}>
                    Enable camera to scan gym door QR codes
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Enable Camera"
                    onPress={() => void requestCameraPermission?.()}
                    style={styles.scannerEnableCamBtn}
                  >
                    <Text style={styles.scannerEnableCamBtnText}>Enable Camera</Text>
                  </Pressable>
                </View>
              )}

              {/* 4 Corner Brackets in Pink/Crimson */}
              <View style={[styles.cornerBracket, styles.cornerTopLeft]} pointerEvents="none" />
              <View style={[styles.cornerBracket, styles.cornerTopRight]} pointerEvents="none" />
              <View style={[styles.cornerBracket, styles.cornerBottomLeft]} pointerEvents="none" />
              <View style={[styles.cornerBracket, styles.cornerBottomRight]} pointerEvents="none" />

              {/* Animated Laser Scanning Line */}
              <Animated.View style={[styles.scannerLaserLine, { top: scanLineTop }]} pointerEvents="none" />

              {/* Bottom Frame Prompt */}
              <Text style={styles.scannerAlignText} pointerEvents="none">
                {isPending
                  ? "Validating QR code..."
                  : scanned
                    ? "QR Code Detected!"
                    : "Align Daily QR in Frame"}
              </Text>
            </View>

            {/* Access Denied Alert (Mismatched / Foreign Gym) */}
            {accessDeniedAlert ? (
              <View style={styles.accessDeniedBanner}>
                <Ionicons name="shield-outline" size={20} color="#E91E63" />
                <View style={styles.accessDeniedContent}>
                  <Text style={styles.accessDeniedTitle}>{accessDeniedAlert.title}</Text>
                  <Text style={styles.accessDeniedMessage}>{accessDeniedAlert.message}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Try Again"
                  onPress={() => {
                    setAccessDeniedAlert(null);
                    setScanned(false);
                  }}
                  style={styles.accessDeniedRetryBtn}
                >
                  <Text style={styles.accessDeniedRetryText}>Try Again</Text>
                </Pressable>
              </View>
            ) : null}

            {/* Success Toast */}
            {toastMessage ? (
              <View style={styles.scannerToastSuccess}>
                <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                <Text style={styles.scannerToastSuccessText}>{toastMessage}</Text>
              </View>
            ) : null}

            {/* Error Toast */}
            {scanError ? (
              <View style={styles.scannerToastError}>
                <Ionicons name="alert-circle" size={18} color="#E91E63" />
                <Text style={styles.scannerToastErrorText}>{scanError}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Retry QR Scan"
                  onPress={() => {
                    setScanError(null);
                    setScanned(false);
                  }}
                  style={styles.scannerRetryBtn}
                >
                  <Text style={styles.scannerRetryBtnText}>Retry</Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          {/* Bottom Floating Cancel Button (Matches Clean Overlay Spec) */}
          <SafeAreaView edges={["bottom"]} style={styles.scannerBottomContainer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel Scanner"
              onPress={() => setScannerModalOpen(false)}
              style={styles.scannerBottomCancelBtn}
            >
              <Ionicons name="close" size={18} color="#FFFFFF" />
              <Text style={styles.scannerBottomCancelText}>Cancel</Text>
            </Pressable>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#000000",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 32,
    gap: 14,
  },
  islandRow: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  dynamicIsland: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
  },
  islandRedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E91E63",
  },
  islandText: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  islandGreenRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(52, 199, 89, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  islandGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34C759",
  },
  topHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  topKicker: {
    color: "#E91E63",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    flexShrink: 1,
    paddingRight: 8,
  },
  topHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bellButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bellBadgeDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E91E63",
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  avatarCircle: {
    width: 36,
    height: 36,
    minWidth: 36,
    minHeight: 36,
    borderRadius: 18,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.22)",
  },
  avatarInitials: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  headerDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: -16,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 2,
  },
  heroKicker: {
    color: "#F2F2F7",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  nodeOnlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 4,
  },
  nodeOnlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34C759",
  },
  nodeOnlineText: {
    color: "#34C759",
    fontSize: 13,
    fontWeight: "700",
  },
  passCardFront: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
    gap: 20,
    minHeight: 214,
    justifyContent: "space-between",
  },
  passTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  passBrandLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  passPinkCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
  },
  passPinkCircleLetter: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  passTitleBlock: {
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  passGymTitle: {
    color: "#FFFFFF",
    fontSize: 16.5,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  passMemberCode: {
    flexShrink: 1,
    color: "#F2F2F7",
    fontSize: 11,
    fontWeight: "600",
  },
  passActiveBadge: {
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    borderColor: "rgba(52, 199, 89, 0.42)",
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 999,
  },
  passActiveBadgeText: {
    color: "#34C759",
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  passMetaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  passMetaCol: {
    flex: 1,
    gap: 4,
  },
  passMetaColRight: {
    alignItems: "flex-start",
    gap: 4,
  },
  passMetaLabel: {
    color: "#F2F2F7",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  passMetaValueWhite: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  passMetaValuePink: {
    color: "#E91E63",
    fontSize: 14,
    fontWeight: "800",
  },
  passDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  passBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  passNfcRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  passNfcText: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "500",
  },
  passFlipActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  passFlipActionText: {
    color: "#E91E63",
    fontSize: 12,
    fontWeight: "700",
  },
  passCardBack: {
    backgroundColor: "#000000",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 22,
    minHeight: 214,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  presentTurnstileTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  qrOuterWhiteBox: {
    width: 128,
    height: 128,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  qrInnerBlackBox: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000000",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  qrCodeMonospaceText: {
    color: "#FFFFFF",
    fontSize: 9.5,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 14,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  flipBackHint: {
    color: "#F2F2F7",
    fontSize: 11.5,
    fontWeight: "500",
  },
  openScannerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "#E91E63",
    borderRadius: 18,
    paddingVertical: 15,
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  openScannerButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  statsQuadRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statQuadTile: {
    flexGrow: 1,
    flexBasis: 140,
    minWidth: 0,
    backgroundColor: "#000000",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  statQuadTileLargeText: {
    flexBasis: "100%",
  },
  statQuadLabel: {
    color: "#F2F2F7",
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  statQuadValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  recentCheckinsCard: {
    backgroundColor: "#000000",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 16,
    gap: 14,
  },
  recentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recentHeaderTitle: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  autoSyncedLabel: {
    color: "#F2F2F7",
    fontSize: 11,
    fontWeight: "600",
  },
  recentList: {
    gap: 10,
  },
  recentSessionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: 13,
    gap: 12,
  },
  recentDoorIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(52, 199, 89, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  recentSessionInfo: {
    flex: 1,
    gap: 3,
  },
  recentSessionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  recentSessionSub: {
    color: "#F2F2F7",
    fontSize: 11.5,
    fontWeight: "500",
  },
  recentCompletedPill: {
    backgroundColor: "rgba(52, 199, 89, 0.14)",
    borderColor: "rgba(52, 199, 89, 0.35)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  recentCompletedPillText: {
    color: "#34C759",
    fontSize: 11,
    fontWeight: "700",
  },
  scannerOverlayContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.96)",
    justifyContent: "space-between",
  },
  scannerTopNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    zIndex: 10,
  },
  scannerTopActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scannerHeaderIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  scannerHeaderIconBtnActive: {
    backgroundColor: "rgba(233, 30, 99, 0.25)",
  },
  scannerClosePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  scannerClosePillText: {
    color: "#F2F2F7",
    fontSize: 13,
    fontWeight: "700",
  },
  scannerCenterArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scannerFrameBox: {
    width: 248,
    height: 258,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(233, 30, 99, 0.55)",
    backgroundColor: "rgba(0, 0, 0, 0.28)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  scannerNoCameraView: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 8,
  },
  scannerNoCameraTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6,
    textAlign: "center",
  },
  scannerNoCameraSub: {
    color: "#F2F2F7",
    fontSize: 11.5,
    textAlign: "center",
  },
  scannerEnableCamBtn: {
    backgroundColor: "#E91E63",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 8,
  },
  scannerEnableCamBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  cornerBracket: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#E91E63",
  },
  cornerTopLeft: {
    top: 14,
    left: 14,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
  },
  cornerTopRight: {
    top: 14,
    right: 14,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
  },
  cornerBottomLeft: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
  },
  cornerBottomRight: {
    bottom: 14,
    right: 14,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
  },
  scannerLaserLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#E91E63",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  scannerAlignText: {
    position: "absolute",
    bottom: 20,
    color: "#F2F2F7",
    fontSize: 11,
    fontWeight: "600",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  scannerToastSuccess: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.35)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 20,
  },
  scannerToastSuccessText: {
    color: "#34C759",
    fontSize: 12.5,
    fontWeight: "700",
  },
  scannerToastError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(233, 30, 99, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(233, 30, 99, 0.35)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 20,
  },
  scannerToastErrorText: {
    color: "#E91E63",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  scannerRetryBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#E91E63",
    borderRadius: 6,
  },
  scannerRetryBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  accessDeniedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(233, 30, 99, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(233, 30, 99, 0.4)",
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 16,
    gap: 10,
  },
  accessDeniedContent: {
    flex: 1,
    gap: 3,
  },
  accessDeniedTitle: {
    color: "#E91E63",
    fontSize: 13,
    fontWeight: "800",
  },
  accessDeniedMessage: {
    color: "#F2F2F7",
    fontSize: 11.5,
    lineHeight: 16,
  },
  accessDeniedRetryBtn: {
    backgroundColor: "#E91E63",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  accessDeniedRetryText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  scannerBottomContainer: {
    alignItems: "center",
    paddingBottom: 24,
  },
  scannerBottomCancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  scannerBottomCancelText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  recentEmptyBox: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  recentEmptyText: {
    color: "#F2F2F7",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
});
