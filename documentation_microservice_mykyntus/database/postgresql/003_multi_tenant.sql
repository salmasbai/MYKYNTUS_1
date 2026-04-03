-- =============================================================================
-- MyKyntus Documentation — Multi-tenant (isolation par X-Tenant-Id)
-- Ordre recommandé : 001_documentation_schema → 002_seed_demo_data_morocco → ce script.
-- =============================================================================

SET search_path TO documentation, public;

-- Demandes : tenant + unicité du numéro par locataire
ALTER TABLE documentation.document_requests
  ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);

UPDATE documentation.document_requests
SET tenant_id = 'atlas-tech-demo'
WHERE tenant_id IS NULL;

ALTER TABLE documentation.document_requests
  ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE documentation.document_requests
  DROP CONSTRAINT IF EXISTS document_requests_request_number_key;

CREATE UNIQUE INDEX IF NOT EXISTS uq_document_requests_tenant_request_number
  ON documentation.document_requests (tenant_id, request_number)
  WHERE request_number IS NOT NULL;

DROP INDEX IF EXISTS documentation.idx_document_requests_status_created;
CREATE INDEX IF NOT EXISTS idx_document_requests_tenant_status_created
  ON documentation.document_requests (tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_requests_tenant_created
  ON documentation.document_requests (tenant_id, created_at DESC);

-- Audit : tenant (traçabilité multi-locataire)
ALTER TABLE documentation.audit_logs
  ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);

UPDATE documentation.audit_logs al
SET tenant_id = 'atlas-tech-demo'
WHERE tenant_id IS NULL;

ALTER TABLE documentation.audit_logs
  ALTER COLUMN tenant_id SET NOT NULL;

DROP INDEX IF EXISTS documentation.idx_audit_logs_occurred;
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_occurred
  ON documentation.audit_logs (tenant_id, occurred_at DESC);

-- Séquences REQ : une ligne par (tenant, année)
ALTER TABLE documentation.document_request_sequences
  ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64);

UPDATE documentation.document_request_sequences
SET tenant_id = 'atlas-tech-demo'
WHERE tenant_id IS NULL;

ALTER TABLE documentation.document_request_sequences
  ALTER COLUMN tenant_id SET NOT NULL;

-- Recréer la clé primaire composite
ALTER TABLE documentation.document_request_sequences
  DROP CONSTRAINT IF EXISTS document_request_sequences_pkey;

ALTER TABLE documentation.document_request_sequences
  ADD PRIMARY KEY (tenant_id, year);

-- Ancienne signature sans tenant (évite les appels accidentels)
DROP FUNCTION IF EXISTS documentation.next_document_request_number();

CREATE OR REPLACE FUNCTION documentation.next_document_request_number(p_tenant VARCHAR(64))
RETURNS VARCHAR(32) AS $$
DECLARE
  y INT := EXTRACT(YEAR FROM NOW())::INT;
  v INT;
BEGIN
  INSERT INTO documentation.document_request_sequences (tenant_id, year, last_value)
  VALUES (p_tenant, y, 1)
  ON CONFLICT (tenant_id, year) DO UPDATE
  SET last_value = documentation.document_request_sequences.last_value + 1
  RETURNING last_value INTO v;

  RETURN format('REQ-%s-%s', y, lpad(v::text, 6, '0'));
END;
$$ LANGUAGE plpgsql;

SET search_path TO public;
