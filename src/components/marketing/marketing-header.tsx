"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Images, Menu, PlayCircle, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand";
import { useAnchorNav } from "@/lib/use-anchor-nav";
import { LinkButton } from "@/components/ui/button";

const NAV = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/find", label: "Find a Salon" },
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const handleAnchorClick = useAnchorNav();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles size={16} />
          </span>
          <span className="font-brand text-xl font-semibold tracking-tight text-foreground">
            {BRAND_NAME}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleAnchorClick(e, item.href)}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-strong transition-colors hover:bg-surface-sunken hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <div className="relative">
            <button
              onClick={() => setLoginOpen((v) => !v)}
              onBlur={() => setTimeout(() => setLoginOpen(false), 150)}
              className="flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-muted-strong transition-colors hover:bg-surface-sunken hover:text-foreground"
            >
              Log in <ChevronDown size={14} />
            </button>
            {loginOpen ? (
              <div className="absolute right-0 top-full mt-1 w-52 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-[var(--shadow-pop)]">
                <Link
                  href="/login"
                  className="block px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-surface-sunken"
                >
                  Salon owner login
                </Link>
                <Link
                  href="/super-admin/login"
                  className="block px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-surface-sunken"
                >
                  {BRAND_NAME} team login
                </Link>
              </div>
            ) : null}
          </div>
          <LinkButton href="/tour" variant="outline" size="sm">
            <Images size={15} /> Tour
          </LinkButton>
          <LinkButton href="/site" variant="outline" size="sm">
            <PlayCircle size={15} /> Demo
          </LinkButton>
          <LinkButton href="/register-salon" size="sm">
            Get started free
          </LinkButton>
        </div>

        <button
          className="rounded-lg p-2 text-foreground lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface lg:hidden">
          <div className="space-y-1 px-4 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  handleAnchorClick(e, item.href);
                  setOpen(false);
                }}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-sunken"
              >
                {item.label}
              </Link>
            ))}
            <div className={cn("mt-3 flex flex-col gap-2 border-t border-border pt-3")}>
              <LinkButton href="/login" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Salon owner login
              </LinkButton>
              <LinkButton
                href="/super-admin/login"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                {BRAND_NAME} team login
              </LinkButton>
              <LinkButton href="/tour" variant="outline" size="sm" onClick={() => setOpen(false)}>
                <Images size={15} /> Tour
              </LinkButton>
              <LinkButton href="/site" variant="outline" size="sm" onClick={() => setOpen(false)}>
                <PlayCircle size={15} /> Demo
              </LinkButton>
              <LinkButton href="/register-salon" size="sm" onClick={() => setOpen(false)}>
                Get started free
              </LinkButton>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
