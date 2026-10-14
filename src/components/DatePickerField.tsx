import type * as React from "react";
import { DatePickerFieldView } from "./DatePickerField.presentation";
import { createStyles } from "./DatePickerField.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { useAppTheme } from "../theme/AppThemeProvider";
import {
  radius,
  shadows,
  spacing,
  typography,
  type ThemeColors,
} from "../theme/theme";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helper?: string;
  minimumDate?: string;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return date.getFullYear() === Number(match[1]) && date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[3]) ? date : null;
}

function dateValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function displayDate(value: string) {
  const date = parseDate(value);
  return date
    ? `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    : "Choose a date";
}

export function useDatePickerFieldPresentation({
  label,
  value,
  onChange,
  error,
  helper,
  minimumDate,
}: Props) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);
  const [visibleMonth, setVisibleMonth] = useState(
    () => selected ?? new Date(),
  );
  const minimum = parseDate(minimumDate ?? "");
  const todayValue = dateValue(new Date());
  const todayDisabled = Boolean(minimum && todayValue < dateValue(minimum));

  const show = () => {
    setVisibleMonth(selected ?? new Date());
    setOpen(true);
  };
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  return { kind: "view1" as const, props: { styles, label, displayDate, value, open, show, error, colors, helper, setOpen, width, setVisibleMonth, year, month, MONTHS, WEEKDAYS, cells, dateValue, minimum, onChange, todayDisabled } };
}

export function DatePickerField(...args: Parameters<typeof useDatePickerFieldPresentation>): React.JSX.Element {
  return <DatePickerFieldView model={useDatePickerFieldPresentation(...args)} />;
}


