-- Ensure optional details can be omitted when adding a client
-- Migration: 20251018_allow_null_company_and_project

ALTER TABLE client_onboarding
  ALTER COLUMN company_name DROP NOT NULL,
  ALTER COLUMN project_name DROP NOT NULL;
