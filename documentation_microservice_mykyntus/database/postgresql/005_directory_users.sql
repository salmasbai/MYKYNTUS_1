-- Annuaire utilisateurs (identité métier) — aligné sur les UUID du seed démo / DemoActors.
SET search_path TO documentation, public;

CREATE TABLE IF NOT EXISTS documentation.directory_users (
  id          UUID PRIMARY KEY,
  tenant_id   VARCHAR(64) NOT NULL,
  prenom      VARCHAR(128) NOT NULL,
  nom         VARCHAR(128) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  role        documentation.app_role NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_directory_users_tenant ON documentation.directory_users (tenant_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_directory_users_tenant_email
  ON documentation.directory_users (tenant_id, email);

INSERT INTO documentation.directory_users (id, tenant_id, prenom, nom, email, role) VALUES
  ('11111111-1111-4111-8111-111111111101', 'atlas-tech-demo', 'Yasmine', 'El Amrani', 'yasmine.elamrani@atlas-tech-demo.dev', 'pilote'),
  ('11111111-1111-4111-8111-111111111102', 'atlas-tech-demo', 'Omar', 'Benali', 'omar.benali@atlas-tech-demo.dev', 'pilote'),
  ('11111111-1111-4111-8111-111111111103', 'atlas-tech-demo', 'Salma', 'Idrissi', 'salma.idrissi@atlas-tech-demo.dev', 'pilote'),
  ('11111111-1111-4111-8111-111111111104', 'atlas-tech-demo', 'Ahmed', 'Ouazzani', 'ahmed.ouazzani@atlas-tech-demo.dev', 'pilote'),
  ('55555555-5555-4555-8555-555555555501', 'atlas-tech-demo', 'Mehdi', 'Sefrioui', 'mehdi.sefrioui@atlas-tech-demo.dev', 'coach'),
  ('22222222-2222-4222-8222-222222222201', 'atlas-tech-demo', 'Karim', 'Tazi', 'karim.tazi@atlas-tech-demo.dev', 'manager'),
  ('66666666-6666-4666-8666-666666666601', 'atlas-tech-demo', 'Houda', 'Mansouri', 'houda.mansouri@atlas-tech-demo.dev', 'rp'),
  ('33333333-3333-4333-8333-333333333301', 'atlas-tech-demo', 'Fatima', 'Alaoui', 'fatima.alaoui@atlas-tech-demo.dev', 'rh'),
  ('77777777-7777-4777-8777-777777777701', 'atlas-tech-demo', 'Youssef', 'El Alamy', 'youssef.elalamy@atlas-tech-demo.dev', 'admin'),
  ('44444444-4444-4444-8444-444444444401', 'atlas-tech-demo', 'Nadia', 'Berrada', 'nadia.berrada@atlas-tech-demo.dev', 'audit')
ON CONFLICT (id) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  prenom = EXCLUDED.prenom,
  nom = EXCLUDED.nom,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  updated_at = NOW();
