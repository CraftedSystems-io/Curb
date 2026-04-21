-- ============================================================
-- 00013 — Ultimate Upgrade (Phase 1)
-- Additive migration. Nothing existing is dropped or altered
-- in a breaking way. Every new column on existing tables is
-- nullable or has a default so current rows keep working.
-- ============================================================

-- Ensure 'admin' value exists in user_role enum
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
EXCEPTION WHEN others THEN NULL; END $$;

-- ──────────────────────────────────────────────────────────
-- 1. JOB NUMBERS on bookings
-- ──────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS booking_job_number_seq START 1000;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS job_number TEXT UNIQUE;

CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.job_number IS NULL THEN
    NEW.job_number := 'JOB-' || LPAD(nextval('booking_job_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bookings_job_number ON bookings;
CREATE TRIGGER trg_bookings_job_number
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION generate_job_number();

-- Backfill existing rows
UPDATE bookings
  SET job_number = 'JOB-' || LPAD(nextval('booking_job_number_seq')::text, 5, '0')
  WHERE job_number IS NULL;

-- ──────────────────────────────────────────────────────────
-- 2. EXPANDED PIPELINE — add new stage column (keeps old status)
-- ──────────────────────────────────────────────────────────
-- We keep the existing `status` enum untouched for backwards compatibility
-- and add a richer `stage` column that represents the full pipeline.
DO $$ BEGIN
  CREATE TYPE booking_stage AS ENUM (
    'inquiry',        -- client asked, not yet quoted
    'quoted',         -- pro sent a quote
    'accepted',       -- client accepted the quote
    'deposit_paid',   -- deposit/first milestone paid
    'scheduled',      -- on the calendar
    'on_site',        -- pro checked in / in progress
    'punch_list',     -- wrapping up, final items
    'completed',      -- done
    'cancelled',
    'declined'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS stage booking_stage;

-- Map existing status → stage for back-compat
UPDATE bookings SET stage = CASE status
  WHEN 'pending'     THEN 'inquiry'::booking_stage
  WHEN 'accepted'    THEN 'accepted'::booking_stage
  WHEN 'declined'    THEN 'declined'::booking_stage
  WHEN 'in_progress' THEN 'on_site'::booking_stage
  WHEN 'completed'   THEN 'completed'::booking_stage
  WHEN 'cancelled'   THEN 'cancelled'::booking_stage
END
WHERE stage IS NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_stage ON bookings (stage);

-- Add recurring booking support
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS recurrence_rule TEXT,      -- RFC5545 RRULE
  ADD COLUMN IF NOT EXISTS parent_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS appointment_type TEXT;     -- measure|delivery|install|service|punch

CREATE INDEX IF NOT EXISTS idx_bookings_parent ON bookings (parent_booking_id);

-- ──────────────────────────────────────────────────────────
-- 3. ACTIVITY TIMELINE — booking_events
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id   UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  actor_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_role   TEXT,                           -- client | contractor | admin | system
  event_type   TEXT NOT NULL,                  -- stage_change | message | photo | checkin | invoice | scope_change | note | signature
  title        TEXT NOT NULL,
  body         TEXT,
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_events_booking ON booking_events (booking_id, created_at DESC);

ALTER TABLE booking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can read booking events"
  ON booking_events FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE
        client_id = auth.uid()
        OR contractor_id IN (SELECT id FROM contractors WHERE profile_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Parties can insert booking events"
  ON booking_events FOR INSERT
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE
        client_id = auth.uid()
        OR contractor_id IN (SELECT id FROM contractors WHERE profile_id = auth.uid())
    )
  );

-- Auto-log stage changes
CREATE OR REPLACE FUNCTION log_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.stage IS DISTINCT FROM NEW.stage) THEN
    INSERT INTO booking_events (booking_id, actor_id, actor_role, event_type, title, metadata)
    VALUES (
      NEW.id,
      auth.uid(),
      'system',
      'stage_change',
      'Stage changed to ' || COALESCE(NEW.stage::text, 'null'),
      jsonb_build_object('from', OLD.stage, 'to', NEW.stage)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_bookings_log_stage ON bookings;
CREATE TRIGGER trg_bookings_log_stage
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION log_stage_change();

-- ──────────────────────────────────────────────────────────
-- 4. SCOPE OF WORK line items — booking_scope_items
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_scope_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  quantity        DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit            TEXT NOT NULL DEFAULT 'ea',       -- ea|hr|sqft|lf|lump
  unit_price      DECIMAL(10,2) NOT NULL DEFAULT 0,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_optional     BOOLEAN NOT NULL DEFAULT false,
  is_change_order BOOLEAN NOT NULL DEFAULT false,   -- added after original scope
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scope_items_booking ON booking_scope_items (booking_id, sort_order);

ALTER TABLE booking_scope_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can view scope items"
  ON booking_scope_items FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE
        client_id = auth.uid()
        OR contractor_id IN (SELECT id FROM contractors WHERE profile_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Contractor can manage scope items"
  ON booking_scope_items FOR ALL
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE contractor_id IN
        (SELECT id FROM contractors WHERE profile_id = auth.uid())
    )
  )
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE contractor_id IN
        (SELECT id FROM contractors WHERE profile_id = auth.uid())
    )
  );

