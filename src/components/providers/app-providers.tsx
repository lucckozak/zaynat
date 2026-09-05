"use client";

import { TenantProvider } from "@/lib/tenant";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { SuperAdminProvider } from "@/lib/super-admin-auth";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeApplier } from "@/components/theme-applier";
import { DemoPanel } from "@/components/demo/demo-panel";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <StoreProvider>
        <AuthProvider>
          <SuperAdminProvider>
            <ToastProvider>
              <ThemeApplier />
              {children}
              <DemoPanel />
            </ToastProvider>
          </SuperAdminProvider>
        </AuthProvider>
      </StoreProvider>
    </TenantProvider>
  );
}
