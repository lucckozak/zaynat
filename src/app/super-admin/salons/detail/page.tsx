"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Ban,
  Check,
  CircleSlash,
  ExternalLink,
  RotateCcw,
  X,
} from "lucide-react";
import type { Database, DomainStatus, SubscriptionPlanId } from "@/lib/types";
import { loadDatabase } from "@/lib/data/seed";
import {
  getTenantMeta,
  reactivateTenant,
  suspendTenant,
  updateTenantMeta,
} from "@/lib/tenants";
import { listSubscriptionPlans } from "@/lib/subscription-plans";
import { logAudit } from "@/lib/audit-log";
import { useTenant } from "@/lib/tenant";
import { useSuperAdmin } from "@/lib/super-admin-auth";
import { PageHeading } from "@/components/layout/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/misc";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

const DOMAIN_STATUSES: DomainStatus[] = [
  "not_configured",
  "pending",
  "verified",
  "active",
  "error",
  "suspended",
];

function SalonDetailInner() {
  const searchParams = useSearchParams();
  // path-based [salonId] segments don't work with `output: "export"` (no
  // build-time enumeration of runtime-created tenants is possible) — this
  // mirrors the app's existing `?salon=`/`?service=` query-param pattern.
  const salonId = searchParams.get("salonId") ?? "";
  const router = useRouter();
  const toast = useToast();
  const { refreshTenants } = useTenant();
  const { account } = useSuperAdmin();
  const plans = listSubscriptionPlans();

  const [meta, setMeta] = useState(() => getTenantMeta(salonId));
  const [db, setDb] = useState<Database | null>(null);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    setDb(loadDatabase(salonId));
  }, [salonId]);

  function refresh() {
    setMeta(getTenantMeta(salonId));
    refreshTenants();
  }

  const checklist = useMemo(() => {
    if (!db || !meta) return [];
    return [
      { label: "Business information", done: true },
      { label: "Branding", done: true },
      { label: "Services", done: db.services.length > 0 },
      { label: "Employees", done: db.employees.length > 0 },
      {
        label: "Working hours",
        done: db.workingHours.some((w) => w.startTime),
      },
      { label: "Payment integration", done: false, note: "not simulated in this demo" },
      { label: "Subscription", done: meta.subscriptionStatus !== "cancelled" },
      { label: "Contract", done: meta.contract.status === "signed" },
      { label: "Custom domain", done: meta.domain.status === "active" },
      { label: "Website published", done: true },
    ];
  }, [db, meta]);

  if (!meta) {
    return (
      <div>
        <PageHeading title="Salon not found" />
        <Button variant="outline" onClick={() => router.push("/super-admin/salons")}>
          Back to salons
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeading
        title={meta.label}
        description={`${meta.area}, ${meta.emirate}`}
        action={
          <div className="flex items-center gap-2">
            <a
              href={`/site?salon=${meta.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-medium text-foreground hover:border-primary/50"
            >
              <ExternalLink size={13} /> View site
            </a>
            {meta.suspension.suspended ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  reactivateTenant(salonId);
                  logAudit({
                    actor: account?.name ?? "Super Admin",
                    action: "Reactivated salon",
                    entity: meta.label,
                  });
                  refresh();
                  toast.success(`${meta.label} reactivated`);
                }}
              >
                <RotateCcw size={14} /> Reactivate
              </Button>
            ) : (
              <Button variant="danger" size="sm" onClick={() => setSuspendOpen(true)}>
                <Ban size={14} /> Suspend
              </Button>
            )}
          </div>
        }
      />

      {meta.suspension.suspended ? (
        <Card className="border-warning/40 bg-warning-soft/40">
          <CardBody className="flex items-start gap-3">
            <CircleSlash size={18} className="mt-0.5 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-medium text-foreground">This salon is suspended</p>
              <p className="text-sm text-muted">
                Reason: {meta.suspension.reason || "—"} · since{" "}
                {meta.suspension.suspendedAt ? new Date(meta.suspension.suspendedAt).toLocaleString() : "—"}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Onboarding</h3>
            <ul className="space-y-2">
              {checklist.map((c) => (
                <li key={c.label} className="flex items-center gap-2.5 text-sm">
                  {c.done ? (
                    <Check size={15} className="shrink-0 text-success" />
                  ) : (
                    <X size={15} className="shrink-0 text-muted" />
                  )}
                  <span className={c.done ? "text-foreground" : "text-muted"}>{c.label}</span>
                  {c.note ? <span className="text-xs text-muted">({c.note})</span> : null}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Subscription</h3>
            <Field label="Plan">
              <Select
                value={meta.subscriptionPlan}
                onChange={(e) => {
                  const plan = e.target.value as SubscriptionPlanId;
                  updateTenantMeta(salonId, { subscriptionPlan: plan });
                  logAudit({
                    actor: account?.name ?? "Super Admin",
                    action: "Changed plan",
                    entity: meta.label,
                    meta: { plan },
                  });
                  refresh();
                  toast.success("Plan updated");
                }}
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} — AED {p.monthlyPriceAed}/mo
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status" hint="Trial / active / past due — use Suspend/Reactivate above for suspension.">
              <Select
                value={meta.subscriptionStatus}
                onChange={(e) => {
                  updateTenantMeta(salonId, {
                    subscriptionStatus: e.target.value as typeof meta.subscriptionStatus,
                  });
                  refresh();
                }}
                disabled={meta.suspension.suspended}
              >
                <option value="trial">Trial</option>
                <option value="active">Active</option>
                <option value="past_due">Past due</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </Field>
            {meta.trialEndsAt ? (
              <p className="text-xs text-muted">
                Trial ends {new Date(meta.trialEndsAt).toLocaleDateString()}
              </p>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Custom domain</h3>
            <p className="text-xs text-muted">
              Simulated — no real DNS/SSL is provisioned in this demo.
            </p>
            <Field label="Domain">
              <Input
                defaultValue={meta.domain.custom ?? ""}
                placeholder="www.example.ae"
                onBlur={(e) => {
                  updateTenantMeta(salonId, {
                    domain: { ...meta.domain, custom: e.target.value.trim() || undefined },
                  });
                  refresh();
                }}
              />
            </Field>
            <Field label="Status">
              <Select
                value={meta.domain.status}
                onChange={(e) => {
                  updateTenantMeta(salonId, {
                    domain: { ...meta.domain, status: e.target.value as DomainStatus },
                  });
                  refresh();
                }}
              >
                {DOMAIN_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </Select>
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Marketplace</h3>
            <Switch
              checked={meta.marketplace.visible}
              onChange={(v) => {
                updateTenantMeta(salonId, { marketplace: { ...meta.marketplace, visible: v } });
                refresh();
              }}
              label="Visible in marketplace"
              description="Shows this salon in public search (marketplace UI is a later phase)."
            />
            <Switch
              checked={meta.marketplace.featured}
              onChange={(v) => {
                updateTenantMeta(salonId, { marketplace: { ...meta.marketplace, featured: v } });
                refresh();
              }}
              label="Featured"
            />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Legal & contract</h3>
              <Badge tone={meta.contract.status === "signed" ? "success" : "neutral"} className="capitalize">
                {meta.contract.status}
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status">
                <Select
                  value={meta.contract.status}
                  onChange={(e) => {
                    updateTenantMeta(salonId, {
                      contract: { ...meta.contract, status: e.target.value as typeof meta.contract.status },
                    });
                    refresh();
                  }}
                >
                  <option value="unsigned">Unsigned</option>
                  <option value="signed">Signed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </Field>
              <Field label="Version">
                <Input value={meta.contract.version} readOnly />
              </Field>
              <Field label="Start date">
                <Input
                  type="date"
                  defaultValue={meta.contract.startDate?.slice(0, 10) ?? ""}
                  onBlur={(e) => {
                    updateTenantMeta(salonId, {
                      contract: { ...meta.contract, startDate: e.target.value || undefined },
                    });
                    refresh();
                  }}
                />
              </Field>
              <Field label="Renewal date">
                <Input
                  type="date"
                  defaultValue={meta.contract.renewalDate?.slice(0, 10) ?? ""}
                  onBlur={(e) => {
                    updateTenantMeta(salonId, {
                      contract: { ...meta.contract, renewalDate: e.target.value || undefined },
                    });
                    refresh();
                  }}
                />
              </Field>
            </div>
          </CardBody>
        </Card>
      </div>

      <Dialog
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        title="Suspend this salon?"
        description="Its public booking site becomes unavailable and admin access is restricted. Historical data is kept intact."
        footer={
          <>
            <Button variant="ghost" onClick={() => setSuspendOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={!reason.trim()}
              onClick={() => {
                suspendTenant(salonId, reason.trim());
                logAudit({
                  actor: account?.name ?? "Super Admin",
                  action: "Suspended salon",
                  entity: meta.label,
                  reason: reason.trim(),
                });
                setSuspendOpen(false);
                setReason("");
                refresh();
                toast.success(`${meta.label} suspended`);
              }}
            >
              Suspend salon
            </Button>
          </>
        }
      >
        <Field label="Reason" required>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Subscription payment overdue" />
        </Field>
      </Dialog>
    </div>
  );
}

export default function SalonDetailPage() {
  return (
    <Suspense fallback={null}>
      <SalonDetailInner />
    </Suspense>
  );
}
