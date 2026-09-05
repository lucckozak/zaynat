"use client";

import { useState } from "react";
import {
  BarChart3,
  CalendarRange,
  LayoutDashboard,
  ListChecks,
  Rocket,
  Scissors,
  Settings,
  Tag,
  TriangleAlert,
  Users,
  UsersRound,
} from "lucide-react";
import { RequireRole } from "@/components/auth/require-role";
import { HydrationGate } from "@/components/hydration-gate";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";
import { useTenant } from "@/lib/tenant";
import { reactivateTenant } from "@/lib/tenants";
import { logAudit } from "@/lib/audit-log";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarRange },
  { href: "/admin/appointments", label: "Appointments", icon: ListChecks },
  { href: "/admin/revenue", label: "Revenue", icon: BarChart3 },
  { href: "/admin/employees", label: "Employees", icon: UsersRound },
  { href: "/admin/services", label: "Services", icon: Scissors },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/marketing", label: "Marketing", icon: Tag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant, refreshTenants } = useTenant();
  const toast = useToast();
  const [activating, setActivating] = useState(false);

  const suspendedByOperator = tenant?.suspension.suspended ?? false;
  const live = tenant?.subscriptionStatus === "active";

  function activate() {
    if (!tenant) return;
    setActivating(true);
    reactivateTenant(tenant.id);
    logAudit({
      actor: `${tenant.label} (self-service)`,
      action: "Activated subscription",
      entity: tenant.label,
    });
    refreshTenants();
    toast.success(
      "Subscription activated — you're live!",
      "Simulated: no real payment was charged in this prototype.",
    );
    setActivating(false);
  }

  return (
    <HydrationGate fallback={null}>
      <RequireRole roles={["ADMIN"]}>
        <DashboardShell nav={NAV} area="Admin">
          {suspendedByOperator ? (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning-soft/40 px-4 py-3">
              <TriangleAlert size={18} className="mt-0.5 shrink-0 text-warning" />
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  Your subscription is suspended
                </p>
                <p className="text-muted">
                  Reason: {tenant?.suspension.reason || "—"}. Your public booking
                  site is unavailable and new bookings are disabled; existing
                  data is unaffected. Contact platform support to reactivate.
                </p>
              </div>
            </div>
          ) : !live ? (
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary-soft/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 text-sm">
                <Rocket size={18} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Your site isn&apos;t live yet</p>
                  <p className="text-muted">
                    You can customise everything — services, team, branding,
                    settings — but your public booking site only goes live
                    once you activate your subscription.
                  </p>
                </div>
              </div>
              <Button size="sm" loading={activating} onClick={activate} className="shrink-0">
                Activate subscription
              </Button>
            </div>
          ) : null}
          {children}
        </DashboardShell>
      </RequireRole>
    </HydrationGate>
  );
}
