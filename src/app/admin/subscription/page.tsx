"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Ban,
  CircleSlash,
  Copy,
  ExternalLink,
  Globe,
  Rocket,
  ShieldCheck,
  Unlink,
} from "lucide-react";
import type { DomainStatus, SubscriptionPlanId } from "@/lib/types";
import { useTenant } from "@/lib/tenant";
import { reactivateTenant, updateTenantMeta } from "@/lib/tenants";
import { listSubscriptionPlans } from "@/lib/subscription-plans";
import { logAudit } from "@/lib/audit-log";
import { BRAND_DOMAIN } from "@/lib/brand";
import { PageHeading } from "@/components/layout/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Segmented } from "@/components/ui/misc";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const DOMAIN_TONE: Record<DomainStatus, "neutral" | "warning" | "info" | "success" | "danger"> = {
  not_configured: "neutral",
  pending: "warning",
  verified: "info",
  active: "success",
  error: "danger",
  suspended: "danger",
};

const DOMAIN_LABEL: Record<DomainStatus, string> = {
  not_configured: "Not connected",
  pending: "Pending DNS",
  verified: "DNS verified",
  active: "Live",
  error: "Error",
  suspended: "Suspended",
};

const DOMAIN_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z0-9-]{1,63})+$/i;

export default function SubscriptionPage() {
  const { tenant, refreshTenants } = useTenant();
  const toast = useToast();
  const plans = listSubscriptionPlans();

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [domainDraft, setDomainDraft] = useState(tenant?.domain.custom ?? "");
  const [domainMode, setDomainMode] = useState<"subdomain" | "custom">(
    tenant?.domain.custom ? "custom" : "subdomain",
  );

  if (!tenant) return null;

  const plan = plans.find((p) => p.id === tenant.subscriptionPlan);
  const suspendedByOperator = tenant.suspension.suspended;
  const live = tenant.subscriptionStatus === "active";
  const actor = `${tenant.label} (self-service)`;
  const defaultAddress = `${tenant.slug}.${BRAND_DOMAIN}`;
  const verifyToken = `zaynat-domain-verify=${tenant.id}`;

  function refresh() {
    refreshTenants();
  }

  function makeLive() {
    reactivateTenant(tenant!.id);
    logAudit({ actor, action: "Activated subscription", entity: tenant!.label });
    refresh();
    toast.success("You're live!", "Simulated — no real payment was charged in this prototype.");
  }

  function confirmSuspend() {
    updateTenantMeta(tenant!.id, { subscriptionStatus: "suspended" });
    logAudit({ actor, action: "Paused subscription", entity: tenant!.label });
    setSuspendOpen(false);
    refresh();
    toast.success("Subscription paused", "Your public site is offline until you make it live again.");
  }

  function changePlan(id: SubscriptionPlanId) {
    updateTenantMeta(tenant!.id, { subscriptionPlan: id });
    logAudit({ actor, action: "Changed plan", entity: tenant!.label, meta: { plan: id } });
    refresh();
    toast.success("Plan updated");
  }

  function connectDomain() {
    const value = domainDraft.trim().toLowerCase();
    if (!DOMAIN_RE.test(value)) {
      toast.error("Enter a valid domain", "e.g. www.yoursalon.ae");
      return;
    }
    updateTenantMeta(tenant!.id, { domain: { custom: value, status: "pending" } });
    logAudit({ actor, action: "Connected custom domain", entity: tenant!.label, meta: { domain: value } });
    refresh();
    toast.success("Domain connected", "Add the DNS records below, then verify.");
  }

  function verifyDomain() {
    updateTenantMeta(tenant!.id, { domain: { ...tenant!.domain, status: "active" } });
    logAudit({ actor, action: "Verified custom domain", entity: tenant!.label });
    refresh();
    toast.success("Domain verified — you're live on it!", "Simulated: no real DNS lookup was performed.");
  }

  function disconnectDomain() {
    updateTenantMeta(tenant!.id, { domain: { status: "not_configured" } });
    logAudit({ actor, action: "Disconnected custom domain", entity: tenant!.label });
    setDomainDraft("");
    setDomainMode("subdomain");
    refresh();
    toast.success("Domain disconnected", `Back to ${defaultAddress}.`);
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text).then(
      () => toast.success("Copied"),
      () => toast.error("Couldn't copy"),
    );
  }

  const customDomainAllowed = plan?.customDomain ?? false;
  const domainConnected = Boolean(tenant.domain.custom) && tenant.domain.status !== "not_configured";

  return (
    <div className="space-y-5">
      <PageHeading
        title="Subscription"
        description="Your plan, billing status, site visibility and domain."
      />

      {suspendedByOperator ? (
        <Card className="border-warning/40 bg-warning-soft/40">
          <CardBody className="flex items-start gap-3">
            <CircleSlash size={18} className="mt-0.5 shrink-0 text-warning" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Your subscription is suspended</p>
              <p className="text-muted">
                Reason: {tenant.suspension.reason || "—"}. Your public booking site is
                unavailable and new bookings are disabled. This was done by the Zaynat
                team — contact platform support to reactivate.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Plan & billing</h3>
              <Badge tone={live ? "success" : "neutral"} className="capitalize">
                {tenant.subscriptionStatus.replace("_", " ")}
              </Badge>
            </div>
            <Field label="Plan" hint="Changing plans is simulated — no card is charged in this prototype.">
              <Select
                value={tenant.subscriptionPlan}
                onChange={(e) => changePlan(e.target.value as SubscriptionPlanId)}
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} — AED {p.monthlyPriceAed}/mo
                  </option>
                ))}
              </Select>
            </Field>
            {tenant.subscriptionStatus === "trial" && tenant.trialEndsAt ? (
              <p className="text-xs text-muted">
                Free trial ends {new Date(tenant.trialEndsAt).toLocaleDateString()}.
              </p>
            ) : null}
            <p className="text-xs text-muted">
              Customer since {new Date(tenant.createdAt).toLocaleDateString()}.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Site status</h3>
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3",
                live ? "bg-success-soft/50" : "bg-surface-sunken",
              )}
            >
              {live ? (
                <Rocket size={18} className="shrink-0 text-success" />
              ) : (
                <CircleSlash size={18} className="shrink-0 text-muted" />
              )}
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  {live ? "Your site is live" : "Your site is offline"}
                </p>
                <p className="text-muted">
                  {live
                    ? "Customers can find you and book online."
                    : "Not visible to customers until you make it live."}
                </p>
              </div>
            </div>

            {suspendedByOperator ? null : live ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSuspendOpen(true)}>
                  <Ban size={14} /> Suspend subscription
                </Button>
                <Link
                  href={`/site?salon=${tenant.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink size={13} /> View your site
                </Link>
              </div>
            ) : (
              <Button size="sm" onClick={makeLive}>
                <Rocket size={14} /> Make site live
              </Button>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Website address</h3>
              {domainMode === "custom" && domainConnected ? (
                <Badge tone={DOMAIN_TONE[tenant.domain.status]}>
                  {DOMAIN_LABEL[tenant.domain.status]}
                </Badge>
              ) : null}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-sunken px-3.5 py-2.5">
              <Globe size={15} className="shrink-0 text-muted" />
              <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
                {domainMode === "custom" && tenant.domain.status === "active" && tenant.domain.custom
                  ? tenant.domain.custom
                  : defaultAddress}
              </span>
              <button
                onClick={() =>
                  copy(
                    domainMode === "custom" && tenant.domain.status === "active" && tenant.domain.custom
                      ? tenant.domain.custom
                      : defaultAddress,
                  )
                }
                className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-border-strong/50 hover:text-foreground"
                aria-label="Copy address"
              >
                <Copy size={14} />
              </button>
            </div>

            <Segmented
              value={domainMode}
              onChange={setDomainMode}
              options={[
                { value: "subdomain", label: "Zaynat subdomain" },
                { value: "custom", label: "Custom domain" },
              ]}
            />

            {domainMode === "subdomain" ? (
              <p className="text-xs text-muted">
                Included free on every plan — no setup needed. Switch to a custom domain
                any time.
              </p>
            ) : !customDomainAllowed ? (
              <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-border-strong bg-surface-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted">
                  Custom domains are available on the{" "}
                  <span className="font-medium text-foreground">Premium</span> plan.
                </p>
                <Button size="sm" variant="outline" onClick={() => changePlan("premium")}>
                  Upgrade to Premium
                </Button>
              </div>
            ) : !domainConnected ? (
              <div className="space-y-3">
                <Field label="Your domain" hint="e.g. www.yoursalon.ae — no https:// needed.">
                  <Input
                    value={domainDraft}
                    onChange={(e) => setDomainDraft(e.target.value)}
                    placeholder="www.yoursalon.ae"
                  />
                </Field>
                <Button size="sm" onClick={connectDomain}>
                  Connect domain
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-3.5 py-2.5">
                  <span className="font-mono text-sm text-foreground">{tenant.domain.custom}</span>
                  <button
                    onClick={disconnectDomain}
                    className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-danger hover:underline"
                  >
                    <Unlink size={13} /> Disconnect
                  </button>
                </div>

                {tenant.domain.status === "active" ? (
                  <div className="flex items-start gap-2.5 rounded-xl bg-success-soft/50 px-3.5 py-3 text-sm">
                    <ShieldCheck size={16} className="mt-0.5 shrink-0 text-success" />
                    <p className="text-foreground">
                      Live on <span className="font-medium">{tenant.domain.custom}</span>.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted">
                      Add these records at your domain registrar, then verify below. DNS
                      changes can take up to 48 hours to propagate — this step is
                      simulated in this prototype, no real DNS lookup is performed.
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full min-w-[420px] text-left text-sm">
                        <thead className="bg-surface-sunken text-xs text-muted">
                          <tr>
                            <th className="px-3.5 py-2 font-medium">Type</th>
                            <th className="px-3.5 py-2 font-medium">Host</th>
                            <th className="px-3.5 py-2 font-medium">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr>
                            <td className="px-3.5 py-2 font-mono">CNAME</td>
                            <td className="px-3.5 py-2 font-mono">www</td>
                            <td className="px-3.5 py-2 font-mono">cname.{BRAND_DOMAIN}</td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-2 font-mono">TXT</td>
                            <td className="px-3.5 py-2 font-mono">_zaynat-verify</td>
                            <td className="px-3.5 py-2 font-mono">{verifyToken}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted">
                      Using your root domain instead of <span className="font-mono">www</span>?
                      Ask your registrar for an ALIAS/ANAME (or A) record pointing to the
                      same target.
                    </p>
                    <Button size="sm" onClick={verifyDomain}>
                      I&apos;ve updated my DNS — verify now
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Dialog
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        title="Suspend your subscription?"
        description="Your public booking site goes offline immediately and customers can no longer book. Your data stays intact and you can make it live again any time."
        footer={
          <>
            <Button variant="ghost" onClick={() => setSuspendOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmSuspend}>
              Suspend subscription
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          This is simulated — pausing here stops nothing being billed in this prototype,
          same as it would stop your real subscription charges in production.
        </p>
      </Dialog>
    </div>
  );
}
