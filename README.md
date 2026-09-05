# Zaynat — Phase 1 (Foundation) Prototype

**Zaynat** (intended production domain: `zaynat.app`) is a multi-tenant SaaS
platform for UAE salons: salon owners can register and run their own branded
booking site, while a **Super Admin console** (visible only to the Zaynat
team) oversees every salon on the platform. This repo is forked from, and
built on top of, the single-salon **Maison Lumière** prototype (see
`../Salonapp` — that repo is untouched).

**This is Phase 1 of a much larger spec** (see the product spec this repo was
built from). It covers the foundation only: multi-tenancy, roles/auth, salon
self-registration, and a Super Admin shell. Later phases (real payments,
custom-domain DNS/SSL, the public marketplace, reviews, analytics, etc.) are
**not** built yet — see "What's simulated / not built yet" below.

## Front-end prototype — no backend

Exactly like the original Maison Lumière prototype, **all data lives in the
browser** (`localStorage`); there is no server, database, or API. Multi-tenancy
is *simulated client-side*: each salon ("tenant") gets its own isolated
localStorage-backed dataset in this browser, resolved by the active tenant
(see `src/lib/tenant.tsx`). A real production build would replace this with
Postgres/Supabase + row-level security enforcing tenant isolation server-side
— required reading before that migration: `src/lib/tenants.ts` and
`src/lib/data/seed.ts` are the swap points.

Auth is real (role-based, session-persisted, one session per tenant); email
notifications are stubbed and written to an in-app log; payments are display-
only (no real processor is called).

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000 — the **Zaynat marketing homepage**. Click
"Get started free" to register a salon (creates a real, isolated tenant and
logs you straight into its `/admin`), or "Explore demo" to see the default
seeded salon.

## Three front doors

| Area | URL | Notes |
| --- | --- | --- |
| Marketing site | `/` | Zaynat's own site — features, pricing, About, Legal, salon signup. Not scoped to any salon; its brand colours never change. |
| Salon site (customer/staff/admin) | `/site` | Scoped to whichever salon is currently active in this tab — branded in that salon's own colours/font/logo |
| Super Admin | `/super-admin` | For the Zaynat team only — manages every salon on the platform |

This mirrors the spec's architecture (§62): a platform website sits above
many individually-branded salon sites, with a Super Admin operating both. The
one thing this client-side prototype can't do is give each salon its own real
subdomain/URL — see `src/lib/tenant.tsx` for why (`output: "export"`, no
server routing), and how the active salon is resolved instead.

**Register a salon** at `/register-salon` — pick a name, emirate, starting
template and plan, and you're logged into a brand-new, fully isolated tenant
immediately (no Super Admin approval needed).

**Demo salon accounts** (password `password` for all, on the seeded default
tenant): `customer@salon.app`, `sarah@salon.app` (specialist),
`admin@salon.app`. Other specialists: `emma@`, `maria@`, `lina@`,
`priya@salon.app`.

**Super Admin demo account**: `platform@admin.app` / `password`.

## Demo mode

The floating **Demo** panel (bottom-left, on salon-scoped pages only) lets
you preview the *currently active* salon's site as Customer / Specialist /
Admin with one click. It no longer switches between tenants or resets data —
use `/super-admin/salons` or a `?salon=<slug>` link for that (see below).

## Super Admin (`/super-admin`)

Visible only to the Zaynat team, never to salon owners.

- **Dashboard** — total/active/trial/suspended salons, MRR, new salons this
  month, recent salons, recent audit-log activity (including self-registrations).
- **Salons** — list/search/filter every tenant by status/emirate; **Create
  salon** for onboarding on a salon's behalf if needed (salons can also
  register themselves at `/register-salon` without any Super Admin action).
