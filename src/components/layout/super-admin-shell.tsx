"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Store,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSuperAdmin } from "@/lib/super-admin-auth";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: "/super-admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/super-admin/salons", label: "Salons", icon: Store },
  { href: "/super-admin/settings", label: "Settings", icon: Settings },
];

export function SuperAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { account, signOut } = useSuperAdmin();
  const [open, setOpen] = useState(false);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const navLinks = (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-card)]"
                : "text-muted-strong hover:bg-surface-sunken hover:text-foreground",
            )}
          >
            <item.icon size={17} strokeWidth={active ? 2.3 : 1.9} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-3 py-5">
        <Link href="/super-admin" className="font-serif text-lg font-semibold text-foreground">
          UAE Salon Platform
        </Link>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.18em] text-accent">
          Super Admin
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-3">{navLinks}</div>
      <div className="border-t border-border p-3">
        <Link
          href="/"
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-strong hover:bg-surface-sunken hover:text-foreground"
        >
          <ArrowUpRight size={17} /> Back to demo site
        </Link>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-strong hover:bg-surface-sunken hover:text-foreground"
        >
          <LogOut size={17} /> Sign out
        </button>
        {account ? (
          <div className="mt-2 rounded-xl bg-surface-sunken px-3 py-2.5">
            <p className="truncate text-sm font-medium text-foreground">{account.name}</p>
            <p className="truncate text-xs text-muted">{account.email}</p>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 border-r border-border bg-surface">
            {sidebarContent}
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-1.5 text-foreground"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="font-serif text-base font-semibold text-foreground">
            UAE Salon Platform
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-accent">
            Super Admin
          </span>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
