"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { useAnchorNav } from "@/lib/use-anchor-nav";

export function MarketingFooter() {
  const handleAnchorClick = useAnchorNav();
  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles size={14} />
              </span>
              <span className="font-brand text-lg font-semibold text-foreground">
                {BRAND_NAME}
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Booking software for UAE salons — your own site, your own
              customers, your own payments.
            </p>
          </div>

          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-strong">
              Product
            </p>
            <nav className="flex flex-col gap-2 text-sm text-muted">
              <Link
                href="/#features"
                onClick={(e) => handleAnchorClick(e, "/#features")}
                className="hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                onClick={(e) => handleAnchorClick(e, "/#pricing")}
                className="hover:text-foreground"
              >
                Pricing
              </Link>
              <Link href="/site" className="hover:text-foreground">
                Demo
              </Link>
              <Link href="/find" className="hover:text-foreground">
                Find a Salon
              </Link>
            </nav>
          </div>

          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-strong">
              Company
            </p>
            <nav className="flex flex-col gap-2 text-sm text-muted">
              <Link href="/about" className="hover:text-foreground">
                About
              </Link>
              <Link href="/legal" className="hover:text-foreground">
                Legal
              </Link>
              <Link href="/register-salon" className="hover:text-foreground">
                Register your salon
              </Link>
            </nav>
          </div>

          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-strong">
              Log in
            </p>
            <nav className="flex flex-col gap-2 text-sm text-muted">
              <Link href="/login" className="hover:text-foreground">
                Salon owner login
              </Link>
              <Link href="/super-admin/login" className="hover:text-foreground">
                {BRAND_NAME} team login
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
          <p className="max-w-xl text-xs text-muted">
            Prototype — a full multi-tenant SaaS platform for UAE salons. Data
            in this demo lives only in your browser; no real payments,
            domains, or messages are sent.
          </p>
        </div>
      </div>
    </footer>
  );
}
