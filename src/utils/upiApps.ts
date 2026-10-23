export const upiApps = [
  { id: "gpay", name: "Google Pay", initials: "G", color: "#1967D2", iosScheme: "gpay", androidPackage: "com.google.android.apps.nbu.paisa.user" },
  { id: "bhim", name: "BHIM", initials: "B", color: "#187744", iosScheme: "bhim", androidPackage: "in.org.npci.upiapp" },
  { id: "phonepe", name: "PhonePe", initials: "P", color: "#6739B7", iosScheme: "phonepe", androidPackage: "com.phonepe.app" },
] as const;

export type UpiApp = typeof upiApps[number];

export function upiAppPaymentUrl(app: UpiApp, paymentUri: string) {
  if (!paymentUri.startsWith("upi://pay?")) throw new Error("Invalid UPI payment request");
  return `${app.iosScheme}://upi/pay?${paymentUri.slice("upi://pay?".length)}`;
}
