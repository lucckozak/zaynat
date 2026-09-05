"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { applyTheme, DEFAULT_THEME } from "@/lib/theme";

// Routes that aren't scoped to any one salon — the platform's own brand
// stays fixed here regardless of which salon was last active, rather than
// bleeding that salon's colours onto the operator's own tools.
const PLATFORM_ROUTE_PREFIXES = ["/super-admin", "/find"];

function isPlatformRoute(pathname: string) {
  return pathname === "/" || PLATFORM_ROUTE_PREFIXES.some((p) => pathname.startsWith(p));
}

/** Pushes the active salon's brand colours onto <html> as CSS variables. */
export function ThemeApplier() {
  const { db, hydrated } = useStore();
  const pathname = usePathname();
  const primary = db.settings.theme?.primary;
  const accent = db.settings.theme?.accent;
  const onPlatformRoute = isPlatformRoute(pathname);

  useEffect(() => {
    if (!hydrated) return;
    applyTheme(
      onPlatformRoute ? DEFAULT_THEME : { primary: primary ?? "", accent: accent ?? "" },
    );
  }, [hydrated, primary, accent, onPlatformRoute]);

  return null;
}
