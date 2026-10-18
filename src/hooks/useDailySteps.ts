import { useCallback, useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import { Pedometer } from "expo-sensors";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "../store/useAuthStore";

type Day = { date: string; hours: number[] };
const empty = (): Day => ({ date: new Date().toDateString(), hours: Array(24).fill(0) });
export function useDailySteps() {
  const userId = useAuthStore(s => s.user?.id);
  const [day, setDay] = useState<Day>(empty);
  const [status, setStatus] = useState("checking");
  const [attempt, setAttempt] = useState(0);
  const [ask, setAsk] = useState(false);
  const [owner, setOwner] = useState(userId);
  useEffect(() => {
    setStatus("checking"); setDay(empty()); setOwner(userId);
    let disposed = false;
    let generation = 0;
    let subscription: { remove: () => void } | undefined;
    let current = empty();
    const key = `daily-steps-${String(userId ?? "member").replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    let writes = Promise.resolve();
    const publish = () => {
      if (disposed) return;
      setDay({ ...current, hours: [...current.hours] });
      const data = JSON.stringify(current);
      writes = writes.then(() => SecureStore.setItemAsync(key, data)).catch(() => {});
    };
    const start = async () => {
      const run = ++generation;
      subscription?.remove();
      if (current.date !== new Date().toDateString()) { current = empty(); publish(); }
      try {
        const permission = ask ? await Pedometer.requestPermissionsAsync() : await Pedometer.getPermissionsAsync();
        if (disposed || run !== generation) return;
        if (!permission.granted) { setStatus(permission.canAskAgain ? "permission" : "denied"); return; }
        if (!await Pedometer.isAvailableAsync()) { if (!disposed) setStatus("unavailable"); return; }
        if (disposed || run !== generation) return;
        if (current.date !== new Date().toDateString()) current = empty();
        if (Platform.OS === "ios") {
          const now = new Date();
          const midnight = new Date(now); midnight.setHours(0, 0, 0, 0);
          const hours = await Promise.all(Array.from({ length: now.getHours() + 1 }, async (_, hour) => {
            const from = new Date(midnight); from.setHours(hour);
            const to = new Date(midnight); to.setHours(hour + 1);
            const result = await Pedometer.getStepCountAsync(from, to > now ? now : to);
            return result.steps;
          }));
          if (disposed || run !== generation) return;
          current = { date: now.toDateString(), hours: Array.from({ length: 24 }, (_, i) => hours[i] ?? 0) };
          publish(); setStatus("tracking");
        } else {
          let previous = 0;
          subscription = Pedometer.watchStepCount(({ steps }) => {
            if (disposed || run !== generation) return;
            if (current.date !== new Date().toDateString()) current = empty();
            const delta = Math.max(0, steps - previous); previous = steps;
            current.hours[new Date().getHours()] += delta;
            publish();
          });
          publish(); setStatus("tracking");
        }
      } catch { if (!disposed && run === generation) setStatus("error"); }
    };
    void (async () => {
      try {
        const stored = JSON.parse(await SecureStore.getItemAsync(key) ?? "null");
        if (stored?.date === current.date && stored.hours?.length === 24 && stored.hours.every((n: unknown) => typeof n === "number" && Number.isFinite(n) && n >= 0)) current = stored;
      } catch {}
      if (!disposed) { setDay(current); await start(); }
    })();
    const listener = AppState.addEventListener("change", state => {
      if (state === "active") void start();
      else { generation++; subscription?.remove(); }
    });
    const timer = setInterval(() => {
      if (AppState.currentState !== "active") return;
      if (Platform.OS === "ios" || current.date !== new Date().toDateString()) void start();
    }, 30000);
    return () => { disposed = true; generation++; subscription?.remove(); listener.remove(); clearInterval(timer); };
  }, [userId, attempt, ask]);
  const enable = useCallback(() => { setAsk(true); setAttempt(n => n + 1); }, []);
  const visible = owner === userId ? day : empty();
  return { date: visible.date, steps: visible.hours.reduce((a, b) => a + b, 0), hours: visible.hours, status: owner === userId ? status : "checking", enable };
}
