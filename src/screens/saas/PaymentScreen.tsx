import type * as React from "react";
import { PaymentScreenView, MetricView, PaymentFiltersView, TableView, PlatformPaymentsDashboardView, ChartView, RecentView, ReceiptModalView, ReceiptDetailView } from "./PaymentScreen.presentation";
import { makeMemberSelectorStyles, makeStyles } from "./PaymentScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Polygon,
  Polyline,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { membersApi } from "../../services/api/members";
import { membershipPlansApi, paymentsApi } from "../../services/api/operations";
import { gymsApi } from "../../services/api/operations";
import { getApiErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import type { DeveloperGym, Gym, Member, Payment } from "../../types/saas";
import { formatCurrency } from "../../utils/formatters";
import { AccessDeniedScreen } from "./AccessDeniedScreen";

export function usePaymentScreenPresentation() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles: any = useMemo(
    () => ({
      ...makeStyles(colors, width),
      ...makeMemberSelectorStyles(colors),
    }),
    [colors, width],
  );
  const allowed = useAuthStore((s) => s.hasPermission("manage_payments"));
  const isSuperAdmin = useAuthStore((s) => s.user?.role === "super_admin");
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [memberId, setMemberId] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(true);
  const [memberSearch, setMemberSearch] = useState("");
  const [planId, setPlanId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!showMembers) setShowMembers(true);
  }, [showMembers]);
  const pq = useQuery({
    queryKey: ["operations", "payments", "dashboard"],
    queryFn: () => paymentsApi.list({ limit: 200 }),
    enabled: allowed,
  });
  const mq = useQuery({
    queryKey: ["members", "payments-dashboard"],
    queryFn: () => membersApi.list({ limit: 200 }),
    enabled: allowed,
  });
  const plq = useQuery({
    queryKey: ["operations", "membership-plans", "payments-dashboard"],
    queryFn: () => membershipPlansApi.list({ limit: 100 }),
    enabled: allowed,
  });
  const gq = useQuery({
    queryKey: ["gyms", "payments-platform-dashboard"],
    queryFn: () => gymsApi.list({ limit: 200 }),
    enabled: allowed && isSuperAdmin,
    retry: false,
  });
  const developerGq = useQuery({
    queryKey: ["gyms", "developer", "payments-platform-dashboard"],
    queryFn: gymsApi.listDeveloper,
    enabled: allowed && isSuperAdmin,
    retry: false,
  });
  const payments = pq.data ?? [],
    allMembers = mq.data ?? [],
    plans = plq.data ?? [];
  const members = allMembers.filter(
    (candidate) =>
      !payments.some(
        (payment) =>
          payment.member_id === candidate.id && payment.status === "paid",
      ),
  );
  const member = members.find((m) => m.id === memberId) ?? members[0];
  useEffect(() => {
    if (!planId) return;
    const selectedPlan = (plq.data ?? []).find((plan) => plan.id === planId);
    if (selectedPlan) setAmount(String(selectedPlan.price_cents / 100));
  }, [planId, plq.data]);
  const shown = payments.filter((p) => {
    const paidDate = p.paid_at ? new Date(p.paid_at) : null;
    return (
      (tab === "all" || p.status === tab) &&
      (statusFilter === "all" || p.status === statusFilter) &&
      (planFilter === "all" || p.membership_plan_id === planFilter) &&
      (methodFilter === "all" || p.method.toLowerCase() === methodFilter) &&
      (monthFilter === "all" ||
        (paidDate &&
          `${paidDate.getFullYear()}-${paidDate.getMonth()}` ===
            monthFilter)) &&
      `${p.member_name ?? ""} ${p.member_id} ${p.membership_plan_name ?? ""}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    );
  });
  const total = payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount_cents, 0);
  const pending = payments
    .filter((p) => p.status !== "paid")
    .reduce((s, p) => s + p.amount_cents, 0);
  const save = useMutation({
    mutationFn: () => {
      const n = Number(amount);
      if (!member || !n)
        throw new Error("Select a member and enter a valid amount.");
      return paymentsApi.create({
        member_id: member.id,
        membership_plan_id: planId,
        amount_cents: Math.round(n * 100),
        currency: "INR",
        method,
        status: "paid",
        paid_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      setAmount("");
      setNotice("Payment recorded successfully.");
      qc.invalidateQueries({ queryKey: ["operations", "payments"] });
    },
  });
  if (!allowed) return { kind: "view1" as const, props: {  } };
  if (isSuperAdmin) {
    return { kind: "view2" as const, props: { PlatformPaymentsDashboard, payments, allMembers, gq, developerGq, pq, mq } };
  }
  return { kind: "view3" as const, props: { styles, colors, search, setSearch, Metric, total, pending, members, setTab, tab, PaymentFilters, plans, planFilter, setPlanFilter, statusFilter, setStatusFilter, methodFilter, setMethodFilter, monthFilter, setMonthFilter, Table, shown, Chart, Recent, payments, setShowMembers, member, showMembers, memberSearch, setMemberSearch, setMemberId, setPlanId, planId, amount, setAmount, setMethod, method, notice, save, Quick } };
}

export function PaymentScreen(...args: Parameters<typeof usePaymentScreenPresentation>): React.JSX.Element {
  return <PaymentScreenView model={usePaymentScreenPresentation(...args)} />;
}
export function useMetricPresentation({ s, icon, color, label, value, onPress, selected }: any) { return ({ kind: "view1" as const, props: { onPress, label, s, selected, color, icon, value } }); }

function Metric(...args: Parameters<typeof useMetricPresentation>): React.JSX.Element {
  return <MetricView model={useMetricPresentation(...args)} />;
}
export function usePaymentFiltersPresentation({
  s,
  colors,
  search,
  setSearch,
  plans,
  planFilter,
  setPlanFilter,
  statusFilter,
  setStatusFilter,
  methodFilter,
  setMethodFilter,
  monthFilter,
  setMonthFilter,
}: any) {
  const cycle = (
    current: string,
    options: string[],
    setValue: (value: string) => void,
  ) => setValue(options[(options.indexOf(current) + 1) % options.length]);
  const months = [
    "all",
    ...Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - index);
      return `${date.getFullYear()}-${date.getMonth()}`;
    }),
  ];
  const monthLabel =
    monthFilter === "all"
      ? "All Months"
      : new Date(
          Number(monthFilter.split("-")[0]),
          Number(monthFilter.split("-")[1]),
          1,
        ).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  return { kind: "view1" as const, props: { s, colors, search, setSearch, cycle, planFilter, plans, setPlanFilter, statusFilter, setStatusFilter, methodFilter, setMethodFilter, monthFilter, months, setMonthFilter, monthLabel } };
}

function PaymentFilters(...args: Parameters<typeof usePaymentFiltersPresentation>): React.JSX.Element {
  return <PaymentFiltersView model={usePaymentFiltersPresentation(...args)} />;
}

export function useTablePresentation({ data, s }: { data: Payment[]; s: any }) {
  return { kind: "view1" as const, props: { s, data } };
}

function Table(...args: Parameters<typeof useTablePresentation>): React.JSX.Element {
  return <TableView model={useTablePresentation(...args)} />;
}
export function usePlatformPaymentsDashboardPresentation({
  payments,
  members,
  gyms,
  developerGyms,
  loading,
  error,
}: {
  payments: Payment[];
  members: Member[];
  gyms: Gym[];
  developerGyms: DeveloperGym[];
  loading: boolean;
  error: unknown;
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors, 1200), [colors]);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const paid = payments.filter((item) => item.status === "paid");
  const due = payments.filter((item) => item.status !== "paid" && item.status !== "refunded");
  const totalRevenue = paid.reduce((sum, item) => sum + item.amount_cents, 0);
  const totalDues = due.reduce((sum, item) => sum + item.amount_cents, 0);
  const isCurrentSubscription = (gym: DeveloperGym) => {
    const subscription = gym.subscription;
    if (!subscription || (subscription.status !== "active" && subscription.status !== "trialing")) return false;
    return !subscription.current_period_ends_at || new Date(subscription.current_period_ends_at).getTime() >= Date.now();
  };
  const subscribedGyms = developerGyms.filter(isCurrentSubscription);
  const trialGyms = developerGyms.filter((gym) => isCurrentSubscription(gym) && gym.subscription?.status === "trialing");
  const applicationRevenue = developerGyms
    .filter((gym) => gym.subscription?.status === "active")
    .reduce((sum, gym) => sum + (gym.subscription?.amount_cents ?? 0), 0);
  const subscriptionRevenue = developerGyms
    .filter(isCurrentSubscription)
    .reduce((sum, gym) => sum + (gym.subscription?.amount_cents ?? 0), 0);
  const gymRows = gyms.map((gym) => ({
    gym,
    revenue: paid.filter((item) => item.gym_id === gym.id).reduce((sum, item) => sum + item.amount_cents, 0),
    dues: due.filter((item) => item.gym_id === gym.id).reduce((sum, item) => sum + item.amount_cents, 0),
    members: members.filter((item) => item.gym_id === gym.id).length,
  })).sort((left, right) => right.revenue - left.revenue);
  const maxRevenue = Math.max(...gymRows.map((row) => row.revenue), 1);
  const expiryMembers = members.filter((member) => member.membership_ends_at).sort((left, right) => new Date(left.membership_ends_at!).getTime() - new Date(right.membership_ends_at!).getTime()).slice(0, 12);
  const relatedGymRows = selectedMetric === "application" || selectedMetric === "subscribed" || selectedMetric === "trial" || selectedMetric === "subscription-value"
    ? developerGyms.filter((gym) => selectedMetric === "application" ? gym.subscription?.status === "active" : selectedMetric === "trial" ? isCurrentSubscription(gym) && gym.subscription?.status === "trialing" : isCurrentSubscription(gym))
    : gymRows.filter((row) => selectedMetric === "active" ? row.gym.status === "active" : selectedMetric === "revenue" || selectedMetric === "dues" || selectedMetric === "members");
  const relatedMetricTitle = selectedMetric === "application" ? "Gyms contributing application earnings" : selectedMetric === "subscribed" ? "Currently subscribed gyms" : selectedMetric === "trial" ? "Gyms using the free trial" : selectedMetric === "subscription-value" ? "Gyms included in subscription value" : selectedMetric === "revenue" ? "Gym member revenue by gym" : selectedMetric === "dues" ? "Pending dues by gym" : selectedMetric === "active" ? "Active gyms" : selectedMetric === "members" ? "Member count by gym" : "Select a metric card to view related gyms";
  return { kind: "view1" as const, props: { styles, colors, loading, error, Metric, totalRevenue, setSelectedMetric, selectedMetric, totalDues, gyms, members, applicationRevenue, subscribedGyms, trialGyms, subscriptionRevenue, relatedMetricTitle, relatedGymRows, gymRows, maxRevenue, expiryMembers, developerGyms , activeGymCount: gyms.filter((gym) => gym.status === "active").length} };
}

function PlatformPaymentsDashboard(...args: Parameters<typeof usePlatformPaymentsDashboardPresentation>): React.JSX.Element {
  return <PlatformPaymentsDashboardView model={usePlatformPaymentsDashboardPresentation(...args)} />;
}

export function useChartPresentation({ s }: any) {
  const query = useQuery({
    queryKey: ["operations", "payments", "overview-chart"],
    queryFn: () => paymentsApi.list({ limit: 200 }),
    retry: false,
  });
  const months = [5, 4, 3, 2, 1, 0].map((monthsAgo) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    return date;
  });
  const values = months.map((target) => {
    return (query.data ?? [])
      .filter(
        (p) =>
          p.status === "paid" &&
          p.paid_at &&
          new Date(p.paid_at).getMonth() === target.getMonth() &&
          new Date(p.paid_at).getFullYear() === target.getFullYear(),
      )
      .reduce((sum, p) => sum + p.amount_cents, 0);
  });
  const max = Math.max(...values, 1);
  const monthLabels = months.map((date) =>
    date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
  );
  const compact = (cents: number) => {
    const rupees = cents / 100;
    return rupees >= 100000
      ? `₹${(rupees / 100000).toFixed(1)}L`
      : rupees >= 1000
        ? `₹${Math.round(rupees / 1000)}K`
        : `₹${Math.round(rupees)}`;
  };
  return { kind: "view1" as const, props: { s, compact, max, values, monthLabels } };
}

function Chart(...args: Parameters<typeof useChartPresentation>): React.JSX.Element {
  return <ChartView model={useChartPresentation(...args)} />;
}
export function useRecentPresentation({ data, s }: { data: Payment[]; s: any }) {
  const visibleTransactions = [...data]
    .sort(
      (left, right) =>
        new Date(right.paid_at ?? right.created_at).getTime() -
        new Date(left.paid_at ?? left.created_at).getTime(),
    )
    .slice(0, 4);
  const [showPaidRecords, setShowPaidRecords] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showReceiptMembers, setShowReceiptMembers] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const membersQuery = useQuery({
    queryKey: ["members", "expiry-reminders"],
    queryFn: () => membersApi.list({ limit: 200 }),
    retry: false,
  });
  const allPaymentsQuery = useQuery({
    queryKey: ["operations", "payments", "receipt-members"],
    queryFn: () => paymentsApi.list({ limit: 200 }),
    retry: false,
  });
  const paidRecords = (allPaymentsQuery.data ?? data).filter(
    (payment) => payment.status === "paid",
  );
  const now = new Date();
  const monthlyPaidRecords = paidRecords.filter(
    (payment) =>
      payment.paid_at &&
      new Date(payment.paid_at).getMonth() === now.getMonth() &&
      new Date(payment.paid_at).getFullYear() === now.getFullYear(),
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reminderMembers = (membersQuery.data ?? [])
    .map((member) => ({
      member,
      days: member.membership_ends_at
        ? Math.ceil(
            (new Date(`${member.membership_ends_at}T00:00:00`).getTime() -
              today.getTime()) /
              86400000,
          )
        : 999,
    }))
    .filter((item) => item.days >= 0 && item.days <= 5)
    .sort((a, b) => a.days - b.days);
  return { kind: "view1" as const, props: { s, visibleTransactions, setShowPaidRecords, setShowReminders, setShowReceiptMembers, showPaidRecords, paidRecords, showReminders, reminderMembers, showReceiptMembers, monthlyPaidRecords, setReceiptPayment, ReceiptModal, receiptPayment } };
}

function Recent(...args: Parameters<typeof useRecentPresentation>): React.JSX.Element {
  return <RecentView model={useRecentPresentation(...args)} />;
}
const Quick = ({ s }: any) => null;

export function useReceiptModalPresentation({
  payment,
  onClose,
  s,
}: {
  payment: Payment | null;
  onClose: () => void;
  s: any;
}) {
  if (!payment) return null;
  const receiptNumber = `RCP-${payment.id.replaceAll("-", "").slice(0, 12).toUpperCase()}`;
  const paidDate = payment.paid_at
    ? new Date(payment.paid_at).toLocaleDateString()
    : "—";
  const printReceipt = () => {
    if (typeof window !== "undefined") window.print();
  };
  const receiptText = `PulseFit Gym\nPayment Receipt #${receiptNumber}\nMember: ${payment.member_name ?? "Member"}\nPlan: ${payment.membership_plan_name ?? "No plan"}\nAmount: ${formatCurrency(payment.amount_cents, payment.currency)}\nMethod: ${payment.method.toUpperCase()}\nDate: ${paidDate}\nTransaction ID: ${payment.provider_reference ?? payment.id}`;
  const downloadReceipt = async () => {
    // jsPDF depends on browser/Node encodings that are not available in the
    // Hermes runtime. Keep it out of the native module initialization path.
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const amountText = `INR ${new Intl.NumberFormat("en-IN").format(payment.amount_cents / 100)}`;
    pdf.setFillColor(124, 92, 255);
    pdf.rect(0, 0, 210, 32, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text("PULSEFIT", 18, 18);
    pdf.setFontSize(9);
    pdf.text("GYM MANAGEMENT", 18, 25);
    pdf.setFontSize(18);
    pdf.text("PAYMENT RECEIPT", 192, 18, { align: "right" });
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(10);
    pdf.text(`#${receiptNumber}`, 192, 25, { align: "right" });
    pdf.setFontSize(12);
    pdf.text("PulseFit Gym", 18, 45);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text("123 Fitness Street, Pune, Maharashtra 411001", 18, 51);
    pdf.text("Phone: +91 98765 43210  |  Email: info@pulsefit.com", 18, 56);
    pdf.setDrawColor(226, 232, 240);
    pdf.line(18, 65, 192, 65);
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text("Member Details", 18, 76);
    pdf.setFontSize(10);
    pdf.text("Name", 18, 86);
    pdf.text("Member ID", 18, 94);
    pdf.setFont("helvetica", "normal");
    pdf.text(payment.member_name ?? "Member", 192, 86, { align: "right" });
    pdf.text(payment.member_id.slice(0, 16).toUpperCase(), 192, 94, {
      align: "right",
    });
    pdf.line(18, 104, 192, 104);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text("Payment Details", 18, 115);
    const rows = [
      ["Membership Plan", payment.membership_plan_name ?? "No plan"],
      ["Payment Date", paidDate],
      ["Payment Method", payment.method.toUpperCase()],
      [
        "Transaction ID",
        payment.provider_reference ?? payment.id.slice(0, 20).toUpperCase(),
      ],
    ];
    rows.forEach(([label, value], index) => {
      const y = 126 + index * 10;
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(10);
      pdf.text(label, 18, y);
      pdf.setTextColor(15, 23, 42);
      pdf.setFont("helvetica", "bold");
      pdf.text(value, 192, y, { align: "right" });
    });
    pdf.setFillColor(245, 243, 255);
    pdf.roundedRect(18, 171, 174, 18, 3, 3, "F");
    pdf.setTextColor(109, 40, 217);
    pdf.setFontSize(12);
    pdf.text("Total Paid", 24, 182);
    pdf.setFontSize(16);
    pdf.text(amountText, 186, 182, { align: "right" });
    pdf.setTextColor(51, 65, 85);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Thank you for being with PulseFit!", 18, 215);
    pdf.text("Stay fit, stay healthy.", 18, 221);
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(16);
    pdf.text("PulseFit", 185, 215, { align: "right" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text("Authorized Signature", 185, 222, { align: "right" });
    pdf.save(`${receiptNumber}.pdf`);
  };
  const shareReceipt = async () => {
    if (typeof navigator === "undefined") return;
    if (navigator.share) {
      await navigator.share({
        title: "PulseFit Payment Receipt",
        text: receiptText,
      });
      return;
    }
    await navigator.clipboard?.writeText(receiptText);
  };
  return { kind: "view1" as const, props: { onClose, s, payment, ReceiptDetail, paidDate, downloadReceipt, receiptNumber, printReceipt, shareReceipt } };
}

function ReceiptModal(...args: Parameters<typeof useReceiptModalPresentation>): React.JSX.Element {
  return <ReceiptModalView model={useReceiptModalPresentation(...args)} />;
}
export function useReceiptDetailPresentation({
  s,
  label,
  value,
}: {
  s: any;
  label: string;
  value: string;
}) { return ({ kind: "view1" as const, props: { s, label, value } }); }

function ReceiptDetail(...args: Parameters<typeof useReceiptDetailPresentation>): React.JSX.Element {
  return <ReceiptDetailView model={useReceiptDetailPresentation(...args)} />;
}




