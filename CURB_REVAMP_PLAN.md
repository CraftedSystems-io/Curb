# Curb — Ultimate Revamp Plan

Version 1.0 — synthesized from Command PRO v2, MatFlow, CabinetShop.io, and Crafted Homeschool.

## Principles

1. **Additive only.** Every existing feature stays. This plan never removes; it evolves.
2. **One coherent slice at a time.** Schema + API + UI ship together per feature, not scattered.
3. **Self-test with sample data.** Every feature is exercised before push.
4. **Platform over artifacts.** Every feature lives in the app, not in conversation.

## Current Curb baseline

- Next.js 16, React 19, Tailwind 4, Supabase (Postgres + PostGIS + RLS + Realtime), Stripe billing, Google Maps, PWA.
- Three roles: `client`, `contractor`, `admin`. Three service categories: pool / landscaping / maid.
- Core tables: `profiles`, `contractors`, `services`, `contractor_services`, `bookings`, `reviews`, `availability`, `portfolio_photos`, `favorites`, `messages`, `device_tokens`, `notifications`, `teams`.
- Contractor dashboard with KPIs, analytics page, client dashboard, explore map, chat panel, notification bell.
- Subscription tiers: Starter $29 / Pro $59 / Max $99, 14-day trial.

## Combined feature inventory — what's coming from where

### From Command PRO v2
- Immutable PDF hard copies with versioning and email tracking
- Dual signature capture (pro + homeowner)
- Public client portal via token-based access (no login)
- Change Order system with auto-generated CO numbers
- Daily field logs (photos, crew, hours, weather, % complete)
- Multi-level permissions with "View As" preview
- Weighted lead scoring on a CRM pipeline

### From MatFlow
- Geofence check-in (GPS proximity + optional QR)
- Belt/stripe progression → pro tier badges
- Activity audit log (every state change timestamped with actor)
- Multi-location providers
- Built-in email campaigns with open/click tracking
- Digital waivers with signature snapshot
- Personal goal tracking
- Lead/CRM with bulk import

### From CabinetShop.io
- Multi-stage production pipeline (Quote → Approved → Materials → Production → Delivery → Install → Punch List → Complete)
- Job number system (JOB-00001 format)
- Bill of Materials / cut lists → Scope of Work line items
- Typed appointments (Measure / Delivery / Install / Punch List)
- Milestone payments (deposit → progress → final)
- Role-based workspace access (multi-role per project)
- Email campaign platform with unsubscribe compliance

### From Crafted Homeschool
- AI-generated daily recap summaries
- Daily log + mood/condition tracking
- "View As" parent impersonation → admin impersonation
- Adaptive difficulty (Review / Reinforce / Advance) → adaptive pro recommendations
- Accessibility-first UX (dyslexia-friendly fonts, speech synthesis)
- Co-op/multi-family group collaboration → multi-member household accounts

## Revamp phases

### Phase 1 — Project Pipeline (this session)

Transforms a booking from a single status into a true multi-stage project with timeline, milestones, and documentation. Non-breaking: every existing `bookings` row keeps working.

1. **Job numbers** — every booking gets an auto-generated `JOB-00001` reference.
2. **Expanded pipeline** — new stages: `quoted`, `deposit_paid`, `scheduled`, `on_site`, `punch_list`, alongside existing statuses.
3. **Activity timeline** — `booking_events` table capturing every state change, message, photo, check-in with actor + timestamp.
4. **Scope of Work line items** — `booking_scope_items` table, itemized work with qty × price.
5. **Milestone invoices** — `booking_invoices` with deposit / progress / final; paid tracking.
6. **Before / after photos** — `booking_photos` table, tagged by phase (before, during, after).
7. **Daily field logs** — `daily_logs` per booking per day with photos, hours, % complete, weather, notes.
8. **Client portal share token** — `booking_share_tokens` gives the homeowner a public read-only link.
9. **Pro tier badge** — auto-calculated Bronze / Silver / Gold / Platinum from rating + job count + tenure.
10. **Geofence check-in** — `booking_checkins` logs pro arrival with GPS.
11. **Waivers** — `waiver_templates` + `waiver_signatures` for services that need liability sign-off.
12. **Recurring bookings** — add `recurrence_rule` (RFC 5545 RRULE) + `parent_booking_id`.

### Phase 2 — Documents & Signatures (next session)

- Estimates → Proposals → Contracts as first-class documents (not just `quoted_price`).
- Dual signature capture with PDF snapshot to Vercel Blob.
- Email tracking (Resend webhooks: opens, clicks, bounces).
- Change Orders with auto-numbering.

### Phase 3 — Growth & Engagement

- Email campaigns platform for pros (send to their past clients, open/click tracking).
- Pro CRM leads pipeline with weighted scoring.
- Multi-location providers.
- Admin impersonation ("View As" any pro or client).
- AI job recap summaries via Anthropic Claude.

### Phase 4 — Breadth

- Accessibility settings (font, contrast, speech).
- Multi-member household accounts.
- Goal tracking and streaks for both sides.
- Service categories beyond pool/lawn/maid (handyman, painting, pressure wash, etc.) — data model is already category-driven, so this is just new rows in `services`.

## Data model additions (Phase 1)

All additive. Every new table FK-references existing tables. All new columns on existing tables are nullable or defaulted so existing rows are unaffected. See `supabase/migrations/00013_ultimate_upgrade.sql` for authoritative SQL.
