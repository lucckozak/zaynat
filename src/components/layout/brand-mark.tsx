"use client";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Renders the salon's uploaded logo when set, otherwise its name as text. */
export function BrandMark({
  imgClassName,
  textClassName,
}: {
  imgClassName?: string;
  textClassName?: string;
}) {
  const { db } = useStore();
  const { name, logoUrl } = db.settings;

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={name || "Salon logo"}
        className={cn("h-8 w-auto max-w-[9rem] object-contain", imgClassName)}
      />
    );
  }

  return (
    <span
      className={cn(
        "font-serif text-xl font-semibold tracking-tight text-foreground",
        textClassName,
      )}
    >
      {name || "Maison Lumière"}
    </span>
  );
}
