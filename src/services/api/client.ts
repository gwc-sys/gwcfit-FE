import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

import type { TokenPair } from "../../types/saas";

declare const process:
  | {
      env: {
        EXPO_PUBLIC_API_URL?: string;
      };
    }
  | undefined;

type RuntimeGlobal = typeof globalThis & {
  location?: {
    hostname?: string;
  };
};

type NativeModulesWithSourceCode = typeof NativeModules & {
  SourceCode?: {
    scriptURL?: string;
  };
};

type ExpoConstantsWithDevHost = typeof Constants & {
  expoGoConfig?: {
    debuggerHost?: string;
  } | null;
  manifest2?: {
    extra?: {
      expoGo?: {
        debuggerHost?: string;
      };
    };
  } | null;
  platform?: {
    hostUri?: string;
  };
};

const runtime = globalThis as RuntimeGlobal;
const expoConstants = Constants as ExpoConstantsWithDevHost;
const nativeModules = NativeModules as NativeModulesWithSourceCode;
const API_PORT = "8000";
const API_PATH = "/api/v1";
const ANDROID_EMULATOR_HOST = "10.0.2.2";

function normalizeHostname(hostname: string) {
  return hostname.replace(/^\[|\]$/g, "").toLowerCase();
}

function isLoopbackHost(hostname: string) {
  const normalizedHostname = normalizeHostname(hostname);
  return (
    normalizedHostname === "localhost" ||
    normalizedHostname === "127.0.0.1" ||
    normalizedHostname === "0.0.0.0" ||
    normalizedHostname === "::1"
  );
}

function trimTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

function getAndroidLoopbackFallback() {
  return Platform.OS === "android" ? ANDROID_EMULATOR_HOST : undefined;
}

function getHostnameFromUri(value?: string | null) {
  const trimmedValue = value?.trim();
  if (!trimmedValue) {
    return undefined;
  }

  const urlValue = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `http://${trimmedValue}`;

  try {
    const url = new URL(urlValue);
    return url.hostname ? normalizeHostname(url.hostname) : undefined;
  } catch {
    const hostMatch = trimmedValue.match(/^(?:[a-z][a-z\d+\-.]*:\/\/)?(?:[^@/]+@)?(\[[^\]]+\]|[^:/]+)/i);
    const hostname = hostMatch?.[1];
    return hostname ? normalizeHostname(hostname) : undefined;
  }
}

function getNativeDevServerHostname() {
  if (Platform.OS === "web") {
    return undefined;
  }

  const hostCandidates = [
    expoConstants.expoConfig?.hostUri,
    expoConstants.expoGoConfig?.debuggerHost,
    expoConstants.manifest2?.extra?.expoGo?.debuggerHost,
    expoConstants.platform?.hostUri,
    expoConstants.experienceUrl,
    expoConstants.linkingUri,
    nativeModules.SourceCode?.scriptURL
  ];

  for (const candidate of hostCandidates) {
    const hostname = getHostnameFromUri(candidate);

    if (hostname && !isLoopbackHost(hostname)) {
      return hostname;
    }
  }

  return getAndroidLoopbackFallback();
}

function getRuntimeHostname() {
  return runtime.location?.hostname ?? getNativeDevServerHostname();
}

function getApiHostnameForRuntime(hostname: string) {
  if (!isLoopbackHost(hostname)) {
    return hostname;
  }

  return getRuntimeHostname() ?? getAndroidLoopbackFallback() ?? hostname;
}

function rewriteLoopbackApiUrl(configuredUrl: string) {
  try {
    const url = new URL(configuredUrl);

    if (isLoopbackHost(url.hostname)) {
      url.hostname = getApiHostnameForRuntime(url.hostname);
    }

    return trimTrailingSlash(url.toString());
  } catch {
    return trimTrailingSlash(configuredUrl);
  }
}

function getDefaultApiBaseUrl() {
  const hostname = getApiHostnameForRuntime("127.0.0.1");
  return `http://${hostname}:${API_PORT}${API_PATH}`;
}

function getApiBaseUrl() {
  const configuredUrl =
    typeof process !== "undefined" ? process.env.EXPO_PUBLIC_API_URL : undefined;

  if (configuredUrl) {
    return rewriteLoopbackApiUrl(configuredUrl);
  }

  return getDefaultApiBaseUrl();
}

