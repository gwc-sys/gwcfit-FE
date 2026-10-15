import { useMembers } from "../../../hooks/useRbac";
import { useAuthStore } from "../../../store/useAuthStore";

// The existing RBAC hook owns the request, cache, retries and API contract.
export function useAnalyticsMembers() {
  const hasPermission = useAuthStore(state => state.hasPermission);
  const permitted = hasPermission("manage_members");
  const query = useMembers({ limit: 200 }, permitted);
  return { query, permitted };
}
