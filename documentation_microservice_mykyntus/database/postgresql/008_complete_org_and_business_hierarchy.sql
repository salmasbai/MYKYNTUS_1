-- =============================================================================
-- Modèle complet : hiérarchie org (Pôle → Cellule → Département) explicite
--                 + hiérarchie métier (RP → Manager → Coach → Pilote)
-- Peut s’exécuter sans 007 : crée documentation.organisation_units et le seed org si besoin
-- (sinon renommage organizational_units → organisation_units). Prérequis : schéma documentation +
-- table directory_users (005+). Colonnes manager_id / coach_id / rp_id ajoutées si besoin (équivalent 006–007).
-- =============================================================================

SET search_path TO documentation, public;

-- 1) Renommer la table d’unités (convention organisation_units) et normaliser les types
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'documentation' AND table_name = 'organizational_units'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'documentation' AND table_name = 'organisation_units'
  ) THEN
    ALTER TABLE documentation.organizational_units RENAME TO organisation_units;
  END IF;
END $$;

-- 1bis) Table absente (007 jamais appliqué) : création alignée sur le schéma cible
CREATE TABLE IF NOT EXISTS documentation.organisation_units (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       VARCHAR(64) NOT NULL,
  parent_id       UUID REFERENCES documentation.organisation_units (id) ON DELETE SET NULL,
  unit_type       VARCHAR(32) NOT NULL,
  code            VARCHAR(64) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_org_units_tenant_code UNIQUE (tenant_id, code)
);

-- Types en majuscules (POLE / CELLULE / DEPARTEMENT), idempotent si 008 relancé
DO $$
BEGIN
  IF to_regclass('documentation.organisation_units') IS NOT NULL THEN
    ALTER TABLE documentation.organisation_units
      DROP CONSTRAINT IF EXISTS chk_org_units_unit_type;

    UPDATE documentation.organisation_units SET unit_type =
      CASE LOWER(TRIM(unit_type))
        WHEN 'pole' THEN 'POLE'
        WHEN 'cellule' THEN 'CELLULE'
        WHEN 'departement' THEN 'DEPARTEMENT'
        ELSE UPPER(TRIM(COALESCE(unit_type, '')))
      END;

    ALTER TABLE documentation.organisation_units
      ADD CONSTRAINT chk_org_units_unit_type CHECK (unit_type IN ('POLE', 'CELLULE', 'DEPARTEMENT'));

    COMMENT ON TABLE documentation.organisation_units IS
      'Pôle → Cellule → Département. Contrainte : DEPARTEMENT.parent = CELLULE ; CELLULE.parent = POLE.';
  END IF;
END $$;

-- Jeu de base (équivalent seed 007) si exécution sans 007 — idempotent
INSERT INTO documentation.organisation_units (id, tenant_id, parent_id, unit_type, code, name) VALUES
  ('f0000001-0001-4001-8001-000000000001', 'atlas-tech-demo', NULL, 'POLE', 'POLE-COMM', 'Pôle Commercial & Relation Client'),
  ('f0000001-0001-4001-8001-000000000002', 'atlas-tech-demo', 'f0000001-0001-4001-8001-000000000001', 'CELLULE', 'CELL-CASA', 'Cellule Grand Casablanca'),
  ('f0000001-0001-4001-8001-000000000003', 'atlas-tech-demo', 'f0000001-0001-4001-8001-000000000001', 'CELLULE', 'CELL-RABAT', 'Cellule Rabat & Rabat-Salé'),
  ('f0000001-0001-4001-8001-000000000004', 'atlas-tech-demo', 'f0000001-0001-4001-8001-000000000002', 'DEPARTEMENT', 'DEPT-VTE-CASA', 'Département Ventes Terrain — Casa'),
  ('f0000001-0001-4001-8001-000000000005', 'atlas-tech-demo', 'f0000001-0001-4001-8001-000000000003', 'DEPARTEMENT', 'DEPT-CONSEIL-RBT', 'Département Conseil & Projets — Rabat'),
  ('f0000001-0001-4001-8001-000000000006', 'atlas-tech-demo', NULL, 'POLE', 'POLE-SUPPORT', 'Pôle Support & Opérations'),
  ('f0000001-0001-4001-8001-000000000007', 'atlas-tech-demo', 'f0000001-0001-4001-8001-000000000006', 'DEPARTEMENT', 'DEPT-PROG', 'Département Programmes & Gouvernance')
