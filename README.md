# UAE Salon Platform — Phase 1 (Foundation) Prototype

A multi-tenant SaaS platform for UAE salons: a **Platform Super Admin** manages
many independent salon tenants, each with its own booking site, staff,
customers and calendar. This repo is forked from, and built on top of, the
single-salon **Maison Lumière** prototype (see `../Salonapp` — that repo is
untouched).

**This is Phase 1 of a much larger spec** (see the product spec this repo was
built from). It covers the foundation only: multi-tenancy, roles/auth, salon
creation, and a Super Admin shell. Later phases (real payments, custom-domain
DNS/SSL, the public marketplace, reviews, analytics, etc.) are **not** built
yet — see "What's simulated / not built yet" below.

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

Open http://localhost:3000. A default tenant (Maison Lumière) is seeded on
first run.

## Two logins

| Area | URL | Notes |
| --- | --- | --- |
| Salon site (customer/staff/admin) | `/` | Scoped to whichever salon is currently active in this tab |
| Platform Super Admin | `/super-admin` | Independent of any salon — manages every tenant |

**Salon demo accounts** (password `password` for all): `customer@salon.app`,
`sarah@salon.app` (specialist), `admin@salon.app`. Other specialists: `emma@`,
`maria@`, `lina@`, `priya@salon.app`.

**Super Admin demo account**: `platform@admin.app` / `password`.

## Demo mode / tenant switcher

The floating **Demo** panel (bottom-left) now switches between **real,
isolated tenants** rather than just re-skinning one dataset:

- **Salon (tenant)** — lists every salon created so far; switching is
  non-destructive (each tenant's data stays intact in its own localStorage
  key) and restores whichever session (if any) was last active for that
  tenant.
- **Create a new salon…** jumps into the Super Admin "create salon" flow.
- **Copy share link** — `…/?salon=<slug>` opens pre-selected on that tenant.
- **View the site as** Customer / Specialist / Admin, **Reset** sample data —
  same as before, scoped to the currently active tenant only.

## Super Admin (`/super-admin`)

- **Dashboard** — total/active/trial/suspended salons, MRR, new salons this
  month, recent salons, recent audit-log activity.
- **Salons** — list/search/filter every tenant by status/emirate; **Create
  salon** (a simplified, single-step version of the full spec's 11-step
  onboarding wizard — business info + starting template + plan is enough to
  produce a working tenant here).
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

## What's simulated / not built yet

This phase intentionally does **not** include (all noted as later phases in
the underlying spec, not silently dropped):

- A real backend — Postgres/Supabase, server-enforced tenant isolation (RLS),
  or any API. Everything here is one browser's localStorage.
- Real payment provider connections, webhooks, or any actual money movement.
- Real custom-domain DNS/SSL provisioning (the domain field is a status label
  only).
- The public marketplace (`/find`) — search, map, filters, public salon
  discovery. Only the per-tenant "visible in marketplace" / "featured" flags
  exist so far, for a later phase to consume.
- Reviews, multi-location branches, WhatsApp/SMS notifications, analytics
  pipelines, contracts as real signed documents.
- True multi-browser/multi-user scale — this is inherently a single-browser
  simulation (localStorage), not a substitute for hundreds/thousands of real
  tenants sharing a real database.

## Structure

```
src/
  app/
    (site)/         marketing + customer pages (public chrome; suspension-gated)
    staff/          specialist dashboard (role: EMPLOYEE)
    admin/          salon admin panel (role: ADMIN; suspension banner)
    super-admin/    platform operator — separate auth, cross-tenant
  components/       ui/, layout/, booking/, calendar/, appointments/, …
  lib/
    types.ts        domain model + TenantMeta (platform-owned tenant record)
    tenant.tsx       resolves & switches the active tenant (client-side only —
                     this is a static export, so no server/host routing)
    tenants.ts       tenant index CRUD: create/list/suspend/reactivate/reseed
    subscription-plans.ts  configurable plan pricing (Super Admin Settings)
    audit-log.ts     lightweight platform activity log
    auth.tsx         per-tenant salon session (role-based)
    super-admin-auth.tsx  separate platform-operator session
    data/            static catalog + deterministic seed generator (per-tenant)
    store.tsx        client data store (localStorage), scoped to the active
                     tenant — swap point for Supabase
    availability.ts  the slot engine (tenant-agnostic; scoped by whichever
                     Database it's handed)
```
