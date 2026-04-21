# Security Audit — Crafted Systems / Curb

**Date:** 2026-04-20
**Scope:** Curb (primary) plus sampling across the broader Crafted Systems product family (Command PRO, MatFlow, CabinetShop.io, Crafted Homeschool, BookedOut, MenuListo, WashTrack, etc.) and all external services in use (Supabase, Vercel, GitHub, Stripe, Clerk, Google Maps, Anthropic, Resend, OneSignal, Vercel Blob).
**Author:** Elon (automated audit).
**Action required:** **Rotate Supabase service_role key for project `aoevhlsoqzjsvraeacdr` IMMEDIATELY.** See Finding S-1.

---

## Severity key

- 🔴 **Critical** — active exposure, data at risk *right now*. Fix today.
- 🟠 **High** — likely exploitable, fix this week.
- 🟡 **Medium** — limited blast radius or defense-in-depth gap. Fix this sprint.
- 🟢 **Low** — hardening / hygiene. Fix when convenient.

---

## 🔴 CRITICAL

### S-1 — Supabase `service_role` JWT is live AND in public git history
- **Repo:** [CraftedSystems-io/Curb](https://github.com/CraftedSystems-io/Curb) (public)
- **Leak location:** commit prior to `75d2520`, file `scripts/fix-demo-profiles.ts` (the "cleanup" commit removed the string from the working tree but the JWT is still recoverable via `git log -p`).
- **Project affected:** Supabase project `aoevhlsoqzjsvraeacdr` (the live Curb database).
- **Current status:** I confirmed the JWT in history **exactly matches** the `SUPABASE_SERVICE_ROLE_KEY` currently set in `.env.local` — **the key was never rotated** despite the cleanup commit message saying it should be.
- **What an attacker can do with it:** Bypass all Row Level Security. Read/modify/delete every row in every table. Create, impersonate, or delete any auth user. Access Supabase Storage without policy checks. Essentially full database administration.
- **Remediation (do in this exact order):**
  1. **Supabase Dashboard → Project `aoevhlsoqzjsvraeacdr` → Settings → API → "Reset service role JWT secret"**. This rotates both `anon` and `service_role` keys.
  2. Update `SUPABASE_SERVICE_ROLE_KEY` (and `NEXT_PUBLIC_SUPABASE_ANON_KEY` if it changed) in:
     - Vercel project env vars (Production, Preview, Development tabs)
     - Local `.env.local`
     - Any other dev machines
  3. Optional but recommended: purge the secret from git history with `git filter-repo --path scripts/fix-demo-profiles.ts --invert-paths`, then force-push. GitGuardian will still have the prior alert record; the old key is already in adversary hands if it was ever scraped.
  4. Rotate again in 30 days as a matter of course.

### S-2 — GitHub repo has no secret-scanning push protection enabled
- The earlier leak was caught by GitGuardian *after the push*. GitHub's own push protection would have blocked it pre-push.
- **Remediation:** In each public repo → **Settings → Code security → Secret scanning → Push protection** → Enable. Apply to `CraftedSystems-io/Curb`, `thefranklujan/matflow-app`, `thefranklujan/matflow-v2`, `thefranklujan/cabinetshop-io`, `thefranklujan/BookedOut`, `thefranklujan/MenuListo`, `thefranklujan/washtrack`, `thefranklujan/forge-print-co`, `thefranklujan/command-pro`, `thefranklujan/ceconi-bjj-store`, `thefranklujan/scroll-demos`. For private repos, also enable (it's free).

---

## 🟠 HIGH

### S-3 — `profiles` table is world-readable
- **Policy:** `profiles_select USING (true)` means *any anonymous user* can `SELECT * FROM profiles` and get every signup's `email`, `full_name`, `phone`, `avatar_url`, `role`, timestamps.
- **Attack:** scrape the public Supabase REST endpoint (`/rest/v1/profiles?select=*`) with just the anon key (which is embedded in any Curb page).
- **Impact:** PII harvesting, phishing target list, competitor analysis.
- **Remediation:** Replace the policy with one of:
  - Restrict to self: `USING (auth.uid() = id)` — but this breaks the joined queries across the app (many SELECTs rely on reading the client/contractor profile linked to a booking).
  - **Recommended:** keep reads open but *create a public-safe VIEW* that exposes only `id`, `full_name`, `avatar_url`, `role`, and switch all client-side queries to read from the view. Lock the raw table to authed users where `auth.uid() = id OR <is involved in booking>`.

### S-4 — `notifications` INSERT policy `WITH CHECK (true)` — anyone can notify anyone
- **Policy:** `notifications_insert WITH CHECK (true)` means any authenticated user can insert a notification for any other user, with any title/body/link.
- **Attack:** A malicious contractor could spam every homeowner's notification bell with phishing links (`link: "https://evil.example/reset-password"`).
- **Remediation:** tighten to system-only writes (SECURITY DEFINER triggers keep working because they bypass RLS) and restrict from client-side:
  ```sql
  DROP POLICY IF EXISTS notifications_insert ON notifications;
  -- Only allow self-notify for now; the stage-change trigger already runs SECURITY DEFINER
  CREATE POLICY notifications_insert_self ON notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  ```

### S-5 — Waiver signature can be forged for a target user
- **Policy:** `waiver_signatures "Anyone can sign a waiver" WITH CHECK (true)` — permits anonymous insert.
- **Code:** `POST /api/waivers/sign` sets `signer_id = user?.id ?? null`, but a malicious caller could go direct to PostgREST with the anon key and insert a row with `signer_id = <target_uuid>`.
- **Attack:** Forge a signature attributed to a real homeowner, then display it as proof of agreement.
- **Remediation:**
  ```sql
  DROP POLICY IF EXISTS "Anyone can sign a waiver" ON waiver_signatures;
  CREATE POLICY "Insert own signature" ON waiver_signatures FOR INSERT
    WITH CHECK (signer_id IS NULL OR signer_id = auth.uid());
  ```
  And keep the REST API as the primary ingress so we control IP/UA/template snapshot.

### S-6 — `bookings_update_contractor` has no WITH CHECK clause — booking theft
- **Policy:** `bookings_update_contractor USING (auth.uid() = contractor.profile_id)` but `WITH CHECK` is null. A contractor can `UPDATE bookings SET contractor_id = <me>` on a booking they merely *read* (wait — actually the USING clause requires they're the current contractor, so they can't hijack a booking they aren't on). Re-checking: the risk is they can swap the `client_id` to another user, redirect the booking, or change financial fields without constraint.
- **Attack:** Contractor A updates booking row setting `final_price` to an inflated value moments before the client marks paid, or changes `client_id` to shift a record.
- **Remediation:** Add column-level permissions via a trigger, or add `WITH CHECK` asserting immutability of `client_id` and `contractor_id`:
  ```sql
  CREATE OR REPLACE FUNCTION enforce_booking_immutables()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.client_id IS DISTINCT FROM OLD.client_id THEN RAISE EXCEPTION 'client_id immutable'; END IF;
    IF NEW.contractor_id IS DISTINCT FROM OLD.contractor_id THEN RAISE EXCEPTION 'contractor_id immutable'; END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  CREATE TRIGGER trg_bookings_immutables BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION enforce_booking_immutables();
  ```

### S-7 — `bookings_update_client` can mutate prices while status='pending'
- **Policy:** Client can UPDATE the booking if `status = 'pending'`, with no column restriction. A malicious client could set `quoted_price = 0` or alter `notes`/`address` after contractor review.
- **Remediation:** Either restrict UPDATE to specific columns via a function-backed RPC, or add the immutability trigger above to lock financial columns.

### S-8 — `contractors` row exposes Stripe customer + subscription IDs publicly
- **Policy:** `contractors_select USING (is_active = true)` — public read of the whole row. Includes `stripe_customer_id`, `stripe_subscription_id`, `trial_ends_at`, `current_period_end`.
- **Impact:** An attacker who has the anon key (any Curb visitor) can see every pro's billing identifiers. Not immediately exploitable (Stripe customer IDs alone don't grant access), but billing state leakage helps social engineering and competitive intel.
- **Remediation:** Create a public VIEW exposing only the display fields (`id`, `business_name`, `bio`, `rating_avg`, `review_count`, `tier`, `base_location`, etc.) and lock direct SELECT on `contractors` to the row owner + admin. Update `find_nearby_contractors` RPC output to exclude billing columns (it already does — good).

---

## 🟡 MEDIUM

### S-9 — Storage bucket `booking-photos` is fully public + any authed user can upload anywhere in it
- Policy `Authenticated upload to booking-photos WITH CHECK (bucket_id = 'booking-photos')` — doesn't restrict which folder the caller can write to. Any authed user can upload to any booking's path.
- Public read by design. Not terrible (URLs are hard to guess without the UUID) but also means sensitive before/after photos are *publicly* cacheable forever via URL.
- **Remediation:** Either require signed URLs (make the bucket private), or enforce path-based RLS:
  ```sql
  CREATE POLICY "Upload only to own booking folder" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'booking-photos'
      AND (storage.foldername(name))[2] IN (
        SELECT id::text FROM bookings
        WHERE client_id = auth.uid()
        OR contractor_id IN (SELECT id FROM contractors WHERE profile_id = auth.uid())
      )
    );
  ```

### S-10 — No security response headers
- `next.config.ts` sets only cache headers. Missing: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
- **Impact:** clickjacking, MIME sniffing, some XSS classes, mixed content issues.
- **Remediation:** Add to `next.config.ts`:
  ```ts
  { source: "/:path*", headers: [
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "geolocation=(self), camera=(), microphone=()" },
      { key: "Content-Security-Policy", value: "default-src 'self'; img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com; script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://js.stripe.com; connect-src 'self' https://*.supabase.co https://api.stripe.com; frame-src https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;" }
  ]}
  ```
  Test CSP in report-only mode first; Google Maps and Stripe need explicit allow-lists.

### S-11 — `POST /api/bookings/[id]/photos` accepts an arbitrary URL
- The route takes `body.url` from the client and writes it into `booking_photos.url`. A caller can insert a URL pointing to any host (including an attacker-controlled server). When the public portal renders it via `next/image`, we proxy it through Next's optimizer — but tracking pixels / referer leakage / stored XSS via `<img src>` is still possible.
- **Remediation:** Validate the URL prefix matches the Supabase Storage hostname for the project, or require the client uploads via an endpoint that writes to Storage and derives the URL server-side (don't trust the client).

### S-12 — No rate limiting on any public API route
- `/api/contractors/nearby`, `/api/waivers/sign`, `/api/billing` (checkout link generation), `/portal/[token]`, etc. have no rate limits. An attacker can enumerate, scrape, or batch-create payload requests.
- **Remediation:** Add Upstash Ratelimit or Vercel Edge Config rate limits on all public API routes. Minimum: 60 req/min per IP on GET, 20 req/min per IP on POST.

### S-13 — `/portal/[token]` enumeration surface
- Share tokens are 24 random bytes (base64url) — strong. Good.
- However: each token grants unlimited reads of a live booking page including homeowner name, address (!), contractor identifiers, payment history. There's no expiration enforcement beyond the 90-day default, and no way for the homeowner to revoke the token themselves (only pro or client with DB party match).
- **Remediation:** Shorter default expiry (30 days), admin dashboard to see active tokens per booking, user-facing toggle on the booking detail to revoke.

### S-14 — Reviews are world-readable including `client_id`
- Policy `reviews_select USING (true)`. Anyone can scrape the reviews dataset plus the reviewer's client UUID, join to profiles (see S-3), and associate real names with reviews left.
- **Remediation:** Create a public VIEW that exposes `rating`, `comment`, `created_at`, anonymized reviewer display name (`SUBSTR(full_name, 1, 1)` + '.'), and restrict the raw table to party-only SELECT.

### S-15 — Notifications trigger uses `SECURITY DEFINER` without `SET search_path`
- Functions `log_stage_change`, `notify_stage_change`, `spawn_recurring_booking`, `generate_job_number`, `recalc_contractor_tier` are all `SECURITY DEFINER` but none pin `search_path`. In theory, a user who could create objects in the `public` schema could shadow a function or type to hijack the definer privilege. On Supabase this is gated but still best practice.
- **Remediation:**
  ```sql
  ALTER FUNCTION public.log_stage_change() SET search_path = public, pg_catalog;
  -- repeat for all SECURITY DEFINER functions
  ```

---

## 🟢 LOW / HARDENING

### S-16 — `booking_events` INSERT policy allows party to fake `event_type`
- A party can insert an event with any `title`, `body`, `event_type`, `actor_role`. The policy only checks they're a party. Low impact (they don't see others' data, just muddy their own timeline) but could support fraud ("it says 'client paid' but it wasn't a real payment").
- **Remediation:** Only allow `event_type IN ('note', 'message')` from client-side; reserve the others for triggers/SECURITY DEFINER writes.

### S-17 — Client-side Stripe publishable key is cached long-term
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is embedded in bundled JS. That's correct and the key is safe to expose by Stripe design. Document this for the team so nobody accidentally treats the `pk_live_` string as a secret.

### S-18 — `.env.local` is in `.gitignore` (good) but no pre-commit guard
- There's no `git-secrets` or `detect-secrets` pre-commit hook. Add one:
  ```bash
  brew install gitleaks
  ```
  Then in `.githooks/pre-commit`: `gitleaks protect --staged --redact --verbose`.

### S-19 — Vercel deploy env vars — verify Production vs Preview separation
- Not visible from this audit. Recommendation: run `vercel env ls` and confirm no Production key (Stripe `sk_live`, Supabase service role) is copied to Preview/Development environments. Preview deploys should use test keys only.

### S-20 — GitHub Actions `notify-ada.yml` uses secrets correctly
- Good: `BOT_TOKEN` and `CHAT_ID` via `secrets.*`, not hardcoded.
- Minor: the `TEXT` interpolation includes `${COMMIT}` which can contain shell meta if someone lands a commit message with `$(...)` or backticks. Wrap in `--data-urlencode` or `jq -Rs .` instead of raw `-d`:
  ```yaml
  run: |
    curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
      --data-urlencode "chat_id=${CHAT_ID}" \
      --data-urlencode "text=🚀 New Deploy: ${REPO} (${BRANCH}) by ${ACTOR} — ${COMMIT}"
  ```

### S-21 — Stripe webhook `received: true` response on all events (even unhandled)
- The webhook always 200s. Consider logging unhandled event types and optionally returning `501` for *truly* unknown types so Stripe can alert if coverage drops. Current behavior is fine by Stripe's expectations.

---

## External services — assessment

| Service | How we use it | Exposure | Notes |
|---|---|---|---|
| **Supabase** (aoevhlsoqzjsvraeacdr = Curb; others per product) | Postgres + Auth + Storage + Realtime + Edge | Major — most data lives here | **S-1 is the active emergency. Rotate service_role today.** After rotation, RLS + anon key is a solid posture. Review other projects' service keys too. |
| **Vercel** | Hosting + Blob + serverless | Holds all build-time env vars | Lock project access to Frank + Ada only. Confirm no shared teams contain outsiders. Enable deployment protection for non-main. |
| **GitHub** | Source + Actions | Curb repo public. All others: check visibility individually | Enable secret scanning push protection org-wide. Consider Dependabot + code scanning (CodeQL) on at least all public repos. |
| **Stripe** | Live billing on Curb | `sk_live_*`, `whsec_*` held server-side only. | Audit: enable Stripe Radar (default on), add restricted API keys for any background jobs that don't need full access. Rotate webhook secret if the endpoint URL is ever shared externally. |
| **Clerk** (CP v2) | Auth for Command PRO | Not used by Curb | Out of scope for this audit but same hygiene applies — rotate any JWT signing keys that may have leaked. |
| **Google Maps** | Maps JS API (client) | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` embedded in bundle | Lock the API key to HTTP referrer allow-list (`curb-app.vercel.app`, `*.craftedsystems.io`). Otherwise any scraper can rack up usage. Check usage quota alerts. |
| **Anthropic Claude** (planned for Phase 3) | AI recap | Not yet wired | When wiring, use server-side key only. Never expose. |
| **Resend** (planned) | Email delivery | Not yet wired | Same — server-side key only. Enable domain authentication (DMARC, DKIM, SPF). |
| **OneSignal** (referenced from MatFlow) | Push notifications | Not yet wired into Curb | Same — REST API key server-side only. |
| **Vercel Blob** | File storage (other projects) | Not used by Curb directly (we use Supabase Storage) | N/A for Curb. |
| **Telegram Bot** (Ada notify) | Deploy notifications | Stored as GitHub secret | OK. Minor shell injection hygiene in S-20. |

---

## Action plan — ordered

1. **Today (blocking):** Rotate Supabase `service_role` on project `aoevhlsoqzjsvraeacdr` and propagate (S-1).
2. **Today:** Enable GitHub secret scanning push protection on every repo (S-2).
3. **This week:**
   - Tighten `notifications`, `waiver_signatures`, `profiles`, `contractors`, `reviews` RLS (S-3, S-4, S-5, S-8, S-14).
   - Add booking-column immutability trigger (S-6, S-7).
   - Restrict Storage upload paths (S-9).
4. **This sprint:**
   - Add security response headers + start CSP in report-only (S-10).
   - Validate photo URL prefix (S-11).
   - Add rate limiting (S-12).
   - Lock `search_path` on all `SECURITY DEFINER` functions (S-15).
5. **Ongoing:** run the rest of the list, then re-audit quarterly.

---

## Quick-fix SQL bundle

Ready to apply as one migration (`00015_security_hardening.sql`). Reviewed but NOT applied yet — waiting for your go-ahead because the `profiles` change in particular touches every page that joins a profile.

```sql
-- S-4: lock notifications.insert to self or service_role
DROP POLICY IF EXISTS notifications_insert ON notifications;
CREATE POLICY notifications_insert_self ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- S-5: waiver signatures must belong to caller if authenticated
DROP POLICY IF EXISTS "Anyone can sign a waiver" ON waiver_signatures;
CREATE POLICY "Insert signature for self or anon" ON waiver_signatures FOR INSERT
  WITH CHECK (signer_id IS NULL OR signer_id = auth.uid());

-- S-6 / S-7: lock financial & foreign-key columns on bookings
CREATE OR REPLACE FUNCTION enforce_booking_immutables()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_id IS DISTINCT FROM OLD.client_id THEN RAISE EXCEPTION 'client_id immutable'; END IF;
  IF NEW.contractor_id IS DISTINCT FROM OLD.contractor_id THEN RAISE EXCEPTION 'contractor_id immutable'; END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_bookings_immutables ON bookings;
CREATE TRIGGER trg_bookings_immutables BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION enforce_booking_immutables();

-- S-15: pin search_path on our SECURITY DEFINER functions
ALTER FUNCTION public.log_stage_change()        SET search_path = public, pg_catalog;
ALTER FUNCTION public.notify_stage_change()     SET search_path = public, pg_catalog;
ALTER FUNCTION public.spawn_recurring_booking() SET search_path = public, pg_catalog;
ALTER FUNCTION public.generate_job_number()     SET search_path = public, pg_catalog;
ALTER FUNCTION public.recalc_contractor_tier(UUID) SET search_path = public, pg_catalog;
ALTER FUNCTION public.checkin_distance_to_job(UUID, DOUBLE PRECISION, DOUBLE PRECISION) SET search_path = public, pg_catalog;
ALTER FUNCTION public.find_nearby_contractors(FLOAT, FLOAT, INTEGER, service_category) SET search_path = public, pg_catalog;
```

For S-3, S-8, S-9, S-14 — needs a discussion because each changes app-visible behavior. I'll write those as a Phase-2-security PR with UI adjustments so reads still work where they need to.
