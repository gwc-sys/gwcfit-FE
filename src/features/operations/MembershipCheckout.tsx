import { MemberPaymentReceipt } from "./MemberPaymentReceipt";
import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View, useWindowDimensions } from "react-native";
import * as IntentLauncher from "expo-intent-launcher";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { FormTextField } from "../../components/FormTextField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { NoticeBanner } from "../../components/NoticeBanner";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useAuthStore } from "../../store/useAuthStore";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { showAlert } from "../../utils/appAlert";
import { getApiErrorMessage } from "../../services/api/client";
import { membershipCheckoutApi as api, upiPaymentUri, type PaymentQrSettings, type MembershipCheckoutPayment } from "../../services/api/membershipCheckout";
import type { MemberMembership } from "../../types/member";
import { upiApps, upiAppPaymentUrl, type UpiApp } from "../../utils/upiApps";

const emptySettings: PaymentQrSettings = { payee_name: "", upi_id: "", qr_image_url: "", enabled: false };
type Plan = NonNullable<MemberMembership["available_plans"]>[number];

function QrPreview({ settings, amount }: { settings: PaymentQrSettings; amount?: number }) {
  const { colors } = useAppTheme();
  const [imageError, setImageError] = useState(false);
  useEffect(() => setImageError(false), [settings.qr_image_url]);
  return (
    <View style={{ gap: 8, alignItems: "center" }}>
      {settings.payee_name ? (
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>
          Pay {settings.payee_name}
        </Text>
      ) : null}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          padding: 8,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
        {settings.qr_image_url ? (
          !imageError ? (
            <Image
              accessibilityLabel="Gym's uploaded PhonePe or BHIM payment QR"
              source={{ uri: settings.qr_image_url }}
              style={{ width: 140, height: 140 }}
              resizeMode="contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <Text style={{ color: colors.danger, fontSize: 12 }}>
              QR could not be loaded. Contact your gym before paying.
            </Text>
          )
        ) : settings.upi_id ? (
          <QRCode
            value={upiPaymentUri(settings, amount)}
            size={140}
            backgroundColor="#FFFFFF"
            color="#000000"
          />
        ) : (
          <Text style={{ color: colors.danger, fontSize: 12 }}>No payment QR is configured.</Text>
        )}
      </View>
      {settings.upi_id ? (
        <Text selectable style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "500" }}>
          {settings.upi_id}
        </Text>
      ) : null}
    </View>
  );
}

function useCheckoutRefresh() {
  const client = useQueryClient();
  return async () => { await Promise.all([
    client.invalidateQueries({ queryKey: ["membership-checkout"] }),
    client.invalidateQueries({ queryKey: ["member"] }),
    client.invalidateQueries({ queryKey: ["operations", "payments"] }),
    client.invalidateQueries({ queryKey: ["members"] }),
  ]); };
}

