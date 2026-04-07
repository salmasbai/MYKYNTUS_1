-- =============================================================================
-- Hiérarchie métier — annuaire : pilote → coach → manager (manager_id, coach_id)
-- À exécuter après 005_directory_users.sql (et 003 multi-tenant si présent).
-- Enchaîner ensuite avec 007_organization_and_rp_hierarchy.sql (RP + pôles / départements).
-- =============================================================================

SET search_path TO documentation, public;

ALTER TABLE documentation.directory_users
  ADD COLUMN IF NOT EXISTS manager_id UUID,
  ADD COLUMN IF NOT EXISTS coach_id UUID;

ALTER TABLE documentation.directory_users
  DROP CONSTRAINT IF EXISTS fk_directory_users_manager;

ALTER TABLE documentation.directory_users
  DROP CONSTRAINT IF EXISTS fk_directory_users_coach;

ALTER TABLE documentation.directory_users
  ADD CONSTRAINT fk_directory_users_manager
    FOREIGN KEY (manager_id) REFERENCES documentation.directory_users (id) ON DELETE SET NULL;

ALTER TABLE documentation.directory_users
  ADD CONSTRAINT fk_directory_users_coach
    FOREIGN KEY (coach_id) REFERENCES documentation.directory_users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_directory_users_manager_id
  ON documentation.directory_users (tenant_id, manager_id)
  WHERE manager_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_directory_users_coach_id
  ON documentation.directory_users (tenant_id, coach_id)
  WHERE coach_id IS NOT NULL;

COMMENT ON COLUMN documentation.directory_users.manager_id IS 'Rôle coach : manager d''agence.';
COMMENT ON COLUMN documentation.directory_users.coach_id IS 'Rôle pilote : coach terrain référent.';

-- 1) Manager Rabat
INSERT INTO documentation.directory_users (id, tenant_id, prenom, nom, email, role, manager_id, coach_id) VALUES
  ('88888888-8888-4888-8888-888888888801', 'atlas-tech-demo', 'Sophie', 'Amrani', 'sophie.amrani@atlas-tech-demo.dev', 'manager', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  prenom = EXCLUDED.prenom,
  nom = EXCLUDED.nom,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 2) Coach Casa (Karim) — déjà existant : lien manager
UPDATE documentation.directory_users
SET manager_id = '22222222-2222-4222-8222-222222222201', updated_at = NOW()
WHERE id = '55555555-5555-4555-8555-555555555501' AND role = 'coach';

-- 3) Coach Casa supplémentaire (même manager Karim)
INSERT INTO documentation.directory_users (id, tenant_id, prenom, nom, email, role, manager_id, coach_id) VALUES
  ('55555555-5555-4555-8555-555555555502', 'atlas-tech-demo', 'Yassine', 'Bennani', 'yassine.bennani@atlas-tech-demo.dev', 'coach', '22222222-2222-4222-8222-222222222201', NULL)
ON CONFLICT (id) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  prenom = EXCLUDED.prenom,
  nom = EXCLUDED.nom,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  manager_id = EXCLUDED.manager_id,
  updated_at = NOW();

-- 4) Coach Rabat (Sophie)
INSERT INTO documentation.directory_users (id, tenant_id, prenom, nom, email, role, manager_id, coach_id) VALUES
  ('55555555-5555-4555-8555-555555555503', 'atlas-tech-demo', 'Laila', 'Cherkaoui', 'laila.cherkaoui@atlas-tech-demo.dev', 'coach', '88888888-8888-4888-8888-888888888801', NULL)
ON CONFLICT (id) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  prenom = EXCLUDED.prenom,
  nom = EXCLUDED.nom,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  manager_id = EXCLUDED.manager_id,
  updated_at = NOW();

-- 5) Pilotes supplémentaires
INSERT INTO documentation.directory_users (id, tenant_id, prenom, nom, email, role, manager_id, coach_id) VALUES
  ('11111111-1111-4111-8111-111111111105', 'atlas-tech-demo', 'Imane', 'Fassi', 'imane.fassi@atlas-tech-demo.dev', 'pilote', NULL, '55555555-5555-4555-8555-555555555502'),
  ('11111111-1111-4111-8111-111111111106', 'atlas-tech-demo', 'Rachid', 'Mouline', 'rachid.mouline@atlas-tech-demo.dev', 'pilote', NULL, '55555555-5555-4555-8555-555555555503'),
  ('11111111-1111-4111-8111-111111111107', 'atlas-tech-demo', 'Kenza', 'Tazi', 'kenza.tazi@atlas-tech-demo.dev', 'pilote', NULL, '55555555-5555-4555-8555-555555555501')
ON CONFLICT (id) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  prenom = EXCLUDED.prenom,
  nom = EXCLUDED.nom,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  coach_id = EXCLUDED.coach_id,
  updated_at = NOW();

-- 6) Pilotes existants (Atlas) — rattachement coach Mehdi
UPDATE documentation.directory_users SET coach_id = '55555555-5555-4555-8555-555555555501', updated_at = NOW() WHERE id = '11111111-1111-4111-8111-111111111101';
UPDATE documentation.directory_users SET coach_id = '55555555-5555-4555-8555-555555555501', updated_at = NOW() WHERE id = '11111111-1111-4111-8111-111111111102';
UPDATE documentation.directory_users SET coach_id = '55555555-5555-4555-8555-555555555502', updated_at = NOW() WHERE id = '11111111-1111-4111-8111-111111111103';
UPDATE documentation.directory_users SET coach_id = '55555555-5555-4555-8555-555555555502', updated_at = NOW() WHERE id = '11111111-1111-4111-8111-111111111104';

UPDATE documentation.directory_users SET updated_at = NOW() WHERE id = '66666666-6666-4666-8666-666666666601';

SET search_path TO public;