export const API_BASE_URL = getApiBaseUrl();

function createRequestId() {
  const randomUuid = (globalThis.crypto as { randomUUID?: () => string } | undefined)?.randomUUID?.();
  return randomUuid ?? `app_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _sessionEpoch?: number;
};

type ApiAuthHandlers = {
  onTokensRefreshed?: (tokens: TokenPair) => void;
  onAuthExpired?: () => void;
};

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshPromise: Promise<TokenPair> | null = null;
let sessionEpoch = 0;
let authHandlers: ApiAuthHandlers = {};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

apiClient.interceptors.request.use((config: RetriableRequestConfig) => {
  // Session restoration belongs to the auth store. Reading storage here can
  // resurrect a session while an asynchronous sign-out is clearing it.
  config._sessionEpoch = sessionEpoch;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else {
    delete config.headers.Authorization;
  }
  config.headers.Accept = "application/json";
  config.headers["X-Request-ID"] = createRequestId();
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const statusCode = error.response?.status;

    const publicAuthRequest = /\/auth\/(?:login|register(?:\/owner)?|refresh|forgot-password|reset-password|verify-email)\/?$/.test(originalRequest?.url ?? "");
    if (statusCode !== 401 || !originalRequest || publicAuthRequest || originalRequest._sessionEpoch !== sessionEpoch) {
      return Promise.reject(error);
    }

    if (originalRequest._retry || !refreshToken) {
      if (accessToken) {
        setApiTokens(null);
        authHandlers.onAuthExpired?.();
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const requestEpoch = sessionEpoch;
    try {
      refreshPromise =
        refreshPromise ??
        axios
          .post<TokenPair>(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          }, {
            timeout: 15000,
            headers: { "X-Request-ID": createRequestId() }
          })
          .then((response) => {
            if (requestEpoch !== sessionEpoch) throw error;
            setApiTokens(response.data, true);
            authHandlers.onTokensRefreshed?.(response.data);
            return response.data;
          })
          .finally(() => {
            if (requestEpoch === sessionEpoch) refreshPromise = null;
          });

      const tokens = await refreshPromise;
      if (requestEpoch !== sessionEpoch) return Promise.reject(error);
      originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // A temporary network outage must not destroy a valid saved session.
      if (requestEpoch === sessionEpoch && [401, 403].includes(getApiStatus(refreshError) ?? 0)) {
        setApiTokens(null);
        authHandlers.onAuthExpired?.();
      }
      return Promise.reject(refreshError);
    }
  }
);

export function setApiTokens(tokens: TokenPair | null, preserveSession = false) {
  if (!preserveSession) {
    sessionEpoch += 1;
    refreshPromise = null;
  }
  accessToken = tokens?.access_token ?? null;
  refreshToken = tokens?.refresh_token ?? null;
}

export function setApiAuthHandlers(handlers: ApiAuthHandlers) {
  authHandlers = handlers;
}

export function getApiStatus(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }

  return undefined;
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as {
      detail?: unknown;
      error?: { message?: unknown; details?: Array<{ field?: unknown; message?: unknown }> };
    } | undefined;
    const structuredMessage = responseData?.error?.message;
    const structuredDetails = responseData?.error?.details;
    if (Array.isArray(structuredDetails) && structuredDetails.length > 0) {
      const messages = structuredDetails.map((item) => {
        const field = typeof item.field === "string" ? item.field : "";
        const message = typeof item.message === "string" ? item.message : "";
        return field && message ? `${field}: ${message}` : message;
      }).filter(Boolean);
      if (messages.length > 0) return messages.join("\n");
    }
    if (typeof structuredMessage === "string") return structuredMessage;

    const detail = responseData?.detail;
    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (!item || typeof item !== "object") {
            return "";
          }

          const validationError = item as { loc?: unknown; msg?: unknown };
          const message = typeof validationError.msg === "string" ? validationError.msg : "";
          const location = Array.isArray(validationError.loc)
            ? validationError.loc
                .filter((part) => part !== "body")
                .map(String)
                .join(".")
            : "";

          return location && message ? `${location}: ${message}` : message;
        })
        .filter(Boolean);

      if (messages.length > 0) {
        return messages.join("\n");
      }
    }

    if (!error.response && error.request) {
      return "Unable to connect. Check your internet connection and try again.";
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