export function MemberPlanCheckout({ plans, renderPlans }: { plans: Plan[]; renderPlans?: (choose: (plan: Plan) => void, enabled: boolean) => ReactNode }) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const refresh = useCheckoutRefresh();
  const query = useQuery({ queryKey: ["membership-checkout", "member"], queryFn: api.member, refetchInterval: 15000 });
  const [selected, setSelected] = useState<Plan | null>(null);
  const [reference, setReference] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [openingApp, setOpeningApp] = useState<string | null>(null);
  const settings = query.data?.settings;
  const openPaymentApp = async (app: UpiApp) => {
    if (!settings || !selected || openingApp) return;
    setOpeningApp(app.id); setLinkError(null);
    const uri = upiPaymentUri(settings, selected.price_cents);
    try {
      if (Platform.OS === "android") {
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", { data: uri, packageName: app.androidPackage });
      } else {
        await Linking.openURL(upiAppPaymentUrl(app, uri));
      }
    } catch {
      setLinkError(`Could not open ${app.name}. Make sure it is installed and set up, try another app, or scan the QR. No payment has been confirmed.`);
    } finally { setOpeningApp(null); }
  };
  const submit = useMutation({ mutationFn: api.submit, onSuccess: async payment => {
    setSelected(null); setReference("");
    setNotice(`Payment submitted for ${payment.plan_name}. Your gym will verify the transaction before activating your plan.`);
    await refresh();
  } });
  const check = useMutation({ mutationFn: api.check, onSuccess: async payment => {
    setNotice(payment.status === "paid" ? `Payment confirmed for ${payment.plan_name}. Your membership is active.` : payment.status === "failed" ? "This payment was rejected, cancelled or expired. Check the details below." : `Your payment for ${payment.plan_name} is still awaiting gym verification.`);
    await refresh();
  } });
  const card = { backgroundColor: colors.surface, padding: 16, borderRadius: 16, gap: 12 } as const;
  const planColumns = Platform.OS === "web" && width >= 1520 ? 4 : Platform.OS === "web" && width >= 1180 ? 2 : 1;
  const planWidth = planColumns === 4 ? "24%" : planColumns === 2 ? "48.8%" : "100%";
  return <View style={{ gap: 14 }}>
    {!renderPlans ? <View style={{ gap: 5, marginBottom: 4 }}><Text accessibilityRole="header" style={{ color: colors.ink, fontSize: 22, fontWeight: "700" }}>Choose your plan</Text><Text style={{ color: colors.muted, fontSize: 14 }}>Find the membership that fits your training goals.</Text></View> : null}
    {query.isLoading ? <Text style={{ color: colors.muted }}>Loading payment options...</Text> : query.error ? <><NoticeBanner tone="error" message={getApiErrorMessage(query.error)} /><PrimaryButton title="Retry payment options" variant="secondary" onPress={() => query.refetch()} /></> : renderPlans ? renderPlans(plan => { setReference(""); submit.reset(); setLinkError(null); setSelected(plan); }, Boolean(settings?.enabled)) : <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
      {plans.map((plan, index) => <View key={plan.plan_uuid} style={{ width: planWidth, minWidth: 0, backgroundColor: colors.surface, borderColor: index === 1 ? colors.primary : colors.border, borderWidth: 1, borderRadius: 14, padding: 16, gap: 12, justifyContent: "space-between" }}>
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <Text style={{ color: colors.ink, fontSize: 18, fontWeight: "700", flexShrink: 1 }}>{plan.name}</Text>
            {index === 1 ? <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>POPULAR</Text> : null}
          </View>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 7, flexWrap: "wrap" }}>
            <Text style={{ color: colors.ink, fontSize: 26, fontWeight: "700" }}>{formatCurrency(plan.price_cents, plan.currency)}</Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>/ {plan.duration_days} days</Text>
          </View>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          {plan.description ? <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 18 }}>{plan.description}</Text> : null}
          <Text style={{ color: colors.muted, fontSize: 13 }}>Up to {plan.daily_visit_limit ?? 4} visits per day</Text>
          {plan.benefits.map((benefit, benefitIndex) => <View key={`${benefitIndex}-${benefit}`} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>✓</Text>
            <Text style={{ color: colors.ink, fontSize: 13, lineHeight: 18, flex: 1 }}>{benefit}</Text>
          </View>)}
        </View>
        <PrimaryButton title="Choose plan" disabled={!settings || !settings.enabled || plan.currency !== "INR" || plan.price_cents <= 0} onPress={() => { setReference(""); submit.reset(); setSelected(plan); }} />
      </View>)}
    </View>}
    {settings && !settings.enabled ? <Text style={{ color: colors.muted }}>Your gym has not enabled online payments yet. Contact the gym to join.</Text> : null}
    <NoticeBanner message={notice} />
    <NoticeBanner message={linkError ?? (check.error ? getApiErrorMessage(check.error) : null)} tone="error" />
    {(query.data?.payments ?? []).map(payment => <View key={payment.id} style={card}>
      <Text style={{ color: colors.muted, fontSize: 13 }}>Membership plan</Text>
      <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "600" }}>{payment.plan_name}</Text>
      <Text style={{ color: colors.muted }}>{formatCurrency(payment.amount_cents, payment.currency)} · {payment.status === "paid" ? "Confirmed" : payment.status === "failed" ? "Not approved / expired" : "Awaiting gym verification"}</Text>
      {payment.transaction_reference ? <Text selectable style={{ color: colors.muted }}>Reference: {payment.transaction_reference}</Text> : null}
      {payment.review_note ? <Text style={{ color: colors.muted }}>{payment.review_note}</Text> : null}
      {payment.status === "paid" ? <View style={{ gap: 6 }}>
        <Text style={{ color: colors.ink }}>Start date: {formatDate(payment.start_date)}</Text>
        <Text style={{ color: colors.ink }}>End date: {formatDate(payment.expiry_date)}</Text>
      </View> : payment.status === "pending" ? <Text style={{ color: colors.muted }}>Membership dates will be set after gym approval.</Text> : null}
      {payment.status === "paid" ? <MemberPaymentReceipt paymentId={payment.id} /> : null}
      {payment.status === "pending" ? <PrimaryButton title="Check status" variant="secondary" loading={check.isPending && check.variables === payment.id} disabled={check.isPending} onPress={() => check.mutate(payment.id)} /> : null}
    </View>)}
    <Modal visible={Boolean(selected)} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { if (!submit.isPending) setSelected(null); }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets contentContainerStyle={{ padding: 20, gap: 20 }}>
          <PrimaryButton title="Cancel" variant="secondary" disabled={submit.isPending} onPress={() => setSelected(null)} />
          <Text style={{ color: colors.muted, fontSize: 14 }}>Selected membership plan</Text>
          <Text accessibilityRole="header" style={{ color: colors.ink, fontSize: 25, fontWeight: "600" }}>{selected?.name}</Text>
          <Text style={{ color: colors.ink, fontSize: 22 }}>{selected ? formatCurrency(selected.price_cents, selected.currency) : ""}</Text>
          {selected?.description ? <Text style={{ color: colors.muted }}>{selected.description}</Text> : null}
          {selected ? <Text style={{ color: colors.ink }}>Up to {selected.daily_visit_limit ?? 4} visits per day</Text> : null}
          {selected?.benefits.map((benefit, index) => <Text key={`${index}-${benefit}`} style={{ color: colors.ink }}>✓ {benefit}</Text>)}
          <Text style={{ color: colors.muted }}>{selected?.duration_days} days. Confirm the gym and amount before paying. An active plan of the same type will be extended; a different plan starts when payment is confirmed.</Text>
          {settings?.enabled && selected && selected.currency === "INR" ? <View style={card}>
            <Text style={{ color: colors.ink, fontSize: 17, fontWeight: "600" }}>Pay the gym directly</Text>
            <View style={{ backgroundColor: colors.surfaceElevated, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}><QrPreview settings={settings} amount={selected.currency === "INR" ? selected.price_cents : undefined} /></View>
            <Text style={{ color: colors.muted }}>Scan using another device or choose a payment app on this phone. After paying, enter the transaction reference for gym verification.</Text>
            {settings.upi_id && selected.currency === "INR" ? <View style={{ gap: 8 }}>
              <Text style={{ color: colors.ink, fontSize: 15, fontWeight: "600" }}>Pay using</Text>
              {upiApps.map(app => <Pressable key={app.id} accessibilityRole="button" accessibilityLabel={`Pay with ${app.name}`} accessibilityState={{ disabled: Boolean(openingApp) || submit.isPending, busy: openingApp === app.id }} disabled={Boolean(openingApp) || submit.isPending} onPress={() => openPaymentApp(app)} style={({ pressed }) => ({ minHeight: 56, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.background, opacity: pressed || openingApp && openingApp !== app.id ? 0.6 : 1 })}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: app.color, alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "700" }}>{app.initials}</Text></View>
                <Text style={{ flex: 1, color: colors.ink, fontSize: 16, fontWeight: "500" }}>{app.name}</Text>
                <Text style={{ color: colors.muted, fontSize: 14 }}>{openingApp === app.id ? "Opening..." : "Open"}</Text>
              </Pressable>)}
            </View> : null}
            <FormTextField label="Transaction reference / UTR" value={reference} onChangeText={setReference} autoCapitalize="characters" maxLength={180} placeholder="From your completed payment" />
            <PrimaryButton title="Submit for verification" loading={submit.isPending && submit.variables?.method === "manual_qr"} disabled={submit.isPending || reference.trim().length < 6} onPress={() => submit.mutate({ plan_uuid: selected.plan_uuid, quoted_amount_cents: selected.price_cents, quoted_currency: selected.currency, method: "manual_qr", transaction_reference: reference })} />
          </View> : null}
          {settings?.enabled && selected && selected.currency !== "INR" ? <Text style={{ color: colors.muted }}>UPI QR payment is available only for INR plans. Contact your gym for other payment options.</Text> : null}
          <NoticeBanner message={submit.error ? getApiErrorMessage(submit.error) : linkError} tone="error" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </View>;
}

