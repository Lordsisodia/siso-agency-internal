-- User Feedback System Setup for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Create the user_feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('UI_UX', 'PERFORMANCE', 'FEATURE_REQUEST', 'BUG_REPORT', 'GENERAL', 'MOBILE', 'ACCESSIBILITY')),
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  feedback_type TEXT NOT NULL DEFAULT 'SUGGESTION' CHECK (feedback_type IN ('BUG', 'SUGGESTION', 'IMPROVEMENT', 'COMPLAINT', 'PRAISE')),
  page TEXT,
  browser_info TEXT,
  device_info TEXT,
  screenshots TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'REVIEWING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  admin_response TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_priority ON user_feedback(priority);
CREATE INDEX IF NOT EXISTS idx_user_feedback_category ON user_feedback(category);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status_priority ON user_feedback(status, priority);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_feedback_updated_at 
  BEFORE UPDATE ON user_feedback 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can insert their own feedback
CREATE POLICY "Users can create their own feedback" ON user_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback" ON user_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own feedback (limited fields)
CREATE POLICY "Users can update their own feedback" ON user_feedback
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    -- Prevent users from modifying admin fields
    OLD.admin_response = NEW.admin_response AND
    OLD.status = NEW.status AND
    OLD.resolved_at = NEW.resolved_at
  );

-- Admin policy (you'll need to adjust this based on your admin identification logic)
-- Example: if admins have a specific role or are in a specific table
CREATE POLICY "Admins can do everything" ON user_feedback
  FOR ALL USING (
    -- Replace this with your admin identification logic
    -- Example: auth.jwt() ->> 'role' = 'admin'
    -- Or: EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('admin@example.com', 'your-admin-email@domain.com')
    )
  );

-- Grant necessary permissions
GRANT ALL ON user_feedback TO authenticated;
GRANT SELECT ON user_feedback TO anon;

-- Optional: Create a view for public feedback stats (no sensitive data)
CREATE OR REPLACE VIEW public_feedback_stats AS
SELECT 
  category,
  feedback_type,
  priority,
  status,
  COUNT(*) as count,
  DATE_TRUNC('week', created_at) as week
FROM user_feedback
GROUP BY category, feedback_type, priority, status, DATE_TRUNC('week', created_at)
ORDER BY week DESC, count DESC;

GRANT SELECT ON public_feedback_stats TO authenticated, anon;