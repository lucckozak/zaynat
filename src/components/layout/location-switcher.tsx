"use client";

import { MapPin } from "lucide-react";

export interface LocationOption {
  salonId: string;
  label: string;
}

/**
 * Only rendered by admin/layout.tsx when the logged-in owner's account
 * (see OwnerAccount in types.ts) spans more than one location — a
 * single-location owner (still the common case) never sees this at all.
 */
export function LocationSwitcher({
  locations,
  activeId,
  onSwitch,
}: {
  locations: LocationOption[];
  activeId: string;
  onSwitch: (salonId: string) => void;
}) {
  if (locations.length <= 1) return null;

  return (
    <div className="relative">
      <MapPin
        size={14}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <select
        value={activeId}
        onChange={(e) => onSwitch(e.target.value)}
        aria-label="Switch location"
        className="w-full cursor-pointer appearance-none truncate rounded-xl border border-border-strong bg-surface py-2 pl-8 pr-7 text-[13px] font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        {locations.map((l) => (
          <option key={l.salonId} value={l.salonId}>
            {l.label}
          </option>
        ))}
      </select>
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        aria-hidden
      >
        <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
