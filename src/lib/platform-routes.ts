/**
 * Routes that belong to the platform itself, not to any one salon tenant —
 * the marketing site, legal/about pages, salon signup, the marketplace
 * stub, and Super Admin. Salon branding (colour/font/favicon) and the demo
 * role-switcher never apply here; see ThemeApplier and DemoPanel.
 */
const PLATFORM_ROUTE_PREFIXES = [
  "/super-admin",
  "/find",
  "/about",
  "/legal",
  "/register-salon",
  "/tour",
  "/owner-login",
];

export function isPlatformRoute(pathname: string) {
  return pathname === "/" || PLATFORM_ROUTE_PREFIXES.some((p) => pathname.startsWith(p));
}
