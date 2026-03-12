CREATE TABLE contractors (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id        UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  business_name     TEXT,
  bio               TEXT,
  years_experience  INTEGER DEFAULT 0,
  hourly_rate       DECIMAL(10,2),
  rating_avg        DECIMAL(3,2) DEFAULT 0.00,
  review_count      INTEGER DEFAULT 0,
  is_active         BOOLEAN DEFAULT true,
  is_verified       BOOLEAN DEFAULT false,
  base_location     geography(POINT, 4326),
  service_radius_m  INTEGER DEFAULT 40000,
  service_area      geography(POLYGON, 4326),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contractors_base_location ON contractors USING GIST (base_location);
CREATE INDEX idx_contractors_service_area ON contractors USING GIST (service_area);
CREATE INDEX idx_contractors_active ON contractors (is_active) WHERE is_active = true;
