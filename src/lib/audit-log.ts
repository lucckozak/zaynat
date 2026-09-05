import type { AuditLogEntry } from "./types";

const KEY = "platform:auditLog";
const MAX_ENTRIES = 500;

function read(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuditLogEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: AuditLogEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

/** Records a platform-level action (Super Admin activity), newest first. */
export function logAudit(entry: {
  actor: string;
  action: string;
  entity: string;
  reason?: string;
  meta?: Record<string, string>;
}): AuditLogEntry {
  const full: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    ...entry,
  };
  write([full, ...read()]);
  return full;
}

export function listAuditLog(limit = 50): AuditLogEntry[] {
  return read().slice(0, limit);
}