ON CONFLICT (id) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  parent_id = EXCLUDED.parent_id,
  unit_type = EXCLUDED.unit_type,
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  updated_at = NOW();

-- 2) Corriger arbre : tout département doit avoir une cellule parente
INSERT INTO documentation.organisation_units (id, tenant_id, parent_id, unit_type, code, name) VALUES
  ('f0000001-0001-4001-8001-000000000008', 'atlas-tech-demo', 'f0000001-0001-4001-8001-000000000006', 'CELLULE', 'CELL-SUPPORT-CENTRE', 'Cellule Support & Excellence')
ON CONFLICT (id) DO NOTHING;

UPDATE documentation.organisation_units
SET parent_id = 'f0000001-0001-4001-8001-000000000008', updated_at = NOW()
WHERE id = 'f0000001-0001-4001-8001-000000000007' AND code = 'DEPT-PROG';

-- 3) Colonnes annuaire : hiérarchie métier (006–007) + triple rattachement organisationnel
ALTER TABLE documentation.directory_users
  ADD COLUMN IF NOT EXISTS manager_id UUID,
  ADD COLUMN IF NOT EXISTS coach_id UUID,
  ADD COLUMN IF NOT EXISTS rp_id UUID,
  ADD COLUMN IF NOT EXISTS pole_id UUID,
  ADD COLUMN IF NOT EXISTS cellule_id UUID,
  ADD COLUMN IF NOT EXISTS departement_id UUID;

ALTER TABLE documentation.directory_users
  DROP CONSTRAINT IF EXISTS fk_directory_users_manager;
ALTER TABLE documentation.directory_users
  DROP CONSTRAINT IF EXISTS fk_directory_users_coach;
ALTER TABLE documentation.directory_users
  DROP CONSTRAINT IF EXISTS fk_directory_users_rp;

ALTER TABLE documentation.directory_users
  ADD CONSTRAINT fk_directory_users_manager
    FOREIGN KEY (manager_id) REFERENCES documentation.directory_users (id) ON DELETE SET NULL;
ALTER TABLE documentation.directory_users
  ADD CONSTRAINT fk_directory_users_coach
    FOREIGN KEY (coach_id) REFERENCES documentation.directory_users (id) ON DELETE SET NULL;
ALTER TABLE documentation.directory_users
  ADD CONSTRAINT fk_directory_users_rp
    FOREIGN KEY (rp_id) REFERENCES documentation.directory_users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_directory_users_manager_id
  ON documentation.directory_users (tenant_id, manager_id)
  WHERE manager_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_directory_users_coach_id
  ON documentation.directory_users (tenant_id, coach_id)
  WHERE coach_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_directory_users_rp_id
  ON documentation.directory_users (tenant_id, rp_id)
  WHERE rp_id IS NOT NULL;

-- Remplir depuis l’ancienne colonne unitaire (département) si présente
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'documentation' AND table_name = 'directory_users' AND column_name = 'organizational_unit_id'
  ) THEN
    UPDATE documentation.directory_users u
    SET
      departement_id = ou.id,
      cellule_id = c.id,
      pole_id = p.id
    FROM documentation.organisation_units ou
    JOIN documentation.organisation_units c ON c.id = ou.parent_id AND UPPER(TRIM(c.unit_type)) = 'CELLULE'
    JOIN documentation.organisation_units p ON p.id = c.parent_id AND UPPER(TRIM(p.unit_type)) = 'POLE'
    WHERE u.organizational_unit_id IS NOT NULL
      AND u.organizational_unit_id = ou.id
      AND UPPER(TRIM(ou.unit_type)) = 'DEPARTEMENT';
  END IF;
END $$;

-- Cas résiduels : rattacher au département par défaut Casa ventes
UPDATE documentation.directory_users
SET
  departement_id = 'f0000001-0001-4001-8001-000000000004',
  cellule_id = 'f0000001-0001-4001-8001-000000000002',
  pole_id = 'f0000001-0001-4001-8001-000000000001',
  updated_at = NOW()
WHERE departement_id IS NULL AND tenant_id = 'atlas-tech-demo';

ALTER TABLE documentation.directory_users
  DROP CONSTRAINT IF EXISTS fk_directory_users_org_unit;

ALTER TABLE documentation.directory_users
  DROP COLUMN IF EXISTS organizational_unit_id;

ALTER TABLE documentation.directory_users
  DROP CONSTRAINT IF EXISTS fk_directory_users_pole,
  DROP CONSTRAINT IF EXISTS fk_directory_users_cellule,
  DROP CONSTRAINT IF EXISTS fk_directory_users_departement;

