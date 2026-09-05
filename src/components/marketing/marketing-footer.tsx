import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary" size={18} />
            <span className="font-serif text-lg font-semibold text-foreground">
              UAE Salon Platform
            </span>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <Link href="#features" className="hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/find" className="hover:text-foreground">
              Find a Salon
            </Link>
            <Link href="/site" className="hover:text-foreground">
              Demo
            </Link>
            <Link href="/super-admin/login" className="hover:text-foreground">
              Platform operator
            </Link>
          </nav>
        </div>
        <p className="mt-6 text-xs text-muted">
          Prototype — a full multi-tenant SaaS platform for UAE salons. Data in
          this demo lives only in your browser; no real payments, domains, or
          messages are sent.
        </p>
      </div>
    </footer>
  );
}
