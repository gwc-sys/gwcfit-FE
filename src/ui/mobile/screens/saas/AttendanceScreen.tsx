import React, { useState, useMemo } from "react";
import {
  Alert,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { Pressable } from "../../components/NativePressable";
import { NoticeBanner } from "../../components/NoticeBanner";
import { getApiErrorMessage } from "../../../../services/api/client";
import { createStyles } from "../../styles/screens/saas/AttendanceScreen.styles";
import type {
  useAttendanceScreenPresentation,
  useReceptionStatCardPresentation,
  useActivityItemPresentation,
} from "../../../../screens/saas/AttendanceScreen";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";

export function AttendanceScreenView({
  model,
}: {
  model: ReturnType<typeof useAttendanceScreenPresentation>;
}): React.ReactNode {
  if (!model) return null;
  if (model.kind === "view1") return <AccessDeniedScreen />;

  const p = model.props;
  const c = p.colors;
  const styles = useMemo(() => createStyles(c), [c]);
  const insets = useSafeAreaInsets();
  const { isSmallPhone, isLargeFont, width } = useResponsiveLayout();

  const stats = p.statsQuery.data;
  const ready = !p.statsQuery.isPending && !p.statsQuery.error;
  const isRefreshing = p.statsQuery.isFetching || p.membersQuery.isFetching;

  // Active terminal tab: "Pass" | "QR" | "NFC"
  const [terminalMode, setTerminalMode] = useState<"Pass" | "QR" | "NFC">("QR");
  // Flipped card state
  const [isFlipped, setIsFlipped] = useState(false);
  // Manual check-in modal
  const [showManualModal, setShowManualModal] = useState(false);
  // Attendance records filter tab: "today" | "history"
  const [recordsTab, setRecordsTab] = useState<"today" | "history">("today");
  // Search filter for records
  const [recordsSearch, setRecordsSearch] = useState("");
  // Pagination
  const [page, setPage] = useState(1);
  // NFC listening pulse state
  const [nfcListening, setNfcListening] = useState(true);

  // Dynamic Date calculations
  const today = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const curMonth = monthNames[today.getMonth()];
  const curDay = today.getDate();
  const curYear = today.getFullYear();
  const dateFormatted = `${curMonth} ${curDay}, ${curYear}`;
  const kickerFormatted = `DAILY SUMMARY • ${curMonth.toUpperCase()} ${curDay}`;

  // Members list (real members from query)
  const allMembers = useMemo(() => {
    return p.membersQuery.data ?? [];
  }, [p.membersQuery.data]);

  // Selected preview member index
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const activeMember = allMembers[selectedPreviewIndex] || allMembers[0];

  const activeToken = useMemo(() => {
    if (!activeMember?.id) {
      return p.membersQuery.isPending ? "PULSEFIT-ATTENDANCE-LOADING" : "PULSEFIT-ATTENDANCE-READY";
    }
    const cleaned = activeMember.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12).toUpperCase();
    return `#MBR-${cleaned}`;
  }, [activeMember, p.membersQuery.isPending]);

  // Attendance Records & History
  const historyList = useMemo(() => {
    return p.attendanceListQuery?.data ?? [];
  }, [p.attendanceListQuery?.data]);

  const todayList = useMemo(() => {
    return stats?.checked_in_members ?? [];
  }, [stats?.checked_in_members]);

  const displayedRecords = useMemo(() => {
    const target = recordsTab === "today" ? todayList : historyList;
    if (!recordsSearch.trim()) return target;
    const q = recordsSearch.trim().toLowerCase();
    return target.filter(
      (r) =>
        (r.member_name || "").toLowerCase().includes(q) ||
        (r.trainer_name || "").toLowerCase().includes(q) ||
        (r.source || "").toLowerCase().includes(q),
    );
  }, [recordsTab, todayList, historyList, recordsSearch]);

  const dailyCap = stats?.daily_visit_limit ?? 4;
  const checkInsCount = stats?.total_check_ins ?? 0;
  const checkOutsCount = stats?.total_check_outs ?? 0;
  const insideNowCount = stats?.currently_checked_in ?? 0;

  // Handle Verify & Check In for active member
  const handleVerifyActiveMember = () => {
    if (!activeMember) return;
    p.checkInMutation.mutate(activeMember.id, {
      onSuccess: () => {
        Alert.alert("Success", `${activeMember.first_name} ${activeMember.last_name || ""} has been checked in.`);
      },
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#000000" }}
      contentContainerStyle={styles.screen}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            void p.statsQuery.refetch();
            void p.membersQuery.refetch();
            void p.attendanceListQuery?.refetch();
          }}
          tintColor="#E91E63"
        />
      }
    >
      {/* 1. Header Section */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top + 6, 14) }]}>
        <Text style={styles.kicker}>{kickerFormatted}</Text>
        <View style={[styles.titleRow, isSmallPhone && { flexWrap: "wrap", gap: 8 }]}>
          <View style={{ flex: 1, minWidth: isSmallPhone ? "100%" : 160, marginRight: 10 }}>
            <Text accessibilityRole="header" style={[styles.title, isSmallPhone && { fontSize: 26 }]}>
              Attendance
            </Text>
            <Text style={styles.subtitle}>
              KPIs reflect {dateFormatted} • Daily cap: {dailyCap} visits/member
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filter by date"
            style={[styles.dateButton, isSmallPhone && { alignSelf: "flex-start", height: 34 }]}
            onPress={() => {
              Alert.alert("Date Filter", `Currently viewing ${dateFormatted}`);
            }}
          >
            <Ionicons name="calendar-outline" size={16} color="#E91E63" />
            <Text style={styles.dateText}>{dateFormatted}</Text>
          </Pressable>
        </View>
      </View>

      {/* Notice Banners */}
      {p.notice ? <NoticeBanner message={p.notice} /> : null}
      {p.statsQuery.error ? (
        <NoticeBanner message={getApiErrorMessage(p.statsQuery.error)} tone="error" />
      ) : null}

      {/* 2. 2x2 Metric Cards Grid */}
      <View style={[styles.kpiGrid, isSmallPhone && { paddingHorizontal: 12, rowGap: 8 }]}>
        {/* Card 1: Check-ins */}
        <View style={[styles.kpiCard, (isSmallPhone || isLargeFont) && { width: "100%", padding: 12 }]}>
          <View style={styles.kpiTop}>
            <View style={styles.kpiIconTitleWrap}>
              <View style={[styles.kpiIconWrap, { backgroundColor: "#E91E63" }]}>
                <Ionicons name="log-in-outline" size={15} color="#E91E63" />
              </View>
              <Text style={styles.kpiTitle}>Check-ins</Text>
            </View>
            <Text style={styles.kpiPercent}>
              {checkInsCount > 0 ? `${Math.round((checkInsCount / 40) * 100)}%` : "0%"}
            </Text>
          </View>
          <Text style={styles.kpiValue}>{ready ? checkInsCount : "--"}</Text>
          <Text style={styles.kpiSubtitle}>
            {curMonth} {curDay} visits (Target: 40)
          </Text>
          <View style={styles.kpiTrack}>
            <View
              style={[
                styles.kpiFill,
                {
                  backgroundColor: "#E91E63",
                  width: `${Math.max(16, Math.min(100, (checkInsCount / 40) * 100))}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Card 2: Check-outs */}
        <View style={[styles.kpiCard, (isSmallPhone || isLargeFont) && { width: "100%", padding: 12 }]}>
          <View style={styles.kpiTop}>
            <View style={styles.kpiIconTitleWrap}>
              <View style={[styles.kpiIconWrap, { backgroundColor: "#34C759" }]}>
                <Ionicons name="log-out-outline" size={15} color="#34C759" />
              </View>
              <Text style={styles.kpiTitle}>Check-outs</Text>
            </View>
            <Text style={styles.kpiPercent}>
              {checkOutsCount > 0 ? `${Math.round((checkOutsCount / 40) * 100)}%` : "0%"}
            </Text>
          </View>
          <Text style={styles.kpiValue}>{ready ? checkOutsCount : "--"}</Text>
          <Text style={styles.kpiSubtitle}>Completed sessions today</Text>
          <View style={styles.kpiTrack}>
            <View
              style={[
                styles.kpiFill,
                {
                  backgroundColor: "#34C759",
                  width: `${Math.max(16, Math.min(100, (checkOutsCount / 40) * 100))}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Card 3: Inside Now */}
        <View style={[styles.kpiCard, (isSmallPhone || isLargeFont) && { width: "100%", padding: 12 }]}>
          <View style={styles.kpiTop}>
            <View style={styles.kpiIconTitleWrap}>
              <View style={[styles.kpiIconWrap, { backgroundColor: "#1C1C1E" }]}>
                <Ionicons name="people-outline" size={15} color="#E91E63" />
              </View>
              <Text style={styles.kpiTitle}>Inside Now</Text>
            </View>
            <Text style={styles.kpiPercent}>
              {insideNowCount > 0 ? `${Math.round((insideNowCount / 40) * 100)}%` : "0%"}
            </Text>
          </View>
          <Text style={styles.kpiValue}>{ready ? insideNowCount : "--"}</Text>
          <Text style={styles.kpiSubtitle}>Active floor occupancy ({insideNowCount}/40)</Text>
          <View style={styles.kpiTrack}>
            <View
              style={[
                styles.kpiFill,
                {
                  backgroundColor: "#E91E63",
                  width: `${Math.max(16, Math.min(100, (insideNowCount / 40) * 100))}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Card 4: Limit Reached */}
        <View style={[styles.kpiCard, (isSmallPhone || isLargeFont) && { width: "100%", padding: 12 }]}>
          <View style={styles.kpiTop}>
            <View style={styles.kpiIconTitleWrap}>
              <View style={[styles.kpiIconWrap, { backgroundColor: "#1C1C1E" }]}>
                <Ionicons name="calendar-outline" size={15} color="#E91E63" />
              </View>
              <Text style={styles.kpiTitle}>Limit Reached</Text>
            </View>
            <View style={styles.kpiCapBadge}>
              <Text style={styles.kpiCapBadgeText}>Cap: {dailyCap}/d</Text>
            </View>
          </View>
          <Text style={styles.kpiValue}>0</Text>
          <Text style={styles.kpiSubtitle}>0 members at cap</Text>
          <View style={styles.kpiTrack}>
            <View
              style={[
                styles.kpiFill,
                {
                  backgroundColor: "#E91E63",
                  width: "16%",
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* 3. Member Access Pass Terminal Card */}
      <View style={styles.terminalCard}>
        {/* Terminal Header */}
        <View style={styles.terminalHeader}>
          <View>
            <Text style={styles.terminalTitle}>Member Access Pass</Text>
            <Text style={styles.terminalSubtitle}>
              Optical QR Pass & Local USB NFC Reader
            </Text>
          </View>

          {/* Segmented Switcher (Pass | QR | NFC) */}
          <View style={styles.segmentedTabs}>
            <Pressable
              style={[
                styles.segmentedTab,
                terminalMode === "Pass" && styles.segmentedTabActive,
              ]}
              onPress={() => setTerminalMode("Pass")}
            >
              <Text
                style={[
                  styles.segmentedTabText,
                  terminalMode === "Pass" && styles.segmentedTabTextActive,
                ]}
              >
                Pass
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.segmentedTab,
                terminalMode === "QR" && styles.segmentedTabActive,
              ]}
              onPress={() => setTerminalMode("QR")}
            >
              <Ionicons
                name="qr-code"
                size={13}
                color={terminalMode === "QR" ? "#FFFFFF" : "#F2F2F7"}
              />
              <Text
                style={[
                  styles.segmentedTabText,
                  terminalMode === "QR" && styles.segmentedTabTextActive,
                ]}
              >
                QR
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.segmentedTab,
                terminalMode === "NFC" && styles.segmentedTabActive,
              ]}
              onPress={() => setTerminalMode("NFC")}
            >
              <Ionicons
                name="radio-outline"
                size={13}
                color={terminalMode === "NFC" ? "#FFFFFF" : "#F2F2F7"}
              />
              <Text
                style={[
                  styles.segmentedTabText,
                  terminalMode === "NFC" && styles.segmentedTabTextActive,
                ]}
              >
                NFC
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Inner Terminal Screen */}
        <View style={styles.terminalScreen}>
          {terminalMode === "NFC" ? (
            /* NFC Mode Screen (Image 2) */
            <View>
              {/* Glowing Reader Box */}
              <View style={styles.nfcGlowingBox}>
                <Ionicons name="radio" size={32} color="#FFFFFF" />
                <Text style={styles.nfcReaderText}>READER</Text>
              </View>

              {/* Green Listening Pill */}
              <View style={styles.nfcStatusPill}>
                <View style={styles.nfcStatusDot} />
                <Text style={styles.nfcStatusText}>
                  {nfcListening ? "Local USB NFC Reader Listening" : "NFC Reader Idle"}
                </Text>
              </View>

              {/* Title & Description */}
              <Text style={styles.nfcTitle}>
                Present Assigned Gym NFC Tag or Card
              </Text>
              <Text style={styles.nfcSubtitle}>
                Supports ISO 14443-A physical keyfobs & Android Host Card Emulation.
                For iOS devices, use the QR Pass.
              </Text>

              {/* Actions Row */}
              <View style={styles.terminalActionsRow}>
                <Pressable
                  style={styles.nfcScanButton}
                  onPress={() => setTerminalMode("QR")}
                >
                  <Ionicons name="qr-code" size={17} color="#E91E63" />
                  <Text style={styles.nfcScanButtonText}>
                    Switch to QR Scanner (iOS/All)
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.nfcRefreshButton}
                  onPress={() => {
                    setNfcListening(true);
                    Alert.alert("NFC Reader", "Local USB NFC Reader reconnected and listening for cards.");
                  }}
                >
                  <Ionicons name="refresh" size={18} color="#E91E63" />
                </Pressable>
              </View>
            </View>
          ) : (
            /* QR / Pass Mode Screen (Image 1) */
            <View>
              {/* Top Sub-Header */}
              <View style={[styles.screenHeaderRow, isSmallPhone && { flexWrap: "wrap", gap: 4 }]}>
                <Text style={styles.screenHeaderLeft} numberOfLines={1}>
                  Universal Optical QR Pass (iOS & Android)
                </Text>
                <Text style={styles.screenHeaderRight}>{activeToken}</Text>
              </View>

              {/* White QR Box */}
              <View style={[styles.qrWhiteBox, { width: Math.max(140, Math.min(210, width - 120)), height: Math.max(140, Math.min(210, width - 120)) }]}>
                {isFlipped ? (
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#000000",
                      borderRadius: 16,
                      padding: 12,
                    }}
                  >
                    <Ionicons name="finger-print" size={54} color="#E91E63" />
                    <Text style={{ color: "#FFFFFF", fontWeight: "700", marginTop: 8 }}>
                      NFC Virtual Pass
                    </Text>
                    <Text style={{ color: "#F2F2F7", fontSize: 11, textAlign: "center" }}>
                      Tap Flip to return to QR
                    </Text>
                  </View>
                ) : activeMember ? (
                  <QRCode
                    value={activeToken || "PULSEFIT-ATTENDANCE-READY"}
                    size={Math.max(110, Math.min(170, width - 160))}
                    color="#000000"
                    backgroundColor="#FFFFFF"
                  />
                ) : (
                  <View style={{ alignItems: "center", justifyContent: "center", padding: 12 }}>
                    <Ionicons name="qr-code-outline" size={54} color="#F2F2F7" />
                    <Text style={{ color: "#F2F2F7", fontSize: 12, fontWeight: "600", marginTop: 8, textAlign: "center" }}>
                      {p.membersQuery.isPending ? "Loading terminal pass..." : "No member selected"}
                    </Text>
                  </View>
                )}
              </View>

              {/* Member Name and Details */}
              <Text numberOfLines={1} adjustsFontSizeToFit style={styles.memberName}>
                {activeMember ? `${activeMember.first_name} ${activeMember.last_name || ""} • ${activeMember.membership_plan_name || "No Plan"}` : "No member selected"}
              </Text>
              <Text style={styles.memberHelper}>
                Scan at the reception optical reader or verify manually below
              </Text>

              {/* Actions Row */}
              <View style={[styles.terminalActionsRow, isSmallPhone && { flexWrap: "wrap", gap: 8 }]}>
                <Pressable
                  style={[styles.verifyButton, isSmallPhone && { width: "100%", flex: undefined }]}
                  disabled={p.checkInMutation.isPending}
                  onPress={handleVerifyActiveMember}
                >
                  <Text numberOfLines={1} adjustsFontSizeToFit style={styles.verifyButtonText}>
                    {p.checkInMutation.isPending
                      ? "Verifying..."
                      : "Verify & Check In Member"}
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.flipButton, isSmallPhone && { width: "100%", marginLeft: 0 }]}
                  onPress={() => setIsFlipped(!isFlipped)}
                >
                  <Text style={styles.flipButtonText}>Flip</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Preview Member Pass Selector */}
        <View style={[styles.previewChipsRow, isSmallPhone && { flexDirection: "column", alignItems: "flex-start", gap: 8 }]}>
          <Text style={styles.previewLabel}>Preview Member Pass:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsGroup}
          >
            {allMembers.slice(0, 5).map((m, idx) => {
              const isSelected = selectedPreviewIndex === idx;
              return (
                <Pressable
                  key={m.id || idx}
                  style={[
                    styles.memberChip,
                    isSelected && styles.memberChipActive,
                  ]}
                  onPress={() => {
                    setSelectedPreviewIndex(idx);
                    p.setSelectedMemberId(m.id);
                  }}
                >
                  <Text
                    style={[
                      styles.memberChipText,
                      isSelected && styles.memberChipTextActive,
                    ]}
                  >
                    {m.first_name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* 4. Quick Manual Check-in Banner (Image 3) */}
      <View style={[styles.quickBanner, (isSmallPhone || isLargeFont) && { alignItems: "stretch" }]}>
        <View style={styles.quickBannerLeft}>
          <View style={styles.quickBannerIconWrap}>
            <Ionicons name="person-add" size={20} color="#E91E63" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.quickBannerTitleRow}>
              <Text style={styles.quickBannerTitle}>Quick Manual Check-in</Text>
              <View style={styles.quickBannerBadge}>
                <Text style={styles.quickBannerBadgeText}>
                  {allMembers.length} members
                </Text>
              </View>
            </View>
            <Text
              style={styles.quickBannerSubtitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Search member roster or log a reception desk ...
            </Text>
          </View>
        </View>

        <Pressable
          style={[styles.quickCheckInButton, (isSmallPhone || isLargeFont) && { width: "100%" }]}
          onPress={() => setShowManualModal(true)}
        >
          <Text style={styles.quickCheckInButtonText}>+ Check In</Text>
        </Pressable>
      </View>

      {/* 5. Attendance Records / Log Section (Image 3) */}
      <View style={styles.recordsSection}>
        <Text style={styles.recordsKicker}>ATTENDANCE RECORDS</Text>

        <View style={styles.recordsHeaderRow}>
          <View style={styles.recordsTitleWrap}>
            <Text style={styles.recordsTitle}>Attendance Log</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {todayList.length} on {curMonth} {curDay}
              </Text>
            </View>
          </View>

          {/* Filter Tabs: Nov 10 (0) | History (2) */}
          <View style={styles.historyFilterTabs}>
            <Pressable
              style={[
                styles.filterTab,
                recordsTab === "today" && styles.filterTabActive,
              ]}
              onPress={() => setRecordsTab("today")}
            >
              <Text
                style={[
                  styles.filterTabText,
                  recordsTab === "today" && styles.filterTabTextActive,
                ]}
              >
                {curMonth} {curDay} ({todayList.length})
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.filterTab,
                recordsTab === "history" && styles.filterTabActive,
              ]}
              onPress={() => setRecordsTab("history")}
            >
              <Text
                style={[
                  styles.filterTabText,
                  recordsTab === "history" && styles.filterTabTextActive,
                ]}
              >
                History ({historyList.length})
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={17} color="#F2F2F7" />
          <TextInput
            placeholder="Search attendance by member or date..."
            placeholderTextColor="#007AFF"
            value={recordsSearch}
            onChangeText={setRecordsSearch}
            style={styles.searchInput}
          />
          {recordsSearch.length > 0 ? (
            <Pressable onPress={() => setRecordsSearch("")}>
              <Ionicons name="close-circle" size={17} color="#F2F2F7" />
            </Pressable>
          ) : null}
        </View>

        {/* Empty State vs List Cards */}
        {displayedRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No check-ins recorded for {dateFormatted} yet
            </Text>
            <Text style={styles.emptySubtitle}>
              {historyList.length} previous check-ins from {curMonth} {Math.max(1, curDay - 2)} are archived under History.
            </Text>
            <View style={[styles.emptyActionsRow, isSmallPhone && { flexDirection: "column", gap: 10, width: "100%" }]}>
              <Pressable
                style={[styles.emptyRecordButton, isSmallPhone && { width: "100%" }]}
                onPress={() => setShowManualModal(true)}
              >
                <Text style={styles.emptyRecordText}>+ Record First Check-in</Text>
              </Pressable>

              <Pressable
                style={[styles.emptyHistoryButton, isSmallPhone && { width: "100%", marginLeft: 0 }]}
                onPress={() => setRecordsTab("history")}
              >
                <Text style={styles.emptyHistoryText}>
                  View {curMonth} {Math.max(1, curDay - 2)} History ({historyList.length})
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View>
            {displayedRecords.map((item) => {
              const formattedTime = new Date(item.check_in_at).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              });
              const formattedDate = new Date(item.check_in_at).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              });

              return (
                <View key={item.id} style={styles.logCard}>
                  <View style={styles.logTopRow}>
                    <Text style={styles.logMemberName}>
                      {item.member_name || "Member Visit"}
                    </Text>
                    <View style={styles.checkedInBadge}>
                      <Text style={styles.checkedInText}>Checked in</Text>
                    </View>
                  </View>

                  <View style={styles.logMetaRow}>
                    <Ionicons name="qr-code-outline" size={14} color="#F2F2F7" />
                    <Text style={styles.logMetaText}>
                      {item.source || "qr_code"} • {formattedDate}, {formattedTime}
                    </Text>
                  </View>

                  <Text style={styles.logSubMeta}>
                    Gym: {item.gym_name || "ZD Fitness"} | Trainer:{" "}
                    {item.trainer_name || "Unassigned"}
                  </Text>

                  <View style={styles.logActionsRow}>
                    <Pressable
                      style={styles.iconActionBtn}
                      onPress={() => {
                        Alert.alert("Record Details", `Member: ${item.member_name}\nTime: ${formattedTime}\nSource: ${item.source}`);
                      }}
                    >
                      <Ionicons name="pencil-outline" size={15} color="#F2F2F7" />
                    </Pressable>

                    <Pressable
                      style={styles.iconActionBtn}
                      onPress={() => {
                        Alert.alert(
                          "Delete Attendance",
                          `Remove attendance entry for ${item.member_name}?`,
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: () => {
                                if (p.deleteAttendanceMutation) {
                                  p.deleteAttendanceMutation.mutate(item.id);
                                }
                              },
                            },
                          ],
                        );
                      }}
                    >
                      <Ionicons name="trash-outline" size={15} color="#E91E63" />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Pagination Row */}
        <View style={styles.paginationRow}>
          <Pressable
            disabled={page === 1}
            style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
            onPress={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            <Text style={styles.pageButtonText}>Previous</Text>
          </Pressable>

          <Text style={styles.pageIndicator}>Page {page}</Text>

          <Pressable
            style={styles.pageButton}
            onPress={() => setPage((prev) => prev + 1)}
          >
            <Text style={styles.pageButtonText}>Next</Text>
          </Pressable>
        </View>
      </View>

      {/* Manual Check-in Modal */}
      <Modal
        visible={showManualModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManualModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manual Desk Check-in</Text>
              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setShowManualModal(false)}
              >
                <Ionicons name="close" size={18} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Member Search */}
            <View style={styles.modalSearch}>
              <Ionicons name="search" size={16} color="#F2F2F7" />
              <TextInput
                placeholder="Search member by name or phone..."
                placeholderTextColor="#007AFF"
                value={p.memberSearch}
                onChangeText={p.setMemberSearch}
                style={styles.modalSearchInput}
              />
            </View>

            {/* Members Picker */}
            <ScrollView style={styles.modalMemberList}>
              {allMembers.map((m) => {
                const isSelected = p.selectedMemberId === m.id;
                return (
                  <Pressable
                    key={m.id}
                    style={[
                      styles.modalMemberItem,
                      isSelected && styles.modalMemberItemActive,
                    ]}
                    onPress={() => p.setSelectedMemberId(m.id)}
                  >
                    <View>
                      <Text style={styles.modalMemberName}>
                        {m.first_name} {m.last_name || ""}
                      </Text>
                      <Text style={styles.modalMemberSub}>
                        {m.membership_plan_name || "No Plan"} • {m.phone || m.email || ""}
                      </Text>
                    </View>
                    <Ionicons
                      name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                      size={20}
                      color={isSelected ? "#E91E63" : "#F2F2F7"}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Note input */}
            <TextInput
              placeholder="Optional check-in note (e.g. Guest visit, locker key assigned)"
              placeholderTextColor="#007AFF"
              value={p.notes}
              onChangeText={p.setNotes}
              style={styles.modalNotesInput}
              multiline
            />

            {/* Submit button */}
            <Pressable
              disabled={!p.selectedMemberId || p.checkInMutation.isPending}
              style={[
                styles.modalSubmitBtn,
                (!p.selectedMemberId || p.checkInMutation.isPending) && {
                  opacity: 0.6,
                },
              ]}
              onPress={() => {
                p.checkInMutation.mutate(undefined, {
                  onSuccess: () => {
                    setShowManualModal(false);
                    Alert.alert("Success", "Attendance recorded successfully.");
                  },
                });
              }}
            >
              <Text style={styles.modalSubmitBtnText}>
                {p.checkInMutation.isPending
                  ? "Recording..."
                  : "Confirm Reception Check-in"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Keep export contracts required for presentation architecture
export function ReceptionStatCardView({
  model,
}: {
  model: ReturnType<typeof useReceptionStatCardPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { dashboardStyles, tone, icon, title, value, detail } = model.props;
      return (
        <View style={dashboardStyles.statCard}>
          <View style={dashboardStyles.statTop}>
            <View
              style={[dashboardStyles.statIcon, { backgroundColor: `${tone}26` }]}
            >
              <Ionicons name={icon} size={21} color={tone} />
            </View>
            <Text style={dashboardStyles.statLabel}>{title}</Text>
          </View>
          <Text style={dashboardStyles.statValue}>{value}</Text>
          <Text style={dashboardStyles.statDetail}>{detail}</Text>
          <View style={dashboardStyles.sparkline}>
            <View
              style={[dashboardStyles.sparklineFill, { backgroundColor: tone }]}
            />
            <View style={dashboardStyles.sparkDot} />
          </View>
        </View>
      );
    }
  }
}

export function ActivityItemView({
  model,
}: {
  model: ReturnType<typeof useActivityItemPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles: actStyles, tone, icon, label, value } = model.props;
      return (
        <View style={actStyles.activityItem}>
          <View
            style={[actStyles.activityIcon, { backgroundColor: `${tone}30` }]}
          >
            <Ionicons name={icon} size={15} color={tone} />
          </View>
          <Text style={actStyles.activityItemLabel}>{label}</Text>
          <Text style={actStyles.activityItemValue}>{value}</Text>
        </View>
      );
    }
  }
}
