"use client";

import { usePathname } from "next/navigation";
import { CircleSlash, Rocket } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CustomerTabBar } from "@/components/layout/customer-tab-bar";
import { useAuth } from "@/lib/auth";
import { useTenant } from "@/lib/tenant";
import { cn } from "@/lib/utils";

// Auth pages stay reachable even while not live, so an owner can still sign
// in and see the "activate to publish" banner on their own `/admin`.
const ALWAYS_ALLOWED = ["/login", "/register"];

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = useAuth();
  const { tenant, ready } = useTenant();
  const pathname = usePathname();

  // The public site only goes live once a salon has an active subscription
  // — trial, past-due, cancelled and operator-suspended salons are all
  // "not live" the same way, just with different messaging (and only
  // suspension requires contacting support to undo; the others can
  // self-activate from their own dashboard).
  const notLive =
    ready &&
    tenant &&
    tenant.subscriptionStatus !== "active" &&
    // `trailingSlash: true` (next.config.ts) means pathname is e.g.
    // "/login/" in production — match with startsWith, not equality.
    !ALWAYS_ALLOWED.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (notLive) {
    const suspendedByOperator = tenant.suspension.suspended;
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="max-w-md text-center">
            <div
              className={cn(
                "mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full",
                suspendedByOperator ? "bg-warning-soft text-warning" : "bg-primary-soft text-primary",
              )}
            >
              {suspendedByOperator ? <CircleSlash size={26} /> : <Rocket size={26} />}
            </div>
            <h1 className="font-serif text-2xl font-medium text-foreground">
              {suspendedByOperator
                ? `${tenant.label} is currently unavailable`
                : `${tenant.label} isn't live yet`}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {suspendedByOperator
                ? "This salon's online booking is temporarily paused. Please contact them directly, or check back soon."
                : "This salon isn't taking online bookings right now. Please check back soon!"}
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className={cn("flex-1", role === "CUSTOMER" && "pb-20 md:pb-0")}>
        {children}
      </main>
      <SiteFooter />
      <CustomerTabBar />
    </div>
  );
}
