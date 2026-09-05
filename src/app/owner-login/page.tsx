"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { findOwnerAccount } from "@/lib/tenants";
import { sessionKey } from "@/lib/auth";
import { useTenant } from "@/lib/tenant";
import { BRAND_NAME } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

/**
 * The Zaynat-branded salon owner login — reached from Zaynat's own site
 * (header/footer "Salon owner login"), so it always shows Zaynat's fixed
 * theme, never whichever salon happened to be active in this tab.
 *
 * This is deliberately separate from the tenant-scoped `/login` under
 * (site), which keeps showing a salon's own branding when reached from
 * that salon's own site — an owner (or their staff/customers) logging in
 * "from their side" still gets their chosen theme there, unchanged.
 *
 * Since every tenant's users are stored in that tenant's own isolated
 * Database, there's no single place to check "does this email exist" —
 * this looks the owner up across every salon (see findOwnerAccount), which
 * only makes sense because this prototype has no real per-salon domain to
 * send them to instead.
 */
function OwnerLoginInner() {
  const router = useRouter();
  const { switchActiveSalon, refreshTenants } = useTenant();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    const match = findOwnerAccount(email, password);
    if (!match) {
      setError("No salon found for that email and password.");
      setSubmitting(false);
      return;
    }
    try {
      window.localStorage.setItem(sessionKey(match.salonId), match.userId);
    } catch {
      /* ignore quota / privacy-mode errors */
    }
    refreshTenants();
    switchActiveSalon(match.salonId);
    router.push("/admin");
  }

  return (
    <div className="zaynat-page mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <Link
        href="/"
        className="mb-8 flex items-center justify-center gap-2 text-center font-brand text-2xl font-semibold text-foreground"
      >
        <Sparkles className="text-primary" size={24} />
        {BRAND_NAME}
      </Link>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        <h1 className="font-brand text-2xl font-semibold text-foreground">Salon owner login</h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage your salon&apos;s dashboard.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Email" required>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Password" required error={error ?? undefined}>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button type="submit" className="w-full" size="lg" loading={submitting}>
            Sign in
          </Button>
        </form>
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/register-salon" className="font-medium text-primary hover:text-primary-hover">
          Create your salon
        </Link>
      </p>
    </div>
  );
}

export default function OwnerLoginPage() {
  return (
    <Suspense fallback={null}>
      <OwnerLoginInner />
    </Suspense>
  );
}
