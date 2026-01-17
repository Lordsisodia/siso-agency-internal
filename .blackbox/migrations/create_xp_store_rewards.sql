-- Migration: Create XP Store Rewards Table
-- Created: 2025-01-17
-- Description: Creates the xp_store_rewards table for managing XP store rewards

-- Create the xp_store_rewards table
CREATE TABLE IF NOT EXISTS xp_store_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('SOCIAL', 'FOOD', 'ENTERTAINMENT', 'WELLNESS', 'RECOVERY', 'REST', 'GROWTH', 'INDULGENCE', 'CUSTOM')),
  name TEXT NOT NULL,
  description TEXT,
  icon_emoji TEXT NOT NULL DEFAULT '🎁',
  base_price INTEGER NOT NULL DEFAULT 100,
  current_price INTEGER NOT NULL DEFAULT 100,
  unlock_at INTEGER,
  max_daily_use INTEGER DEFAULT 1,
  availability_window TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_xp_store_rewards_category ON xp_store_rewards(category);
CREATE INDEX IF NOT EXISTS idx_xp_store_rewards_active ON xp_store_rewards(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_xp_store_rewards_price ON xp_store_rewards(current_price);

-- Enable Row Level Security
ALTER TABLE xp_store_rewards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Admins can do everything
CREATE POLICY "Admins can view all rewards" ON xp_store_rewards
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can insert rewards" ON xp_store_rewards
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can update rewards" ON xp_store_rewards
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can delete rewards" ON xp_store_rewards
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- All authenticated users can view active rewards
CREATE POLICY "Authenticated users can view active rewards" ON xp_store_rewards
  FOR SELECT USING (is_active = true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_xp_store_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_xp_store_rewards_updated_at
  BEFORE UPDATE ON xp_store_rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_xp_store_rewards_updated_at();

-- Seed with existing rewards from the plan
INSERT INTO xp_store_rewards (category, name, description, icon_emoji, base_price, current_price, unlock_at, sort_order) VALUES
  ('SOCIAL', 'Risk Night with the Crew', 'Full strategic board game session with the boys—no guilt, all snacks included.', '🎲', 1000, 1000, 1000, 1),
  ('FOOD', 'Chef-Level Dinner Out', 'Book a reservation or splurge on premium ingredients for a 5-star meal.', '🍣', 1500, 1500, 1500, 2),
  ('ENTERTAINMENT', 'Movie Night Upgrade', 'Theatre tickets or a full streaming setup with snacks and zero interruptions.', '🎬', 2000, 2000, 2000, 3),
  ('INDULGENCE', 'Premium Coffee Ritual', 'Treat yourself to a high-end pour-over or latte from your favourite spot.', '☕️', 750, 700, NULL, 4),
  ('WELLNESS', 'Focus Break Walk', '15 minute walk to reset your energy and protect momentum.', '🚶‍♂️', 600, 500, NULL, 5),
  ('RECOVERY', 'Massage or Spa Reset', 'Book a massage, sauna, or spa day to reset your nervous system.', '💆‍♂️', 10000, 10000, 10000, 6),
  ('REST', 'Quarter Day Off', 'Block off three guilt-free hours for deep recovery or creative wandering.', '🌤️', 3200, 3200, NULL, 7),
  ('GROWTH', 'Coaching Session Upgrade', 'Invest in a specialised coaching or learning session.', '🧠', 4500, 4300, NULL, 8)
ON CONFLICT DO NOTHING;
