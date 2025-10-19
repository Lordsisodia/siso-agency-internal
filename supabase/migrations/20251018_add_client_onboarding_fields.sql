-- Add missing fields to client_onboarding table
-- Migration: 20251018_add_client_onboarding_fields
-- This migration adds optional fields that the frontend code expects

-- Add estimated_price column
ALTER TABLE client_onboarding
ADD COLUMN IF NOT EXISTS estimated_price NUMERIC;

-- Add estimated_completion_date column
ALTER TABLE client_onboarding
ADD COLUMN IF NOT EXISTS estimated_completion_date TIMESTAMPTZ;

-- Add payment_status column
ALTER TABLE client_onboarding
ADD COLUMN IF NOT EXISTS payment_status TEXT;

-- Add progress column
ALTER TABLE client_onboarding
ADD COLUMN IF NOT EXISTS progress TEXT DEFAULT 'Not Started';

-- Add user_id column to link clients to users
ALTER TABLE client_onboarding
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add todos column as JSONB for storing todo items
ALTER TABLE client_onboarding
ADD COLUMN IF NOT EXISTS todos JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN client_onboarding.estimated_price IS 'Estimated project price in dollars';
COMMENT ON COLUMN client_onboarding.estimated_completion_date IS 'Estimated project completion date';
COMMENT ON COLUMN client_onboarding.payment_status IS 'Payment status (e.g., pending, partial, paid)';
COMMENT ON COLUMN client_onboarding.progress IS 'Overall progress status';
COMMENT ON COLUMN client_onboarding.user_id IS 'User ID for client-user relationship';
COMMENT ON COLUMN client_onboarding.todos IS 'JSON array of todo items for this client';
