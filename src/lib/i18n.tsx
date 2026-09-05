"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { isPlatformRoute } from "./platform-routes";
import { STRINGS, type Locale, type StringKey } from "./i18n-strings";

const KEY = "zaynat:locale";

interface LocaleValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: StringKey) => string;
}

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(KEY);
      if (stored === "ar" || stored === "en") setLocaleState(stored);
    } catch {
      /* ignore privacy-mode errors */
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, []);

  // Only a salon's own public site goes bilingual/RTL — Zaynat's own
  // marketing/admin/super-admin chrome always stays English/LTR, the
  // same split ThemeApplier already makes for brand colours/fonts.
  const effectiveLocale: Locale = isPlatformRoute(pathname) ? "en" : locale;

  useEffect(() => {
    document.documentElement.lang = effectiveLocale;
    document.documentElement.dir = effectiveLocale === "ar" ? "rtl" : "ltr";
  }, [effectiveLocale]);

  const t = useCallback(
    (key: StringKey) => STRINGS[effectiveLocale][key] ?? STRINGS.en[key],
    [effectiveLocale],
  );

  const value = useMemo<LocaleValue>(
    () => ({ locale: effectiveLocale, setLocale, t }),
    [effectiveLocale, setLocale, t],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within <LocaleProvider>");
  return ctx;
}
