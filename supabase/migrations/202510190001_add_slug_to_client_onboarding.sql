-- Add slug column to client_onboarding table for SEO-friendly URLs
-- Example: /admin/clients/acme-corp instead of /admin/clients/abc-123-uuid

-- Add the slug column
ALTER TABLE client_onboarding
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index for slugs
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_onboarding_slug
ON client_onboarding(slug) WHERE slug IS NOT NULL;

-- Generate slugs from company_name (or contact_name as fallback)
-- Convert to lowercase, replace spaces/special chars with hyphens
UPDATE client_onboarding
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      COALESCE(company_name, contact_name, 'client-' || id::text),
      '[^a-zA-Z0-9\s-]', '', 'g'
    ),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Handle duplicate slugs by appending counter
WITH ranked_slugs AS (
  SELECT
    id,
    slug,
    ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM client_onboarding
)
UPDATE client_onboarding c
SET slug = r.slug || '-' || r.rn
FROM ranked_slugs r
WHERE c.id = r.id AND r.rn > 1;

-- Add comment
COMMENT ON COLUMN client_onboarding.slug IS
'URL-friendly slug for client workspace. Generated from company_name or contact_name.';
