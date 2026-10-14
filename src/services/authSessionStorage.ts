import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

import type { AuthResponse } from "../types/saas";

const SESSION_KEY = "pulsefit.auth.session.v2";
const LEGACY_SESSION_KEYS = ["pulsefit.auth.session.v1"];
let storageWrites: Promise<void> = Promise.resolve();

function queueStorageWrite(write: () => Promise<void>) {
  const operation = storageWrites.then(write);
  storageWrites = operation.catch(() => undefined);
  return operation;
}

type WebStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function getWebStorage(): WebStorage | null {
  const candidate = globalThis as typeof globalThis & {
    localStorage?: WebStorage;
  };

  try {
    return candidate.localStorage ?? null;
  } catch {
    return null;
  }
}

function getWebItem(key: string) {
  try {
    return getWebStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function setWebItem(key: string, value: string) {
  try {
    getWebStorage()?.setItem(key, value);
  } catch {
    // Storage can be unavailable in private windows or strict browser modes.
  }
}

function removeWebItem(key: string) {
  try {
    getWebStorage()?.removeItem(key);
  } catch {
    // Ignore storage cleanup failures so auth hydration can always finish.
  }
}

export function saveStoredSession(session: AuthResponse) {
  const serialized = JSON.stringify(session);
  return queueStorageWrite(async () => {
    if (Platform.OS === "web") {
      setWebItem(SESSION_KEY, serialized);
      return;
    }
    await SecureStore.setItemAsync(SESSION_KEY, serialized, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY
    });
  });
}

export async function loadStoredSession() {
  await storageWrites;
  if (Platform.OS === "web") {
    LEGACY_SESSION_KEYS.forEach(removeWebItem);
  } else {
    await Promise.all(LEGACY_SESSION_KEYS.map((key) => SecureStore.deleteItemAsync(key).catch(() => undefined)));
  }

  const serialized = Platform.OS === "web" ? getWebItem(SESSION_KEY) : await SecureStore.getItemAsync(SESSION_KEY);

  if (!serialized) {
    return null;
  }

  try {
    const session = JSON.parse(serialized) as AuthResponse;
    if (
      !session?.user || typeof session.user.id !== "string" ||
      !Array.isArray(session.user.permissions) ||
      !session.tokens || typeof session.tokens.access_token !== "string" || !session.tokens.access_token ||
      typeof session.tokens.refresh_token !== "string" || !session.tokens.refresh_token
    ) {
      await clearStoredSession();
      return null;
    }
    return session;
  } catch {
    await clearStoredSession();
    return null;
  }
}

export function clearStoredSession() {
  return queueStorageWrite(async () => {
    if (Platform.OS === "web") {
      removeWebItem(SESSION_KEY);
      LEGACY_SESSION_KEYS.forEach(removeWebItem);
      return;
    }
    await Promise.all(
      [SESSION_KEY, ...LEGACY_SESSION_KEYS].map((key) => SecureStore.deleteItemAsync(key).catch(() => undefined))
    );
  });
}
