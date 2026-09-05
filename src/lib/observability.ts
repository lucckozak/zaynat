import * as Sentry from "@sentry/browser";
import { logError } from "./error-log";

/**
 * Real error tracking for a backend-less static app: Sentry only turns on
 * when NEXT_PUBLIC_SENTRY_DSN is set at build time (a Sentry DSN is meant
 * to be public/client-embeddable, same as any other NEXT_PUBLIC_* value
 * this app already bakes in — see base-path.ts) — set it before `npm run
 * deploy` and every visitor's browser reports real errors to your Sentry
 * project, which is the only way to see errors that happen on someone
 * else's device. Without a DSN this still logs to error-log.ts, a local
 * fallback that's useful for your own testing but — being per-browser,
 * with no backend to aggregate it — cannot show what broke for anyone
 * else. That gap is real and only closes with a DSN, not more code here.
 */
let initialized = false;

export function initObservability() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (dsn) {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      // Pure client-side static app — no server transactions to trace.
      tracesSampleRate: 0,
    });
  }

  window.addEventListener("error", (event) => {
    logError(event.message, event.error?.stack);
    if (dsn) Sentry.captureException(event.error ?? new Error(event.message));
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason: unknown = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    logError(message, reason instanceof Error ? reason.stack : undefined);
    if (dsn) Sentry.captureException(reason instanceof Error ? reason : new Error(message));
  });
}
