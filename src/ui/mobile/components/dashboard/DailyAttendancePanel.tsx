import { Pressable } from "../NativePressable";
import { Ionicons } from "@expo/vector-icons";
import { Modal, ScrollView, Text, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import QRCode from "react-native-qrcode-svg";
import { getApiErrorMessage } from "../../../../services/api/client";
import type * as React from "react";
import type { useDailyAttendancePanelPresentation, useMetricPresentation } from "../../../../components/dashboard/DailyAttendancePanel";

export function DailyAttendancePanelView({ model }: { model: ReturnType<typeof useDailyAttendancePanelPresentation> }): React.ReactNode {
  const reduceMotion = useReducedMotion();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, setPanelWidth, expiryLabel, qr, stats, colors, error, panelWidth, setShowQr, Metric, showQr, width } = model.props;
      return ((
    <>
      <View onLayout={event => setPanelWidth(event.nativeEvent.layout.width)} style={{ gap: 16, paddingVertical: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1, minWidth: 0 }}><Text accessibilityRole="header" style={{ color: colors.ink, fontSize: 22, fontWeight: "600" }}>Member check-in QR</Text><Text style={{ color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 4 }}>Scan on arrival to record a visit.</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Refresh attendance QR" accessibilityState={{ busy: qr.isFetching || stats.isFetching, disabled: qr.isFetching || stats.isFetching }} disabled={qr.isFetching || stats.isFetching} onPress={() => { void qr.refetch(); void stats.refetch(); }} style={{ minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center" }}><Ionicons name="refresh-outline" size={23} color={colors.primary} /></Pressable>
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{getApiErrorMessage(error)}</Text> : null}
        <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 16, alignItems: "center" }}>
          <Text style={{ color: colors.ink, fontSize: 17, fontWeight: "600", textAlign: "center" }}>{qr.data?.gym_name ?? "Your gym"}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Enlarge attendance QR code" accessibilityState={{ disabled: !qr.data }} disabled={!qr.data} onPress={() => setShowQr(true)} style={{ padding: 16, backgroundColor: "#FFFFFF", borderRadius: 12 }}>
            {qr.data?.token ? <QRCode value={qr.data.token} size={Math.max(100, Math.min(220, panelWidth - 84))} backgroundColor="#FFFFFF" color="#000000" /> : <Text style={{ color: "#1C1C1E", padding: 12 }}>{qr.error ? "QR code unavailable" : "Generating code..."}</Text>}
          </Pressable>
          <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: "center" }}>Tap to enlarge. Valid until {expiryLabel}.</Text>
        </View>
      </View>
      <Modal
        visible={showQr}
        transparent
        animationType={reduceMotion ? "none" : "fade"}
        onRequestClose={() => setShowQr(false)}
      >
        <ScrollView style={{ backgroundColor: "rgba(0,0,0,.72)" }} contentContainerStyle={styles.backdrop}>
          <Pressable accessibilityRole="button"
            accessibilityViewIsModal
            style={styles.qrModal}
            onPress={(event) => event.stopPropagation()}
           accessible={false} importantForAccessibility="no">
            <Pressable accessibilityRole="button" accessibilityLabel="Close attendance QR" style={styles.close} onPress={() => setShowQr(false)}>
              <Ionicons name="close" size={22} color={colors.ink} />
            </Pressable>
            <View style={styles.modalIcon}>
              <Ionicons name="qr-code-outline" size={30} color="#E91E63" />
            </View>
            <Text style={styles.modalTitle}>
              {qr.data?.gym_name ?? "Gym"} Attendance QR
            </Text>
            <Text style={styles.modalSubtitle}>
              Scan this code for quick check-in. Expires {expiryLabel}.
            </Text>
            <View style={styles.modalQr}>
              {qr.data?.token ? (
                <QRCode
                  value={qr.data.token}
                  size={Math.max(120, Math.min(270, width - 124))}
                  backgroundColor="#FFFFFF"
                  color="#000000"
                />
              ) : null}
            </View>
            <View style={styles.modalInfo}>
              <View style={styles.infoCard}>
                <Ionicons name="qr-code-outline" size={18} color="#E91E63" />
                <View>
                  <Text style={styles.infoTitle}>One code</Text>
                  <Text style={styles.infoText}>for all members</Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#34C759"
                />
                <View>
                  <Text style={styles.infoTitle}>Secure & Safe</Text>
                  <Text style={styles.infoText}>Verified check-in</Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <Ionicons name="time-outline" size={18} color="#E91E63" />
                <View>
                  <Text style={styles.infoTitle}>Valid Until</Text>
                  <Text style={styles.infoText}>{expiryLabel}</Text>
                </View>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              style={styles.downloadButton}
              onPress={() => setShowQr(false)}
            >
              <Ionicons name="checkmark-outline" size={17} color={colors.ink} />
              <Text style={styles.downloadText}>Done</Text>
            </Pressable>
          </Pressable>
        </ScrollView>
      </Modal>
    </>
  ));
    }
  }
}

export function MetricView({ model }: { model: ReturnType<typeof useMetricPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { base, tone, value, label } = model.props;
      return ((
    <View
      style={[
        base.metric,
        { backgroundColor: `${tone}18`, borderColor: `${tone}55` },
      ]}
    >
      <Text style={[base.value, { color: tone }]}>{value ?? "—"}</Text>
      <Text style={base.label}>{label}</Text>
    </View>
  ));
    }
  }
}
