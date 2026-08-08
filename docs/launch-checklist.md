# UnclutterOS — Production Launch Checklist

Launch posture: therapists sign up/set up, clients book + create/sign into accounts, sessions run on a real secure video provider link (`videoRoomLink`). The custom telehealth shell is NOT the launch join surface.

## 1. Environment variables

API (`apps/api`) — set on the production host, NOT committed:

| Var | Required | Notes |
| --- | --- | --- |
| `NODE_ENV` | yes | `production` — turns on `secure` cookies (`apps/api/src/common/auth.config.ts`) |
| `PORT` | yes | e.g. `3001`; exactly one process must serve it |
| `DATABASE_URL` | yes | production Postgres |
| `JWT_SECRET` | yes | persistent, stable across restarts (ephemeral random is generated otherwise → all sessions invalidate on restart) |
| `REFRESH_SECRET` | yes | same as above |
| `CORS_ORIGINS` | yes | comma-separated web origins, e.g. `https://unclutteros.com,https://app.yourdomain.com` |
| `APP_URL` | yes | used for invite links (`apps/api/src/modules/tenant/tenant.service.ts`) |
| `DAILY_PLATFORM_API_KEY` | optional | only if using Daily rooms; without it sessions default to free Jitsi Meet (`meet.jit.si`) |

Web (`apps/web`, via `VITE_*` at build time — `apps/web/src/utils/apiClient.ts`):

| Var | Notes |
| --- | --- |
| `VITE_API_URL` | production API base URL (defaults to `http://localhost:3001`) |
| `VITE_TENANT_SLUG` | tenant slug used for public booking links + `X-Tenant-Slug` |

## 2. Database

- Run migrations/`prisma db push` against the production `DATABASE_URL` before first boot.
- Run the seed once (`prisma/seed.js`) — it creates the demo tenant, provider profile, services, availability, forms and a seeded completed booking used by the smoke test.
- Keep schema changes gated; do not regenerate the DB in place once real bookings exist.

## 3. Auth & cookies over HTTPS

- Both API and web must be served over HTTPS (cookies are `secure: true` when `NODE_ENV=production`).
- Cookies: `unclutter_access` (15m), `unclutter_refresh` (30d), `unclutter_csrf` (non-httpOnly). `sameSite: lax` is fine for same-site deployments.
- Verify CSRF flow: browser sends the CSRF cookie + `X-CSRF-Token` header on mutations (`apps/web/src/utils/apiClient.ts`).
- Confirm one login round-trip on the production domain before going wide.

## 4. Process & hosting

- Run exactly ONE API process (multiple stale processes on `:3001` caused a collision locally — use `ecosystem.config.js` / `deploy.sh`, and confirm only one process is bound to the port).
- Build & serve the web app (`pnpm --filter @unclutteros/web build`); serve `dist/` over HTTPS.
- Tenant resolution uses the `X-Tenant-Slug` header; verify the slug is present on every API call in production.

## 5. Telehealth (video room links)

- Default: every booking gets a Jitsi room link (`https://meet.jit.si/unclutteros-session-<bookingId>`), zero config.
- Optional Daily: set `DAILY_PLATFORM_API_KEY` (or per-provider key on the provider profile) for branded rooms with 24h expiry.
- All join CTAs open `videoRoomLink` in a new tab (portal, booking confirmation, session prep). The in-app telehealth shell at `/session/:id` is a preview only — it is not linked from any UI and does not host real media.
- On a real booking, click `Join secure video room` from session prep and confirm Jitsi loads for both parties.

## 6. Final smoke pass (one clean browser)

1. Therapist login (`dr.jane@smiththerapy.ng` / `password123`, slug `dr-smith`).
2. Client books a real available slot on `/booking/dr-smith`.
3. Confirmation page shows booking ref + `videoRoomLink`; `Join session` opens the provider link.
4. Client creates an account → signs in → `/portal` shows the real upcoming session → `Join session` works.
5. Therapist: Dashboard `Start session` → `/session/:id/prep` → `Join secure video room` opens the same link.
6. Confirm billing summary shows the subscription + payout account; confirm exactly one API process stays up.

## Known deferred items (not launch blockers)

- Realtime media inside the in-app telehealth shell (placeholder by design).
- Payment processing itself (billing UI + summary are wired; gateways not yet connected).
- Custom domain branding / practice-level switchable tenants in the dashboard.
