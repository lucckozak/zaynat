"use client";

import { usePathname } from "next/navigation";
import { RequireSuperAdmin } from "@/components/auth/require-super-admin";
import { SuperAdminShell } from "@/components/layout/super-admin-shell";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // the login page renders its own centered card — no sidebar, no guard.
  // `trailingSlash: true` (next.config.ts) means this is "/super-admin/login/"
  // in production, so match with startsWith rather than an exact string.
  if (pathname.startsWith("/super-admin/login")) return <>{children}</>;

  return (
    <RequireSuperAdmin>
      <SuperAdminShell>{children}</SuperAdminShell>
    </RequireSuperAdmin>
  );
}
