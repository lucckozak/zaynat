"use client";

import { TenantProvider } from "@/lib/tenant";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { SuperAdminProvider } from "@/lib/super-admin-auth";
import { LocaleProvider } from "@/lib/i18n";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeApplier } from "@/components/theme-applier";
import { DemoPanel } from "@/components/demo/demo-panel";
import { ObservabilityInit } from "@/components/observability-init";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <StoreProvider>
        <AuthProvider>
          <SuperAdminProvider>
            <LocaleProvider>
              <ToastProvider>
                <ObservabilityInit />
                <ThemeApplier />
                {children}
                <DemoPanel />
              </ToastProvider>
            </LocaleProvider>
          </SuperAdminProvider>
        </AuthProvider>
      </StoreProvider>
    </TenantProvider>
  );
}
