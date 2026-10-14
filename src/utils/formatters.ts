import type { PaymentStatus } from "../types/saas";

const rupeeCurrencyAliases = new Set(["rs", "rs.", "₹", "rupee", "rupees"]);

export function normalizeCurrencyCode(currency?: string | null, fallback = "INR") {
  const trimmed = currency?.trim();

  if (!trimmed) {
    return fallback;
  }

  const compact = trimmed.replace(/\s+/g, "").toLowerCase();
  if (rupeeCurrencyAliases.has(compact)) {
    return "INR";
  }

  if (/^[a-z]{3}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  return trimmed.toUpperCase();
}

export function formatCurrency(cents: number, currency = "INR") {
  const normalizedCurrency = normalizeCurrencyCode(currency);
  const locale = normalizedCurrency === "INR" ? "en-IN" : "en-US";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: normalizedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(cents / 100);
  } catch {
    const symbol = normalizedCurrency === "INR" ? "₹" : normalizedCurrency === "USD" ? "$" : normalizedCurrency === "EUR" ? "€" : `${normalizedCurrency} `;
    return `${symbol}${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(cents / 100)}`;
  }
}

function parseDisplayDate(value: string) {
  const calendarDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!calendarDate) return new Date(value);
  const [, year, month, day] = calendarDate.map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date : new Date(NaN);
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  const date = parseDisplayDate(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function formatRole(role: string) {
  const labels: Record<string, string> = {
    super_admin: "Super Admin",
    gym_owner: "Gym Owner",
    sub_admin: "Sub Admin",
    trainer: "Trainer",
    receptionist: "Reception",
    member: "Member"
  };

  if (labels[role]) {
    return labels[role];
  }

  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function paymentTone(status: PaymentStatus) {
  if (status === "paid") {
    return "success" as const;
  }
  if (status === "pending") {
    return "warning" as const;
  }
  if (status === "failed") {
    return "danger" as const;
  }
  return "neutral" as const;
}

export function memberStatusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "active") {
    return "success" as const;
  }
  if (normalized.includes("pending") || normalized.includes("due")) {
    return "warning" as const;
  }
  if (normalized.includes("expired") || normalized.includes("inactive")) {
    return "danger" as const;
  }
  return "neutral" as const;
}

export function getMembershipState(endDate?: string | null) {
  if (!endDate) {
    return { label: "No end date", tone: "neutral" as const };
  }

  const end = parseDisplayDate(endDate);
  if (Number.isNaN(end.getTime())) {
    return { label: "Review date", tone: "warning" as const };
  }

  const today = new Date();
  // Compare calendar dates, not elapsed hours (time zones and DST differ).
  const endDay = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const daysLeft = Math.round((endDay - todayDay) / 86_400_000);
  if (daysLeft < 0) {
    return { label: "Expired", tone: "danger" as const };
  }

  if (daysLeft <= 7) {
    return { label: `${daysLeft} days left`, tone: "warning" as const };
  }

  return { label: "Active", tone: "success" as const };
}
