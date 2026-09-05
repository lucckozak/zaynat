"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, UserRound, X } from "lucide-react";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useTenant } from "@/lib/tenant";
import { useToast } from "@/components/ui/toast";

const ROLE_HOME: Record<Role, string> = {
  CUSTOMER: "/account",
  EMPLOYEE: "/staff",
  ADMIN: "/admin",
};

const ROLE_LABEL: Record<Role, string> = {
  CUSTOMER: "Customer",
  EMPLOYEE: "Specialist",
  ADMIN: "Admin",
};

export function DemoPanel() {
  const { hydrated } = useStore();
  const { role, viewAs } = useAuth();
  const { tenant } = useTenant();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(true);

  // This is prototype tooling for previewing a salon's site as a different
  // role — it has no place on the platform's own marketing site, the
  // (not-yet-built) marketplace, or the Super Admin console, which are not
  // scoped to any one salon.
  const onSalonRoute =
    !pathname.startsWith("/super-admin") &&
    pathname !== "/" &&
    !pathname.startsWith("/find");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const off =
        params.get("demo") === "off" ||
        sessionStorage.getItem("demo:hidden") === "1";
      if (params.get("demo") === "off")
        sessionStorage.setItem("demo:hidden", "1");
      setHidden(off);
    } catch {
      setHidden(false);
    }
  }, []);

  if (!hydrated || hidden || !onSalonRoute) return null;

  function pickRole(r: Role) {
    if (viewAs(r)) {
      router.push(ROLE_HOME[r]);
      toast.success(`Viewing as ${ROLE_LABEL[r]}`);
      setOpen(false);
    }
  }

  return (
    <div className="fixed bottom-[4.75rem] left-4 z-[70] md:bottom-4">
      {open ? (
        <div className="animate-fade-in mb-2 w-[19rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-pop)]">
          <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                Demo controls
              </p>
              <p className="text-xs text-muted">
                Preview this salon's site as a different role.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="-mr-1 rounded-lg p-1 text-muted hover:bg-surface-sunken hover:text-foreground"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-4 py-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <UserRound size={12} /> View the site as
            </p>
            <div className="flex gap-1.5">
              {(["CUSTOMER", "EMPLOYEE", "ADMIN"] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => pickRole(r)}
                  className={cn(
                    "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                    role === r
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-foreground hover:border-primary/50",
                  )}
                >
                  {ROLE_LABEL[r]}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-medium text-foreground shadow-[var(--shadow-pop)] transition-colors hover:border-primary/50",
          open && "border-primary/50",
        )}
      >
        <Sparkles size={14} className="text-primary" />
        Demo
        <span className="hidden text-muted sm:inline">
          · {tenant?.label ?? "…"}
        </span>
      </button>
    </div>
  );
}
