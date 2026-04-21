-- Distance-to-job RPC for check-ins
CREATE OR REPLACE FUNCTION checkin_distance_to_job(p_booking_id UUID, p_lat DOUBLE PRECISION, p_lng DOUBLE PRECISION)
RETURNS DOUBLE PRECISION AS $$
  SELECT ST_Distance(
    location::geography,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
  )
  FROM bookings WHERE id = p_booking_id AND location IS NOT NULL
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Extend find_nearby_contractors to return tier and sort by it first
DROP FUNCTION IF EXISTS find_nearby_contractors(FLOAT, FLOAT, INTEGER, service_category);

CREATE OR REPLACE FUNCTION find_nearby_contractors(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_m INTEGER DEFAULT 40000,
  service_filter service_category DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  profile_id UUID,
  business_name TEXT,
  bio TEXT,
  hourly_rate DECIMAL,
  rating_avg DECIMAL,
  review_count INTEGER,
  base_lat FLOAT,
  base_lng FLOAT,
  distance_m FLOAT,
  full_name TEXT,
  avatar_url TEXT,
  tier pro_tier,
  services JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.profile_id,
    c.business_name,
    c.bio,
    c.hourly_rate,
    c.rating_avg,
    c.review_count,
    ST_Y(c.base_location::geometry) AS base_lat,
    ST_X(c.base_location::geometry) AS base_lng,
    ST_Distance(
      c.base_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) AS distance_m,
    p.full_name,
    p.avatar_url,
    c.tier,
    (
      SELECT jsonb_agg(jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'category', s.category,
        'price', cs.price,
        'price_unit', cs.price_unit
      ))
      FROM contractor_services cs
      JOIN services s ON s.id = cs.service_id
      WHERE cs.contractor_id = c.id
        AND (service_filter IS NULL OR s.category = service_filter)
    ) AS services
  FROM contractors c
  JOIN profiles p ON p.id = c.profile_id
  WHERE c.is_active = true
    AND ST_DWithin(
      c.base_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_m
    )
    AND (
      service_filter IS NULL
      OR EXISTS (
        SELECT 1 FROM contractor_services cs
        JOIN services s ON s.id = cs.service_id
        WHERE cs.contractor_id = c.id AND s.category = service_filter
      )
    )
  ORDER BY c.tier DESC, distance_m ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket for booking photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-photos', 'booking-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated upload to booking-photos" ON storage.objects;
CREATE POLICY "Authenticated upload to booking-photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'booking-photos');

DROP POLICY IF EXISTS "Public read booking-photos" ON storage.objects;
CREATE POLICY "Public read booking-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'booking-photos');

DROP POLICY IF EXISTS "Uploader delete own booking-photos" ON storage.objects;
CREATE POLICY "Uploader delete own booking-photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'booking-photos' AND owner = auth.uid());
