CREATE TYPE service_category AS ENUM ('pool', 'landscaping', 'maid');

CREATE TABLE services (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  category    service_category NOT NULL,
  description TEXT,
  icon_name   TEXT
);

CREATE TABLE contractor_services (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id   UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  price           DECIMAL(10,2),
  price_unit      TEXT DEFAULT 'flat',
  UNIQUE(contractor_id, service_id)
);

-- Seed core services
INSERT INTO services (name, category, description, icon_name) VALUES
  ('Pool Cleaning', 'pool', 'Regular pool cleaning and chemical balancing', 'waves'),
  ('Pool Repair', 'pool', 'Equipment repair and maintenance', 'wrench'),
  ('Pool Resurfacing', 'pool', 'Replastering and resurfacing', 'paintbrush'),
  ('Lawn Mowing', 'landscaping', 'Regular lawn mowing and edging', 'scissors'),
  ('Garden Design', 'landscaping', 'Landscape design and planting', 'flower-2'),
  ('Tree Trimming', 'landscaping', 'Tree and hedge trimming', 'tree-pine'),
  ('Irrigation Install', 'landscaping', 'Sprinkler system installation', 'droplets'),
  ('Standard Cleaning', 'maid', 'Regular home cleaning', 'sparkles'),
  ('Deep Cleaning', 'maid', 'Thorough deep cleaning', 'sparkle'),
  ('Move-in/Move-out', 'maid', 'Full property cleaning for moves', 'home');
