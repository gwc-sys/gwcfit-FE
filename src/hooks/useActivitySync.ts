import { useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/useAuthStore";
import { getApiErrorMessage, getApiStatus } from "../services/api/client";
import { memberApi } from "../services/api/member";
import type { MemberActivitySync } from "../types/member";

async function getStoredItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function setStoredItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // Ignore storage errors
    }
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Ignore storage errors
  }
}

type Snapshot = { date: string; hours: number[]; status: string; calories: number; target: number };

export function useActivitySync(snapshot: Snapshot) {
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const [syncStatus, setSyncStatus] = useState("pending");
  const [error, setError] = useState<string | null>(null);
  const flush = useRef<(() => Promise<void>) | null>(null);
  const capture = useRef<((s: Snapshot) => void) | null>(null);
  const latest = useRef(snapshot);
  latest.current = snapshot;
  const signature = JSON.stringify(snapshot);

  useEffect(() => {
    if (!userId) return;
    let disposed = false,
      busy = false;
    let lastAttempt = 0;
    let pending: Record<string, MemberActivitySync> = {};
    let device = "";
    let writes = Promise.resolve();
    const key = `activity-queue-${userId}`;

    const persist = () => {
      const data = JSON.stringify(pending);
      writes = writes.then(() => setStoredItem(key, data)).catch(() => {
        if (!disposed) setSyncStatus("local-error");
      });
    };

    const drain = async () => {
      if (disposed || busy || !device || useAuthStore.getState().user?.id !== userId) return;
      busy = true;
      lastAttempt = Date.now();
      try {
        for (const [date, data] of Object.entries(pending).sort()) {
          if (disposed) break;
          await memberApi.syncActivity(data);
          if (disposed) break;
          if (pending[date] === data) delete pending[date];
          persist();
        }
        if (!disposed) {
          setError(null);
          setSyncStatus(Object.keys(pending).length ? "pending" : "saved");
          void queryClient.invalidateQueries({ queryKey: ["member", "activity"] });
          void queryClient.invalidateQueries({ queryKey: ["member", "dashboard"] });
        }
      } catch (failure) {
        if (!disposed) {
          const status = getApiStatus(failure);
          setSyncStatus(status ? "server-error" : "offline");
          setError(
            status === 404
              ? "Activity saving is unavailable on the backend. Update or restart the backend, then retry."
              : getApiErrorMessage(failure)
          );
        }
      } finally {
        busy = false;
      }
    };

    const save = (s: Snapshot) => {
      const date = new Date(s.date);
      if (!Number.isFinite(date.getTime())) return;
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const previous = pending[dateKey];
      const hasSteps = Array.isArray(s.hours) && s.hours.length === 24 && s.hours.some((h) => h > 0);
      const isTracking = s.status === "tracking" || hasSteps;
      const resolvedSource: MemberActivitySync["source"] = isTracking
        ? Platform.OS === "ios"
          ? "ios_pedometer"
          : "android_foreground"
        : "dashboard";
      pending[dateKey] = {
        activity_date: dateKey,
        utc_offset_minutes: -date.getTimezoneOffset(),
        device_id: device,
        source: resolvedSource,
        ...(isTracking && Array.isArray(s.hours) && s.hours.length === 24
          ? { hourly_steps: s.hours }
          : previous?.hourly_steps
          ? { hourly_steps: previous.hourly_steps, source: previous.source }
          : {}),
      };
      setSyncStatus("pending");
      persist();
      if (Date.now() - lastAttempt >= 2000) void drain();
    };

    void (async () => {
      try {
        device =
          (await getStoredItem("activity-device-id")) ??
          `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        await setStoredItem("activity-device-id", device);
        const stored = JSON.parse((await getStoredItem(key)) ?? "{}");
        if (stored && typeof stored === "object" && !Array.isArray(stored)) pending = stored;
        if (disposed) return;
        flush.current = drain;
        capture.current = save;
        save(latest.current);
        void drain();
      } catch {
        if (!disposed) setSyncStatus("local-error");
      }
    })();

    const interval = setInterval(() => {
      if (AppState.currentState === "active" && Object.keys(pending).length) void drain();
    }, 15000);
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active" || state === "background") void drain();
    });
    return () => {
      disposed = true;
      capture.current = null;
      flush.current = null;
      clearInterval(interval);
      listener.remove();
    };
  }, [userId, queryClient]);

  useEffect(() => {
    capture.current?.(latest.current);
  }, [signature]);

  return { status: syncStatus, error, retry: () => flush.current?.() };
}
