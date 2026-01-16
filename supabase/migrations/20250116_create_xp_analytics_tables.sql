-- ============================================================================
-- XP ANALYTICS - DATABASE MIGRATION
-- ============================================================================
-- Creates tables for comprehensive XP analytics including:
-- - Enhanced daily stats with session tracking
-- - Pre-computed weekly/monthly summaries
-- - Hourly productivity tracking
-- - XP earning sessions
-- - XP goals
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Update existing daily_xp_stats table with new fields
-- ----------------------------------------------------------------------------
ALTER TABLE daily_xp_stats
  ADD COLUMN IF NOT EXISTS source_breakdown JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS session_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS peak_productivity_hour INTEGER DEFAULT 9,
  ADD COLUMN IF NOT EXISTS bonus_xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS base_xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS goal_xp INTEGER DEFAULT 500;

-- Create index for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_daily_xp_stats_user_date
  ON daily_xp_stats(user_id, date DESC);

-- Create index for category breakdown queries
CREATE INDEX IF NOT EXISTS idx_daily_xp_stats_category_breakdown
  ON daily_xp_stats USING GIN (category_breakdown);

-- ----------------------------------------------------------------------------
-- Pre-computed XP summaries (weekly/monthly/yearly)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS xp_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Period info
  period_type TEXT NOT NULL CHECK (period_type IN ('week', 'month', 'year')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- XP totals
  total_xp INTEGER NOT NULL DEFAULT 0,
  base_xp INTEGER NOT NULL DEFAULT 0,
  bonus_xp INTEGER NOT NULL DEFAULT 0,
  daily_average DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Best/worst performance
  best_day DATE,
  best_day_xp INTEGER DEFAULT 0,
  worst_day DATE,
  worst_day_xp INTEGER DEFAULT 0,

  -- Category breakdown
  category_breakdown JSONB DEFAULT '{}',

  -- Achievements unlocked during period
  achievements_unlocked TEXT[] DEFAULT '{}',

  -- Streak info
  streak_days INTEGER DEFAULT 0,
  longest_streak_in_period INTEGER DEFAULT 0,

  -- Level info
  level_start INTEGER DEFAULT 1,
  level_end INTEGER DEFAULT 1,

  -- Goals
  goal_xp INTEGER DEFAULT 0,
  goal_progress DECIMAL(5, 2) DEFAULT 0,

  -- Sessions
  total_sessions INTEGER DEFAULT 0,
  avg_sessions_per_day DECIMAL(5, 2) DEFAULT 0,

  -- Peak productivity
  peak_productivity_hour INTEGER DEFAULT 9,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, period_type, period_start)
);

-- Indexes for xp_summaries
CREATE INDEX IF NOT EXISTS idx_xp_summaries_user_period
  ON xp_summaries(user_id, period_type, period_start DESC);

CREATE INDEX IF NOT EXISTS idx_xp_summaries_dates
  ON xp_summaries(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_xp_summaries_category_breakdown
  ON xp_summaries USING GIN (category_breakdown);

-- ----------------------------------------------------------------------------
-- Hourly XP tracking for productivity analysis
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hourly_xp_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  xp_earned INTEGER NOT NULL DEFAULT 0,
  sessions INTEGER NOT NULL DEFAULT 0,
  sources JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date, hour)
);

-- Indexes for hourly_xp_stats
CREATE INDEX IF NOT EXISTS idx_hourly_xp_stats_user_date_hour
  ON hourly_xp_stats(user_id, date DESC, hour);

CREATE INDEX IF NOT EXISTS idx_hourly_xp_stats_hour
  ON hourly_xp_stats(user_id, hour);

-- ----------------------------------------------------------------------------
-- XP earning sessions (detailed session tracking)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS xp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Session info
  session_date DATE NOT NULL,
  session_hour INTEGER NOT NULL CHECK (session_hour >= 0 AND session_hour <= 23),

  -- XP awarded
  activity_id TEXT NOT NULL,
  activity_name TEXT NOT NULL,
  base_xp INTEGER NOT NULL,
  bonus_xp INTEGER DEFAULT 0,
  total_xp INTEGER NOT NULL,

  -- Multipliers applied
  multipliers JSONB DEFAULT '{}',

  -- Source details
  category TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT,

  -- Level context
  level_at_time INTEGER NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for xp_sessions
CREATE INDEX IF NOT EXISTS idx_xp_sessions_user_date
  ON xp_sessions(user_id, session_date DESC, session_hour);

CREATE INDEX IF NOT EXISTS idx_xp_sessions_category
  ON xp_sessions(user_id, category, session_date DESC);

CREATE INDEX IF NOT EXISTS idx_xp_sessions_activity
  ON xp_sessions(user_id, activity_id, session_date DESC);

