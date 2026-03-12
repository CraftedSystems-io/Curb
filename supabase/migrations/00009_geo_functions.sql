-- PostGIS function to find nearby contractors
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
  ORDER BY distance_m ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