export function OwnerMembershipPayments() {
  const { colors } = useAppTheme();
  const canConfigure = useAuthStore(state => state.hasPermission("configure_gym"));
  const refresh = useCheckoutRefresh();
  const settingsQuery = useQuery({ queryKey: ["membership-checkout", "settings"], queryFn: api.settings });
  const reviews = useQuery({ queryKey: ["membership-checkout", "reviews"], queryFn: api.reviews, refetchInterval: 15000 });
  const [draft, setDraft] = useState(emptySettings);
  const [editing, setEditing] = useState(false);
  const [verifiedReference, setVerifiedReference] = useState("");
  const [verifiedAmount, setVerifiedAmount] = useState("");
  const [reviewing, setReviewing] = useState<MembershipCheckoutPayment | null>(null);
  const [note, setNote] = useState("");
  const upload = useMutation({ mutationFn: async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: false, quality: 1 });
    if (result.canceled || !result.assets[0]) return null;
    const asset = result.assets[0];
    const actions = Math.max(asset.width, asset.height) > 1200 ? [{ resize: asset.width >= asset.height ? { width: 1200 } : { height: 1200 } }] : [];
    const normalized = await manipulateAsync(asset.uri, actions, { compress: 0.9, format: SaveFormat.JPEG, base64: true });
    if (!normalized.base64) throw new Error("Could not read the selected image. Please choose it again.");
    return api.uploadQr(normalized.base64);
  }, onSuccess: image => {
    if (image) setDraft(current => ({ ...current, qr_image_url: image.qr_image_url, upi_id: image.upi_id, payee_name: current.payee_name || image.payee_name }));
  } });
  const save = useMutation({ mutationFn: api.saveSettings, onSuccess: async () => { setEditing(false); await refresh(); } });
  const review = useMutation({ mutationFn: ({ id, decision, note }: { id: string; decision: "approve" | "reject"; note: string }) => api.review(id, decision, note, verifiedReference, /^\d+(\.\d{1,2})?$/.test(verifiedAmount.trim()) ? Math.round(Number(verifiedAmount) * 100) : null), onSuccess: async () => { setReviewing(null); setNote(""); await refresh(); } });
  const panel = { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 18, gap: 10 } as const;
  const text = { color: colors.textSecondary, fontSize: 13, lineHeight: 20 };
  return <View style={{ gap: 16 }}>
    <View style={panel}>
      <Text accessibilityRole="header" style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700" }}>Membership payment QR</Text>
      <Text style={text}>Upload your gym's PhonePe or BHIM QR. Members pay directly to your account and submit their transaction reference for review.</Text>
      {settingsQuery.isLoading ? <Text style={text}>Loading payment settings...</Text> : settingsQuery.error ? <><NoticeBanner tone="error" message={getApiErrorMessage(settingsQuery.error)} /><PrimaryButton title="Retry settings" variant="secondary" onPress={() => settingsQuery.refetch()} /></> : <>
        <Text style={text}>QR payments: <Text style={{ color: settingsQuery.data?.enabled ? colors.success : colors.danger, fontWeight: "600" }}>{settingsQuery.data?.enabled ? "Enabled." : "Disabled."}</Text></Text>
        {!editing && canConfigure ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => { setDraft(settingsQuery.data ?? emptySettings); save.reset(); upload.reset(); setEditing(true); }}
            style={{ width: "100%", height: 44, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", marginTop: 4 }}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: "600" }}>Configure payment QR</Text>
          </Pressable>
        ) : null}
      </>}
      {editing ? <>
        <FormTextField label="Payee / business name" value={draft.payee_name} onChangeText={payee_name => setDraft(v => ({ ...v, payee_name }))} />
        <PrimaryButton title={draft.qr_image_url ? "Replace PhonePe / BHIM QR" : "Upload PhonePe / BHIM QR"} icon="image-outline" variant="secondary" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10 }} loading={upload.isPending} disabled={save.isPending || upload.isPending} onPress={() => upload.mutate()} />
        <Text style={text}>Select the original reusable payment QR from your photos. Check the detected UPI ID before enabling payments.</Text>
        <NoticeBanner message={upload.error ? getApiErrorMessage(upload.error) : null} tone="error" />
        <FormTextField label={draft.qr_image_url.startsWith("data:") ? "UPI ID detected from QR" : "Gym UPI ID (optional alternative)"} editable={!draft.qr_image_url.startsWith("data:")} value={draft.upi_id} onChangeText={upi_id => setDraft(v => ({ ...v, upi_id }))} autoCapitalize="none" placeholder="yourgym@bank" helper={draft.qr_image_url.startsWith("data:") ? "Members can open their UPI app to pay this same account." : "If no image is uploaded, a QR can be generated from this ID."} />
        {draft.upi_id || draft.qr_image_url ? <View style={{ padding: 12, backgroundColor: colors.surfaceElevated, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}><QrPreview settings={draft} /></View> : null}
        {draft.qr_image_url ? <PrimaryButton title="Remove uploaded QR" variant="secondary" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10 }} disabled={upload.isPending || save.isPending} onPress={() => { setDraft(v => ({ ...v, qr_image_url: "", upi_id: "" })); upload.reset(); }} /> : null}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44 }}><Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>Enable QR payments</Text><Switch accessibilityLabel="Enable gym QR payments" trackColor={{ false: colors.separator, true: colors.success }} thumbColor="#FFFFFF" value={draft.enabled} onValueChange={enabled => setDraft(v => ({ ...v, enabled }))} /></View>
        <NoticeBanner message={save.error ? getApiErrorMessage(save.error) : null} tone="error" />
        <PrimaryButton title="Save payment settings" style={{ backgroundColor: colors.primary, borderRadius: 12, height: 48, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 8, elevation: 6 }} loading={save.isPending} disabled={save.isPending || upload.isPending} onPress={() => save.mutate(draft)} />
        <PrimaryButton title="Cancel" variant="secondary" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, height: 48 }} disabled={save.isPending || upload.isPending} onPress={() => setEditing(false)} />
      </> : null}
    </View>
    <View style={panel}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text accessibilityRole="header" style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700" }}>Payment verification requests{reviews.data ? ` (${reviews.data.length})` : " (0)"}</Text>
        <Pressable accessibilityRole="button" onPress={() => reviews.refetch()} disabled={reviews.isFetching}>
          <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>{reviews.isFetching ? "Refreshing..." : "Refresh requests"}</Text>
        </Pressable>
      </View>
      <Text style={text}>Check the reference and amount in your bank or UPI app before confirming receipt.</Text>
      {reviews.error ? <><NoticeBanner tone="error" message={getApiErrorMessage(reviews.error)} /><PrimaryButton title="Retry payment reviews" variant="secondary" onPress={() => reviews.refetch()} /></> : reviews.isLoading ? <Text style={text}>Loading...</Text> : !reviews.data?.length ? (
        <View style={{ height: 64, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", marginTop: 4 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>No payments awaiting review.</Text>
        </View>
      ) : reviews.data.map(payment => <View key={payment.id} style={{ borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border, paddingTop: 14, gap: 8 }}>
        <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "600" }}>{payment.member_name ?? "Member"} - {payment.plan_name}</Text>
        <Text style={text}>{formatCurrency(payment.amount_cents, payment.currency)}</Text>
        <Text selectable style={text}>Reference: {payment.transaction_reference}</Text>
        <PrimaryButton title="Review payment" variant="secondary" onPress={() => { setReviewing(payment); setVerifiedReference(""); setVerifiedAmount(""); setNote(""); review.reset(); }} />
      </View>)}
    </View>
    <Modal visible={Boolean(reviewing)} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { if (!review.isPending) setReviewing(null); }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Text style={{ color: colors.ink, fontSize: 23, fontWeight: "600" }}>Verify payment</Text>
        <Text style={text}>{reviewing?.member_name} - {reviewing?.plan_name}</Text>
        <Text style={{ color: colors.ink, fontSize: 22 }}>{reviewing ? formatCurrency(reviewing.amount_cents, reviewing.currency) : ""}</Text>
        <Text selectable style={text}>Reference: {reviewing?.transaction_reference}</Text>
        <FormTextField label="Bank transaction reference / UTR" value={verifiedReference} onChangeText={setVerifiedReference} placeholder="Enter reference from your bank" />
        <FormTextField label="Amount received" value={verifiedAmount} onChangeText={setVerifiedAmount} keyboardType="decimal-pad" placeholder="Enter amount from your bank" />
        <FormTextField label="Review note" placeholder="Optional explanation for the member" value={note} onChangeText={setNote} maxLength={500} />
        <NoticeBanner tone="error" message={review.error ? getApiErrorMessage(review.error) : null} />
        <PrimaryButton title="Confirm receipt and activate plan" disabled={review.isPending} loading={review.isPending && review.variables?.decision === "approve"} onPress={() => showAlert("Confirm payment received?", "Only confirm after checking this transaction in your gym's bank account. This activates the member's plan.", [{ text: "Cancel", style: "cancel" }, { text: "Confirm received", onPress: () => reviewing && review.mutate({ id: reviewing.id, decision: "approve", note }) }])} />
        <PrimaryButton title="Reject payment" variant="secondary" disabled={review.isPending} onPress={() => showAlert("Reject this payment?", "The member will see the payment as not approved. No membership will be activated.", [{ text: "Cancel", style: "cancel" }, { text: "Reject", style: "destructive", onPress: () => reviewing && review.mutate({ id: reviewing.id, decision: "reject", note }) }])} />
        <PrimaryButton title="Close" variant="secondary" disabled={review.isPending} onPress={() => setReviewing(null)} />
      </ScrollView></SafeAreaView>
    </Modal>
  </View>;
}

