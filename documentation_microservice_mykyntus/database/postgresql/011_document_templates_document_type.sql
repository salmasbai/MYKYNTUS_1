-- =============================================================================
-- Colonne manquante sur document_templates → 500 sur GET /document-templates (42703).
-- EF mappe DocumentTypeId → document_type_id.
-- Ajoutée dans 009 ; les bases créées sans 009 ne l’ont pas.
-- Idempotent.
-- =============================================================================

SET search_path TO documentation, public;

ALTER TABLE documentation.document_templates
  ADD COLUMN IF NOT EXISTS document_type_id UUID
    REFERENCES documentation.document_types (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_document_templates_document_type_id
  ON documentation.document_templates (document_type_id)
  WHERE document_type_id IS NOT NULL;

SET search_path TO public;
