-- Add photo nutrition tracking fields to nutrition_entries
-- Enables AI-powered photo-based nutrition logging

ALTER TABLE nutrition_entries
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS photo_timestamp TIMESTAMPTZ;

-- Add index for faster photo queries
CREATE INDEX IF NOT EXISTS idx_nutrition_entries_photo_url
ON nutrition_entries(photo_url)
WHERE photo_url IS NOT NULL;

-- Add index for date + photo queries (common pattern)
CREATE INDEX IF NOT EXISTS idx_nutrition_entries_date_photo
ON nutrition_entries(user_id, date, photo_url)
WHERE photo_url IS NOT NULL;

-- Add comment
COMMENT ON COLUMN nutrition_entries.photo_url IS 'Supabase Storage URL for food photo (optional)';
COMMENT ON COLUMN nutrition_entries.photo_timestamp IS 'When the photo was taken (may differ from created_at)';
