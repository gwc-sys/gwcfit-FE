import type { ReactNode } from "react";

import { useAuthStore } from "../store/useAuthStore";
import type { PermissionCode } from "../types/saas";

type PermissionGateProps = {
  permission: PermissionCode;
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}
