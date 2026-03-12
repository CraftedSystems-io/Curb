-- Real-time messaging between clients and contractors
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id),
  content         TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_booking ON messages (booking_id, created_at);
CREATE INDEX idx_messages_sender ON messages (sender_id);
CREATE INDEX idx_messages_unread ON messages (sender_id, is_read) WHERE is_read = false;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can only see messages from their own bookings
CREATE POLICY "messages_select" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.id = booking_id
    AND (b.client_id = auth.uid() OR EXISTS (
      SELECT 1 FROM contractors c WHERE c.id = b.contractor_id AND c.profile_id = auth.uid()
    ))
  )
);

CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.id = booking_id
    AND (b.client_id = auth.uid() OR EXISTS (
      SELECT 1 FROM contractors c WHERE c.id = b.contractor_id AND c.profile_id = auth.uid()
    ))
  )
);

-- Notifications table
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL, -- 'booking_update', 'new_message', 'new_review', 'new_booking'
  title           TEXT NOT NULL,
  body            TEXT,
  link            TEXT,
  is_read         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications (user_id, is_read) WHERE is_read = false;

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);

-- Favorites table
CREATE TABLE favorites (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contractor_id   UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, contractor_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_select" ON favorites FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "favorites_insert" ON favorites FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "favorites_delete" ON favorites FOR DELETE USING (auth.uid() = client_id);

-- Contractor portfolio photos
CREATE TABLE portfolio_photos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id   UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  caption         TEXT,
  category        service_category,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portfolio_select" ON portfolio_photos FOR SELECT USING (true);
CREATE POLICY "portfolio_manage" ON portfolio_photos FOR ALL USING (
  auth.uid() = (SELECT profile_id FROM contractors WHERE id = contractor_id)
);

-- Add response_time_hours and jobs_completed to contractors
ALTER TABLE contractors ADD COLUMN response_time_hours DECIMAL(4,1) DEFAULT NULL;
ALTER TABLE contractors ADD COLUMN jobs_completed INTEGER DEFAULT 0;
ALTER TABLE contractors ADD COLUMN total_revenue DECIMAL(12,2) DEFAULT 0;

-- Function to auto-create notification on booking status change
CREATE OR REPLACE FUNCTION notify_booking_update()
RETURNS TRIGGER AS $$
DECLARE
  v_client_name TEXT;
  v_contractor_name TEXT;
  v_service_name TEXT;
BEGIN
  SELECT full_name INTO v_client_name FROM profiles WHERE id = NEW.client_id;
  SELECT p.full_name INTO v_contractor_name
    FROM contractors c JOIN profiles p ON p.id = c.profile_id
    WHERE c.id = NEW.contractor_id;
  SELECT name INTO v_service_name FROM services WHERE id = NEW.service_id;

  -- Notify client
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      NEW.client_id,
      'booking_update',
      'Booking ' || NEW.status,
      v_contractor_name || ' ' || NEW.status || ' your ' || v_service_name || ' booking',
      '/dashboard/bookings/' || NEW.id
    );

    -- Notify contractor
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      (SELECT profile_id FROM contractors WHERE id = NEW.contractor_id),
      'booking_update',
      'Booking ' || NEW.status,
      v_client_name || '''s ' || v_service_name || ' booking is now ' || NEW.status,
      '/pro/bookings/' || NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_booking_status_change
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW EXECUTE FUNCTION notify_booking_update();

-- Notify contractor on new booking
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
DECLARE
  v_client_name TEXT;
  v_service_name TEXT;
BEGIN
  SELECT full_name INTO v_client_name FROM profiles WHERE id = NEW.client_id;
  SELECT name INTO v_service_name FROM services WHERE id = NEW.service_id;

  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (
    (SELECT profile_id FROM contractors WHERE id = NEW.contractor_id),
    'new_booking',
    'New booking request',
    v_client_name || ' wants to book ' || v_service_name,
    '/pro/bookings/' || NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_booking
  AFTER INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION notify_new_booking();