ALTER TABLE documentation.directory_users
  ADD CONSTRAINT fk_directory_users_pole
    FOREIGN KEY (pole_id) REFERENCES documentation.organisation_units (id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_directory_users_cellule
    FOREIGN KEY (cellule_id) REFERENCES documentation.organisation_units (id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_directory_users_departement
    FOREIGN KEY (departement_id) REFERENCES documentation.organisation_units (id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_directory_users_pole ON documentation.directory_users (tenant_id, pole_id);
CREATE INDEX IF NOT EXISTS idx_directory_users_cellule ON documentation.directory_users (tenant_id, cellule_id);
CREATE INDEX IF NOT EXISTS idx_directory_users_dept ON documentation.directory_users (tenant_id, departement_id);

ALTER TABLE documentation.directory_users
  ALTER COLUMN pole_id SET NOT NULL,
  ALTER COLUMN cellule_id SET NOT NULL,
  ALTER COLUMN departement_id SET NOT NULL;

-- 4) Cohérence org : département ↔ cellule ↔ pôle pour chaque utilisateur
CREATE OR REPLACE FUNCTION documentation.trg_directory_users_org_coherence()
RETURNS TRIGGER AS $$
DECLARE
  d_parent UUID;
  c_parent UUID;
BEGIN
  SELECT parent_id INTO d_parent FROM documentation.organisation_units WHERE id = NEW.departement_id;
  IF d_parent IS NULL OR d_parent <> NEW.cellule_id THEN
    RAISE EXCEPTION 'departement_id doit être un département enfant de cellule_id';
  END IF;
  SELECT parent_id INTO c_parent FROM documentation.organisation_units WHERE id = NEW.cellule_id;
  IF c_parent IS NULL OR c_parent <> NEW.pole_id THEN
    RAISE EXCEPTION 'cellule_id doit être une cellule enfant de pole_id';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_directory_users_org_coherence ON documentation.directory_users;
CREATE TRIGGER trg_directory_users_org_coherence
  BEFORE INSERT OR UPDATE OF pole_id, cellule_id, departement_id ON documentation.directory_users
  FOR EACH ROW EXECUTE PROCEDURE documentation.trg_directory_users_org_coherence();

-- 5) Règles hiérarchie métier (rôles applicatifs en minuscules)
CREATE OR REPLACE FUNCTION documentation.trg_directory_users_business_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'manager' THEN
    IF NEW.rp_id IS NULL THEN
      RAISE EXCEPTION 'manager : rp_id obligatoire';
    END IF;
  END IF;
  IF NEW.role = 'coach' THEN
    IF NEW.manager_id IS NULL OR NEW.rp_id IS NULL THEN
      RAISE EXCEPTION 'coach : manager_id et rp_id obligatoires';
    END IF;
  END IF;
  IF NEW.role = 'pilote' THEN
    IF NEW.coach_id IS NULL OR NEW.manager_id IS NULL OR NEW.rp_id IS NULL THEN
      RAISE EXCEPTION 'pilote : coach_id, manager_id et rp_id obligatoires';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_directory_users_business_hierarchy ON documentation.directory_users;
CREATE TRIGGER trg_directory_users_business_hierarchy
  BEFORE INSERT OR UPDATE OF role, rp_id, manager_id, coach_id ON documentation.directory_users
  FOR EACH ROW EXECUTE PROCEDURE documentation.trg_directory_users_business_hierarchy();

-- 6) Données enrichies : second RP, managers, coachs, pilotes (UUID fixes cohérents)
-- RP 2
INSERT INTO documentation.directory_users (
  id, tenant_id, prenom, nom, email, role,
  pole_id, cellule_id, departement_id,
  rp_id, manager_id, coach_id
) VALUES (
  '66666666-6666-4666-8666-666666666602',
  'atlas-tech-demo',
  'Samir',
  'Ouazzani',
  'samir.ouazzani@atlas-tech-demo.dev',
  'rp',
  'f0000001-0001-4001-8001-000000000001',
  'f0000001-0001-4001-8001-000000000002',
  'f0000001-0001-4001-8001-000000000004',
  NULL, NULL, NULL
) ON CONFLICT (id) DO UPDATE SET
  prenom = EXCLUDED.prenom, nom = EXCLUDED.nom, email = EXCLUDED.email,
  pole_id = EXCLUDED.pole_id, cellule_id = EXCLUDED.cellule_id, departement_id = EXCLUDED.departement_id,
  updated_at = NOW();

