"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { applyTheme, DEFAULT_THEME } from "@/lib/theme";
import { applyFont, DEFAULT_FONT_ID } from "@/lib/fonts";
import { applyFavicon } from "@/lib/favicon";
import { isPlatformRoute } from "@/lib/platform-routes";

/** Pushes the active salon's brand colours, heading font and favicon onto the page. */
export function ThemeApplier() {
  const { db, hydrated } = useStore();
  const pathname = usePathname();
  const primary = db.settings.theme?.primary;
  const accent = db.settings.theme?.accent;
  const typography = db.settings.typography;
  const faviconUrl = db.settings.faviconUrl;
  const onPlatformRoute = isPlatformRoute(pathname);

  useEffect(() => {
    if (!hydrated) return;
    applyTheme(
      onPlatformRoute ? DEFAULT_THEME : { primary: primary ?? "", accent: accent ?? "" },
    );
    applyFont(onPlatformRoute ? DEFAULT_FONT_ID : typography);
    applyFavicon(onPlatformRoute ? undefined : faviconUrl);
  }, [hydrated, primary, accent, typography, faviconUrl, onPlatformRoute]);

  return null;
}
