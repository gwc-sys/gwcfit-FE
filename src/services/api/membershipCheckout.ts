import { apiClient } from "./client";

export type PaymentQrSettings = {
  payee_name: string; upi_id: string; qr_image_url: string; enabled: boolean;
};
export type MembershipCheckoutPayment = {
  id: string; plan_uuid: string; plan_name: string; member_name?: string | null;
  amount_cents: number; currency: string; status: string; method: "manual_qr";
  transaction_reference?: string | null; review_note?: string | null;
  start_date?: string | null; expiry_date?: string | null;
};
const base = "/membership-checkout";
export const membershipCheckoutApi = {
  member: async () => (await apiClient.get<{ settings: PaymentQrSettings; payments: MembershipCheckoutPayment[] }>(`${base}/member`)).data,
  submit: async (payload: { plan_uuid: string; method: "manual_qr"; quoted_amount_cents: number; quoted_currency: string; transaction_reference?: string }) =>
    (await apiClient.post<MembershipCheckoutPayment>(`${base}/member`, payload)).data,
  check: async (id: string) => (await apiClient.post<MembershipCheckoutPayment>(`${base}/member/${id}/check`)).data,
  settings: async () => (await apiClient.get<PaymentQrSettings>(`${base}/settings`)).data,
  saveSettings: async (payload: PaymentQrSettings) => (await apiClient.put<PaymentQrSettings>(`${base}/settings`, payload)).data,
  uploadQr: async (image_base64: string) => (await apiClient.post<{ qr_image_url: string; upi_id: string; payee_name: string }>(`${base}/settings/qr-image`, { image_base64 })).data,
  reviews: async () => (await apiClient.get<MembershipCheckoutPayment[]>(`${base}/reviews`)).data,
  review: async (id: string, decision: "approve" | "reject", note: string, verified_reference: string, verified_amount_cents: number | null) =>
    (await apiClient.post<MembershipCheckoutPayment>(`${base}/reviews/${id}`, { decision, note, verified_reference, verified_amount_cents })).data,
};

export function upiPaymentUri(settings: PaymentQrSettings, amountCents?: number) {
  const values = { pa: settings.upi_id, pn: settings.payee_name, cu: "INR", ...(amountCents == null ? {} : { am: (amountCents / 100).toFixed(2) }) };
  return `upi://pay?${Object.entries(values).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&")}`;
}
