-- =============================================================================
-- Colonne manquante sur document_requests → 500 API (Npgsql 42703) si absente.
-- EF mappe OrganizationalUnitId → organizational_unit_id (snake_case).
-- Prérequis : documentation.organisation_units existe (scripts 008 / 009).
-- Idempotent : safe à relancer.
-- =============================================================================

SET search_path TO documentation, public;

ALTER TABLE documentation.document_requests
  ADD COLUMN IF NOT EXISTS organizational_unit_id UUID
    REFERENCES documentation.organisation_units (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_document_requests_organizational_unit_id
  ON documentation.document_requests (organizational_unit_id)
  WHERE organizational_unit_id IS NOT NULL;

SET search_path TO public;
