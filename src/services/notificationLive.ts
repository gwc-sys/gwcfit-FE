import { API_BASE_URL, apiClient } from "./api/client";
import { useAuthStore } from "../store/useAuthStore";

type Connection = { listeners: Set<() => void>; stop: () => void };
const connections = new Map<string, Connection>();

// Share one authenticated connection between mounted dashboard screens.
export function subscribeNotificationChanges(userId: string, listener: () => void): () => void {
  let connection = connections.get(userId);
  if (!connection) {
    const listeners = new Set<() => void>();
    let socket: WebSocket | undefined;
    let stopped = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const current = () => !stopped && useAuthStore.getState().user?.id === userId;
    const alive = () => {
      clearTimeout(watchdog);
      watchdog = setTimeout(() => socket?.close(), 45000);
    };
    const connect = () => {
      if (!current() || typeof WebSocket === "undefined") return;
      const token = useAuthStore.getState().tokens?.access_token;
      if (!token) return;
      try {
        socket = new WebSocket(`${API_BASE_URL.replace(/^http/, "ws").replace(/\/$/, "")}/notifications/live`);
      } catch {
        schedule();
        return;
      }
      alive();
      socket.onopen = () => {
        if (!current()) { socket?.close(); return; }
        socket?.send(JSON.stringify({ access_token: token }));
      };
      socket.onmessage = event => {
        if (!current()) return;
        alive();
        try {
          const message = JSON.parse(event.data);
          if (message.type === "ready" || message.type === "notifications_changed") {
            attempts = 0;
            for (const notify of listeners) notify();
          }
        } catch { /* Ignore malformed frames; fallback queries still recover history. */ }
      };
      socket.onerror = () => socket?.close();
      socket.onclose = event => {
        clearTimeout(watchdog);
        if (!current()) return;
        if (event.code === 4401) {
          // Use the existing single-flight HTTP refresh flow before reconnecting.
          void apiClient.get("/auth/me").catch(() => {}).finally(schedule);
        } else schedule();
      };
    };
    const schedule = () => {
      if (!current()) return;
      clearTimeout(retry);
      retry = setTimeout(connect, Math.min(30000, 1000 * 2 ** Math.min(attempts++, 5)) + Math.random() * 250);
    };
    const unsubscribeAuth = useAuthStore.subscribe((state) => {
      if (state.user?.id !== userId) stop();
    });
    const stop = () => {
      stopped = true;
      clearTimeout(retry);
      clearTimeout(watchdog);
      unsubscribeAuth();
      socket?.close();
      if (connections.get(userId)?.listeners === listeners) connections.delete(userId);
    };
    connection = { listeners, stop };
    connections.set(userId, connection);
    listeners.add(listener);
    connect();
  } else connection.listeners.add(listener);
  const active = connection;
  return () => {
    active.listeners.delete(listener);
    if (!active.listeners.size) active.stop();
  };
}
