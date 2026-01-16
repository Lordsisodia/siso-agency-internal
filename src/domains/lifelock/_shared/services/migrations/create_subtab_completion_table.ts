/**
 * Migration: Create subtab_completion table
 *
 * This migration creates a table to track completion status of subtabs
 * (morning routine, checkout, etc.) for each user and date.
 */

import { apply_migration } from '@mcp/siso-internal-supabase';

export async function up() {
  await apply_migration({
    name: 'create_subtab_completion_table',
    query: `
      CREATE TABLE IF NOT EXISTS subtab_completion (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        subtab_id TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT false,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        UNIQUE(user_id, date, subtab_id)
      );

      -- Create indexes for common queries
      CREATE INDEX IF NOT EXISTS idx_subtab_completion_user_date ON subtab_completion(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_subtab_completion_user_date_completed ON subtab_completion(user_id, date, completed);

      -- Enable RLS
      ALTER TABLE subtab_completion ENABLE ROW LEVEL SECURITY;

      -- Create policy: Users can read their own completions
      CREATE POLICY IF NOT EXISTS "Users can read own subtab completions"
        ON subtab_completion
        FOR SELECT
        USING (auth.uid() = user_id);

      -- Create policy: Users can insert their own completions
      CREATE POLICY IF NOT EXISTS "Users can insert own subtab completions"
        ON subtab_completion
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);

      -- Create policy: Users can update their own completions
      CREATE POLICY IF NOT EXISTS "Users can update own subtab completions"
        ON subtab_completion
        FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

      -- Create policy: Users can delete their own completions
      CREATE POLICY IF NOT EXISTS "Users can delete own subtab completions"
        ON subtab_completion
        FOR DELETE
        USING (auth.uid() = user_id);

      -- Create function to update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_subtab_completion_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Create trigger to automatically update updated_at
      CREATE TRIGGER update_subtab_completion_updated_at
        BEFORE UPDATE ON subtab_completion
        FOR EACH ROW
        EXECUTE FUNCTION update_subtab_completion_updated_at();
    `
  });
}

export async function down() {
  await apply_migration({
    name: 'drop_subtab_completion_table',
    query: `
      DROP TABLE IF EXISTS subtab_completion CASCADE;
      DROP FUNCTION IF EXISTS update_subtab_completion_updated_at();
    `
  });
}
