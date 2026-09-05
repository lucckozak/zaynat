"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  PlusCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
  X,
} from "lucide-react";
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

function appRoot() {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/`;
}

export function DemoPanel() {
  const { hydrated, resetAll } = useStore();
  const { role, viewAs } = useAuth();
  const { salonId, tenant, tenants, switchActiveSalon } = useTenant();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(true);

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

  if (!hydrated || hidden) return null;

  function pickRole(r: Role) {
    if (viewAs(r)) {
      router.push(ROLE_HOME[r]);
      toast.success(`Viewing as ${ROLE_LABEL[r]}`);
      setOpen(false);
    }
  }

  function pickSalon(id: string) {
    if (id === salonId) {
      setOpen(false);
      return;
    }
    switchActiveSalon(id);
    // each tenant remembers its own last session (see src/lib/auth.tsx), so
    // this either restores whoever was signed in there before or lands
    // logged-out on that salon's public site — no manual re-attach needed.
    router.push("/");
    const label = tenants.find((t) => t.id === id)?.label ?? "salon";
    toast.success(`Switched to ${label}`);
    setOpen(false);
  }

  async function copyShareLink() {
    const url = `${appRoot()}?salon=${tenant?.slug ?? salonId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied", url);
    } catch {
      toast.info("Share link", url);
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
                Simulated multi-tenant demo — each salon below has its own
                isolated data.
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

            <p className="mb-1.5 mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <Store size={12} /> Salon (tenant)
            </p>
            <div className="space-y-1.5">
              {tenants.map((t) => {
                const active = t.id === salonId;
                return (
                  <button
                    key={t.id}
                    onClick={() => pickSalon(t.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors",
                      active
                        ? "border-primary bg-primary-soft/50"
                        : "border-border bg-surface hover:border-primary/40",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">
                        {t.label}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {t.emirate} · {t.subscriptionPlan}
                        {t.suspension.suspended ? " · suspended" : ""}
                      </span>
                    </span>
                    {active ? (
                      <Check size={15} className="shrink-0 text-primary" />
                    ) : null}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/super-admin/salons/new");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl border border-dashed border-border px-3 py-2 text-left text-sm text-muted transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <PlusCircle size={15} className="shrink-0" />
                Create a new salon…
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
              <button
                onClick={copyShareLink}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-xs font-medium text-foreground hover:border-primary/50"
              >
                <Copy size={13} /> Copy share link
              </button>
              <button
                onClick={() => {
                  resetAll();
                  toast.success("Sample data reset");
                  setOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-xs font-medium text-danger hover:border-danger/50"
              >
                <RotateCcw size={13} /> Reset
              </button>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                router.push("/super-admin");
              }}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-xs font-medium text-foreground hover:border-primary/50"
            >
              <ShieldCheck size={13} /> Platform Super Admin
            </button>
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
