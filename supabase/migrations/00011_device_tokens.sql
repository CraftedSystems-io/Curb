-- ============================================
-- Migration 11: Device tokens for push notifications
-- ============================================

CREATE TABLE IF NOT EXISTS device_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, token)
);

-- Enable RLS
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own tokens
CREATE POLICY "Users can insert own tokens" ON device_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own tokens" ON device_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens" ON device_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Upsert function for token registration (called from the app)
CREATE OR REPLACE FUNCTION upsert_device_token(
  p_user_id uuid,
  p_token text,
  p_platform text
) RETURNS void AS $$
BEGIN
  INSERT INTO device_tokens (user_id, token, platform, updated_at)
  VALUES (p_user_id, p_token, p_platform, now())
  ON CONFLICT (user_id, token)
  DO UPDATE SET updated_at = now(), platform = p_platform;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
