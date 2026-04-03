-- =============================================================================
-- MyKyntus — Microservice Documentation
-- Schéma PostgreSQL (DDL) — normalisé, prêt pour Entity Framework Core (.NET)
--
-- Cible : PostgreSQL 14+
-- Convention : schéma "documentation", identifiants UUID, snake_case
-- EF Core : Npgsql + UseSnakeCaseNamingConvention()
--
-- Exécution (pgAdmin / psql) :
--   CREATE DATABASE mykyntus_documentation ENCODING 'UTF8';
--   \\c mykyntus_documentation
--   puis exécuter ce script.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS documentation;
SET search_path TO documentation, public;

-- ---------------------------------------------------------------------------
-- Types énumérés (mappables en string ou enum côté EF)
-- ---------------------------------------------------------------------------

CREATE TYPE documentation.document_request_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'generated',
  'cancelled'
);

CREATE TYPE documentation.generated_document_status AS ENUM (
  'pending',
  'generated',
  'approved',
  'rejected',
  'archived',
  'expired'
);

CREATE TYPE documentation.workflow_notification_key AS ENUM (
  'email',
  'none'
);

CREATE TYPE documentation.workflow_action_key AS ENUM (
  'validate',
  'reject',
  'approve',
  'archive'
);

-- Rôles alignés sur l’application (types.ts)
CREATE TYPE documentation.app_role AS ENUM (
  'pilote',
  'coach',
  'manager',
  'rp',
  'rh',
  'admin',
  'audit'
);

CREATE TYPE documentation.storage_type AS ENUM (
  'local',
  'cloud'
);

-- ---------------------------------------------------------------------------
-- Catalogue des types de documents (AdminDocType + usage métier)
-- ---------------------------------------------------------------------------

