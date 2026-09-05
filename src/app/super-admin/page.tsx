"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, Ban, Building2, Clock, TrendingUp } from "lucide-react";
import { useTenant } from "@/lib/tenant";
import { listAuditLog } from "@/lib/audit-log";
import { getSubscriptionPlan } from "@/lib/subscription-plans";
import { PageHeading } from "@/components/layout/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState, Stat } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";

export default function SuperAdminDashboardPage() {
  const { tenants } = useTenant();

  const kpis = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const active = tenants.filter((t) => t.subscriptionStatus === "active");
    const trial = tenants.filter((t) => t.subscriptionStatus === "trial");
    const suspended = tenants.filter((t) => t.subscriptionStatus === "suspended");
    const newThisMonth = tenants.filter((t) => new Date(t.createdAt) >= monthStart);
    const mrr = active.reduce(
      (sum, t) => sum + (getSubscriptionPlan(t.subscriptionPlan)?.monthlyPriceAed ?? 0),
      0,
    );
    return {
      total: tenants.length,
      active: active.length,
      trial: trial.length,
      suspended: suspended.length,
      newThisMonth: newThisMonth.length,
      mrr,
    };
  }, [tenants]);

  const recentActivity = listAuditLog(8);
  const recentSalons = useMemo(
    () =>
      [...tenants]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 5),
    [tenants],
  );

  return (
    <div>
      <PageHeading
        title="Platform Dashboard"
        description="Visible only to you, the Zaynat team — an overview of every salon using the platform. (Simulated multi-tenant demo — data lives in this browser only.)"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Total salons" value={kpis.total} icon={<Building2 size={15} />} compact />
        <Stat label="Active" value={kpis.active} tone="success" icon={<TrendingUp size={15} />} compact />
        <Stat label="Trial" value={kpis.trial} tone="info" icon={<Clock size={15} />} compact />
        <Stat label="Suspended" value={kpis.suspended} tone="warning" icon={<Ban size={15} />} compact />
        <Stat label="New this month" value={kpis.newThisMonth} tone="accent" compact />
        <Stat label="MRR" value={`AED ${kpis.mrr.toLocaleString()}`} tone="primary" compact />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Recent salons</h3>
              <Link href="/super-admin/salons" className="text-xs font-medium text-primary hover:text-primary-hover">
                View all
              </Link>
            </div>
            {recentSalons.length === 0 ? (
              <EmptyState title="No salons yet" description="Create your first tenant to get started." />
            ) : (
              <ul className="space-y-2">
                {recentSalons.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/super-admin/salons/detail?salonId=${t.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-sunken"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{t.label}</p>
                        <p className="truncate text-xs text-muted">
                          {t.emirate} · created {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusPill status={t.subscriptionStatus} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Recent activity</h3>
            {recentActivity.length === 0 ? (
              <EmptyState
                icon={<AlertTriangle size={18} />}
                title="No activity yet"
                description="Suspend, reactivate, or create a salon and it'll show up here."
              />
            ) : (
              <ul className="space-y-3">
                {recentActivity.map((a) => (
                  <li key={a.id} className="text-sm">
                    <p className="text-foreground">
                      <span className="font-medium">{a.actor}</span> {a.action.toLowerCase()}{" "}
                      <span className="font-medium">{a.entity}</span>
                    </p>
                    {a.reason ? <p className="text-xs text-muted">Reason: {a.reason}</p> : null}
                    <p className="text-xs text-muted">{new Date(a.at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "active"
      ? "success"
      : status === "trial"
        ? "info"
        : status === "suspended" || status === "past_due"
          ? "warning"
          : "neutral";
  return (
    <Badge tone={tone as "success" | "info" | "warning" | "neutral"} className="shrink-0 capitalize">
      {status.replace("_", " ")}
    </Badge>
  );
}
