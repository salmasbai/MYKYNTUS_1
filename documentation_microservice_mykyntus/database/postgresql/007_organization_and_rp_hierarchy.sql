-- =============================================================================
-- Hiérarchie métier complète : Pilote → Coach → Manager → RP
-- Hiérarchie organisationnelle : pôle → cellule → département (arbre par tenant)
-- À exécuter après 006_directory_org_hierarchy.sql
-- =============================================================================

SET search_path TO documentation, public;

-- ---------------------------------------------------------------------------
-- Unités organisationnelles (arbre : pôle → cellule → département)
-- unit_type : pole | cellule | departement (VARCHAR pour mapping EF simple)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documentation.organizational_units (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       VARCHAR(64) NOT NULL,
  parent_id       UUID REFERENCES documentation.organizational_units (id) ON DELETE SET NULL,
  unit_type       VARCHAR(32) NOT NULL
    CONSTRAINT chk_org_units_unit_type CHECK (unit_type IN ('pole', 'cellule', 'departement')),
  code            VARCHAR(64) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_org_units_tenant_code UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_org_units_tenant ON documentation.organizational_units (tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_units_parent ON documentation.organizational_units (tenant_id, parent_id);

COMMENT ON TABLE documentation.organizational_units IS
  'Hiérarchie organisationnelle : chaque employé est rattaché à une feuille (souvent département) ou intermédiaire.';

-- ---------------------------------------------------------------------------
-- Annuaire : lien RP (manager → RP) + rattachement organisationnel
-- ---------------------------------------------------------------------------
ALTER TABLE documentation.directory_users
  ADD COLUMN IF NOT EXISTS rp_id UUID,
  ADD COLUMN IF NOT EXISTS organizational_unit_id UUID;

ALTER TABLE documentation.directory_users
  DROP CONSTRAINT IF EXISTS fk_directory_users_rp;

ALTER TABLE documentation.directory_users
  DROP CONSTRAINT IF EXISTS fk_directory_users_org_unit;

ALTER TABLE documentation.directory_users
  ADD CONSTRAINT fk_directory_users_rp
    FOREIGN KEY (rp_id) REFERENCES documentation.directory_users (id) ON DELETE SET NULL;

ALTER TABLE documentation.directory_users
  ADD CONSTRAINT fk_directory_users_org_unit
    FOREIGN KEY (organizational_unit_id) REFERENCES documentation.organizational_units (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_directory_users_rp_id
  ON documentation.directory_users (tenant_id, rp_id)
  WHERE rp_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_directory_users_org_unit
  ON documentation.directory_users (tenant_id, organizational_unit_id)
  WHERE organizational_unit_id IS NOT NULL;

COMMENT ON COLUMN documentation.directory_users.rp_id IS
  'Rôle manager : responsable de programmes (RP) de tutelle. Chaîne métier : Manager → RP.';

COMMENT ON COLUMN documentation.directory_users.organizational_unit_id IS
  'Rattachement organisationnel (pôle / cellule / département selon le niveau du nœud).';

-- ---------------------------------------------------------------------------
-- Seed Atlas Tech — structure société
-- ---------------------------------------------------------------------------
INSERT INTO documentation.organizational_units (id, tenant_id, parent_id, unit_type, code, name) VALUES
  ('f0000001-0001-4001-8001-000000000001', 'atlas-tech-demo', NULL, 'pole', 'POLE-COMM', 'Pôle Commercial & Relation Client'),
  ('f0000001-0001-4001-8001-000000000002', 'atlas-tech-demo', 'f0000001-0001-4001-8001-000000000001', 'cellule', 'CELL-CASA', 'Cellule Grand Casablanca'),
  ('f0000001-0001-4001-8001-000000000003', 'atlas-tech-demo', 'f0000001-0001-4001-8001-000000000001', 'cellule', 'CELL-RABAT', 'Cellule Rabat & Rabat-Salé'),
  ('f0000001-0001-4001-8001-000000000004', 'atlas-tech-demo', 'f0000001-0001-4001-8001-000000000002', 'departement', 'DEPT-VTE-CASA', 'Département Ventes Terrain — Casa'),
  ('f0000001-0001-4001-8001-000000000005', 'atlas-tech-demo', 'f0000001-0001-4001-8001-000000000003', 'departement', 'DEPT-CONSEIL-RBT', 'Département Conseil & Projets — Rabat'),
  ('f0000001-0001-4001-8001-000000000006', 'atlas-tech-demo', NULL, 'pole', 'POLE-SUPPORT', 'Pôle Support & Opérations'),
  ('f0000001-0001-4001-8001-000000000007', 'atlas-tech-demo', 'f0000001-0001-4001-8001-000000000006', 'departement', 'DEPT-PROG', 'Département Programmes & Gouvernance')
ON CONFLICT (id) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  parent_id = EXCLUDED.parent_id,
  unit_type = EXCLUDED.unit_type,
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  updated_at = NOW();

-- Contrainte UNIQUE sur (tenant_id, code) : conflit possible si code existe — OK avec ON CONFLICT id

-- Référent RP unique pour la démo (Houda)
-- Managers Karim & Sophie → même RP
UPDATE documentation.directory_users
SET rp_id = '66666666-6666-4666-8666-666666666601', updated_at = NOW()
WHERE id IN ('22222222-2222-4222-8222-222222222201', '88888888-8888-4888-8888-888888888801')
  AND role = 'manager';

-- Affectations organisationnelles (exemples cohérents)
UPDATE documentation.directory_users SET organizational_unit_id = 'f0000001-0001-4001-8001-000000000004', updated_at = NOW()
WHERE id IN (
  '11111111-1111-4111-8111-111111111101',
  '11111111-1111-4111-8111-111111111102',
  '55555555-5555-4555-8555-555555555501',
  '55555555-5555-4555-8555-555555555502'
);

UPDATE documentation.directory_users SET organizational_unit_id = 'f0000001-0001-4001-8001-000000000004', updated_at = NOW()
WHERE id = '22222222-2222-4222-8222-222222222201';

UPDATE documentation.directory_users SET organizational_unit_id = 'f0000001-0001-4001-8001-000000000005', updated_at = NOW()
WHERE id IN (
  '11111111-1111-4111-8111-111111111103',
  '11111111-1111-4111-8111-111111111104',
  '11111111-1111-4111-8111-111111111106',
  '55555555-5555-4555-8555-555555555503'
);

UPDATE documentation.directory_users SET organizational_unit_id = 'f0000001-0001-4001-8001-000000000005', updated_at = NOW()
WHERE id = '88888888-8888-4888-8888-888888888801';

UPDATE documentation.directory_users SET organizational_unit_id = 'f0000001-0001-4001-8001-000000000004', updated_at = NOW()
WHERE id IN ('11111111-1111-4111-8111-111111111105', '11111111-1111-4111-8111-111111111107');

UPDATE documentation.directory_users SET organizational_unit_id = 'f0000001-0001-4001-8001-000000000007', updated_at = NOW()
WHERE id = '66666666-6666-4666-8666-666666666601';

UPDATE documentation.directory_users SET organizational_unit_id = 'f0000001-0001-4001-8001-000000000005', updated_at = NOW()
WHERE id IN ('33333333-3333-4333-8333-333333333301', '44444444-4444-4444-8444-444444444401');

UPDATE documentation.directory_users SET organizational_unit_id = 'f0000001-0001-4001-8001-000000000007', updated_at = NOW()
WHERE id = '77777777-7777-4777-8777-777777777701';

DROP TRIGGER IF EXISTS trg_organizational_units_updated ON documentation.organizational_units;
CREATE TRIGGER trg_organizational_units_updated
  BEFORE UPDATE ON documentation.organizational_units
  FOR EACH ROW EXECUTE PROCEDURE documentation.set_updated_at();

SET search_path TO public;
