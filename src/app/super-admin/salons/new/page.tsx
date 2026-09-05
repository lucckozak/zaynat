"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { EMIRATES, type Emirate, type SubscriptionPlanId } from "@/lib/types";
import { createTenant } from "@/lib/tenants";
import { SALON_PRESETS } from "@/lib/data/presets";
import { listSubscriptionPlans } from "@/lib/subscription-plans";
import { logAudit } from "@/lib/audit-log";
import { useTenant } from "@/lib/tenant";
import { useSuperAdmin } from "@/lib/super-admin-auth";
import { PageHeading } from "@/components/layout/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

/**
 * Simplified single-step version of the spec's 11-step onboarding wizard
 * (business info → branding → services → … → publish). Business info +
 * starting template + plan is enough to produce a fully working, isolated
 * tenant in this client-side simulation; branding/services/employees can
 * then be fine-tuned from that salon's own Admin → Settings.
 */
export default function NewSalonPage() {
  const router = useRouter();
  const toast = useToast();
  const { refreshTenants } = useTenant();
  const { account } = useSuperAdmin();
  const plans = listSubscriptionPlans();

  const [label, setLabel] = useState("");
  const [emirate, setEmirate] = useState<Emirate>("Dubai");
  const [city, setCity] = useState("Dubai");
  const [area, setArea] = useState("");
  const [presetId, setPresetId] = useState(SALON_PRESETS[0].id);
  const [plan, setPlan] = useState<SubscriptionPlanId>("professional");
  const [submitting, setSubmitting] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) {
      toast.error("Salon name is required");
      return;
    }
    setSubmitting(true);
    const meta = createTenant({
      label: label.trim(),
      emirate,
      city: city.trim() || emirate,
      area: area.trim() || "—",
      presetId,
      subscriptionPlan: plan,
    });
    logAudit({
      actor: account?.name ?? "Super Admin",
      action: "Created salon",
      entity: meta.label,
      meta: { plan, emirate },
    });
    refreshTenants();
    toast.success(`${meta.label} created`, "Trial started — 14 days.");
    router.push(`/super-admin/salons/detail?salonId=${meta.id}`);
  }

  return (
    <div>
      <PageHeading title="Create a salon" description="Onboard a new tenant in minutes." />

      <form onSubmit={submit} className="max-w-2xl space-y-5">
        <Card>
          <CardBody className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Business information</h3>
            <Field label="Salon name" required>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Glow Beauty Studio" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Emirate" required>
                <select
                  value={emirate}
                  onChange={(e) => setEmirate(e.target.value as Emirate)}
                  className="h-11 w-full rounded-xl border border-border-strong bg-surface px-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {EMIRATES.map((em) => (
                    <option key={em} value={em}>
                      {em}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="City">
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dubai" />
              </Field>
              <Field label="Area">
                <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Jumeirah" />
              </Field>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Starting template</h3>
            <p className="text-xs text-muted">
              Seeds the salon with a ready-made service menu, team and branding — fully editable afterwards.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SALON_PRESETS.map((p) => {
                const active = p.id === presetId;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPresetId(p.id)}
                    className={cn(
                      "flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors",
                      active ? "border-primary bg-primary-soft/50" : "border-border hover:border-primary/40",
                    )}
                  >
                    <span
                      className="mt-1 h-3 w-3 shrink-0 rounded-full ring-2 ring-white"
                      style={{ background: p.theme.primary }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">{p.label}</span>
                      <span className="block truncate text-xs text-muted">{p.blurb}</span>
                    </span>
                    {active ? <Check size={15} className="mt-0.5 shrink-0 text-primary" /> : null}
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Subscription plan</h3>
            <div className="grid gap-2 sm:grid-cols-3">
              {plans.map((p) => {
                const active = p.id === plan;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPlan(p.id)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-left transition-colors",
                      active ? "border-primary bg-primary-soft/50" : "border-border hover:border-primary/40",
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{p.label}</span>
                      {active ? <Check size={15} className="text-primary" /> : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">AED {p.monthlyPriceAed}/mo</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted">Starts on a 14-day trial. Prices are configurable under Settings.</p>
          </CardBody>
        </Card>

        <Button type="submit" size="lg" loading={submitting}>
          Create salon
        </Button>
      </form>
    </div>
  );
}
