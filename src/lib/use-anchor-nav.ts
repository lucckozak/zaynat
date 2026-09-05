"use client";

import { usePathname } from "next/navigation";

/**
 * Next.js App Router's <Link href="/#hash"> reliably navigates to a
 * *different* page and jumps to the anchor there, but when you're already
 * on that page it just... doesn't scroll (confirmed in-browser: the URL
 * doesn't even change) — a known App Router limitation, not something
 * fixable by passing a different prop. This does the scroll ourselves when
 * already on the target page, and falls back to a normal navigation
 * otherwise (the target page's `scroll-mt-*` on the section keeps the
 * eventual native hash-jump from landing under the sticky header).
 */
export function useAnchorNav() {
  const pathname = usePathname();

  return function handleAnchorClick(e: React.MouseEvent, href: string) {
    const [path, hash] = href.split("#");
    if (!hash) return;
    const targetPath = path || "/";
    if (pathname !== targetPath) return; // let the normal navigation happen

    e.preventDefault();
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${hash}`);
    }
  };
}
