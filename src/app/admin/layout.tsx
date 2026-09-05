"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CalendarRange,
  CreditCard,
  LayoutDashboard,
  ListChecks,
  Rocket,
  Scissors,
  Settings,
  Star,
  Tag,
  TriangleAlert,
  Users,
  UsersRound,
} from "lucide-react";
import { RequireRole } from "@/components/auth/require-role";
import { HydrationGate } from "@/components/hydration-gate";
import {
  DashboardShell,
  type NavItem,
} from "@/components/layout/dashboard-shell";
import { LocationSwitcher } from "@/components/layout/location-switcher";
import { NotificationBell } from "@/components/layout/notification-bell";
import { useAuth, sessionKey } from "@/lib/auth";
import { useTenant } from "@/lib/tenant";
import { getTenantMeta, reactivateTenant } from "@/lib/tenants";
import { ensureOwnerAccount } from "@/lib/owner-accounts";
import type { OwnerAccount } from "@/lib/types";
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
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/subscription", label: "Subscription", icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant, refreshTenants, switchActiveSalon } = useTenant();
  const { user } = useAuth();
  const toast = useToast();
  const [activating, setActivating] = useState(false);
  const [owner, setOwner] = useState<OwnerAccount | null>(null);

  const suspendedByOperator = tenant?.suspension.suspended ?? false;
  const live = tenant?.subscriptionStatus === "active";

  // Backfills an OwnerAccount for admins who logged in before this feature
  // existed (see ensureOwnerAccount) — so the location switcher below works
  // for every admin, not just ones created after it shipped.
  useEffect(() => {
    if (!tenant || !user) {
      setOwner(null);
      return;
    }
    setOwner(
      ensureOwnerAccount({
        salonId: tenant.id,
        adminUserId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
      }),
    );
  }, [tenant, user]);

  const locations = useMemo(
    () =>
      (owner?.locations ?? [])
        .map((loc) => {
          const meta = getTenantMeta(loc.salonId);
          return meta ? { salonId: loc.salonId, label: meta.label, adminUserId: loc.adminUserId } : null;
        })
        .filter((l): l is NonNullable<typeof l> => l !== null),
    [owner],
  );

  function switchLocation(salonId: string) {
    const target = locations.find((l) => l.salonId === salonId);
    if (!target) return;
    try {
      window.localStorage.setItem(sessionKey(salonId), target.adminUserId);
    } catch {
      /* ignore quota / privacy-mode errors */
    }
    switchActiveSalon(salonId);
  }

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
        <DashboardShell
          nav={NAV}
          area="Admin"
          notificationCenter={<NotificationBell />}
          locationSwitcher={
            locations.length > 1 ? (
              <LocationSwitcher
                locations={locations}
                activeId={tenant?.id ?? ""}
                onSwitch={switchLocation}
              />
            ) : undefined
          }
        >
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
                <Link
                  href="/admin/subscription"
                  className="mt-1 inline-block font-medium text-warning hover:underline"
                >
                  View subscription details →
                </Link>
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
                    once you activate your subscription.{" "}
                    <Link href="/admin/subscription" className="font-medium text-primary hover:underline">
                      Manage subscription →
                    </Link>
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
