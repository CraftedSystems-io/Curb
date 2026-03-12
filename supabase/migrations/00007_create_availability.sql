CREATE TABLE availability (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id   UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  day_of_week     INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  is_available    BOOLEAN DEFAULT true,
  UNIQUE(contractor_id, day_of_week)
);
