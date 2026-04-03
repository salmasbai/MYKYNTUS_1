-- =============================================================================
-- MyKyntus Documentation — Audit enrichi + verrou transactionnel numérotation
-- À exécuter après 003_multi_tenant.sql
-- =============================================================================

SET search_path TO documentation, public;

ALTER TABLE documentation.audit_logs
  ADD COLUMN IF NOT EXISTS target_user_id UUID;
ALTER TABLE documentation.audit_logs
  ADD COLUMN IF NOT EXISTS request_number VARCHAR(32);

CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user
  ON documentation.audit_logs (tenant_id, target_user_id)
  WHERE target_user_id IS NOT NULL;

-- Verrou adviser par (tenant, année) pour éviter courses rares sur la séquence
CREATE OR REPLACE FUNCTION documentation.next_document_request_number(p_tenant VARCHAR(64))
RETURNS VARCHAR(32) AS $$
DECLARE
  y INT := EXTRACT(YEAR FROM NOW())::INT;
  v INT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_tenant), y);

  INSERT INTO documentation.document_request_sequences (tenant_id, year, last_value)
  VALUES (p_tenant, y, 1)
  ON CONFLICT (tenant_id, year) DO UPDATE
  SET last_value = documentation.document_request_sequences.last_value + 1
  RETURNING last_value INTO v;

  RETURN format('REQ-%s-%s', y, lpad(v::text, 6, '0'));
END;
$$ LANGUAGE plpgsql;

SET search_path TO public;