- **Salon detail** — onboarding checklist, plan/status editor, **Suspend /
  Reactivate** (suspending requires a reason, writes to the audit log, and
  actually disables that salon's public site — see below), a domain field
  (status only, no real DNS/SSL), marketplace visible/featured toggles, and
  contract stub fields.
- **Settings** — subscription plan pricing/limits, applied to newly-created
  salons.

Suspending a salon never deletes its data: the salon's own `Database` blob is
untouched. It (a) shows an "unavailable" page on that salon's public site
instead of normal chrome, and (b) shows a persistent restricted-access banner
on that salon's own `/admin`.

## Salon self-registration (`/register-salon`)

A salon owner fills in their own name/email/password plus their salon's
details, picks a starting template and a plan, and submits. Under the hood
(`src/lib/tenants.ts`'s `registerSalon`) this:

1. Creates a brand-new, isolated tenant exactly like Super Admin's own
   "create salon" flow does (`createTenant`).
2. Replaces that tenant's seeded demo admin account with the owner's real
   name/email/password, so they can log in with what they just typed.
3. Signs them in immediately (writes that tenant's session key) and switches
   the active tenant, landing them straight on `/admin`.

No Super Admin approval step exists in this prototype — every registration
succeeds immediately, consistent with "no card required" 14-day trials.

## Pages

- `/about` — positioning/mission page.
- `/legal` — Terms of Service + Privacy Policy. Clearly marked as
  placeholder content (not reviewed by counsel) but otherwise describes
  what the product actually does today — including the fact that all data
  is local-browser-only right now, which is an honest, load-bearing
  statement, not boilerplate.

## What's simulated / not built yet

This phase intentionally does **not** include (all noted as later phases in
the underlying spec, not silently dropped):

- A real backend — Postgres/Supabase, server-enforced tenant isolation (RLS),
  or any API. Everything here is one browser's localStorage.
- Real payment provider connections, webhooks, or any actual money movement.
- Real custom-domain DNS/SSL provisioning (the domain field is a status label
  only).
- The public marketplace (`/find` is a labelled "coming soon" stub) — search,
  map, filters, public salon discovery. Only the per-tenant "visible in
  marketplace" / "featured" flags exist so far, for a later phase to consume.
- Reviews, multi-location branches, WhatsApp/SMS notifications, analytics
  pipelines, contracts as real signed documents.
- True multi-browser/multi-user scale — this is inherently a single-browser
  simulation (localStorage), not a substitute for hundreds/thousands of real
  tenants sharing a real database.
- Email verification, password reset, or any anti-abuse checks on
  `/register-salon` — anyone can register any number of salons instantly.

## Structure

```
src/
  app/
    page.tsx          Zaynat marketing homepage ("/") — not salon-scoped
    about/            "/about"
    legal/            "/legal" — ToS + Privacy
    register-salon/   salon self-registration ("/register-salon")
    find/             "Find a Salon" marketplace stub ("/find")
    (site)/           salon storefront + customer pages, at "/site"
                       (public chrome; suspension-gated)
    staff/            specialist dashboard (role: EMPLOYEE)
    admin/            salon admin panel (role: ADMIN; suspension banner)
    super-admin/      Zaynat team only — separate auth, cross-tenant
  components/
    marketing/        header/footer/showcase/pricing/FAQ for the platform site
    ui/, layout/, booking/, calendar/, appointments/, …
  lib/
    brand.ts          BRAND_NAME/BRAND_DOMAIN — the platform's own identity
    platform-routes.ts shared "is this a platform (non-salon) route" check
    types.ts          domain model + TenantMeta (platform-owned tenant record)
    tenant.tsx         resolves & switches the active tenant (client-side only —
                       this is a static export, so no server/host routing)
    tenants.ts         tenant index CRUD: create/register/suspend/reactivate/reseed
    subscription-plans.ts  configurable plan pricing (Super Admin Settings)
    audit-log.ts       lightweight platform activity log
    auth.tsx           per-tenant salon session (role-based)
    super-admin-auth.tsx  separate Zaynat-team session
    fonts.ts, favicon.ts, image-upload.ts   per-salon branding (logo/favicon/font)
    data/              static catalog + deterministic seed generator (per-tenant)
    store.tsx          client data store (localStorage), scoped to the active
                       tenant — swap point for Supabase
    availability.ts    the slot engine (tenant-agnostic; scoped by whichever
                       Database it's handed)
```

`ThemeApplier` and the Demo panel are both route-aware
(`src/lib/platform-routes.ts`): a salon's brand colours/font/favicon and the
demo role-switcher only apply on salon-scoped routes (`/site` and everything
under it), never on `/`, `/about`, `/legal`, `/register-salon`, `/find`, or
`/super-admin`.
