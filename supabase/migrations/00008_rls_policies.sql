-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- CONTRACTORS
CREATE POLICY "contractors_select" ON contractors FOR SELECT USING (is_active = true);
CREATE POLICY "contractors_insert" ON contractors FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "contractors_update" ON contractors FOR UPDATE USING (auth.uid() = profile_id);

-- SERVICES (public catalog)
CREATE POLICY "services_select" ON services FOR SELECT USING (true);

-- CONTRACTOR_SERVICES
CREATE POLICY "contractor_services_select" ON contractor_services FOR SELECT USING (true);
CREATE POLICY "contractor_services_insert" ON contractor_services
  FOR INSERT WITH CHECK (auth.uid() = (SELECT profile_id FROM contractors WHERE id = contractor_id));
CREATE POLICY "contractor_services_delete" ON contractor_services
  FOR DELETE USING (auth.uid() = (SELECT profile_id FROM contractors WHERE id = contractor_id));

-- BOOKINGS
CREATE POLICY "bookings_select_client" ON bookings FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "bookings_select_contractor" ON bookings
  FOR SELECT USING (auth.uid() = (SELECT profile_id FROM contractors WHERE id = contractor_id));
CREATE POLICY "bookings_insert" ON bookings FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "bookings_update_contractor" ON bookings
  FOR UPDATE USING (auth.uid() = (SELECT profile_id FROM contractors WHERE id = contractor_id));
CREATE POLICY "bookings_update_client" ON bookings
  FOR UPDATE USING (auth.uid() = client_id AND status = 'pending');

-- REVIEWS
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = client_id
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
        AND bookings.status = 'completed'
        AND bookings.client_id = auth.uid()
    )
  );

-- AVAILABILITY
CREATE POLICY "availability_select" ON availability FOR SELECT USING (true);
CREATE POLICY "availability_manage" ON availability
  FOR ALL USING (auth.uid() = (SELECT profile_id FROM contractors WHERE id = contractor_id));
