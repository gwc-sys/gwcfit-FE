import { useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { apiClient, getApiErrorMessage } from "../../services/api/client";
import { PrimaryButton } from "../../components/PrimaryButton";
import { NoticeBanner } from "../../components/NoticeBanner";
import {
  formatReceiptPaidAt,
  formatReceiptPaymentMethod,
  generateMemberReceiptPdf,
  memberReceiptHtml,
  receiptAmount,
  receiptZeroAmount,
  type MemberReceiptData,
} from "../../utils/memberReceipt";

export function MemberPaymentReceipt({
  paymentId,
  mobileBottomSheet = false,
  durationDays = null,
  children,
}: {
  paymentId: string;
  mobileBottomSheet?: boolean;
  durationDays?: number | null;
  children?: (open: () => void, busy: boolean) => ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const generate = useMutation({
    mutationFn: async () => {
      const receipt = (await apiClient.get<MemberReceiptData>(`/member/payments/${paymentId}/receipt`)).data;
      const html = memberReceiptHtml(receipt);
      if (Platform.OS !== "web") {
        const result = await Print.printToFileAsync({ html, width: 595, height: 842 });
        return { receipt, html, uri: result.uri, blob: null as Blob | null };
      }
      const blob = await generateMemberReceiptPdf(receipt);
      return { receipt, html, uri: null as string | null, blob };
    },
  });

  const open = () => {
    setShareError(null);
    setVisible(true);
    generate.mutate();
  };

  const save = async () => {
    const data = generate.data;
    if (!data) return;
    try {
      if (Platform.OS === "web" && data.blob) {
        const url = URL.createObjectURL(data.blob);
        const link = document.createElement("a");
        link.href = url;
        const safeGymSlug = (data.receipt.gym_name || "Gym")
          .trim()
          .replace(/[^a-zA-Z0-9_-]+/g, "_");
        link.download = `${safeGymSlug}_${data.receipt.receipt_number}.pdf`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } else if (data.uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(data.uri, {
          mimeType: "application/pdf",
          UTI: "com.adobe.pdf",
          dialogTitle: "Save or share payment receipt",
        });
      } else {
        await Print.printAsync({ html: data.html });
      }
    } catch {
      setShareError("Could not save or share this receipt. Please try again.");
    }
  };

  const receipt = generate.data?.receipt;
  const gymDisplayName = (receipt?.gym_name || "Gym").trim();
  const gymUpper = gymDisplayName.toUpperCase();
  const amountFormatted = receipt ? receiptAmount(receipt) : "";
  const zeroFormatted = receipt ? receiptZeroAmount(receipt) : "";
  const paymentMode = receipt ? formatReceiptPaymentMethod(receipt.payment_method) : "";
  const paidOn = receipt ? formatReceiptPaidAt(receipt.paid_at) : "";
  const txReference = receipt ? receipt.transaction_reference || receipt.payment_uuid : "";

  return (
    <>
      {children ? (
        children(open, generate.isPending)
      ) : (
        <PrimaryButton
          title="View receipt"
          variant="secondary"
          loading={generate.isPending}
          onPress={open}
        />
      )}
      <Modal
        visible={visible}
        transparent
        animationType={mobileBottomSheet ? "slide" : "fade"}
        onRequestClose={() => setVisible(false)}
      >
        {mobileBottomSheet ? (
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.72)",
              justifyContent: "flex-end",
            }}
            onPress={() => setVisible(false)}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "#1C1C1E",
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                borderTopWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.08)",
                paddingHorizontal: 18,
                paddingTop: 12,
                paddingBottom: 28,
              }}
            >
              {/* Drag Handle Bar */}
              <View
                style={{
                  width: 42,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.22)",
                  alignSelf: "center",
                  marginBottom: 14,
                }}
              />

              {/* Modal Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "800",
                      color: "#34C759",
                      letterSpacing: 0.8,
                      textTransform: "uppercase",
                      marginBottom: 2,
                    }}
                  >
                    OFFICIAL RECEIPT
                  </Text>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "900",
                      color: "#FFFFFF",
                      letterSpacing: -0.3,
                    }}
                  >
                    Payment Receipt
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close receipt"
                  onPress={() => setVisible(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#1C1C1E",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="close" size={16} color="#F2F2F7" />
                </Pressable>
              </View>

              {generate.isPending ? (
                <View style={{ paddingVertical: 40, alignItems: "center" }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#F2F2F7" }}>
                    Generating official receipt...
                  </Text>
                </View>
              ) : generate.error ? (
                <View style={{ gap: 12, paddingVertical: 16 }}>
                  <NoticeBanner tone="error" message={getApiErrorMessage(generate.error)} />
                  <PrimaryButton title="Try again" onPress={() => generate.mutate()} />
                </View>
              ) : receipt ? (
                <>
                  {/* White Receipt Sheet */}
                  <View
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 20,
                      padding: 18,
                      gap: 14,
                      marginBottom: 16,
                    }}
                  >
                    {/* Gym Header & Confirmed Badge */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        paddingBottom: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: "#F2F2F7",
                      }}
                    >
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "900",
                            color: "#000000",
                            letterSpacing: -0.2,
                          }}
                        >
                          {gymUpper}
                        </Text>
                        {receipt.gym_phone ? (
                          <Text style={{ fontSize: 11, color: "#1C1C1E", marginTop: 2 }}>
                            {`Phone: ${receipt.gym_phone}`}
                          </Text>
                        ) : receipt.gym_address ? (
                          <Text style={{ fontSize: 11, color: "#1C1C1E", marginTop: 2 }}>
                            {receipt.gym_address}
                          </Text>
                        ) : null}
                      </View>

                      <View
                        style={{
                          backgroundColor: "rgba(52, 199, 89, 0.14)",
                          borderRadius: 999,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "800",
                            color: "#34C759",
                            letterSpacing: 0.4,
                          }}
                        >
                          CONFIRMED
                        </Text>
                      </View>
                    </View>

                    {/* Highlighted Summary Box */}
                    <View
                      style={{
                        backgroundColor: "#F2F2F7",
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <View style={{ flex: 1.3 }}>
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: "700",
                            color: "#1C1C1E",
                            letterSpacing: 0.5,
                          }}
                        >
                          TOTAL PAID
                        </Text>
                        <Text
                          style={{
                            fontSize: 17,
                            fontWeight: "900",
                            color: "#000000",
                            marginTop: 2,
                          }}
                        >
                          {amountFormatted}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: "700",
                            color: "#1C1C1E",
                            letterSpacing: 0.5,
                          }}
                        >
                          METHOD
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "800",
                            color: "#1C1C1E",
                            marginTop: 2,
                          }}
                        >
                          {paymentMode}
                        </Text>
                      </View>
                    </View>

                    {/* Metadata Lines */}
                    <View style={{ gap: 7 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ fontSize: 12, color: "#1C1C1E" }}>Member:</Text>
                        <Text style={{ fontSize: 12, fontWeight: "800", color: "#000000" }}>
                          {receipt.member_name}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ fontSize: 12, color: "#1C1C1E" }}>Receipt No:</Text>
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "700",
                            color: "#1C1C1E",
                            fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                          }}
                        >
                          {receipt.receipt_number.length > 16
                            ? `${receipt.receipt_number.slice(0, 13)}...`
                            : receipt.receipt_number}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ fontSize: 12, color: "#1C1C1E" }}>Paid On:</Text>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: "#1C1C1E" }}>
                          {paidOn}
                        </Text>
                      </View>
                    </View>

                    {/* Itemized Table Breakdown */}
                    <View
                      style={{
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: "#F2F2F7",
                        gap: 6,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "800", color: "#000000" }}>
                          {durationDays
                            ? `${receipt.plan_name} (${durationDays} Days)`
                            : receipt.plan_name}
                        </Text>
                        <Text style={{ fontSize: 12, fontWeight: "800", color: "#000000" }}>
                          {amountFormatted}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ fontSize: 11, color: "#1C1C1E" }}>Subtotal / Tax</Text>
                        <Text style={{ fontSize: 11, color: "#1C1C1E" }}>
                          {`${amountFormatted} / 0.00`}
                        </Text>
                      </View>

                      <View
                        style={{
                          paddingTop: 10,
                          marginTop: 4,
                          borderTopWidth: 1,
                          borderTopColor: "#F2F2F7",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: "900", color: "#000000" }}>
                          Total Paid:
                        </Text>
                        <Text style={{ fontSize: 15, fontWeight: "900", color: "#E91E63" }}>
                          {amountFormatted}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <NoticeBanner tone="error" message={shareError} />

                  {/* Modal Action Button */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Download Receipt PDF"
                    onPress={save}
                    style={({ pressed }) => [
                      {
                        backgroundColor: "#E91E63",
                        borderRadius: 14,
                        paddingVertical: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        shadowColor: "#000000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.35,
                        shadowRadius: 10,
                        elevation: 4,
                      },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Ionicons name="download-outline" size={16} color="#FFFFFF" />
                    <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>
                      Download Receipt PDF
                    </Text>
                  </Pressable>
                </>
              ) : null}
            </Pressable>
          </Pressable>
        ) : (
        <View style={styles.backdrop}>
          <SafeAreaView style={styles.safeArea}>
            {/* Top Action Toolbar */}
            <View style={styles.toolbar}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close receipt"
                onPress={() => setVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={18} color="#FFFFFF" />
                <Text style={styles.closeBtnText}>Close</Text>
              </Pressable>

              {generate.data ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    Platform.OS === "web" ? "Download receipt PDF" : "Save or share receipt PDF"
                  }
                  onPress={save}
                  style={styles.downloadBtn}
                >
                  <Ionicons name="download-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.downloadBtnText}>
                    {Platform.OS === "web" ? "Download Receipt PDF" : "Save / Share PDF"}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {generate.isPending ? (
                <View style={styles.statusBox}>
                  <Text style={styles.statusText}>Generating official receipt...</Text>
                </View>
              ) : generate.error ? (
                <View style={styles.statusBox}>
                  <NoticeBanner tone="error" message={getApiErrorMessage(generate.error)} />
                  <PrimaryButton title="Try again" onPress={() => generate.mutate()} />
                </View>
              ) : receipt ? (
                <View style={styles.paperSheet}>
                  {/* 1. Header */}
                  <View style={styles.sheetHeader}>
                    <View style={styles.sheetHeaderLeft}>
                      <Text style={styles.gymTitle}>{gymUpper}</Text>
                      {receipt.gym_phone ? (
                        <Text style={styles.gymMeta}>Phone: {receipt.gym_phone}</Text>
                      ) : null}
                      {receipt.gym_address ? (
                        <Text style={styles.gymMeta}>{receipt.gym_address}</Text>
                      ) : null}
                    </View>
                    <View style={styles.sheetHeaderRight}>
                      <Text style={styles.receiptHeading}>PAYMENT RECEIPT</Text>
                      <View style={styles.confirmedBadge}>
                        <Text style={styles.confirmedBadgeText}>CONFIRMED</Text>
                      </View>
                    </View>
                  </View>

                  {/* 2. Total Amount Paid Banner */}
                  <View style={styles.amountBanner}>
                    <View>
                      <Text style={styles.bannerLabel}>TOTAL AMOUNT PAID</Text>
                      <Text style={styles.bannerAmount}>{amountFormatted}</Text>
                    </View>
                    <View style={styles.bannerRight}>
                      <Text style={styles.bannerLabel}>PAYMENT METHOD</Text>
                      <Text style={styles.bannerMethod}>{paymentMode}</Text>
                    </View>
                  </View>

                  {/* 3. Side-by-Side Member Info & Transaction Details Cards */}
                  <View style={styles.cardsRow}>
                    <View style={styles.infoCard}>
                      <Text style={styles.cardHeading}>MEMBER INFORMATION</Text>
                      <View style={styles.cardDashedDivider} />
                      <View style={styles.fieldBlock}>
                        <Text style={styles.fieldLabel}>Member Name</Text>
                        <Text selectable style={styles.fieldValue}>
                          {receipt.member_name}
                        </Text>
                      </View>
                      <View style={styles.fieldBlock}>
                        <Text style={styles.fieldLabel}>Member ID</Text>
                        <Text selectable style={styles.fieldValueMono}>
                          {receipt.member_code}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.infoCard}>
                      <Text style={styles.cardHeading}>TRANSACTION DETAILS</Text>
                      <View style={styles.cardDashedDivider} />
                      <View style={styles.fieldBlock}>
                        <Text style={styles.fieldLabel}>Receipt Number</Text>
                        <Text selectable style={styles.fieldValueMono}>
                          {receipt.receipt_number}
                        </Text>
                      </View>
                      <View style={styles.fieldBlock}>
                        <Text style={styles.fieldLabel}>Paid On</Text>
                        <Text selectable style={styles.fieldValue}>
                          {paidOn}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* 4. Itemized Table */}
                  <View style={styles.tableWrap}>
                    <View style={styles.tableHeaderBar}>
                      <Text style={[styles.tableHeaderText, { flex: 2 }]}>DESCRIPTION / PLAN</Text>
                      <Text style={[styles.tableHeaderText, { flex: 1 }]}>PAYMENT MODE</Text>
                      <Text style={[styles.tableHeaderText, { flex: 1, textAlign: "right" }]}>
                        AMOUNT
                      </Text>
                    </View>
                    <View style={styles.tableRow}>
                      <View style={{ flex: 2, paddingRight: 8 }}>
                        <Text style={styles.planNameText}>{receipt.plan_name}</Text>
                        <Text style={styles.planSubText}>Gym Membership Subscription</Text>
                      </View>
                      <Text style={[styles.tableCellMode, { flex: 1 }]}>{paymentMode}</Text>
                      <Text style={[styles.tableCellAmount, { flex: 1, textAlign: "right" }]}>
                        {amountFormatted}
                      </Text>
                    </View>
                  </View>

                  {/* 5. Transaction Reference & Totals Summary */}
                  <View style={styles.summaryRow}>
                    <View style={styles.txRefBox}>
                      <Text style={styles.txRefLabel}>TRANSACTION REFERENCE</Text>
                      <Text selectable style={styles.txRefValue}>
                        {txReference}
                      </Text>
                    </View>

                    <View style={styles.totalsCol}>
                      <View style={styles.totalsLine}>
                        <Text style={styles.totalsLineLabel}>Subtotal:</Text>
                        <Text style={styles.totalsLineVal}>{amountFormatted}</Text>
                      </View>
                      <View style={styles.totalsLine}>
                        <Text style={styles.totalsLineLabel}>Tax / Fees:</Text>
                        <Text style={styles.totalsLineVal}>{zeroFormatted}</Text>
                      </View>
                      <View style={styles.totalsTotalLine}>
                        <Text style={styles.totalsTotalLabel}>Total Paid:</Text>
                        <Text style={styles.totalsTotalVal}>{amountFormatted}</Text>
                      </View>
                    </View>
                  </View>

                  {/* 6. Thank You Section */}
                  <View style={styles.thankYouSection}>
                    <Text style={styles.thankYouTitle}>
                      Thank you for training with {gymDisplayName}!
                    </Text>
                    <Text style={styles.thankYouSub}>
                      This document serves as an official proof of payment. Please retain this
                      receipt for your records.
                    </Text>
                  </View>

                  {/* 7. Bottom Footer */}
                  <View style={styles.sheetFooter}>
                    <Text style={styles.footerText}>
                      {gymDisplayName} — Receipt {receipt.receipt_number}
                    </Text>
                    <Text style={styles.footerText}>Page 1 of 1</Text>
                  </View>
                </View>
              ) : null}

              <NoticeBanner tone="error" message={shareError} />
            </ScrollView>
          </SafeAreaView>
        </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.86)",
  },
  safeArea: {
    flex: 1,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    maxWidth: 760,
    width: "100%",
    alignSelf: "center",
  },
  closeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  closeBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E91E63",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  downloadBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: "center",
  },
  statusBox: {
    maxWidth: 520,
    width: "100%",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 24,
    gap: 14,
    marginTop: 40,
  },
  statusText: {
    color: "#1C1C1E",
    fontSize: 14,
    textAlign: "center",
  },
  paperSheet: {
    maxWidth: 720,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 36,
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
    gap: 12,
  },
  sheetHeaderLeft: {
    flex: 1,
  },
  gymTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.3,
  },
  gymMeta: {
    fontSize: 12,
    color: "#1C1C1E",
    marginTop: 3,
  },
  sheetHeaderRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  receiptHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: 0.4,
  },
  confirmedBadge: {
    backgroundColor: "rgba(52, 199, 89, 0.14)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  confirmedBadgeText: {
    color: "#34C759",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  amountBanner: {
    marginTop: 20,
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: "#F2F2F7",
    borderLeftWidth: 4,
    borderLeftColor: "#34C759",
    borderRadius: 4,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1C1C1E",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bannerAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000000",
  },
  bannerRight: {
    alignItems: "flex-end",
  },
  bannerMethod: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
  cardsRow: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  infoCard: {
    flex: 1,
    minWidth: 240,
    borderWidth: 1,
    borderColor: "#F2F2F7",
    borderRadius: 4,
    padding: 14,
    backgroundColor: "#FFFFFF",
  },
  cardHeading: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: 0.4,
  },
  cardDashedDivider: {
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderBottomColor: "#F2F2F7",
    marginVertical: 9,
  },
  fieldBlock: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 10.5,
    color: "#1C1C1E",
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
  },
  fieldValueMono: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#000000",
  },
  tableWrap: {
    marginTop: 20,
  },
  tableHeaderBar: {
    backgroundColor: "#000000",
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tableHeaderText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
  },
  planNameText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
  },
  planSubText: {
    fontSize: 11,
    color: "#1C1C1E",
    marginTop: 2,
  },
  tableCellMode: {
    fontSize: 12,
    color: "#1C1C1E",
  },
  tableCellAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
  },
  summaryRow: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 18,
  },
  txRefBox: {
    flex: 1,
    minWidth: 220,
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#F2F2F7",
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  txRefLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#1C1C1E",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  txRefValue: {
    fontSize: 11,
    color: "#1C1C1E",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  totalsCol: {
    minWidth: 210,
    flexGrow: 0.6,
  },
  totalsLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalsLineLabel: {
    fontSize: 12,
    color: "#1C1C1E",
  },
  totalsLineVal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000000",
  },
  totalsTotalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 6,
    borderTopWidth: 1.5,
    borderTopColor: "#000000",
  },
  totalsTotalLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
  },
  totalsTotalVal: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
  },
  thankYouSection: {
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
    alignItems: "center",
  },
  thankYouTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    marginBottom: 4,
  },
  thankYouSub: {
    fontSize: 11,
    color: "#1C1C1E",
    textAlign: "center",
  },
  sheetFooter: {
    marginTop: 36,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 10,
    color: "#1C1C1E",
  },
});
