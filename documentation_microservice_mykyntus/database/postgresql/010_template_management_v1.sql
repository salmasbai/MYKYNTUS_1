-- =============================================================================
-- MyKyntus Documentation — Template Management V1
-- Prérequis : scripts 001 → 009 exécutés.
-- Objectif : tenantisation templates, versioning, placeholders typés,
--            et lien generated_documents -> template_version.
-- =============================================================================

SET search_path TO documentation, public;

ALTER TABLE documentation.document_templates
  ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);

UPDATE documentation.document_templates
SET tenant_id = 'atlas-tech-demo'
WHERE tenant_id IS NULL;

ALTER TABLE documentation.document_templates
  ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE documentation.document_templates
  ADD COLUMN IF NOT EXISTS source VARCHAR(16) NOT NULL DEFAULT 'UPLOAD';

ALTER TABLE documentation.document_templates
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE documentation.document_templates
  ADD COLUMN IF NOT EXISTS current_version_id UUID;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'documentation'
      AND tablename = 'document_templates'
      AND indexname = 'document_templates_code_key'
  ) THEN
    EXECUTE 'DROP INDEX documentation.document_templates_code_key';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_document_templates_tenant_code
  ON documentation.document_templates (tenant_id, code);

CREATE INDEX IF NOT EXISTS idx_document_templates_tenant
  ON documentation.document_templates (tenant_id);

CREATE TABLE IF NOT EXISTS documentation.document_template_versions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id       UUID NOT NULL REFERENCES documentation.document_templates (id) ON DELETE CASCADE,
  tenant_id         VARCHAR(64) NOT NULL,
  version_number    INTEGER NOT NULL CHECK (version_number >= 1),
  status            VARCHAR(16) NOT NULL,
  structured_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  original_asset_uri TEXT,
  created_by_user_id UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_template_versions_template_version
  ON documentation.document_template_versions (template_id, version_number);

CREATE INDEX IF NOT EXISTS idx_template_versions_tenant_template_status
  ON documentation.document_template_versions (tenant_id, template_id, status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'documentation'
      AND table_name = 'document_templates'
      AND constraint_name = 'fk_document_templates_current_version'
  ) THEN
    ALTER TABLE documentation.document_templates
      ADD CONSTRAINT fk_document_templates_current_version
      FOREIGN KEY (current_version_id)
      REFERENCES documentation.document_template_versions (id)
      ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE documentation.document_template_variables
  ADD COLUMN IF NOT EXISTS template_version_id UUID REFERENCES documentation.document_template_versions (id) ON DELETE CASCADE;

ALTER TABLE documentation.document_template_variables
  ADD COLUMN IF NOT EXISTS variable_type VARCHAR(16) NOT NULL DEFAULT 'text';

ALTER TABLE documentation.document_template_variables
  ADD COLUMN IF NOT EXISTS is_required BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE documentation.document_template_variables
  ADD COLUMN IF NOT EXISTS default_value TEXT;

ALTER TABLE documentation.document_template_variables
  ADD COLUMN IF NOT EXISTS validation_rule TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_template_variable_by_version
  ON documentation.document_template_variables (template_version_id, variable_name)
  WHERE template_version_id IS NOT NULL;

ALTER TABLE documentation.generated_documents
  ADD COLUMN IF NOT EXISTS template_version_id UUID REFERENCES documentation.document_template_versions (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_generated_documents_template_version
  ON documentation.generated_documents (template_version_id);

SET search_path TO public;
