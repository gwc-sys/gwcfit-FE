import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { AppErrorBoundary } from "../components/AppErrorBoundary";
import { AppThemeProvider } from "../theme/AppThemeProvider";
import { queryClient } from "../services/queryClient";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <AppErrorBoundary>{children}</AppErrorBoundary>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}
