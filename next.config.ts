import type { NextConfig } from "next";
import path from "node:path";

/**
 * Fully static export — no server, no middleware, no API routes. Tenant
 * (salon) resolution therefore happens entirely client-side (query param /
 * localStorage), not via host-based or path-based server routing. See
 * `src/lib/tenant.tsx`.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    root: path.resolve(__dirname),
  },
  devIndicators: false,
};

export default nextConfig;
