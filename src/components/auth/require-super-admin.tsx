"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSuperAdmin } from "@/lib/super-admin-auth";
import { FullPageLoader } from "./require-role";

/** Guards `/super-admin/*` routes with the platform-operator identity — entirely separate from any tenant's auth. */
export function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  const { account, ready } = useSuperAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!account) {
      router.replace(
        `/super-admin/login?next=${encodeURIComponent(window.location.pathname)}`,
      );
    }
  }, [ready, account, router]);

  if (!ready) return <FullPageLoader />;
  if (!account) return <FullPageLoader label="Redirecting…" />;

  return <>{children}</>;
}