-- ──────────────────────────────────────────────────────────
-- 5. MILESTONE INVOICES — booking_invoices
-- ──────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE invoice_kind AS ENUM ('deposit', 'progress', 'final', 'change_order');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'void');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS booking_invoices (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id   UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  kind         invoice_kind NOT NULL,
  status       invoice_status NOT NULL DEFAULT 'draft',
  amount       DECIMAL(10,2) NOT NULL,
  notes        TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  due_date     DATE,
  sent_at      TIMESTAMPTZ,
  paid_at      TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_booking ON booking_invoices (booking_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON booking_invoices (status);

ALTER TABLE booking_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can view invoices"
  ON booking_invoices FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE
        client_id = auth.uid()
        OR contractor_id IN (SELECT id FROM contractors WHERE profile_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Contractor can manage invoices"
  ON booking_invoices FOR ALL
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE contractor_id IN
        (SELECT id FROM contractors WHERE profile_id = auth.uid())
    )
  )
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE contractor_id IN
        (SELECT id FROM contractors WHERE profile_id = auth.uid())
    )
  );

-- ──────────────────────────────────────────────────────────
-- 6. BEFORE/AFTER PHOTOS per booking — booking_photos
-- ──────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE photo_phase AS ENUM ('before', 'during', 'after', 'issue');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS booking_photos (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id     UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  uploader_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  url            TEXT NOT NULL,
  caption        TEXT,
  phase          photo_phase NOT NULL DEFAULT 'during',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  location       geography(POINT, 4326),
  taken_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_photos_booking ON booking_photos (booking_id, phase, sort_order);

ALTER TABLE booking_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can view booking photos"
  ON booking_photos FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE
        client_id = auth.uid()
        OR contractor_id IN (SELECT id FROM contractors WHERE profile_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Parties can upload booking photos"
  ON booking_photos FOR INSERT
  WITH CHECK (
    uploader_id = auth.uid()
    AND booking_id IN (
      SELECT id FROM bookings WHERE
        client_id = auth.uid()
        OR contractor_id IN (SELECT id FROM contractors WHERE profile_id = auth.uid())
    )
  );

-- ──────────────────────────────────────────────────────────
-- 7. DAILY FIELD LOGS — daily_logs
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id       UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  contractor_id    UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  log_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  hours_worked     DECIMAL(5,2),
  crew_count       INTEGER,
  weather          TEXT,
  percent_complete INTEGER CHECK (percent_complete BETWEEN 0 AND 100),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (booking_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_booking ON daily_logs (booking_id, log_date DESC);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can view daily logs"
  ON daily_logs FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE
        client_id = auth.uid()
        OR contractor_id IN (SELECT id FROM contractors WHERE profile_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Contractor can manage daily logs"
  ON daily_logs FOR ALL
  USING (
    contractor_id IN (SELECT id FROM contractors WHERE profile_id = auth.uid())
  )
  WITH CHECK (
    contractor_id IN (SELECT id FROM contractors WHERE profile_id = auth.uid())
  );

-- ──────────────────────────────────────────────────────────
-- 8. CLIENT PORTAL SHARE TOKENS — booking_share_tokens
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_share_tokens (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id   UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  token        TEXT NOT NULL UNIQUE,
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  expires_at   TIMESTAMPTZ,
  revoked_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_viewed_at TIMESTAMPTZ,
  view_count   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_share_tokens_booking ON booking_share_tokens (booking_id);
CREATE INDEX IF NOT EXISTS idx_share_tokens_token ON booking_share_tokens (token);

ALTER TABLE booking_share_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties manage share tokens"
  ON booking_share_tokens FOR ALL
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE
        client_id = auth.uid()
        OR contractor_id IN (SELECT id FROM contractors WHERE profile_id = auth.uid())
    )
  )
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE
        client_id = auth.uid()
        OR contractor_id IN (SELECT id FROM contractors WHERE profile_id = auth.uid())
    )
  );

-- ──────────────────────────────────────────────────────────
-- 9. PRO TIER / BADGE on contractors
-- ──────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE pro_tier AS ENUM ('new', 'bronze', 'silver', 'gold', 'platinum');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE contractors
  ADD COLUMN IF NOT EXISTS tier pro_tier NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS tier_updated_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION recalc_contractor_tier(c_id UUID)
RETURNS pro_tier AS $$
DECLARE
  jobs_done INTEGER;
  rating    DECIMAL;
  tenure_d  INTEGER;
  new_tier  pro_tier;
BEGIN
  SELECT COUNT(*) INTO jobs_done
    FROM bookings WHERE contractor_id = c_id AND status = 'completed';
  SELECT COALESCE(rating_avg, 0), EXTRACT(DAY FROM now() - created_at)::int
    INTO rating, tenure_d
    FROM contractors WHERE id = c_id;

  IF jobs_done >= 100 AND rating >= 4.8 THEN
    new_tier := 'platinum';
  ELSIF jobs_done >= 50 AND rating >= 4.7 THEN
    new_tier := 'gold';
  ELSIF jobs_done >= 20 AND rating >= 4.5 THEN
    new_tier := 'silver';
  ELSIF jobs_done >= 5 THEN
    new_tier := 'bronze';
  ELSE
    new_tier := 'new';
  END IF;

  UPDATE contractors
    SET tier = new_tier, tier_updated_at = now()
    WHERE id = c_id AND (tier IS DISTINCT FROM new_tier);

  RETURN new_tier;
END;
$$ LANGUAGE plpgsql;

-- ──────────────────────────────────────────────────────────
-- 10. GEOFENCE CHECK-IN — booking_checkins
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_checkins (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id     UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  contractor_id  UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  kind           TEXT NOT NULL DEFAULT 'arrival',   -- arrival|departure|break
  location       geography(POINT, 4326),
  accuracy_m     INTEGER,
  distance_from_job_m INTEGER,
  is_within_geofence BOOLEAN,
  note           TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checkins_booking ON booking_checkins (booking_id, created_at DESC);

ALTER TABLE booking_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can view checkins"
  ON booking_checkins FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE
        client_id = auth.uid()
        OR contractor_id IN (SELECT id FROM contractors WHERE profile_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Contractor creates checkins"
  ON booking_checkins FOR INSERT
  WITH CHECK (
    contractor_id IN (SELECT id FROM contractors WHERE profile_id = auth.uid())
  );

-- ──────────────────────────────────────────────────────────
-- 11. WAIVERS — waiver_templates + waiver_signatures
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS waiver_templates (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id  UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  body           TEXT NOT NULL,
  version        INTEGER NOT NULL DEFAULT 1,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waivers_contractor ON waiver_templates (contractor_id);

ALTER TABLE waiver_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active waivers"
  ON waiver_templates FOR SELECT USING (is_active = true);

CREATE POLICY "Contractor manage own waivers"
  ON waiver_templates FOR ALL
  USING (contractor_id IN (SELECT id FROM contractors WHERE profile_id = auth.uid()))
  WITH CHECK (contractor_id IN (SELECT id FROM contractors WHERE profile_id = auth.uid()));

CREATE TABLE IF NOT EXISTS waiver_signatures (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id  UUID NOT NULL REFERENCES waiver_templates(id) ON DELETE CASCADE,
  signer_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  booking_id   UUID REFERENCES bookings(id) ON DELETE SET NULL,
  signer_name  TEXT NOT NULL,
  signer_email TEXT,
  signature_svg TEXT NOT NULL,
  ip_address   TEXT,
  user_agent   TEXT,
  template_snapshot TEXT NOT NULL,   -- copy of template body at time of signing
  signed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waiver_sig_template ON waiver_signatures (template_id);
CREATE INDEX IF NOT EXISTS idx_waiver_sig_booking ON waiver_signatures (booking_id);
CREATE INDEX IF NOT EXISTS idx_waiver_sig_signer ON waiver_signatures (signer_id);

ALTER TABLE waiver_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties view their signatures"
  ON waiver_signatures FOR SELECT
  USING (
    signer_id = auth.uid()
    OR template_id IN (
      SELECT id FROM waiver_templates WHERE contractor_id IN
        (SELECT id FROM contractors WHERE profile_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can sign a waiver"
  ON waiver_signatures FOR INSERT
  WITH CHECK (true);

-- ──────────────────────────────────────────────────────────
-- 12. Realtime — publish new tables
-- ──────────────────────────────────────────────────────────
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE booking_events;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE booking_photos;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE daily_logs;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE booking_checkins;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
