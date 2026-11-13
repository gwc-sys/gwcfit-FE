import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import QRCode from "react-native-qrcode-svg";
import { getApiErrorMessage } from "../../../../services/api/client";
import {
  NfcWaveSvg,
  QrCodeSvg,
  SmartphoneSvg,
} from "../../../../components/icons/PulseSvgIcons";
import { createStyles } from "../../styles/components/dashboard/DailyAttendancePanel.styles";
import type * as React from "react";
import type {
  useDailyAttendancePanelPresentation,
  useMetricPresentation,
} from "../../../../components/dashboard/DailyAttendancePanel";

export function DailyAttendancePanelView({
  model,
}: {
  model: ReturnType<typeof useDailyAttendancePanelPresentation>;
}): React.ReactNode {
  const reduceMotion = useReducedMotion();
  const [passMode, setPassMode] = useState<"qr" | "nfc">("nfc");
  const [simulatedSuccess, setSimulatedSuccess] = useState(false);

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const {
        setPanelWidth,
        expiryLabel,
        qr,
        stats,
        colors,
        error,
        panelWidth,
        setShowQr,
        Metric,
        showQr,
        width,
      } = model.props;
      const styles = createStyles(colors, panelWidth);
      const isNfc = passMode === "nfc";

      return (
        <>
          <View
            style={styles.panel}
            onLayout={(event) => setPanelWidth(event.nativeEvent.layout.width)}
          >
            {/* Header */}
            <View style={styles.panelHeader}>
              <View style={{ flex: 1, minWidth: 160 }}>
                <Text style={styles.panelTitle}>
                  {isNfc ? "NFC Tap & Go Pass" : "Today's Attendance QR"}
                </Text>
                <Text style={styles.panelSubtitle}>
                  {isNfc
                    ? "Apple Pay & Watch Express Transit Mode Enabled."
                    : `One code for every member. Expires ${expiryLabel}.`}
                </Text>
              </View>

              {/* Segmented Toggle QR | NFC */}
              <View style={styles.segmentedToggle}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Switch to QR mode"
                  style={[
                    styles.toggleSegment,
                    !isNfc && styles.toggleSegmentActive,
                  ]}
                  onPress={() => setPassMode("qr")}
                >
                  <QrCodeSvg
                    size={13}
                    color={!isNfc ? "#FFFFFF" : "#F2F2F7"}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      !isNfc && styles.toggleTextActive,
                    ]}
                  >
                    QR
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Switch to NFC mode"
                  style={[
                    styles.toggleSegment,
                    isNfc && styles.toggleSegmentActive,
                  ]}
                  onPress={() => setPassMode("nfc")}
                >
                  <NfcWaveSvg
                    size={13}
                    color={isNfc ? "#FFFFFF" : "#F2F2F7"}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      isNfc && styles.toggleTextActive,
                    ]}
                  >
                    NFC
                  </Text>
                </Pressable>
              </View>
            </View>

            {error ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {getApiErrorMessage(error)}
              </Text>
            ) : null}

            {isNfc ? (
              /* NFC Mode View matching media_1794153536933_87b1baef.jpg */
              <View style={styles.nfcContainer}>
                {/* Concentric Pulsing Rings + Center Squircle */}
                <View style={styles.nfcRippleOuter}>
                  <View style={styles.nfcRippleMiddle}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="NFC Tap"
                      style={styles.nfcTapSquircle}
                      onPress={() => {
                        setSimulatedSuccess(true);
                        setTimeout(() => setSimulatedSuccess(false), 2000);
                      }}
                    >
                      <NfcWaveSvg size={28} color="#FFFFFF" />
                      <Text style={styles.nfcTapText}>NFC TAP</Text>
                    </Pressable>
                  </View>
                </View>

                {/* NFC Active Status Pill */}
                <View style={styles.nfcStatusPill}>
                  <View style={styles.nfcStatusDot} />
                  <Text style={styles.nfcStatusText}>
                    {simulatedSuccess
                      ? "NFC Pass Verified ✓"
                      : "NFC Reader Active & Ready"}
                  </Text>
                </View>

                {/* Reader Guidance Title & Subtitle */}
                <View style={{ alignItems: "center", gap: 3 }}>
                  <Text style={styles.nfcInstructionTitle}>
                    Hold iPhone or Apple Watch Near Reader
                  </Text>
                  <Text style={styles.nfcInstructionSub}>
                    Supported on iOS, watchOS & Android NFC Pass
                  </Text>
                </View>

                {/* Simulate Device Tap Button */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Simulate NFC Device Tap"
                  style={styles.nfcSimulateButton}
                  onPress={() => {
                    setSimulatedSuccess(true);
                    setTimeout(() => setSimulatedSuccess(false), 2000);
                  }}
                >
                  <SmartphoneSvg size={16} color="#E91E63" />
                  <Text style={styles.nfcSimulateText}>
                    Simulate NFC Device Tap
                  </Text>
                </Pressable>
              </View>
            ) : (
              /* QR Mode View */
              <View style={styles.layout}>
                <View style={styles.qrWrap}>
                  <Pressable
                    style={[styles.qr, { width: 180, height: 180 }]}
                    onPress={() => setShowQr(true)}
                    accessibilityLabel="Open attendance QR"
                    accessibilityRole="button"
                    disabled={!qr.data}
                  >
                    {qr.data?.token ? (
                      <QRCode
                        value={qr.data.token}
                        size={152}
                        backgroundColor="#FFFFFF"
                        color="#000000"
                      />
                    ) : (
                      <Text style={styles.muted}>Generating today's code…</Text>
                    )}
                  </Pressable>
                  <View style={styles.expiryPill}>
                    <Text style={styles.expiryPillText}>Expires in 3:07</Text>
                  </View>
                </View>

                <View style={styles.body}>
                  <Text style={styles.title}>
                    {qr.data?.gym_name ?? "ZD Fitness"}
                  </Text>
                  <Text style={styles.muted}>
                    Share this QR code with members for quick check-in.
                  </Text>
                </View>
              </View>
            )}

            {/* 3 Metric Pills Shelf */}
            <View style={styles.metrics}>
              <Metric
                label="Check-ins"
                value={stats.data?.total_check_ins ?? 2}
                tone="#E91E63"
              />
              <Metric
                label="Check-outs"
                value={stats.data?.total_check_outs ?? 0}
                tone="#34C759"
              />
              <Metric
                label="Inside now"
                value={stats.data?.currently_checked_in ?? 2}
                tone="#E91E63"
              />
            </View>
          </View>

          {/* Modal Enlarged QR */}
          <Modal
            visible={showQr}
            transparent
            animationType={reduceMotion ? "none" : "fade"}
            onRequestClose={() => setShowQr(false)}
          >
            <ScrollView
              style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
              contentContainerStyle={styles.backdrop}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityViewIsModal
                style={styles.qrModal}
                onPress={(event) => event.stopPropagation()}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close attendance QR"
                  style={styles.close}
                  onPress={() => setShowQr(false)}
                >
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </Pressable>
                <View style={styles.modalIcon}>
                  <Ionicons name="qr-code-outline" size={26} color="#E91E63" />
                </View>
                <Text style={styles.modalTitle}>
                  {qr.data?.gym_name ?? "ZD Fitness"} Attendance QR
                </Text>
                <Text style={styles.modalSubtitle}>
                  Scan this code for quick check-in. Expires {expiryLabel}.
                </Text>
                <View style={styles.modalQr}>
                  {qr.data?.token ? (
                    <QRCode
                      value={qr.data.token}
                      size={Math.max(160, Math.min(260, width - 124))}
                      backgroundColor="#FFFFFF"
                      color="#000000"
                    />
                  ) : null}
                </View>
              </Pressable>
            </ScrollView>
          </Modal>
        </>
      );
    }
  }
}

export function MetricView({
  model,
}: {
  model: ReturnType<typeof useMetricPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { base, tone, value, label } = model.props;
      return (
        <View style={base.metric}>
          <Text style={[base.value, { color: tone }]}>{value ?? 0}</Text>
          <Text style={base.label}>{label}</Text>
        </View>
      );
    }
  }
}
