import type { NextConfig } from "next";
import path from "node:path";

/**
 * Fully static export — no server, no middleware, no API routes. Tenant
 * (salon) resolution therefore happens entirely client-side (query param /
 * localStorage), not via host-based or path-based server routing. See
 * `src/lib/tenant.tsx`.
 *
 * Deployed as a fully static site to GitHub Pages at
 * https://lucckozak.github.io/zaynat/ — hence the `/zaynat` base path
 * (only applied for production builds so `npm run dev` still serves from
 * `/`). Any client code that writes an absolute "/..." URL by hand (not
 * via next/link, next/image, or the router, which rewrite it
 * automatically) must prefix it with `src/lib/base-path.ts`'s
 * `BASE_PATH`, or it 404s once deployed here.
 */
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? "/zaynat" : undefined,
  assetPrefix: isProd ? "/zaynat/" : undefined,
  turbopack: {
    root: path.resolve(__dirname),
  },
  devIndicators: false,
};

export default nextConfig;
