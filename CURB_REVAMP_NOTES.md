# Curb Revamp — Session Notes for Frank

## What shipped this session (Phase 1)

Live on main, auto-deployed via Vercel. Nothing existing removed — this is purely additive.

### Database (migrations 00013 + 00014, already applied to production)
- **Job numbers** — every booking now has an auto-generated `JOB-00001` reference. All 16 existing bookings were backfilled.
- **Project pipeline** — new `stage` enum: `inquiry → quoted → accepted → deposit_paid → scheduled → on_site → punch_list → completed` (plus `cancelled` / `declined`). Legacy `status` still works in parallel so old UI is unaffected.
- **9 new tables:** `booking_events`, `booking_scope_items`, `booking_invoices`, `booking_photos`, `daily_logs`, `booking_share_tokens`, `booking_checkins`, `waiver_templates`, `waiver_signatures`.
- **Pro tier column** on contractors (`new / bronze / silver / gold / platinum`) auto-calculated from rating + completed jobs. Backfilled for all 6 existing pros.
- **Auto-log trigger** — every stage change writes to the audit timeline automatically.
- **Geofence distance RPC** (`checkin_distance_to_job`) for arrival verification.
- **Nearby-contractors RPC** updated to return tier and sort tier-first, distance-second.
- **Supabase Storage bucket** `booking-photos` with public-read, authenticated-write policies.
- All new tables have RLS policies: parties + admin can read, contractor can manage their own project artifacts.
- Added `admin` value to the `user_role` enum (it was referenced in code but missing from the DB enum).

### API routes (all under `/api/bookings/[id]/`)
- `PATCH /stage` — forward-only stage transitions (rejects invalid jumps); auto-logs event; keeps legacy `status` in sync
- `POST /scope`, `PATCH /scope`, `DELETE /scope` — scope line items CRUD
- `POST /invoices`, `PATCH /invoices`, `DELETE /invoices` — milestone invoice CRUD; auto-stamps `sent_at` / `paid_at`
- `POST /photos`, `DELETE /photos` — tagged by phase (before / during / after / issue)
- `POST /logs` — daily field logs (upsert per day)
- `POST /checkin` — GPS check-in; computes distance from job site; auto-advances stage to `on_site` on first arrival
- `POST /share`, `DELETE /share` — generate / revoke a public read-only token for the homeowner

### UI
- **`/portal/[token]`** — brand-new public page, no login. Homeowner sees pipeline, scope, invoices, photos, daily progress, live check-in status, and full activity timeline. Increments view counter on each visit.
- **Project Workspace** embedded in both the contractor (`/pro/bookings/[id]`) and client (`/dashboard/bookings/[id]`) detail pages:
  - `StagePipeline` — 8-step visual progress bar
  - `StageControl` — "Move to next stage" buttons, forward-only enforcement
  - `Timeline` — full activity feed
  - `ScopeEditor` — itemized line items with change-order flag
  - `InvoiceList` — deposit / progress / final / change order; paid tracking
  - `PhotoGallery` — upload to Supabase Storage, phase tabs
  - `DailyLogForm` — hours / crew / weather / % complete / notes
  - `CheckInButton` — contractor taps "I've arrived"; GPS captured; homeowner sees status
  - `ShareButton` — generate revocable public portal link
- **`TierBadge`** — Bronze / Silver / Gold / Platinum gradient chip; appears on contractor cards, booking detail, and public portal
- **`JOB-XXXXX` reference** shown on booking cards, booking detail headers, and public portal

### Sample data seeded
One completed pool booking has sample scope items, paid deposit + final invoices, two daily logs, and a homeowner note — so when you open `/pro/bookings/[id]` on that project you see the new UI populated.

## What's in the repo but not yet deployable via this session
- `supabase/migrations/00013_ultimate_upgrade.sql` + `00014_geo_checkin_tier_rpc.sql` are committed for replay on any fresh Supabase env. Production DB has already had them applied via Supabase MCP.

## Sources this was synthesized from (inventories in `/tmp/`)
- `inventory-commandpro-v2.md` — portal tokens, daily logs, activity logs, dual signatures
- `inventory-matflow.md` — geofence check-in, tier/belt progression, digital waivers
- `inventory-cabinetshop.md` — multi-stage pipeline, job numbers, scope items, milestone invoicing
- `inventory-homeschool.md` — adaptive summaries, "view as" impersonation, accessibility

## Phase 2 (next session)

Remaining features from the combined inventory, documented in `CURB_REVAMP_PLAN.md`:

1. **Waiver editor + signing page** — tables live, UI not yet built.
2. **Email campaign platform for pros** — send updates to past clients with open / click tracking (Resend integration).
3. **Recurring bookings** — `recurrence_rule` column is in place; UI for "every 2 weeks" and parent/child booking linking not yet wired.
4. **Admin "View As"** — admin impersonates a pro or client for support / debugging.
5. **AI job recap** — Anthropic Claude summarizes a completed job for the homeowner email.
6. **Proposal → Contract → Signature** — first-class documents with PDF snapshots, Resend tracking, dual signatures.
7. **Pro CRM leads** pipeline with weighted scoring.
8. **Accessibility settings** — font / contrast / speech synthesis.
9. **Multi-member households** — one client account can add spouse, renter, property manager.
10. **Push notifications** (OneSignal) with stage change triggers.

## How to run Phase 2
Open `CURB_REVAMP_PLAN.md`, scroll to Phase 2, pick a feature. The pattern is now clear: new table → RLS policy → `queries/workspace.ts` helper → `api/bookings/[id]/.../route.ts` → client component → wire into existing detail page and public portal.
