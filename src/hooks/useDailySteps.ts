import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { Accelerometer, Pedometer } from "expo-sensors";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "../store/useAuthStore";

type Day = { date: string; hours: number[] };
const empty = (): Day => ({ date: new Date().toDateString(), hours: Array(24).fill(0) });

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

export function useDailySteps() {
  const userId = useAuthStore((s) => s.user?.id);
  const [day, setDay] = useState<Day>(empty);
  const [status, setStatus] = useState("checking");
  const [attempt, setAttempt] = useState(0);
  const [ask, setAsk] = useState(false);
  const [owner, setOwner] = useState(userId);
  const addStepsRef = useRef<((delta: number) => void) | null>(null);

  useEffect(() => {
    setStatus("checking");
    setDay(empty());
    setOwner(userId);
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
      writes = writes.then(() => setStoredItem(key, data)).catch(() => {});
    };

    addStepsRef.current = (delta: number) => {
      const cleanDelta = Math.max(0, Math.round(delta));
      if (cleanDelta <= 0) return;
      if (current.date !== new Date().toDateString()) {
        current = empty();
      }
      current.hours[new Date().getHours()] += cleanDelta;
      publish();
      setStatus("tracking");
    };

    const start = async () => {
      const run = ++generation;
      subscription?.remove();
      if (current.date !== new Date().toDateString()) {
        current = empty();
        publish();
      }

      // Web / Mobile Browser DeviceMotion sensor support
      if (Platform.OS === "web") {
        const win = globalThis as any;
        if (typeof win.DeviceMotionEvent === "undefined") {
          if (!disposed) {
            setStatus(current.hours.some((h) => h > 0) ? "tracking" : "unavailable");
          }
          return;
        }
        try {
          if (typeof win.DeviceMotionEvent.requestPermission === "function") {
            if (!ask) {
              if (!disposed) setStatus("permission");
              return;
            }
            const perm = await win.DeviceMotionEvent.requestPermission();
            if (disposed || run !== generation) return;
            if (perm !== "granted") {
              setStatus("denied");
              return;
            }
          }
          let lastStepAt = 0;
          let aboveThreshold = false;
          const onMotion = (event: any) => {
            if (disposed || run !== generation) return;
            const acc = event?.accelerationIncludingGravity || event?.acceleration;
            if (!acc || typeof acc.x !== "number") return;
            const magG = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z) / 9.80665;
            const nowMs = Date.now();
            if (magG > 1.22 && !aboveThreshold && nowMs - lastStepAt > 320) {
              aboveThreshold = true;
              lastStepAt = nowMs;
              if (current.date !== new Date().toDateString()) current = empty();
              current.hours[new Date().getHours()] += 1;
              publish();
            } else if (magG < 1.05) {
              aboveThreshold = false;
            }
          };
          win.addEventListener?.("devicemotion", onMotion);
          subscription = {
            remove: () => win.removeEventListener?.("devicemotion", onMotion),
          };
          publish();
          setStatus("tracking");
        } catch {
          if (!disposed && run === generation) setStatus("error");
        }
        return;
      }

      // Native iOS / Android sensor support via expo-sensors
      try {
        let permission = await Pedometer.getPermissionsAsync();
        if (!permission.granted && (ask || permission.canAskAgain)) {
          permission = await Pedometer.requestPermissionsAsync();
        }
        if (disposed || run !== generation) return;
        if (!permission.granted) {
          setStatus(permission.canAskAgain ? "permission" : "denied");
          return;
        }
        const pedometerAvailable = await Pedometer.isAvailableAsync();
        if (disposed || run !== generation) return;

        if (current.date !== new Date().toDateString()) current = empty();

        if (Platform.OS === "ios" && pedometerAvailable) {
          const now = new Date();
          const midnight = new Date(now);
          midnight.setHours(0, 0, 0, 0);
          const hours = await Promise.all(
            Array.from({ length: now.getHours() + 1 }, async (_, hour) => {
              const from = new Date(midnight);
              from.setHours(hour);
              const to = new Date(midnight);
              to.setHours(hour + 1);
              const result = await Pedometer.getStepCountAsync(from, to > now ? now : to);
              return result.steps;
            })
          );
          if (disposed || run !== generation) return;
          current = {
            date: now.toDateString(),
            hours: Array.from({ length: 24 }, (_, i) => Math.max(current.hours[i] ?? 0, hours[i] ?? 0)),
          };
          let previous = 0;
          subscription = Pedometer.watchStepCount(({ steps }) => {
            if (disposed || run !== generation) return;
            if (current.date !== new Date().toDateString()) current = empty();
            const delta = Math.max(0, steps - previous);
            previous = steps;
            current.hours[new Date().getHours()] += delta;
            publish();
          });
          publish();
          setStatus("tracking");
        } else if (pedometerAvailable) {
          let previous = 0;
          subscription = Pedometer.watchStepCount(({ steps }) => {
            if (disposed || run !== generation) return;
            if (current.date !== new Date().toDateString()) current = empty();
            const delta = Math.max(0, steps - previous);
            previous = steps;
            current.hours[new Date().getHours()] += delta;
            publish();
          });
          publish();
          setStatus("tracking");
        } else if (await Accelerometer.isAvailableAsync()) {
          // Hardware step counter unavailable: fallback to 3-axis Accelerometer step peak detection
          Accelerometer.setUpdateInterval(100);
          let lastStepAt = 0;
          let aboveThreshold = false;
          subscription = Accelerometer.addListener(({ x, y, z }) => {
            if (disposed || run !== generation) return;
            const magG = Math.sqrt(x * x + y * y + z * z);
            const nowMs = Date.now();
            if (magG > 1.22 && !aboveThreshold && nowMs - lastStepAt > 320) {
              aboveThreshold = true;
              lastStepAt = nowMs;
              if (current.date !== new Date().toDateString()) current = empty();
              current.hours[new Date().getHours()] += 1;
              publish();
            } else if (magG < 1.05) {
              aboveThreshold = false;
            }
          });
          publish();
          setStatus("tracking");
        } else {
          if (!disposed) setStatus("unavailable");
        }
      } catch {
        if (!disposed && run === generation) setStatus("error");
      }
    };

    void (async () => {
      try {
        const stored = JSON.parse((await getStoredItem(key)) ?? "null");
        if (
          stored?.date === current.date &&
          stored.hours?.length === 24 &&
          stored.hours.every((n: unknown) => typeof n === "number" && Number.isFinite(n) && n >= 0)
        ) {
          current = stored;
        }
      } catch {}
      if (!disposed) {
        setDay(current);
        await start();
      }
    })();

    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") void start();
      else {
        generation++;
        subscription?.remove();
      }
    });

    const timer = setInterval(() => {
      if (AppState.currentState !== "active") return;
      if (Platform.OS === "ios" || current.date !== new Date().toDateString()) void start();
    }, 30000);

    return () => {
      disposed = true;
      generation++;
      addStepsRef.current = null;
      subscription?.remove();
      listener.remove();
      clearInterval(timer);
    };
  }, [userId, attempt, ask]);

  const enable = useCallback(() => {
    setAsk(true);
    setAttempt((n) => n + 1);
  }, []);

  const addSteps = useCallback((delta: number) => {
    addStepsRef.current?.(delta);
  }, []);

  const visible = owner === userId ? day : empty();
  return {
    date: visible.date,
    steps: visible.hours.reduce((a, b) => a + b, 0),
    hours: visible.hours,
    status: owner === userId ? status : "checking",
    enable,
    addSteps,
  };
}
