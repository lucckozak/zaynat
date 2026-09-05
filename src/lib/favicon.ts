/**
 * Swaps the browser-tab icon at runtime by repointing the existing
 * `<link rel="icon">` tag(s) Next.js generates from the
 * `src/app/favicon.ico` convention file, rather than adding a new icon
 * link (which browsers resolve inconsistently when more than one is
 * present).
 *
 * Two quirks observed empirically (confirmed against the live DOM, not
 * assumed) made this trickier than "find the link, set its href":
 *  1. Next actually renders more than one `rel="icon"` tag at once (a
 *     plain "/favicon.ico" one plus a hashed-query variant) — every match
 *     must be updated, not just the first.
 *  2. On a fresh load, Next (re)inserts one of those tags asynchronously
 *     *after* this can first run, silently reverting it back to the
 *     default — so this keeps re-asserting the chosen href for a few
 *     seconds via a MutationObserver rather than trusting a single pass.
 *
 * IMPORTANT: the observer disconnects itself before making its own edits
 * and reconnects after (rather than trying to filter its own mutations
 * out via an equality check) — `link.href` always returns a browser-
 * resolved *absolute* URL, so comparing it against a relative string like
 * "/favicon.ico" is never equal, which previously caused the observer to
 * treat its own edit as an external change and re-apply forever, pegging
 * the tab's CPU. Caught this by watching the tab actually hang, not by
 * inspection — worth remembering if this file changes again.
 */
const DEFAULT_HREF = "/favicon.ico";
const REASSERT_WINDOW_MS = 4000;

let observer: MutationObserver | null = null;

function setAllIconLinks(href: string) {
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]');
  if (links.length === 0) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.setAttribute("href", href);
    document.head.appendChild(link);
    return;
  }
  links.forEach((link) => {
    if (link.getAttribute("href") !== href) link.setAttribute("href", href);
  });
}

const observerOptions: MutationObserverInit = {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["href"],
};

export function applyFavicon(url: string | undefined) {
  if (typeof document === "undefined") return;
  const href = url || DEFAULT_HREF;

  observer?.disconnect();
  setAllIconLinks(href);

  observer = new MutationObserver(() => {
    observer?.disconnect();
    setAllIconLinks(href);
    observer?.observe(document.head, observerOptions);
  });
  observer.observe(document.head, observerOptions);
  setTimeout(() => observer?.disconnect(), REASSERT_WINDOW_MS);
}
