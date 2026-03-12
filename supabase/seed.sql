-- Seed data for Curb development
-- Run after migrations to populate with mock data
-- Note: In production, auth.users rows are created via Supabase Auth.
-- For local dev with Supabase CLI, you can use supabase auth admin create-user.
-- This seed assumes profiles already exist (created via signup trigger).

-- Below is a reference of the services that were seeded in migration 00004:
-- Pool: Pool Cleaning, Pool Repair, Pool Resurfacing
-- Landscaping: Lawn Mowing, Garden Design, Tree Trimming, Irrigation Install
-- Maid: Standard Cleaning, Deep Cleaning, Move-in/Move-out

-- INSTRUCTIONS:
-- 1. Create test accounts via the signup flow or Supabase dashboard
-- 2. Note the UUIDs from the profiles table
-- 3. Insert contractor rows referencing those profile UUIDs
-- 4. Or use this file with `supabase db reset` for local development

-- Example contractor inserts (replace UUIDs with actual profile IDs):
/*
-- After creating test users, run:

-- Get service IDs
-- SELECT id, name FROM services;

-- Insert contractor records
INSERT INTO contractors (profile_id, business_name, bio, years_experience, hourly_rate, is_active, is_verified, base_location, service_radius_m) VALUES
  ('<profile_uuid>', 'Crystal Clear Pools', 'Expert pool maintenance with 15 years of experience in residential and commercial pools.', 15, 75.00, true, true, ST_SetSRID(ST_MakePoint(-118.2437, 34.0522), 4326)::geography, 40000),
  ('<profile_uuid>', 'Green Thumb Landscaping', 'Full-service landscaping company. Award-winning garden designs.', 10, 65.00, true, true, ST_SetSRID(ST_MakePoint(-118.3281, 34.0195), 4326)::geography, 50000),
  ('<profile_uuid>', 'Sparkle Home Services', 'Professional cleaning team. Bonded and insured. We treat your home like our own.', 8, 55.00, true, true, ST_SetSRID(ST_MakePoint(-118.1445, 34.1478), 4326)::geography, 35000);

-- Link contractors to services (get contractor IDs and service IDs first)
-- INSERT INTO contractor_services (contractor_id, service_id, price, price_unit) VALUES
--   ('<contractor_id>', '<pool_cleaning_service_id>', 150.00, 'flat'),
--   ('<contractor_id>', '<pool_repair_service_id>', 85.00, 'hourly');

-- Add availability
-- INSERT INTO availability (contractor_id, day_of_week, start_time, end_time, is_available) VALUES
--   ('<contractor_id>', 1, '08:00', '17:00', true),  -- Monday
--   ('<contractor_id>', 2, '08:00', '17:00', true);  -- Tuesday
*/

-- For quick demo: you can run the app, create accounts via signup,
-- then insert contractors via the Supabase SQL editor using the actual UUIDs.
