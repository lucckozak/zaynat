"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CalendarCheck, CalendarClock, CalendarX, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { fmt } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { AdminNotification } from "@/lib/types";

const KIND_ICON: Record<AdminNotification["kind"], typeof CalendarCheck> = {
  NEW_BOOKING: CalendarCheck,
  CANCELLED: CalendarX,
  RESCHEDULED: CalendarClock,
};

const KIND_TONE: Record<AdminNotification["kind"], string> = {
  NEW_BOOKING: "bg-success-soft text-success",
  CANCELLED: "bg-danger-soft text-danger",
  RESCHEDULED: "bg-info-soft text-info",
};

/**
 * The salon admin's own activity feed — new bookings, cancellations and
 * reschedules, generated at the source (notifyBooking in store.tsx) so
 * it can never drift from what actually happened. Rendered twice by
 * DashboardShell (once in the always-visible sidebar, once in the
 * mobile header) — each instance keeps its own open/closed state but
 * both read the same underlying data, so marking something read in one
 * is reflected in the other on its next render.
 */
export function NotificationBell() {
  const { db, markNotificationRead, markAllNotificationsRead } = useStore();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const notifications = db.adminNotifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-strong transition-colors hover:bg-surface-sunken hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 max-h-[28rem] w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-pop)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {unreadCount > 0 ? (
              <button
                onClick={markAllNotificationsRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Check size={12} /> Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-[23rem] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">
                No notifications yet — new bookings and cancellations will show up here.
              </p>
            ) : (
              notifications.slice(0, 20).map((n) => {
                const Icon = KIND_ICON[n.kind];
                return (
                  <button
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-sunken",
                      !n.read && "bg-primary-soft/20",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        KIND_TONE[n.kind],
                      )}
                    >
                      <Icon size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className={cn("text-sm", n.read ? "font-medium text-foreground" : "font-semibold text-foreground")}>
                          {n.title}
                        </span>
                        {!n.read ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> : null}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted">{n.body}</span>
                      <span className="mt-0.5 block text-[11px] text-muted">{fmt.timeAgo(n.createdAt)}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