-- ----------------------------------------------------------------------------
-- XP goals (daily/weekly/monthly targets)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS xp_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Goal info
  goal_type TEXT NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly')),
  target_xp INTEGER NOT NULL,

  -- Period
  start_date DATE NOT NULL,
  end_date DATE,

  -- Progress
  current_xp INTEGER DEFAULT 0,
  progress_percent DECIMAL(5, 2) DEFAULT 0,

  -- Status
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,

  -- Rewards
  reward_unlocked BOOLEAN DEFAULT FALSE,
  reward_xp INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, goal_type, start_date)
);

-- Indexes for xp_goals
CREATE INDEX IF NOT EXISTS idx_xp_goals_user_type
  ON xp_goals(user_id, goal_type, start_date DESC);

CREATE INDEX IF NOT EXISTS idx_xp_goals_completed
  ON xp_goals(user_id, completed, start_date DESC);

-- ----------------------------------------------------------------------------
-- Functions and Triggers
-- ----------------------------------------------------------------------------

-- Update updated_at trigger function (create if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_xp_summaries_updated_at
  BEFORE UPDATE ON xp_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_xp_goals_updated_at
  BEFORE UPDATE ON xp_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Helper function to calculate daily XP summary
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_daily_xp_summary(
  p_user_id UUID,
  p_date DATE
)
RETURNS TABLE (
  total_xp INTEGER,
  base_xp INTEGER,
  bonus_xp INTEGER,
  session_count INTEGER,
  peak_hour INTEGER,
  category_breakdown JSONB
) AS $$
DECLARE
  v_total_xp INTEGER := 0;
  v_base_xp INTEGER := 0;
  v_bonus_xp INTEGER := 0;
  v_session_count INTEGER := 0;
  v_peak_hour INTEGER := 9;
  v_category_breakdown JSONB := '{}';
BEGIN
  -- Calculate totals from sessions
  SELECT
    COALESCE(SUM(total_xp), 0),
    COALESCE(SUM(base_xp), 0),
    COALESCE(SUM(bonus_xp), 0),
    COUNT(*),
    (SELECT hour FROM (
      SELECT hour, SUM(xp_earned) as total
      FROM hourly_xp_stats
      WHERE user_id = p_user_id AND date = p_date
      GROUP BY hour
      ORDER BY total DESC
      LIMIT 1
    ) sq)
  INTO v_total_xp, v_base_xp, v_bonus_xp, v_session_count, v_peak_hour
  FROM xp_sessions
  WHERE user_id = p_user_id AND session_date = p_date;

  -- Get category breakdown
  SELECT jsonb_object_agg(category, total_xp)
  INTO v_category_breakdown
  FROM (
    SELECT category, SUM(total_xp) as total_xp
    FROM xp_sessions
    WHERE user_id = p_user_id AND session_date = p_date
    GROUP BY category
  ) sq;

  RETURN QUERY SELECT
    v_total_xp,
    v_base_xp,
    v_bonus_xp,
    v_session_count,
    COALESCE(v_peak_hour, 9),
    COALESCE(v_category_breakdown, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ----------------------------------------------------------------------------

-- Enable RLS on all new tables
ALTER TABLE xp_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE hourly_xp_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only read/write their own data
CREATE POLICY "Users can view own xp_summaries"
  ON xp_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp_summaries"
  ON xp_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own xp_summaries"
  ON xp_summaries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own hourly_xp_stats"
  ON hourly_xp_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hourly_xp_stats"
  ON hourly_xp_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hourly_xp_stats"
  ON hourly_xp_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own xp_sessions"
  ON xp_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp_sessions"
  ON xp_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own xp_goals"
  ON xp_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp_goals"
  ON xp_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own xp_goals"
  ON xp_goals FOR UPDATE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Grant necessary permissions
-- ----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON daily_xp_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE ON xp_summaries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON hourly_xp_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE ON xp_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON xp_goals TO authenticated;

GRANT USAGE ON SCHEMA public TO authenticated;

-- ----------------------------------------------------------------------------
-- Comments for documentation
-- ----------------------------------------------------------------------------
COMMENT ON TABLE xp_summaries IS 'Pre-computed XP summaries for weekly/monthly/yearly periods to optimize analytics queries';
COMMENT ON TABLE hourly_xp_stats IS 'Hourly XP tracking for productivity analysis and peak productivity hours detection';
COMMENT ON TABLE xp_sessions IS 'Detailed XP earning sessions with full context for deep analytics';
COMMENT ON TABLE xp_goals IS 'User-defined XP goals for daily/weekly/monthly targets with reward system';

COMMENT ON COLUMN xp_summaries.period_type IS 'Type of period: week, month, or year';
COMMENT ON COLUMN xp_summaries.peak_productivity_hour IS 'Hour (0-23) when user earned most XP during this period';
COMMENT ON COLUMN hourly_xp_stats.sources IS 'Breakdown of XP sources for this hour';
COMMENT ON COLUMN xp_sessions.multipliers IS 'Multipliers applied to this XP award (streaks, achievements, etc.)';
COMMENT ON COLUMN xp_goals.reward_xp IS 'Bonus XP awarded when goal is completed';
