import { create } from "zustand";

import { clearStoredSession, loadStoredSession, saveStoredSession } from "../services/authSessionStorage";
import { apiClient, getApiStatus, setApiAuthHandlers, setApiTokens } from "../services/api/client";
import { queryClient } from "../services/queryClient";
import type { AuthResponse, AuthUser, PermissionCode, TokenPair } from "../types/saas";

type AuthState = {
  user: AuthUser | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  hasHydrated: boolean;
  hydrateSession: () => Promise<void>;
  setSession: (session: AuthResponse) => void;
  updateTokens: (tokens: TokenPair) => void;
  clearSession: () => void;
  hasPermission: (permission: PermissionCode) => boolean;
};

const loggedOutState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isHydrating: false,
  hasHydrated: true
};

let sessionRevision = 0;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isHydrating: true,
  hasHydrated: false,
  hydrateSession: async () => {
    const revision = ++sessionRevision;
    set({ isHydrating: true });

    try {
      const session = await loadStoredSession();
      if (revision !== sessionRevision) return;

      if (!session) {
        setApiTokens(null);
        set(loggedOutState);
        return;
      }

      setApiTokens(session.tokens);
      set({ tokens: session.tokens });
      const response = await apiClient.get<AuthUser>("/auth/me");
      if (revision !== sessionRevision) return;
      // /auth/me may refresh expired tokens. Persist the refreshed pair.
      const tokens = get().tokens ?? session.tokens;
      const verifiedSession = { tokens, user: response.data };
      await saveStoredSession(verifiedSession);
      if (revision !== sessionRevision) return;
      queryClient.clear();
      set({
        user: response.data,
        tokens,
        isAuthenticated: true,
        isHydrating: false,
        hasHydrated: true
      });
    } catch (error) {
      if (revision !== sessionRevision) return;
      setApiTokens(null);
      if ([401, 403].includes(getApiStatus(error) ?? 0)) {
        await clearStoredSession().catch(() => undefined);
      }
      if (revision !== sessionRevision) return;
      queryClient.clear();
      set(loggedOutState);
    }
  },
  setSession: (session) => {
    sessionRevision += 1;
    queryClient.clear();
    setApiTokens(session.tokens);
    void saveStoredSession(session).catch(() => undefined);
    set({
      user: session.user,
      tokens: session.tokens,
      isAuthenticated: true,
      isHydrating: false,
      hasHydrated: true
    });
  },
  updateTokens: (tokens) => {
    setApiTokens(tokens, true);
    const user = get().user;
    if (user) {
      void saveStoredSession({ user, tokens }).catch(() => undefined);
    }
    set({ tokens });
  },
  clearSession: () => {
    sessionRevision += 1;
    setApiTokens(null);
    queryClient.clear();
    void clearStoredSession().catch(() => undefined);
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isHydrating: false,
      hasHydrated: true
    });
  },
  hasPermission: (permission) => {
    const user = get().user;
    return Boolean(user?.permissions.includes(permission));
  }
}));

setApiAuthHandlers({
  onTokensRefreshed: (tokens) => useAuthStore.getState().updateTokens(tokens),
  onAuthExpired: () => useAuthStore.getState().clearSession()
});
