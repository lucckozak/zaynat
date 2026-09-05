"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Crosshair, MapPin, Search, Star } from "lucide-react";
import { EMIRATES, type Emirate } from "@/lib/types";
import { listTenants } from "@/lib/tenants";
import { loadDatabase } from "@/lib/data/seed";
import { salonRating } from "@/lib/selectors";
import { distanceKm } from "@/lib/geo";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/field";
import { EmptyState, Segmented, Skeleton } from "@/components/ui/misc";

type SortBy = "featured" | "rating" | "distance";

export function FindSalonsClient() {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [emirate, setEmirate] = useState<Emirate | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("featured");
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "denied" | "unsupported">("idle");

  useEffect(() => setMounted(true), []);

  function useMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortBy("distance");
        setGeoStatus("idle");
      },
      () => setGeoStatus("denied"),
      { timeout: 8000 },
    );
  }

  const listings = useMemo(() => {
    if (!mounted) return [];
    return listTenants()
      .filter((t) => t.marketplace.visible && t.subscriptionStatus === "active")
      .map((t) => {
        const db = loadDatabase(t.id);
        const rating = db ? salonRating(db) : { average: null, count: 0, isReal: false };
        const distance =
          userLoc && t.marketplace.lat != null && t.marketplace.lng != null
            ? distanceKm(userLoc, { lat: t.marketplace.lat, lng: t.marketplace.lng })
            : null;
        return { tenant: t, rating, distance };
      });
  }, [mounted, userLoc]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings
      .filter((l) => emirate === "all" || l.tenant.emirate === emirate)
      .filter(
        (l) =>
          !q ||
          l.tenant.label.toLowerCase().includes(q) ||
          l.tenant.area.toLowerCase().includes(q) ||
          l.tenant.city.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        if (sortBy === "distance") {
          if (a.distance == null && b.distance == null) return 0;
          if (a.distance == null) return 1;
          if (b.distance == null) return -1;
          return a.distance - b.distance;
        }
        if (sortBy === "rating") {
          return (b.rating.average ?? 0) - (a.rating.average ?? 0);
        }
        if (a.tenant.marketplace.featured !== b.tenant.marketplace.featured) {
          return a.tenant.marketplace.featured ? -1 : 1;
        }
        return a.tenant.label.localeCompare(b.tenant.label);
      });
  }, [listings, query, emirate, sortBy]);

  return (
    <div className="zaynat-page flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="text-center">
          <h1 className="font-brand text-3xl font-bold text-foreground">Find a salon</h1>
          <p className="mt-2 text-sm text-muted">
            Search salons across the UAE that have opted into the Zaynat marketplace.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Salon name or area…"
              className="pl-10"
            />
          </div>
          <Select
            value={emirate}
            onChange={(e) => setEmirate(e.target.value as Emirate | "all")}
            className="sm:w-48"
          >
            <option value="all">All emirates</option>
            {EMIRATES.map((em) => (
              <option key={em} value={em}>
                {em}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Segmented
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: "featured", label: "Featured" },
              { value: "rating", label: "Top rated" },
              { value: "distance", label: "Nearest" },
            ]}
          />
          {sortBy === "distance" && !userLoc ? (
            <button
              onClick={useMyLocation}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Crosshair size={13} />
              {geoStatus === "loading" ? "Finding you…" : "Use my location"}
            </button>
          ) : null}
        </div>
        {geoStatus === "denied" ? (
          <p className="mt-2 text-xs text-muted">
            Location access was denied — showing salons unsorted by distance instead.
          </p>
        ) : geoStatus === "unsupported" ? (
          <p className="mt-2 text-xs text-muted">
            Your browser doesn&apos;t support location — try searching by emirate instead.
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {!mounted ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)
          ) : listings.length === 0 ? (
            <div className="sm:col-span-2">
              <EmptyState
                icon={<MapPin size={20} />}
                title="No salons are listed yet"
                description="Salons appear here once they opt into the marketplace from their own dashboard."
              />
            </div>
          ) : results.length === 0 ? (
            <div className="sm:col-span-2">
              <EmptyState
                icon={<Search size={20} />}
                title="No salons match your search"
                description="Try a different name, area or emirate."
              />
            </div>
          ) : (
            results.map(({ tenant, rating, distance }) => (
              <Link
                key={tenant.id}
                href={`/site?salon=${tenant.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-medium text-foreground">{tenant.label}</h3>
                  {tenant.marketplace.featured ? <Badge tone="primary">Featured</Badge> : null}
                </div>
                <p className="inline-flex items-center gap-1.5 text-sm text-muted">
                  <MapPin size={13} />
                  {tenant.area}, {tenant.emirate}
                </p>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-strong">
                  {rating.average != null ? (
                    <span className="inline-flex items-center gap-1">
                      <Star size={14} className="fill-accent text-accent" />
                      {rating.average.toFixed(1)}
                      {rating.count > 0 ? (
                        <span className="text-muted">({rating.count})</span>
                      ) : null}
                    </span>
                  ) : (
                    <span className="text-muted">New</span>
                  )}
                  {distance != null ? <span>{distance.toFixed(1)} km away</span> : null}
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
