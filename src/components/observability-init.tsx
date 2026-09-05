"use client";

import { useEffect } from "react";
import { initObservability } from "@/lib/observability";

/** Mount-only — starts error tracking once per page load. See observability.ts. */
export function ObservabilityInit() {
  useEffect(() => {
    initObservability();
  }, []);
  return null;
}
