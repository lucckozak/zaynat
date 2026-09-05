"use client";

import {
  BarChart3,
  CalendarRange,
  LayoutDashboard,
  ListChecks,
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
  const { tenant } = useTenant();
  const suspended = tenant?.suspension.suspended ?? false;

  return (
    <HydrationGate fallback={null}>
      <RequireRole roles={["ADMIN"]}>
        <DashboardShell nav={NAV} area="Admin">
          {suspended ? (
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
          ) : null}
          {children}
        </DashboardShell>
      </RequireRole>
    </HydrationGate>
  );
}