CREATE TABLE documentation.document_types (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              VARCHAR(64) NOT NULL UNIQUE,
  name              VARCHAR(255) NOT NULL,
  description       TEXT,
  department_code   VARCHAR(128),
  retention_days    INTEGER NOT NULL DEFAULT 365
    CONSTRAINT chk_document_types_retention_days CHECK (retention_days >= 0),
  workflow_id       UUID,
  is_mandatory      BOOLEAN NOT NULL DEFAULT FALSE,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_document_types_workflow_id ON documentation.document_types (workflow_id)
  WHERE workflow_id IS NOT NULL;
CREATE INDEX idx_document_types_active ON documentation.document_types (is_active);

-- ---------------------------------------------------------------------------
-- Workflows (définition + étapes + actions autorisées par étape)
-- ---------------------------------------------------------------------------

CREATE TABLE documentation.workflows (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  is_default      BOOLEAN NOT NULL DEFAULT FALSE,
  audit_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
  audit_read_only BOOLEAN NOT NULL DEFAULT TRUE,
  audit_logs      BOOLEAN NOT NULL DEFAULT TRUE,
  audit_history   BOOLEAN NOT NULL DEFAULT TRUE,
  audit_export    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE documentation.document_types
  ADD CONSTRAINT fk_document_types_workflow
  FOREIGN KEY (workflow_id) REFERENCES documentation.workflows (id)
  ON DELETE SET NULL;

CREATE TABLE documentation.workflow_steps (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id       UUID NOT NULL REFERENCES documentation.workflows (id) ON DELETE CASCADE,
  step_order        INTEGER NOT NULL,
  step_key          VARCHAR(64) NOT NULL,
  name              VARCHAR(255) NOT NULL,
  assigned_role     documentation.app_role NOT NULL,
  sla_hours         INTEGER NOT NULL DEFAULT 24
    CONSTRAINT chk_workflow_steps_sla CHECK (sla_hours >= 0),
  notification_key  documentation.workflow_notification_key NOT NULL DEFAULT 'email',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_workflow_steps_order UNIQUE (workflow_id, step_order),
  CONSTRAINT uq_workflow_steps_key UNIQUE (workflow_id, step_key)
);

CREATE INDEX idx_workflow_steps_workflow_id ON documentation.workflow_steps (workflow_id);

CREATE TABLE documentation.workflow_step_actions (
  workflow_step_id UUID NOT NULL REFERENCES documentation.workflow_steps (id) ON DELETE CASCADE,
  action           documentation.workflow_action_key NOT NULL,
  PRIMARY KEY (workflow_step_id, action)
);

-- ---------------------------------------------------------------------------
-- Demandes de documents (Pilote / formulaire + règles RH « Autre »)
-- ---------------------------------------------------------------------------
-- Si type prédéfini : document_type_id renseigné, is_custom_type = FALSE, custom_type_description NULL.
-- Si « Autre » : document_type_id NULL, is_custom_type = TRUE, custom_type_description obligatoire (app).

CREATE TABLE documentation.document_requests (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number           VARCHAR(32) UNIQUE,
  requester_user_id        UUID NOT NULL,
  beneficiary_user_id      UUID,
  document_type_id         UUID REFERENCES documentation.document_types (id) ON DELETE SET NULL,
  is_custom_type           BOOLEAN NOT NULL DEFAULT FALSE,
  custom_type_description  TEXT,
  reason                   TEXT,
  complementary_comments   TEXT,
  status                   documentation.document_request_status NOT NULL DEFAULT 'pending',
  decided_by_user_id       UUID,
  decided_at               TIMESTAMPTZ,
  rejection_reason         TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_document_requests_type_custom CHECK (
    (is_custom_type = FALSE AND document_type_id IS NOT NULL AND custom_type_description IS NULL)
    OR
    (is_custom_type = TRUE AND document_type_id IS NULL AND custom_type_description IS NOT NULL)
  )
);

CREATE INDEX idx_document_requests_requester ON documentation.document_requests (requester_user_id);
CREATE INDEX idx_document_requests_status_created ON documentation.document_requests (status, created_at DESC);
CREATE INDEX idx_document_requests_document_type ON documentation.document_requests (document_type_id);

-- ---------------------------------------------------------------------------
-- Documents générés / stockés
-- ---------------------------------------------------------------------------

CREATE TABLE documentation.generated_documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_request_id UUID REFERENCES documentation.document_requests (id) ON DELETE SET NULL,
  owner_user_id       UUID NOT NULL,
  document_type_id    UUID REFERENCES documentation.document_types (id) ON DELETE SET NULL,
  file_name           VARCHAR(512) NOT NULL,
  storage_uri         TEXT NOT NULL,
  mime_type           VARCHAR(128),
  file_size_bytes     BIGINT
    CONSTRAINT chk_generated_documents_size CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
  status              documentation.generated_document_status NOT NULL DEFAULT 'generated',
  version_number      INTEGER NOT NULL DEFAULT 1
    CONSTRAINT chk_generated_documents_version CHECK (version_number >= 1),
  checksum_sha256     VARCHAR(64),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_generated_documents_owner ON documentation.generated_documents (owner_user_id);
CREATE INDEX idx_generated_documents_request ON documentation.generated_documents (document_request_id);
CREATE INDEX idx_generated_documents_type ON documentation.generated_documents (document_type_id);

-- ---------------------------------------------------------------------------
-- Modèles (templates) et variables
-- ---------------------------------------------------------------------------

CREATE TABLE documentation.document_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(64) NOT NULL UNIQUE,
  name        VARCHAR(255) NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE documentation.document_template_variables (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id    UUID NOT NULL REFERENCES documentation.document_templates (id) ON DELETE CASCADE,
  variable_name  VARCHAR(128) NOT NULL,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT uq_template_variable UNIQUE (template_id, variable_name)
);

CREATE INDEX idx_template_variables_template ON documentation.document_template_variables (template_id);

-- ---------------------------------------------------------------------------
-- Politiques de permissions (par rôle, type de doc, département optionnel)
-- ---------------------------------------------------------------------------

CREATE TABLE documentation.permission_policies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role              documentation.app_role NOT NULL,
  document_type_id  UUID REFERENCES documentation.document_types (id) ON DELETE CASCADE,
  department_code   VARCHAR(128),
  can_read          BOOLEAN NOT NULL DEFAULT FALSE,
  can_create        BOOLEAN NOT NULL DEFAULT FALSE,
  can_update        BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete        BOOLEAN NOT NULL DEFAULT FALSE,
  can_validate      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_permission_policies_role ON documentation.permission_policies (role);
CREATE INDEX idx_permission_policies_doc_type ON documentation.permission_policies (document_type_id);

-- ---------------------------------------------------------------------------
-- Configuration générale DMS (ligne singleton logique : une seule ligne active)
-- ---------------------------------------------------------------------------

CREATE TABLE documentation.dms_general_configuration (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name                VARCHAR(255) NOT NULL DEFAULT 'MyKyntus DMS',
  default_language           VARCHAR(16) NOT NULL DEFAULT 'fr',
  default_timezone           VARCHAR(64) NOT NULL DEFAULT 'Europe/Paris',
  max_file_size_mb           INTEGER NOT NULL DEFAULT 25
    CONSTRAINT chk_dms_general_max_file CHECK (max_file_size_mb > 0),
  allowed_file_types         TEXT NOT NULL DEFAULT 'pdf,doc,docx,png,jpg',
  versioning_enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  retention_days_default     INTEGER NOT NULL DEFAULT 365,
  documents_mandatory_by_type BOOLEAN NOT NULL DEFAULT TRUE,
  auto_numbering_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  numbering_pattern          VARCHAR(128) NOT NULL DEFAULT 'DOC-{YEAR}-{SEQ}',
  encryption_enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  external_sharing_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
  electronic_signature_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_on_upload            BOOLEAN NOT NULL DEFAULT TRUE,
  email_on_validation        BOOLEAN NOT NULL DEFAULT TRUE,
  email_on_rejection         BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_expired_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Configuration stockage (secrets à externaliser en production — Vault / env)
-- ---------------------------------------------------------------------------

CREATE TABLE documentation.dms_storage_configuration (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_type         documentation.storage_type NOT NULL DEFAULT 'cloud',
  api_url              TEXT,
  bucket_name          VARCHAR(255),
  region               VARCHAR(64),
  access_key_reference VARCHAR(512),
  backup_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  compression_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Journal d’audit (événements domaine documentation)
-- ---------------------------------------------------------------------------

CREATE TABLE documentation.audit_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_user_id  UUID,
  action         VARCHAR(64) NOT NULL,
  entity_type    VARCHAR(64) NOT NULL,
  entity_id      UUID,
  correlation_id UUID,
  ip_address     INET,
  user_agent     TEXT,
  details        JSONB,
  success        BOOLEAN,
  error_message  TEXT
);

CREATE INDEX idx_audit_logs_occurred ON documentation.audit_logs (occurred_at DESC);
CREATE INDEX idx_audit_logs_entity ON documentation.audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON documentation.audit_logs (actor_user_id);

-- ---------------------------------------------------------------------------
-- Numérotation des demandes (option : séquence par année)
-- ---------------------------------------------------------------------------

CREATE TABLE documentation.document_request_sequences (
  year       INTEGER PRIMARY KEY,
  last_value INTEGER NOT NULL DEFAULT 0
);

-- Fonction utilitaire : prochain numéro REQ-YYYY-NNNNNN (appel depuis backend ou trigger)
CREATE OR REPLACE FUNCTION documentation.next_document_request_number()
RETURNS VARCHAR(32) AS $$
DECLARE
  y INT := EXTRACT(YEAR FROM NOW())::INT;
  v INT;
BEGIN
  UPDATE documentation.document_request_sequences
  SET last_value = last_value + 1
  WHERE year = y
  RETURNING last_value INTO v;

  IF NOT FOUND THEN
    INSERT INTO documentation.document_request_sequences (year, last_value)
    VALUES (y, 1)
    RETURNING last_value INTO v;
  END IF;

  RETURN format('REQ-%s-%s', y, lpad(v::text, 6, '0'));
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Triggers updated_at génériques
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION documentation.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_document_types_updated
  BEFORE UPDATE ON documentation.document_types
  FOR EACH ROW EXECUTE PROCEDURE documentation.set_updated_at();

CREATE TRIGGER trg_workflows_updated
  BEFORE UPDATE ON documentation.workflows
  FOR EACH ROW EXECUTE PROCEDURE documentation.set_updated_at();

CREATE TRIGGER trg_workflow_steps_updated
  BEFORE UPDATE ON documentation.workflow_steps
  FOR EACH ROW EXECUTE PROCEDURE documentation.set_updated_at();

CREATE TRIGGER trg_document_requests_updated
  BEFORE UPDATE ON documentation.document_requests
  FOR EACH ROW EXECUTE PROCEDURE documentation.set_updated_at();

CREATE TRIGGER trg_generated_documents_updated
  BEFORE UPDATE ON documentation.generated_documents
  FOR EACH ROW EXECUTE PROCEDURE documentation.set_updated_at();

CREATE TRIGGER trg_permission_policies_updated
  BEFORE UPDATE ON documentation.permission_policies
  FOR EACH ROW EXECUTE PROCEDURE documentation.set_updated_at();

CREATE TRIGGER trg_dms_general_configuration_updated
  BEFORE UPDATE ON documentation.dms_general_configuration
  FOR EACH ROW EXECUTE PROCEDURE documentation.set_updated_at();

CREATE TRIGGER trg_dms_storage_configuration_updated
  BEFORE UPDATE ON documentation.dms_storage_configuration
  FOR EACH ROW EXECUTE PROCEDURE documentation.set_updated_at();

SET search_path TO public;
