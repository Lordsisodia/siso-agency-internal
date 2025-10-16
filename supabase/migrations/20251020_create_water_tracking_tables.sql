-- Create water tracking tables and preferences
-- Migration: 20251020_create_water_tracking_tables

-- Ensure required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function to auto-update updated_at columns
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- User preferences table for hydration goal (creates if missing)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  water_goal_ml INTEGER NOT NULL DEFAULT 2000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT user_preferences_user_unique UNIQUE (user_id)
);

-- Trigger to maintain updated_at on user_preferences
DROP TRIGGER IF EXISTS user_preferences_set_updated_at ON public.user_preferences;
CREATE TRIGGER user_preferences_set_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Water intake log table
CREATE TABLE IF NOT EXISTS public.water_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_ml INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT water_log_amount_nonzero CHECK (amount_ml <> 0)
);

-- Trigger to maintain updated_at on water_log
DROP TRIGGER IF EXISTS water_log_set_updated_at ON public.water_log;
CREATE TRIGGER water_log_set_updated_at
BEFORE UPDATE ON public.water_log
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Index for user/date lookups
CREATE INDEX IF NOT EXISTS idx_water_log_user_date
  ON public.water_log(user_id, date);

-- Comment metadata
COMMENT ON TABLE public.water_log IS 'Stores individual water intake events in milliliters for each user and date.';
COMMENT ON COLUMN public.water_log.amount_ml IS 'Positive values add to intake, negative values subtract for corrections.';
COMMENT ON TABLE public.user_preferences IS 'Stores hydration and other customizable user preferences.';
COMMENT ON COLUMN public.user_preferences.water_goal_ml IS 'Daily water intake goal in milliliters.';
