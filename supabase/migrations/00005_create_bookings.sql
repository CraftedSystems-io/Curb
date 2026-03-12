CREATE TYPE booking_status AS ENUM (
  'pending',
  'accepted',
  'declined',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TABLE bookings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id         UUID NOT NULL REFERENCES profiles(id),
  contractor_id     UUID NOT NULL REFERENCES contractors(id),
  service_id        UUID NOT NULL REFERENCES services(id),
  status            booking_status NOT NULL DEFAULT 'pending',
  scheduled_date    DATE NOT NULL,
  scheduled_time    TIME,
  duration_hours    DECIMAL(4,1),
  address           TEXT NOT NULL,
  location          geography(POINT, 4326),
  notes             TEXT,
  quoted_price      DECIMAL(10,2),
  final_price       DECIMAL(10,2),
  status_updated_at TIMESTAMPTZ DEFAULT now(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_client ON bookings (client_id);
CREATE INDEX idx_bookings_contractor ON bookings (contractor_id);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_date ON bookings (scheduled_date);

-- Enable realtime for booking status changes
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
