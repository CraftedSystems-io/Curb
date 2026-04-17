-- Teams under a contractor account. One contractor may have many teams
-- (enforced by subscription_plan.maxTeams at the application layer).
CREATE TABLE teams (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_teams_contractor ON teams (contractor_id);

-- Nullable team_id on bookings so existing rows are unaffected.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_team ON bookings (team_id);

-- RLS: contractors can read/write their own teams; clients cannot see teams.
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors manage their own teams"
  ON teams
  FOR ALL
  USING (
    contractor_id IN (
      SELECT id FROM contractors WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    contractor_id IN (
      SELECT id FROM contractors WHERE profile_id = auth.uid()
    )
  );
