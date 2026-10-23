import { useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { Modal, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { apiClient } from "../../services/api/client";
import { getApiErrorMessage } from "../../services/api/client";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { PrimaryButton } from "../../components/PrimaryButton";
import { NoticeBanner } from "../../components/NoticeBanner";
import { memberReceiptHtml, receiptRows, receiptAmount, type MemberReceiptData } from "../../utils/memberReceipt";

export function MemberPaymentReceipt({ paymentId, children }: { paymentId: string; children?: (open: () => void, busy: boolean) => ReactNode }) {
  const { colors } = useAppTheme();
  const [visible, setVisible] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const generate = useMutation({ mutationFn: async () => {
    const receipt = (await apiClient.get<MemberReceiptData>(`/member/payments/${paymentId}/receipt`)).data;
    const html = memberReceiptHtml(receipt);
    if (Platform.OS !== "web") {
      const result = await Print.printToFileAsync({ html, width: 595, height: 842 });
      return { receipt, html, uri: result.uri, blob: null as Blob | null };
    }
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    let y = 22;
    const text = (value: string, size = 11) => {
      pdf.setFontSize(size);
      const lines = pdf.splitTextToSize(value, 170) as string[];
      for (const line of lines) { if (y > 275) { pdf.addPage(); y = 22; } pdf.text(line, 20, y); y += size * 0.48; }
      y += 4;
    };
    pdf.setFont("helvetica", "bold"); text(receipt.gym_name, 21);
    pdf.setFont("helvetica", "normal");
    if (receipt.gym_address) text(receipt.gym_address);
    if (receipt.gym_phone) text(receipt.gym_phone);
    text("Payment receipt - CONFIRMED", 16); text(receiptAmount(receipt), 23);
    for (const [label, value] of receiptRows(receipt)) text(`${label}: ${value}`);
    return { receipt, html, uri: null as string | null, blob: pdf.output("blob") };
  } });
  const open = () => { setShareError(null); setVisible(true); generate.mutate(); };
  const save = async () => {
    const data = generate.data;
    if (!data) return;
    try {
      if (Platform.OS === "web" && data.blob) {
        const url = URL.createObjectURL(data.blob);
        const link = document.createElement("a"); link.href = url;
        link.download = `${data.receipt.receipt_number}.pdf`; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } else if (data.uri && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(data.uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: "Save or share payment receipt" });
      } else { await Print.printAsync({ html: data.html }); }
    } catch { setShareError("Could not save or share this receipt. Please try again."); }
  };
  return <>
    {children ? children(open, generate.isPending) : <PrimaryButton title="View receipt" variant="secondary" loading={generate.isPending} onPress={open} />}
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setVisible(false)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <PrimaryButton title="Close" variant="secondary" onPress={() => setVisible(false)} />
        <Text accessibilityRole="header" style={{ color: colors.ink, fontSize: 25, fontWeight: "600" }}>Payment receipt</Text>
        {generate.isPending ? <Text style={{ color: colors.muted }}>Generating your receipt...</Text> : generate.error ? <><NoticeBanner tone="error" message={getApiErrorMessage(generate.error)} /><PrimaryButton title="Try again" onPress={() => generate.mutate()} /></> : generate.data ? <>
          <View style={{ backgroundColor: colors.surface, borderRadius: 18, padding: 18, gap: 12 }}>
            <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "600" }}>{generate.data.receipt.gym_name}</Text>
            <Text style={{ color: colors.success }}>Payment confirmed</Text>
            <Text style={{ color: colors.ink, fontSize: 28, fontWeight: "600" }}>{receiptAmount(generate.data.receipt)}</Text>
            {receiptRows(generate.data.receipt).map(([label, value]) => <View key={label} style={{ gap: 4 }}><Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text><Text selectable style={{ color: colors.ink, fontSize: 14, lineHeight: 21 }}>{value}</Text></View>)}
          </View>
          <PrimaryButton title={Platform.OS === "web" ? "Download receipt PDF" : "Save / share receipt PDF"} icon="download-outline" onPress={save} />
        </> : null}
        <NoticeBanner tone="error" message={shareError} />
      </ScrollView></SafeAreaView>
    </Modal>
  </>;
}
