"use client";

import { usePathname } from "next/navigation";
import { CircleSlash } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CustomerTabBar } from "@/components/layout/customer-tab-bar";
import { useAuth } from "@/lib/auth";
import { useTenant } from "@/lib/tenant";
import { cn } from "@/lib/utils";

// Auth pages stay reachable even while suspended, so an admin can still sign
// in and see the restricted-access banner on their own `/admin` dashboard.
const ALWAYS_ALLOWED = ["/login", "/register"];

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = useAuth();
  const { tenant, ready } = useTenant();
  const pathname = usePathname();

  const suspended =
    ready &&
    tenant &&
    (tenant.subscriptionStatus === "suspended" || tenant.subscriptionStatus === "cancelled") &&
    !ALWAYS_ALLOWED.includes(pathname);

  if (suspended) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-warning-soft text-warning">
              <CircleSlash size={26} />
            </div>
            <h1 className="font-serif text-2xl font-medium text-foreground">
              {tenant?.label} is currently unavailable
            </h1>
            <p className="mt-2 text-sm text-muted">
              This salon&apos;s online booking is temporarily paused. Please contact
              them directly, or check back soon.
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
