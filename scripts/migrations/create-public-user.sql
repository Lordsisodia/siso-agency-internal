-- Create Public User for Demo/Testing Mode
-- This allows unauthenticated users to interact with the LifeLock daily page
--
-- Run this in Supabase SQL Editor
--
-- ID: 00000000-0000-0000-0000-000000000000 (matches PUBLIC_USER_ID in supabase-clerk.ts)

-- Insert the public user into the users table
INSERT INTO users (
  id,
  email,
  full_name,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'public@demo.local',
  'Public Demo User',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Grant necessary permissions for public user
-- This allows the public user to access all LifeLock data

-- Optional: Create a sample morning routine for the public user
INSERT INTO morning_routine_tasks (
  user_id,
  date,
  wake_up_time,
  meditation_duration,
  freshen_up_completed,
  get_blood_flowing_completed,
  power_up_brain_completed,
  plan_day_completed,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  CURRENT_DATE,
  NULL,
  NULL,
  false,
  false,
  false,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (user_id, date) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Public user created successfully!';
  RAISE NOTICE '📧 Email: public@demo.local';
  RAISE NOTICE '🆔 ID: 00000000-0000-0000-0000-000000000000';
  RAISE NOTICE '';
  RAISE NOTICE 'The public user can now access LifeLock daily page without authentication.';
  RAISE NOTICE 'All data created/modified by the public user will be stored under this ID.';
END $$;
