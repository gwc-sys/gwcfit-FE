import type { Member, Payment } from "../../../types/saas";
import { getMembershipState } from "../../../utils/formatters";

export const analyticsRanges = ["7D", "30D", "3M", "1Y"] as const;
export type AnalyticsRange = typeof analyticsRanges[number];

export function rangeStart(range: AnalyticsRange, now: Date) {
  const start = new Date(now);
  if (range === "3M" || range === "1Y") {
    // Clamp month ends rather than allowing e.g. May 31 to overflow February.
    const day = start.getDate();
    start.setDate(1);
    start.setMonth(start.getMonth() - (range === "3M" ? 3 : 12));
    start.setDate(Math.min(day, new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()));
  } else start.setDate(start.getDate() - (range === "7D" ? 7 : 30));
  return start;
}

export function percentageChange(current: number, previous: number): number | null {
  return previous > 0 ? (current - previous) / previous * 100 : null;
}

export function summarizeMembers(members: Member[], start: Date, now = new Date()) {
  const previousStart = new Date(start.getTime() - (now.getTime() - start.getTime()));
  const joined = (member: Member) => new Date(member.joined_at).getTime();
  const currentNew = members.filter(member => joined(member) >= start.getTime() && joined(member) <= now.getTime()).length;
  const previousNew = members.filter(member => joined(member) >= previousStart.getTime() && joined(member) < start.getTime()).length;
  const atStart = members.filter(member => joined(member) < start.getTime()).length;
  return {
    newMembers: currentNew,
    newMemberChange: percentageChange(currentNew, previousNew),
    growth: atStart ? currentNew / atStart * 100 : null,
    expiring: members.filter(isExpiringMember).length,
  };
}

// Reuse the application's existing seven-day membership rule. Invalid dates
// also have a warning tone, so require its actual "days left" state.
export function isExpiringMember(member: Pick<Member, "membership_ends_at">) {
  const state = getMembershipState(member.membership_ends_at);
  return state.tone === "warning" && state.label.endsWith("days left");
}

export function summarizeRevenue(payments: Payment[], range: AnalyticsRange, now = new Date()) {
  const start = rangeStart(range, now);
  const duration = now.getTime() - start.getTime();
  const previousStart = start.getTime() - duration;
  const values = Array.from({ length: range === "7D" ? 7 : 24 }, () => 0);
  let total = 0;
  let previous = 0;
  let count = 0;
  for (const payment of payments) {
    if (payment.status !== "paid" || !payment.paid_at) continue;
    const paidAt = new Date(payment.paid_at).getTime();
    if (!Number.isFinite(paidAt) || !Number.isFinite(payment.amount_cents)) continue;
    if (paidAt >= start.getTime() && paidAt <= now.getTime()) {
      const index = Math.min(values.length - 1, Math.floor((paidAt - start.getTime()) / duration * values.length));
      values[index] += payment.amount_cents;
      total += payment.amount_cents;
      count++;
    } else if (paidAt >= previousStart && paidAt < start.getTime()) previous += payment.amount_cents;
  }
  return { start, total, count, values, change: percentageChange(total, previous) };
}

export function relativeTime(value: string, now = new Date()) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";
  const minutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60000));
  if (minutes < 1) return "Just now";
  const amount = minutes < 60 ? minutes : minutes < 1440 ? Math.floor(minutes / 60) : Math.floor(minutes / 1440);
  const unit = minutes < 60 ? "minute" : minutes < 1440 ? "hour" : "day";
  return `${amount} ${unit}${amount === 1 ? "" : "s"} ago`;
}
