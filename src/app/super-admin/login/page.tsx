"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useSuperAdmin } from "@/lib/super-admin-auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

function LoginInner() {
  const { signIn, account, ready } = useSuperAdmin();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/super-admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && account) router.replace(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, account]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = signIn(email, password);
    if (!res.ok) setError(res.error ?? "Unable to sign in.");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <Link
        href="/"
        className="mb-8 flex items-center justify-center gap-2 text-center font-serif text-2xl font-semibold text-foreground"
      >
        <ShieldCheck className="text-primary" size={24} />
        UAE Salon Platform
      </Link>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        <h1 className="font-serif text-2xl font-medium text-foreground">Platform Super Admin</h1>
        <p className="mt-1 text-sm text-muted">Manage salons, subscriptions and the marketplace.</p>
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
          <Button type="submit" className="w-full" size="lg">
            Sign in
          </Button>
        </form>
      </div>
      <div className="mt-6 rounded-2xl border border-dashed border-border-strong bg-surface-muted p-4 text-center">
        <p className="text-xs font-medium text-muted-strong">
          Demo account: <code className="rounded bg-surface-sunken px-1.5 py-0.5">platform@admin.app</code>{" "}
          / <code className="rounded bg-surface-sunken px-1.5 py-0.5">password</code>
        </p>
      </div>
    </div>
  );
}

export default function SuperAdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