-- Houda (RP1) : même triplet org que démo
UPDATE documentation.directory_users
SET
  pole_id = 'f0000001-0001-4001-8001-000000000006',
  cellule_id = 'f0000001-0001-4001-8001-000000000008',
  departement_id = 'f0000001-0001-4001-8001-000000000007',
  rp_id = NULL,
  manager_id = NULL,
  coach_id = NULL,
  updated_at = NOW()
WHERE id = '66666666-6666-4666-8666-666666666601';

-- Managers : rp_id obligatoire — Karim → Houda, Sophie → Samir (exemple multi-RP)
UPDATE documentation.directory_users
SET rp_id = '66666666-6666-4666-8666-666666666601', updated_at = NOW()
WHERE id = '22222222-2222-4222-8222-222222222201' AND role = 'manager';

UPDATE documentation.directory_users
SET rp_id = '66666666-6666-4666-8666-666666666602', updated_at = NOW()
WHERE id = '88888888-8888-4888-8888-888888888801' AND role = 'manager';

-- Coachs : manager_id + rp_id
UPDATE documentation.directory_users SET
  manager_id = '22222222-2222-4222-8222-222222222201',
  rp_id = '66666666-6666-4666-8666-666666666601',
  pole_id = 'f0000001-0001-4001-8001-000000000001',
  cellule_id = 'f0000001-0001-4001-8001-000000000002',
  departement_id = 'f0000001-0001-4001-8001-000000000004',
  updated_at = NOW()
WHERE id IN ('55555555-5555-4555-8555-555555555501', '55555555-5555-4555-8555-555555555502');

UPDATE documentation.directory_users SET
  manager_id = '88888888-8888-4888-8888-888888888801',
  rp_id = '66666666-6666-4666-8666-666666666602',
  pole_id = 'f0000001-0001-4001-8001-000000000001',
  cellule_id = 'f0000001-0001-4001-8001-000000000003',
  departement_id = 'f0000001-0001-4001-8001-000000000005',
  updated_at = NOW()
WHERE id = '55555555-5555-4555-8555-555555555503';

-- Pilotes : coach + manager + rp + org en UNE mise à jour par lot (le trigger métier
-- se déclenche sur coach_id / manager_id / rp_id : ne pas mettre coach_id seul puis le reste).
UPDATE documentation.directory_users p SET
  coach_id = c.id,
  manager_id = c.manager_id,
  rp_id = c.rp_id,
  pole_id = c.pole_id,
  cellule_id = c.cellule_id,
  departement_id = c.departement_id,
  updated_at = NOW()
FROM documentation.directory_users c
WHERE p.role = 'pilote'
  AND c.role = 'coach'
  AND (
    (p.coach_id IS NOT DISTINCT FROM c.id)
    OR (p.id IN (
          '11111111-1111-4111-8111-111111111101',
          '11111111-1111-4111-8111-111111111102',
          '11111111-1111-4111-8111-111111111107'
        ) AND c.id = '55555555-5555-4555-8555-555555555501')
    OR (p.id IN (
          '11111111-1111-4111-8111-111111111103',
          '11111111-1111-4111-8111-111111111104',
          '11111111-1111-4111-8111-111111111105'
        ) AND c.id = '55555555-5555-4555-8555-555555555502')
    OR (p.id = '11111111-1111-4111-8111-111111111106' AND c.id = '55555555-5555-4555-8555-555555555503')
  );

-- RH / Admin / Audit : pas de chaîne métier obligatoire (triggers seulement sur manager/coach/pilote)
UPDATE documentation.directory_users SET
  pole_id = 'f0000001-0001-4001-8001-000000000001',
  cellule_id = 'f0000001-0001-4001-8001-000000000003',
  departement_id = 'f0000001-0001-4001-8001-000000000005',
  rp_id = NULL, manager_id = NULL, coach_id = NULL,
  updated_at = NOW()
WHERE id IN ('33333333-3333-4333-8333-333333333301', '44444444-4444-4444-8444-444444444401');

UPDATE documentation.directory_users SET
  pole_id = 'f0000001-0001-4001-8001-000000000006',
  cellule_id = 'f0000001-0001-4001-8001-000000000008',
  departement_id = 'f0000001-0001-4001-8001-000000000007',
  rp_id = NULL, manager_id = NULL, coach_id = NULL,
  updated_at = NOW()
WHERE id = '77777777-7777-4777-8777-777777777701';

SET search_path TO public;
