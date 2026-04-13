-- Curb: Add billing fields to contractors table
-- Run this in Supabase SQL Editor

ALTER TABLE contractors
ADD COLUMN IF NOT EXISTS subscription_plan text NOT NULL DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

-- Add admin role support to profiles
-- (existing profiles have 'client' or 'contractor')

-- Platform admin: set Frank's profile role to 'admin'
-- UPDATE profiles SET role = 'admin' WHERE email = 'frank@craftedsystems.io';

-- Index for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_contractors_stripe_customer_id ON contractors(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_contractors_subscription_status ON contractors(subscription_status);
