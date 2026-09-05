"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Languages, Menu, User as UserIcon, X } from "lucide-react";
import { cn, fullName } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useLocale } from "@/lib/i18n";
import { Button, LinkButton } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { BrandMark } from "@/components/layout/brand-mark";

export function SiteHeader() {
  const pathname = usePathname();
  const { user, role, signOut, ready } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);

  const NAV = [
    { href: "/site", label: t("navHome") },
    { href: "/services", label: t("navTreatments") },
    { href: "/employees", label: t("navSpecialists") },
    { href: "/book", label: t("navBook") },
  ];

  const dashHref =
    role === "ADMIN" ? "/admin" : role === "EMPLOYEE" ? "/staff" : "/account";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/site" className="flex items-center gap-2">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/site"
                ? pathname === "/site" || pathname === "/site/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-soft text-primary-hover"
                    : "text-muted-strong hover:bg-surface-sunken hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-muted-strong transition-colors hover:bg-surface-sunken hover:text-foreground"
            aria-label="Switch language"
          >
            <Languages size={14} /> {t("langToggle")}
          </button>
          {ready && user ? (
            <div className="flex items-center gap-3">
              <Link
                href={dashHref}
                className="flex items-center gap-2 rounded-full py-1.5 ps-1.5 pe-3.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-sunken"
              >
                <Avatar name={fullName(user)} size="sm" />
                <span className="max-w-[10ch] truncate">{user.firstName}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut}>
                {t("signOut")}
              </Button>
            </div>
          ) : (
            <>
              <LinkButton href="/login" variant="ghost" size="sm">
                {t("signIn")}
              </LinkButton>
              <LinkButton href="/book" variant="primary" size="sm">
                {t("bookAppointment")}
              </LinkButton>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface md:hidden">
          <div className="space-y-1 px-4 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-sunken"
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-sunken"
            >
              <Languages size={15} /> {t("langToggle")}
            </button>
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              {user ? (
                <>
                  <LinkButton
                    href={dashHref}
                    variant="outline"
                    size="sm"
                    onClick={() => setOpen(false)}
                  >
                    <UserIcon size={15} /> {t("myArea")}
                  </LinkButton>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                  >
                    {t("signOut")}
                  </Button>
                </>
              ) : (
                <>
                  <LinkButton
                    href="/login"
                    variant="outline"
                    size="sm"
                    onClick={() => setOpen(false)}
                  >
                    {t("signIn")}
                  </LinkButton>
                  <LinkButton
                    href="/book"
                    variant="primary"
                    size="sm"
                    onClick={() => setOpen(false)}
                  >
                    <CalendarDays size={15} /> {t("bookAppointment")}
                  </LinkButton>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
