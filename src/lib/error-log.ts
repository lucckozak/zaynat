import { uid } from "./utils";

/**
 * A local, per-browser fallback error log — same localStorage pattern as
 * audit-log.ts. On its own this only ever shows errors that happened in
 * whoever is currently looking at it (there's no backend to aggregate
 * errors across every visitor's browser), which is real but limited
 * value; see observability.ts for the real cross-user path (Sentry, only
 * active when NEXT_PUBLIC_SENTRY_DSN is configured at build time).
 */
export interface ErrorLogEntry {
  id: string;
  at: string;
  message: string;
  stack?: string;
  url: string;
}

const KEY = "platform:errorLog";
const MAX_ENTRIES = 200;

function read(): ErrorLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ErrorLogEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: ErrorLogEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function logError(message: string, stack?: string) {
  const entries = read();
  entries.unshift({
    id: uid("err"),
    at: new Date().toISOString(),
    message,
    stack,
    url: typeof window !== "undefined" ? window.location.href : "",
  });
  write(entries);
}

export function listErrors(): ErrorLogEntry[] {
  return read();
}

export function clearErrors() {
  write([]);
}
