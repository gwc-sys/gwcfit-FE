import { Pressable } from "./NativePressable";
import { controlMetrics } from "../theme/theme";
import { useReducedMotion } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Modal, ScrollView, Text, View, useWindowDimensions } from "react-native";
import type * as React from "react";
import type { useDatePickerFieldPresentation } from "../../../components/DatePickerField";

export function DatePickerFieldView({ model }: { model: ReturnType<typeof useDatePickerFieldPresentation> }): React.ReactNode {
  const reduceMotion = useReducedMotion();
  const { height, fontScale = 1 } = useWindowDimensions();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, label, displayDate, value, open, show, error, colors, helper, setOpen, width, setVisibleMonth, year, month, MONTHS, WEEKDAYS, cells, dateValue, minimum, onChange, todayDisabled } = model.props;
      const useDateList = (Math.min(width - 32, 390) - 34) / 7 < controlMetrics.minimumTouchSize || fontScale > 1.3;
      return ((
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${displayDate(value)}`}
        accessibilityState={{ expanded: open }}
        onPress={show}
        style={({ pressed }) => [
          styles.trigger,
          error && styles.errorBorder,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.iconBox}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.valueWrap}>
          <Text style={[styles.value, !value && styles.placeholder]}>
            {displayDate(value)}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}

      <Modal
        animationType={reduceMotion ? "none" : "fade"}
        transparent
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <Pressable accessibilityRole="button" style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable accessibilityRole="button"
            accessibilityViewIsModal
            onPress={(event) => event.stopPropagation()}
            style={[styles.calendar, { width: Math.min(width - 32, 390), maxHeight: height - 40 }]}
           accessible={false} importantForAccessibility="no">
            <View style={styles.modalTop}>
              <View>
                <Text style={styles.modalEyebrow}>SELECT DATE</Text>
                <Text style={styles.modalSelection}>
                  {value ? displayDate(value) : "Pick a day"}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Close calendar"
                accessibilityRole="button"
                onPress={() => setOpen(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color={colors.ink} />
              </Pressable>
            </View>
            <View style={styles.monthRow}>
              <Pressable
                accessibilityLabel="Previous month"
                accessibilityRole="button"
                onPress={() => setVisibleMonth(new Date(year, month - 1, 1))}
                style={styles.navButton}
              >
                <Ionicons name="chevron-back" size={20} color={colors.ink} />
              </Pressable>
              <Text style={styles.monthTitle}>
                {MONTHS[month]} {year}
              </Text>
              <Pressable
                accessibilityLabel="Next month"
                accessibilityRole="button"
                onPress={() => setVisibleMonth(new Date(year, month + 1, 1))}
                style={styles.navButton}
              >
                <Ionicons name="chevron-forward" size={20} color={colors.ink} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 320, flexShrink: 1 }} contentContainerStyle={styles.grid}>
              {!useDateList && WEEKDAYS.map((day) => (
                <Text key={day} style={styles.weekday}>
                  {day}
                </Text>
              ))}
              {cells.map((day, index) => {
                if (!day)
                  return useDateList ? null : <View key={`empty-${index}`} style={styles.dayCell} />;
                const date = new Date(year, month, day);
                const nextValue = dateValue(date);
                const isSelected = nextValue === value;
                const isToday = nextValue === dateValue(new Date());
                const disabled = Boolean(
                  minimum &&
                  date <
                    new Date(
                      minimum.getFullYear(),
                      minimum.getMonth(),
                      minimum.getDate(),
                    ),
                );
                return (
                  <Pressable
                    key={nextValue}
                    accessibilityRole="button"
                    accessibilityLabel={displayDate(nextValue)}
                    accessibilityState={{ selected: isSelected, disabled }}
                    disabled={disabled}
                    onPress={() => {
                      onChange(nextValue);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.dayCell,
                      useDateList && { width: "100%", aspectRatio: undefined, minHeight: controlMetrics.minimumTouchSize, paddingVertical: 8, paddingHorizontal: 12, alignItems: "flex-start", borderRadius: 12 },
                      isSelected && styles.selectedDay,
                      isToday && !isSelected && styles.today,
                      disabled && styles.disabledDay,
                      pressed && !disabled && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                        disabled && styles.disabledText,
                      ]}
                    >
                      {useDateList ? displayDate(nextValue) : day}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.footer}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Clear ${label}`}
                onPress={() => {
                  onChange("");
                  setOpen(false);
                }}
                style={styles.textButton}
              >
                <Text style={styles.textButtonLabel}>Clear</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Select today"
                accessibilityState={{ disabled: todayDisabled }}
                disabled={todayDisabled}
                onPress={() => {
                  onChange(dateValue(new Date()));
                  setOpen(false);
                }}
                style={[styles.todayButton, todayDisabled && styles.disabledDay]}
              >
                <Ionicons name="today-outline" size={17} color="#FFFFFF" />
                <Text style={styles.todayButtonLabel}>Today</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  ));
    }
  }
}
