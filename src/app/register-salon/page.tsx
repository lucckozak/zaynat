"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { EMIRATES, type Emirate, type SubscriptionPlanId } from "@/lib/types";
import { registerSalon } from "@/lib/tenants";
import { sessionKey } from "@/lib/auth";
import { SALON_PRESETS } from "@/lib/data/presets";
import { listSubscriptionPlans } from "@/lib/subscription-plans";
import { logAudit } from "@/lib/audit-log";
import { useTenant } from "@/lib/tenant";
import { BRAND_NAME } from "@/lib/brand";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterSalonPage() {
  const router = useRouter();
  const toast = useToast();
  const { refreshTenants, switchActiveSalon } = useTenant();
  const plans = listSubscriptionPlans();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [salonName, setSalonName] = useState("");
  const [emirate, setEmirate] = useState<Emirate>("Dubai");
  const [city, setCity] = useState("Dubai");
  const [area, setArea] = useState("");
  const [presetId, setPresetId] = useState(SALON_PRESETS[0].id);
  const [plan, setPlan] = useState<SubscriptionPlanId>("starter");
  const [agreed, setAgreed] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) return setError("Enter your first and last name.");
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (!salonName.trim()) return setError("Enter your salon's name.");
    if (!agreed) return setError("You need to agree to the Terms & Privacy Policy to continue.");

    setSubmitting(true);
    const { meta, adminUserId } = registerSalon({
      ownerFirstName: firstName.trim(),
      ownerLastName: lastName.trim(),
      ownerEmail: email.trim(),
      ownerPhone: phone.trim(),
      ownerPassword: password,
      label: salonName.trim(),
      emirate,
      city: city.trim() || emirate,
      area: area.trim() || "—",
      presetId,
      subscriptionPlan: plan,
    });

    if (adminUserId) {
      try {
        window.localStorage.setItem(sessionKey(meta.id), adminUserId);
      } catch {
        /* ignore quota / privacy-mode errors — they'll just land on the login page */
      }
    }

    logAudit({
      actor: `${firstName.trim()} ${lastName.trim()} (self-registered)`,
      action: "Registered salon",
      entity: meta.label,
      meta: { plan, emirate },
    });

    refreshTenants();
    switchActiveSalon(meta.id);
    toast.success(`Welcome to ${BRAND_NAME}!`, "Your 14-day trial has started.");
    router.push("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="font-brand text-3xl font-bold text-foreground">
            Get your salon online
          </h1>
          <p className="mt-2 text-sm text-muted">
            Create your account and your salon at the same time — you&apos;ll land
            straight in your dashboard, no waiting.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Your account</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" required>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </Field>
                <Field label="Last name" required>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </Field>
              </div>
              <Field label="Email" required hint="This is what you'll use to log in.">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yoursalon.ae"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 5xx xxx xxx" />
                </Field>
                <Field label="Password" required hint="At least 6 characters.">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Your salon</h2>
              <Field label="Salon name" required>
                <Input
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  placeholder="Glow Beauty Studio"
                />
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
                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                </Field>
                <Field label="Area">
                  <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Jumeirah" />
                </Field>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Starting look</h2>
              <p className="text-xs text-muted">
                Seeds your salon with a ready-made service menu, team and branding — everything is editable afterwards from Settings.
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
              <h2 className="text-sm font-semibold text-foreground">Plan</h2>
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
              <p className="text-xs text-muted">
                Starts on a 14-day free trial, no card required. Change plans any time from Settings.
              </p>
            </CardBody>
          </Card>

          <label className="flex items-start gap-2.5 text-sm text-muted">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-strong text-primary focus-visible:ring-primary/30"
            />
            <span>
              I agree to {BRAND_NAME}&apos;s{" "}
              <Link href="/legal" className="font-medium text-primary hover:text-primary-hover">
                Terms &amp; Privacy Policy
              </Link>
              .
            </span>
          </label>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <Button type="submit" size="lg" loading={submitting} className="w-full">
            Create my salon
          </Button>

          <p className="text-center text-sm text-muted">
            Already have a salon?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
              Log in
            </Link>
          </p>
        </form>
      </main>

      <MarketingFooter />
    </div>
  );
}
