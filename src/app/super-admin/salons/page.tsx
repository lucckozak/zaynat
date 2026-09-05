"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";
import type { SubscriptionStatus } from "@/lib/types";
import { EMIRATES } from "@/lib/types";
import { useTenant } from "@/lib/tenant";
import { getSubscriptionPlan } from "@/lib/subscription-plans";
import { PageHeading } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";

const STATUS_OPTIONS: (SubscriptionStatus | "all")[] = [
  "all",
  "trial",
  "active",
  "past_due",
  "suspended",
  "cancelled",
];

export default function SuperAdminSalonsPage() {
  const { tenants } = useTenant();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus | "all">("all");
  const [emirate, setEmirate] = useState<string>("all");

  const filtered = useMemo(() => {
    return tenants
      .filter((t) => (status === "all" ? true : t.subscriptionStatus === status))
      .filter((t) => (emirate === "all" ? true : t.emirate === emirate))
      .filter((t) =>
        q.trim() ? t.label.toLowerCase().includes(q.trim().toLowerCase()) : true,
      )
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [tenants, status, emirate, q]);

  return (
    <div>
      <PageHeading
        title="Salons"
        description={`${tenants.length} tenant${tenants.length === 1 ? "" : "s"} on the platform.`}
        action={
          <LinkButton href="/super-admin/salons/new" size="sm">
            <PlusCircle size={15} /> Create salon
          </LinkButton>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search by name…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value as SubscriptionStatus | "all")} className="sm:w-44">
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s.replace("_", " ")}
            </option>
          ))}
        </Select>
        <Select value={emirate} onChange={(e) => setEmirate(e.target.value)} className="sm:w-48">
          <option value="all">All emirates</option>
          {EMIRATES.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No salons match"
          description="Try a different filter, or create a new salon."
          action={
            <LinkButton href="/super-admin/salons/new" size="sm">
              <PlusCircle size={15} /> Create salon
            </LinkButton>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Salon</th>
                  <th className="px-4 py-3 text-left font-medium">Emirate</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Plan</th>
                  <th className="px-4 py-3 text-left font-medium">Domain</th>
                  <th className="px-4 py-3 text-left font-medium">Marketplace</th>
                  <th className="px-4 py-3 text-left font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-sunken">
                    <td className="px-4 py-3">
                      <Link href={`/super-admin/salons/detail?salonId=${t.id}`} className="font-medium text-foreground hover:text-primary">
                        {t.label}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{t.emirate}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.subscriptionStatus} />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {getSubscriptionPlan(t.subscriptionPlan)?.label ?? t.subscriptionPlan}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {t.domain.custom ?? <span className="italic">not configured</span>}
                    </td>
                    <td className="px-4 py-3">
                      {t.marketplace.visible ? (
                        <Badge tone={t.marketplace.featured ? "accent" : "primary"}>
                          {t.marketplace.featured ? "Featured" : "Visible"}
                        </Badge>
                      ) : (
                        <Badge tone="neutral">Hidden</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const tone =
    status === "active"
      ? "success"
      : status === "trial"
        ? "info"
        : status === "suspended" || status === "past_due"
          ? "warning"
          : "neutral";
  return (
    <Badge tone={tone} className="capitalize">
      {status.replace("_", " ")}
    </Badge>
  );
}
