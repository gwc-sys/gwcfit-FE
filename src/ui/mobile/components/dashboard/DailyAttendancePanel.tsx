import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { getApiErrorMessage } from "../../../../services/api/client";
import type * as React from "react";
import type { useDailyAttendancePanelPresentation, useMetricPresentation } from "../../../../components/dashboard/DailyAttendancePanel";

export function DailyAttendancePanelView({ model }: { model: ReturnType<typeof useDailyAttendancePanelPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, setPanelWidth, expiryLabel, qr, stats, colors, error, panelWidth, setShowQr, Metric, showQr, width } = model.props;
      return ((
    <>
      <View style={styles.panel} onLayout={(event) => setPanelWidth(event.nativeEvent.layout.width)}>
        <View style={styles.panelHeader}>
          <View style={{ flex: 1, minWidth: 160 }}>
            <Text style={styles.panelTitle}>Today&apos;s Attendance QR</Text>
            <Text style={styles.panelSubtitle}>
              One code for every member. Expires {expiryLabel}.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh attendance"
            accessibilityState={{ busy: qr.isFetching || stats.isFetching }}
            disabled={qr.isFetching || stats.isFetching}
            style={styles.refreshButton}
            onPress={() => { void qr.refetch(); void stats.refetch(); }}
          >
            <Ionicons name="refresh-outline" size={17} color={colors.ink} />
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>{getApiErrorMessage(error)}</Text>
        ) : null}
        <View style={styles.layout}>
          <Pressable
            style={[styles.qr, { width: Math.max(160, Math.min(250, panelWidth - 48)) }]}
            onPress={() => setShowQr(true)}
            accessibilityLabel="Open attendance QR"
            accessibilityRole="button"
            disabled={!qr.data}
           accessibilityState={{ disabled: !qr.data }}>
            {qr.data ? (
              <QRCode
                value={qr.data.token}
                size={Math.max(120, Math.min(220, panelWidth - 88))}
                backgroundColor="#fff"
                color="#07111f"
              />
            ) : (
              <Text style={styles.muted}>Generating today's secure code…</Text>
            )}
          </Pressable>
          <View style={styles.body}>
            <Text style={styles.title}>{qr.data?.gym_name ?? "Your gym"}</Text>
            <Text style={styles.muted}>
              Share this QR code with members for quick check-in.
            </Text>
            <View style={styles.metrics}>
              <Metric
                label="Check-ins"
                value={stats.data?.total_check_ins}
                tone="#0A84FF"
              />
              <Metric
                label="Check-outs"
                value={stats.data?.total_check_outs}
                tone="#22C55E"
              />
              <Metric
                label="Inside now"
                value={stats.data?.currently_checked_in}
                tone="#38BDF8"
              />
            </View>
            <View style={styles.validRow}>
              <Text style={styles.muted}>◷ Valid Until</Text>
              <Text style={styles.validText}>
                {qr.data
                  ? new Date(qr.data.expires_at).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "Today"}
              </Text>
            </View>
            <Text style={styles.heading}>Currently checked in</Text>
            {stats.data?.checked_in_members.length ? (
              stats.data.checked_in_members.map((x) => (
                <View key={x.id} style={styles.row}>
                  <Text style={styles.name}>{x.member_name ?? "Member"}</Text>
                  <Text style={styles.muted}>
                    {new Date(x.check_in_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.muted}>
                {stats.isPending ? "Loading attendance…" : stats.isError ? "Attendance could not be loaded." : "No members are currently checked in."}
              </Text>
            )}
          </View>
        </View>
      </View>
      <Modal
        visible={showQr}
        transparent
        animationType="fade"
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
              <Ionicons name="qr-code-outline" size={30} color="#64D2FF" />
            </View>
            <Text style={styles.modalTitle}>
              {qr.data?.gym_name ?? "Gym"} Attendance QR
            </Text>
            <Text style={styles.modalSubtitle}>
              Scan this code for quick check-in. Expires {expiryLabel}.
            </Text>
            <View style={styles.modalQr}>
              {qr.data ? (
                <QRCode
                  value={qr.data.token}
                  size={Math.max(120, Math.min(270, width - 124))}
                  backgroundColor="#fff"
                  color="#07111f"
                />
              ) : null}
            </View>
            <View style={styles.modalInfo}>
              <View style={styles.infoCard}>
                <Ionicons name="qr-code-outline" size={18} color="#64D2FF" />
                <View>
                  <Text style={styles.infoTitle}>One code</Text>
                  <Text style={styles.infoText}>for all members</Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#22C55E"
                />
                <View>
                  <Text style={styles.infoTitle}>Secure & Safe</Text>
                  <Text style={styles.infoText}>Verified check-in</Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <Ionicons name="time-outline" size={18} color="#38BDF8" />
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
